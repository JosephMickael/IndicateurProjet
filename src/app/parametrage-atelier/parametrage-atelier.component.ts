import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccueilService } from '../services/accueil/accueil.service';
import { LPFService } from '../services/lpf/lpf.service';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { CdkDrag, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MenuService } from '../services/menu/menu.service';
import { AppComponent } from '../app.component';
import { getISOWeeksInYear, getISOWeek } from 'date-fns';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { ParametrageAtelierService } from '../services/parametrageAtelier/parametrage-atelier.service';
import { ToastService } from '../services/toast/toast.service';

@Component({
  selector: 'app-parametrage-atelier',
  templateUrl: './parametrage-atelier.component.html',
  styleUrls: ['./parametrage-atelier.component.css']
})
export class ParametrageAtelierComponent implements OnInit {

  constructor(
    private router: Router,
    private menuService: MenuService,
    private accueilService: AccueilService,
    private ParametrageAtelierService: ParametrageAtelierService,
    private LpfService: LPFService,
    private menu: AppComponent,
    private http: HttpClient,
    private toast: ToastService,
  ) {
    sessionStorage.setItem('currentUrl', this.router.url);
  }

  id_ligne: any;
  id_plan: any;
  id_fonction: any;
  id_operation: any;
  nom_plan: any;
  nom_fonction: any;
  nom_operation: any;
  debut: any;
  fin: any;
  liste_Ligne: any;
  liste_Plan: any;
  liste_Fonction: any;
  liste_Operation: any;
  liste_atelier: any;

  ifDrag: boolean = true;
  ifDragSousMenu: boolean = true;

  isLoading = false;

  liste_operations: any;

  selectedParametre: string = '';

  selectedRank: any;
  toutCocherValue: any;

  semaines: number[] = [];
  year: number = new Date().getFullYear();

  annees: any;
  annee: any;
  isChecked: boolean = false;

  selectedSemaine: any;
  selectedMonths: any;

  months: string[] = [];

  prevision: any;
  typeFrequences: any;
  message: any;
  maclasse: any;
  type_frequence: any;
  liste_frequence: any;

  startOfWeekDate: any;
  endOfWeekDate: any;
  daysInWeek: Date[] = [];

  ngOnInit(): void {
    this.listeLigne();
    this.listeAnnee();
    this.listeTypeFrequence();
  }

  listeTypeFrequence() {
    this.typeFrequences = [{ nom_type: "Journalier", num_type: 1 }, { nom_type: "Hebdo", num_type: 2 }, { nom_type: "Mensuel", num_type: 3 }]
  }
  listeAnnee() {
    this.annees = [];
    this.LpfService.getListeAnnee().subscribe((data) => {
      const annee = data[0].date_part
      for (let i = annee - 2; i <= annee + 2; i++) {
        this.annees.push({ value: i + '' })
      }
      for (let item in this.annees) {
        let year = parseInt(this.annees[item].value);
        if (year == annee) {
          this.annee = this.annees[item].value;
        }
      }
    });
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
      // this.maclasse = 1;
      this.message = "";
    });
  }

  getFonction(id_ligne, id_plan) {
    this.id_fonction = null;
    this.id_operation = null;
    this.nom_fonction = null;
    this.nom_operation = null;
    this.liste_Fonction = null;
    this.liste_Operation = null;
    this.LpfService.getListeFonction(id_ligne, id_plan).subscribe((data) => {
      this.liste_Fonction = data;
        // this.maclasse = 1;
        this.message = "";
    });
  }

  getOperation(id_ligne, id_plan, id_fonction, annee) {
    this.id_operation = null;
    this.nom_operation = null;
    this.liste_Operation = null;

    this.ParametrageAtelierService.getOperation(id_ligne, id_plan, id_fonction, annee).subscribe(
      (data) => {
        var donneeS = JSON.stringify(data)
        var donneeP = JSON.parse(donneeS)

        // console.log(donneeP)

        // return
        //côté gauche
        this.liste_Operation = donneeP.operations
        this.message = donneeP.message
        this.maclasse = donneeP.maclasse
        //côté droit
        if (donneeP.param.length > 0) {
          var droit = donneeP.param[0]
          this.type_frequence = droit.type_prevision
          if (droit.type_prevision != 1) {
            this.liste_frequence = JSON.parse(droit.data)
            var list_f = []
            for (let index2 = 0; index2 < this.liste_frequence.length; index2++) {
              if (this.liste_frequence[index2].checkedbox == true) {
                list_f.push('a');
              }
            }
            if (this.liste_frequence.length == list_f.length) {
              this.isChecked = true
            }
            this.toutCocherValue = ""
          } else {
            this.toutCocherValue = droit.data
            this.liste_frequence = []
          }
          // for (let index = 0; index < this.typeFrequences.length; index++) {
          //   if(id_prevision == this.typeFrequences[index].num_type){          
          //     this.type_frequence = this.typeFrequences[index].num_type
          //   }
          // }
        }else{
          this.toutCocherValue = ""
          this.liste_frequence = []
          this.type_frequence = ""
        }
      }
    );
  }

  enregistrerRAng() {
    this.isLoading = true;
    var liste_operation = JSON.stringify(this.liste_Operation)
    this.ParametrageAtelierService.insertOperationParam(this.id_ligne, this.id_plan, this.id_fonction, liste_operation).subscribe(
      (data) => {
        this.isLoading = false; 
        this.maclasse = 1;
        this.message = "Rang déjà paramétré(étape intiale)";
        this.toast.Success("Rang enregistré")
      },
      (error) => {
        this.isLoading = false;
  
        // Afficher une alerte d'erreur
        this.toast.Error("Une erreur s'est produite")
      }
    );
  }

 
  enregistrerPrevision() {
    this.isLoading = true;
    // console.log('id_ligne', this.id_ligne)
    // console.log('id_plan', this.id_plan)
    // console.log('id_fonction', this.id_fonction)
    // console.log('liste_Operation', this.liste_Operation)
    // console.log('annee', this.annee)
    // console.log('type_frequence', this.type_frequence)
    // console.log('toutCocherValue', this.toutCocherValue)
    // console.log('liste_frequence', this.liste_frequence)
    // return;
    var Obj = {
      id_ligne: this.id_ligne,
      id_plan: this.id_plan,
      id_fonction: this.id_fonction,
      liste_Operation: this.liste_Operation,
      annee: this.annee,
      type_frequence: this.type_frequence,
      toutCocherValue: this.toutCocherValue,
      liste_frequence: this.liste_frequence,

    }
    var ObjStr = JSON.stringify(Obj);
    console.log(ObjStr)
    // return;
    this.ParametrageAtelierService.insertPrevisionParam(ObjStr).subscribe(
      (data) => {
        this.isLoading = false; 

        this.toast.Success("Prevision enregistré")
      },
      (error) => {
        this.isLoading = false;
  
        // Afficher une alerte d'erreur
        this.toast.Error("Une erreur s'est produite")
      }
    );
  }

  drop(event: CdkDragDrop<{}[]>) {
    moveItemInArray(this.liste_Operation, event.previousIndex, event.currentIndex);
  }


  changeFrequence() {
    this.isChecked = false;
    console.log(this.type_frequence)
    if (this.type_frequence == 1) {
      this.liste_frequence = []
    } else {
      this.ParametrageAtelierService.getListeFrequence(this.type_frequence, this.annee).subscribe(
        (data) => {
          var donneeS = JSON.stringify(data)
          var donneeP = JSON.parse(donneeS)
          this.liste_frequence = donneeP.resultat
        });
    }
  }
  changeToutCocher() {
    console.log(this.isChecked)
    var frequece_liste = this.liste_frequence
    for (let index = 0; index < frequece_liste.length; index++) {
      if (this.isChecked == true) {
        frequece_liste[index].checkedbox = true
      }
      if (this.isChecked == false) {
        frequece_liste[index].checkedbox = false
      }
    }
    this.liste_frequence = frequece_liste
    console.log(this.liste_frequence)
  }
  checkedOne(index, valChecked) {
    var nombre_liste = this.liste_frequence.length
    var frequece_liste = this.liste_frequence
    var nombre_liste_new = [];
    for (let index2 = 0; index2 < frequece_liste.length; index2++) {
      if (frequece_liste[index2].checkedbox == true) {
        nombre_liste_new.push('a');
      }
    }
    if (nombre_liste == nombre_liste_new.length) {
      this.isChecked = true;
    } else {
      this.isChecked = false;

    }
  }
  changeValueListe(newvaleur) {
    for (let index2 = 0; index2 < this.liste_frequence.length; index2++) {
      this.liste_frequence[index2].valeur = newvaleur
    }
  }





}


