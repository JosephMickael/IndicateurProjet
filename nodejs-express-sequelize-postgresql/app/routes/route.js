const express = require("express"); //import express
const router = express.Router();

const menuController = require("../controllers/menu_controller");
router.post("/get-menu", menuController.getMenu);
router.post("/get-login", menuController.getLogin);
router.get("/get-max-rang-menu", menuController.getMaxRangMenu);
router.post("/update-menu", menuController.updateMenu);
router.post("/update-rang-menu", menuController.updateRangMenu);
router.post("/supprimer-menu", menuController.supprimerMenu);
router.post("/insert-menu", menuController.insertMenu);
router.post("/update_sous_menu", menuController.updateSousMenu);
router.get("/get-titre", menuController.getTitre);
router.post("/update-titre", menuController.updateTitre);

const usersController = require("../controllers/users_controller");
router.get("/get-all-users", usersController.getAllUsers);
router.post("/delete-user", usersController.deleteUser);
router.post("/insert-users", usersController.insertUser);
router.post("/update-users", usersController.updateUser);
router.post("/get-user", usersController.getUser);
router.post("/get-user-gpao", usersController.getAllUsersGPAO);

const acceuilController = require("../controllers/accueil_controller");
router.get("/get-list-ligne", acceuilController.getlisteligne);
router.post("/get-list-plan", acceuilController.getlisteplan);
router.post("/get-list-fonction", acceuilController.getlisteFonction);
router.post("/get-list-operation", acceuilController.getlisteOperation);
router.get("/get-list-annee", acceuilController.getlisteAnnee);

const bilan_controller = require("../controllers/bilan_controller");
router.post("/get-bilan", bilan_controller.getBilan);

const performance_controller = require("../controllers/perfomance_individuelle_controller");
router.post("/get-list-perfomance-individuelle", performance_controller.getPerformanceIndividuelle);

const performanceAtelier_controller = require("../controllers/perf_atelier_controller");
router.post("/get-list-perfomance-atelier", performanceAtelier_controller.getPerfAtelier);
router.post("/get-list-perfomance-individuelle", performance_controller.getPerformanceIndividuelle);

const aterlierPerformanceController = require("../controllers/atelierPerformance_controller");
router.post("/atelier-performance", aterlierPerformanceController.aterlierPerformanceFunction);
router.post("/insert-reception", aterlierPerformanceController.inserReception);
router.post("/insert-prevision", aterlierPerformanceController.insertPrevision);

// const parametrage_atelier = require("../controllers/parametrageAtelier_controller"); 
// router.post("/get-list-parametrage-atelier", parametrage_atelier.getParametrageAtelier); 

const qualiteController = require("../controllers/qualite_individuelle_controller");
router.post("/get-list-qualite-individuelle", qualiteController.getQualiteIndividuelle);

const qualiteProjet = require("../controllers/qualiteProjet_controller");
router.post("/get-list-qualite-projet", qualiteProjet.getQualiteProjet);

const Retard_controller = require("../controllers/Retard_controller");
router.post("/get-list-retard", Retard_controller.getRetard)

const RetourClient_controller = require("../controllers/RetourClient_controller");
router.post("/get-list-retour-client", RetourClient_controller.getRetourClient)


const paramAttelierController = require("../controllers/ParamPerfAtelierController");
router.post("/getListeOperationParam", paramAttelierController.paramPerformanceAtelier);
router.post("/insertOperationParam", paramAttelierController.insertparamPerformanceAtelier);
router.post("/select-type-frequence", paramAttelierController.SelectFrequenceparamPerformanceAtelier);
router.post("/insert-prevision-param", paramAttelierController.insertPrevisionParam);




const planActionController = require("../controllers/planAction_controller");
router.post("/get-detail-kanboard", planActionController.getdetailkanboard);
router.post("/insert-plan-action", planActionController.insertPlanAction);
router.post("/affichage-plan-action", planActionController.affichagePlanAction);
router.post("/affichage-plans-actions", planActionController.affichagePlanSActions);
router.post("/get-plan-action", planActionController.getPlanActions);
router.post("/get-matricule", planActionController.getMatricule);
router.post("/get-zone-enregistrement", planActionController.getZoneEnregistrement);







// ========================================================================

// const insertController = require('../controllers/ParamPerfAtelierController');
// const { aterlierPerformance } = require("../controllers/atelierPerformance_controller");
// router.post('/ajoutPrevision', insertController.insertPrevisionAtelier)
// router.post('/addParamAtelier', insertController.addParamAtelier)
// router.post('/updateRange', insertController.updateRange)
// router.post('/getOperations', insertController.getOperations)

// router.post('/ajoutObjJournalier', insertController.insertObjJournalier)
// router.post('/ajoutReception', insertController.insertReception)

module.exports = router; // export to use in server.js
