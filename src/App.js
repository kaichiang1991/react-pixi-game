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
    const row = 10, column = 6
    this.posMap = Array(column).fill(1).map(_ => Array(row).fill(1).map(_ => ({done: false, exist: false})))

    this.nextCountdown = 2

    return this.posMap
  }

  static createCube(){
    console.log('%ccreate', 'color:red;font-size:32px;')
    const posArr = [[0, 0], [1, 0]]
    posArr.map(pos => {
      this.posMap[pos[0]][pos[1]].exist = true
    })

    return this.posMap
  }

  static update(){
    let flag = this.posMap.filter(column => {
      const _data = column.slice().reverse().find(data => !data.done)
      const lastIndex = column.indexOf(_data)
      return column[lastIndex].exist
    }).length > 0

    if(flag){   // 到底部
      this.posMap = this.posMap.map(column => column.map(data => data.exist? {done: true, exist: false}: data))
      console.log('%c到底', 'color:red; font-size: 20px')
      return
    }

    console.log('update')
    this.posMap.map((column, colIndex) =>{
      // 向下移動
      const _data = column.slice().reverse().find(data => !data.exist && !data.done)
      const lastIndex = column.indexOf(_data)
      console.log('向下', colIndex, ' last', lastIndex)
      column.splice(lastIndex, 1)
      column.unshift({done: false, exist: false})
    })

    console.log(this.posMap)
  }

  static nextUpdate(){

    if(this.posMap.flat().find(data => data.exist))
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
    if(this.posMap[this.posMap.length - 1].find(data => !data.done && data.exist)){
      return
    }

    const activeArr = []
    this.posMap.forEach((col, colIndex) =>{
      col.forEach((data, rowIndex) =>{
        if(data.done || !data.exist)
          return
        let nextCol = colIndex + 1
        activeArr.push([nextCol, rowIndex].join())
      })
    })

    this.posMap.forEach((col, colIndex) =>{
      col.forEach((data, rowIndex) =>{
        if(activeArr.includes([colIndex, rowIndex].join())){
          this.posMap[colIndex][rowIndex].exist = true
        }else{
          this.posMap[colIndex][rowIndex].exist = data.done
        }
      })
    })
  }

  /** 向左移動目前的方塊 */
  static moveLeft = () => {
    if(this.posMap[0].find(data => !data.done && data.exist))
      return

    const activeArr = []
    this.posMap.forEach((col, colIndex) =>{
      col.forEach((data, rowIndex) =>{
        if(data.done || !data.exist)
          return
        let preCol = colIndex -1
        activeArr.push([preCol, rowIndex].join())
      })
    })

    this.posMap.forEach((col, colIndex) =>{
      col.forEach((data, rowIndex) =>{
        if(activeArr.includes([colIndex, rowIndex].join())){
          this.posMap[colIndex][rowIndex].exist = true
        }else{
          this.posMap[colIndex][rowIndex].exist = data.done
        }
      })
    })
  }
}