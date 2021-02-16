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
    .to({}, {duration: .5})
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
  }
  
  static doneCheck(){
    if(this.checkHit()){
      this.checkWin()
    }
  }

  static checkHit(){
    const hitCube = this.posMap.find((col, colIndex) => col.find((data, rowIndex) => data.state == Cube_State.IN_USE && this.posMap[colIndex][rowIndex+1]?.state === Cube_State.DONE)) !== undefined
    if(!hitCube)
      return false

    // 把 in-use 的方塊變成 Done
    this.posMap.map((col, colIndex) => col.map((data, rowIndex) =>{
      if(data.state === Cube_State.IN_USE){
        this.posMap[colIndex][rowIndex].state = Cube_State.DONE
      }
    }))

    return true
  }

  static checkWin(){
    const winRowIndexArr = this.posMap[0].map((data, rowIndex) => {
      if(rowIndex <= 10 && data.state === Cube_State.DONE)  return rowIndex
    }).map(rowIndex =>{
      if(rowIndex === undefined)    // map 出來沒有達成條件的
        return

      if(this.posMap.reduce((pre, curr) => pre && curr[rowIndex].state === Cube_State.DONE)){   // 判斷該列是不是每一個都是 done
        return rowIndex
      }
    }).filter(i => i)

    if(!winRowIndexArr.length)
      return

    console.log('哪幾排有滿', winRowIndexArr)

    // 消除
    winRowIndexArr.map(rowIndex =>{
      this.posMap.map(col => col[rowIndex].state = Cube_State.EMPTY)
    })
    
    console.log('col 1', this.posMap[0].map(data => data.state))
    // 下落
    const dropRowCountArr = Array(12).fill(0)
    winRowIndexArr.map(rowIndex =>{
      dropRowCountArr.map((_, index) => {
        if(index <= rowIndex)
          dropRowCountArr[index]++
      })
    }) 

    console.log('每列要落下的格子數量', dropRowCountArr)

    const activeArr = []
    this.posMap.map((col, colIndex) =>{
      col.map((data, rowIndex) =>{
        if(data.state === Cube_State.DONE){
          // console.log('要加入 active 的 col', colIndex, ' row', rowIndex, ' 狀態', data.state, ' 該列要下掉的數量', dropRowCountArr[rowIndex])
          activeArr.push([colIndex, rowIndex+ dropRowCountArr[rowIndex]].join())
        }
      })
    })

    console.log('下一次更新的格子', activeArr)
    
    this.posMap.map((col, colIndex) =>{
      col.map((data, rowIndex) =>{
        if(rowIndex === 11)
          return
        
        if(activeArr.includes([colIndex, rowIndex].join())){
          this.posMap[colIndex][rowIndex].state = Cube_State.DONE
        }else{
          this.posMap[colIndex][rowIndex].state = Cube_State.EMPTY
        }
      })
    })
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
    // 最右側
    if(this.posMap[this.posMap.length - 1].find(data => data.state == Cube_State.IN_USE))
      return
    
    // 往右會碰到完成的
    if(this.posMap.find((col, colIndex) => col.find((data, rowIndex) => data.state === Cube_State.IN_USE && this.posMap[colIndex + 1][rowIndex].state === Cube_State.DONE)) !== undefined)
      return

    const activeArr = []
    this.posMap.map((col, colIndex) => col.map((data, rowIndex) =>{
      if(data.state === Cube_State.IN_USE){
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
    // 最左側
    if(this.posMap[0].find(data => data.state == Cube_State.IN_USE))
      return
    
    // 往右會碰到完成的
    if(this.posMap.find((col, colIndex) => col.find((data, rowIndex) => data.state === Cube_State.IN_USE && this.posMap[colIndex - 1][rowIndex].state == Cube_State.DONE)) !== undefined)
      return

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
    return CubeUnit.type[~~(4*Math.random())]
  }

  static type = {
    0: [[0,0], [1, 0]],
    1: [[0,0], [0, 1]],
    2: [[0,0], [0,1], [1,1]],
    3: [[0,0], [0,1], [0,2], [ 1,2]]
  }
}