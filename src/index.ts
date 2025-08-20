import * as pc from 'playcanvas';
import { init as recastInit } from '@recast-navigation/core';
import { loadScene } from './modules/utilities';
import { Platform } from './scripts/platform.mjs';
import { CameraControls } from './modules/camera-controls.mjs';
import './index.css';

let camera: pc.Entity | null;

// create an application
const canvas = document.getElementById('application') as HTMLCanvasElement;
const app = new pc.Application(canvas);
app.setCanvasResolution(pc.RESOLUTION_AUTO);
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);

loadScene(app, "config.json", "2300273.json", preloadProgress, startApplication);

function preloadProgress(value: number) {
    console.log(`Preload progress: ${value * 100}%`);
}

async function startApplication() {
    camera = app.root.findByName("Camera") as pc.Entity;
    if (camera?.script) {
        const cc = (camera.script.create(CameraControls) as any); //PlayCanvas types are not fully compatible with TypeScript
        if (cc) {
            cc.enableFly = false;
            cc.enablePan = false;
            cc.rotateSpeed = 0.5;
            cc.zoomSpeed = 0.005;
            //cc._startZoomDist = 30;
            //cc.focus(new pc.Vec3(0, 0, 0), true);
        }
    }

    await recastInit(); // ensure Recast is initialized before generating the navmesh   

    /* generate a solo navmesh */
    const platform = app.root.findByName("platform") as pc.Entity;
    platform.addComponent('script');
    if(platform?.script) platform.script.create(Platform);
}


