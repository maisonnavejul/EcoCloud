// Assurez-vous que ces lignes sont dans votre fichier pour initialiser Express et votre base de données
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

const app = express();
app.use(bodyParser.json()); // Pour parser les corps des requêtes en JSON

app.post('/login', (req, res) => {
  const { usurname, psw } = req.body;
  console.log("here")
  
  db.get(`SELECT * FROM utilisateurs WHERE usurname = ?`, [usurname], (err, user) => {
    if (err) {
      return res.status(500).send("Erreur serveur.");
    }
    if (!user) {
      return res.status(404).send("Utilisateur non trouvé.");
    }
    bcrypt.compare(psw, user.psw, (err, result) => {
      if (err) {
        console.log('Erreur lors de la comparaison des mots de passe:', err);
        return res.status(500).send("Erreur serveur.");
      }
      if (result) {
        console.log("Connexion réussie!");
        res.send("Connexion réussie!");
      } else {
        console.log("Mot de passe incorrect.");
        res.status(401).send("Mot de passe incorrect.");
      }
    });    
  });
});

const port = 3000; // Utilisez le port de votre choix
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
