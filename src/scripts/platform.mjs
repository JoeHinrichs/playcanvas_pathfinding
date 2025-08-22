import * as pc from 'playcanvas';
import { Crowd, NavMeshQuery } from '@recast-navigation/core';
import { pcToSoloNavMesh, NavMeshHelper } from '@recast-navigation/playcanvas';

let crowd, query, cameraEntity = null;

export class Platform extends pc.Script {
    static scriptName = 'platform';
    static ray = new pc.Ray();
    static hitPosition = new pc.Vec3();
    static newPosition = new pc.Vec3();

    initialize() {

        const wall = this.app.root.findByName("wall");
        cameraEntity = this.app.root.findByName("Camera");

        if (this.entity.render?.meshInstances && wall?.render?.meshInstances) {
            let meshInstances = this.entity.render.meshInstances.concat(wall.render.meshInstances);
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

            if (success && navMesh) {
                const navMeshHelper = new NavMeshHelper(navMesh, this.app.graphicsDevice);
                this.entity.addChild(navMeshHelper);

                const maxAgents = 10;
                const maxAgentRadius = 0.6;
                crowd = new Crowd(navMesh, { maxAgents, maxAgentRadius });
                const heroAgent = crowd.addAgent({ x: 8, y: 1, z: 0 }, {
                    radius: 1,
                    height: 2,
                    maxAcceleration: 4.0,
                    maxSpeed: 2.0,
                    collisionQueryRange: 0.5,
                    pathOptimizationRange: 0.0,
                    separationWeight: 1.0,
                });

                query = new NavMeshQuery(navMesh);
                //const targetPosition = { x: -8, y: 1, z: 0 };
                //heroAgent.requestMoveTarget(targetPosition);
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
        var rect = cameraEntity.camera.rect;
        var screenWidth = this.app.graphicsDevice.width / this.app.graphicsDevice.maxPixelRatio;
        var screenHeight = this.app.graphicsDevice.height / this.app.graphicsDevice.maxPixelRatio;
 
        // Convert screen position to normalized coordinates
        var nx = ((screenPosition.x / screenWidth) - rect.x) / rect.z;
        var ny = ((screenPosition.y / screenHeight) - (1 - rect.y - rect.w)) / rect.w; // Y coordinate is inverted in PlayCanvas

        // Check if the click is within the camera viewport
        if (nx >= 0 && nx < 1 && ny >= 0 && ny < 1) {
            var mx = nx * screenWidth;
            var my = ny * screenHeight;

            var from = cameraEntity.camera.screenToWorld(mx, my, cameraEntity.camera.nearClip);
            var to = cameraEntity.camera.screenToWorld(mx, my, cameraEntity.camera.farClip); 
            var result = this.app.systems.rigidbody.raycastFirst(from, to);

            if (result) {
                //this.markerEntity.setPosition(result.point);
               crowd.agents[0].requestMoveTarget(result.point);
            }
        }
    }

    update(dt) {
        if (crowd) {
            crowd.update(1 / 60, dt, 10);
            const hero = this.app.root.findByName("hero");
            const heroAgent = crowd.agents[0];
            if (hero && heroAgent) {
                const hp = hero.getLocalPosition();
                const av = heroAgent.velocity();
                const ap = heroAgent.interpolatedPosition;
                const floorY = ap.y + 0.8; // 0.8 to make agent stand on the ground
                const currPoint = new pc.Vec3(hp.x, floorY, hp.z); 
                const nextPoint = new pc.Vec3(ap.x, floorY, ap.z);
                const currVelocity = new pc.Vec3(av.x, av.y, av.z); 
                const currSpeed = currVelocity.length(); //magnitude of velocity vec3

                if(currSpeed < 0.35) return; //stop rotation when agent is not moving

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