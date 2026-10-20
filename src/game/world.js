// Kaneee League - par Kaneeekii Développeur
//
// Initialise les deux "mondes" du jeu :
//  - le monde physique Rapier (qui calcule les positions, c'est la source de vérité)
//  - la scène Three.js (qui ne fait qu'afficher ce que Rapier a calculé)

import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { PHYSICS } from '../config.js';

/**
 * Crée le monde physique et la scène 3D.
 * Fonction async car Rapier est écrit en Rust compilé en WebAssembly :
 * il faut attendre que ce module soit chargé avant de l'utiliser.
 */
export async function createWorld(container) {
  // --- Physique (Rapier) ---
  await RAPIER.init();
  const physicsWorld = new RAPIER.World({ x: 0, y: PHYSICS.GRAVITY, z: 0 });
  // Chaque appel à physicsWorld.step() fera avancer le temps de FIXED_STEP.
  physicsWorld.timestep = PHYSICS.FIXED_STEP;

  // --- Rendu (Three.js) ---
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87b7e6);
  // Brouillard léger : donne de la profondeur et cache le bord du sol.
  scene.fog = new THREE.Fog(0x87b7e6, 80, 220);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Limite le pixel ratio à 2 : sur les écrans 4K, rendre en pleine résolution
  // coûte très cher pour un gain visuel minime.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Lumière du ciel + lumière du sol (hémisphère), puis un "soleil" directionnel.
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x446644, 0.9);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 1.4);
  sunLight.position.set(30, 50, 20);
  scene.add(sunLight);

  return { RAPIER, physicsWorld, scene, renderer };
}
