import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccueilService } from '../services/accueil/accueil.service';
import { LPFService } from '../services/lpf/lpf.service';
import { PerformanceIndividuelleService } from '../services/performanceIndividuelle/performance-individuelle.service';
import { ToastService } from '../services/toast/toast.service';
import { PlanActionService } from '../services/planAction/plan-action.service';
import { CookieService } from 'ngx-cookie-service';
import * as moment from 'moment';
import { ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';



@Component({
  selector: 'app-performance-individuelle',
  templateUrl: './performance-individuelle.component.html',
  styleUrls: ['./performance-individuelle.component.css'],
})
export class PerformanceIndividuelleComponent implements OnInit {
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

  id_ligne: any;
  id_plan: any;
  id_fonction: any;
  id_operation: any;
  nom_ligne: any;
  nom_plan: any;
  nom_fonction: any;
  nom_operation: any;
  liste_Ligne: any;
  liste_Plan: any;
  liste_Fonction: any;
  liste_Operation: any;
  perfomance_individuelle: any;
  debut: any;
  fin: any;
  liste_matricule_only: any;
  liste_matricules_detail = [];
  isLoading = false;
  loading = false;
  listTickets: any = [{ num_ticket: null, pilote: null, delai: null, action: null, avancement: null }];
  commentaire: any;
  isDisabled = true;
  isDisabled_modal = true; 
  isDisabledExport = true

  @ViewChild('table1') table1: any; // Replace 'table1' with the template reference of your first table.
  @ViewChild('table2') table2: any; // Replace 'table2' with the template reference of your second table.



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



  tabInit: any;

  afficherPerformanceIndividuelle() {
    this.isLoading = true;
    this.PerformanceIndividuelleService.getListe(
      this.id_ligne,
      this.id_plan,
      this.id_fonction,
      this.id_operation,
      this.debut,
      this.fin
    ).subscribe(
      (data) => {
        console.log(data);
        var donneeS = JSON.stringify(data);
        var donneeP = JSON.parse(donneeS);
        // this.liste_matricule_only = donneeP.liste_matricule
        this.tabInit = donneeP.multiple;

        this.liste_matricules_detail = this.tabInit.filter(function(element, index) {
          const date = moment(element.date, 'YYYY-MM-DD');
          return (date.day() !== 0 && date.day() !== 6 || element.ecart !== null);
        });


        this.liste_matricule_only = donneeP.only;
        this.isLoading = false;
        this.isDisabledExport = false
      }, 
      (error) => {
        this.isLoading = false;
        this.isDisabledExport = true
      }
    );
  }

  formatVirgule(valeur) {
    if (valeur !== null) {
      var valS = valeur.toString();
      if (valS.indexOf('.') > -1) {
        var val = valS.split('.');
        var deux = val[1].slice(0, 2);
        // valeur = val[0] + "." + deux
        valeur = val[0];
      }
    }
    return valeur;
  }
  formatVirguleTemps(valeur) {
    if (valeur !== null) {
      var valS = valeur.toString();
      if (valS.indexOf('.') > -1) {
        var val = valS.split('.');
        var deux = val[1].slice(0, 2);
        valeur = val[0] + '.' + deux;
      }
    }
    return valeur;
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
      if (donneeP.resultat.length == 0) {
        this.commentaire = null
        this.listTickets = [{ num_ticket: null, pilote: null, delai: null, action: null, avancement: null }]
        return
      }

      var ticketStr = donneeP.resultat[0].liste_tickets
      var ticketArray = []
      if (ticketStr.length > 0) {
        for (let index = 0; index < ticketStr.length; index++) {
          var detail = JSON.parse(ticketStr[index])
          ticketArray.push({ num_ticket: detail.NumTicket, pilote: detail.Pilote, delai: moment(detail.Delai).format("DD/MM/YYYY"), action: detail.TitreTicket, avancement: detail.Avancement })
        }
      }
      this.commentaire = donneeP.resultat[0].commentaire == 'null' ? '' : donneeP.resultat[0].commentaire
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

  Fermer() {
    this.commentaire = null
    this.listTickets = [{ num_ticket: null, pilote: null, delai: null, action: null, avancement: null }]
  }



  exportToExcel() {
    this.isDisabledExport = false
    const wb: XLSX.WorkBook = XLSX.utils.book_new(); // Créez un classeur
  
    // Créez un ensemble pour stocker les dates uniques
    const uniqueDates = new Set<string>();
  
    // Parcourez les éléments pour collecter les dates uniques
    this.liste_matricules_detail.forEach((item) => {
      uniqueDates.add(item.date);
    });
  
    // Créez un objet pour stocker les données par date
    const dataByDate: { [date: string]: any[] } = {};
  
    // Parcourez les éléments et organisez les données par date
    this.liste_matricules_detail.forEach((item) => {
      if (!dataByDate[item.date]) {
        dataByDate[item.date] = [];
      }
      item.liste_matricule.forEach((md, index) => {
        const rowData = [
          `Matricule ${index + 1}`,
          md.matricule,
          '',
          md.temps,
          '',
          md.volume,
          '',
          md.cadence,
          // ... Ajouter d'autres données ici
        ];
        dataByDate[item.date].push(rowData);
      });
    });
  
    // Pour chaque date unique, créez une feuille Excel
    uniqueDates.forEach((formattedDate) => {
      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([[]]); // Créez une feuille vide
      XLSX.utils.sheet_add_aoa(ws, [['Date:', formattedDate]], { origin: 'A1' });
  
      // Ajoutez les titres au-dessus des colonnes
      const titles = [
        'Description', // Titre pour la description (par exemple, "Matricule 1")
        'Matricule',
        '',
        'Temps',
        '',
        'Volume',
        '',
        'Cadence',
        // ... Ajouter d'autres titres ici
      ];
      XLSX.utils.sheet_add_aoa(ws, [titles], { origin: 'A3' });
  
      // Ajoutez les données correspondant à cette date
      if (dataByDate[formattedDate]) {
        dataByDate[formattedDate].forEach((rowData, index) => {
          XLSX.utils.sheet_add_aoa(ws, [rowData], { origin: `A${index + 4}` });
        });
      }
  
      // Ajoutez la feuille au classeur avec le nom de la date
      XLSX.utils.book_append_sheet(wb, ws, `Feuille${formattedDate}`);
    });
  
    const currentDate = new Date();
  
    // Générez une chaîne de date au format "AAAA-MM-JJ" (par exemple, "2023-10-12")
    const dateStr = currentDate.toISOString().slice(0, 10);
  
    // Créez le nom du fichier en incluant la date
    const fileName = `perf_individuelle_projet_${this.id_ligne}_${this.debut}_${this.fin}.xlsx`;

    try {
      // Enregistrez le fichier Excel
      XLSX.writeFile(wb, fileName);
      this.toast.Success('Le téléchargement a été lancé')
    } catch (error) {
      this.toast.Error('Le téléchargement a échoué')
    }
  }
  

  // exportToExcel() {
  //   const wb: XLSX.WorkBook = XLSX.utils.book_new(); // Créez un classeur

  //   // Créez un ensemble pour stocker les dates uniques
  //   const uniqueDates = new Set<string>();

  //   // Parcourez les éléments pour collecter les dates uniques
  //   this.liste_matricules_detail.forEach((item) => {
  //     uniqueDates.add(item.date);
  //   });

  //   // Pour chaque date unique, créez une feuille Excel
  //   uniqueDates.forEach((formattedDate) => {
  //     const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([[]]); // Créez une feuille vide
  //     XLSX.utils.sheet_add_aoa(ws, [['Date:', formattedDate]], { origin: 'A1' });

  //     // Ajoutez les données correspondant à cette date
  //     this.liste_matricules_detail.forEach((item) => {
  //       if (item.date === formattedDate) {
  //         item.liste_matricule.forEach((md, index) => {
  //           const row = [
  //             `Matricule ${index + 1}`,
  //             md.matricule,
  //             'temps',
  //             md.temps,
  //             'volume',
  //             md.volume,
  //             'cadence',
  //             md.cadence
  //             // ... Ajouter d'autres données ici
  //           ];
  //           XLSX.utils.sheet_add_aoa(ws, [row], { origin: `A${index + 3}` });
  //         });
  //       }
  //     });

  //     // Ajoutez la feuille au classeur avec le nom de la date
  //     XLSX.utils.book_append_sheet(wb, ws, `Feuille${formattedDate}`);
  //   });

  //   // Enregistrez le fichier Excel
  //   XLSX.writeFile(wb, 'export.xlsx');
  // }

  // formatDate(date: Date): string {
  //   const day = date.getDate().toString().padStart(2, '0');
  //   const month = (date.getMonth() + 1).toString().padStart(2, '0');
  //   const year = date.getFullYear().toString();
  //   return `${day}/${month}/${year}`;
  // }
  
}
