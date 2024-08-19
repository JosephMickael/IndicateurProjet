const { range } = require("rxjs");
const execQuery = require("./executeQuery_controller");
const pool = require("../config/db.config");
const poolGPAO = require("../config/db.configpgGpao");
const moment = require('moment');
const { parseISO, getISOWeek } = require('date-fns');
const accueilController = require("./accueil_controller")


const getPerfAtelier = async function (req, res, next) {
  const id_ligne = req.body.id_ligne;
  const id_plan = req.body.id_plan
  const id_fonction = req.body.id_fonction
  const debut = req.body.debut
  const fin = req.body.fin

  const startDate = new Date(debut);
  const endDate = new Date(fin);

  const anneeDebut = startDate.getFullYear()
  const anneeFin = endDate.getFullYear()

  var liste_date = [];

  const selectJoursFeries = "select jour_f from ferie where to_char(jour_f, 'yyyy') between '" + anneeDebut + "' and '" + anneeFin + "'"
  
  const joursFeries = await execQuery.executeQuery(poolGPAO, selectJoursFeries)
  
  for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
    const formattedDate = currentDate.toISOString().slice(0, 10);
    liste_date.push({ "date": formattedDate });
  }
    
  for (let i = 0; i < joursFeries.length; i++) {
    const jour_f = moment(joursFeries[i].jour_f).format("YYYY-MM-DD");

    //
    // console.log(jour_f)
    
    liste_date = liste_date.filter(item => 
      item.date !== jour_f
    );
  }
  const operationListe = await accueilController.OperationListe(id_ligne,id_plan,id_fonction);  
  var sql_distinct = "select distinct id_ligne, id_plan, id_fonction, id_operation, libelle_operation, rang from performance_atelier where id_ligne = '" + id_ligne + "' and id_plan = '" + id_plan + "' and id_fonction= '" + id_fonction + "' and date_recup between '" + debut + "' and '" + fin + "' and id_operation in ('"+operationListe+"') order by  rang  ";
  // console.log(sql_distinct)
  let liste_operations = await execQuery.executeQuery(pool, sql_distinct); 


  // console.log('liste_operations => ', liste_operations)

  // Utilisé pour calculer les sommes par semaines 
  const sommes = await calculSommePerformance(id_ligne, id_plan, id_fonction)       
  
  // MAIN
  
  const operationList = []
  
  for (let i = 0; i < liste_date.length; i++) {
    const date = liste_date[i];
    const date_recuperation = liste_date[i].date
    
    const formattedDate = moment(date).format('YYYY-MM-DD')
    const dateOperations = []; 
    
    for (let j = 0; j < liste_operations.length; j++) {
      const operation = liste_operations[j];
      const id_operation = operation.id_operation;
      var cadence_obj = await getCadenceObjGpao(poolGPAO,id_ligne,id_plan,id_fonction,id_operation);
      liste_date[i].cadence_obj = cadence_obj;
      //console.log(cadence_obj);
      
      var sql_data = "select date_recup, volume, temps, cadence, prevision, obj_journalier, reception from performance_atelier where date_recup = '" + date_recuperation + "'  and  id_ligne = '" + id_ligne + "' and  id_plan = '" + id_plan + "'and id_fonction = '" + id_fonction + "' and id_operation = '" + id_operation + "' order by libelle_operation"
      // const selectDatas = `SELECT cadence, temps FROM performance_atelier WHERE date_recup = '${date_recuperation}'`

      // const res = await execQuery.executeQuery(pool, selectDatas)

      // console.log(res)
      
      const data = await execQuery.executeQuery(pool, sql_data) 
    
        let performanceItem = {
          date: liste_date[i].date,
          volume: Object.keys(data).length === 0 ? null : data[0].volume, 
          temps: Object.keys(data).length === 0 ? null : data[0].temps,
          cadence: Object.keys(data).length === 0 ? null : data[0].cadence,
          prevision: Object.keys(data).length === 0 ? null : data[0].prevision, 
          obj_cadence : Object.keys(data).length === 0 ? null : liste_date[i].cadence_obj, 
          reception : Object.keys(data).length === 0 ? null : data[0].reception
        };
        //console.log(performanceItem);  
        

        operation.performance = operation.performance || []; // Initialiser le tableau si nécessaire
        
        operation.performance.push(performanceItem);

        // console.log(operation.performance)

        for (let k = 0; k < sommes.length; k++) {
          const endDate = sommes[k].formattedEndDate;
          const resSommeTemps = sommes[k].resSommeTemps

          for (let l = 0; l < resSommeTemps.length; l++) {
            const somme = resSommeTemps[l];

            // operation.performance = operation.performance.filter((performanceItem) => {
            //   const dayOfWeek = new Date(performanceItem.date).getDay();
            //   // 0 correspond au dimanche, 6 correspond au samedi
            //   if ((isSaturday(performanceItem.date) || isSunday(performanceItem.date)) && performanceItem.cadence !== 0 || performanceItem.temps !== 0 || performanceItem.volume !== 0) {
            //     return true; // Inclure performanceItem.date si c'est samedi ou dimanche et cadence différent de 0
            //   }
            //   return dayOfWeek !== 0 && dayOfWeek !== 6; // Toujours inclure les autres jours
            // });

            if (isSunday(performanceItem.date) && id_operation === somme.id_operation && endDate === date_recuperation ){
              //console.log(performanceItem.date)
              const numeroSemaine = getISOWeek(parseISO(performanceItem.date))
              console.log(' =>', somme.sommetemps, somme.sommevolume); 
              const sommeSemaine = {
                date: `SEM-${numeroSemaine}`,
                volume: somme.sommevolume,
                temps: somme.sommetemps,
                cadence: somme.sommevolume / somme.sommetemps,
                prevision: somme.sommeprevision, 
                obj_cadence: cadence_obj, 
                reception: somme.sommereception
              };
              operation.performance.push(sommeSemaine);
            }
          }
        }

      dateOperations.push(operation); 
    }

    const dateOperationPair = { operations: dateOperations };

    // Vérifier si dateOperationPair existe déjà dans operationList
    const exists = operationList.some(item => JSON.stringify(item) === JSON.stringify(dateOperationPair));

    if (!exists) {
      operationList.push(dateOperationPair); // Ajouter la paire date-opérations au tableau operationList
    }
  }

  var donnee = { "liste": operationList }
  var dataStringfy = JSON.stringify(donnee)
  res.status(200).send(dataStringfy);
}

const calculSommePerformance = async (id_ligne, id_plan, id_fonction) => {
  const selectAllDate = "SELECT DISTINCT date_recup FROM performance_atelier ORDER BY date_recup ASC";
  const allDateResult = await pool.query(selectAllDate, []);

  let startDate2 = moment(allDateResult.rows[0].date_recup); // Prendre la première date
  const endDate2 = moment(); // Prendre la date actuelle

  const resultData = []; // Tableau pour stocker les résultats

  while (startDate2.isBefore(endDate2)) {
    if (startDate2.day() === 0) { // Si c'est un dimanche
      const formattedStartDate = startDate2.clone().subtract(6, 'days').format('YYYY-MM-DD'); // Date de début = date actuelle - 6 jours (semaine)
      const formattedEndDate = startDate2.format('YYYY-MM-DD'); // Date de fin = date actuelle

      const recup_volume = `
        SELECT SUM(temps) AS sommeTemps, SUM(cadence) AS sommeCadence, SUM(volume) AS sommeVolume, SUM(prevision) AS sommePrevision,SUM(obj_journalier) AS sommeObj,SUM(reception) AS sommeReception, id_ligne, id_plan, id_fonction, id_operation
        FROM performance_atelier
        WHERE id_ligne = '${id_ligne}' 
          AND id_plan = '${id_plan}'
          AND id_fonction = '${id_fonction}'
          AND date_recup >= '${formattedStartDate}' AND date_recup <= '${formattedEndDate}'
        GROUP BY id_ligne, id_plan, id_fonction, id_operation
      `;
  
      const resSommeTemps = await execQuery.executeQuery(pool, recup_volume);
      
      // console.log("Somme Temps par semaine => ", formattedStartDate, formattedEndDate, resSommeTemps);

      resultData.push({
        formattedStartDate,
        formattedEndDate,
        resSommeTemps
      });
    }
  
    startDate2.add(1, 'day'); // Passer au jour suivant
  }
  return resultData;
}

const getCadenceObjGpao = async (poolGPAO, id_ligne, id_plan, id_fonction, id_operation) => {
  const sql = "select distinct objectif, date_objectif from objectif_cadence_lpfo where id_ligne='" + id_ligne + "' and id_plan='" + id_plan + "' and id_fonction='" + id_fonction + "' and id_operation='" + id_operation + "' ORDER BY date_objectif DESC limit 1";  
  const resultat = await execQuery.executeQuery(poolGPAO, sql);
  return resultat.length > 0 ? resultat[0].objectif : "-";
};



function isSunday(dateString) {
  const date = moment(dateString, 'YYYY-MM-DD');
  return date.day() === 0;
}

function isSaturday(dateString) {
  const date = moment(dateString, 'YYYY-MM-DD');
  return date.day() === 6;
}

module.exports = { getPerfAtelier }
