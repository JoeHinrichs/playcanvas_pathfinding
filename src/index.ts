import * as pc from 'playcanvas';
import { init as recastInit } from '@recast-navigation/core';
import { loadScene } from './modules/utilities';
import { CameraControls } from './modules/camera-controls.mjs';
import { Platform } from './scripts/platform.mjs';
import './index.css';

let camera: pc.Entity | null;

// create an application
const canvas = document.getElementById('application') as HTMLCanvasElement;
const app = new pc.Application(canvas, {
    mouse: new pc.Mouse(canvas),
    touch: new pc.TouchDevice(canvas),
    keyboard: new pc.Keyboard(window),
    elementInput: new pc.ElementInput(canvas)
});
app.setCanvasResolution(pc.RESOLUTION_AUTO);
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);

//install ammo physics
loadAmmo().then(() => {
    console.log("Ammo physics loaded successfully");
    loadScene(app, "config.json", "2300273.json", preloadProgress, startApplication);
}).catch((error) => {
    console.error("Failed to load Ammo physics:", error);
});

async function loadAmmo() {
    pc.WasmModule.setConfig('Ammo', {
        glueUrl: './files/assets/246434436/1/ammo.wasm.js',
        wasmUrl: './files/assets/246434437/1/ammo.wasm.wasm',
        fallbackUrl: './files/assets/246434435/1/ammo.j'
    });

    await new Promise((resolve: Function) => {
        pc.WasmModule.getInstance('Ammo', () => resolve());
    });
}

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
        }
    }

    await recastInit(); // ensure Recast is initialized before generating the navmesh   

    /* add platform */
    const platform = app.root.findByName("platform") as pc.Entity;
    platform.addComponent('script');
    if (platform?.script) platform.script.create(Platform);




}


