const { range } = require("rxjs");
const execQuery = require("../controllers/executeQuery_controller");
const pool = require("../config/db.config");
const poolGpao = require("../config/db.configpgGpao")

// Add Menu
const getQualiteProjet = async function (req, res, next) {
  const id_ligne = req.body.id_ligne;
  const annee = req.body.annee;
  var liste_mois = listMois();
  var liste_mois_2 = liste_mois[0]["monthsArray"];
  var sql_distinct = "select distinct(id_plan) as plan,libelle_plan from bilan_projet where id_ligne = '" + id_ligne + "' and annee = '" + annee + "' and id_plan != '0010' order by libelle_plan";
  const liste = await execQuery.executeQuery(pool, sql_distinct)
  for (let index = 0; index < liste.length; index++) {
    var id_plan = liste[index].plan;
    liste[index].data = []
    var data_liste = [];
    for (let index2 = 0; index2 < liste_mois_2.length; index2++) {
      var periode = liste_mois_2[index2];
      var sql_data = "select mois,taux_qualite from bilan_projet where annee = '" + annee + "' and id_ligne = '" + id_ligne + "' and mois = '" + periode + "' and id_plan = '" + id_plan + "' order by libelle_plan";
      // const liste_data = await executeQuery(sql_data);
      const liste_data = await execQuery.executeQuery(pool, sql_data);
      var liste_data_zero = liste_data[0];
      if (liste_data_zero == undefined) {
        liste_data_zero = {
          "mois": periode,
          "taux_qualite": null,

        }
      }
      data_liste.push(liste_data_zero)
    }
    liste[index].data = data_liste
  }

  //get object qualite
  for (let index = 0; index < liste.length; index++) {
    var id_plan = liste[index].plan
    var taux_qualite_obj = 90;
    // var sql_param_ctrl_finale = "select  taux_qualite_etape as objectif_qualite from param_faute_qi where id_ligne = '" + id_ligne + "' and id_plan = '" + id_plan + "' and controle_finale = 1 limit 1";            
    // const liste_data_qlte_objectif = await execQuery.executeQuery(poolGpao,sql_param_ctrl_finale);    
    // if(Object.keys(liste_data_qlte_objectif).length > 0){
    //   var result_obj_qlt = liste_data_qlte_objectif[0].objectif_qualite      
    //   if(result_obj_qlt.indexOf("/") > 0 && result_obj_qlt.length > 1){
    //     var array_obj = result_obj_qlt.split("/")
    //     var val1 = parseFloat(array_obj[0])
    //     var val2 = parseFloat(array_obj[1])
    //     taux_qualite_obj = (100 - ((val1 / val2)*100))
    //   }else{
    //     taux_qualite_obj = "-"
    //   }
    // }else{
    //   taux_qualite_obj = "-"
    // }
    liste[index].taux_qualite_obj = taux_qualite_obj
  }

  var donnee = { "mois": liste_mois_2, "liste": liste }
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
  getQualiteProjet
};



