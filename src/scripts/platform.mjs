import * as pc from 'playcanvas';
import { Spot } from './spot.mjs';
import { Crowd } from '@recast-navigation/core';
import { pcToSoloNavMesh, NavMeshHelper } from '@recast-navigation/playcanvas';

export class Platform extends pc.Script {
    static scriptName = 'platform';
    static ray = new pc.Ray();
    static hitPosition = new pc.Vec3();
    static newPosition = new pc.Vec3();

    initialize() {

        const wall = this.app.root.findByName("wall");

        this.cameraEntity = this.app.root.findByName("Camera");

        this.spot = this.app.root.findByName("spot");
        this.spot.addComponent('script');
        this.spot.script.create(Spot);

        if (this.entity.render?.meshInstances && wall?.render?.meshInstances) {
            let meshInstances = this.entity.render.meshInstances.concat(wall.render.meshInstances);
            console.log(pcToSoloNavMesh.navMeshGeneratorConfig);
            const { success, navMesh } = pcToSoloNavMesh(meshInstances, {               
                cs: 0.1, //The xz-plane cell size to use for fields. Default 0.2
            });

            if (success && navMesh) {
                this.navMeshHelper = new NavMeshHelper(navMesh, this.app.graphicsDevice);
                this.navMeshHelper.enabled = false;
                this.entity.addChild(this.navMeshHelper);

                const maxAgents = 10;
                const maxAgentRadius = 0.6;
                this.crowd = new Crowd(navMesh, { maxAgents, maxAgentRadius });
                const heroAgent = this.crowd.addAgent({ x: 8, y: 1, z: 0 }, {
                    radius: 1,
                    height: 2,
                    maxAcceleration: 4.0,
                    maxSpeed: 2.0,
                    collisionQueryRange: 0.5,
                    pathOptimizationRange: 0.0,
                    separationWeight: 1.0,
                });
            }

            this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);

            if (this.app.touch) this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);

            this.on('destroy', () => {
                this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);

                if (this.app.touch) {
                    this.app.touch.off(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
                }
            });
        }
    }

    onMouseDown = (event) => {
        if (event.button === pc.MOUSEBUTTON_LEFT) {
            this.doRayCast(event);
        }
    };

    onTouchStart = (event) => {
        if (event.touches.length === 1) {
            this.doRayCast(event.touches[0]);
            event.event.preventDefault();
        }
    };

    doRayCast(screenPosition) {
        var rect = this.cameraEntity.camera.rect;
        var screenWidth = this.app.graphicsDevice.width / this.app.graphicsDevice.maxPixelRatio;
        var screenHeight = this.app.graphicsDevice.height / this.app.graphicsDevice.maxPixelRatio;

        // Convert screen position to normalized coordinates
        var nx = ((screenPosition.x / screenWidth) - rect.x) / rect.z;
        var ny = ((screenPosition.y / screenHeight) - (1 - rect.y - rect.w)) / rect.w; // Y coordinate is inverted in PlayCanvas

        // Check if the click is within the camera viewport
        if (nx >= 0 && nx < 1 && ny >= 0 && ny < 1) {
            var mx = nx * screenWidth;
            var my = ny * screenHeight;

            var from = this.cameraEntity.camera.screenToWorld(mx, my, this.cameraEntity.camera.nearClip);
            var to = this.cameraEntity.camera.screenToWorld(mx, my, this.cameraEntity.camera.farClip);
            var result = this.app.systems.rigidbody.raycastFirst(from, to);

            if (result) {
                const spotRot = new pc.Quat();
                spotRot.setFromDirections(pc.Vec3.UP, result.normal);
                this.crowd.agents[0].requestMoveTarget(result.point);
                this.spot.setPosition(result.point);
                this.spot.setLocalRotation(spotRot);
                this.spot.script.spot.show();
            }
        }
    }

    update(dt) {
        if (this.crowd) {
            this.crowd.update(1 / 60, dt, 10);
            const hero = this.app.root.findByName("hero");
            const heroAgent = this.crowd.agents[0];
            if (hero && heroAgent) {
                const hp = hero.getLocalPosition();
                const av = heroAgent.velocity();
                const ap = heroAgent.interpolatedPosition;
                const floorY = ap.y + 0.8; // 0.8 to make agent stand on the ground
                const currPoint = new pc.Vec3(hp.x, floorY, hp.z);
                const nextPoint = new pc.Vec3(ap.x, floorY, ap.z);
                const currVelocity = new pc.Vec3(av.x, av.y, av.z);
                const currSpeed = currVelocity.length(); //magnitude of velocity vec3

                if (currSpeed < 0.35) return; //stop rotation when agent is not moving

                const currRot = hero.getLocalRotation();
                const nextRot = new pc.Quat();
                const slerpRot = new pc.Quat();
                const direction = nextPoint.clone().sub(currPoint).normalize();
                nextRot.setFromDirections(pc.Vec3.FORWARD, direction);
                slerpRot.slerp(currRot, nextRot, 0.1); //smooth rotation
                hero.setLocalPosition(nextPoint.x, nextPoint.y, nextPoint.z);
                hero.setLocalRotation(slerpRot);
            }
        }
    }
}