import { Container, Graphics } from '@inlet/react-pixi'
import React, { Component, PureComponent } from 'react'

export default class GameBackground extends PureComponent {
    render() {
        return (
            <Container>
                <Graphics draw={ g =>{
                        g
                        .beginFill(0xFF0000, .3)
                        .lineStyle(5, 0xFF9494)
                        .drawRect(0, 0, 300, 500)
                        .endFill()
                    }}
                    position={[250, 50]}
                />
                {this.props.children}
            </Container>
        )
    }
}
