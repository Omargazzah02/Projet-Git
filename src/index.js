

/*  La configuration de mon application  */


const express = require("express");

const app = express();



const { z, array } = require('zod');

const port = 8080;


app.use(express.json());

const jwt = require('jsonwebtoken');


/*  Key secret de mon JWT */

const secretKey = 'seckey123';

/*  les routes autorisé  */
const RoutesPublic = ['/','/login','/inscrire'];

















/*  une methode d'authentification pour verifier le code JWT  */
const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ error: 'Authentification requise' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'JWT invalide' });
    }

    req.userId = decoded.userId;
    next();
  });
};







/* une méthode pour bloquer toutes les requetes non autorisé  */
app.use((req, res, next) => {
  if (RoutesPublic.includes(req.path)) {
    next();
  } else {
    authenticateJWT(req, res, next);
  }
});

















/*  Route login pour récuperer le JWT   */
app.post("/login", (req, res) => {
  const { pseudo, password } = req.body;

  const user = users.find(u=>u.password==password  && u.pseudo==pseudo);
  if (user) {
    const token = jwt.sign({ userId:user.id}, secretKey, { expiresIn: '12h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Authentification échouée' });
  }
});
































/*   Partie API user */

/*  créer le tableau user   */
users=[
  {
  "id": 1,
  "pseudo": "SuperFan123",
  "password": "password123"
  },
  {
  "id": 2,
  "pseudo": "HeroWatcher456",
  "password": "password456"
  }
  ];

/* Déterminer le dernier id de tableau user  */
let IdLast=users.length;



















/*  ajouter un user  */
app.post('/inscrire',(req,res)=>{
 let {pseudo,password} =req.body;


let  Nbunique = Math.floor(Math.random() * 900) + 100;
     pseudo=pseudo+" "+Nbunique;
     
       IdLast++;
       users.push({id:IdLast,pseudo:pseudo,password:password});
  res.send('vous venez de créer un compte')

}

)

















/*  afficher un user en utilisant le id  */
app.get("/get-user/:id",(req,res)=>{
  const user=users.find(u=>u.id==req.params.id)

  if (user){
    res.send(user);

  }
  else   {
    res.send("Fausse Id")

    }
})
























/*   end user */
 





//les routes de critique 


const  critiques=[];
//definir le id de table critique
let lastIdc=critiques.length;
//ajouter critique
app.post('/add-critique/:auteur_id', (req, res) => {
  const { titre, critique, date, likes, comments } = req.body;
  const auteur_id = req.params.auteur_id;
  const user = users.find(u => u.id == auteur_id);

  if (user && titre != null && critique != null && date != null && likes != null && comments != null) {
    const nbcritique = critique.length;

    if (nbcritique < 50 || nbcritique > 500) {
      res.send("Le critique doit être ni trop court ni trop long!");
    } else {
      const id_critique = ++lastIdc;

      critiques.push({ id_critique, titre, critique, auteur_id, date, likes, comments });
      res.send('Vous venez d\'ajouter une critique');
    }
  } else {
    res.send('Vérifiez vos données');
  }
});




// un route pour lister les critiques
app.get('/get-critiques/', (req, res) => {
  let Arrayfilter = critiques;  

  if (req.query.titre) {
    Arrayfilter = Arrayfilter.filter(c => c.titre == req.query.titre);
  }

  if (req.query.nomauteur) {
    const user = users.find(e => e.pseudo == req.query.nomauteur);
    Arrayfilter = Arrayfilter.filter(c => c.auteur_id == user.id);

  }

  const result = Arrayfilter.map(({ id_critique, titre, critique, auteur_id }) => ({ id: id_critique, titre, critique, nomauteur: users.find(u => u.id == auteur_id).pseudo }));

  res.json(result);
});




// un route pour lister critique d'un user





app.get('/api/users/:id/critique',(req,res)=>{

const filter_critique= critiques.filter(c=> c.auteur_id == req.params.id);
res.send(filter_critique);
})






// pour supprimer critique 


app.delete('/delete-critique/:id', authenticateJWT, (req, res) => {
  const critiqueId = req.params.id;
  const userId = req.userId; 

  const index = critiques.findIndex(c => c.id_critique == critiqueId);

  if (index !== -1) {
    const critique = critiques[index];

    if (critique.auteur_id === userId) {
      critiques.splice(index, 1);
      res.send('Vous avez supprimé une critique avec succès.');
    } else {
      res.status(403).send('Vous n\'êtes pas autorisé à supprimer cette critique.');
    }
  } else {
    res.status(404).send('La critique n\'existe pas.');
  }
});






app.put('/update-critique/:id', authenticateJWT, (req, res) => {
  const critiqueId = req.params.id;
  const userId = req.userId; 

  const index = critiques.findIndex(c => c.id_critique == critiqueId);

  if (index !== -1) {
    const critique = critiques[index];

    if (critique.auteur_id === userId) {
      const oldCritique = { ...critique }; 

      const { titre, critique: newCritique, date, likes, comments } = req.body;
      critique.titre = titre || critique.titre;
      critique.critique = newCritique || critique.critique;
      critique.date = date || critique.date;
      critique.likes = likes || critique.likes;
      critique.comments = comments || critique.comments;

      const modifiedFields = Object.keys(req.body);
      const totalFields = Object.keys(critique).length;
      const modificationPercentage = (modifiedFields.length / totalFields) * 100;

      if (modificationPercentage < 30) {
        critiques[index] = oldCritique;
        res.status(400).send('La modification est inférieure à 30%. La critique n\'a pas été modifiée.');
      } else {
        res.send('La critique a été modifiée avec succès.');
      }
    } else {
      res.status(403).send('Vous n\'êtes pas autorisé à modifier cette critique.');
    }
  } else {
    res.status(404).send('La critique n\'existe pas.');
  }
});







































// Lancer le serveur
app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});