import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccueilService } from '../services/accueil/accueil.service';
import { LPFService } from '../services/lpf/lpf.service';
import { PerformanceAtelierService } from '../services/performanceAtelier/performance-atelier.service';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';

import * as moment from 'moment';
import 'moment/locale/fr';

@Component({
  selector: 'app-performance-atelier',
  templateUrl: './performance-atelier.component.html',
  styleUrls: ['./performance-atelier.component.css']
})
export class PerformanceAtelierComponentold implements OnInit {

  constructor(
    private router: Router,
    private accueilService: AccueilService,
    private LpfService: LPFService,
    private PerformanceAtelierService: PerformanceAtelierService,
    private http: HttpClient
  ) {
    sessionStorage.setItem('currentUrl', this.router.url);
  }
  id_ligne: any;
  id_plan: any;
  id_fonction: any;
  id_operation: any;
  liste_Ligne: any;
  liste_Plan: any;
  liste_Fonction: any;
  liste_Operation: any;
  liste_atelier: any;
  nom_plan : any;
  nom_fonction : any;
  nom_operation : any;
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
    this.PerformanceAtelierService.getPerfAtelier(this.id_ligne, this.id_plan, this.id_fonction, this.debut, this.fin).subscribe((data) => {
      var donneeS = JSON.stringify(data)
      var donneeP = JSON.parse(donneeS)

      const liste_operation = donneeP.liste[0].operations

      for (let i = 0; i < liste_operation.length; i++) {
        const operation = liste_operation[i];
        this.liste_operations = donneeP.liste[0].operations

        this.liste_date = operation.performance

        this.liste_semaines = donneeP.sommes
      }

      this.isLoading = false
    });
  }

  getReception(event: any, i: number, j: number) {
    let value = event.target.value;
    this.liste_operations[i].performance[j].reception = value;
    const ReceptionData = this.liste_operations[i];
    const objreception = this.liste_operations[i].performance[j]
    this.PerformanceAtelierService.ajoutReception(ReceptionData, value, objreception).subscribe(
      (response) => {
        console.log('Données envoyées avec succès :', response);
        var donneeS = JSON.stringify(response)
        var donneeP = JSON.parse(donneeS)

        console.log(donneeP.liste)

        if (donneeP.liste == 'ok') {
          this.afficherPerformanceAtelier()
        }    
      },
        (error) => {
          console.error('Erreur lors de l\'envoi des données :', error);
        }
    )
  }

  isSunday(dateString: string): boolean {
    const date = moment(dateString, 'YYYY-MM-DD');
    return date.day() === 0;
  }

  isMonday(dateString: string): boolean {
    const date = moment(dateString, 'DD-MMMM');
    return date.day() === 1;
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

  postData(j: number) {
    const receptionData = this.liste_atelier[j].reception;
    this.http.post('/get-data/', { receptionData }).subscribe(
      (response) => {
        console.log('Données envoyées avec succès :', response);
      },
      (error) => {
        console.error('Erreur lors de l\'envoi des données :', error);
      }
    );
  }



}
