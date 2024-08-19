const { range } = require("rxjs");
const pool = require("../config/db.config");
const poolGPAO = require("../config/db.configpgGpao");
const execQuery = require("./executeQuery_controller");
const accueilLPF = require("./accueil_controller");
const { id } = require("date-fns/locale");
const objecifCadence = require("./perfomance_individuelle_controller");

const ifNotEmpy = (result) => {
    var mybool = false
    if (Object.keys(result).length > 0)
        mybool = true
    return mybool
}

const aterlierPerformanceFunction = async (req, res, next) => {
    const id_ligne = req.body.id_ligne;
    const id_plan = req.body.id_plan
    const id_fonction = req.body.id_fonction
    const debut = req.body.debut
    const fin = req.body.fin

    //get opération from gpao
    const operation = await accueilLPF.LesOperations(id_ligne, id_plan, id_fonction);

    //get rang
    for (let index = 0; index < operation.length; index++) {
        const op = operation[index].id_operation
        var sql_rang = "select rang from atelier_param_rang where id_ligne = '" + id_ligne + "' and id_plan = '" + id_plan + "' and id_fonction = '" + id_fonction + "' and id_operation = '" + op + "' ";
        const result_rang = await execQuery.executeQuery(pool, sql_rang);
        if (ifNotEmpy(result_rang)) {
            operation[index].rang = result_rang[0].rang
        } else {
            operation[index].rang = null
        }
    }
    operation.sort((a, b) => a.rang - b.rang);

    //get liste date
    const startDate = new Date(debut);
    const endDate = new Date(fin);

 
    //insérer liste date dans chaque operation
    for (let index = 0; index < operation.length; index++) {
        // operation[index].liste_date = liste_date
        operation[index].liste_date = []       
        for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
            const formattedDate = currentDate.toISOString().slice(0, 10);
            operation[index].liste_date.push({ date: formattedDate,id_operation:operation[index].id_operation });
        }
    }

    //initialisation
    for (let index = 0; index < operation.length; index++) {
        var l_date = operation[index].liste_date
        var id_operation = operation[index].id_operation
        for (let j = 0; j < l_date.length; j++) {
            operation[index].liste_date[j].prevision = 0
            operation[index].liste_date[j].reception = 0
            operation[index].liste_date[j].volume = 0 //production
            operation[index].liste_date[j].temps = 0
            operation[index].liste_date[j].objectif_cadence = 0
            operation[index].liste_date[j].cadence = 0
        }
    }

    for (let index = 0; index < operation.length; index++) {
        var l_date = operation[index].liste_date
        for (let j = 0; j < l_date.length; j++) {
            //get numero jour
            operation[index].liste_date[j].number_date = await checkNumberDate(operation[index].liste_date[j].date);
            operation[index].liste_date[j].number_semaine = await checkNumberSemaine(operation[index].liste_date[j].date);
        }
    }
    //remove samedi    
    for (let index = 0; index < operation.length; index++) {
        var l_date = operation[index].liste_date
        for (let j = 0; j < l_date.length; j++) {
            if (operation[index].liste_date[j].number_date == 6) {
                operation[index].liste_date.splice(j, 1)
            }
        }
    }
    //remove dimanche    
    for (let index = 0; index < operation.length; index++) {
        var l_date = operation[index].liste_date
        for (let j = 0; j < l_date.length; j++) {
            if (operation[index].liste_date[j].number_date == 7) {
                operation[index].liste_date.splice(j, 1)
            }
        }
    }




  
    //get data from base
    for (let index = 0; index < operation.length; index++) {            
        for (let j = 0; j < operation[index].liste_date.length; j++) {
            var sql = "select recepssion as reception,temps,volume,cadence,to_char(date_recup,'YYYY-MM-DD') as date_recup from performance_atelier where id_ligne = '" + id_ligne + "' and id_plan = '" + id_plan + "' and id_fonction = '" + id_fonction + "' and id_operation = '" + operation[index].liste_date[j].id_operation + "' and date_recup = '" + operation[index].liste_date[j].date + "'"            
            const resSelect = await execQuery.executeQuery(pool, sql)            
            if (Object.keys(resSelect).length > 0) {
                //  console.log('recepti',resSelect[0].reception + " - " + resSelect[0].temps)                
                 operation[index].liste_date[j].temps = resSelect[0].temps
                 operation[index].liste_date[j].volume = resSelect[0].volume
                 operation[index].liste_date[j].cadence = resSelect[0].cadence
                 operation[index].liste_date[j].reception = resSelect[0].reception

            } else {
                operation[index].liste_date[j].temps = 0
                operation[index].liste_date[j].volume = 0
                operation[index].liste_date[j].cadence = 0
                operation[index].liste_date[j].reception = 0
            }
        }
    }

    
    //get data prevision
    for (let index = 0; index < operation.length; index++) {                
        for (let j = 0; j < operation[index].liste_date.length; j++) {
            var sql = "select * from atelier_param_prevision_daily where id_ligne = '" + id_ligne + "' and id_plan = '" + id_plan + "' and id_fonction = '" + id_fonction + "' and id_operation = '" + operation[index].liste_date[j].id_operation + "' and date_recup = '" + operation[index].liste_date[j].date + "'"
            // console.log(sql);
            const resSelect = await execQuery.executeQuery(pool, sql)
            if (ifNotEmpy(resSelect)) {
                operation[index].liste_date[j].prevision = resSelect[0].prevision
            }
        }
    }
    //get objecticadence
    for (let index = 0; index < operation.length; index++) {      
        for (let j = 0; j < l_date.length; j++) {
            operation[index].liste_date[j].objectif_cadence = await objecifCadence.getCadenceObjGpao(poolGPAO, id_ligne, id_plan, id_fonction, operation[index].liste_date[j].id_operation)
        }
    }
 
   

    //ajout semaine    
    for (let index = 0; index < operation.length; index++) {
        let newListeDate = []     
        var somme_prevision = 0;
        var somme_reception = 0;
        var somme_volume = 0;
        var somme_temps = 0;
        var somme_cadence = 0;
        for (let j = 0; j < operation[index].liste_date.length; j++) {
            somme_prevision += operation[index].liste_date[j].prevision
            somme_reception += operation[index].liste_date[j].reception
            somme_volume += operation[index].liste_date[j].volume
            somme_temps += operation[index].liste_date[j].temps
            somme_cadence += operation[index].liste_date[j].cadence
            if (operation[index].liste_date[j].number_date == 5) {
                newListeDate.push(operation[index].liste_date[j])
                console.log(somme_volume / somme_temps)
                //newListeDate.push({ date: '1970-01-01', numero_semaine: operation[index].liste_date[j].number_semaine, prevision: somme_prevision, reception: somme_reception, volume: somme_volume, temps: somme_temps, objectif_cadence: operation[index].liste_date[j].objectif_cadence, cadence: somme_cadence })
                newListeDate.push({ date: '1970-01-01', numero_semaine: operation[index].liste_date[j].number_semaine, prevision: somme_prevision, reception: somme_reception, volume: somme_volume, temps: somme_temps, objectif_cadence: operation[index].liste_date[j].objectif_cadence, cadence: somme_volume / somme_temps  })
                somme_prevision = 0
                somme_reception = 0
                somme_volume = 0
                somme_temps = 0
                somme_cadence = 0
            } else {
                newListeDate.push(operation[index].liste_date[j])
            }
        }
        operation[index].liste_new_date = newListeDate
    }
  
    // res.status(200).send(operation)
    // // console.log(operation)
    // return;


    var donnee = { "liste_date": operation[0].liste_new_date, "operations": operation } 
    var dataStringfy = JSON.stringify(donnee)

    res.status(200).send(dataStringfy);
};


const checkNumberDate = async (date) => {
    var sql = "SELECT EXTRACT(ISODOW FROM '" + date + "'::date) AS jour_de_la_semaine;";
    const result = await execQuery.executeQuery(pool, sql);
    return result[0].jour_de_la_semaine
}

const checkNumberSemaine = async (date) => {
    var sql = " SELECT EXTRACT(WEEK FROM '" + date + "'::date) AS numero_semaine";
    const result = await execQuery.executeQuery(pool, sql);
    return result[0].numero_semaine
}

const inserReception = async (req, res) => {
    const { Obj } = req.body
    const { id_ligne, lib_ligne, id_plan, lib_plan, id_fonction, lib_fonction, id_operation, lib_operation, reception, date } = Obj


    const selectReception = "SELECT * FROM performance_atelier WHERE id_ligne = '" + id_ligne + "' and id_plan = '" + id_plan + "' and id_fonction = '" + id_fonction + "' and id_operation = '" + id_operation + "' and date_recup = '" + date + "' "

    const resSelect = await execQuery.executeQuery(pool, selectReception)
    // console.log(resSelect)
    // return;

    let receptionSql
    if (Object.keys(resSelect).length > 0) {
        receptionSql = "UPDATE performance_atelier SET recepssion = " + reception + " WHERE id_ligne = '" + id_ligne + "' and id_plan = '" + id_plan + "' and id_fonction = '" + id_fonction + "' and id_operation = '" + id_operation + "' and date_recup = '" + date + "'"
        console.log("updated")
    } else {
        receptionSql = "insert into performance_atelier(id_ligne, libelle_ligne,  id_plan,  libelle_plan,  id_fonction,  libelle_fonction,  id_operation,  libelle_operation, recepssion, date_recup) values ('" + id_ligne + "',  '" + lib_ligne + "',  '" + id_plan + "',  '" + lib_plan + "',  '" + id_fonction + "',  '" + lib_fonction + "',  '" + id_operation + "',  '" + lib_operation + "',  " + reception + ", '" + date + "' )"
        console.log("inserted")
    }
    await execQuery.executeQuery(pool, receptionSql)

    var donnee = { message : "Enregistrement effectué" }
    var dataStringfy = JSON.stringify(donnee)

    res.status(200).send(dataStringfy);
}

const insertPrevision = async (req, res) => {
    const { Obj } = req.body

    const obj = JSON.parse(Obj)

    let { id_ligne, id_plan, id_fonction, id_operation, prevision, date } = obj

    if (prevision === '') {
        prevision = 0
    }
    
    const selectReception = "SELECT * FROM atelier_param_prevision_daily WHERE id_ligne = '" + id_ligne + "' and id_plan = '" + id_plan + "' and id_fonction = '" + id_fonction + "' and id_operation = '" + id_operation + "' and date_recup = '" + date + "' "
    
    const resSelect = await execQuery.executeQuery(pool, selectReception)
    // console.log(resSelect)
    // return;
    
    let receptionSql
    if (Object.keys(resSelect).length > 0) {
        receptionSql = "UPDATE atelier_param_prevision_daily SET prevision = " + prevision + " WHERE id_ligne = '" + id_ligne + "' and id_plan = '" + id_plan + "' and id_fonction = '" + id_fonction + "' and id_operation = '" + id_operation + "' and date_recup = '" + date + "'"       
    } else {
        receptionSql = "insert into atelier_param_prevision_daily(id_ligne, id_plan, id_fonction,  id_operation,  prevision, date_recup) values ('" + id_ligne + "',  '" + id_plan + "', '" + id_fonction + "', '" + id_operation + "'," + prevision + ", '" + date + "' )"
        console.log("inserted")
    }
    await execQuery.executeQuery(pool, receptionSql)
    var donnee = { message : "Enregistrement effectué" }
    var dataStringfy = JSON.stringify(donnee)

    res.status(200).send(dataStringfy);
}

module.exports = { aterlierPerformanceFunction, inserReception,insertPrevision };