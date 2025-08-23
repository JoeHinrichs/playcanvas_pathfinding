import * as pc from 'playcanvas';

export class Spot extends pc.Script {
    static scriptName = 'spot';

    initialize() {
        this.spotMat = this.entity.render.meshInstances[0].material;
        this.hide();
    }

    hide(){
        this.timer = 0;
        this.visible = false;
        this.spotMat.opacity = 0;
        this.spotMat.update();
    }

    show(){
        this.timer = 0;
        this.visible = true;
        this.spotMat.opacity = 1;
        this.spotMat.update();
    }
    
    update(dt) {        
        let speed = 4; let min = 0.25; let max = 0.5;

        if(this.timer > 3) this.hide();

        if(this.timer > 2 && this.spotMat.opacity > 0) {
            let opacity = this.spotMat.opacity - 0.01;
            this.spotMat.opacity = opacity;
            this.spotMat.update();
        }

        if(this.visible){
            this.timer += dt;
            let scaleFactor = min + (Math.abs(Math.sin(this.timer * speed)) * max);
            this.entity.setLocalScale(scaleFactor, 0.01, scaleFactor);
        }        
    }
}