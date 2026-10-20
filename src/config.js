// Kaneee League - par Kaneeekii Développeur
//
// Toutes les valeurs réglables du jeu sont ici.
// Règle du projet : aucune valeur de gameplay "en dur" dans les autres fichiers.
// Unités : mètres, secondes, kilogrammes (comme Rapier).

export const PHYSICS = {
  // La physique avance par pas fixes de 1/60 s, quel que soit le framerate.
  FIXED_STEP: 1 / 60,
  // Gravité plus forte que la réalité (-9.81) : les voitures retombent plus vite,
  // ce qui donne un jeu plus nerveux. On ajustera quand le saut arrivera.
  GRAVITY: -20,
  // Si un gros lag arrive, on limite le temps à rattraper pour éviter
  // une "spirale de la mort" (la physique qui n'arrive plus à suivre).
  MAX_FRAME_TIME: 0.25,
};

export const ARENA = {
  // Sol carré (étape 1). Les murs et les buts viendront à l'étape 2.
  GROUND_SIZE: 120,
  GROUND_THICKNESS: 1,
  GROUND_FRICTION: 1,
  GROUND_COLOR: 0x1f6b3a,
  GRID_COLOR: 0x2f8f50,
  GRID_DIVISIONS: 60,
};

export const CAR = {
  // Dimensions de la boîte (en mètres)
  WIDTH: 1.6,
  HEIGHT: 0.6,
  LENGTH: 3.0,
  MASS: 1,
  COLOR: 0xe01b1b,
  NOSE_COLOR: 0x3a0000,

  START_POSITION: { x: 0, y: 1, z: 0 },

  // Conduite (accélérations en m/s², vitesses en m/s)
  ACCELERATION: 25,        // quand on accélère dans le sens de la marche
  BRAKE_DECELERATION: 45,  // quand on appuie à l'opposé de la vitesse actuelle
  MAX_SPEED: 25,           // ~90 km/h en marche avant
  MAX_REVERSE_SPEED: 8,    // marche arrière plus lente

  // Direction
  TURN_RATE: 2.6,          // vitesse de rotation max (radians par seconde)
  STEER_FULL_SPEED: 6,     // vitesse (m/s) à partir de laquelle on tourne à fond
  GRIP: 10,                // force qui annule la glisse latérale (plus = colle à la route)

  // Amortissements de Rapier : freinent naturellement le corps au fil du temps
  LINEAR_DAMPING: 0.4,
  ANGULAR_DAMPING: 4,
};

export const CAMERA = {
  FOV: 65,
  NEAR: 0.1,
  FAR: 500,
  // Position de la caméra par rapport à la voiture (dans le repère de la voiture).
  // z positif = derrière la voiture (l'avant de la voiture pointe vers -z).
  OFFSET: { x: 0, y: 4, z: 9 },
  // Point regardé : un peu au-dessus du centre de la voiture
  LOOK_AT_HEIGHT: 1,
  // Plus la valeur est grande, plus la caméra réagit vite (suivi "raide")
  SMOOTHING: 6,
};
