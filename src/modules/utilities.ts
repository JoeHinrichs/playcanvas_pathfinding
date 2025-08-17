import { Application } from 'playcanvas';

function loadScene(app:Application, config: string, scene: string, progress_callback: Function, start_callback: Function) {
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
        if (start_callback) {
            start_callback();
        }
    });
}

export { loadScene };