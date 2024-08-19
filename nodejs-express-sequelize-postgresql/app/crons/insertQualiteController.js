const axios = require("axios");
const execQuery = require("../controllers/executeQuery_controller");
const poolGpao = require("../config/db.configpgGpao")
const fetchData = require("./webserviceController");
const poolAq = require("../config/db.configAq")
const pool = require("../config/db.config");


const now_moins_un = "SELECT TO_CHAR(CURRENT_DATE - INTERVAL '1 day', 'YYYY-MM-DD') AS date_hier";

pool.query(now_moins_un, [], function (err, result) {
  if (err) {
    res.status(400).send(err);
  }
  if (Object.keys(result).length > 0) {
    poolGpao.query(
      "select distinct id_ligne, lib_ligne as libelle from geo.vue_activite_geo where id_type_operation='6'",
      // "select distinct id_ligne from geo.vue_activite_geo where id_type_operation='6'",
      [],
      async function (err, result_ligne) {
        if (Object.keys(result_ligne).length > 0) {
          // const list_ligne = removePropertyLigne(result_ligne.rows);
          const list_ligne = result_ligne.rows;

          const date_hier = result.rows[0].date_hier

          const recup30joursSql = `
            SELECT to_char(date_sequence, 'YYYY-MM-DD') as formatted_date
            FROM generate_series(
                DATE '${date_hier}' - INTERVAL '30 days',
                DATE '${date_hier}',
                INTERVAL '1 day'
            ) AS date_sequence;
          `;

          const resInterval = await execQuery.executeQuery(pool, recup30joursSql)
          resInterval.reverse()


          let matricules
          for (let i = 0; i < resInterval.length; i++) {
            const date = resInterval[i].formatted_date;
            //matricules = await getMatriculeAq()
            getDataQualite(date, list_ligne, matricules)
          }

          // getDataQualite('2023-09-30', list_ligne)
          // getDataQualite('2023-09-18', list_ligne)
          // getDataQualite('2023-09-19', list_ligne)
          // getDataQualite('2023-09-20', list_ligne)
          // getDataQualite('2023-09-21', list_ligne)
          // getDataQualite('2023-09-22', list_ligne)
          // getDataQualite('2023-09-23', list_ligne)
          // getDataQualite('2023-09-24', list_ligne)
        }
      }
    );
  }
});

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
async function getNumEtapeOperation(id) {
  const sqlOperation = `select num_etape from etape where id_operation = '` + id + `'`;
  const dataOperation = await execQuery.executeQuery(poolGpao, sqlOperation);
  return dataOperation[0].num_etape
}

async function getMatricule() {
  const getMatriculeSql = `SELECT DISTINCT(matricule), nom, prenom FROM performance_individuelle`
  return await execQuery.executeQuery(pool, getMatriculeSql)
}
async function getMatriculeAq(id_ligne, id_plan, id_fonction, id_operation, date) {
  const getMatriculeSql = `SELECT DISTINCT(intervenant) FROM extrac_bq where id_ligne = '` + id_ligne + `' and id_plan = '` + id_plan + `' and id_fonction = '` + id_fonction + `' and etape_de_controle = '` + id_operation + `' and date_controle = '` + date + `'`;
  return await execQuery.executeQuery(poolAq, getMatriculeSql)
}

const selectDataQualite = async (date, id_ligne, id_plan, id_fonction, matricule) => {

  const recup_qualite_query = `SELECT * FROM param_qi WHERE id_ligne = '${id_ligne}' and id_plan = '${id_plan}' and controle_finale = 1 limit 1`

  const res = await execQuery.executeQuery(poolGpao, recup_qualite_query)

  const etape_de_controle = res.length > 0 ? res[0].etape_de_controle : ''

  const getVolumeControleSql = `
    SELECT 
      intervenant, date_controle, SUM(quantite) AS somme_quantites, 
      SUM(quantite) AS somme_quantites, SUM(CAST(REPLACE(faute_pondere, ',', '.') AS numeric)) AS somme_fautes
    FROM extrac_bq
    WHERE
      id_ligne = '${id_ligne}' 
      AND id_plan = '${id_plan}' 
      AND id_fonction = '${id_fonction}' 
      AND etape_de_controle = '${etape_de_controle}'
      AND intervenant = '${matricule}'
      AND date_controle = '${date}'
      AND frequence != ''
      AND faute_pondere <> ''
    GROUP BY intervenant, date_controle;
  `

  const resVolume = await execQuery.executeQuery(poolAq, getVolumeControleSql)

  if (Object.keys(resVolume).length > 0) {
    // creation d'une nouvelle clé taux_nc dans resVolume

    // console.log(resVolume)
    resVolume[0].taux_nc = resVolume[0].somme_fautes / resVolume[0].somme_quantites
    return resVolume
  } else {
    return [
      {
        intervenant: null,
        date_controle: `${date}`,
        somme_quantites: '-',
        somme_fautes: '-',
        faute_pondere: '-',
        taux_nc: 0
      }
    ]
  }
}

// async function getDataQualite(date, list_ligne, matricules) {
async function getDataQualite(date, list_ligne, matricules) {

  /*const data = await fetchData(date);
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
              // var volume = operation[o].quantite;

              const qualite = await selectDataQualite(date, id_ligne, id_plan, id_fonction, matricule)
              
              if (qualite !== null) {
                console.log(qualite)
                let volume_controle = qualite[0].somme_quantites 
                let nb_faute_pondere = qualite[0].somme_fautes 
                let taux_nc = qualite[0].taux_nc 

                const si_existe = "select * from qualite_individuelle where id_ligne = '" + id_ligne + "' and  id_plan = '" + id_plan + "' and  id_fonction = '" + id_fonction + "' and  id_operation = '" + id_operation + "'   and  date_recup = '" + date + "'";
                const req_existe = await execQuery.executeQuery(pool, si_existe);
                
                if (Object.keys(req_existe).length > 0) {
                  var inserReq = `
                    INSERT INTO qualite_individuelle(id_ligne,  libelle_ligne,  id_plan,  libelle_plan,  id_fonction,  libelle_fonction,  id_operation,  libelle_operation,  matricule, nom , prenom, volume_controle, nb_faute_pondere, taux_nc, date_recup)
                    VALUES ('${id_ligne}', '${nom_ligne}', '${id_plan}', '${nom_plan}', '${id_fonction}', '${nom_fonction}', '${id_operation}', '${nom_operation}', '${matricule}', '${nom}', '${prenom}', '${volume_controle}', '${nb_faute_pondere}', ${taux_nc}, '${date}' )
                  `              
                } else {
                  var inserReq = "insert into qualite_individuelle(id_ligne,  libelle_ligne,  id_plan,  libelle_plan,  id_fonction,  libelle_fonction,  id_operation,  libelle_operation, matricule, nom , prenom, volume_controle, nb_faute_pondere, taux_nc, date_recup) values ('" + id_ligne + "',  '" + nom_ligne + "',  '" + id_plan + "',  '" + nom_plan + "',  '" + id_fonction + "',  '" + nom_fonction + "',  '" + id_operation + "',  '" + nom_operation + "',  '" + matricule + "', '" + nom + "', '" + prenom + "',  '" + volume_controle + "' ,  '" + nb_faute_pondere + "'  ,  '" + taux_nc + "'  ,  '" + date + "' )";
                }
                
                pool.query(inserReq, []);
              }
            }
          }
        }
      }
    }
  }
  console.log("terminé");*/

  // *** Sans webjips ***

  var ligne = list_ligne;
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
            var num_etape = await getNumEtapeOperation(id_operation);
            var nom_operation = operation[o].libelle;
            var matricules = await getMatriculeAq(id_ligne, id_plan, id_fonction, num_etape, date)
            // var matricules = await getMatriculeAq('035','4822','4822','75','2023-10-03')


            for (let i = 0; i < matricules.length; i++) {
              const matricule = matricules[i].intervenant;
              const nom = matricules[i].nom
              const prenom = matricules[i].prenom

              const qualite = await selectDataQualite(date, id_ligne, id_plan, id_fonction, matricule)


              if (qualite !== null) {
                // console.log(qualite)

                // console.log("insertion en cours")

                let volume_controle = qualite[0].somme_quantites
                let nb_faute_pondere = qualite[0].somme_fautes
                let taux_nc = qualite[0].taux_nc

                const si_existe = "select * from qualite_individuelle where id_ligne = '" + id_ligne + "' and  id_plan = '" + id_plan + "' and  id_fonction = '" + id_fonction + "' and  id_operation = '" + id_operation + "'   and  date_recup = '" + date + "' and matricule = '" + matricule + "'";
                const req_existe = await execQuery.executeQuery(pool, si_existe);


                var inserReq = ""
                if (Object.keys(req_existe).length > 0) {
                  // console.log('update')

                  inserReq = `
                  INSERT INTO qualite_individuelle(id_ligne,  libelle_ligne,  id_plan,  libelle_plan,  id_fonction,  libelle_fonction,  id_operation,  libelle_operation,  matricule, nom , prenom, volume_controle, nb_faute_pondere, taux_nc, date_recup)
                  VALUES ('${id_ligne}', '${nom_ligne}', '${id_plan}', '${nom_plan}', '${id_fonction}', '${nom_fonction}', '${id_operation}', '${nom_operation}', '${matricule}', '${nom}', '${prenom}', '${volume_controle}', '${nb_faute_pondere}', ${taux_nc}, '${date}' )
                  `
                } else {
                  // console.log('insert')
                  inserReq = "insert into qualite_individuelle(id_ligne,  libelle_ligne,  id_plan,  libelle_plan,  id_fonction,  libelle_fonction,  id_operation,  libelle_operation, matricule, nom , prenom, volume_controle, nb_faute_pondere, taux_nc, date_recup) values ('" + id_ligne + "',  '" + nom_ligne + "',  '" + id_plan + "',  '" + nom_plan + "',  '" + id_fonction + "',  '" + nom_fonction + "',  '" + id_operation + "',  '" + nom_operation + "',  '" + matricule + "', '" + nom + "', '" + prenom + "',  '" + volume_controle + "' ,  '" + nb_faute_pondere + "'  ,  '" + taux_nc + "'  ,  '" + date + "' )";
                }
                console.log(inserReq)
                pool.query(inserReq, []);
              }
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
