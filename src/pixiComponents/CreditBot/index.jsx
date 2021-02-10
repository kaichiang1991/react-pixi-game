import { Container, Graphics, Text } from '@inlet/react-pixi'
import React, { Component } from 'react'
import * as PIXI from 'pixi.js'

export default class CreditBot extends Component {
    render() {
        const {credit} = this.props

        const creditText = (position)=> <Text style={new PIXI.TextStyle({
            fontSize: 24,
            fill: 0xFF0000
        })} text={credit} position={position} anchor={.5}/>

        return (
            <Container>
                <Graphics draw={g=>{
                    g.beginFill(0x000000)
                    .lineStyle(5, 0x6C6C6C)
                    .drawRoundedRect(-300, 0, 600, 40, 5)
                    .endFill()
                }}
                position={[400, 550]}
                children={creditText([0, 20])}
                />
            </Container>
        )
    }
}
