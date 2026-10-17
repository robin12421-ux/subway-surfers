import * as THREE from 'three';

const mat = (color, metalness = 0.2, roughness = 0.35, extra = {}) => new THREE.MeshStandardMaterial({ color, metalness, roughness, ...extra });

export function createTrain(scene) {
  const train = new THREE.Group();
  train.name = 'Track 05 original subway train';
  const shell = mat('#d9dfe8', 0.72, 0.27);
  const dark = mat('#101724', 0.6, 0.22);
  const red = mat('#ff304f', 0.45, 0.26, { emissive: '#7e071c', emissiveIntensity: 0.45 });
  const glass = new THREE.MeshStandardMaterial({ color: '#132c43', metalness: 0.6, roughness: 0.13, emissive: '#102b40', emissiveIntensity: 0.45 });
  const trim = mat('#758497', 0.8, 0.22);
  const wheelMat = mat('#202632', 0.7, 0.38);
  const glow = new THREE.MeshBasicMaterial({ color: '#ff304f' });

  function box(parent, size, position, material, name = '') {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true; mesh.name = name; parent.add(mesh); return mesh;
  }
  // Long carriage; front points toward -Z, down the track.
  box(train, [5.1, 3.55, 15.6], [0, 2.45, 0], shell, 'carriage');
  box(train, [5.18, 0.22, 15.65], [0, 0.69, 0], dark, 'underframe');
  box(train, [5.12, 0.14, 15.7], [0, 4.22, 0], red, 'roof accent');
  box(train, [5.12, 0.16, 15.75], [0, 0.83, 0], trim, 'lower trim');
  // Side windows and five individual doors on each visible side.
  const doors = [];
  for (const side of [-1, 1]) {
    const x = side * 2.57;
    for (let i = 0; i < 5; i++) {
      const z = 5.95 - i * 2.98;
      box(train, [0.06, 1.06, 1.55], [x, 3.27, z], glass, `window-${side}-${i}`);
      box(train, [0.075, 1.95, 1.16], [x + side * 0.025, 2.12, z - 0.16], trim, `door-frame-${side}-${i}`);
      const doorGroup = new THREE.Group();
      doorGroup.position.set(x + side * 0.075, 2.12, z - 0.16);
      // A single panel slides along the carriage length; paired doors are grouped for easy animation.
      const panel = box(doorGroup, [0.075, 1.82, 0.54], [0, 0, 0], i === 0 ? red : dark, `door-panel-${side}-${i}`);
      box(doorGroup, [0.035, 0.12, 0.075], [side * 0.045, 0, 0.19], mat('#f3f6fa', 0.35, 0.25), 'door handle');
      box(doorGroup, [0.04, 1.6, 0.025], [side * 0.05, 0, -0.23], glow, 'door neon edge');
      train.add(doorGroup);
      if (side === 1) doors.push({ group: doorGroup, panel, originalZ: doorGroup.position.z, stopIndex: i });
    }
    // Long side stripe and skirting.
    box(train, [0.045, 0.16, 15.4], [side * 2.59, 1.28, 0], red, 'side stripe');
    for (let i = 0; i < 6; i++) box(train, [0.045, 0.08, 0.55], [side * 2.6, 1.02, -6.4 + i * 2.55], trim, 'side vent');
  }
  // Cab at the front.
  box(train, [4.25, 1.28, 0.16], [0, 2.65, -7.86], dark, 'driver windshield');
  box(train, [1.45, 0.15, 0.18], [-1.35, 1.55, -7.9], mat('#fff0d2', 0.15, 0.25, { emissive: '#ffb45a', emissiveIntensity: 1.5 }), 'left headlight');
  box(train, [1.45, 0.15, 0.18], [1.35, 1.55, -7.9], mat('#fff0d2', 0.15, 0.25, { emissive: '#ffb45a', emissiveIntensity: 1.5 }), 'right headlight');
  box(train, [1.5, 0.18, 0.18], [0, 1.15, -7.9], red, 'front bumper');
  // Wheels on both sides.
  const wheelGeo = new THREE.CylinderGeometry(0.43, 0.43, 0.28, 20);
  for (const side of [-1, 1]) for (const z of [-5.5, -2.8, 2.8, 5.5]) {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat); wheel.rotation.z = Math.PI / 2; wheel.position.set(side * 2.42, 0.85, z); wheel.castShadow = true; train.add(wheel);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.3, 16), trim); hub.rotation.z = Math.PI / 2; hub.position.copy(wheel.position); train.add(hub);
  }
  // Roof vents add a readable silhouette from elevated camera angles.
  for (let i = 0; i < 5; i++) box(train, [1.15, 0.16, 1.25], [0, 4.34, -5.8 + i * 2.8], dark, 'roof vent');
  scene.add(train);
  return { train, doors };
}

export function createEnvironment(scene) {
  const tunnelMat = mat('#141a27', 0.25, 0.85);
  const wallMat = mat('#202737', 0.3, 0.65);
  const railMat = mat('#7e8b9e', 0.8, 0.24);
  const sleeperMat = mat('#343b4a', 0.25, 0.8);
  const floorMat = mat('#090d15', 0.1, 0.95);
  const addBox = (size, position, material) => { const m = new THREE.Mesh(new THREE.BoxGeometry(...size), material); m.position.set(...position); m.receiveShadow = true; scene.add(m); return m; };
  addBox([18, 0.4, 160], [0, -0.38, -50], floorMat);
  addBox([0.45, 8, 160], [-6.1, 3.5, -50], wallMat);
  addBox([0.45, 8, 160], [6.1, 3.5, -50], wallMat);
  addBox([12.5, 0.5, 160], [0, 7.5, -50], tunnelMat);
  // Rails and evenly spaced sleepers.
  for (const x of [-1.28, 1.28]) addBox([0.16, 0.18, 160], [x, -0.06, -50], railMat);
  for (let i = 0; i < 100; i++) addBox([3.65, 0.12, 0.28], [0, -0.16, 24 - i * 1.55], sleeperMat);
  // Repeating wall ribs, ceiling lamps, and red guide lights.
  for (let i = 0; i < 22; i++) {
    const z = 20 - i * 6.8;
    for (const x of [-5.82, 5.82]) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.16, 7.1, 0.28), mat('#313a4b', 0.3, 0.65)); rib.position.set(x, 3.5, z); scene.add(rib);
      const marker = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.11, 1.1), new THREE.MeshBasicMaterial({ color: '#ff304f' })); marker.position.set(x * 0.985, 5.5, z - 1); scene.add(marker);
    }
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 0.34), new THREE.MeshBasicMaterial({ color: '#d7e8ff' })); lamp.position.set(0, 7.18, z); scene.add(lamp);
    const light = new THREE.PointLight('#b5d6ff', 5, 13, 2); light.position.set(0, 6.7, z); scene.add(light);
  }
  // Sparse distant side panels give the tunnel depth without expensive assets.
  for (let i = 0; i < 14; i++) for (const side of [-1, 1]) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.2, 2.4), mat(i % 3 === 0 ? '#3a2435' : '#252e40', 0.45, 0.5));
    panel.position.set(side * 5.84, 2.8, 15 - i * 10.5); scene.add(panel);
  }
}
