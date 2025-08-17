import * as pc from 'playcanvas';
import './index.css';

// create an application
const canvas = document.getElementById('application') as HTMLCanvasElement;
const app = new pc.Application(canvas);
app.setCanvasResolution(pc.RESOLUTION_AUTO);
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);

loadScene("config.json", "2300273.json", preloadProgress, startApplication);

function preloadProgress(value: number) {
    console.log(`Preload progress: ${value * 100}%`);
}

function startApplication() {
    console.log('Application has started successfully');
}

function loadScene(config: string, scene: string, progress_callback: Function, start_callback: Function) {
    const CONFIG_FILENAME = config;
    const SCENE_PATH = scene;

    app.configure(CONFIG_FILENAME, (err) => {
        if (err) {
            console.error(err);
            return;
        }

        app.preload(() => {
            app.scenes.loadScene(SCENE_PATH, (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
                app.start();
            })
        })
    });

    app.on('preload:end', function () {
        app.off('preload:progress');
    });
    app.on('preload:progress', function (value) {
        if (progress_callback) {
            progress_callback(value);
        }
    });
    app.on('start', function () {
        init();
        if (start_callback) {
            start_callback();
        }
    });
}

function init(){
    console.log('Application started');
}

/*app.start();

// create a camera
const camera = new pc.Entity();
camera.addComponent('camera', {
    clearColor: new pc.Color(0.3, 0.3, 0.7)
});
camera.setPosition(0, 0, 3);
app.root.addChild(camera);

// create a light
const light = new pc.Entity();
light.addComponent('light');
light.setEulerAngles(45, 45, 0);
app.root.addChild(light);

// create a box
const box = new pc.Entity();
box.addComponent('model', {
    type: 'box'
});
app.root.addChild(box);

// rotate the box
app.on('update', (dt: number) => box.rotate(10 * dt, 20 * dt, 30 * dt)); */