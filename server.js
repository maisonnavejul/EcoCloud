const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());

// Configuration de Multer pour utiliser diskStorage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/') // Chemin du dossier où les fichiers seront sauvegardés
  },
  filename: function(req, file, cb) {
    // Génère le nom du fichier en conservant l'extension originale
    cb(null, file.originalname)
  }
});

const upload = multer({ storage: storage });

// Route pour le téléversement de fichier
app.post('/upload', upload.single('file'), (req, res) => {
    console.log('Fichier reçu et sauvegardé:', req.file.path);
    res.send('Fichier téléversé avec succès');
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Serveur démarré sur http://localhost:3000');
});

