# Utiliser l'image officielle Node.js comme image de base
FROM node:14

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers de package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances de l'application
RUN npm install

# Copier les fichiers et dossiers restants dans le répertoire de travail (/app)
COPY . .

# Exposer le port sur lequel l'application s'exécute
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["node", "index.js"]
