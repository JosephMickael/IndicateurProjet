import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccueilService } from '../services/accueil/accueil.service';
import { LPFService } from '../services/lpf/lpf.service';
import { PerformanceIndividuelleService } from '../services/performanceIndividuelle/performance-individuelle.service';
import { ToastService } from '../services/toast/toast.service';
import { PlanActionService } from '../services/planAction/plan-action.service';
import { CookieService } from 'ngx-cookie-service';
import * as moment from 'moment';

@Component({
  selector: 'app-plan-action',
  templateUrl: './plan-action.component.html',
  styleUrls: ['./plan-action.component.css']
})
export class PlanActionComponent implements OnInit {

  liste_plans_actions: any[] = [];
  noResults = true;
  id_ligne: any;
  id_plan: any;
  id_fonction: any;
  id_operation: any;
  nom_ligne: any;
  nom_plan: any;
  nom_fonction: any;
  nom_operation: any;
  date: any;
  liste_Ligne: any;
  liste_Plan: any;
  liste_Fonction: any;
  liste_Operation: any;
  isDisabled = true;
  matricule: any ;
  liste_matricule: any ;  
  zone_enregistrement : any ; 
  menu:any; 
  liste_menu : any ; 
  nom_menu : any ;
  isLoading = false ; 
  debut : any ; 
  fin : any ; 
  isDateFinDisable = true; 

  constructor(
    private router: Router,
    private accueilService: AccueilService,
    private LpfService: LPFService,
    private toast: ToastService,
    private PerformanceIndividuelleService: PerformanceIndividuelleService,
    private PlanActionService: PlanActionService,
    private cookies: CookieService
  ) {
    sessionStorage.setItem('currentUrl', this.router.url);
  }

  ngOnInit() {
    this.listeLigne()
    this.getMatricules()
    this.getMenu()    
    this.affichagePlandAction();
  }

  listeLigne() {
    this.liste_Ligne = null;
    this.liste_Plan = null;
    this.liste_Fonction = null;
    this.liste_Operation = null;
    this.LpfService.getListeLigne().subscribe((data) => {
      this.liste_Ligne = data;
    });
  }

  getPlan(id_ligne) {
    this.isDisabled = false;
    for (let index = 0; index < this.liste_Ligne.length; index++) {
      if (this.liste_Ligne[index].id_ligne == id_ligne) {
        this.nom_ligne = this.liste_Ligne[index].libelle
      }
    }
    this.id_plan = null;
    this.id_fonction = null;
    this.id_operation = null;
    this.nom_plan = null;
    this.nom_fonction = null;
    this.nom_operation = null;
    this.liste_Plan = null;
    this.liste_Fonction = null;
    this.liste_Operation = null;
    this.LpfService.getListePlan(id_ligne).subscribe((data) => {
      this.liste_Plan = data;
    });
  }

  getFonction(id_ligne, id_plan) {
    for (let index_ligne = 0; index_ligne < this.liste_Ligne.length; index_ligne++) {
      for (let index = 0; index < this.liste_Plan.length; index++) {
        if (this.liste_Ligne[index_ligne].id_ligne == id_ligne && this.liste_Plan[index].id_plan == id_plan) {
          this.nom_plan = this.liste_Plan[index].libelle
        }
      }
    }
    this.id_fonction = null;
    this.id_operation = null;
    this.nom_fonction = null;
    this.nom_operation = null;
    this.liste_Fonction = null;
    this.liste_Operation = null;
    this.LpfService.getListeFonction(id_ligne, id_plan).subscribe((data) => {
      this.liste_Fonction = data;
    });
  }
  getOperation(id_ligne, id_plan, id_fonction) {
    for (let index_ligne = 0; index_ligne < this.liste_Ligne.length; index_ligne++) {
      for (let index = 0; index < this.liste_Plan.length; index++) {
        for (let index_fonction = 0; index_fonction < this.liste_Fonction.length; index_fonction++) {
          if (this.liste_Ligne[index_ligne].id_ligne == id_ligne && this.liste_Plan[index].id_plan == id_plan && this.liste_Fonction[index_fonction].id_fonction == id_fonction) {
            this.nom_fonction = this.liste_Fonction[index_fonction].libelle
          }
        }

      }
    }
    this.id_operation = null;
    this.nom_operation = null;
    this.liste_Operation = null;
    this.LpfService.getListeOperation(id_ligne, id_plan, id_fonction).subscribe(
      (data) => {
        this.id_operation = undefined;
        this.liste_Operation = data;
      }
    );
  }
  changeoperation(id_ligne, id_plan, id_fonction, id_operation) {
    for (let index_ligne = 0; index_ligne < this.liste_Ligne.length; index_ligne++) {
      for (let index = 0; index < this.liste_Plan.length; index++) {
        for (let index_fonction = 0; index_fonction < this.liste_Fonction.length; index_fonction++) {
          for (let index_operation = 0; index_operation < this.liste_Operation.length; index_operation++) {
            if (this.liste_Ligne[index_ligne].id_ligne == id_ligne && this.liste_Plan[index].id_plan == id_plan && this.liste_Fonction[index_fonction].id_fonction == id_fonction && this.liste_Operation[index_operation].id_operation == id_operation) {
              this.nom_operation = this.liste_Operation[index_operation].libelle
            }
          }
        }
      }
    }
  }


  affichagePlandAction() {
    var dataObj = {
      id_test: 4
    }
    var obj = JSON.stringify(dataObj)
    console.log(obj)
    this.PlanActionService.affichagesPlanActions(obj).subscribe((data) => {
      var donneeS = JSON.stringify(data);
      var donneeP = JSON.parse(donneeS);
      console.log(donneeP)
      this.liste_plans_actions = donneeP.resultat
      for (let indext = 0; indext < this.liste_plans_actions.length; indext++) {

        var ticketStr = this.liste_plans_actions[indext].liste_tickets

        var ticketArray = []
        if (ticketStr.length > 0) {
          for (let index = 0; index < ticketStr.length; index++) {
            var detail = JSON.parse(ticketStr[index])
            // console.log(detail)
            ticketArray.push({ num_ticket: detail.num_ticket, pilote: detail.pilote, delai: moment(detail.delai).format("DD/MM/YYYY"), action: detail.action, avancement: detail.avancement })
          }
        }
        this.liste_plans_actions[indext].liste_tickets = ticketArray

      }
      console.log(this.liste_plans_actions)
    })
  }

  filtrePlandAction () {
    this.isLoading = true; 
    this.PlanActionService.getPlanActions(this.id_ligne, this.id_plan, this.id_fonction, this.id_operation, this.debut,this.fin,this.matricule,this.menu).subscribe((data) => {
      var donneeS = JSON.stringify(data);
      var donneeP = JSON.parse(donneeS);
      this.liste_plans_actions = donneeP.result
      for (let indext = 0; indext < this.liste_plans_actions.length; indext++) {
        var ticketStr = this.liste_plans_actions[indext].liste_tickets
        var ticketArray = []
        if (ticketStr.length > 0 ) {
          for (let index = 0; index < ticketStr.length; index++) {
            var detail = JSON.parse(ticketStr[index])
            ticketArray.push({ num_ticket: detail.num_ticket, pilote: detail.pilote, delai: moment(detail.delai).format("DD/MM/YYYY"), action: detail.action, avancement: detail.avancement })
          }
        }
        this.liste_plans_actions[indext].liste_tickets = ticketArray
        let zone = this.liste_plans_actions[indext].zone_enregistrement_libelle 
        console.log(zone);
        this.isLoading = false; 
      }
    })
  }

 getMatricules(){
    this.PlanActionService.getMatricule().subscribe((data)=>{
      var donneeS = JSON.stringify(data);
      var donneeP = JSON.parse(donneeS);
      this.liste_matricule = donneeP.result_matricule; 
    }); 
 }

  getMenu(){
    this.PlanActionService.getZoneEnregistrement().subscribe((data)=>{
      var donneeS = JSON.stringify(data);
      var donneeP = JSON.parse(donneeS);
      this.liste_menu = donneeP.result_zone_enregistrement;   
    })  
  }

  reinitialiser(){ 
    this.id_ligne = null
    this.id_plan = null
    this.id_fonction = null
    this.id_operation = null
    this.liste_Plan = null
    this.liste_Fonction = null
    this.liste_Operation = null
    this.debut = null; 
    this.fin = null; 
    this.matricule = null;  
    this.menu = null;
    this.affichagePlandAction()
  }

  activateDateFin() {
    this.isDateFinDisable = false ; 
  }

}
