#!/usr/bin/env node
const axios = require("axios");
const pool = require("../config/db.config");
const execQuery = require("../controllers/executeQuery_controller");
const fetchData = require("./webserviceController");
const poolGPAO = require("../config/db.configpgGpao");
// const perfAtelier = require("./getDataAtelier_controller"); 

//si utilisation non route
const now_moins_un = "SELECT TO_CHAR(CURRENT_DATE - INTERVAL '1 day', 'YYYY-MM-DD') AS date_hier";

pool.query(now_moins_un, [], function (err, result) {
  if (err) {
    res.status(400).send(err);
  }
  if (Object.keys(result).length > 0) {
    poolGPAO.query(
      "select distinct id_ligne from geo.vue_activite_geo where id_type_operation='6'",
      [],
      function (err, result_ligne) {
        if (Object.keys(result_ligne).length > 0) {
          const list_ligne = removePropertyLigne(result_ligne.rows);

          // perfAtelier.insertAtelier
          //getDAta(result.rows[0].date_hier, list_ligne);                                                                                                                                                                    
          getDAta("2023-10-02",list_ligne);
          getDAta("2023-10-03",list_ligne);
          getDAta("2023-10-04",list_ligne);
          getDAta("2023-10-05",list_ligne);
          getDAta("2023-10-06",list_ligne);
          getDAta("2023-10-07",list_ligne);
          getDAta("2023-10-08",list_ligne);
        }
      }
    );
  }
});

async function getDAta(date, list_ligne) {

  const data = await fetchData(date);
  var perso = data.cgu_site[0].personnel.personne;

  for (let index = 0; index < perso.length; index++) {
    var matricule = perso[index].id;
    var nom = perso[index].nom;
    var prenom = perso[index].prenom;
    var ligne = perso[index].ligne;
    for (let l = 0; l < ligne.length; l++) {
      if (list_ligne.includes(ligne[l].id)) {
        var id_ligne = ligne[l].id;
        var nom_ligne = ligne[l].libelle;
        var plan = ligne[l].plan;
        for (let p = 0; p < plan.length; p++) {
          var id_plan = plan[p].id;
          var nom_plan = plan[p].libelle;
          var fonction = plan[p].fonction;
          for (let f = 0; f < fonction.length; f++) {
            var id_fonction = fonction[f].id;
            var nom_fonction = fonction[f].libelle;
            var operation = fonction[f].operation;
            for (let o = 0; o < operation.length; o++) {
              var id_operation = operation[o].id;
              var nom_operation = operation[o].libelle;
              var temps = operation[o].temps;
              var volume = operation[o].quantite;
              var cadence = operation[o].cadence_realise;

              //si existe
              const si_existe = "select * from performance_individuelle where id_ligne = '" + id_ligne + "' and  id_plan = '" + id_plan + "' and  id_fonction = '" + id_fonction + "' and  id_operation = '" + id_operation + "' and  matricule = '" + matricule + "'  and  date_recup = '" + date + "'";
              const req_existe = await execQuery.executeQuery(pool, si_existe);
              
              if(Object.keys(req_existe).length > 0){                                           
                var inserUpdateReq = "update performance_individuelle set  temps = " + temps + ",  volume = " + volume + ",  cadence = " + cadence + " where id_ligne = '" + id_ligne + "' and  id_plan = '" + id_plan + "' and  id_fonction = '" + id_fonction + "' and  id_operation = '" + id_operation + "' and  matricule = '" + matricule + "'  and  date_recup = '" + date + "'";
              }else{                
                var inserUpdateReq = "insert into performance_individuelle(id_ligne,  libelle_ligne,  id_plan,  libelle_plan,  id_fonction,  libelle_fonction,  id_operation,  libelle_operation,  matricule,nom , prenom,  temps,  volume,  cadence, date_recup) values ('" + id_ligne + "',  '" + nom_ligne + "',  '" + id_plan + "',  '" + nom_plan + "',  '" + id_fonction + "',  '" + nom_fonction + "',  '" + id_operation + "',  '" + nom_operation + "',  '" + matricule + "','" + nom + "','" + prenom + "',  " + temps + ",  " + volume + ",  " + cadence + ",'" + date + "' )";
              }
              console.log(inserUpdateReq)
              pool.query(inserUpdateReq, []);              
            }
          }
        }
      }
    }
  }
  
  console.log("insert terminée");
}



const removePropertyLigne = (arrayLigne) => {
  var liste = [];
  for (let index = 0; index < arrayLigne.length; index++) {
    liste.push(arrayLigne[index].id_ligne);
  }
  return liste;
};

//execution sans crons tab mais avec url dans postman  // si utilisation route
// module.exports = {
//   getDAta
// }
