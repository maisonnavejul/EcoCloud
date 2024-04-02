// Assurez-vous que ces lignes sont dans votre fichier pour initialiser Express et votre base de données
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');



const db = new sqlite3.Database('./database.db');

const app = express();
app.use(cors());
app.use(bodyParser.json()); // Pour parser les corps des requêtes en JSON
const saltRounds = 10; // Ajoutez cette ligne pour définir saltRounds
const SftpClient = require('ssh2-sftp-client');

async function uploadFileToSFTP(remoteFilePath, localFilePath) {
  const client = new SftpClient();
  try {
    await client.connect({
      host: "207.180.204.159", // L'adresse IP de votre serveur SFTP
      port: 22, // Port par défaut pour SFTP
      username: "EcoCloud", // Votre nom d'utilisateur SFTP
      password: "EcoCloud" // Le mot de passe de l'utilisateur SFTP
    });
    await client.put(localFilePath, remoteFilePath); // Utilisez put au lieu de uploadFrom
    console.log("Fichier téléversé avec succès via SFTP");
  } catch (error) {
    console.error("Erreur lors du téléversement du fichier via SFTP:", error);
  } finally {
    client.end();
  }
}




app.post('/login', (req, res) => {
  const { username, psw } = req.body;
  console.log(`username: ${username}, psw: ${psw}`);
  
  db.get(`SELECT * FROM utilisateurs WHERE username = ?`, [username], (err, user) => {
    if (err) {
      console.log('Erreur lors de la récupération de l’utilisateur:', err);
      return res.status(500).json({ is_connected: false, message: "Erreur serveur." });
    }
    if (!user) {
      console.log("Utilisateur non trouvé.");
      return res.status(404).json({ is_connected: false, message: "Utilisateur non trouvé." });
    }
    bcrypt.compare(psw, user.psw, (err, result) => {
      if (err) {
        console.log('Erreur lors de la comparaison des mots de passe:', err);
        return res.status(500).json({ is_connected: false, message: "Erreur serveur." });
      }
      if (result) {
        console.log("Connexion réussie!");
        // Inclure email et is_admin dans la réponse
        res.json({ 
          is_connected: true, 
          message: "Connexion réussie!", 
          email: user.email, // Renvoyer l'email de l'utilisateur
          is_admin: user.is_admin // Renvoyer le statut d'administrateur de l'utilisateur
        });
      } else {
        console.log("Mot de passe incorrect.");
        res.status(401).json({ is_connected: false, message: "Mot de passe incorrect." });
      }
    });    
  });
});

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  // Ici, vous pourriez également vouloir renvoyer le chemin du fichier ou d'autres informations
  //res.send('File uploaded successfully: ' + req.file.path);
});

app.post('/uploadsFTP', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Aucun fichier téléversé.');
  }
  const localFilePath = req.file.path;
  const remoteFilePath = `/files/${req.file.originalname}`;

  uploadFileToSFTP(remoteFilePath, localFilePath)
    .then(() => {
      res.send("Fichier téléversé avec succès via SFTP.");
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("Erreur lors du téléversement du fichier via SFTP.");
    });
});


app.get('/files', async (req, res) => {
  console.log("Récupération de la liste des fichiers...");

  // Chemin local où vous souhaitez stocker les fichiers téléchargés
  const localDirectoryPath = path.join(__dirname, 'SFTPfiles');

  try {
    // Lire le contenu du répertoire sur le serveur SFTP de manière asynchrone
    const remoteDirectoryPath = '/files'; // Chemin du répertoire sur le serveur SFTP
    const files = await getFilesFromSFTP(remoteDirectoryPath, localDirectoryPath);

    // Envoyer la liste des fichiers au client
    res.json({ files });
  } catch (err) {
    // Gérer les erreurs de récupération des fichiers
    console.error('Erreur lors de la récupération des fichiers:', err);
    res.status(500).send("Erreur lors de la récupération de la liste des fichiers.");
  }
});

async function getFilesFromSFTP(remoteDirectoryPath, localDirectoryPath) {
  // Vérifiez si le dossier local existe, sinon créez-le
  if (!fs.existsSync(localDirectoryPath)) {
    fs.mkdirSync(localDirectoryPath, { recursive: true });
    console.log(`Dossier ${localDirectoryPath} créé.`);
  }

  const client = new SftpClient();
  try {
    await client.connect({
      host: "207.180.204.159",
      port: 22,
      username: "EcoCloud",
      password: "EcoCloud"
    });

    const files = await client.list(remoteDirectoryPath);
    for (const file of files) {
      console.log(file.name);
      const localFilePath = path.join(localDirectoryPath, file.name);

      // Vérifiez si le fichier existe déjà dans le répertoire local
      if (!fs.existsSync(localFilePath)) {
        // Le fichier n'existe pas, donc on le télécharge
        await client.get(`${remoteDirectoryPath}/${file.name}`, localFilePath);
        console.log(`Fichier ${file.name} téléchargé avec succès.`);
      } else {
        // Le fichier existe déjà, pas besoin de le télécharger
        console.log(`Fichier ${file.name} existe déjà, téléchargement sauté.`);
      }
    }
    
  } catch (error) {
    console.error(`Erreur lors de la récupération des fichiers depuis SFTP: ${error.message}`);
    throw error;
  } finally {
    client.end();
  }
}


app.put('/updateUser', (req, res) => {
  const { email, psw, firstname, lastname, username } = req.body;

  // Hacher le mot de passe avant de le mettre à jour dans la base de données, si un nouveau mot de passe est fourni
  if (psw) {
    bcrypt.hash(psw, saltRounds, function(err, hash) {
      if (err) {
        console.error('Erreur lors du hachage du mot de passe:', err.message);
        return res.status(500).send("Erreur lors de la mise à jour du mot de passe.");
      }
      updateUser(email, hash, firstname, lastname, username, res);
    });
  } else {
    // Pas de mise à jour de mot de passe demandée
    updateUser(email, null, firstname, lastname, username, res);
  }
});



function updateUser(email, hashedPsw, firstname, lastname, username, res) {
  let sql = `UPDATE utilisateurs SET 
              email = COALESCE(?,email), 
              psw = COALESCE(?,psw), 
              firstname = COALESCE(?,firstname), 
              lastname = COALESCE(?,lastname) 
            WHERE username = ?`;
  let params = [email, hashedPsw, firstname, lastname, username];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Erreur lors de la mise à jour de l’utilisateur:', err.message);
      res.json({ message: `Erreur lors de la mise à jour de l'utilisateur ${username}.` });
      return res.status(500).send("Erreur lors de la mise à jour de l'utilisateur.");
    }
    if (this.changes > 0) {
      console.log(`Utilisateur ${username} mis à jour.`);
      //res.send(`Utilisateur ${username} mis à jour.`);
      res.json({ message: `Utilisateur ${username} mis à jour.` });

    } else {
      console.log(`Utilisateur ${username} non trouvé.`);
      //res.status(404).send("Utilisateur non trouvé.");
      res.json({ message: `Utilisateur ${username} non trouvé.` });
    }
  });
}

const port = 3000; // Utilisez le port de votre choix
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
