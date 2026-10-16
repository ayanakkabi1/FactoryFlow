# # FactoryFlow

API backend de **planification et de suivi de production** : gestion des matières premières et du stock, des produits et de leur nomenclature (composition), et des ordres de fabrication (OF) exécutés par les opérateurs.

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Démarrage rapide](#démarrage-rapide)
- [Variables d'environnement](#variables-denvironnement)
- [Scripts npm](#scripts-npm)
- [Architecture](#architecture)
- [Rôles et authentification](#rôles-et-authentification)
- [Endpoints de l'API](#endpoints-de-lapi)
- [Cycle de vie d'un ordre de fabrication](#cycle-de-vie-dun-ordre-de-fabrication)
- [Tests](#tests)
- [Conventions Git](#conventions-git)
- [Documentation de conception](#documentation-de-conception)

## Fonctionnalités

- **Installation initiale** : création du premier compte administrateur (une seule fois).
- **Authentification JWT** et contrôle d'accès par rôle.
- **Gestion des utilisateurs** : création d'administrateurs et d'opérateurs.
- **Matières premières** : CRUD, unité de mesure, quantité disponible, seuil d'alerte.
- **Stock** : mouvements d'entrée / sortie, alertes de stock bas (`CRITIQUE`, `RUPTURE`) et notifications associées.
- **Produits** : CRUD et composition (nomenclature des matières nécessaires par unité).
- **Ordres de fabrication** : planification, assignation à un opérateur, démarrage (déduction du stock en transaction), finalisation (incrément du stock produit), historique des actions opérateur.

## Stack technique

| Domaine         | Outils                                          |
| --------------- | ----------------------------------------------- |
| Runtime         | Node.js 20 (ES Modules)                         |
| Framework HTTP  | Express 5                                       |
| Base de données | MongoDB 7 (**replica set** requis) + Mongoose 9 |
| Sécurité        | jsonwebtoken, bcryptjs                          |
| Validation      | express-validator                               |
| Tests           | Jest, Supertest, mongodb-memory-server          |
| Qualité         | ESLint, Prettier                                |
| Conteneurs      | Docker, Docker Compose                          |

## Prérequis

- Node.js 20+ et npm
- MongoDB 7 configuré en **replica set** (les transactions sont utilisées pour l'installation et le démarrage des OF)
- ou simplement **Docker** + **Docker Compose**

## Démarrage rapide

### Avec Docker Compose (recommandé)

```bash
git clone https://github.com/ayanakkabi1/FactoryFlow.git
cd FactoryFlow
git checkout dev
cp .env.example .env        # puis renseigner JWT_SECRET
docker compose up --build
```

Compose démarre trois services :

- `mongo` : MongoDB 7 lancé avec `--replSet rs0` ;
- `mongo-init` : initialise le replica set `rs0` puis s'arrête ;
- `api` : l'API en mode développement (`npm run dev`, rechargement à chaud) sur `http://localhost:5000`.

### En local

```bash
npm install
cp .env.example .env
# adapter MONGO_URI, ex. mongodb://localhost:27017/factoryflow?replicaSet=rs0
npm run dev
```

> `npm ci` peut échouer si le `package-lock.json` n'est pas synchronisé : utiliser `npm install`.

Vérification : `GET http://localhost:5000/` répond `FactoryFlow API is running`.

### Première installation

Avant toute utilisation, créer le premier administrateur :

```bash
curl -X POST http://localhost:5000/api/installation \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@factoryflow.com","password":"motdepasse"}'
```

Puis se connecter pour obtenir un token :

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@factoryflow.com","password":"motdepasse"}'
```

Le token s'utilise ensuite dans l'en-tête `Authorization: Bearer <token>`.

## Variables d'environnement

| Variable                            | Description                              | Exemple                                            |
| ----------------------------------- | ---------------------------------------- | -------------------------------------------------- |
| `PORT`                              | Port d'écoute de l'API                   | `5000`                                             |
| `NODE_ENV`                          | Environnement d'exécution                | `development`                                      |
| `MONGO_URI`                         | URI MongoDB (obligatoire, replica set)   | `mongodb://mongo:27017/factoryflow?replicaSet=rs0` |
| `MONGO_SERVER_SELECTION_TIMEOUT_MS` | Délai de sélection du serveur Mongo (ms) | `5000`                                             |
| `JWT_SECRET`                        | Secret de signature des tokens JWT       | chaîne longue et aléatoire                         |
| `JWT_EXPIRES_IN`                    | Durée de validité des tokens             | `1d`                                               |

## Scripts npm

| Commande               | Rôle                                       |
| ---------------------- | ------------------------------------------ |
| `npm start`            | Lance le serveur (`node src/server.js`)    |
| `npm run dev`          | Lance le serveur avec nodemon              |
| `npm test`             | Exécute la suite de tests Jest             |
| `npm run lint`         | Analyse ESLint                             |
| `npm run lint:fix`     | Corrige automatiquement les erreurs ESLint |
| `npm run format`       | Formate le code avec Prettier              |
| `npm run format:check` | Vérifie le formatage Prettier              |

## Architecture

Architecture en couches :

```
route → validator (express-validator) → controller → service → repository → modèle Mongoose
```

```
src/
├── app.js            # Configuration Express et montage des routes
├── server.js         # Connexion MongoDB, démarrage et arrêt propre du serveur
├── config/           # Connexion à la base de données
├── routes/           # Définition des endpoints et middlewares associés
├── validator/        # Règles de validation des requêtes
├── controllers/      # Gestion des requêtes / réponses HTTP
├── services/         # Logique métier (transactions, règles de statut, alertes)
├── repositories/     # Accès aux données
├── models/           # Schémas Mongoose
├── middlewares/      # Authentification, rôles, gestion globale des erreurs
└── errors/           # Classes d'erreurs applicatives (AppError…)
tests/                # Tests Jest + Supertest
docs/architucture/    # Diagrammes UML et planning
```

Principaux modèles : `User`, `Installation`, `Material`, `MouvementStock`, `Notification`, `Produit`, `CompositionItem`, `CompositionItemSnapshot`, `OrdreFabrication`, `ActionOperateur`.

Les erreurs métier sont levées via `src/errors/AppError.js` et renvoyées au format :

```json
{ "success": false, "message": "..." }
```

## Rôles et authentification

- Le token JWT contient `{ userId, role }`.
- Rôles disponibles : `ADMIN`, `USER`, `OPERATOR`, `OPERATEUR`.
- `verifyToken` vérifie le token, `checkRole(...)` restreint l'accès à certains rôles (403 sinon).

## Endpoints de l'API

Toutes les routes sont préfixées par `/api`. « Authentifié » = token requis (tout rôle).

### Installation — `/api/installation`

| Méthode | Route           | Accès  | Description                         |
| ------- | --------------- | ------ | ----------------------------------- |
| GET     | `/status`       | Public | Statut de l'installation            |
| POST    | `/`             | Public | Crée le premier administrateur      |
| GET     | `/installed-by` | ADMIN  | Administrateur ayant installé l'app |

### Authentification — `/api/auth`

| Méthode | Route    | Accès  | Description               |
| ------- | -------- | ------ | ------------------------- |
| POST    | `/login` | Public | Connexion, renvoie un JWT |

### Utilisateurs — `/api/users`

| Méthode | Route        | Accès       | Description             |
| ------- | ------------ | ----------- | ----------------------- |
| GET     | `/me`        | Authentifié | Profil de l'utilisateur |
| POST    | `/operators` | ADMIN       | Crée un opérateur       |
| POST    | `/admins`    | ADMIN       | Crée un administrateur  |
| GET     | `/operators` | ADMIN       | Liste des opérateurs    |

### Matières premières — `/api/materials`

| Méthode | Route  | Accès           | Description          |
| ------- | ------ | --------------- | -------------------- |
| GET     | `/`    | Authentifié     | Liste des matières   |
| GET     | `/:id` | Authentifié     | Détail d'une matière |
| POST    | `/`    | ADMIN, OPERATOR | Crée une matière     |
| PUT     | `/:id` | ADMIN, OPERATOR | Modifie une matière  |

### Stock — `/api/stock`

| Méthode | Route         | Accès                      | Description                               |
| ------- | ------------- | -------------------------- | ----------------------------------------- |
| GET     | `/alertes`    | ADMIN, OPERATOR, OPERATEUR | Matières sous leur seuil d'alerte         |
| POST    | `/mouvements` | ADMIN, OPERATOR, OPERATEUR | Enregistre un mouvement `ENTREE`/`SORTIE` |

Une sortie qui fait passer une matière sous son seuil d'alerte génère une notification `ALERTE_STOCK` (niveau `CRITIQUE`, ou `RUPTURE` si la quantité atteint 0).

### Produits — `/api/produits`

| Méthode | Route                       | Accès       | Description                |
| ------- | --------------------------- | ----------- | -------------------------- |
| GET     | `/`                         | Authentifié | Liste des produits         |
| GET     | `/:id`                      | Authentifié | Détail d'un produit        |
| POST    | `/`                         | ADMIN       | Crée un produit            |
| PUT     | `/:id`                      | ADMIN       | Modifie un produit         |
| DELETE  | `/:id`                      | ADMIN       | Supprime un produit        |
| GET     | `/:id/composition`          | Authentifié | Composition du produit     |
| GET     | `/:id/composition/snapshot` | Authentifié | Snapshot de la composition |
| POST    | `/:id/composition`          | ADMIN       | Définit la composition     |

### Compositions — `/api/compositions`

| Méthode | Route                  | Accès       | Description                          |
| ------- | ---------------------- | ----------- | ------------------------------------ |
| GET     | `/`                    | Authentifié | Liste des éléments de composition    |
| GET     | `/:id`                 | Authentifié | Détail d'un élément                  |
| GET     | `/snapshot/:produitId` | Authentifié | Snapshot de composition d'un produit |
| POST    | `/`                    | ADMIN       | Ajoute un élément                    |
| PUT     | `/:id`                 | ADMIN       | Modifie un élément                   |
| DELETE  | `/:id`                 | ADMIN       | Supprime un élément                  |

### Ordres de fabrication — `/api/ordres`

| Méthode | Route             | Accès                      | Description                                    |
| ------- | ----------------- | -------------------------- | ---------------------------------------------- |
| GET     | `/`               | Authentifié                | Liste des OF                                   |
| GET     | `/:id`            | Authentifié                | Détail d'un OF                                 |
| GET     | `/code/:code`     | Authentifié                | OF par code                                    |
| GET     | `/statut/:statut` | Authentifié                | OF par statut                                  |
| GET     | `/mes-ordres`     | Authentifié                | OF assignés à l'utilisateur connecté           |
| GET     | `/historique`     | ADMIN, OPERATEUR, OPERATOR | Historique des actions de l'opérateur          |
| POST    | `/`               | ADMIN                      | Crée un OF                                     |
| PUT     | `/:id`            | ADMIN                      | Modifie un OF (uniquement s'il est `PLANIFIE`) |
| PATCH   | `/:id/statut`     | ADMIN, OPERATEUR           | Change le statut (transitions contrôlées)      |
| PATCH   | `/:id/demarrer`   | ADMIN, OPERATEUR, OPERATOR | Démarre l'OF et déduit le stock                |
| PATCH   | `/:id/finaliser`  | ADMIN, OPERATEUR, OPERATOR | Finalise l'OF et incrémente le stock produit   |
| DELETE  | `/:id`            | ADMIN                      | Supprime un OF (interdit s'il est `EN_COURS`)  |

## Cycle de vie d'un ordre de fabrication

```
PLANIFIE ──► EN_COURS ──► TERMINE
    │            │
    └──► ANNULE ◄┘
```

- **Création** : l'OF est créé au statut `PLANIFIE` avec un snapshot de la composition du produit.
- **Démarrage** (`/demarrer`) : uniquement depuis `PLANIFIE`. Les matières nécessaires (quantité unitaire × quantité à fabriquer) sont déduites du stock dans **une transaction MongoDB** ; les mouvements de sortie et l'action `DEMARRAGE_ORDRE` sont enregistrés.
- **Finalisation** (`/finaliser`) : uniquement depuis `EN_COURS`. La quantité fabriquée est ajoutée au stock du produit et l'action `FINALISATION_ORDRE` est enregistrée.

## Tests

```bash
npm test
```

Les tests utilisent **Jest** + **Supertest** et une base **mongodb-memory-server** en replica set (`tests/setup.js`) : aucune instance MongoDB externe n'est nécessaire et les transactions sont supportées.

Avant de pousser du code :

```bash
npm run lint && npm run format:check && npm test
```

## Conventions Git

- La branche d'intégration est `dev` (les PR ciblent `dev`, `main` ne contient que le README).
- Branches : `feature/FAC-<ticket>-<slug>`
- Commits : `FAC-<ticket> <type>(<scope>): <message>` — ex. `FAC-79 feat(order): implement finalize order functionality`

## Documentation de conception

Le dossier [`docs/architucture/`](docs/architucture/) contient :

- `factoryflow_uml_class_diagramm.drawio` : diagramme de classes UML ;
- `FactoryFlow - Backend Production Planning.png` : planning du backend ;
- `exportgantt.xlsx` : diagramme de Gantt du projet.
