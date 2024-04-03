const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(cors());

// Middleware pour créer la structure de dossiers basée sur le chemin relatif
const createFolders = (req, res, next) => {
  if (req.body.relativePath) {
    // Construire le chemin complet du dossier de destination
    const dir = path.join('/home/EcoCloud/Data', path.dirname(req.body.relativePath));

    // Créer le dossier si celui-ci n'existe pas
    fs.mkdirSync(dir, { recursive: true });

    req.dir = dir; // Stocker le chemin du dossier pour l'utiliser dans la configuration de Multer
  }
  next();
};

// Configuration de Multer pour utiliser diskStorage avec la structure de dossiers
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadPath = req.dir || '/home/EcoCloud/Data'; // Utiliser le dossier spécifié ou la racine par défaut
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    cb(null, path.basename(file.originalname)); // Conserver uniquement le nom de base du fichier
  }
});

const upload = multer({ storage: storage }).single('file');

app.post('/upload', createFolders, (req, res) => {
  upload(req, res, function(err) {
    if (err) {
      return res.end("Erreur lors du téléversement du fichier.");
    }
    console.log('Fichier reçu et sauvegardé:', req.file.path);
    res.send('Fichier téléversé avec succès');
  });
});

app.get('/status', (req, res) => {
  res.send('Server On');
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Serveur démarré sur http://207.180.204.159:3000');
});
