import * as pc from 'playcanvas';
import { loadScene } from './modules/utilities';
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

function startApplication() {
    camera = app.root.findByName("Camera") as pc.Entity;
    if(camera){
        camera.addComponent('script');
        //camera.script.create(createOrbitCamera());
        //camera.script.create(createOrbitCameraMouseInput());
        //camera.script.create(createOrbitCameraTouchInput());
    }
}

