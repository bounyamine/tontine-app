#!/bin/bash

echo "╔════════════════════════════════════════╗"
echo "║  🚀 Installation Tontine App          ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null
then
    echo "❌ Node.js n'est pas installé."
    echo "📥 Téléchargez-le sur: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js détecté: $(node -v)"
echo ""

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Installation réussie!"
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║  🎯 Démarrage du serveur...           ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    
    # Démarrer le serveur
    npm start
else
    echo ""
    echo "❌ Erreur lors de l'installation"
    echo "Essayez: npm install --force"
    exit 1
fi
