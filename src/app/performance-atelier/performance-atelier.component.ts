import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccueilService } from '../services/accueil/accueil.service';
import { LPFService } from '../services/lpf/lpf.service';
import { PerformanceAtelierService } from '../services/performanceAtelier/performance-atelier.service';
import { PlanActionService } from '../services/planAction/plan-action.service';
import { ToastService } from '../services/toast/toast.service';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import * as moment from 'moment';
import 'moment/locale/fr';
import * as XLSX from 'xlsx';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-performance-atelier',
  templateUrl: './performance-atelier.component.html',
  styleUrls: ['./performance-atelier.component.css']
})
export class PerformanceAtelierComponent implements OnInit {

  constructor(
    private router: Router,
    private toast: ToastService,
    private accueilService: AccueilService,
    private LpfService: LPFService,
    private PerformanceAtelierService: PerformanceAtelierService,
    private PlanActionService: PlanActionService,
    private http: HttpClient,
    private cookies: CookieService
  ) {
    sessionStorage.setItem('currentUrl', this.router.url);
  }
  id_ligne: any;
  nom_ligne: any;
  id_plan: any;
  id_fonction: any;
  id_operation: any;
  liste_Ligne: any;
  liste_Plan: any;
  liste_Fonction: any;
  liste_Operation: any;
  liste_atelier: any;
  nom_plan: any;
  nom_fonction: any;
  nom_operation: any;
  debut: any;
  fin: any;
  annees: any
  annee: any
  liste_date: any[] = [];
  showSEM: boolean = false;
  new_liste_jours: any[] = [];
  liste_obj_cad: any;
  prevision: any;
  sommePrev: any;
  previsionValue: any;
  defaultValue = 0
  liste_operations: any;
  liste_semaines: any;
  valeurSomme: any;

  isLoading = false;
  loading = false;

  listTickets: any = [{ num_ticket: null, pilote: null, delai: null, action: null, avancement: null }];
  commentaire: any;

  isDisabled = true;

  
  isDisabledExport = true;

  ngOnInit() {
    this.listeLigne();
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
    console.log(this.liste_Ligne)
    console.log(this.liste_Plan)
    console.log(this.id_ligne)
    console.log(this.id_plan)
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



  afficherPerformanceAtelier() {
    this.isLoading = true;
    this.PerformanceAtelierService.getPerfAtelier(this.id_ligne, this.id_plan, this.id_fonction, this.debut, this.fin).subscribe(
      (data) => {
        var donneeS = JSON.stringify(data)
        var donneeP = JSON.parse(donneeS)

        this.liste_operations = donneeP.operations
        this.liste_date = donneeP.liste_date
        this.isLoading = false
        this.isDisabledExport = false
      },
      (error) => {
        this.isLoading = false;
        this.isDisabledExport = true
      }
    );
  }


  blurReception(index: any, jindex: any) {
    var id_operation = this.liste_operations[index].id_operation
    var lib_operation = this.liste_operations[index].libelle
    var date = this.liste_operations[index].liste_new_date[jindex].date
    var reception = this.liste_operations[index].liste_new_date[jindex].reception
    var Obj = {
      id_ligne: this.id_ligne,
      lib_ligne: this.nom_ligne,
      id_plan: this.id_plan,
      lib_plan: this.nom_plan,
      id_fonction: this.id_fonction,
      lib_fonction: this.nom_fonction,
      id_operation: id_operation,
      lib_operation: lib_operation,
      reception: reception,
      date: date
    }
    // console.log(Obj)
    // return;
    this.PerformanceAtelierService.insertReception(Obj).subscribe((data) => {
        for (let k = 0; k < this.liste_operations.length; k++) {
          if (k == 0) {// si le premier
            var ops = this.liste_operations[k].liste_new_date;
            var ops2 = this.liste_operations[k].liste_new_date;
            for (let j = 0; j < this.liste_operations[k].liste_new_date.length; j++) {
              if (ops[j].date == "1970-01-01") {
                var num_semaine = this.liste_operations[k].liste_new_date[j].numero_semaine
                var somme = 0;
                for (let i = 0; i < ops2.length; i++) {
                  if (num_semaine == ops2[i].number_semaine) {
                    somme += Number(ops2[i].reception)
                  }
                }
                this.liste_operations[k].liste_new_date[j].reception = somme
              }
            }
          }
        }
        var donneeS = JSON.stringify(data)
        var donneeP = JSON.parse(donneeS)
        this.toast.Success(donneeP.message);       
      },
    );
    //somme des réceptions
    for (let k = 0; k < this.liste_operations.length; k++) {
      if (k == 0) {// si le premier
        var ops = this.liste_operations[k].liste_new_date;
        var ops2 = this.liste_operations[k].liste_new_date;
        for (let j = 0; j < this.liste_operations[k].liste_new_date.length; j++) {
          if (ops[j].date == "1970-01-01") {
            var num_semaine = this.liste_operations[k].liste_new_date[j].numero_semaine
            var somme = 0;
            for (let i = 0; i < ops2.length; i++) {
              if (num_semaine == ops2[i].number_semaine) {
                somme += Number(ops2[i].reception)
              }
            }
            this.liste_operations[k].liste_new_date[j].reception = somme
          }
        }
      }
    }    
    // this.toast.Success("Enregistrement effectué");    
    //insert reception into database
    
  }

  blurPrevision(index: any, jindex: any) {
    var id_operation = this.liste_operations[index].id_operation
    var lib_operation = this.liste_operations[index].libelle
    var date = this.liste_operations[index].liste_new_date[jindex].date
    var prevision = this.liste_operations[index].liste_new_date[jindex].prevision
    var myObj = {
      id_ligne: this.id_ligne,
      lib_ligne: this.nom_ligne,
      id_plan: this.id_plan,
      lib_plan: this.nom_plan,
      id_fonction: this.id_fonction,
      lib_fonction: this.nom_fonction,
      id_operation: id_operation,
      lib_operation: lib_operation,
      prevision: prevision,
      date: date
    }
    
    var Obj = JSON.stringify(myObj)
    
    this.PerformanceAtelierService.insertPrevision(Obj).subscribe((data) => {
      var donneeS = JSON.stringify(data)
      var donneeP = JSON.parse(donneeS)
      this.toast.Success(donneeP.message);       
    });

    // Pour somme prevision
    for (let k = 0; k < this.liste_operations.length; k++) {
      if (k == 0) {// si le premier
        var ops = this.liste_operations[k].liste_new_date;
        var ops2 = this.liste_operations[k].liste_new_date;
        for (let j = 0; j < this.liste_operations[k].liste_new_date.length; j++) {
          if (ops[j].date == "1970-01-01") {
            var num_semaine = this.liste_operations[k].liste_new_date[j].numero_semaine
            var somme = 0;
            for (let i = 0; i < ops2.length; i++) {
              if (num_semaine == ops2[i].number_semaine) {
                somme += Number(ops2[i].prevision)
              }
            }
            this.liste_operations[k].liste_new_date[j].prevision = somme
          }
        }
      }
    }  
  }

  formatVirgule(valeur) {
    if (valeur !== null) {
      var valS = valeur.toString()
      if (valS.indexOf('.') > -1) {
        var val = valS.split('.')
        var deux = val[1].slice(0, 2)
        valeur = val[0] + "." + deux
      }
    }
    return valeur
  }

  clicPlanAction(valeur) {
    // console.log(this.id_ligne)
    // console.log(this.nom_ligne)
    // console.log(this.id_plan)
    // console.log(this.nom_plan)
    // console.log(this.id_fonction)
    // console.log(this.nom_fonction)

    var Obj = {
      id_ligne: this.id_ligne,
      nom_ligne: this.nom_ligne,
      id_plan: this.id_plan,
      nom_plan: this.nom_plan,
      id_fonction: this.id_fonction,
      nom_fonction: this.nom_fonction,
      id_operation: this.id_operation,
      nom_operation: this.nom_operation,
      commentaire: this.commentaire,
      listTickets: this.listTickets,
      matricule: this.cookies.get('matricule'),
      menu: valeur
    }
    var obj = JSON.stringify(Obj);
    this.PlanActionService.affichagePlanAction(obj).subscribe((data) => {
      var donneeS = JSON.stringify(data);
      var donneeP = JSON.parse(donneeS);

      console.log("donneeP", donneeP)

      var ticketStr = donneeP.resultat[0].liste_tickets
    
      var ticketArray = []
      if (ticketStr.length > 0) {
        for (let index = 0; index < ticketStr.length; index++) {
          var detail = JSON.parse(ticketStr[index])
          ticketArray.push({ num_ticket: detail.NumTicket, pilote: detail.Pilote, delai: moment(detail.Delai).format("DD/MM/YYYY"), action: detail.TitreTicket, avancement: detail.Avancement })
        }
      }
      this.commentaire = donneeP.resultat[0].commentaire
      this.listTickets = ticketArray
    })
  }
  plus() {
    this.listTickets.push({ num_ticket: null, pilote: null, delai: null, action: null, avancement: null });
  }
  minus(index) {
    if (this.listTickets.length == 1) {
      this.toast.Warning("Opération impossible")
    } else {
      this.listTickets.splice(index, 1);
    }
  }
  enregistrer(valeur) {
    var Obj = {
      id_ligne: this.id_ligne,
      nom_ligne: this.nom_ligne,
      id_plan: this.id_plan,
      nom_plan: this.nom_plan,
      id_fonction: this.id_fonction,
      nom_fonction: this.nom_fonction,
      id_operation: this.id_operation,
      nom_operation: this.nom_operation,
      commentaire: this.commentaire,
      listTickets: this.listTickets,
      matricule: this.cookies.get('matricule'),
      menu: valeur
    }
    var obj = JSON.stringify(Obj);
    this.PlanActionService.insertPlanAction(obj).subscribe((data) => {
      var donneeS = JSON.stringify(data);
      var donneeP = JSON.parse(donneeS);
      this.toast.Success(donneeP.message)
    })
  }

  isDisabled_modal = true ; 
  blurTicketKanboard(index) {
    var num_ticket = this.listTickets[index].num_ticket
    this.PlanActionService.getDetailKB(num_ticket).subscribe((data) => {
      console.log(data)
      if (data != null) {
        this.isDisabled_modal = false ; 
        this.listTickets[index].pilote = data[0].pilote
        this.listTickets[index].delai = moment(data[0].delai).format("DD/MM/YYYY")
        this.listTickets[index].action = data[0].action
        this.listTickets[index].avancement = data[0].avancement
      } else {
        this.isDisabled_modal = true; 
        this.listTickets[index].pilote = null
        this.listTickets[index].delai = null
        this.listTickets[index].action = null
        this.listTickets[index].avancement = null
      }
    })
  }


  exportToExcel() {
    this.isDisabledExport = false
    console.log('clicked ')
    const wb: XLSX.WorkBook = XLSX.utils.book_new(); // Créez un classeur
  
    // Créez une feuille Excel à partir de votre table HTML
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(document.getElementById('table-principale'));
  
    // Ajoutez la feuille au classeur avec un nom de votre choix
    XLSX.utils.book_append_sheet(wb, ws, 'perf atelier');

    const currentDate = new Date();
  
    // Générez une chaîne de date au format "AAAA-MM-JJ" (par exemple, "2023-10-12")
    const dateStr = currentDate.toISOString().slice(0, 10);
  
    // Créez le nom du fichier en incluant la date
    const fileName = `perf_atelier_${this.id_ligne}_${this.debut}_${this.fin}.xlsx`;

    try {
    // Enregistrez le fichier Excel
      XLSX.writeFile(wb, fileName);
      this.toast.Success('Le téléchargement a été lancé')
    } catch (error) {
      this.toast.Error('Le téléchargement a échoué')
    }
  }
}
