import * as pc from 'playcanvas';
import { Crowd, NavMeshQuery } from '@recast-navigation/core';
import { pcToSoloNavMesh, NavMeshHelper } from '@recast-navigation/playcanvas';

let crowd, query = null;

export class Platform extends pc.Script {
    static scriptName = 'platform';

    initialize() {

        const wall = this.app.root.findByName("wall");

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
                    radius: 0.5,
                    height: 0.5,
                    maxAcceleration: 4.0,
                    maxSpeed: 1.0,
                    collisionQueryRange: 0.5,
                    pathOptimizationRange: 0.0,
                    separationWeight: 1.0,
                });

                query = new NavMeshQuery(navMesh);
                const targetPosition = { x: -8, y: 1, z: 0 };
                heroAgent.requestMoveTarget(targetPosition);
            }
        }
    }

    update(dt) {
        if (crowd) {
            crowd.update(1/60, dt, 10);
            const hero = this.app.root.findByName("hero");
            const heroAgent = crowd.agents[0];
            if (hero && heroAgent) {
                const agentPos = heroAgent.interpolatedPosition;
                hero.setLocalPosition(agentPos.x, agentPos.y + 1, agentPos.z);
            }
        }
        //this.entity.rotateLocal(0, 1, 0);
    }
}