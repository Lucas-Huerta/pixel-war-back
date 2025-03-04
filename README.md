# Pixel War Backend

Backend pour le projet Pixel War utilisant Socket.IO et Express.js.

## Technologies utilisées

- Node.js
- Express.js
- Socket.IO

## Prérequis

- Node.js
- npm ou yarn

## Installation

1. Cloner le repository
```bash
git clone <repository-url>
cd pixel-war-back
```

2. Installer les dépendances
```bash
npm install
# ou
yarn install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env
```
Modifier le fichier `.env` avec vos configurations.

## Démarrage

### Mode développement
```bash
npm run dev
# ou
yarn dev
```

### Mode production
```bash
npm run build
npm start
# ou
yarn build
yarn start
```

## Points de terminaison API

### WebSocket Events

- `connection`: Connexion d'un nouveau client
- `disconnect`: Déconnexion d'un client
- `pixel:update`: Mise à jour d'un pixel
- `grid:request`: Demande de la grille actuelle

### Routes HTTP

- `GET /api/grid` : Récupère l'état actuel de la grille
- `GET /api/health`: Vérifie l'état du serveur

## Structure du projet

```
pixel-war-back/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── socket/
│   └── app.ts
├── tests/
├── package.json
└── tsconfig.json
```

## Contribuer

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amélioration`)
3. Commit les changements (`git commit -am 'Ajout de fonctionnalité'`)
4. Push la branche (`git push origin feature/amélioration`)
5. Créer une Pull Request


