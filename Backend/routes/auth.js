const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// Middleware pour valider les entrées
const validateInputs = (req, res, next) => {
  const { email, password, username } = req.body;
  if (req.path === "/login" && (!email || !password)) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }
  if (req.path === "/register" && (!email || !password || !username)) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }
  next();
};

// Route de connexion
router.post("/login", validateInputs, async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    // Mise à jour du `last_login`
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, role: user.role });
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route d'inscription
router.post("/register", validateInputs, async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "L'email est déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, "User"]
    );

    const userId = result.insertId;
    const token = jwt.sign(
      { id: userId, email, role: "User" },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ message: 'Utilisateur créé avec succès', token });
  } catch (error) {
    console.error('Erreur lors de l\'inscription :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
