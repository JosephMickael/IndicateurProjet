const axios = require("axios");
const pool = require("../config/db.config");
const poolGPAO = require("../config/db.configpgGpao");
const execQuery = require("./executeQuery_controller");
const accueilController = require("./accueil_controller")
const moment = require('moment');
moment.locale('fr');

const getOperations = async (req, res, next) => {
    const { id_ligne, id_plan, id_fonction, selectedParametre, selectedSemaine, selectedMonths, annee } = req.body;

    const operationListe = await accueilController.OperationListe(id_ligne, id_plan, id_fonction);

    const sql = `SELECT distinct libelle_operation as libelle, id_operation, rang FROM performance_atelier WHERE id_ligne = '${id_ligne}' and id_plan = '${id_plan}' and id_fonction = '${id_fonction}' and id_operation in ('` + operationListe + `') ORDER BY rang`;
    const result = await execQuery.executeQuery(pool, sql);

    let dates;

    if (selectedParametre === 'hebdomadaire') {
        dates = recupJourSemaine(selectedSemaine, annee);
    } else if (selectedParametre === 'mensuel' || selectedParametre === 'journalier') {
        dates = recupJourMensuel(selectedMonths, annee);
    }

    for (let i = 0; i < result.length; i++) {
        const id_operation = result[i].id_operation;

        const selectPrevInitial = `SELECT prev_initial FROM performance_atelier WHERE id_ligne = '${id_ligne}' and id_plan = '${id_plan}' and id_fonction = '${id_fonction}' and id_operation = '${id_operation}' and date_recup = '${dates[0]}'`;

        const resPrevInitial = await execQuery.executeQuery(pool, selectPrevInitial);

        result[i].prev_initial = Object.keys(resPrevInitial).length > 0 ? resPrevInitial[0].prev_initial : null;
    }

    res.status(200).send(result);
};

const addParamAtelier = async (req, res) => {
    const { id_ligne, id_plan, id_fonction, id_operation, prevision, annee, frequence, detail_frequence } = req.body
    let debut = "";
    let fin = ""; 
    let deb_fin = frequence == 0 || frequence == 2 ? recupJourMensuel(detail_frequence, annee) : recupJourSemaine(detail_frequence, annee);         
    debut = deb_fin[0]
    fin = deb_fin[deb_fin.length  - 1]     
    console.log("debut",debut)
    console.log(fin)
    

    const selectAtelierParam = `SELECT * FROM atelier_param WHERE id_ligne = '${id_ligne}' and id_plan = '${id_plan}' and id_fonction = '${id_fonction}' and id_operation = '${id_operation}' and frequence = ${frequence} and detail_frequence = '${detail_frequence}' and date_debut = '${debut}' and date_fin = '${fin}'`
    const resSelect = await execQuery.executeQuery(pool, selectAtelierParam)

    if (prevision === '') {
        prevision = null
    }

    if (Object.keys(resSelect).length > 0) {
        const updateAtelierParam = `UPDATE atelier_param SET prevision = ${prevision} WHERE id_ligne = '${id_ligne}' and id_plan = '${id_plan}' and id_fonction = '${id_fonction}' and id_operation = '${id_operation}' and frequence = ${frequence} and detail_frequence = '${detail_frequence}' and date_debut = '${debut}' and date_fin = '${fin}'`
        await execQuery.executeQuery(pool, updateAtelierParam)
    } else {
        const insertAtelierParam = `INSERT INTO atelier_param (id_ligne, id_plan, id_fonction, id_operation, frequence, detail_frequence, prevision, date_debut, date_fin) VALUES ('${id_ligne}', '${id_plan}', '${id_fonction}', '${id_operation}', ${frequence}, '${detail_frequence}', ${prevision}, '${debut}', '${fin}')`
        await execQuery.executeQuery(pool, insertAtelierParam)
    }
  
}


const insertPrevisionAtelier = async (req, res) => {
    const { previsionData, semaine, typeParametre, mois, annee } = req.body

    console.log(previsionData)

    let previsionValue = parseFloat(previsionData.prevision)

    if (typeParametre === 'hebdomadaire') {
        // console.log('semaine, annee', semaine, annee)
        let dates = recupJourSemaine(semaine, annee)
        let previsionSemaine = previsionValue / 5
        insertDataParametrage(previsionValue, previsionSemaine, dates, previsionData)
    } else if (typeParametre === 'mensuel') {
        let dates = recupJourMensuel(mois, annee)
        let previsionMensuel = previsionValue / 20
        insertDataParametrage(previsionValue, previsionMensuel, dates, previsionData)
    } else {
        let dates = recupJourMensuel(mois, annee)
        let previsionMensuel = previsionValue
        insertDataParametrage(previsionValue, previsionMensuel, dates, previsionData)
    }

    res.status(200).send(previsionData.prevision.toString())

}

const insertDataParametrage = async (prev_initial, dataParametre, dates, parametre) => {
    // console.log(dates)
    if (isNaN(dataParametre)) {
        dataParametre = null
    }

    if (isNaN(prev_initial)) {
        prev_initial = null
    }

    for (let i = 0; i < dates.length; i++) {
        const date = dates[i];

        try {
            const updatePrevisionSql = `UPDATE performance_atelier SET prevision = ${dataParametre}, prev_initial = ${prev_initial} WHERE id_ligne = '${parametre.id_ligne}' and id_plan = '${parametre.id_plan}' and id_fonction = '${parametre.id_fonction}' and id_operation ='${parametre.id_operation}' and date_recup = '${date}'`
            // console.log(updatePrevisionSql)  
            await execQuery.executeQuery(pool, updatePrevisionSql)
            // console.log('inseré')  
        } catch (e) {
            console.log(e)
        }
    }
}

const updateRange = async (req, res) => {
    const { operations, range } = req.body
    let id_ligne = operations.id_ligne;
    let id_plan = operations.id_plan;
    let id_fonction = operations.id_fonction;
    let id_operation = operations.id_operation;

    // console.log(operations)
    // console.log(range)

    const sql_range = `UPDATE performance_atelier set rang = ${range} WHERE id_ligne = '${id_ligne}' and id_plan = '${id_plan}' and id_fonction = '${id_fonction}' and id_operation = '${id_operation}'`
    // console.log(sql_range);  
    await execQuery.executeQuery(pool, sql_range);

    res.status(200).send("mis a jour")
}

const recupJourSemaine = (semaine, annee) => {
    const daysInWeek = [];

    // Convertir les chaînes en nombres
    const anneeNumerique = parseInt(annee, 10);
    const semaineNumerique = parseInt(semaine, 10);

    // Vérifier que les valeurs converties sont valides
    if (isNaN(anneeNumerique) || isNaN(semaineNumerique)) {
        throw new Error('Année ou semaine invalide');
    }

    // Définir la date de début de la semaine (lundi) pour la semaine spécifiée
    const startDate = moment().isoWeekYear(anneeNumerique).isoWeek(semaineNumerique).startOf('isoWeek');

    for (let i = 0; i < 7; i++) {
        const currentDate = startDate.clone().add(i, 'days');
        daysInWeek.push(currentDate.format('YYYY-MM-DD')); // Format au format ISO YYYY-MM-DD
    }
    return daysInWeek;
}

function recupJourMensuel(mois, annee) {
    const moisEnMajuscules = mois.charAt(0).toUpperCase() + mois.slice(1).toLowerCase();

    const dateDebut = moment(`01-${moisEnMajuscules}-${annee}`, 'DD-MMMM-YYYY');
    const joursDansLeMois = dateDebut.daysInMonth();
    const jours = [];

    for (let jour = 1; jour <= joursDansLeMois; jour++) {
        const date = dateDebut.date(jour);
        const dayOfWeek = date.day();

        // Exclure les samedis (6) et dimanches (0)
        // if (dayOfWeek !== 6 && dayOfWeek !== 0) {
            jours.push(date.format('YYYY-MM-DD'));
        // }
    }

    return jours;
}

const insertReception = async (req, res) => {
    let { ReceptionData, value, objreception } = req.body

    const id_ligne = ReceptionData.id_ligne
    const id_plan = ReceptionData.id_plan
    const id_fonction = ReceptionData.id_fonction
    const datas = ReceptionData.performance

    for (let i = 0; i < datas.length; i++) {
        const element = datas[i];

        if (!element.date.includes('SEM')) {
            const selectReceptionjQuery2 = `SELECT reception FROM performance_atelier WHERE id_ligne = '${ReceptionData.id_ligne}' and id_plan = '${ReceptionData.id_plan}' and id_fonction = '${ReceptionData.id_fonction}' and id_operation ='${ReceptionData.id_operation}' and date_recup = '${element.date}'`

            const res = await execQuery.executeQuery(pool, selectReceptionjQuery2)

            if (value !== res[0].reception && value !== '' && Object.keys(res).length > 0) {
                const updateReceptionQuery2 = `UPDATE performance_atelier SET reception = ${objreception.reception} WHERE id_ligne = '${id_ligne}' and id_plan = '${id_plan}' and id_fonction = '${id_fonction}' and id_operation ='${ReceptionData.id_operation}' and date_recup = '${objreception.date}'`

                await execQuery.executeQuery(pool, updateReceptionQuery2)

                // console.log('INSERT TERMINE')
            }

            if (value === '' && Object.keys(res).length > 0) {
                const updateReceptionToZero = `UPDATE performance_atelier SET reception = NULL WHERE id_ligne = '${id_ligne}' and id_plan = '${id_plan}' and id_fonction = '${id_fonction}' and id_operation ='${ReceptionData.id_operation}' and date_recup = '${objreception.date}'`

                await execQuery.executeQuery(pool, updateReceptionToZero)

                // console.log("valeur NULL")
            }
        }
    }
    var donnee = { "liste": "ok" }

    // console.log(donnee)
    var dataStringfy = JSON.stringify(donnee)
    res.status(200).send(dataStringfy);

}

module.exports = { insertPrevisionAtelier, updateRange, getOperations, insertReception, addParamAtelier }
