import { Graphics, PixiComponent } from "@inlet/react-pixi";
import * as PIXI from 'pixi.js'

export default PixiComponent('Cube', {
    create: _ =>{
        return new PIXI.Graphics()
    },

    applyProps: (instance, oldP, newP) =>{
        const {data, rowIndex, colIndex} = newP
        const {done, exist} = data

        instance.clear()
        if(!exist)   return

        instance.beginFill(done? 0x00FF00: 0x0000FF, .5)
        .drawRoundedRect(0, 0, 50, 50, 5)
        .endFill()

        instance.position.set(250 + colIndex * 50, 50 + rowIndex * 50)
    }
})