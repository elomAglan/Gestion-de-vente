const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const authRoutes = require("./routes/auth"); // Import des routes d'authentification
const router = express.Router();

const app = express();

// Charger les variables d'environnement
dotenv.config();

// Configuration de CORS pour permettre les requêtes depuis l'application frontend
app.use(cors({
  origin: "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
}));

// Middleware pour analyser le corps des requêtes JSON
app.use(express.json());

// Configuration de la connexion à la base de données
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Création d'un pool de connexions MySQL
const dbPool = mysql.createPool(dbConfig);

// Test de la connexion au démarrage de l'application
dbPool.getConnection()
  .then(connection => {
    console.log("Connecté à la base de données MySQL avec succès !");
    connection.release(); // Libérer la connexion immédiatement
  })
  .catch(err => {
    console.error("Erreur lors de la connexion à la base de données :", err);
    process.exit(1); // Quitter l'application en cas d'erreur critique
  });

module.exports = dbPool; // Exporter le pool pour l'utiliser ailleurs


// Middleware pour vérifier le token d'authentification
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Non autorisé' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    console.error('Erreur lors de la vérification du token:', err);
    return res.status(403).json({ message: 'Token invalide' });
  }
};

app.get('/api/auth/validate', verifyToken, (req, res) => {
  const userRole = req.user.role; // Le rôle de l'utilisateur doit être dans le payload du token
  if (!userRole) {
    return res.status(400).json({ message: 'Rôle de l\'utilisateur introuvable' });
  }
  res.json({ role: userRole }); // Répond avec le rôle de l'utilisateur
});

// Utilisation des routes d'authentification
app.use("/api/auth", authRoutes);

app.get('/api/utilisateurs', async (req, res) => {
  try {
    console.log('Requête reçue sur /api/utilisateurs');
    const db = await dbPool;
    const [results] = await db.query('SELECT id, username, email, role FROM users');
    res.json(results);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});



// Route pour obtenir le profil de l'utilisateur actuel (requiert une authentification)
app.get('/api/user/profile', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const db = await dbPool;
  try {
    const [results] = await db.query('SELECT id, username, email, profile_picture FROM users WHERE id = ?', [userId]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(results[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de l’utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour supprimer un utilisateur par ID (requiert une authentification)
app.delete('/api/utilisateurs/:id', async (req, res) => {
  const { id } = req.params;
  const db = await dbPool;
  try {
    const [results] = await db.query('DELETE FROM users WHERE id = ?', [id]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l’utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour mettre à jour le rôle d'un utilisateur (requiert une authentification)
app.put('/api/utilisateurs/:id', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ message: 'Le rôle est requis' });
  }

  const rolesValides = ['Utilisateur', 'Admin', 'Modérateur'];
  if (!rolesValides.includes(role)) {
    return res.status(400).json({ message: 'Rôle invalide' });
  }

  const db = await dbPool;
  try {
    const [results] = await db.query('SELECT role FROM users WHERE id = ?', [id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const currentRole = results[0].role;
    if (currentRole === role) {
      return res.json({ message: 'Le rôle est déjà attribué' });
    }

    const [updateResults] = await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    res.json({ message: 'Rôle mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour obtenir tous les produits
app.get("/api/produits", async (req, res) => {
  const db = await dbPool;
  try {
    const [results] = await db.query("SELECT * FROM produits");
    res.json(results);
  } catch (err) {
    console.error("Erreur lors de la récupération des produits:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route pour ajouter un nouveau produit
app.post("/api/produits", async (req, res) => {
  const { nom, prix, quantite, unite } = req.body;

  if (!nom || prix === undefined || quantite === undefined || !unite) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires" });
  }

  const db = await dbPool;
  try {
    const [result] = await db.query("INSERT INTO produits (nom, prix, quantite, unite) VALUES (?, ?, ?, ?)", [nom, prix, quantite, unite]);
    res.json({ id: result.insertId, nom, prix, quantite, unite });
  } catch (err) {
    console.error("Erreur lors de l'ajout du produit:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route pour supprimer un produit par ID
app.delete("/api/produits/:id", async (req, res) => {
  const { id } = req.params;
  const db = await dbPool;
  try {
    const [result] = await db.query("DELETE FROM produits WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }
    res.json({ message: "Produit supprimé avec succès" });
  } catch (err) {
    console.error("Erreur lors de la suppression du produit:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route pour mettre à jour la quantité d'un produit par ID
app.put('/api/produits/:id', async (req, res) => {
  const produitId = parseInt(req.params.id);
  const { quantite } = req.body;
  const db = await dbPool;

  try {
    const [result] = await db.query(
      'UPDATE produits SET quantite = ? WHERE id = ?',
      [quantite, produitId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    res.json({ message: 'Quantité mise à jour avec succès' });
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la quantité:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour obtenir tous les mouvements de stock
app.get('/api/mouvements', async (req, res) => {
  const db = await dbPool;
  try {
    const [results] = await db.query('SELECT * FROM stock');
    res.json(results);
  } catch (err) {
    console.error('Erreur lors de la récupération des mouvements:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour ajouter un mouvement de stock
app.post('/api/mouvements', async (req, res) => {
  const { produit_id, type_mouvement, quantite, fournisseur } = req.body;
  const db = await dbPool;

  try {
    const [result] = await db.query(
      'INSERT INTO stock (produit_id, type_mouvement, quantite, date_mouvement, fournisseur) VALUES (?, ?, ?, NOW(), ?)',
      [produit_id, type_mouvement, quantite, fournisseur]
    );
    res.status(201).json({ id: result.insertId, produit_id, type_mouvement, quantite, fournisseur });
  } catch (err) {
    console.error('Erreur lors de l\'ajout du mouvement:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.delete('/api/mouvements', async (req, res) => {
  const db = await dbPool;
  try {
    await db.query('DELETE FROM stock'); // Table `stock`, et non `mouvements`
    res.status(200).json({ message: 'Historique supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression des mouvements :', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'historique' });
  }
});


/// Route pour récupérer toutes les ventes
app.get('/api/ventes', async (req, res) => {
  try {
    const db = await dbPool; // Connexion à la base de données
    const [results] = await db.query(
      `SELECT v.id, p.nom AS produit, v.quantite, v.total, v.date_vente
       FROM ventes v
       JOIN produits p ON v.produit_id = p.id
       ORDER BY v.date_vente DESC`
    );
    res.json(results);
  } catch (err) {
    console.error('Erreur lors de la récupération des ventes:', err.message);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des ventes' });
  }
});

app.post('/api/ventes', async (req, res) => {
  const { ventes } = req.body;

  if (!ventes || ventes.length === 0) {
    console.log('Aucune vente reçue');
    return res.status(400).json({ message: 'Aucune vente à enregistrer' });
  }

  try {
    console.log('Connexion à la base de données...');
    const db = await dbPool.getConnection();

    console.log('Démarrage de la transaction...');
    await db.beginTransaction();

    try {
      for (let vente of ventes) {
        console.log(`Traitement de la vente pour le produit ID: ${vente.produit_id}`);

        // Vérifier si le produit existe
        const [produit] = await db.query('SELECT * FROM produits WHERE id = ?', [vente.produit_id]);
        console.log('Produit trouvé:', produit);

        if (!produit || produit.length === 0) {
          throw new Error(`Produit avec l'ID ${vente.produit_id} introuvable`);
        }

        const produitDetails = produit[0];

        // Vérifier la quantité disponible
        if (produitDetails.quantite < vente.quantite) {
          throw new Error(`Stock insuffisant pour le produit ${produitDetails.nom}`);
        }

        // Mise à jour du stock
        console.log('Mise à jour du stock...');
        await db.query('UPDATE produits SET quantite = quantite - ? WHERE id = ?', [vente.quantite, vente.produit_id]);

        // Enregistrement de la vente
        console.log('Enregistrement de la vente...');
        await db.query('INSERT INTO ventes (produit_id, quantite, total, date_vente) VALUES (?, ?, ?, ?)', [
          vente.produit_id,
          vente.quantite,
          vente.prix_total,
          new Date(),
        ]);
      }

      console.log('Validation de la transaction...');
      await db.commit();
      res.status(200).json({ message: 'Vente multiple enregistrée avec succès' });
    } catch (err) {
      console.error('Erreur pendant la transaction:', err.message);
      await db.rollback();
      res.status(400).json({ message: err.message });
    } finally {
      console.log('Libération de la connexion...');
      db.release();
    }
  } catch (err) {
    console.error('Erreur de connexion ou transaction:', err.message);
    res.status(500).json({ message: 'Erreur serveur lors de l\'enregistrement de la vente multiple' });
  }
});


// Endpoint pour récupérer un produit par son ID
app.get('/api/produits/:id', async (req, res) => {
  const { id } = req.params; // Récupérer l'ID du produit depuis les paramètres de l'URL

  try {
    const db = await dbPool; // Connexion à la base de données
    const [produit] = await db.query(
      'SELECT * FROM produits WHERE id = ?',
      [id] // Requête paramétrée pour éviter les injections SQL
    );

    if (!produit) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    res.json(produit); // Renvoyer le produit trouvé
  } catch (err) {
    console.error('Erreur lors de la récupération du produit:', err.message);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du produit' });
  }
});

app.get("/api/resume", async (req, res) => {
  try {
    const connection = await dbPool.getConnection();

    // Total des produits en stock
    const [totalProduitsEnStock] = await connection.query(
      "SELECT COUNT(*) AS count FROM produits WHERE quantite > 0"
    );

    // Produits avec moins de 10 articles
    const [produitsFaibles] = await connection.query(
      "SELECT nom, quantite FROM produits WHERE quantite < 10"
    );

    // Total des ventes du jour
    const [ventesDuJour] = await connection.query(
      "SELECT COUNT(*) AS count, COALESCE(SUM(total), 0) AS total FROM ventes WHERE DATE(date_vente) = CURDATE()"
    );

    // Deux derniers utilisateurs connectés
    const [derniersUtilisateurs] = await connection.query(
      "SELECT username, email, last_login FROM users ORDER BY last_login DESC LIMIT 2"
    );

    // Produits les plus vendus
    const [produitsPlusVendus] = await connection.query(`
      SELECT p.nom, SUM(v.quantite) AS total_ventes 
      FROM ventes v 
      JOIN produits p ON v.produit_id = p.id 
      GROUP BY v.produit_id 
      ORDER BY total_ventes DESC 
      LIMIT 5
    `);

    // Produits les moins vendus
    const [produitsMoinsVendus] = await connection.query(`
      SELECT p.nom, SUM(v.quantite) AS total_ventes 
      FROM ventes v 
      JOIN produits p ON v.produit_id = p.id 
      GROUP BY v.produit_id 
      ORDER BY total_ventes ASC 
      LIMIT 5
    `);

    const data = [
      {
        title: "Produits en Stock",
        count: totalProduitsEnStock[0].count,
        icon: "bi bi-box-seam",
        color: "info",
        details: `
          Nombre total de produits encore disponibles en stock : ${totalProduitsEnStock[0].count}
          <br/><br/>
          <strong>Produits avec moins de 10 articles en stock :</strong>
          <ul>
            ${produitsFaibles
              .map(
                (produit) =>
                  `<li>${produit.nom} : ${produit.quantite} article(s)</li>`
              )
              .join("")}
          </ul>
        `,
      },
      {
        title: "Ventes du Jour",
        count: ventesDuJour[0].count,
        icon: "bi bi-cart-check",
        color: "success",
        details: `
          Nombre total de ventes aujourd'hui : ${ventesDuJour[0].count}
          <br/><br/>
          <strong>Total des ventes (CFA) :</strong> ${ventesDuJour[0].total} CFA
        `,
      },
      {
        title: "Derniers Utilisateurs Connectés",
        count: derniersUtilisateurs.length,
        icon: "bi bi-person-circle",
        color: "primary",
        details: `
          <strong>Derniers utilisateurs connectés :</strong>
          <ul>
            ${derniersUtilisateurs
              .map(
                (user) =>
                  `<li>${user.username} (${user.email}) : ${new Date(
                    user.last_login
                  ).toLocaleString()}</li>`
              )
              .join("")}
          </ul>
        `,
      },
      {
        title: "Produits les Plus Vendus",
        count: produitsPlusVendus.length,
        icon: "bi bi-bar-chart-line",
        color: "success",
        details: `
          <strong>Top 5 des produits les plus vendus :</strong>
          <ul>
            ${produitsPlusVendus
              .map(
                (produit) =>
                  `<li>${produit.nom} : ${produit.total_ventes} vente(s)</li>`
              )
              .join("")}
          </ul>
        `,
      },
      {
        title: "Produits les Moins Vendus",
        count: produitsMoinsVendus.length,
        icon: "bi bi-bar-chart-line",
        color: "warning",
        details: `
          <strong>Top 5 des produits les moins vendus :</strong>
          <ul>
            ${produitsMoinsVendus
              .map(
                (produit) =>
                  `<li>${produit.nom} : ${produit.total_ventes || 0} vente(s)</li>`
              )
              .join("")}
          </ul>
        `,
      },
    ];

    connection.release();
    res.status(200).json(data);
  } catch (error) {
    console.error("Erreur lors de la récupération des données :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des données." });
  }
});



// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
