const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

const fs = require('fs');

const saltRounds = 10;

// Connexion à la base de données (le fichier est créé s'il n'existe pas)
const db = new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Erreur lors de la connexion à la base de données :', err.message);
  } else {
    console.log('Connecté à la base de données SQLite.');
    initDB();
  }
});

// Initialisation de la base de données
function initDB() {
    db.run(`CREATE TABLE IF NOT EXISTS utilisateurs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NULL,
      psw TEXT NULL, 
      firstname TEXT NULL,
      lastname TEXT NULL,
      username TEXT NOT NULL DEFAULT 'login',
      is_admin BOOLEAN NOT NULL DEFAULT TRUE
    )`, (err) => {
      if (err) {
        console.error('Erreur lors de la création de la table utilisateurs :', err.message);
      } else {
        console.log('Table utilisateurs créée avec succès ou déjà existante.');
        insererUtilisateurDefaut();
      }
    });
  }
  
  function insererUtilisateurDefaut() {
    const email = null;
    const psw = "ecocloud"; // Ceci est un exemple, dans la pratique, vous stockerez les hash du mot de passe
    const firstname = null;
    const lastname = null; // Ajouté, vous pouvez remplacer null par une valeur par défaut si nécessaire
    const username = "login";
    const is_admin = true;
  
    bcrypt.hash(psw, saltRounds, function(err, hash) {
        if (err) {
            console.log('Erreur lors du hachage du mot de passe par défaut:', err.message);
            return;
        }
        db.run(`INSERT INTO utilisateurs (email, psw, firstname, lastname, username, is_admin) SELECT ?, ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM utilisateurs WHERE email = ?)`, 
               [email, hash, firstname, lastname, username, is_admin, email], function(err) {
            if (err) {
                console.log('Erreur lors de l’insertion de l’utilisateur par défaut:', err.message);
            } else if (this.changes > 0) {
                console.log('Utilisateur par défaut inséré.');
            } else {
                console.log('Utilisateur par défaut déjà existant.');
            }
        });
    });
}

function ajouterUtilisateur({ email, psw, firstname, lastname, username = 'login', is_admin = false }, callback) {
    bcrypt.hash(psw, saltRounds, (err, hash) => {
      if (err) {
        console.error('Erreur lors du hachage du mot de passe:', err.message);
        return callback(err);
      }
      db.run(`INSERT INTO utilisateurs (email, psw, firstname, lastname, username, is_admin) VALUES (?, ?, ?, ?, ?, ?)`,
        [email, hash, firstname, lastname, username, is_admin], function(err) {
          if (err) {
            console.error('Erreur lors de l’insertion de l’utilisateur:', err.message);
            return callback(err);
          }
          console.log(`Utilisateur ajouté avec succès: ${this.lastID}`);
          callback(null, { userId: this.lastID });
        });
    });
  }
  
  const upload = multer({ storage: storage });

  
  

  module.exports = { initDB, ajouterUtilisateur };