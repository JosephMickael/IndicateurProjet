import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccueilService } from '../services/accueil/accueil.service';
import { LPFService } from '../services/lpf/lpf.service';
import { RetourClientService } from '../services/retour-client/retour-client.service';
import { ToastService } from '../services/toast/toast.service';
import { PlanActionService } from '../services/planAction/plan-action.service';
import { CookieService } from 'ngx-cookie-service';
import * as moment from 'moment';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-retour-client',
  templateUrl: './retour-client.component.html',
  styleUrls: ['./retour-client.component.css']
})
export class RetourClientComponent implements OnInit {

  constructor(private router: Router, private accueilService: AccueilService,private LpfService: LPFService,private retourClientService: RetourClientService,  private toast: ToastService,
    private PlanActionService: PlanActionService,
    private cookies: CookieService) {
    sessionStorage.setItem('currentUrl', this.router.url);
  }
  isDisabled = true;  
  id_ligne: any = "020";
  nom_ligne: any = "TANA INVOICES"
  liste_Ligne: any;
  liste_retourClient: any[] = [];
  // liste_retourClient: any ; 
  liste_mois: any; 
  annee :any = '2023'; 
  annees : any;
  isLoading = false; 
  listTickets: any = [{ num_ticket: null, pilote: null, delai: null, action: null, avancement: null }];
  commentaire: any;

  ngOnInit() {
    this.listeLigne();
    this.getPlan(this.id_ligne)
  }
 
  listeAnnee(id_ligne) {
    this.annees = [];
    this.LpfService.getListeAnnee().subscribe((data) => {
      // const annee = data[0].date_part
      const annee = 2023
      for (let i = annee - 3; i <= annee; i++) {
        this.annees.push({ value: i + '' })
      }
      for (let item in this.annees) {
        let year = parseInt(this.annees[item].value);
        if (year == annee) {
          this.annee = this.annees[item].value;
          this.afficherRetourClient(this.id_ligne, this.annee)
        }
      }
    });
  }
  listeLigne() {
    this.LpfService.getListeLigne().subscribe((data) => {
      this.liste_Ligne = data;
      this.id_ligne = this.liste_Ligne[0].id_ligne
      this.listeAnnee(this.id_ligne);
    });
  }
  liste_Plan: any;
  getPlan(id_ligne) {
    for (let index = 0; index < this.liste_Ligne.length; index++) {
      if (this.liste_Ligne[index].id_ligne == id_ligne) {
        this.nom_ligne = this.liste_Ligne[index].libelle
      }
    }
    this.liste_Plan = null;
    this.LpfService.getListePlan(id_ligne).subscribe((data) => {
      this.liste_Plan = data;
    });
  }
 

afficherRetourClient(id_ligne, annee) {
  this.isLoading = true; 
  this.retourClientService.getRetourClient(id_ligne, annee).subscribe((data) => {
    var donneeS = JSON.stringify(data)
    var donneeP = JSON.parse(donneeS)
    this.liste_mois = donneeP.mois; 
    // this.liste_retourClient = donneeP.liste; 
    this.liste_retourClient = [];
    this.liste_retourClient.push(donneeP.newliste)
    this.isLoading = false; 
  });
}
 // calcul du rowspan 
calculateRowspan(liste: any[]): number {
  return liste.length * 2;
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
    // id_plan: this.id_plan,
    // nom_plan: this.nom_plan,
    // id_fonction: this.id_fonction,
    // nom_fonction: this.nom_fonction,
    // id_operation: this.id_operation,
    // nom_operation: this.nom_operation,
    commentaire: this.commentaire,
    listTickets: this.listTickets,
    matricule: this.cookies.get('matricule'),
    menu: valeur
  }
  var obj = JSON.stringify(Obj);
  this.PlanActionService.affichagePlanAction(obj).subscribe((data) => {
    var donneeS = JSON.stringify(data);
    var donneeP = JSON.parse(donneeS);

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
    // id_plan: this.id_plan,
    // nom_plan: this.nom_plan,
    // id_fonction: this.id_fonction,
    // nom_fonction: this.nom_fonction,
    // id_operation: this.id_operation,
    // nom_operation: this.nom_operation,
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
        this.isDisabled = false ; 
        this.listTickets[index].pilote = data[0].pilote
        this.listTickets[index].delai = moment(data[0].delai).format("DD/MM/YYYY")
        this.listTickets[index].action = data[0].action
        this.listTickets[index].avancement = data[0].avancement
      } else {
        this.isDisabled = true; 
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
    console.log('clicked ')
    const wb: XLSX.WorkBook = XLSX.utils.book_new(); // Créez un classeur
  
    // Créez une feuille Excel à partir de votre table HTML
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(document.getElementById('table-principale'));
  
    // Ajoutez la feuille au classeur avec un nom de votre choix
    XLSX.utils.book_append_sheet(wb, ws, 'retour client');

    
    const currentDate = new Date();
  
    // Générez une chaîne de date au format "AAAA-MM-JJ" (par exemple, "2023-10-12")
    const dateStr = currentDate.toISOString().slice(0, 10);
  
    // Créez le nom du fichier en incluant la date
    const fileName = `retour_client_${this.id_ligne}_${this.annee}}.xlsx`;

    try {
      // Enregistrez le fichier Excel
      XLSX.writeFile(wb, fileName);
      this.toast.Success('Le téléchargement a été lancé')
    } catch (error) {
      this.toast.Error('Le téléchargement a échoué')
    }
  }
}
