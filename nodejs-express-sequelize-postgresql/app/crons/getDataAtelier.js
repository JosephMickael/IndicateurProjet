const { range } = require("rxjs");
const execQuery = require("../controllers/executeQuery_controller");
const pool = require("../config/db.config");
const poolGpao = require("../config/db.configpgGpao")
const fetchData = require("./webserviceController");
const acceuil = require("../controllers/accueil_controller")


poolGpao.query(
  "select distinct id_ligne, lib_ligne as libelle from geo.vue_activite_geo where id_type_operation='6'",
  [],
  function (err, result_ligne) {
    if (Object.keys(result_ligne).length > 0) {
      const list_ligne = result_ligne.rows;

      // console.log(list_ligne); 

      // insertAtelier('', list_ligne)                              
      //insertAtelier("2023-09-01",list_ligne)                              

      insertAtelier("2023-09-09", list_ligne)
      insertAtelier("2023-09-10", list_ligne)
      insertAtelier("2023-09-11", list_ligne)
      insertAtelier("2023-09-12", list_ligne)
      insertAtelier("2023-09-13", list_ligne)
      insertAtelier("2023-09-14", list_ligne)
      insertAtelier("2023-09-15", list_ligne)
      // insertAtelier("2023-09-15", list_ligne)
      // insertAtelier("2023-09-15", list_ligne)
      // insertAtelier("2023-09-15", list_ligne)
      // insertAtelier("2023-09-15", list_ligne)
      // insertAtelier("2023-09-15", list_ligne)
      // insertAtelier("2023-09-15", list_ligne)
      // insertAtelier("2023-09-15", list_ligne)
      // insertAtelier("2023-09-15", list_ligne)
      // insertAtelier("2023-09-15", list_ligne)
      // insertAtelier("2023-09-15", list_ligne)
      // insertAtelier("2023-09-15", list_ligne)
      // insertAtelier("2023-09-15", list_ligne)
      // insertAtelier("2023-09-15", list_ligne)
      // insertAtelier("2023-09-15", list_ligne)
      // insertAtelier("2023-09-15", list_ligne)







    }
  }
);

async function getDataAtelier(date, id_ligne, id_plan, id_fonction, id_operation) {
  const select_query = ` 
      SELECT
      date_recup, SUM(temps) AS temps, SUM(volume)  AS volume  
      FROM performance_individuelle
      WHERE 
      id_ligne = '${id_ligne}' 
      AND id_plan = '${id_plan}' 
      AND id_fonction = '${id_fonction}'
      AND id_operation = '${id_operation}'
      AND date_recup = '${date}'
      GROUP BY date_recup
    `
  const results = await execQuery.executeQuery(pool, select_query)
  // console.log(results);
  if (Object.keys(results).length > 0) {
    results[0].cadence = results[0].volume / results[0].temps
    // console.log(results);
    return results
  } else {
    return [
      {
        date_recup: `${date}`,
        temps: 0,
        volume: 0,
        cadence: 0
      }
    ]
  }
}

// getDataAtelier()

async function getPlan(id_ligne) {
  const sqlPlan = `select distinct lib_plan as libelle,id_plan from geo.vue_activite_geo where id_ligne= '${id_ligne}' and id_type_operation='6' and lib_plan<>'MIS' order by libelle`
  const dataPlan = await execQuery.executeQuery(poolGpao, sqlPlan)
  // console.log(dataPlan); 
  return dataPlan
}

async function getFonction(id_ligne, id_plan) {
  const sqlFonction = `select distinct lib_fonction as libelle,id_fonction from geo.vue_activite_geo where id_ligne= '${id_ligne}' and id_plan = '${id_plan}' and id_type_operation='6' and lib_plan<>'MIS' order by libelle`
  const dataFonction = await execQuery.executeQuery(poolGpao, sqlFonction);
  return dataFonction
}
async function getOperation(id_ligne, id_plan, id_fonction) {
  const sqlOperation = `select distinct lib_operation as libelle,id_operation from geo.vue_activite_geo where id_ligne= '${id_ligne}' and id_plan = '${id_plan}'and id_fonction ='${id_fonction}' and id_type_operation='6' and lib_plan<>'MIS' order by libelle`
  const dataOperation = await execQuery.executeQuery(poolGpao, sqlOperation);
  return dataOperation
}


async function insertAtelier(date, list_ligne) {


  var ligne = list_ligne;
  // console.log(ligne);   

  for (let l = 0; l < ligne.length; l++) {
    // console.log(typeof ligne[l])
    if (list_ligne.includes(ligne[l])) {
      var id_ligne = ligne[l].id_ligne;
      var nom_ligne = ligne[l].libelle;

      var plan = await getPlan(id_ligne);
      // console.log(plan);

      for (let p = 0; p < plan.length; p++) {
        var id_plan = plan[p].id_plan;
        var nom_plan = plan[p].libelle;
        var fonction = await getFonction(id_ligne, id_plan)
        // console.log(fonction)
        for (let f = 0; f < fonction.length; f++) {
          var id_fonction = fonction[f].id_fonction;
          var nom_fonction = fonction[f].libelle;
          var operation = await getOperation(id_ligne, id_plan, id_fonction)
          // console.log(operation);
          for (let o = 0; o < operation.length; o++) {
            var id_operation = operation[o].id_operation;
            var nom_operation = operation[o].libelle;

            const response = await getDataAtelier(date, id_ligne, id_plan, id_fonction, id_operation)

            // console.log(response);
            if (response !== null) {
              // console.log(qualite)
              let volume = response[0].volume
              let temps = response[0].temps
              let cadence = response[0].cadence;

              const si_existe = "select * from performance_atelier where id_ligne = '" + id_ligne + "' and  id_plan = '" + id_plan + "' and  id_fonction = '" + id_fonction + "' and  id_operation = '" + id_operation + "'   and  date_recup = '" + date + "'";
              const req_existe = await execQuery.executeQuery(pool, si_existe);

              if (Object.keys(req_existe).length > 0) {
                var inserReq = "update performance_atelier set  volume = " + volume + ",  temps = " + temps + ",  cadence = " + cadence + " where id_ligne = '" + id_ligne + "' and  id_plan = '" + id_plan + "' and  id_fonction = '" + id_fonction + "' and  id_operation = '" + id_operation + "'   and  date_recup = '" + date + "'";
              } else {
                var inserReq = "insert into performance_atelier(id_ligne,  libelle_ligne,  id_plan,  libelle_plan,  id_fonction,  libelle_fonction,  id_operation,  libelle_operation, volume,temps,cadence, date_recup) values ('" + id_ligne + "',  '" + nom_ligne + "',  '" + id_plan + "',  '" + nom_plan + "',  '" + id_fonction + "',  '" + nom_fonction + "',  '" + id_operation + "',  '" + nom_operation + "',  " + volume + "," + temps + "," + cadence + ",  '" + date + "' )";
              }
              console.log(inserReq)
              pool.query(inserReq, []);
              // Effectuer les actions nécessaires avec la réponse
            }
          }
        }
      }
    }
  }

  // startDate.setTime(startDate.getTime() + dayInMilliseconds);
  // console.log(startDate)
  // }
  console.log("insert terminée");
}

const removePropertyLigne = (arrayLigne) => {
  var liste = [];
  for (let index = 0; index < arrayLigne.length; index++) {
    liste.push(arrayLigne[index].id_ligne);
  }
  return liste;
};

