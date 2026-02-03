# 💰 Application de Gestion de Tontine

Application web complète pour gérer une tontine de 10 membres avec stockage des données en JSON.

## 🎯 Fonctionnalités

- ✅ Gestion des membres (ajout, modification, suppression)
- ✅ Suivi des paiements quotidiens (200 FCFA/jour × 10 jours)
- ✅ Gestion des cycles (10 cycles de 10 jours)
- ✅ Tirage au sort automatique des bénéficiaires
- ✅ Validation et complétion des cycles
- ✅ Statistiques en temps réel
- ✅ Interface moderne style Facebook
- ✅ Stockage persistant en fichiers JSON
- ✅ API REST complète

## 📋 Prérequis

- Node.js (version 14 ou supérieure)
- npm ou yarn

## 🚀 Installation

### 1. Installer les dépendances

```bash
cd tontine-app
npm install
```

### 2. Démarrer le serveur

```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

### 3. Mode développement (avec rechargement automatique)

```bash
npm run dev
```

## 📁 Structure du Projet

```
tontine-app/
│
├── server.js              # Serveur Express avec API REST
├── package.json           # Dépendances du projet
│
├── public/
│   └── index.html         # Frontend (React)
│
└── data/                  # Données JSON (créé automatiquement)
    ├── members.json       # Liste des membres
    ├── cycles.json        # Informations des cycles
    ├── payments.json      # Paiements quotidiens
    └── config.json        # Configuration globale
```

## 🔌 API REST

### Membres

- `GET /api/members` - Récupérer tous les membres
- `POST /api/members` - Ajouter un membre
- `PUT /api/members/:id` - Mettre à jour un membre
- `DELETE /api/members/:id` - Supprimer un membre

### Cycles

- `GET /api/cycles` - Récupérer tous les cycles
- `POST /api/cycles/initialize` - Initialiser les 10 cycles
- `PUT /api/cycles/:id` - Mettre à jour un cycle
- `POST /api/cycles/:id/complete` - Terminer un cycle

### Paiements

- `GET /api/payments` - Récupérer tous les paiements
- `POST /api/payments` - Enregistrer un paiement

### Configuration

- `GET /api/config` - Récupérer la configuration
- `PUT /api/config` - Mettre à jour la configuration

### Autres

- `GET /api/stats` - Récupérer les statistiques globales
- `POST /api/draw-beneficiaries` - Tirer au sort l'ordre des bénéficiaires

## 🎮 Utilisation

### 1. Premier lancement

Au premier démarrage, l'application crée automatiquement :
- 10 membres par défaut (Membre 1 à Membre 10)
- 10 cycles de 10 jours chacun
- La structure de données JSON

### 2. Configurer les membres

1. Allez dans l'onglet "👥 Membres"
2. Modifiez les noms et numéros de téléphone
3. Ou ajoutez de nouveaux membres avec le bouton "+ Ajouter"

### 3. Tirer au sort les bénéficiaires

1. Dans l'onglet "🏠 Accueil"
2. Cliquez sur "🎲 Tirer au Sort"
3. L'ordre des bénéficiaires sera défini pour les 10 cycles

### 4. Enregistrer les paiements

1. Allez dans l'onglet "💵 Paiements"
2. Pour chaque membre, saisissez le montant payé chaque jour (0-200 FCFA)
3. Les totaux se calculent automatiquement

### 5. Terminer un cycle

1. Quand tous les membres ont payé leurs 2000 FCFA
2. Cliquez sur "✅ Terminer ce Cycle"
3. Le système passe automatiquement au cycle suivant

## 📊 Format des Données JSON

### members.json
```json
[
  {
    "id": 1,
    "name": "Jean Dupont",
    "phone": "237690123456",
    "status": "Actif",
    "createdAt": "2026-02-01T10:00:00.000Z"
  }
]
```

### cycles.json
```json
[
  {
    "id": 1,
    "startDate": "2026-02-01",
    "endDate": "2026-02-10",
    "beneficiaryId": 3,
    "amount": 20000,
    "status": "En cours",
    "completed": false,
    "completedAt": null
  }
]
```

### payments.json
```json
{
  "1-5-3": {
    "amount": 200,
    "timestamp": "2026-02-03T14:30:00.000Z"
  }
}
```
*Format de clé: `{cycleId}-{memberId}-{day}`*

### config.json
```json
{
  "currentCycle": 1,
  "beneficiaryOrder": [3, 7, 1, 9, 2, 5, 8, 4, 10, 6],
  "startDate": "2026-02-01",
  "memberCount": 10,
  "cycleAmount": 2000,
  "cycleDuration": 10
}
```

## 🚢 Déploiement en Production

### Option 1: Serveur Node.js

```bash
# Sur votre serveur
git clone <votre-repo>
cd tontine-app
npm install --production
npm start
```

### Option 2: Avec PM2 (recommandé)

```bash
npm install -g pm2
pm2 start server.js --name tontine
pm2 save
pm2 startup
```

### Option 3: Docker

Créez un `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

Puis:

```bash
docker build -t tontine-app .
docker run -p 3000:3000 -v $(pwd)/data:/app/data tontine-app
```

### Option 4: Services Cloud

- **Heroku**: Ajoutez un `Procfile` avec `web: node server.js`
- **Railway**: Connectez votre repo Git
- **Render**: Déployez directement depuis GitHub
- **DigitalOcean App Platform**: Upload et deploy

## 🔒 Sécurité

Pour la production, ajoutez :

1. **Authentification**
```javascript
// Exemple avec express-session
app.use(session({
  secret: 'votre-secret-ici',
  resave: false,
  saveUninitialized: false
}));
```

2. **Validation des données**
```javascript
// Utilisez express-validator
const { body, validationResult } = require('express-validator');
```

3. **Variables d'environnement**
```javascript
// Créez un fichier .env
PORT=3000
NODE_ENV=production
```

4. **HTTPS** (avec Let's Encrypt ou votre hébergeur)

## 🔧 Configuration Personnalisée

Modifiez `data/config.json` pour :

- Changer le montant par cycle (`cycleAmount`)
- Modifier la durée des cycles (`cycleDuration`)
- Ajuster le nombre de membres (`memberCount`)
- Définir une nouvelle date de début (`startDate`)

## 🐛 Dépannage

### Le serveur ne démarre pas
```bash
# Vérifiez que le port 3000 est libre
lsof -ti:3000
# Ou utilisez un autre port
PORT=4000 npm start
```

### Erreur de lecture des fichiers JSON
```bash
# Supprimez le dossier data et redémarrez
rm -rf data/
npm start
```

### Les données ne se sauvegardent pas
```bash
# Vérifiez les permissions
chmod -R 755 data/
```

## 📝 Licence

MIT

## 👨‍💻 Support

Pour toute question ou problème, ouvrez une issue sur GitHub ou contactez l'équipe de développement.

## 🎉 Contributeurs

Développé avec ❤️ pour faciliter la gestion des tontines.
