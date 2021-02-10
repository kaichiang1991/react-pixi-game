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

  stageMounted = (event) => {
    CubeController.init()

    this.setState({app: event}, async ()=>{

      const config = {
        _credit: 0
      }

      await new Promise(res =>{
        gsap.delayedCall(.5, ()=> {
          console.log('create')
          CubeController.createCube()
          this.setState({cubeArr: CubeController.posMap})
          res()
        })
      })

      gsap.timeline().repeat(-1)
      .to({}, {duration: 1})
      .eventCallback('onRepeat', ()=>{
        CubeController.update()
        this.setState({cubeArr: CubeController.posMap})
      })

      // gsap.to(config, {_credit: '+=100', duration: 3})
      // .eventCallback('onUpdate', ()=> this.setState({credit: ~~config._credit}))
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
            col.map((flag, rowIndex) =>
            {
              return <Cube key={nanoid()} indicate={flag} rowIndex={rowIndex} colIndex={colIndex}/>
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
    this.posMap = Array(column).fill(1).map(_ => Array(row).fill(false))
  }

  static createCube(){
    const posArr = [[0, 0], [1, 0]]
    posArr.map(pos => {
      this.posMap[pos[0]][pos[1]] = true
    })
  }

  static update(){
    this.posMap.map(column =>{
      if(column.filter((flag, rowIndex) => flag && rowIndex >= 9 ).length){   // 到底部了

        return
      }

      // 向下移動
      column.unshift(false)
      column.pop()
    })
  }
}