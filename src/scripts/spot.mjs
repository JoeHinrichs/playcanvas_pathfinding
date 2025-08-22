import * as pc from 'playcanvas';

export class Spot extends pc.Script {
    static scriptName = 'spot';

    initialize() {
        //this.entity.enabled = false;  
        //opacity 
        this.timer = 0;     
    }

    reset(){
        this.timer = 0;
    }
    
    update(dt) {
        this.timer += dt;
        console.log(this.timer);
        let scaleFactor = 0.25 + (Math.abs(Math.sin(this.timer)));
        this.entity.setLocalScale(scaleFactor, 0.01, scaleFactor);
    }
}