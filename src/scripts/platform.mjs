import * as pc from 'playcanvas';
import { Crowd, NavMeshQuery } from '@recast-navigation/core';
import { pcToSoloNavMesh, NavMeshHelper } from '@recast-navigation/playcanvas';

let crowd, query = null;

export class Platform extends pc.Script {
    static scriptName = 'platform';

    initialize() {

        const wall = this.app.root.findByName("wall");
        const hero = this.app.root.findByName("hero");

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
                const heroAgent = crowd.addAgent(hero.getLocalPosition(), {
                    radius: 0.5,
                    height: 0.5,
                    maxAcceleration: 4.0,
                    maxSpeed: 1.0,
                    collisionQueryRange: 0.5,
                    pathOptimizationRange: 0.0,
                    separationWeight: 1.0,
                });

                query = new NavMeshQuery(navMesh);
            }
        }
    }

    update(dt) {
        if (crowd) {
            //console.log("Crowd update");
            // Update crowd logic here if needed
            // For example, you could move agents or handle pathfinding updates
        }
        //this.entity.rotateLocal(0, 1, 0);
    }
}