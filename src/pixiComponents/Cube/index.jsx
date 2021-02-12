import { Graphics, PixiComponent } from "@inlet/react-pixi";
import * as PIXI from 'pixi.js'
import { Cube_State } from "../../contant";

export default PixiComponent('Cube', {
    create: _ =>{
        return new PIXI.Graphics()
    },

    applyProps: (instance, oldP, newP) =>{
        const {data, rowIndex, colIndex} = newP
        const {state} = data

        instance.clear()
        if(state == Cube_State.EMPTY || rowIndex == 0 || rowIndex == 11)   return

        instance.beginFill(state == Cube_State.DONE? 0x00FF00: 0x0000FF, .5)
        .drawRoundedRect(0, 0, 50, 50, 5)
        .endFill()

        instance.position.set(250 + colIndex * 50, 50 + (rowIndex -1)* 50)
    }
})