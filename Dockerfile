# Étape 1 : Définir l'image de basee
FROM node:20-alpine

# Étape 2 : Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Étape 3 : Copier le fichier 'package.json' et 'package-lock.json' (si disponible)
COPY package*.json ./

# Étape 4 : Installer les dépendances du projet
RUN npm install

# Étape 5 : Copier le reste des fichiers du projet dans le conteneur
COPY . .

# Étape 6 : Exposer le port sur lequel votre app tourne
EXPOSE 3000

# Étape 7 : Définir la commande pour démarrer l'application
CMD ["node", "index.js"]
