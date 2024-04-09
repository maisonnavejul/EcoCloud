const express = require('express');
const axios = require('axios');
const fs = require('fs-extra');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { pipeline } = require('stream');
const { promisify } = require('util');
const pipelineAsync = promisify(pipeline);
const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: '/home/EcoCloud/Chunks' }); // Stocke les fragments dans le dossier temporaire 'Chunks'
const CHUNKS_DIR = '/home/EcoCloud/Chunks';
const DATA_DIR = '/home/EcoCloud/Data';
const urlngrok= "https://5ec0-37-170-73-162.ngrok-free.app"
// Assurez-vous que les répertoires existent
fs.ensureDirSync(CHUNKS_DIR);
fs.ensureDirSync(DATA_DIR);

app.post('/login', async (req, res) => {
  try {
      // Transmettre la demande de connexion au serveur EcoCloud
      const response = await axios.post(`${urlngrok}/login`, req.body);
      // Renvoyer la réponse du serveur EcoCloud au client
      res.send(response.data);
  } catch (error) {
      if (error.response) {
          // Renvoyer les erreurs du serveur EcoCloud au client
          res.status(error.response.status).send(error.response.data);
      } else {
          res.status(500).send('Erreur de connexion au serveur EcoCloud');
      }
  }
});
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

  app.get('/test-recup', async (req, res) => {
    const folderPath = req.query.path || ''; // Récupère le chemin depuis la requête ou utilise une chaîne vide par défaut
    
    try {
      // Remplacez l'URL par celle de votre serveur EcoCloud ou de l'API que vous souhaitez interroger
      const ecoCloudUrl = `${urlngrok}/list-files?path=${encodeURIComponent(folderPath)}`;
      const response = await axios.get(ecoCloudUrl);
      
      // Redirige la réponse de l'API directement au client
      res.json(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      res.status(500).send('Erreur lors de la récupération des données');
    }
  });
  app.get('/download', async (req, res) => {
    const filePath = req.query.path;
    const ecoCloudDownloadUrl = `${urlngrok}/download?path=${encodeURIComponent(filePath)}`;
  console.log('/download',ecoCloudDownloadUrl)
    try {
      const response = await axios({
        method: 'GET',
        url: ecoCloudDownloadUrl,
        responseType: 'stream',
      });
  
      res.setHeader('Content-Disposition', response.headers['content-disposition']);
      res.setHeader('Content-Type', response.headers['content-type']);
  
      // Utilisez `pipelineAsync` ici avec des streams valides
      await pipelineAsync(response.data, res).catch(err => {
        console.error('Erreur lors du stream du fichier:', err);
        res.status(500).send('Erreur lors du stream du fichier');
      });
  
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      res.status(500).send('Erreur lors du téléchargement du fichier ou du dossier');
    }
  });

  app.delete('/delete-file', async (req, res) => {
    const { filePath } = req.body;
    console.log('Suppression demandée pour:', filePath);

    // Construire le chemin complet vers le fichier ou le dossier
    const fullPath = path.join(DATA_DIR, filePath);

    try {
        // Suppression externe via l'API
        const externalResponse = await axios.delete('${urlngrok}/delete-file', { data: req.body });
        console.log('Réponse du serveur EcoCloud :', externalResponse.data);

        // Suppression locale
        let localMessage = 'Pas de suppression locale nécessaire.';
        if (await fs.pathExists(fullPath)) {
            await fs.remove(fullPath);
            localMessage = 'Supprimé avec succès localement.';
        }
        if (await fs.pathExists(fullPath + '.zip')) {
            await fs.remove(fullPath + '.zip');
            localMessage = 'Supprimé dossier avec succès localement.';
        }       

        // Envoyer une réponse combinée
        res.json({ externalMessage: externalResponse.data.message, localMessage: localMessage });
    } catch (error) {
        console.error('Erreur lors de la suppression du fichier/dossier:', error);
        // Il est important de vérifier si l'erreur est due à l'envoi d'une réponse ou à autre chose
        if (!res.headersSent) {
            res.status(500).send('Erreur lors de la suppression du fichier/dossier');
          }
        }
    });

app.listen(3000, '0.0.0.0', () => {
  console.log('Serveur démarré sur http://207.180.204.159:3000');
});
