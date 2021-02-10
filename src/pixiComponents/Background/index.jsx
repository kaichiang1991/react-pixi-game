import { Sprite } from '@inlet/react-pixi'
import React, { Component } from 'react'

export default class Background extends Component {
    componentDidMount(){
        console.log('bg', this)
    }

    render() {
        return (
            <Sprite image="./img/space.jpg" alpha={.3} />
        )
    }
}
