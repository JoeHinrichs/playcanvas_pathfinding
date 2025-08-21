import * as pc from 'playcanvas';
import { Crowd, NavMeshQuery } from '@recast-navigation/core';
import { pcToSoloNavMesh, NavMeshHelper } from '@recast-navigation/playcanvas';

let crowd, query, cameraEntity = null;

// ---- rotation tuning ----
const ANGULAR_SPEED = Math.PI * 2.0; // rad/sec (360°/s). Lower for slower turning.
const MIN_SPEED_FOR_TURN = 0.05;     // m/s: ignore micro-movements to prevent jitter

// temp objects to avoid allocations in update
const _dir = new pc.Vec3();
const _qTarget = new pc.Quat();
const _qCurr = new pc.Quat();

export class Platform extends pc.Script {
  static scriptName = 'platform';
  static ray = new pc.Ray();
  static hitPosition = new pc.Vec3();
  static newPosition = new pc.Vec3();

  // Optional: rotate a child visual instead of the physics/root entity
  visual = null;

  initialize() {
    const wall = this.app.root.findByName('wall');
    cameraEntity = this.app.root.findByName('Camera');

    // choose a child called "Visual" if you have one (recommended)
    const hero = this.app.root.findByName('hero');
    this.visual = hero?.findByName?.('Visual') || null;

    if (this.entity.render?.meshInstances && wall?.render?.meshInstances) {
      const meshInstances = this.entity.render.meshInstances.concat(wall.render.meshInstances);
      const { success, navMesh } = pcToSoloNavMesh(meshInstances, {});

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
          separationWeight: 1.0
        });

        query = new NavMeshQuery(navMesh);
      }

      this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
      if (this.app.touch) this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);

      this.on('destroy', () => {
        this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        if (this.app.touch) this.app.touch.off(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
      });
    }
  }

  onMouseDown = (event) => {
    if (event.button === pc.MOUSEBUTTON_LEFT) this.doRayCast(event);
  };

  onTouchStart = (event) => {
    if (event.touches.length === 1) {
      this.doRayCast(event.touches[0]);
      event.event.preventDefault();
    }
  };

  doRayCast(screenPosition) {
    const rect = (cameraEntity).camera.rect;
    const gd = this.app.graphicsDevice;
    const screenWidth = gd.width / gd.maxPixelRatio;
    const screenHeight = gd.height / gd.maxPixelRatio;

    const nx = ((screenPosition.x / screenWidth) - rect.x) / rect.z;
    const ny = ((screenPosition.y / screenHeight) - (1 - rect.y - rect.w)) / rect.w;

    if (nx >= 0 && nx < 1 && ny >= 0 && ny < 1) {
      const mx = nx * screenWidth;
      const my = ny * screenHeight;

      const from = (cameraEntity).camera.screenToWorld(mx, my, (cameraEntity).camera.nearClip);
      const to = (cameraEntity).camera.screenToWorld(mx, my, (cameraEntity).camera.farClip);
      const result = this.app.systems.rigidbody.raycastFirst(from, to);

      if (result) {
        crowd.agents[0].requestMoveTarget(result.point);
      }
    }
  }

  update(dt) {
    if (!crowd) return;

    // NOTE: first param to crowd.update is fixed simulation step; keep it stable for Detour.
    crowd.update(1 / 60, dt, 10);

    const hero = this.app.root.findByName('hero');
    const heroAgent = crowd.agents[0];

    if (hero && heroAgent) {
      // 1) Position (already in your code)
      const p = heroAgent.interpolatedPosition; // smoothed
      hero.setLocalPosition(p.x, p.y + 0.8, p.z);

      // 2) Rotation (NEW)
      const v = heroAgent.velocity() || heroAgent.desiredVelocity(); // prefer actual velocity; fall back if needed
      console.log('heroAgent velocity:', v.x, v.y, v.z);
      if (v) {
        _dir.set(v.x, 0, v.z); // ignore vertical component
        const speed = _dir.length();

        if (speed >= MIN_SPEED_FOR_TURN) {
          _dir.mulScalar(1 / speed); // normalize

          // PlayCanvas forward is +Z; yaw around Y is atan2(x, z)
          let targetYaw = Math.atan2(_dir.x, _dir.z);

          // If your model faces +X in DCC, uncomment to add a 90° offset:
           targetYaw -= Math.PI * 0.5; console.log('targetYaw:', targetYaw);

          // Read current yaw from whichever entity you’re rotating
          const targetEntity = this.visual || hero;
          //targetEntity.getRotation().copyTo(_qCurr);
          _qCurr.copy(targetEntity.getRotation());
          const currEuler = _qCurr.getEulerAngles(); // degrees
          let currentYaw = currEuler.y * pc.math.DEG_TO_RAD; // radians

          // Shortest angular difference
          let delta = Math.atan2(Math.sin(targetYaw - currentYaw), Math.cos(targetYaw - currentYaw));

          // Clamp by angular speed
          const maxStep = ANGULAR_SPEED * dt;
          delta = pc.math.clamp(delta, -maxStep, maxStep);

          const newYaw = currentYaw + delta;

          _qTarget.setFromEulerAngles(0, newYaw * pc.math.RAD_TO_DEG, 0);
          targetEntity.setRotation(_qTarget);
        }
        // else: keep last facing when nearly stopped
      }
    }
  }
}
