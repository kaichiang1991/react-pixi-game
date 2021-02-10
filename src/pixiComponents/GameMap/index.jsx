import { Graphics, PixiComponent } from '@inlet/react-pixi'
import { Container } from 'pixi.js'
import React, { Component, PureComponent } from 'react'

export default class GameMap extends PureComponent {

    
    render() {
        const x = 0, y = 0, width = 300, height = 500, yOffset = 50, xOffset = 50

        return (
            <Graphics draw={ g =>{
                g
                .lineStyle(2, 0x00FF00)
                
                // 畫橫線
                for(let i = 0; i < 9; i++){
                    g
                    .moveTo(x, y+ yOffset* (i+1))
                    .lineTo(x+width, y+ yOffset* (i+1))
                }

                // 畫直線
                for(let i = 0; i < 5; i++){
                    g
                    .moveTo(x+xOffset*(i+1), y)
                    .lineTo(x+xOffset*(i+1), y+height)
                }
                g.endFill()
            }}
            position={[250, 50]}
        />
        )
    }
}