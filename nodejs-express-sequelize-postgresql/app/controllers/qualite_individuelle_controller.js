const { range, max } = require("rxjs");
const execQuery = require("../controllers/executeQuery_controller");
const pool = require("../config/db.config");
const moment = require("moment");
const poolGPAO = require("../config/db.configpgGpao");

const getQualiteIndividuelle = async (req, res) => {
  const { id_ligne, id_plan, id_fonction, id_operation, debut, fin } = req.body;

  const startDate = new Date(debut);
  const endDate = new Date(fin);

  // Boucle sur la plage de date selectionné
  var liste_date = [];
  for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
    const formattedDate = currentDate.toISOString().slice(0, 10);
    liste_date.push({ date: formattedDate });
  }

  // recuperation matricule
  for (let i = 0; i < liste_date.length; i++) {
    // const sql_matricule = "select distinct(matricule) from performance_individuelle where id_ligne = '" + id_ligne + "' and id_plan = '" + id_plan + "' and id_fonction = '" + id_fonction + "' and id_operation = '" + id_operation + "' and date_recup between '" + debut + "' and '" + fin + "' order by matricule";
    const sql_matricule = "select distinct(matricule) from qualite_individuelle where  id_ligne = '" + id_ligne + "' and id_plan = '" + id_plan + "' and id_fonction = '" + id_fonction + "' and id_operation = '" + id_operation + "' and date_recup between '" + debut + "' and '" + fin + "' order by matricule";
    liste_date[i].liste_matricule = await execQuery.executeQuery(pool, sql_matricule);
  }

  // rescuperation données qualite_individuelle
  for (let i = 0; i < liste_date.length; i++) {
    var matricules = liste_date[i].liste_matricule;
    var date_recuperation = liste_date[i].date;

    for (let j = 0; j < matricules.length; j++) {
      var matricule = matricules[j].matricule;

      const sql = "select volume_controle, nb_faute_pondere, taux_nc from qualite_individuelle where date_recup = '" + date_recuperation + "' and matricule='" + matricule + "' and id_ligne = '" + id_ligne + "' and id_plan = '" + id_plan + "' and id_fonction = '" + id_fonction + "' and id_operation = '" + id_operation + "'  order by matricule";

      const donnees = await execQuery.executeQuery(pool, sql)

      liste_date[i].liste_matricule[j].volume_controle = Object.keys(donnees).length > 0 ? donnees[0].volume_controle : '-';
      liste_date[i].liste_matricule[j].nb_faute_pondere = Object.keys(donnees).length > 0 ? donnees[0].nb_faute_pondere : '-';
      liste_date[i].liste_matricule[j].taux_nc = Object.keys(donnees).length > 0 ? donnees[0].taux_nc : '-';
    }
  }

  // Qualite objetive / seuil
  for (let i = 0; i < liste_date.length; i++) {

    const qualiteGpao = await getQualiteObjGpao(poolGPAO, id_ligne, id_plan);

    // const qualite_obj_str = qualiteGpao.length > 0 ? qualiteGpao[0].taux_qualite_etape : '-'
    const qualite_obj_str = qualiteGpao.length > 0 ? qualiteGpao[0].taux_qualite_etape : '-'

    if (Object.keys(qualite_obj_str).length > 0) {
      if (qualite_obj_str.includes('/')) {
        const qualite_splitted = qualite_obj_str.split('/')
        val1 = parseFloat(qualite_splitted[0])
        val2 = parseFloat(qualite_splitted[1])
      } else {
        val1 = parseFloat(qualite_obj_str)
        val2 = 100
      }

      taux_qualite_etape = 100 - ((val1 / val2) * 100)
    }

    liste_date[i].taux_qualite = taux_qualite_etape;
  }

  for (let i = 0; i < liste_date.length; i++) {
    let liste_matricules = liste_date[i].liste_matricule
    let qualite_obj = liste_date[i].taux_qualite

    let qualite_detail = getQualiteDetail(liste_matricules, qualite_obj)

    liste_date[i].qualite_max = qualite_detail.max
    liste_date[i].qualite_min = qualite_detail.min
    liste_date[i].qualite_atelier = qualite_detail.qualite_atelier
    liste_date[i].nb_op = liste_matricules.length
    liste_date[i].nb_op_sup_ob = qualite_detail.nb_op_sup_ob;
    liste_date[i].ecart = (((qualite_detail.max) - (qualite_detail.min)) / (qualite_detail.max)) * 100

    // LPFO
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
      var sql_tendance = "select taux_nc from qualite_individuelle where id = (select max(id) from qualite_individuelle where id_ligne = '" + id_ligne + "' and id_plan = '" + id_plan + "' and id_fonction = '" + id_fonction + "' and id_operation = '" + id_operation + "' and matricule = '" + matricule + "' and date_recup < '" + liste_date[i].liste_matricule[j].date_principale + "')";
      var qualite_avant = await execQuery.executeQuery(pool, sql_tendance);
      liste_date[i].liste_matricule[j].qualite_avant = Object.keys(qualite_avant).length > 0 ? qualite_avant[0].taux_nc : 0;
      // console.log(liste_date[i].liste_matricule[j].qualite_avant, liste_date[i].liste_matricule[j].taux_nc)
      liste_date[i].liste_matricule[j].tendance_image = compareQualite(liste_date[i].liste_matricule[j].qualite_avant, liste_date[i].liste_matricule[j].taux_nc)
    }
  }

  //cadene smiley
  for (let i = 0; i < liste_date.length; i++) {
    liste_date[i].smiley = compareSmiley(liste_date[i].ecart)
    // console.log(liste_date[i].ecart)
  }

  res.status(200).send(JSON.stringify({ only: [liste_date[0]], multiple: liste_date }));
  res.status(200).send();
}

const getQualiteDetail = (liste, taux_qualite) => {
  let liste_qualite_max = []
  let liste_qualite_min = []

  var sum_faute = 0;
  var sum_volume_controle = 0
  var nb_op_sup_ob = 0;

  for (let i = 0; i < liste.length; i++) {
    if (liste[i].taux_nc != "-") {
      liste_qualite_max.push(liste[i].taux_nc);
    }

    if (liste[i].taux_nc != "-" && liste[i].taux_nc > 0) {
      liste_qualite_min.push(liste[i].taux_nc)
    }

    if (liste[i].nb_faute_pondere != "-") {
      let faute = parseInt(liste[i].nb_faute_pondere)
      sum_faute += faute;
    }

    if (liste[i].volume_controle != "-") {
      let volume = parseInt(liste[i].volume_controle)
      sum_volume_controle += volume;
    }

    var qualite_atelier = (sum_faute / sum_volume_controle)

    if (liste[i].qualite != "-" && liste[i].taux_nc > taux_qualite) {
      nb_op_sup_ob++;
    }
  }

  const numberString = qualite_atelier !== undefined ? qualite_atelier.toString() : "";
  const shouldFormat = numberString.includes('e');

  let formattedNumber;

  // evite les valeurs comme 1.9395792373211052e-7
  if (shouldFormat) {
    formattedNumber = qualite_atelier.toFixed(20);
  } else {
    formattedNumber = qualite_atelier;
  }

  // console.log(Math.max(...liste_qualite_max))

  return {
    max: Math.max(...liste_qualite_max),
    min: Math.min(...liste_qualite_min),
    qualite_atelier: formattedNumber,
    nb_op_sup_ob: nb_op_sup_ob,
  };
}

const getQualiteObjGpao = async (poolGPAO, id_ligne, id_plan) => {

  const recup_qualite_query = `SELECT * FROM param_qi WHERE id_ligne = '${id_ligne}' and id_plan = '${id_plan}' limit 1`
  console.log(recup_qualite_query)

  return await execQuery.executeQuery(poolGPAO, recup_qualite_query);
};

const compareSmiley = (ecart) => {
  ecart = parseInt(ecart)
  // objective = parseInt(objective)
  var smiley = 0;
  var smiley_image = "";
  if (ecart < 25) {
    smiley_image = "green.png";
  } else if (ecart >= 70) {
    smiley_image = "red.png";
  } else {
    smiley_image = "pink.jpg";
  }
  return smiley_image
}



const compareQualite = (qualite_avant, qualite_now) => {
  // qualite_avant = parseInt(qualite_avant)
  // qualite_now = parseInt(qualite_now)
  var tendance = 0;
  var tendance_image = "";
  if (qualite_now == "-") {
    tendance = 0;
    tendance_image = "minus arrow.png"
  }
  if (qualite_avant < qualite_now) {
    tendance = 1
    tendance_image = "up-right-arrow.png"
  }
  if (qualite_avant > qualite_now) {
    tendance = -1
    tendance_image = "down-right-arrow.png"
  }
  if (qualite_avant == qualite_now) {
    tendance = 0
    tendance_image = "minus arrow.png"
  }
  return tendance_image
}

module.exports = {
  getQualiteIndividuelle,
};
