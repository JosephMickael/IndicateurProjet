import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LPFService } from '../services/lpf/lpf.service';

@Component({
  selector: 'app-parametrage',
  templateUrl: './parametrage.component.html',
  styleUrls: ['./parametrage.component.css'],
})
export class ParametrageComponent implements OnInit {
  constructor(private router: Router, private LpfService: LPFService) {
    sessionStorage.setItem('currentUrl', this.router.url);
  }
  id_ligne: any;
  id_plan: any;
  id_fonction: any;
  // Variables pour parametrage actif
  id_ligne1: any;
  id_plan1: any;
  id_fonction1: any;

  liste_Ligne: any;
  liste_Plan: any;
  liste_Fonction: any;

  ngOnInit() {
    this.listeLigne();
  }
  listeLigne() {
    this.LpfService.getListeLigne().subscribe((data) => {
      this.liste_Ligne = data;
    });
  }

  getPlan(id_ligne) {
    this.LpfService.getListePlan(id_ligne).subscribe((data) => {
      this.liste_Plan = data;
    });
  }

  getFonction(id_ligne, id_plan) {
    this.LpfService.getListeFonction(id_ligne, id_plan).subscribe((data) => {
      this.liste_Fonction = data;
    });
  }
}
