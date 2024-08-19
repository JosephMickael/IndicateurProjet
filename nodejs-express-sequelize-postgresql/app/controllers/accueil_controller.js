const { range } = require("rxjs");
const pool = require("../config/db.config");
const poolGpao = require("../config/db.configpgGpao");
const execQuery = require("./executeQuery_controller");


// Get liste annee
const getlisteAnnee = (req, res, next) => {
  pool.query(
    "SELECT EXTRACT('Year' FROM CURRENT_DATE)",
    [],
    function (err, result) {
      if (err) {
        res.status(400).send(err);
      }
      if (Object.keys(result).length > 0) {
        res.status(200).send(result.rows);
      } else {
        res.status(200).send();
      }
    }
  );
};

// Get liste ligne
const getlisteligne = (req, res, next) => {
  pool.query(
    "select distinct id_ligne,lib_ligne as libelle from geo.vue_activite_geo where id_type_operation='6'",
    // "select distinct id_ligne,lib_ligne as libelle from geo.ligne order by id_ligne asc",
    [],
    function (err, result) {
      if (err) {
        res.status(400).send(err);
      }
      if (Object.keys(result).length > 0) {
        res.status(200).send(result.rows);
      } else {
        res.status(200).send();
      }
    }
  );
};

const getlisteplan = (req, res, next) => {
  const id_ligne = req.body.id_ligne;
  pool.query(
    "select distinct lib_plan as libelle,id_plan from geo.vue_activite_geo where id_ligne= $1 and id_type_operation='6' and lib_plan<>'MIS' order by libelle",
    // "select distinct lib_plan as libelle,id_plan from geo.plan where id_ligne= $1 order by libelle",
    [id_ligne],
    function (err, result) {
      if (err) {
        res.status(400).send(err);
      }
      if (Object.keys(result).length > 0) {
        res.status(200).send(result.rows);
      } else {
        res.status(200).send();
      }
    }
  );
};

const getlisteFonction = (req, res, next) => {
  const id_ligne = req.body.id_ligne;
  const id_plan = req.body.id_plan;
  pool.query(
    "select distinct lib_fonction as libelle,id_fonction from geo.vue_activite_geo where id_ligne= $1 and id_plan= $2 and id_type_operation='6' and lib_plan<>'MIS' order by libelle",
    // "select distinct lib_fonction as libelle,id_fonction from geo. where id_ligne= $1 and id_plan= $2 and id_type_operation='6' and lib_plan<>'MIS' order by libelle",
    // select distinct lib_fonction as libelle,id_fonction from geo.vue_activite_geo where id_ligne_ligne='$variable_ligne' and id_plan= '$variable_plan' and id_type_operation='6' and lib_plan<>'MIS' order by libelle
    [id_ligne, id_plan],
    function (err, result) {
      if (err) {
        res.status(400).send(err);
      }
      if (Object.keys(result).length > 0) {
        res.status(200).send(result.rows);
      } else {
        res.status(200).send();
      }
    }
  );
};


const getlisteOperation = (req, res, next) => {
  const id_ligne = req.body.id_ligne;
  const id_plan = req.body.id_plan;
  const id_fonction = req.body.id_fonction;
  var sql = "select distinct lib_operation as libelle,id_operation from geo.vue_activite_geo where id_ligne= '" + id_ligne + "' and id_plan= '" + id_plan + "' and id_fonction = '" + id_fonction + "' and lib_plan<>'MIS' and id_type_operation = '6' order by id_operation";
  // var sql = "select distinct lib_operation as libelle,id_operation from geo where id_ligne= '" + id_ligne + "' and id_plan= '" + id_plan + "' and id_fonction = '" + id_fonction + "' and lib_plan<>'MIS' and id_type_operation = '6' and id_type_act = 'DP' order by id_operation";
  pool.query(
    sql, [],
    function (err, result) {
      if (err) {
        res.status(400).send(err);
      }
      if (result != null || Object.keys(result).length > 0) {
        res.status(200).send(result.rows);
      } else {
        res.status(200).send();
      }
    }
  );
};
const LesOperations = async (id_ligne, id_plan, id_fonction) => {
  var sql = "select distinct lib_operation as libelle,id_operation from geo.vue_activite_geo where id_ligne= '" + id_ligne + "' and id_plan= '" + id_plan + "' and id_fonction = '" + id_fonction + "' and lib_plan<>'MIS' and id_type_operation = '6' order by id_operation";
  // var sql = "select distinct lib_operation as libelle,id_operation from geo where id_ligne= '" + id_ligne + "' and id_plan= '" + id_plan + "' and id_fonction = '" + id_fonction + "' and lib_plan<>'MIS' and id_type_operation = '6' order by id_operation";
  const result = await execQuery.executeQuery(pool, sql);
  return result;
};


const OperationListe = async (id_ligne, id_plan, id_fonction) => {
  var sql = "select distinct lib_operation as libelle,id_operation from geo.vue_activite_geo where id_ligne= '" + id_ligne + "' and id_plan= '" + id_plan + "' and id_fonction = '" + id_fonction + "' and lib_plan<>'MIS' and id_type_operation = '6' order by id_operation";
  // var sql = "select distinct lib_operation as libelle,id_operation from geo where id_ligne= '" + id_ligne + "' and id_plan= '" + id_plan + "' and id_fonction = '" + id_fonction + "' and lib_plan<>'MIS' and id_type_operation = '6' and id_type_act = 'DP' order by id_operation";
  const result = await execQuery.executeQuery(pool, sql);
  const ArrayListResutat = [];
  result.forEach(element => {
    ArrayListResutat.push(element.id_operation)
  });
  return ArrayListResutat.join("','")
};

module.exports = { getlisteligne, getlisteplan, getlisteFonction, getlisteAnnee, getlisteOperation, OperationListe, LesOperations };
