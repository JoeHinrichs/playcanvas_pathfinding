import * as pc from 'playcanvas';
import { init } from '@recast-navigation/core';
import { pcToSoloNavMesh } from '@recast-navigation/playcanvas';
import { loadScene } from './modules/utilities';
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
    await init(); // ensure Recast is initialized before generating the navmesh
    
    /* generate a solo navmesh */
    const platform = app.root.findByName("platform") as pc.Entity;
    if (platform?.render?.meshInstances) {
        const meshInstances = platform.render.meshInstances;
        console.log("Mesh instances:", meshInstances);
        const { success, navMesh } = pcToSoloNavMesh(meshInstances, {
            //cellSize: 0.3,
            //cellHeight: 0.2,
            //agentHeight: 2.0,
            //agentRadius: 0.6,
            //agentMaxClimb: 0.9,
            //agentMaxSlope: 45.0,
            //regionMinSize: 8,
            //regionMergeSize: 20,
            //edgeMaxLen: 12.0,
            //edgeMaxError: 1.3,
            //vertsPerPoly: 6,
            //detailSampleDist: 6.0,
            //detailSampleMaxError: 1.0
        });
        console.log("Navmesh generation success:", success);
        console.log("Navmesh:", navMesh);
    }
    //const { success, navMesh } = pcToSoloNavMesh(meshInstances, {});
}


