import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { Page404Component } from './page404/page404.component';
import { AccueilComponent } from './accueil/accueil.component';
import { UtilisateurComponent } from './utilisateur/utilisateur.component';
import { GestionMenuComponent } from './gestion-menu/gestion-menu.component';
import { AppComponent } from './app.component';
import { AdminComponent } from './admin/admin.component';
import { ParametrageComponent } from './parametrage/parametrage.component';
import { PerformanceAtelierComponent } from './performance-atelier/performance-atelier.component';
import { RetourClientComponent } from './retour-client/retour-client.component';
import { RetardDeLivraisonComponent } from './retard-de-livraison/retard-de-livraison.component';
import { PerformanceIndividuelleComponent } from './performance-individuelle/performance-individuelle.component';
import { BilanProjetComponent } from './bilan-projet/bilan-projet.component';
import { QualiteProjetComponent } from './qualite-projet/qualite-projet.component';
import { PlanActionComponent } from './plan-action/plan-action.component';
import { QualiteIndividuelleComponent } from './qualite-individuelle/qualite-individuelle.component';
import { ParametrageAtelierComponent } from './parametrage-atelier/parametrage-atelier.component';


const routes: Routes = [
  { path: '', component: AppComponent, data: { titreComponent: null } },
  // Accueil
  {
    path: 'accueil',
    component: AccueilComponent,
    data: { titreComponent: 'Accueil' },
  },
  // Parametrage Menu
  {
    path: 'parametrages',
    component: ParametrageComponent,
    data: { titreComponent: 'Parametrages' },
  },
  
  {
    path: 'performance-atelier',
    component: PerformanceAtelierComponent,
    data: { titreComponent: 'Performance Atelier' },
  },
  {
    path: 'parametrage-atelier',
    component: ParametrageAtelierComponent,
    data: { titreComponent: 'Parametrage Atelier' },
  },
  {
    path:'qualite-individuelle',
    component: QualiteIndividuelleComponent,
    data: { titreComponent: 'Qualité Individuelle' },
  },

  {
    path: 'bilan-projet',
    component: BilanProjetComponent,
    data: { titreComponent: 'Bilan projet' },
  },
  {
    path: 'performance-indviduelle',
    component: PerformanceIndividuelleComponent,
    data: { titreComponent: 'Performance Individuelle' },
  },


  {
    path: "qualite-projet",
    component: QualiteProjetComponent,
    data: { titreComponent: 'Qualité projet' },
  },
 
  // Retour client
  {
    path: 'retour-client',
    component: RetourClientComponent,
    data: { titreComponent: 'Retour Client' },
  },
  // Retard livraison
  {
    path: 'retard-de-livraison',
    component: RetardDeLivraisonComponent,
    data: { titreComponent: 'Retard de Livraison ' },
  },

  {
    path: 'users',
    component: UtilisateurComponent,
    data: { titreComponent: 'Gestion des Utilisateurs' },
  },
  {
    path: 'gestion-menu',
    component: GestionMenuComponent,
    data: { titreComponent: 'Gestion des Menus' },
  },
  {
    path: 'admin-param',
    component: AdminComponent,
    data: { titreComponent: 'Administration' },
  },
  {
    path: 'plan-action',
    component: PlanActionComponent,
    data: { titreComponent: "Plan d'action" },
  },

  {
    path: '**',
    pathMatch: 'full',
    component: Page404Component,
    title: '404 Page',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
