const express = require("express");
const jwt = require('jsonwebtoken');
const userRouter = express.Router();

// Pour importer le fichier employees
const employeeData = require('../employees.json');











//un route post pour verifier l'authentification 
userRouter.post("/login", (req, res) => {
    const { email, password } = req.body;

    // Vérifiez l'authentification de l'utilisateur
    const user = employeeData.employees.find(employee=>employee.motDePasse==password );
  
    if (user) {
      const token = jwt.sign({ userId:user.id}, secretKey, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Authentification échouée' });
    }
  });











module.exports = userRouter;