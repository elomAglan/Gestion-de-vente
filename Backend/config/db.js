const mysql = require("mysql2/promise"); // Utilisation de la version promise de mysql2
const dotenv = require("dotenv");

// Charger les variables d'environnement
dotenv.config();

// Créer une connexion à la base de données (pool de connexions recommandé)
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Vérifier la connexion (optionnel, surtout pour le développement)
async function testConnection() {
  try {
    const connection = await db.getConnection();
    console.log("Connecté à la base de données MySQL avec succès !");
    connection.release();
  } catch (err) {
    console.error("Erreur de connexion à la base de données :", err.message);
    process.exit(1);
  }
}

testConnection();

module.exports = db;
