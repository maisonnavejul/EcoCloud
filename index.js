const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const SftpClient = require('ssh2-sftp-client');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { Console } = require('console');
const cors = require('cors');

const db = new sqlite3.Database('./database.db');

const app = express();
app.use(bodyParser.json());
const port = 3000;
app.use(cors());
async function checkAndDownloadNewFiles() {
  console.log("Vérification continue des nouveaux fichiers et téléchargement si nécessaire...");

  // Chemin local où vous souhaitez stocker les fichiers téléchargés
  const localDirectoryPath = path.join(__dirname, 'SFTPfiles');

  try {
    // Vérifiez si le dossier local existe, sinon créez-le
    if (!fs.existsSync(localDirectoryPath)) {
      fs.mkdirSync(localDirectoryPath, { recursive: true });
      console.log(`Dossier ${localDirectoryPath} créé.`);
    }

    // Lire le contenu du répertoire sur le serveur SFTP de manière asynchrone
    const remoteDirectoryPath = '/Data'; // Chemin du répertoire sur le serveur SFTP
    const files = await getFilesFromSFTP(remoteDirectoryPath, localDirectoryPath);

    // Envoyer la liste des fichiers au client (dans un contexte réel, vous pourriez vouloir envoyer ces données à un client connecté via WebSocket ou un autre mécanisme)
    console.log("Liste des fichiers téléchargés :", files);

  } catch (err) {
    // Gérer les erreurs de récupération des fichiers
    console.error('Erreur lors de la récupération des fichiers:', err);
  }

  // Planifier la prochaine vérification des nouveaux fichiers dans 1 minute
  setTimeout(checkAndDownloadNewFiles, 1000); // 60000 millisecondes = 1 minute
}

async function getFilesFromSFTP(remoteDirectoryPath, localDirectoryPath) {
  const client = new SftpClient();
  try {
    await client.connect({
      host: "207.180.204.159", // Adresse IP du serveur SFTP
      port: 22, // Port par défaut pour SFTP
      username: "EcoCloud", // Nom d'utilisateur SFTP
      password: "EcoCloud" // Mot de passe SFTP
    });

    const files = await client.list(remoteDirectoryPath);
    const downloadedFiles = [];

    for (const file of files) {
      const localFilePath = path.join(localDirectoryPath, file.name);
      const localFileWithoutZip = localFilePath.replace('.zip', '');
      const localDirPath = path.join(localDirectoryPath, file.name.replace('.zip', ''));
      // Vérifiez si le fichier existe déjà dans le répertoire local
      if (!fs.existsSync(localFilePath) && !fs.existsSync(localDirPath) ) {

        // Le fichier n'existe pas, donc on le télécharge
        await client.get(`${remoteDirectoryPath}/${file.name}`, localFilePath);
        console.log(`Fichier ${file.name} téléchargé avec succès.`);

        // Vérifiez si le fichier téléchargé est un fichier zip
        if (path.extname(file.name).toLowerCase() === '.zip') {
          // Vérifiez si le fichier zip est valide avant de le décompresser
          const zip = new AdmZip(localFilePath);
          if (zip.getEntries().length > 0) {
            // Décompresser le fichier .zip
            zip.extractAllTo(localDirectoryPath, /*overwrite*/ true);
            console.log(`Fichier ${file.name} décompressé avec succès.`);

            // Supprimer le fichier .zip après décompression
            fs.unlinkSync(localFilePath);
            console.log(`Fichier ${file.name} supprimé après décompression.`);
          } else {
            // Le fichier zip est corrompu ou vide, afficher un message d'erreur
            console.error(`Le fichier zip ${file.name} est corrompu ou vide.`);
          }
        }

        // Désiper le fichier (ajoutez votre code de désipage ici)

        downloadedFiles.push(file.name);
      } else {
        // Le fichier existe déjà, pas besoin de le télécharger
        console.log(`Fichier ${file.name} existe déjà, téléchargement sauté.`);
      }
    }

    return downloadedFiles;
  } catch (error) {
    console.error(`Erreur lors de la récupération des fichiers depuis SFTP: ${error.message}`);
    throw error;
  } finally {
    client.end();
  }
}


// Route pour lister les fichiers et dossiers
const ROOT_DIR = path.join(__dirname, 'SFTPfiles'); // Chemin absolu vers le dossier SFTPfiles

const getFileDetails = (filePath) => {
  const stats = fs.statSync(filePath);
  return {
      size: stats.size, // Taille en octets
      createdAt: stats.birthtime // Date de création
  };
};

app.get('/list-files', async (req, res) => {
  const reqPath = req.query.path || '';
  const directoryPath = path.join(ROOT_DIR, reqPath);

  fs.readdir(directoryPath, { withFileTypes: true }, (error, entries) => {
      if (error) {
          console.error('Erreur lors de la récupération des fichiers:', error);
          return res.status(500).send('Erreur lors de la récupération des fichiers');
      }

      const response = entries.map(entry => {
          const entryPath = path.join(directoryPath, entry.name);
          let { size, createdAt } = getFileDetails(entryPath);
      
      const isDirectory = fs.statSync(entryPath).isDirectory();

      size = isDirectory ? fs.readdirSync(entryPath).length : getFileDetails(entryPath).size;

      return {
              name: entry.name,
              type: entry.isDirectory() ? 'Folder' : 'File',
              size: size, // Taille du fichier
              createdAt: createdAt // Date de création du fichier


          };
      });

      res.json(response);
  });
});

app.get('/download', (req, res) => {
  const filePath = req.query.path;
  const fullPath = path.join(ROOT_DIR, filePath);

  console.log('Demande de téléchargement du fichier:', fullPath);

  if (fs.existsSync(fullPath)) {
    let filename = path.basename(fullPath);

    // Encoder le nom de fichier pour gérer les caractères spéciaux
    const encodedFilename = encodeURIComponent(filename);

    if (fs.statSync(fullPath).isDirectory()) {
      const zip = new AdmZip();
      zip.addLocalFolder(fullPath);
      const zipBuffer = zip.toBuffer();
      
      // Assurez-vous que le nom du fichier ZIP est correctement encodé
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${encodedFilename}.zip"`);
      res.send(zipBuffer);
    } else {
      // Pour les fichiers, utilisez le nom encodé dans l'URL de téléchargement
      res.setHeader('Content-Disposition', `attachment; filename="${encodedFilename}"`);
      res.download(fullPath);
    }
  } else {
    res.status(404).send('Fichier ou dossier non trouvé');
  }
});


// Lancer la vérification continue des nouveaux fichiers au démarrage du serveur
checkAndDownloadNewFiles();


app.get('/test', (req, res) => {  
  res.send('Hello World!');  
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});