// Assurez-vous que ces lignes sont dans votre fichier pour initialiser Express et votre base de données
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const cors = require('cors');
const upload = multer({ dest: 'uploads/' }); // Dossier de destination pour les fichiers téléversés

const db = new sqlite3.Database('./database.db');

const app = express();
app.use(cors());
app.use(bodyParser.json()); // Pour parser les corps des requêtes en JSON
const saltRounds = 10; // Ajoutez cette ligne pour définir saltRounds

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

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.send('File uploaded successfully.');
});


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
      return res.status(500).send("Erreur lors de la mise à jour de l'utilisateur.");
    }
    if (this.changes > 0) {
      console.log(`Utilisateur ${username} mis à jour.`);
      res.send(`Utilisateur ${username} mis à jour.`);
    } else {
      console.log(`Utilisateur ${username} non trouvé.`);
      res.status(404).send("Utilisateur non trouvé.");
    }
  });
}




const port = 3000; // Utilisez le port de votre choix
app.listen(port, () => {
  console.log(`Serveur démarré sur http://10.224.0.83:${port}`);
});
