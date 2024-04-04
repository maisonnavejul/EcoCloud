const express = require('express');
const fs = require('fs-extra');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const app = express();
app.use(cors());

const upload = multer({ dest: '/home/EcoCloud/Chunks' }); // Stocke les fragments dans le dossier temporaire 'Chunks'
const CHUNKS_DIR = '/home/EcoCloud/Chunks';
const DATA_DIR = '/home/EcoCloud/Data';

// Assurez-vous que les répertoires existent
fs.ensureDirSync(CHUNKS_DIR);
fs.ensureDirSync(DATA_DIR);

app.post('/upload', upload.single('file'), async (req, res) => {
  const { resumableIdentifier, resumableFilename, resumableChunkNumber, resumableTotalChunks } = req.body;

  console.log(`Réception du fragment : ${resumableChunkNumber} pour le fichier ${resumableFilename}`);

  if (!resumableIdentifier || !resumableFilename || !resumableChunkNumber || !resumableTotalChunks) {
      console.error('Paramètres manquants');
      return res.status(400).send('Missing parameters');
  }

  const tempDirPath = path.join(CHUNKS_DIR, resumableIdentifier);
  fs.ensureDirSync(tempDirPath);

const filePath = path.join(DATA_DIR, resumableFilename);
const chunkPath = req.file.path;

const tempChunkPath = path.join(tempDirPath, `${resumableChunkNumber}`);
try {
    await fs.move(chunkPath, tempChunkPath, { overwrite: true });

    const isComplete = await checkIfAllChunksReceived(tempDirPath, resumableTotalChunks);

    if (isComplete) {
        console.log(`Tous les fragments reçus pour ${resumableFilename}. Début du réassemblage.`);
        await reassembleFile(tempDirPath, resumableTotalChunks, filePath, resumableFilename);
        console.log('Fichier réassemblé avec succès.');
        res.send({ message: 'Fichier téléversé et réassemblé avec succès' });
    } else {
        res.send({ message: 'Fragment reçu' });
    }
} catch (error) {
    console.error('Erreur lors du traitement du fragment ou de la réassemblage :', error);
    res.status(500).send('Erreur lors du traitement du fichier');
}
});

async function checkIfAllChunksReceived(dirPath, totalChunks) {
const files = await fs.readdir(dirPath);
return files.length === parseInt(totalChunks, 10);
}

async function reassembleFile(dirPath, totalChunks, finalPath, originalFilename) {
  try {
      const writeStream = fs.createWriteStream(finalPath);
      for (let i = 1; i <= totalChunks; i++) {
          const chunkPath = path.join(dirPath, `${i}`);
          const chunk = await fs.readFile(chunkPath);
          writeStream.write(chunk);
          await fs.unlink(chunkPath);
      }
      writeStream.close();
      // Déplacer le fichier réassemblé vers le répertoire final
      const finalFilePath = path.join(DATA_DIR, originalFilename);
      //await fs.move(finalPath, finalFilePath, { overwrite: true });
      // Supprimer le répertoire temporaire des chunks
      await fs.remove(dirPath);
  } catch (error) {
      console.error(`Erreur lors de la réassemblage du fichier : ${error}`);
      throw error; // Relance l'erreur pour la gestion d'erreur dans le bloc appelant
  }
}

app.get('/files', async (req, res) => {
    try {
      const filesList = await fs.readdir(DATA_DIR);
      const filesDetails = await Promise.all(filesList.map(async (fileName) => {
        const filePath = path.join(DATA_DIR, fileName);
        const stats = await fs.stat(filePath);
        return {
          name: fileName,
          type: stats.isDirectory() ? 'Folder' : 'File',
          size: stats.size,
          createdAt: stats.birthtime,
        };
      }));
  
      res.json(filesDetails);
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers :', error);
      res.status(500).send('Erreur lors de la récupération des fichiers');
    }
  });

app.listen(3000, '0.0.0.0', () => {
  console.log('Serveur démarré sur http://207.180.204.159:3000');
});