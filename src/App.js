import React, { Component } from 'react'
import { Stage } from '@inlet/react-pixi';
import { nanoid } from 'nanoid';
import Background from './pixiComponents/Background';
import GameBackground from './pixiComponents/GameBackground';
import CreditBot from './pixiComponents/CreditBot';
import gsap from 'gsap/all'
import GameMap from './pixiComponents/GameMap';
import Cube from './pixiComponents/Cube';
import './App.css'
import { Cube_State } from './contant';
import { act } from 'react-dom/test-utils';

export default class App extends Component {

  state = {
    gameStart: false,
    app: null,
    credit: 0,
    cubeArr: [],
  }

  startGame = () => {

    this.setState({gameStart: true, cubeArr: CubeController.createCube()})

    this.updateTicker = gsap.timeline().repeat(-1)
    .to({}, {duration: .8})
    .eventCallback('onRepeat', ()=>{
      CubeController.update()
      if(CubeController.nextUpdate())
        CubeController.createCube()
      
      this.setState({cubeArr: CubeController.posMap})
    })
  }

  puaseGame = () => {
    this.setState({gameStart: false})
    this.updateTicker.repeat(0)
    this.updateTicker.totalProgress(1, true)
  }

  stageMounted = (event) => {
    this.setState({app: event, cubeArr: CubeController.init()})
  }

  componentDidMount(){
    window.addEventListener('keyup', (e) =>{
      this.setState({cubeArr: CubeController.operate(e.code)})
    })
  }

  render(){
    const {gameStart, credit, cubeArr} = this.state

    return (
      <>
        <Stage width={800} height={600} onMount={this.stageMounted} options={{backgroundColor: 0x000000, resolution: 1}}>
          <Background/>
          <GameBackground/>
          <CreditBot credit={credit}/>
          <GameMap/>
          {cubeArr?.map((col, colIndex) =>
            col.map((data, rowIndex) =>
            {
              return <Cube key={nanoid()} data={data} rowIndex={rowIndex} colIndex={colIndex}/>
            }
            )
          )}
        </Stage>
        <div className={`cover ${gameStart? 'disactive': 'active'}`}>
            <button onClick={this.startGame} disabled={gameStart}>開始遊戲</button>
            <button onClick={this.puaseGame} disabled={!gameStart}>暫停遊戲</button>
        </div>
      </>
    )
  }
}

class CubeController{

  static init(){
    const row = 10+2, column = 6
    this.posMap = Array(column).fill(1).map(_ => Array(row).fill(1).map((_, index) => index !== row-1? {state: Cube_State.EMPTY}: {state: Cube_State.DONE}))
    return this.posMap
  }

  static createCube(){
    console.log('%ccreate', 'color:red;font-size:32px;')
    this.nextCountdown = 2
    const originPos = [2, 0]
    const cube = new CubeUnit().init()
    cube.map(pos => [originPos[0]+pos[0], originPos[1]+pos[1]]).map(pos => {
      this.posMap[pos[0]][pos[1]].state = Cube_State.IN_USE
    })

    console.log(this.posMap)

    return this.posMap
  }

  static update(){

    const activeArr = [], doneArr = []
    let state
    this.posMap.map((col, colIndex) => col.map((data, rowIndex) =>{
      if(data.state == Cube_State.IN_USE){
        state = this.posMap[colIndex][rowIndex + 1]?.state
        if(state === Cube_State.EMPTY || state === Cube_State.IN_USE){
          activeArr.push([colIndex, rowIndex +1].join())
        }
      }
    }))

    console.log('avtive', activeArr)
    this.posMap.map((col, colIndex) => col.map((data, rowIndex) =>{
      if(data.state == Cube_State.DONE)
        return

      if(activeArr.includes([colIndex, rowIndex].join())){
        this.posMap[colIndex][rowIndex].state = Cube_State.IN_USE
      }else{
        this.posMap[colIndex][rowIndex].state = Cube_State.EMPTY
      }     
    }))
    this.doneCheck()
    return

    if(this.posMap.map(col=> col.slice().reverse().findIndex(data=> data.state === Cube_State.IN_USE)).map(index => index < 0? index: 10 - index)
      .find((next, index) => next === this.bottomArr[index] )){   // 到底部
        console.log('%cif-button', 'color:blue')
        this.posMap.map((col, colIndex) => col.map((data, rowIndex) =>{
          if(data.state == Cube_State.IN_USE){
            doneArr.push([colIndex, rowIndex].join())
          }
        }))
    }

    console.log('active', activeArr)

    if(doneArr.length){
      console.log(`%cbottom`, 'color:red', doneArr)
      this.posMap.map((col, colIndex) => col.map((data, rowIndex) => data.state == Cube_State.IN_USE && (this.posMap[colIndex][rowIndex].state = Cube_State.DONE)))
      
      let split
      const botObj = doneArr.reduce((pre, curr) => {
        split = curr.split(',')
        if(pre.hasOwnProperty(split[0])){
          return {...pre, [split[0]]: split[1]*1 > pre[split[0]] * 1? pre[split[0]]: pre[split[1]]}
        }else{
          return {...pre, [split[0]]: split[1]}
        }
      }, {})
      
      Object.keys(botObj).map(key => this.bottomArr[key] = botObj[key]*1 - 1)
      console.log('bot', this.bottomArr)
      return
    }
    
    this.posMap.map((col, colIndex) => col.map((data, rowIndex)=>{
      if(data.state === Cube_State.DONE)
        return

      if(activeArr.includes([colIndex, rowIndex].join())){
        this.posMap[colIndex][rowIndex].state = Cube_State.IN_USE
      }else{
        this.posMap[colIndex][rowIndex].state = Cube_State.EMPTY
      }
    }))

    console.log('update', this.posMap)
  }
  
  static doneCheck(){
    console.log('done check', this.posMap)
    const hitCube = this.posMap.find((col, colIndex) => col.find((data, rowIndex) => data.state == Cube_State.IN_USE && this.posMap[colIndex][rowIndex+1]?.state === Cube_State.DONE)) !== undefined
    if(!hitCube)
      return

      console.log('%chit', 'color:green')
    // 把 in-use 的方塊變成 Done
    this.posMap.map((col, colIndex) => col.map((data, rowIndex) =>{
      if(data.state === Cube_State.IN_USE){
        console.log('done in use', colIndex, rowIndex)
        this.posMap[colIndex][rowIndex].state = Cube_State.DONE
      }
    }))
  }

  static nextUpdate(){

    if(this.posMap.flat().find(data => data.state == Cube_State.IN_USE))
      return false

    if(--this.nextCountdown <= 0){
      this.nextCountdown = 2
      return true
    }

    return false
  }

  static operate(key){
      switch(key){
      //   case "Space":
      //     console.log('%cspace key', 'color:red')
      //     this.operateCube(e.code)
      //     break
        case "ArrowLeft":
          console.log('%cleft key', 'color:red')
          this.moveLeft()
          break
        case "ArrowRight":
          console.log('%cright key', 'color:red')
          this.moveRight()
          break
      }

      return this.posMap
  }

  /** 向右移動目前的方塊 */
  static moveRight = () => {
    if(this.posMap[this.posMap.length - 1].find(data => data.state == Cube_State.IN_USE)){
      return
    }

    const activeArr = []
    this.posMap.map((col, colIndex) => col.map((data, rowIndex) =>{
      if(data.state == Cube_State.IN_USE){
        activeArr.push([colIndex + 1, rowIndex].join())
      }
    }))

    this.posMap.map((col, colIndex) => col.map((data, rowIndex) =>{
      if(data.state === Cube_State.DONE)
        return

      if(activeArr.includes([colIndex, rowIndex].join())){
        this.posMap[colIndex][rowIndex].state = Cube_State.IN_USE
      }else{
        this.posMap[colIndex][rowIndex].state = Cube_State.EMPTY
      }
    }))
  }

  /** 向左移動目前的方塊 */
  static moveLeft = () => {

    if(this.posMap[0].find(data => data.state == Cube_State.IN_USE)){
      return
    }

    const activeArr = []
    this.posMap.map((col, colIndex) => col.map((data, rowIndex) =>{
      if(data.state == Cube_State.IN_USE){
        activeArr.push([colIndex - 1, rowIndex].join())
      }
    }))

    this.posMap.map((col, colIndex) => col.map((data, rowIndex) =>{
      if(data.state === Cube_State.DONE)
        return

      if(activeArr.includes([colIndex, rowIndex].join())){
        this.posMap[colIndex][rowIndex].state = Cube_State.IN_USE
      }else{
        this.posMap[colIndex][rowIndex].state = Cube_State.EMPTY
      }
    }))
  }
}

class CubeUnit{
  init(){
    return Math.random() > .5? [[0,0], [0,1]]: [[0,0], [1,0]]
    // return [[0,0], [0, 1]]
    return [[0,0], [1,0]]
  }
}