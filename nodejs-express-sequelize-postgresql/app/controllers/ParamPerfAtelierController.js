const axios = require("axios");
const pool = require("../config/db.config");
const poolGPAO = require("../config/db.configpgGpao");
const execQuery = require("./executeQuery_controller");
const accueilController = require("./accueil_controller")
const moment = require('moment');
const { id } = require("date-fns/locale");
const bilanp = require("./bilan_controller");
const { isEmpty } = require("rxjs");
// import { getISOWeeksInYear, getISOWeek } from 'date-fns';


moment.locale('fr');
const ifNotEmpy = (result) => {
    var mybool = false
    if (Object.keys(result).length > 0)
        mybool = true
    return mybool
}
const paramPerformanceAtelier = async (req, res) => {
    const { id_ligne, id_plan, id_fonction, annee } = req.body

    //get liste dans param si existe
    var sql_param = "select * from atelier_param_rang where id_ligne = '" + id_ligne + "' and id_plan = '" + id_plan + "' and id_fonction = '" + id_fonction + "' order by rang asc "
    const result = await execQuery.executeQuery(pool, sql_param);
    var operationListe = []
    var message = ""
    var maclasse = 0
    if (ifNotEmpy(result)) {
        message = "Rang déjà paramétré(étape intiale)"
        maclasse = 1
        operationListe = result
    } else {
        //get liste dans gpao
        message = "Rang non paramétré pour étape initiale"
        maclasse = 0
        operationListe = await accueilController.LesOperations(id_ligne, id_plan, id_fonction)
        for (let index = 0; index < operationListe.length; index++) {
            operationListe[index].rang = null;
            operationListe[index].libelle_operation = operationListe[index].libelle;
        }
    }

    //get resultat from param
    const getREsultatParam = await affichageParamResultat(id_ligne, id_plan, id_fonction, annee);
    var donnee = { "message": message, "maclasse": maclasse, "operations": operationListe, "param": getREsultatParam }
    var dataStringfy = JSON.stringify(donnee)

    res.status(200).send(dataStringfy);
}

const insertparamPerformanceAtelier = async (req, res) => {
    const { id_ligne, id_plan, id_fonction, operations } = req.body
    var opertionLoop = JSON.parse(operations);
    for (let index = 0; index < opertionLoop.length; index++) {
        const id_operation = opertionLoop[index].id_operation
        const libelle_operation = opertionLoop[index].libelle
        var selectOperation = `SELECT * FROM atelier_param_rang where id_ligne = '${id_ligne}' and id_plan = '${id_plan}' and id_fonction = '${id_fonction}' and id_operation = '${id_operation}'`
        const resSelect = await execQuery.executeQuery(pool, selectOperation)
        if (Object.keys(resSelect).length > 0) {
            const updateOperation = `UPDATE atelier_param_rang SET rang = ${index + 1} WHERE id_ligne = '${id_ligne}' and id_plan = '${id_plan}' and id_fonction = '${id_fonction}' and id_operation = '${id_operation}'`
            await execQuery.executeQuery(pool, updateOperation)
        } else {
            const insertOperation = `INSERT INTO atelier_param_rang (id_ligne, id_plan, id_fonction, id_operation, libelle_operation, rang) VALUES ('${id_ligne}', '${id_plan}', '${id_fonction}', '${id_operation}', '${libelle_operation}', ${index + 1})`
            await execQuery.executeQuery(pool, insertOperation)
        }
    }
    res.status(200).send({text: 'ok'})
}
const affichageParamResultat = async (id_ligne, id_plan, id_fonction, annee) => {
    var sql = "select * from atelier_param_prevision_config where id_ligne='" + id_ligne + "' and id_plan='" + id_plan + "' and id_fonction='" + id_fonction + "' and annee='" + annee + "'";
    var resultat = await execQuery.executeQuery(pool, sql);
    return resultat;
}
const SelectFrequenceparamPerformanceAtelier = async (req, res) => {
    let { frequence, annee } = req.body
    let resultat = []
    frequence = parseInt(frequence)
    switch (frequence) {
        case 1:
            // resultat =   ListWeeks();
            break;
        case 2:
            resultat = await ListWeeks(annee);
            break;
        case 3:
            resultat = await ListMonths();
            break;
    }

    for (let index = 0; index < resultat.length; index++) {
        resultat[index].checkedbox = false;
        resultat[index].valeur = null;
    }
    var donnee = { "resultat": resultat }
    var dataStringfy = JSON.stringify(donnee)

    res.status(200).send(dataStringfy);
}
const insertPrevisionParam = async (req, res) => {
    const { obj } = req.body
    var Jsonobj = JSON.parse(obj)
    var id_ligne = Jsonobj.id_ligne
    var id_plan = Jsonobj.id_plan
    var id_fonction = Jsonobj.id_fonction
    var annee = Jsonobj.annee
    var type_frequence = parseInt(Jsonobj.type_frequence)
    var toutCocherValue = Jsonobj.toutCocherValue
    var liste_Operation = Jsonobj.liste_Operation
    var id_Operation = Jsonobj.liste_Operation[0].id_operation
    var liste_frequence = Jsonobj.liste_frequence
    var resultat = "";

    //effacer les prévisions antérieures
    const supprimer = await deletePrevision(annee, id_ligne, id_plan, id_fonction, id_Operation, toutCocherValue);

    switch (type_frequence) {
        case 1:
            resultat = await insertJournalier(annee, id_ligne, id_plan, id_fonction, id_Operation, toutCocherValue);
            break;
        case 2:
            resultat = await insertWeeks(annee, id_ligne, id_plan, id_fonction, id_Operation, liste_frequence);
            break;
        case 3:
            resultat = await insertMonths(annee, id_ligne, id_plan, id_fonction, id_Operation, liste_frequence);
            break;
    }

    let result = 0;
    let message
    if (resultat == 1) { //insertion dans config
        result = await insertInPerformanceConfig(annee, id_ligne, id_plan, id_fonction, id_Operation, type_frequence, toutCocherValue, liste_frequence);
    }
    if (result == 1) {
        message = "Enregistrement terminé"
    }
    var donnee = { "message": message }
    var dataStringfy = JSON.stringify(donnee)

    res.status(200).send(dataStringfy);
}

const ListMonths = async (req, res) => {
    //get par défaut mois
    const list = await bilanp.listMois()[0].monthsNumberString;
    return list
}
const ListWeeks = async (annee) => {
    //get par défaut week end
    var sql = "SELECT EXTRACT(WEEK FROM generate_series(" +
        "DATE '" + annee + "-01-01'," +
        "DATE '" + annee + "-12-31'," +
        "INTERVAL '1 week'" +
        ")) AS mois " +
        "ORDER BY mois; ";
    // const weeksInYear = await getISOWeeksInYear(new Date(annee, 0, 1));
    const weeksInYear = await execQuery.executeQuery(pool, sql);
    for (let index = 0; index < weeksInYear.length; index++) {
        weeksInYear[index].mois = "Semaine_" + weeksInYear[index].mois
    }
    return weeksInYear
}

//toute insertion
const deletePrevision = async (annee, id_ligne, id_plan, id_fonction, id_operation, type_frequence, toutCocherValue, liste_frequence) => {
    var sql = "delete from atelier_param_prevision_daily where  id_ligne ='" + id_ligne + "' and id_plan ='" + id_plan + "' and id_fonction ='" + id_fonction + "' and id_operation ='" + id_operation + "' and EXTRACT(YEAR FROM date_recup) = '" + annee + "'";
    console.log(sql)
    await execQuery.executeQuery(pool, sql);

}

//toute insertion
const insertInPerformanceConfig = async (annee, id_ligne, id_plan, id_fonction, id_operation, type_frequence, toutCocherValue, liste_frequence) => {
    //insertion 
    var data = "";
    switch (type_frequence) {
        case 1:
            data = toutCocherValue
            break;
        case 2 :
            data = JSON.stringify(liste_frequence)
            break;
        case 3:
            data = JSON.stringify(liste_frequence)
            break;
    }

    console.log(data)
    var sql_existe = "select * from atelier_param_prevision_config where  id_ligne ='" + id_ligne + "' and id_plan ='" + id_plan + "' and id_fonction ='" + id_fonction + "' and annee = '" + annee + "'";

    const resultat_existe = await execQuery.executeQuery(pool, sql_existe);

    var insertUpdate = "";
    if (Object.keys(resultat_existe).length > 0) {
        insertUpdate = "update atelier_param_prevision_config set data = '" + data + "', type_prevision = " + type_frequence + " where  id_ligne ='" + id_ligne + "' and id_plan ='" + id_plan + "' and id_fonction ='" + id_fonction + "' and annee = '" + annee + "'";
    } else {
        insertUpdate = "insert into atelier_param_prevision_config(id_ligne,id_plan,id_fonction,annee,type_prevision,data)values('" + id_ligne + "','" + id_plan + "','" + id_fonction + "','" + annee + "'," + type_frequence + ",'" + data + "')";
    }
    const resultat_InsertUpdate = await execQuery.executeQuery(pool, insertUpdate);
    return 1
}
//toute insertion
const insertJournalier = async (annee, id_ligne, id_plan, id_fonction, id_operation, toutCocherValue) => {
    const les365jrs = await jrs365(annee);
    for (let index = 0; index < les365jrs.length; index++) {
        var date = les365jrs[index].date
        var sql_existe = "select * from atelier_param_prevision_daily where id_ligne = '" + id_ligne + "' and id_plan = '" + id_plan + "' and id_fonction = '" + id_fonction + "'and id_operation = '" + id_operation + "' and date_recup = '" + date + "'";
        const resultat = await execQuery.executeQuery(pool, sql_existe)
        var insertUpdate = "";
        if (Object.keys(resultat).length > 0) {
            //update
            insertUpdate = "update atelier_param_prevision_daily set prevision=" + toutCocherValue + "where id_ligne = '" + id_ligne + "' and id_plan = '" + id_plan + "' and id_fonction = '" + id_fonction + "' and date_recup = '" + date + "'";
        } else {
            //insert
            insertUpdate = "insert into atelier_param_prevision_daily (id_ligne,id_plan,id_fonction,id_operation,date_recup,prevision)values('" + id_ligne + "','" + id_plan + "','" + id_fonction + "','" + id_operation + "','" + date + "'," + toutCocherValue + ")";
        }
        await execQuery.executeQuery(pool, insertUpdate)

    }
    return 1
}
const insertWeeks = async (annee, id_ligne, id_plan, id_fonction, id_operation, liste_frequence) => {
    for (let index = 0; index < liste_frequence.length; index++) {
        if (liste_frequence[index].checkedbox == true) {
            var sem = liste_frequence[index].mois;
            var valeur = liste_frequence[index].valeur;
            if (valeur != null || valeur != '') {
                valeur = valeur / 5;
                var liste_jour = await getalldatesbetweenWeek(annee, sem);
                for (let j = 0; j < liste_jour.length; j++) {
                    //insertion journaliére chaque date
                    var date = liste_jour[j].currentdate
                    var sql_existe = "select * from atelier_param_prevision_daily where id_ligne = '" + id_ligne + "' and id_plan = '" + id_plan + "' and id_fonction = '" + id_fonction + "'and id_operation = '" + id_operation + "' and date_recup = '" + date + "'";
                    const resultat = await execQuery.executeQuery(pool, sql_existe)
                    var insertUpdate = "";
                    if (Object.keys(resultat).length > 0) {
                        //update
                        insertUpdate = "update atelier_param_prevision_daily set prevision=" + valeur + "where id_ligne = '" + id_ligne + "' and id_plan = '" + id_plan + "' and id_fonction = '" + id_fonction + "' and date_recup = '" + date + "'";
                    } else {
                        //insert
                        insertUpdate = "insert into atelier_param_prevision_daily (id_ligne,id_plan,id_fonction,id_operation,date_recup,prevision)values('" + id_ligne + "','" + id_plan + "','" + id_fonction + "','" + id_operation + "','" + date + "'," + valeur + ")";
                    }
                    await execQuery.executeQuery(pool, insertUpdate)
                }
            }
        }
    }
    return 1
}
const getalldatesbetweenWeek = async (annee, semaine) => {
    var semaine_split = semaine.split("_");
    semaine_split = parseInt(semaine_split[1]);
    var sql = "WITH RECURSIVE WeekDates AS ( " +
        "SELECT TO_CHAR(DATE '" + annee + "-01-01' + (" + semaine_split + " - 1) * 7 + INTERVAL '1' DAY, 'YYYY-MM-DD') AS CurrentDate " +
        "UNION ALL " +
        "SELECT TO_CHAR(CurrentDate::date + INTERVAL '1' DAY, 'YYYY-MM-DD') " +
        "FROM WeekDates " +
        "WHERE CurrentDate::date + INTERVAL '1' DAY <= DATE '" + annee + "-01-01' + (" + semaine_split + " - 1) * 7 + INTERVAL '7' DAY " +
        ") " +
        "SELECT CurrentDate " +
        "FROM WeekDates; ";
    const resulat = await execQuery.executeQuery(pool, sql);
    return resulat;
}

const insertMonths = async (annee, id_ligne, id_plan, id_fonction, id_operation, liste_frequence) => {
    for (let index = 0; index < liste_frequence.length; index++) {
        if (liste_frequence[index].checkedbox == true) {
            var mois = liste_frequence[index].mois;
            var num_mois = liste_frequence[index].numero;
            var valeur = liste_frequence[index].valeur;
            if (valeur != null || valeur != '') {
                var liste_jour = await getalldatesbetweenMonths(annee, num_mois);
                valeur = valeur / liste_jour.length;

                for (let j = 0; j < liste_jour.length; j++) {
                    //insertion journaliére chaque date
                    var date = liste_jour[j].date
                    var sql_existe = "select * from atelier_param_prevision_daily where id_ligne = '" + id_ligne + "' and id_plan = '" + id_plan + "' and id_fonction = '" + id_fonction + "'and id_operation = '" + id_operation + "' and date_recup = '" + date + "'";
                    const resultat = await execQuery.executeQuery(pool, sql_existe)
                    var insertUpdate = "";
                    if (Object.keys(resultat).length > 0) {
                        //update
                        insertUpdate = "update atelier_param_prevision_daily set prevision=" + valeur + "where id_ligne = '" + id_ligne + "' and id_plan = '" + id_plan + "' and id_fonction = '" + id_fonction + "' and date_recup = '" + date + "'";
                    } else {
                        //insert
                        insertUpdate = "insert into atelier_param_prevision_daily (id_ligne,id_plan,id_fonction,id_operation,date_recup,prevision)values('" + id_ligne + "','" + id_plan + "','" + id_fonction + "','" + id_operation + "','" + date + "'," + valeur + ")";
                    }
                    await execQuery.executeQuery(pool, insertUpdate)
                }
            }
        }
    }
    return 1
}
const getalldatesbetweenMonths = async (annee, mois) => {

    var sql = `WITH RECURSIVE DateList AS (
        SELECT TO_CHAR('${annee}-${mois}-01'::timestamp, 'YYYY-MM-DD')::DATE AS Date
        UNION ALL
        SELECT TO_CHAR((Date + INTERVAL '1 DAY')::timestamp, 'YYYY-MM-DD')::DATE
        FROM DateList
        WHERE Date + INTERVAL '1 DAY' <= (SELECT TO_CHAR(DATE_TRUNC('MONTH', '${annee}-${mois}-01'::DATE) + INTERVAL '1 MONTH - 1 DAY', 'YYYY-MM-DD'))::DATE
    )
    
    SELECT TO_CHAR(Date, 'YYYY-MM-DD') AS Date
    FROM DateList
    WHERE EXTRACT(DOW FROM Date) NOT IN (0, 6);
    `;
    console.log(sql)
    const resulat = await execQuery.executeQuery(pool, sql);
    return resulat;
}

const jrs365 = async (annee) => {
    var sql = " SELECT TO_CHAR(generate_series, 'YYYY-MM-DD') AS date " +
        " FROM generate_series( " +
        "'" + annee + "-01-01'::date,  " +
        "'" + annee + "-12-31'::date,  " +
        "'1 day'::interval " +
        ") generate_series";
    const resultat = await execQuery.executeQuery(pool, sql);
    return resultat;
}

const jourFerie = async (date) => {
    var mybool = false;
    var sql = "select jour_f from ferie where jour_f = '" + date + "'";
    const resultat = await execQuery.executeQuery(pool, sql);
    if (Object.keys(resultat).length > 0) {
        mybool = true
    }
    return mybool;
}

module.exports = { paramPerformanceAtelier, insertparamPerformanceAtelier, SelectFrequenceparamPerformanceAtelier, insertPrevisionParam }
