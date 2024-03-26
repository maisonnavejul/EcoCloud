const express = require('express');
const { initDB, ajouterUtilisateur } = require('./database');

const app = express();
const port = 3000;

// Initialisation de la base de données
initDB();

// Middleware pour parser le corps des requêtes en JSON
app.use(express.json());

// Route pour l'inscription d'un nouvel utilisateur
app.post('/signup', (req, res) => {
  ajouterUtilisateur(req.body, (err, result) => {
    if (err) {
      res.status(500).send("Erreur lors de l'inscription de l'utilisateur.");
      return;
    }
    res.send(result);
  });
});

app.post('/login', (req, res) => {
  const { email, psw } = req.body;
  
  db.get(`SELECT * FROM utilisateurs WHERE email = ?`, [email], (err, row) => {
    if (err) {
      res.status(500).send("Erreur lors de la récupération de l'utilisateur.");
      return;
    }
    if (row) {
      bcrypt.compare(psw, row.psw, (err, result) => {
        if (result) {
          res.send({ message: "Connexion réussie!" });
        } else {
          res.status(401).send({ message: "Mot de passe incorrect!" });
        }
      });
    } else {
      res.status(404).send({ message: "Utilisateur non trouvé." });
    }
  });
});

// Route d'accueil
app.get('/', (req, res) => {
  res.send('Bonjour depuis ExpressJS!');
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`L'application écoute sur le port ${port}`);
});
