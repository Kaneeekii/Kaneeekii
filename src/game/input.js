// Kaneee League - par Kaneeekii Développeur
//
// Lecture du clavier. Ce fichier ne sait rien de la voiture :
// il transforme juste les touches en deux valeurs simples, "accélération" et "direction".

/**
 * Crée le gestionnaire de clavier.
 * Retourne un objet avec getThrottle() (-1 = reculer, +1 = accélérer)
 * et getSteer() (-1 = gauche, +1 = droite).
 */
export function createInput() {
  // Ensemble des touches actuellement enfoncées (on stocke leur "code").
  const pressed = new Set();

  // On utilise event.code et non event.key : le code désigne la touche PHYSIQUE.
  // Sur un clavier AZERTY, la touche Z a le code "KeyW" (sa position sur un QWERTY).
  // Résultat : ZQSD marche sur AZERTY et WASD sur QWERTY sans rien changer.
  const FORWARD = ['KeyW', 'ArrowUp'];
  const BACKWARD = ['KeyS', 'ArrowDown'];
  const LEFT = ['KeyA', 'ArrowLeft'];
  const RIGHT = ['KeyD', 'ArrowRight'];

  const handled = new Set([...FORWARD, ...BACKWARD, ...LEFT, ...RIGHT]);

  window.addEventListener('keydown', (event) => {
    if (!handled.has(event.code)) return;
    // Empêche les flèches de faire défiler la page.
    event.preventDefault();
    pressed.add(event.code);
  });

  window.addEventListener('keyup', (event) => {
    pressed.delete(event.code);
  });

  // Si la fenêtre perd le focus (alt-tab), on relâche tout :
  // sinon une touche peut rester "coincée" enfoncée.
  window.addEventListener('blur', () => pressed.clear());

  function isAnyPressed(codes) {
    return codes.some((code) => pressed.has(code));
  }

  /** Retourne -1, 0 ou +1 selon les deux groupes de touches. */
  function axis(negativeCodes, positiveCodes) {
    let value = 0;
    if (isAnyPressed(positiveCodes)) value += 1;
    if (isAnyPressed(negativeCodes)) value -= 1;
    return value;
  }

  return {
    getThrottle: () => axis(BACKWARD, FORWARD),
    getSteer: () => axis(LEFT, RIGHT),
  };
}
