const { range } = require("rxjs");
const execQuery = require("../controllers/executeQuery_controller");
const pool = require("../config/db.config");
const poolGpao = require("../config/db.configpgGpao")

async function getRetourClient(req, res) {
  const id_ligne = req.body.id_ligne;
  const annee = req.body.annee;
  var liste_mois = listMois();
  var liste_mois_2 = liste_mois[0]["monthsArray"];
  const sql_ligne = "select distinct(id_ligne) as ligne, libelle_ligne from bilan_projet where id_ligne = '" + id_ligne + "' and annee = '" + annee + "' order by libelle_ligne limit 1 ";
  const listLigne = await execQuery.executeQuery(pool, sql_ligne)
  // console.log(listLigne)
  // return
  var sql_distinct = "select distinct(id_plan) as plan,libelle_plan from bilan_projet where id_ligne = '" + id_ligne + "' and annee = '" + annee + "' and id_plan != '0010' order by libelle_plan";
  const liste = await execQuery.executeQuery(pool, sql_distinct)
  // console.log(liste);

  for (let index = 0; index < liste.length; index++) {
    var id_plan = liste[index].plan;
    liste[index].data = []
    var data_liste = [];
    for (let index2 = 0; index2 < liste_mois_2.length; index2++) {
      var periode = liste_mois_2[index2];
      var sql_data = "select mois,retour_client,felicitation_client from bilan_projet where annee = '" + annee + "' and id_ligne = '" + id_ligne + "'  and mois = '" + periode + "' and id_plan = '" + id_plan + "' order by libelle_plan";
      const liste_data = await execQuery.executeQuery(pool, sql_data);
      // console.log(liste_data);
      var liste_data_zero = liste_data[0];
      if (liste_data_zero == undefined) {
        liste_data_zero = {
          "mois": periode,
          "retour_client": null,
          "felicitation_client": null,
        }
      }
      data_liste.push(liste_data_zero)
    }
    liste[index].data = data_liste

  }

  // bug libelle ligne undefined
  if (Object.keys(listLigne).length === 0) {
    ligneDetails = {
      'id_ligne': '020',
      'libelle_ligne': 'TANA INVOICES'
    }
    listLigne.push(ligneDetails)
  }

  const newObj = { "ligne": id_ligne, "libelle_ligne": listLigne[0].libelle_ligne, "liste": liste }

  var donnee = { "mois": liste_mois_2, "newliste": newObj }
  // var donnee = { "mois": liste_mois_2, "liste": liste  }
  var dataStringfy = JSON.stringify(donnee)
  res.status(200).send(dataStringfy);
}

const listMois = (req, res, next) => {
  const months = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"];
  const months_abbrev = [{ "abbrev": "jan", "non_abbrev": "janvier" }, { "abbrev": "fev", "non_abbrev": "fevrier" }, { "abbrev": "mar", "non_abbrev": "mars" }, { "abbrev": "avr", "non_abbrev": "avril" }, { "abbrev": "mai", "non_abbrev": "mai" }, { "abbrev": "jun", "non_abbrev": "juin" }, { "abbrev": "jul", "non_abbrev": "juillet" }, { "abbrev": "aou", "non_abbrev": "aout" }, { "abbrev": "sept", "non_abbrev": "septembre" }, { "abbrev": "oct", "non_abbrev": "octobre" }, { "abbrev": "nov", "non_abbrev": "novembre" }, { "abbrev": "dec", "non_abbrev": "decembre" }];
  const monthsNumberString = [{ "numero": "01", "mois": "janvier" }, { "numero": "02", "mois": "fevrier" }, { "numero": "03", "mois": "mars" }, { "numero": "04", "mois": "avril" }, { "numero": "05", "mois": "mai" }, { "numero": "06", "mois": "juin" }, { "numero": "07", "mois": "juillet" }, { "numero": "08", "mois": "aout" }, { "numero": "09", "mois": "septembre" }, { "numero": "10", "mois": "octobre" }, { "numero": "11", "mois": "novembre" }, { "numero": "12", "mois": "decembre" }];
  const monthsNumber = listMoisNumber();
  return [{ "monthsString": months.join("','"), "monthsArray": months, "monthsArrayNumber": monthsNumber, "monthsNumberString": monthsNumberString, "monthsArrayAbbrev": months_abbrev }];
}

const listMoisNumber = (req, res, next) => {
  result = [];
  for (i = 1; i <= 12; i++) {
    if (i.length == 1) {
      i = "0".i;
    }
    result.push(i);
  }
  return result;
}

module.exports = {
  getRetourClient
};