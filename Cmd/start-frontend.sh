#!/bin/bash

# Script de lancement de l'application frontend AI Scientist

# Définir le répertoire de travail
cd /data/.openclaw/workspace/aiscientist/Code/Frontend

# Installer les dépendances avec legacy-peer-deps pour gérer les incompatibilités
echo "Installation des dépendances..."
npm install --legacy-peer-deps || {
    echo "Erreur lors de l'installation des dépendances"
    exit 1
}

# Lancer le serveur de développement
echo "Lancement du serveur de développement..."
npm run dev -- --host 0.0.0.0 --port 3000