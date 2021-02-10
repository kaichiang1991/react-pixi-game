import { Graphics, PixiComponent } from "@inlet/react-pixi";
import * as PIXI from 'pixi.js'

export default PixiComponent('Cube', {
    create: _ =>{
        return new PIXI.Graphics()
    },

    applyProps: (instance, oldP, newP) =>{
        const {indicate, rowIndex, colIndex} = newP

        instance.clear()
        if(!indicate)   return

        instance.beginFill(0x0000FF, .5)
        .drawRoundedRect(0, 0, 50, 50, 5)
        .endFill()

        instance.position.set(250 + colIndex * 50, 50 + rowIndex * 50)
    }
})