const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());

// Configuration de Multer pour utiliser diskStorage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, '/home/EcoCloud/Data') 
  },
  filename: function(req, file, cb) {
    // Génère le nom du fichier en conservant l'extension originale
    cb(null, file.originalname)
  }
});


const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // Limite de taille à 100 Mo
  }
});



// Route pour le téléversement de fichier
app.post('/upload', upload.single('file'), (req, res) => {
    console.log('Fichier reçu et sauvegardé:', req.file.path);
    res.send('Fichier téléversé avec succès');
});
app.get('/status', (req, res) => {
  res.send('Server On');
});
//test
app.listen(3000, '0.0.0.0', () => {
  console.log('Serveur démarré sur http://207.180.204.159:3000');
});

