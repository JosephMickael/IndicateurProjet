import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccueilService } from '../services/accueil/accueil.service';
import { LPFService } from '../services/lpf/lpf.service';
import { BilanService } from '../services/bilan/bilan.service';
import * as XLSX from 'xlsx';
import { ToastService } from '../services/toast/toast.service';

@Component({
  selector: 'app-bilan-projet',
  templateUrl: './bilan-projet.component.html',
  styleUrls: ['./bilan-projet.component.css']
})
export class BilanProjetComponent implements OnInit {

  constructor(
    private router: Router, 
    private accueilService: AccueilService, 
    private LpfService: LPFService, 
    private bilanService: BilanService,
    private toast: ToastService,
  ) {
    sessionStorage.setItem('currentUrl', this.router.url); 
  }

  id_ligne: any;
  nom_ligne: any;
  liste_Ligne: any
  annees: any;
  annee: any;
  liste_Bilan: any;
  liste_mois: any; 
  isLoading = false;


  ngOnInit() {
    this.listeLigne();
    //this.listeAnnee();
    //this.afficherBilan(this.id_ligne,this.annee)
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
          this.afficherBilan(this.id_ligne, this.annee)
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



  afficherBilan(id_ligne, annee) {
    this.isLoading = true; 
    this.bilanService.getBilan(id_ligne, annee).subscribe(
      (data) => {
      var donneeS = JSON.stringify(data)
      var donneeP = JSON.parse(donneeS)
      this.liste_mois = donneeP.mois
      this.liste_Bilan = donneeP.liste
      this.isLoading = false; 
    },
    (error) => {
      this.isLoading = false; 
    }
    );
  }

  formatVirgule(valeur) {
    if (valeur !== null && valeur !== undefined) {
      var valS = valeur.toString()
      if (valS.indexOf('.') > -1) {
        var val = valS.split('.')
        var deux = val[1].slice(0, 2)
        valeur = val[0] + "." + deux        
      }
      return valeur
    }
  }


  // exportToExcel() {
  //   console.log('clicked ')
  //   const wb: XLSX.WorkBook = XLSX.utils.book_new(); // Créez un classeur
  
  //   // Créez une feuille Excel à partir de votre table HTML
  //   const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(document.getElementById('table-principale'));
  
  //   // Ajoutez la feuille au classeur avec un nom de votre choix
  //   XLSX.utils.book_append_sheet(wb, ws, 'bilan projet');
  
  //   // Enregistrez le fichier Excel
  //   try {
  //     XLSX.writeFile(wb, 'bilan projet.xlsx');
  //     this.toast.Success('Le téléchargement a été lancé')
  //   } catch (error) {
  //     this.toast.Error('Le téléchargement a échoué')
  //   }
  // }

  exportToExcel() {
    const wb: XLSX.WorkBook = XLSX.utils.book_new(); // Créez un classeur
  
    // Créez une feuille Excel à partir de votre table HTML²
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(document.getElementById('table-principale'));
  
    // Obtenez la date actuelle
    const currentDate = new Date();
  
    // Générez une chaîne de date au format "AAAA-MM-JJ" (par exemple, "2023-10-12")
    const dateStr = currentDate.toISOString().slice(0, 10);
  
    // Créez le nom du fichier en incluant la date

    const fileName = `bilan_projet_${this.id_ligne}_${dateStr}.xlsx`;
  
    // Ajoutez la feuille au classeur avec le nom que vous avez généré
    XLSX.utils.book_append_sheet(wb, ws, 'bilan projet');
  
    // Enregistrez le fichier Excel avec le nom généré
    try {
      XLSX.writeFile(wb, fileName);
      this.toast.Success('Le téléchargement a été lancé');
    } catch (error) {
      this.toast.Error('Le téléchargement a échoué');
    }
  }
}
