// Kaneee League - par Kaneeekii Développeur
//
// La voiture : un corps physique Rapier (une boîte) piloté par des forces,
// et une boîte Three.js qui copie sa position à l'affichage.
//
// Conduite "arcade" : on ne simule pas de roues. À chaque pas de physique on :
//   1. pousse la voiture vers l'avant/arrière selon l'accélérateur,
//   2. annule la glisse latérale (sinon la voiture patine comme sur la glace),
//   3. impose une vitesse de rotation selon la direction et la vitesse.

import * as THREE from 'three';
import { CAR } from '../config.js';

export function createCar(RAPIER, physicsWorld, scene) {
  // --- Physique ---
  const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(CAR.START_POSITION.x, CAR.START_POSITION.y, CAR.START_POSITION.z)
    .setLinearDamping(CAR.LINEAR_DAMPING)
    .setAngularDamping(CAR.ANGULAR_DAMPING)
    // Étape 1 : on bloque les rotations autour de X et Z (tangage et roulis).
    // La voiture ne peut que tourner sur elle-même (axe Y) : impossible de se retourner.
    // On débloquera ces axes quand le saut et les sauts périlleux arriveront.
    .enabledRotations(false, true, false)
    // Une voiture contrôlée par le joueur ne doit jamais "s'endormir"
    // (optimisation de Rapier qui fige les corps immobiles).
    .setCanSleep(false);
  const body = physicsWorld.createRigidBody(bodyDesc);

  // Rapier veut des demi-dimensions pour les boîtes.
  const colliderDesc = RAPIER.ColliderDesc.cuboid(CAR.WIDTH / 2, CAR.HEIGHT / 2, CAR.LENGTH / 2)
    .setMass(CAR.MASS)
    .setFriction(0.5);
  physicsWorld.createCollider(colliderDesc, body);

  // --- Visuel ---
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(CAR.WIDTH, CAR.HEIGHT, CAR.LENGTH),
    new THREE.MeshStandardMaterial({ color: CAR.COLOR })
  );
  // Petit "nez" plus sombre à l'avant pour voir dans quel sens roule la voiture.
  // L'avant de la voiture pointe vers -Z (convention Three.js : -Z = devant).
  const nose = new THREE.Mesh(
    new THREE.BoxGeometry(CAR.WIDTH * 0.6, CAR.HEIGHT * 0.5, CAR.LENGTH * 0.25),
    new THREE.MeshStandardMaterial({ color: CAR.NOSE_COLOR })
  );
  nose.position.set(0, CAR.HEIGHT * 0.5, -CAR.LENGTH * 0.3);
  mesh.add(nose);
  scene.add(mesh);

  // --- Interpolation ---
  // La physique tourne à 60 Hz mais l'écran peut rafraîchir à 144 Hz (ou lagguer).
  // On garde la transformation AVANT et APRÈS le dernier pas de physique,
  // et à l'affichage on se place "entre les deux" : le mouvement reste fluide.
  const prevPosition = new THREE.Vector3();
  const currPosition = new THREE.Vector3();
  const prevQuaternion = new THREE.Quaternion();
  const currQuaternion = new THREE.Quaternion();

  // Vecteurs temporaires réutilisés à chaque pas (éviter d'en créer 60 fois par seconde).
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const velocity = new THREE.Vector3();
  const force = new THREE.Vector3();
  const tmpQuat = new THREE.Quaternion();

  // Vitesse dans le sens de la marche (m/s), positive en avant. Lue par le HUD.
  let forwardSpeed = 0;

  /** Copie la position/rotation de Rapier dans un Vector3 + Quaternion Three.js. */
  function readBody(position, quaternion) {
    const t = body.translation();
    const r = body.rotation();
    position.set(t.x, t.y, t.z);
    quaternion.set(r.x, r.y, r.z, r.w);
  }

  readBody(currPosition, currQuaternion);
  prevPosition.copy(currPosition);
  prevQuaternion.copy(currQuaternion);
  mesh.position.copy(currPosition);
  mesh.quaternion.copy(currQuaternion);

  /**
   * Appelée AVANT chaque physicsWorld.step(). Applique les forces de conduite.
   * @param {number} throttle -1 (reculer) à +1 (accélérer)
   * @param {number} steer    -1 (gauche) à +1 (droite)
   */
  function applyControls(throttle, steer) {
    // La transformation actuelle devient "l'ancienne" pour l'interpolation.
    prevPosition.copy(currPosition);
    prevQuaternion.copy(currQuaternion);

    // Axes de la voiture dans le monde. Un quaternion représente une rotation ;
    // appliquer celui de la voiture à (0,0,-1) donne la direction de son avant.
    const r = body.rotation();
    tmpQuat.set(r.x, r.y, r.z, r.w);
    forward.set(0, 0, -1).applyQuaternion(tmpQuat);
    right.set(1, 0, 0).applyQuaternion(tmpQuat);

    // Décomposition de la vitesse : combien vers l'avant, combien sur le côté ?
    const v = body.linvel();
    velocity.set(v.x, v.y, v.z);
    forwardSpeed = velocity.dot(forward);
    const sideSpeed = velocity.dot(right);

    // On repart de zéro : les forces ajoutées avec addForce persistent sinon.
    body.resetForces(true);
    force.set(0, 0, 0);

    // 1. Accélérer / freiner
    if (throttle !== 0) {
      // Si on pousse à l'opposé de la vitesse actuelle, c'est un freinage : plus fort.
      const isBraking = throttle * forwardSpeed < 0;
      let accel = isBraking ? CAR.BRAKE_DECELERATION : CAR.ACCELERATION;

      // Limite de vitesse : on arrête de pousser une fois la vitesse max atteinte.
      const limit = throttle > 0 ? CAR.MAX_SPEED : CAR.MAX_REVERSE_SPEED;
      if (!isBraking && Math.abs(forwardSpeed) >= limit) accel = 0;

      // Force = masse × accélération (2e loi de Newton)
      force.addScaledVector(forward, throttle * accel * body.mass());
    }

    // 2. Adhérence : une force opposée à la glisse latérale, proportionnelle à celle-ci.
    force.addScaledVector(right, -sideSpeed * CAR.GRIP * body.mass());

    body.addForce(force, true);

    // 3. Direction : on tourne d'autant plus vite qu'on roule vite (jusqu'à un plafond),
    // et pas du tout à l'arrêt, comme une vraie voiture.
    const speedFactor = Math.min(Math.abs(forwardSpeed) / CAR.STEER_FULL_SPEED, 1);
    // En marche arrière, le volant agit à l'envers.
    const direction = forwardSpeed < 0 ? -1 : 1;
    // Axe Y vers le haut : une rotation négative tourne vers la droite.
    const yawSpeed = -steer * CAR.TURN_RATE * speedFactor * direction;
    body.setAngvel({ x: 0, y: yawSpeed, z: 0 }, true);
  }

  /** Appelée APRÈS physicsWorld.step() : récupère le résultat de la physique. */
  function afterPhysicsStep() {
    readBody(currPosition, currQuaternion);
  }

  /**
   * Appelée à chaque image rendue. alpha (0..1) indique où l'on se trouve
   * entre le dernier pas de physique et le prochain.
   */
  function syncMesh(alpha) {
    mesh.position.lerpVectors(prevPosition, currPosition, alpha);
    mesh.quaternion.slerpQuaternions(prevQuaternion, currQuaternion, alpha);
  }

  return {
    body,
    mesh,
    applyControls,
    afterPhysicsStep,
    syncMesh,
    getForwardSpeed: () => forwardSpeed,
  };
}
