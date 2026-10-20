// Kaneee League - par Kaneeekii Développeur
//
// Le terrain. Étape 1 : un simple sol plat.
// Étape 2 : murs, plafond et buts viendront s'ajouter ici.

import * as THREE from 'three';
import { ARENA } from '../config.js';

/**
 * Crée le sol : un corps physique "fixed" (immobile, infiniment lourd)
 * et un plan visible dans Three.js avec une grille pour percevoir la vitesse.
 */
export function createGround(RAPIER, physicsWorld, scene) {
  const half = ARENA.GROUND_SIZE / 2;
  const halfThickness = ARENA.GROUND_THICKNESS / 2;

  // --- Physique ---
  // Rapier décrit les boîtes par leurs DEMI-dimensions (hx, hy, hz).
  // On descend le corps d'une demi-épaisseur pour que sa face du dessus soit à y = 0.
  const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0, -halfThickness, 0);
  const body = physicsWorld.createRigidBody(bodyDesc);

  const colliderDesc = RAPIER.ColliderDesc.cuboid(half, halfThickness, half)
    .setFriction(ARENA.GROUND_FRICTION);
  physicsWorld.createCollider(colliderDesc, body);

  // --- Visuel ---
  const geometry = new THREE.PlaneGeometry(ARENA.GROUND_SIZE, ARENA.GROUND_SIZE);
  const material = new THREE.MeshStandardMaterial({ color: ARENA.GROUND_COLOR });
  const mesh = new THREE.Mesh(geometry, material);
  // Un PlaneGeometry est vertical par défaut (face à la caméra) : on le couche.
  mesh.rotation.x = -Math.PI / 2;
  scene.add(mesh);

  const grid = new THREE.GridHelper(
    ARENA.GROUND_SIZE,
    ARENA.GRID_DIVISIONS,
    ARENA.GRID_COLOR,
    ARENA.GRID_COLOR
  );
  // Légèrement au-dessus du sol pour éviter le scintillement (z-fighting)
  grid.position.y = 0.01;
  scene.add(grid);

  return { body, mesh };
}
