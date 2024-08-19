const { range } = require("rxjs");
const pool = require("../config/db.config");
const poolGPAO = require("../config/db.configpgGpao");
const poolKB = require("../config/db.configpgKanboard");

const execQuery = require("./executeQuery_controller");
const { id } = require("date-fns/locale");

// Get liste annee
const getdetailkanboard = async (req, res, next) => {
  const ticket = req.body.Obj
  // poolKB.query("SELECT t.id AS NumTicket, t.title AS TitreTicket, t.color_id AS Couleur, t.priority AS Priorite, t.category_id AS Categorie_id, FROM_UNIXTIME(t.date_creation, '%Y-%m-%d') AS Date_creation, FROM_UNIXTIME(t.date_due, '%Y-%m-%d') AS Delai, FROM_UNIXTIME(t.date_modification, '%Y-%m-%d') AS Date_modification, FROM_UNIXTIME(t.date_started, '%Y-%m-%d') AS date_debut, t.project_id AS Projet_id, p.name AS Projet_nom, t.column_id AS Avancement_id, c.title AS Avancement, t.owner_id AS Utilsateur_assigne_id, o.name AS Utilsateur_assigne_nom, t.swimlane_id AS Swimlan_id, s.name AS Swimlan_nom, t.creator_id AS Utilsateur_createur_id, u.name AS Pilote, FROM_UNIXTIME(t.date_completed, '%Y-%m-%d') AS Date_completion, p.end_date AS date_fin FROM `tasks` t INNER JOIN projects p ON p.id = t.project_id INNER JOIN swimlanes s ON s.id = t.swimlane_id INNER JOIN `columns` c ON c.id = t.column_id INNER JOIN users u ON u.id = t.creator_id INNER JOIN users o ON o.id = t.owner_id WHERE t.id = ? ORDER BY t.id desc", [ticket], function (err, result, fields) {
  // pool.query("SELECT * FROM kanboard WHERE NumTicket = $1", [ticket], function (err, result, fields) {
  //   if (err) {
  //     res.status(400).send(err);
  //   }
  //   if (Object.keys(result).length > 0) {
  //     res.status(200).send(JSON.stringify(result));
  //   } else {
  //     res.status(200).send();
  //   }
  // });

  const sql = "SELECT pilote, delai, action, avancement FROM kanboard WHERE num_ticket = '" + ticket + "'"

  const result = await execQuery.executeQuery(pool, sql)

  if (Object.keys(result).length > 0) {
    res.status(200).send(JSON.stringify(result));
  } else {
    res.status(200).send();
  }
};


const insertPlanAction = async (req, res, next) => {

  const { Obj } = req.body
  const objParse = JSON.parse(Obj)

  const id_ligne = objParse.id_ligne
  const nom_ligne = objParse.nom_ligne

  let id_plan = objParse.id_plan !== "" ? objParse.id_plan !== null ? objParse.id_plan !== undefined ? "'" + objParse.id_plan + "'" : null : null : null
  let nom_plan = objParse.nom_plan !== "" ? objParse.nom_plan !== null ? objParse.nom_plan !== undefined ? "'" + objParse.nom_plan + "'" : null : null : null
  let id_fonction = objParse.id_fonction !== "" ? objParse.id_fonction !== null ? objParse.id_fonction !== undefined ? "'" + objParse.id_fonction + "'" : null : null : null
  let nom_fonction = objParse.nom_fonction !== "" ? objParse.nom_fonction !== null ? objParse.nom_fonction !== undefined ? "'" + objParse.nom_fonction + "'" : null : null : null
  let id_operation = objParse.id_operation !== "" ? objParse.id_operation !== null ? objParse.id_operation !== undefined ? "'" + objParse.id_operation + "'" : null : null : null
  let nom_operation = objParse.nom_operation !== "" ? objParse.nom_operation !== null ? objParse.nom_operation !== undefined ? "'" + objParse.nom_operation + "'" : null : null : null
  let commentaire = objParse.commentaire !== "" ? objParse.commentaire !== null ? objParse.commentaire !== undefined ? "'" + objParse.commentaire + "'" : null : null : null


  const matricule = objParse.matricule
  const menu = objParse.menu
  const listTickets = objParse.listTickets
  var allTickets = "";

  if (listTickets[0].num_ticket != null) {
    if (listTickets[0].num_ticket != '') {
      console.log('test1')
      for (let index = 0; index < listTickets.length; index++) {
        allTickets += listTickets[index].num_ticket + ";"
      }
      allTickets = "'" + allTickets + "'"

    }
  } else {
    console.log('test2')
    allTickets = null
  }

  const now = await getDatanow();

  var select = "select * from plan_action where id_ligne = '" + id_ligne + "'  and id_plan = " + id_plan + " "
  var and = " and date_creation::date = '" + now + "' and zone_enregistrement = " + menu
  var where = " "
  var condition = ""

  if (id_fonction != undefined && (id_fonction != '' || id_fonction != null)) {
    condition = " and id_fonction = " + id_fonction + ""
    where += condition
    id_fonction = "" + id_fonction + ""
    nom_fonction = "" + nom_fonction + ""
  } else {
    id_fonction = null
    nom_fonction = null
  }
  if (id_operation != undefined && (id_operation != '' || id_operation != null)) {
    condition = " and id_operation = " + id_operation + " "
    where += condition
    id_operation = "" + id_operation + ""
    nom_operation = "" + nom_operation + ""
  } else {
    id_operation = null
    nom_operation = null
  }

  select = select + where + and
  console.log("select ==> ", select);
  // return

  // const sql_existe = "select * from plan_action where id_ligne = '" + id_ligne + "' and id_plan = '" + id_plan + "' and date_creation::date = '" + now + "' and zone_enregistrement = " + menu;
  const result_existe = await execQuery.executeQuery(pool, select)
  let sql = ""
  if (Object.keys(result_existe).length > 0) {
    sql = "update plan_action set commentaire = " + commentaire + ", tickets = " + allTickets + " where id_ligne = '" + id_ligne + "' and id_plan =" + id_plan + " and zone_enregistrement=" + menu + " and date_creation::date = '" + now + "'"
  } else {
    sql = "insert into plan_action(id_ligne,libelle_ligne,id_plan,libelle_plan,id_fonction,libelle_fonction,id_operation, libelle_operation,commentaire,matricule,zone_enregistrement,tickets)values('" + id_ligne + "','" + nom_ligne + "'," + id_plan + "," + nom_plan + "," + id_fonction + "," + nom_fonction + "," + id_operation + "," + nom_operation + "," + commentaire + ",'" + matricule + "'," + menu + ", " + allTickets + ")"
  }
  // console.log(sql)
  // return
  await execQuery.executeQuery(pool, sql)

  const message = "Enregistrement terminé"
  var donnee = { "message": message }
  var dataStringfy = JSON.stringify(donnee)
  res.status(200).send(dataStringfy);
};


// je sais plus à quoi ca sert
const affichagePlanAction = async (req, res, next) => {

  const { Obj } = req.body
  const objParse = JSON.parse(Obj)

  const id_ligne = objParse.id_ligne
  const nom_ligne = objParse.nom_ligne
  const id_plan = objParse.id_plan
  const nom_plan = objParse.nom_plan
  let id_fonction = objParse.id_fonction
  let nom_fonction = objParse.nom_fonction
  let id_operation = objParse.id_operation
  let nom_operation = objParse.nom_operation
  const commentaire = objParse.commentaire
  const matricule = objParse.matricule
  const menu = objParse.menu

  const now = await getDatanow();

  var select = "select * from plan_action where id_ligne = '" + id_ligne + "'  and id_plan = '" + id_plan + "' "
  var and = " and date_creation::date = '" + now + "' and zone_enregistrement = " + menu
  var where = " "
  var condition = ""

  if (id_fonction != undefined && (id_fonction != '' || id_fonction != null)) {
    condition = " and id_fonction = '" + id_fonction + "' "
    where += condition
  } else {
    id_fonction = null
  }
  if (id_operation != undefined && (id_operation != '' || id_operation != null)) {
    condition = " and id_operation = '" + id_operation + "' "
    where += condition
  } {
    id_operation = null
  }

  select = select + where + and

  // console.log(select)

  // const sql_existe = "select * from plan_action where id_ligne = '" + id_ligne + "' and id_plan = '" + id_plan + "' and date_creation::date = '" + now + "' and zone_enregistrement = " + menu;
  const result_existe = await execQuery.executeQuery(pool, select)

  if (Object.keys(result_existe).length > 0) {
    if (result_existe[0].tickets != null || result_existe[0].tickets != "") {
      var ticket = result_existe[0].tickets
      ticket = ticket.split(';')
      var liste_tickets = []
      for (let index = 0; index < ticket.length; index++) {
        //get info from kanboard
        if (ticket[index] != '') {
          var num_ticket = ticket[index]
          // var sql_kb = "SELECT t.id AS NumTicket, t.title AS TitreTicket, t.color_id AS Couleur, t.priority AS Priorite, t.category_id AS Categorie_id, FROM_UNIXTIME(t.date_creation, '%Y-%m-%d') AS Date_creation, FROM_UNIXTIME(t.date_due, '%Y-%m-%d') AS Delai, FROM_UNIXTIME(t.date_modification, '%Y-%m-%d') AS Date_modification, FROM_UNIXTIME(t.date_started, '%Y-%m-%d') AS date_debut, t.project_id AS Projet_id, p.name AS Projet_nom, t.column_id AS Avancement_id, c.title AS Avancement, t.owner_id AS Utilsateur_assigne_id, o.name AS Utilsateur_assigne_nom, t.swimlane_id AS Swimlan_id, s.name AS Swimlan_nom, t.creator_id AS Utilsateur_createur_id, u.name AS Pilote, FROM_UNIXTIME(t.date_completed, '%Y-%m-%d') AS Date_completion, p.end_date AS date_fin FROM `tasks` t INNER JOIN projects p ON p.id = t.project_id INNER JOIN swimlanes s ON s.id = t.swimlane_id INNER JOIN `columns` c ON c.id = t.column_id INNER JOIN users u ON u.id = t.creator_id INNER JOIN users o ON o.id = t.owner_id WHERE t.id = " + num_ticket + " ORDER BY t.id desc"
          const sql_kb = "SELECT pilote, delai, action, avancement FROM kanboard WHERE num_ticket = '" + num_ticket + "'"
          const result_kb = await execQuery.executeQueryMysql(pool, sql_kb)
          if (Object.keys(result_kb).length > 0) {
            liste_tickets.push(JSON.stringify(result_kb[0]));
          }
        }
      }
      result_existe[0].liste_tickets = liste_tickets
    }
  }


  var donnee = { "resultat": result_existe }
  var dataStringfy = JSON.stringify(donnee)
  res.status(200).send(dataStringfy);
};


const getDatanow = async (req, res, next) => {
  const sql = "SELECT TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') as date"
  const result = await execQuery.executeQuery(pool, sql)
  return result[0].date
}

// Par defaut
const affichagePlanSActions = async (req, res, next) => {
  const { Obj } = req.body
  const sql = "select * from plan_action order by id desc"
  const result = await execQuery.executeQuery(pool, sql)

  for (let indext = 0; indext < result.length; indext++) {
    var tickets = result[indext].tickets
    if (tickets != null) {
      var ticket = tickets.split(';')
      var liste_tickets = []
      // console.log(ticket)
      for (let index = 0; index < ticket.length; index++) {
        //get info from kanboard
        if (ticket[index].length !== 0) {
          var num_ticket = ticket[index]
          // var sql_kb = "SELECT t.id AS NumTicket, t.title AS TitreTicket, t.color_id AS Couleur, t.priority AS Priorite, t.category_id AS Categorie_id, FROM_UNIXTIME(t.date_creation, '%Y-%m-%d') AS Date_creation, FROM_UNIXTIME(t.date_due, '%Y-%m-%d') AS Delai, FROM_UNIXTIME(t.date_modification, '%Y-%m-%d') AS Date_modification, FROM_UNIXTIME(t.date_started, '%Y-%m-%d') AS date_debut, t.project_id AS Projet_id, p.name AS Projet_nom, t.column_id AS Avancement_id, c.title AS Avancement, t.owner_id AS Utilsateur_assigne_id, o.name AS Utilsateur_assigne_nom, t.swimlane_id AS Swimlan_id, s.name AS Swimlan_nom, t.creator_id AS Utilsateur_createur_id, u.name AS Pilote, FROM_UNIXTIME(t.date_completed, '%Y-%m-%d') AS Date_completion, p.end_date AS date_fin FROM `tasks` t INNER JOIN projects p ON p.id = t.project_id INNER JOIN swimlanes s ON s.id = t.swimlane_id INNER JOIN `columns` c ON c.id = t.column_id INNER JOIN users u ON u.id = t.creator_id INNER JOIN users o ON o.id = t.owner_id WHERE t.id = " + num_ticket + " ORDER BY t.id desc"
          if (num_ticket !== 'null') {
            const sql_kb = "SELECT pilote, delai, action, avancement FROM kanboard WHERE num_ticket = '" + num_ticket + "'"
            const result_kb = await execQuery.executeQuery(pool, sql_kb)
            if (Object.keys(result_kb).length > 0) {
              result_kb[0].num_ticket = num_ticket
              liste_tickets.push(JSON.stringify(result_kb[0]));
            }
          }
        }
      }
      result[indext].liste_tickets = liste_tickets
    }

    // 1: performance individuelle
    // 2: qualité individuelle
    // 3: performance atelier
    // 4: qualité projet
    // 5: retour client
    // 6: retard de livraison

    //console.log("menu 2 ==> ", result[indext].zone_enregistrement)

    switch (result[indext].zone_enregistrement) {
      case 1:
        result[indext].zone_enregistrement_libelle = "Performance individuelle"
        break;
      case 2:
        result[indext].zone_enregistrement_libelle = "Qualité individuelle"
        break;
      case 3:
        result[indext].zone_enregistrement_libelle = "Performance atelier"
        break;
      case 4:
        result[indext].zone_enregistrement_libelle = "Qualité projet"
        break;
      case 5:
        result[indext].zone_enregistrement_libelle = "Retour client"
        break;
      case 6:
        result[indext].zone_enregistrement_libelle = "Retard de livraison"
        break;

    }
  }
  var donnee = { "resultat": result }
  var dataStringfy = JSON.stringify(donnee)
  res.status(200).send(dataStringfy);
}

// filtres
const getPlanActions = async (req, res, next) => {
  let { id_ligne, id_plan, id_fonction, id_operation, debut, fin, matricule, menu } = req.body

  var select = "select * from plan_action"
  //var and = " and date_creation = '" + date + "'" 

  let where = " "

  if (id_ligne === undefined || debut === undefined || matricule === undefined || menu === undefined) {
    where = " "
  }

  var condition = " "
  if (id_ligne != undefined && (id_ligne != '' || id_ligne != null)) {
    condition = " where id_ligne = '" + id_ligne + "' "
    where += condition
  } else {
    id_ligne = null
  }
  if (id_plan != undefined && (id_plan != '' || id_plan != null)) {
    condition = " and id_plan = '" + id_plan + "' "
    where += condition
  } else {
    id_plan = null
  }
  if (id_fonction != undefined && (id_fonction != '' || id_fonction != null)) {
    condition = " and id_fonction = '" + id_fonction + "' "
    where += condition
  } else {
    id_fonction = null
  }
  if (id_operation != undefined && (id_operation != '' || id_operation != null)) {
    condition = " and id_operation = '" + id_operation + "' "
    where += condition
  } else {
    id_operation = null
  }

  if (debut != undefined && (debut != '' || debut != null)) {
    if (id_ligne === null) {

      fin = fin === null || fin === undefined ? debut : fin

      condition = " where date_creation::date between '" + debut + "' and '" + fin + "' "
      where += condition
    } else {
      fin = fin === null || fin === undefined ? debut : fin
      condition = " and date_creation::date between '" + debut + "' and '" + fin + "' "
      where += condition
    }
  }
  else {
    debut = null
  }

  if (matricule != undefined && (matricule != '' || matricule != null)) {
    console.log(debut !== null, id_ligne)
    if (id_ligne === null && debut === null) {
      condition = " where matricule = '" + matricule + "' "
      where += condition
    } else {
      condition = " and matricule = '" + matricule + "' "
      where += condition
    }
  }
  else {
    matricule = null
  }

  let id_menu;
  if (menu === "Performance Individuelle") {
    id_menu = 1;
  } else if (menu === "Qualité Individuelle") {
    id_menu = 2;
  } else if (menu === "Performance Atelier") {
    id_menu = 3;
  } else if (menu === "Qualité Projet") {
    id_menu = 4;
  } else if (menu === "Retour Client") {
    id_menu = 5;
  } else if (menu === "Retard de Livraison") {
    id_menu = 6;
  }

  if (id_menu != undefined && (id_menu != '' || id_menu != null)) {
    if (id_ligne === null && debut === null && matricule === null) {
      condition = " where zone_enregistrement = " + id_menu + " "
      where += condition
    } else {
      condition = " and zone_enregistrement = " + id_menu + " "
      where += condition
    }
  }
  else {
    id_menu = null
  }

  select = select + where;

  console.log(select)

  const result = await execQuery.executeQuery(pool, select);

  for (let indext = 0; indext < result.length; indext++) {
    var tickets = result[indext].tickets
    if (tickets != null || tickets != null) {
      var ticket = tickets.split(';')
      var liste_tickets = []
      for (let index = 0; index < ticket.length; index++) {
        //get info from kanboard
        if (ticket[index].length !== 0) {
          var num_ticket = ticket[index]
          // var sql_kb = "SELECT t.id AS NumTicket, t.title AS TitreTicket, t.color_id AS Couleur, t.priority AS Priorite, t.category_id AS Categorie_id, FROM_UNIXTIME(t.date_creation, '%Y-%m-%d') AS Date_creation, FROM_UNIXTIME(t.date_due, '%Y-%m-%d') AS Delai, FROM_UNIXTIME(t.date_modification, '%Y-%m-%d') AS Date_modification, FROM_UNIXTIME(t.date_started, '%Y-%m-%d') AS date_debut, t.project_id AS Projet_id, p.name AS Projet_nom, t.column_id AS Avancement_id, c.title AS Avancement, t.owner_id AS Utilsateur_assigne_id, o.name AS Utilsateur_assigne_nom, t.swimlane_id AS Swimlan_id, s.name AS Swimlan_nom, t.creator_id AS Utilsateur_createur_id, u.name AS Pilote, FROM_UNIXTIME(t.date_completed, '%Y-%m-%d') AS Date_completion, p.end_date AS date_fin FROM `tasks` t INNER JOIN projects p ON p.id = t.project_id INNER JOIN swimlanes s ON s.id = t.swimlane_id INNER JOIN `columns` c ON c.id = t.column_id INNER JOIN users u ON u.id = t.creator_id INNER JOIN users o ON o.id = t.owner_id WHERE t.id = " + num_ticket + " ORDER BY t.id desc"
          if (num_ticket !== 'null') {
            const sql_kb = "SELECT pilote, delai, action, avancement FROM kanboard WHERE num_ticket = '" + num_ticket + "'"
            const result_kb = await execQuery.executeQuery(pool, sql_kb)
            if (Object.keys(result_kb).length > 0) {
              result_kb[0].num_ticket = num_ticket
              liste_tickets.push(JSON.stringify(result_kb[0]));
            }
          }
        }
      }
      result[indext].liste_tickets = liste_tickets
    }
    switch (result[indext].zone_enregistrement) {
      case 1:
        result[indext].zone_enregistrement_libelle = "Performance individuelle"
        break;
      case 2:
        result[indext].zone_enregistrement_libelle = "Qualité individuelle"
        break;
      case 3:
        result[indext].zone_enregistrement_libelle = "Performance atelier"
        break;
      case 4:
        result[indext].zone_enregistrement_libelle = "Qualité projet"
        break;
      case 5:
        result[indext].zone_enregistrement_libelle = "Retour client"
        break;
      case 6:
        result[indext].zone_enregistrement_libelle = "Retard de livraison"
        break;

    }
  }
  var donnee = { "result": result }
  var dataStringfy = JSON.stringify(donnee)
  res.status(200).send(dataStringfy);

};


const getMatricule = async (req, res) => {
  const sql_matricule = "select distinct(matricule)  from plan_action order by matricule"
  const result_matricule = await execQuery.executeQuery(pool, sql_matricule);
  var donnee = { "result_matricule": result_matricule }
  var dataStringfy = JSON.stringify(donnee)
  res.status(200).send(dataStringfy);
}

const getZoneEnregistrement = async (req, res) => {
  const sql_zone_enregistrement = "select rang_menu, nom_menu  from menu where rang_menu between '3' and '8'order by rang_menu "
  const result_zone_enregistrement = await execQuery.executeQuery(pool, sql_zone_enregistrement);
  var donnee = { "result_zone_enregistrement": result_zone_enregistrement }
  var dataStringfy = JSON.stringify(donnee)
  res.status(200).send(dataStringfy);

}

module.exports = { getdetailkanboard, insertPlanAction, affichagePlanAction, affichagePlanSActions, getPlanActions, getMatricule, getZoneEnregistrement }
