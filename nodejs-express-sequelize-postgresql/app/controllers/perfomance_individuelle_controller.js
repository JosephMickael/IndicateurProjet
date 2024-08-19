const { range, max } = require("rxjs");
const execQuery = require("../controllers/executeQuery_controller");
const pool = require("../config/db.config");
const moment = require("moment");
const poolGPAO = require("../config/db.configpgGpao");



// Add Menu
const getPerformanceIndividuelle = async function (req, res, next) {
  const id_ligne = req.body.id_ligne;
  const id_plan = req.body.id_plan;
  const id_fonction = req.body.id_fonction;
  const id_operation = req.body.id_operation;
  const debut = req.body.debut;
  const fin = req.body.fin;

  const startDate = new Date(debut);
  const endDate = new Date(fin);


  var liste_date = [];
  for (let currentDate = new Date(startDate);currentDate <= endDate;currentDate.setDate(currentDate.getDate() + 1)) {
    const formattedDate = currentDate.toISOString().slice(0, 10);
    liste_date.push({ date: formattedDate });
  }

  for (let i = 0; i < liste_date.length; i++) {
    const sql_matricule ="select distinct(matricule) from performance_individuelle where  id_ligne = '" +id_ligne +"' and id_plan = '" +id_plan +"' and id_fonction = '" +id_fonction +"' and id_operation = '" +id_operation +"' and date_recup between '" +debut +"' and '" +fin +"' order by matricule";
    liste_date[i].liste_matricule = await execQuery.executeQuery(pool,sql_matricule);
  }

  for (let i = 0; i < liste_date.length; i++) {
    var matricules = liste_date[i].liste_matricule;
    var date_recuperation = liste_date[i].date;
    for (let j = 0; j < matricules.length; j++) {
      var matricule = matricules[j].matricule;
      const sql_temps ="select temps,volume,cadence, date_recup from performance_individuelle where date_recup = '" +date_recuperation +"' and matricule='" +matricule +"' and id_ligne = '" +id_ligne +"' and id_plan = '" +id_plan +"' and id_fonction = '" +id_fonction +"' and id_operation = '" +id_operation +"'  order by matricule";
      var donnees = await execQuery.executeQuery(pool, sql_temps);
      liste_date[i].liste_matricule[j].temps = Object.keys(donnees).length > 0 ? donnees[0].temps : "-";
      liste_date[i].liste_matricule[j].volume = Object.keys(donnees).length > 0 ? donnees[0].volume : "-";
      liste_date[i].liste_matricule[j].cadence = Object.keys(donnees).length > 0 ? donnees[0].cadence : "-";
    }
  }
  for (let i = 0; i < liste_date.length; i++) {
    var cadence_obj = await getCadenceObjGpao(poolGPAO,id_ligne,id_plan,id_fonction,id_operation);
    liste_date[i].cadence_obj = cadence_obj;
  }
  //calcul cadence
  for (let i = 0; i < liste_date.length; i++) {
    var liste_matricules = liste_date[i].liste_matricule;
    var cadence_obj = liste_date[i].cadence_obj;
    var cadence_detail = getCadenceDetail(liste_matricules, cadence_obj);
    liste_date[i].cadence_max = cadence_detail.max;
    liste_date[i].cadence_min = cadence_detail.min;
    liste_date[i].cadence_moyenne = cadence_detail.cadence_moyenne;
    liste_date[i].cadence_atelier = cadence_detail.cadence_atelier;
    liste_date[i].nombre_operateur = cadence_detail.nb_op;
    liste_date[i].nombre_operateur_sup_ob = cadence_detail.nb_op_sup_ob;
    (liste_date[i].ecart =
      ((cadence_detail.max - cadence_detail.min) / cadence_detail.max) * 100),
      liste_date[i].id_ligne = id_ligne;
    liste_date[i].id_plan = id_plan;
    liste_date[i].id_fonction = id_fonction;
    liste_date[i].id_operation = id_operation;
  }


  //get tendance
  for (let i = 0; i < liste_date.length; i++) {
    var matricules = liste_date[i].liste_matricule
    for (let j = 0; j < matricules.length; j++) {
      liste_date[i].liste_matricule[j].date_principale = liste_date[i].date
      var matricule = liste_date[i].liste_matricule[j].matricule
      var sql_tendance = "select cadence from performance_individuelle where id = (select max(id) from performance_individuelle where id_ligne = '" + id_ligne + "' and id_plan = '" + id_plan + "' and id_fonction = '" + id_fonction + "' and id_operation = '" + id_operation + "' and matricule = '" + matricule + "' and date_recup < '" + liste_date[i].liste_matricule[j].date_principale + "')";
      var cadence_avant = await execQuery.executeQuery(pool, sql_tendance);
      liste_date[i].liste_matricule[j].cadence_avant = Object.keys(cadence_avant).length > 0 ? cadence_avant[0].cadence : 0;
      liste_date[i].liste_matricule[j].tendance_image = compareCadence(formatVirgule(liste_date[i].liste_matricule[j].cadence_avant), formatVirgule(liste_date[i].liste_matricule[j].cadence))
    }
  }

  //cadene smiley
  for (let i = 0; i < liste_date.length; i++) {
    liste_date[i].smiley = compareSmiley(liste_date[i].cadence_atelier, liste_date[i].cadence_obj)
  }


  res.status(200).send(JSON.stringify({ only: [liste_date[0]], multiple: liste_date }));
  res.status(200).send();
};

const getCadenceDetail = (liste, cad_obj) => {
  var liste_cadence = [];
  var liste_cadence_min = [];
  var sum_temps = 0;
  var sum_volume = 0;
  var nb_op = 0;
  var nb_op_sup_ob = 0;
  for (let i = 0; i < liste.length; i++) {
    if (liste[i].cadence != "-") {
      liste_cadence.push(liste[i].cadence);
    }
    if (liste[i].cadence != "-" && liste[i].cadence > 0) {
      liste_cadence_min.push(liste[i].cadence);
    }
    if (liste[i].temps != "-") {
      sum_temps += liste[i].temps;
      nb_op++;
    }

    if (liste[i].volume != "-") {
      sum_volume += liste[i].volume;
    }
    if (liste[i].cadence != "-" && liste[i].cadence > cad_obj) {
      nb_op_sup_ob++;
    }
  }

  return {
    max: Math.max(...liste_cadence),
    min: Math.min(...liste_cadence_min),
    cadence_moyenne: calculateAverage(liste_cadence),
    cadence_atelier: sum_volume / sum_temps,
    nb_op: nb_op,
    nb_op_sup_ob: nb_op_sup_ob,
  };
};

function calculateAverage(myarray) {
  // you can change the values of array
  let array = myarray;
  let i = 0;
  let sum = 0;
  let len = array.length;
  let result = 0;

  // loop for calculate sum of array values
  while (i < len) {
    sum = sum + array[i++];
  }
  result = sum / len;
  return result;
}

const getCadenceObjGpao = async (poolGPAO, id_ligne, id_plan, id_fonction, id_operation) => {
  const sql = "select distinct objectif, date_objectif from objectif_cadence_lpfo where id_ligne='" + id_ligne + "' and id_plan='" + id_plan + "' and id_fonction='" + id_fonction + "' and id_operation='" + id_operation + "' ORDER BY date_objectif DESC limit 1";  
  const resultat = await execQuery.executeQuery(poolGPAO, sql);
  return resultat.length > 0 ? resultat[0].objectif : "-";
};

const compareCadence = (cadence_avant, cadence_now) => {
  var tendance = 0;
  var tendance_image = "";
  if (cadence_now == "-") {
    tendance = 0;
    tendance_image = "minus arrow.png"
  }
  if (cadence_avant < cadence_now) {
    tendance = 1
    tendance_image = "up-right-arrow.png"
  }
  if (cadence_avant > cadence_now) {
    tendance = -1
    tendance_image = "down-right-arrow.png"
  }
  if (cadence_avant == cadence_now) {
    tendance = 0
    tendance_image = "minus arrow.png"
  }
  return tendance_image
}

const compareSmiley = (atelier, objective) => {
  var smiley = 0;
  var smiley_image = "";
  if (atelier >= objective) {
    smiley_image = "green.png";
  } else if (atelier < objective) {
    smiley_image = "red.png";
  } else {
    smiley_image = "pink.jpg"
  }
  return smiley_image
}

function formatVirgule(valeur) {
  if (valeur !== null) {
    var valS = valeur.toString()
    if (valS.indexOf('.') > -1) {
      var val = valS.split('.')
      valeur = parseInt(val[0])
    }
  }
  return valeur
}

function siDategale(date1String, date2String) {
  // console.log("date1String" + date1String)
  // console.log("date2String" + date2String)
  // Convertir les chaînes de date en objets Date
  const date1 = new Date(date1String);
  const date2 = new Date(date2String);

  // Vérifier si les dates sont égales en utilisant l'opérateur d'égalité
  if (date1.getTime() === date2.getTime()) {
    return true;
  } else {
    return false;
  }
  console.log("\n");
}

module.exports = {
  getPerformanceIndividuelle,getCadenceObjGpao
};
