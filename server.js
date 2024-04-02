const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const tempDir = path.join(__dirname, 'temp');
const uploadDir = '/home/EcoCloud/Data';

// Assurez-vous que le répertoire temporaire existe
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

app.post('/upload', (req, res) => {
  const { identifier, fileName, totalChunks, chunkNumber } = req.body;
  const chunkDir = path.join(tempDir, identifier);

  if (!fs.existsSync(chunkDir)) {
    fs.mkdirSync(chunkDir, { recursive: true });
  }

  // Le corps de la requête devrait contenir le morceau du fichier sous forme de Blob ou de File
  // Sauvegardez chaque morceau avec un nom de fichier qui reflète son numéro pour faciliter la reconstitution
  const chunkPath = path.join(chunkDir, `${chunkNumber}`);
  let chunk = []; // Remplacer cela par le morceau du fichier reçu
  fs.writeFileSync(chunkPath, Buffer.from(chunk));

  // Vérifier si tous les morceaux ont été reçus
  if (fs.readdirSync(chunkDir).length === totalChunks) {
    // Reconstituez le fichier à partir des morceaux
    const filePath = path.join(uploadDir, fileName);
    const fileStream = fs.createWriteStream(filePath);

    for (let i = 1; i <= totalChunks; i++) {
      const chunkPath = path.join(chunkDir, `${i}`);
      fileStream.write(fs.readFileSync(chunkPath));
      fs.unlinkSync(chunkPath); // Supprimez le morceau après l'avoir écrit
    }

    fileStream.end();
    fs.rmdirSync(chunkDir); // Supprimez le dossier de morceaux
    res.send('Fichier téléversé et reconstitué avec succès');
  } else {
    res.send('Morceau reçu');
  }
});

app.listen(3000, () => {
  console.log('Serveur démarré sur le port 3000');
});
