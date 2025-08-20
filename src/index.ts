import * as pc from 'playcanvas';
import { init } from 'recast-navigation';
import { pcToSoloNavMesh, pcToTiledNavMesh, pcToTileCache } from 'recast-navigation-playcanvas';
import { loadScene } from './modules/utilities';
import { CameraControls } from './modules/camera-controls.mjs';

import './index.css';

let camera: pc.Entity | null;

// create an application
const canvas = document.getElementById('application') as HTMLCanvasElement;
const app = new pc.Application(canvas);
app.setCanvasResolution(pc.RESOLUTION_AUTO);
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);

initRecast();
loadScene(app, "config.json", "2300273.json", preloadProgress, startApplication);

async function initRecast() {
  await init()
  console.log("Recast initialized");
}

function preloadProgress(value: number) {
    console.log(`Preload progress: ${value * 100}%`);
}

function startApplication() {
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
}


