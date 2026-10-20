// Kaneee League - par Kaneeekii Développeur
//
// Caméra "poursuite" : elle se place derrière la voiture et la suit en douceur.

import * as THREE from 'three';
import { CAMERA } from '../config.js';

export function createFollowCamera(target) {
  const camera = new THREE.PerspectiveCamera(
    CAMERA.FOV,
    window.innerWidth / window.innerHeight,
    CAMERA.NEAR,
    CAMERA.FAR
  );

  // Vecteurs réutilisés chaque image
  const desiredPosition = new THREE.Vector3();
  const lookAtPoint = new THREE.Vector3();

  /**
   * Calcule où la caméra DEVRAIT être : le décalage de la config,
   * tourné dans le repère de la voiture, ajouté à sa position.
   */
  function computeDesiredPosition() {
    desiredPosition
      .set(CAMERA.OFFSET.x, CAMERA.OFFSET.y, CAMERA.OFFSET.z)
      .applyQuaternion(target.quaternion)
      .add(target.position);
  }

  // Au départ, la caméra se téléporte directement à sa place.
  computeDesiredPosition();
  camera.position.copy(desiredPosition);

  /**
   * @param {number} dt temps écoulé depuis la dernière image (secondes)
   */
  function update(dt) {
    computeDesiredPosition();

    // Lissage indépendant du framerate. Un simple lerp(0.1) irait plus vite
    // à 144 fps qu'à 60 fps ; avec 1 - e^(-k·dt), le résultat est le même partout.
    const t = 1 - Math.exp(-CAMERA.SMOOTHING * dt);
    camera.position.lerp(desiredPosition, t);

    lookAtPoint.copy(target.position);
    lookAtPoint.y += CAMERA.LOOK_AT_HEIGHT;
    camera.lookAt(lookAtPoint);
  }

  /** À appeler quand la fenêtre change de taille. */
  function resize(width, height) {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  return { camera, update, resize };
}
