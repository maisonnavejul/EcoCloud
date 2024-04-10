const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const SftpClient = require('ssh2-sftp-client');
const fs = require('fs-extra');
const multer = require('multer');
const path = require('path');
const AdmZip = require('adm-zip');
const { Console } = require('console');
const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const db = new sqlite3.Database('./database.db');
// Définir les répertoires
const BASE_DIR = path.resolve(__dirname, '..');
const CHUNKS_DIR = path.join(BASE_DIR, 'EcoCloud', 'Chunks');
const SFTPFILES_DIR = path.join(BASE_DIR, 'EcoCloud', 'SFTPfiles');

// Configurer multer pour stocker les fragments de fichiers
const upload = multer({ dest: CHUNKS_DIR });


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
function ajouterUtilisateur({ email, psw, firstname, lastname, username, is_admin }, callback) {
  bcrypt.hash(psw, saltRounds, function(err, hash) {
    if (err) {
      return callback(err);
    }
    db.run(`INSERT INTO utilisateurs (email, psw, firstname, lastname, username, is_admin) VALUES (?, ?, ?, ?, ?, ?)`, [email, hash, firstname, lastname, username, is_admin], function(err) {
      if (err) {
        return callback(err);
      }
      callback(null, { userId: this.lastID });
    });
  });
}
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

// Route pour gérer l'upload des fichiers
app.post('/upload', upload.single('file'), async (req, res) => {
  const { resumableIdentifier, resumableFilename, resumableChunkNumber, resumableTotalChunks } = req.body;

  console.log(`Réception du fragment : ${resumableChunkNumber} pour le fichier ${resumableFilename}`);

  if (!resumableIdentifier || !resumableFilename || !resumableChunkNumber || !resumableTotalChunks) {
      console.error('Paramètres manquants');
      return res.status(400).send('Missing parameters');
  }

  const tempDirPath = path.join(CHUNKS_DIR, resumableIdentifier);
  fs.ensureDirSync(tempDirPath);

const filePath = path.join(SFTPFILES_DIR, resumableFilename);
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
      await fs.unlink(chunkPath); // Supprimer le fragment après l'avoir ajouté
    }
    writeStream.end();

    writeStream.on('finish', async () => {
      // Le fichier est maintenant réassemblé. Prochaine étape: le dézipper

      // Déterminer le chemin final du dossier où les fichiers seront décompressés
      const unzipDestination = path.join(SFTPFILES_DIR, path.basename(originalFilename, '.zip'));

      // Décompresser le fichier .zip
      const zip = new AdmZip(finalPath);
      zip.extractAllTo(unzipDestination, true);
      console.log(`Fichier ${originalFilename} décompressé avec succès dans ${unzipDestination}.`);

      // Optionnel: Supprimer le fichier .zip après la décompression si vous ne souhaitez pas le conserver
      await fs.unlink(finalPath);
      console.log(`Fichier .zip original ${originalFilename} supprimé après décompression.`);

      // A ce stade, le fichier est décompressé dans SFTPFILES_DIR, et le .zip est supprimé
      // Vous pouvez maintenant répondre à la requête HTTP pour signaler le succès
    });
  } catch (error) {
    console.error(`Erreur lors de la réassemblage et décompression du fichier : ${error}`);
    throw error; // Propage l'erreur pour une gestion ultérieure
  }
}


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

app.delete('/delete-file', async (req, res) => {
  const { filePath } = req.body;
  console.log('Suppression demandée pour:', filePath);
  const fullPath = path.join(ROOT_DIR, filePath);

  try {
      // Vérifiez d'abord si le chemin existe pour éviter les erreurs
      if (!await fs.pathExists(fullPath)) {
          console.log('Fichier/dossier non trouvé:', fullPath);
          return res.status(404).send('Fichier ou dossier non trouvé');
      }

      // Supprime le fichier ou le dossier, y compris s'il est un dossier non vide
      await fs.remove(fullPath);
      console.log('Supprimé avec succès:', fullPath);
      res.send({ message: 'Fichier/dossier supprimé avec succès' });
  } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      res.status(500).send('Erreur lors de la suppression');
  }
});


// Lancer la vérification continue des nouveaux fichiers au démarrage du serveur
checkAndDownloadNewFiles();


app.get('/test', (req, res) => {  
  res.send('Hello World!');  
});

app.post('/login', (req, res) => {
  const { username, psw } = req.body;

  db.get(`SELECT * FROM utilisateurs WHERE username = ?`, [username], (err, user) => {
    if (err) {
      console.log('Erreur lors de la récupération de l’utilisateur:', err);
      return res.status(500).json({ is_connected: false, message: "Erreur serveur." });
    }
    if (!user) {
      return res.status(404).json({ is_connected: false, message: "Utilisateur non trouvé." });
    }
    bcrypt.compare(psw, user.psw, (err, result) => {
      if (result) {
        // Inclure l'email, le username et le firstname dans la réponse
        res.json({
          is_connected: true,
          message: "Connexion réussie.",
          email: user.email,
          username: user.username,
          firstname: user.firstname,
          is_admin: user.is_admin
          
        });
      } else {
        res.status(401).json({ is_connected: false, message: "Mot de passe incorrect." });
      }
    });
  });
});
app.put('/updateUser/:username', (req, res) => {
  const { username } = req.params; // Obtention du username depuis les paramètres de la route
  const { email, psw, firstname, lastname, newUsername } = req.body;

  // Hacher le mot de passe s'il est fourni dans la requête
  const processPassword = (callback) => {
    if (psw) {
      bcrypt.hash(psw, saltRounds, (err, hash) => {
        if (err) {
          console.error('Erreur lors du hachage du mot de passe:', err.message);
          return res.status(500).send("Erreur lors de la mise à jour du mot de passe.");
        }
        callback(hash); // Exécute la mise à jour avec le mot de passe haché
      });
    } else {
      callback(null); // Passe null si aucun nouveau mot de passe n'est fourni
    }
  };

  processPassword((hashedPsw) => {
    let sql = `UPDATE utilisateurs SET 
                email = ?, 
                firstname = ?, 
                lastname = ?, 
                username = ?` +
                (hashedPsw ? `, psw = ? ` : '') +
                `WHERE username = ?`;
    let params = hashedPsw ? 
                  [email, firstname, lastname, newUsername || username, hashedPsw, username] :
                  [email, firstname, lastname, newUsername || username, username];

    db.run(sql, params, function(err) {
      if (err) {
        console.error('Erreur lors de la mise à jour de l’utilisateur:', err.message);
        return res.status(500).send("Erreur lors de la mise à jour de l'utilisateur.");
      }
      if (this.changes > 0) {
        res.send(`Utilisateur ${username} mis à jour avec succès.`);
      } else {
        res.status(404).send("Utilisateur non trouvé.");
      }
    });
  });
});

app.post('/addUser', (req, res) => {
  const { email, psw, firstname, lastname, username, is_admin } = req.body;
  ajouterUtilisateur({ email, psw, firstname, lastname, username, is_admin }, (err, user) => {
    if (err) {
      console.error('Erreur lors de l\'ajout de l\'utilisateur:', err.message);
      res.status(500).send("Erreur lors de l'ajout de l'utilisateur.");
    } else {
      console.log(`Utilisateur ajouté avec succès: ${user.userId}`);
      res.status(201).send(`Utilisateur ajouté avec succès avec l'ID ${user.userId}`);
    }
  });
});

app.delete('/deleteUser/:username', (req, res) => {
  const { username } = req.params;
  db.run(`DELETE FROM utilisateurs WHERE username = ?`, [username], function(err) {
    if (err) {
      return res.status(500).send("Erreur lors de la suppression de l'utilisateur.");
    }
    if (this.changes > 0) {
      res.send("Utilisateur supprimé avec succès.");
    } else {
      res.status(404).send("Utilisateur non trouvé.");
    }
  });
});


app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});