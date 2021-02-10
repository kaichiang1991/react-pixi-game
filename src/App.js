import React, { Component } from 'react'
import { Stage } from '@inlet/react-pixi';
import Background from './pixiComponents/Background';
import GameBackground from './pixiComponents/GameBackground';
import CreditBot from './pixiComponents/CreditBot';
import gsap from 'gsap/all'
import GameMap from './pixiComponents/GameMap';
import Cube from './pixiComponents/Cube';
import { nanoid } from 'nanoid';

export default class App extends Component {

  state = {
    app: null,
    credit: 0,
    cubeArr: [],
  }

  tickerEvent = (...t) => {

  }

  stageMounted = async (event) => {
    await new Promise(res =>{
      this.setState({app: event, cubeArr: CubeController.init()}, ()=>{
        gsap.delayedCall(.5, ()=> {
          CubeController.createCube()
          this.setState({})
          res()
        })
      })
    })

    gsap.timeline().repeat(-1)
    .to({}, {duration: 1})
    .eventCallback('onRepeat', ()=>{
      CubeController.update()
      this.setState({})
    })
  }

  operateCube = (key) => {
    CubeController.operate(key)
  }

  componentDidMount(){
    window.addEventListener('keyup', (e) =>{
      this.operateCube(e.code)
      this.setState({})
    })
  }

  render(){
    const {credit, cubeArr} = this.state

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
      </>
    )
  }
}

class CubeController{

  static init(){
    const row = 10, column = 6
    this.posMap = Array(column).fill(1).map(_ => Array(row).fill(1).map(_ => ({done: false, exist: false})))

    this.nextCountdown = 1

    return this.posMap
  }

  static createCube(){
    const posArr = [[0, 0], [1, 0]]
    posArr.map(pos => {
      this.posMap[pos[0]][pos[1]].exist = true
    })

    return this.posMap
  }

  static update(){
    this.posMap.map(column =>{
      if(column.filter((data, rowIndex) => data.exist && rowIndex >= 9 ).length){   // 到底部了
        column.forEach(data => data.exist && (data.done = true))
        return
      }

      // 向下移動
      column.unshift({done: false, exist: false})
      column.pop()
    })

    return this.posMap
  }

  static nextUpdate(){

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