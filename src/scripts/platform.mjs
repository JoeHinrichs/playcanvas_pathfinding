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
                const navMeshHelper = new NavMeshHelper(navMesh, pc.app.graphicsDevice);
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

            pc.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);

            if (pc.app.touch) pc.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);

            this.on('destroy', () => {
                pc.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);

                if (pc.app.touch) {
                    pc.app.touch.off(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
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
        // Calculate the screen position in camera viewport space 
        var rect = cameraEntity.camera.rect;
        var screenWidth = this.app.graphicsDevice.width / this.app.graphicsDevice.maxPixelRatio;
        var screenHeight = this.app.graphicsDevice.height / this.app.graphicsDevice.maxPixelRatio;
 
        // Work out the normalised screen positions we are clicking 
        var nx = ((screenPosition.x / screenWidth) - rect.x) / rect.z;

        // Y is inverted in screen coords so we want to use the reminder of the rect
        var ny = ((screenPosition.y / screenHeight) - (1 - rect.y - rect.w)) / rect.w;

        // Are we clicking in our viewport?
        if (nx >= 0 && nx < 1 && ny >= 0 && ny < 1) {
            // Convert back to screen coordinates for screen to world
            var mx = nx * screenWidth;
            var my = ny * screenHeight;

            // The pc.Vec3 to raycast from
            var from = cameraEntity.camera.screenToWorld(mx, my, cameraEntity.camera.nearClip);

            // The pc.Vec3 to raycast to 
            var to = cameraEntity.camera.screenToWorld(mx, my, cameraEntity.camera.farClip);

            // Raycast between the two points
            var result = this.app.systems.rigidbody.raycastFirst(from, to);

            if (result) {
                console.log("Hit", result.entity.name, "at", result.point);
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
                const agentPos = heroAgent.interpolatedPosition;
                hero.setLocalPosition(agentPos.x, agentPos.y + 0.8, agentPos.z); // 0.8 to make agent stand on the ground
            }
        }
    }
}