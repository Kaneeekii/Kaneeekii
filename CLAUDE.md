# CLAUDE.md

## Le projet

Jeu de foot en voitures dans le navigateur (nom provisoire : **Kaneee League**).
Des voitures poussent un gros ballon dans les buts adverses, sur un terrain fermé.
Le jeu est 100 % original : aucun nom, logo, modèle, son ou visuel issu de jeux existants.
Et dans la signature du code tu mets Kaneeekii Développeur

## Moi, le développeur

J'apprends le développement web et jeu. Pour chaque tâche :

- Explique brièvement ce que tu fais et pourquoi, en français.
- Commente le code aux endroits importants (physique, boucle de jeu, maths 3D).
- Quand un concept est nouveau (quaternions, delta time, raycast…), donne une explication simple en 2-3 phrases.
- Préfère du code lisible à du code astucieux.
- Avance par petites étapes testables plutôt que de tout générer d'un coup.

## Stack technique

- **Vite** : serveur de dev et build
- **JavaScript** (ES modules), pas de TypeScript pour l'instant
- **Three.js** : rendu 3D
- **@dimforge/rapier3d-compat** : moteur physique
- Plus tard : **Node.js + WebSocket (ws)** pour le multijoueur, hébergé sur mon VPS

N'ajoute pas d'autre dépendance sans me demander.

## Structure

```
/
├── index.html
├── src/
│   ├── main.js          # point d'entrée, boucle de jeu
│   ├── game/
│   │   ├── world.js     # initialisation Rapier + scène Three.js
│   │   ├── arena.js     # terrain, murs, buts
│   │   ├── car.js       # voiture : physique + contrôles
│   │   ├── ball.js      # ballon
│   │   ├── camera.js    # caméra qui suit la voiture
│   │   └── input.js     # clavier / manette
│   ├── ui/              # score, chrono, menus (HTML/CSS par-dessus le canvas)
│   └── config.js        # toutes les constantes réglables
├── public/              # modèles 3D, sons, textures
└── server/              # (étape 5) serveur multijoueur
```

## Règles de code

- Toutes les valeurs de gameplay (vitesse, force du saut, boost, gravité, taille du ballon) vont dans `config.js`, jamais en dur.
- La physique tourne à pas fixe (60 Hz) ; le rendu interpole. Utilise un accumulateur de delta time.
- Rapier est la source de vérité pour les positions ; Three.js ne fait que copier.
- Une responsabilité par fichier, fonctions courtes.
- Formes simples (box, sphère) tant que le gameplay n'est pas fun. Les jolis visuels viennent après.
- Le jeu doit tourner à 60 fps sur un PC moyen.

## Commandes

- `npm install` : installer les dépendances
- `npm run dev` : lancer le jeu en local
- `npm run build` : build de production dans `dist/`

## Feuille de route

1. **Voiture** : une voiture (box) qui accélère, freine et tourne sur un plan, caméra qui suit. Contrôles : ZQSD / flèches.
1. **Ballon et arène** : ballon physique, murs et plafond, collisions voiture-ballon satisfaisantes.
1. **Match** : deux buts, détection des buts, score, chrono de 3 min, remise en jeu.
1. **Mouvements** : saut (Espace), double saut, boost (Shift) avec jauge, puis une IA simple (aller vers le ballon, tirer vers le but).
1. **Multijoueur en ligne** : serveur Node.js autoritaire sur le VPS, synchronisation via WebSocket.

On est actuellement à l'**étape 1**. Ne passe pas à l'étape suivante sans que je valide.

## Git

- Un commit par fonctionnalité qui marche, message en français et clair (ex. « ajout du saut de la voiture »).
- Ne commite jamais de clés, mots de passe ou fichiers `.env`.
