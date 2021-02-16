import { Sprite } from '@inlet/react-pixi'
import React, { Component } from 'react'

export default class Background extends Component {

    render() {
        return (
            <Sprite image="./img/space.jpg" alpha={.3} />
        )
    }
}
