// Kaneee League - par Kaneeekii Développeur
//
// HUD (interface par-dessus le canvas). Étape 1 : affiche la vitesse.
// Le score et le chrono viendront à l'étape 3.

export function createHud() {
  const speedElement = document.getElementById('hud-speed');
  const loadingElement = document.getElementById('loading');

  // On mémorise la dernière valeur affichée : toucher au DOM coûte cher,
  // on ne le fait que si le chiffre change vraiment.
  let lastShownSpeed = null;

  /** Cache l'écran de chargement une fois le jeu prêt. */
  function hideLoading() {
    if (loadingElement) loadingElement.remove();
  }

  /** @param {number} speedMs vitesse en m/s (peut être négative en marche arrière) */
  function update(speedMs) {
    const kmh = Math.round(Math.abs(speedMs) * 3.6);
    if (kmh === lastShownSpeed) return;
    lastShownSpeed = kmh;
    speedElement.textContent = String(kmh);
  }

  return { hideLoading, update };
}
