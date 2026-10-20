// Kaneee League - par Kaneeekii Développeur
//
// Point d'entrée : assemble les morceaux et fait tourner la boucle de jeu.

import { PHYSICS } from './config.js';
import { createWorld } from './game/world.js';
import { createGround } from './game/arena.js';
import { createCar } from './game/car.js';
import { createFollowCamera } from './game/camera.js';
import { createInput } from './game/input.js';
import { createHud } from './ui/hud.js';

async function start() {
  const container = document.getElementById('game');
  const hud = createHud();

  const { RAPIER, physicsWorld, scene, renderer } = await createWorld(container);
  createGround(RAPIER, physicsWorld, scene);
  const car = createCar(RAPIER, physicsWorld, scene);
  const followCamera = createFollowCamera(car.mesh);
  const input = createInput();

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    followCamera.resize(window.innerWidth, window.innerHeight);
  });

  hud.hideLoading();

  // --- Boucle de jeu avec accumulateur de delta time ---
  //
  // Le "delta time" (dt) est le temps écoulé entre deux images. Il varie :
  // 16 ms à 60 fps, 7 ms à 144 fps, 100 ms si l'ordinateur rame.
  // Faire avancer la physique d'un dt variable la rend instable et non reproductible.
  //
  // Solution : on accumule le temps écoulé dans un "seau". Dès qu'il contient
  // au moins FIXED_STEP (1/60 s), on fait un pas de physique et on vide le seau
  // d'autant. Le reste (toujours < FIXED_STEP) sert à interpoler l'affichage.
  let lastTime = performance.now();
  let accumulator = 0;

  function loop(now) {
    let frameTime = (now - lastTime) / 1000;
    lastTime = now;
    // Après un long gel (onglet en arrière-plan), on ne rattrape pas tout.
    if (frameTime > PHYSICS.MAX_FRAME_TIME) frameTime = PHYSICS.MAX_FRAME_TIME;
    accumulator += frameTime;

    while (accumulator >= PHYSICS.FIXED_STEP) {
      car.applyControls(input.getThrottle(), input.getSteer());
      physicsWorld.step();
      car.afterPhysicsStep();
      accumulator -= PHYSICS.FIXED_STEP;
    }

    // alpha : fraction du prochain pas déjà écoulée (0 = pile sur un pas, 0.5 = à mi-chemin)
    const alpha = accumulator / PHYSICS.FIXED_STEP;
    car.syncMesh(alpha);
    followCamera.update(frameTime);
    hud.update(car.getForwardSpeed());

    renderer.render(scene, followCamera.camera);
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

start().catch((error) => {
  console.error('Impossible de démarrer le jeu :', error);
  const loading = document.getElementById('loading');
  if (loading) loading.textContent = 'Erreur au démarrage, regarde la console (F12).';
});
