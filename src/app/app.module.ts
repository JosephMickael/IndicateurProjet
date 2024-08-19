import { CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Page404Component } from './page404/page404.component';
import { HttpClientModule } from '@angular/common/http';
import { AccueilComponent } from './accueil/accueil.component';
import { UtilisateurComponent } from './utilisateur/utilisateur.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { GestionMenuComponent } from './gestion-menu/gestion-menu.component';
import { AdminComponent } from './admin/admin.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FilterPipe } from './services/filter/filter.pipe';
import { ParametrageComponent } from './parametrage/parametrage.component';
import { PerformanceAtelierComponent } from './performance-atelier/performance-atelier.component';
// import { PerformanceOperationComponent } from './performance-operation/performance-operation.component';
// import { QualiteOperationComponent } from './qualite-operation/qualite-operation.component';
import { RetourClientComponent } from './retour-client/retour-client.component';
import { RetardDeLivraisonComponent } from './retard-de-livraison/retard-de-livraison.component';
import { QualiteProjetComponent } from './qualite-projet/qualite-projet.component';
import { PerformanceIndividuelleComponent } from './performance-individuelle/performance-individuelle.component';
import { PlanActionComponent } from './plan-action/plan-action.component';
import { BilanProjetComponent } from './bilan-projet/bilan-projet.component';
import { QualiteIndividuelleComponent } from './qualite-individuelle/qualite-individuelle.component';


import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

import * as moment from 'moment';
import 'moment/locale/fr';
import { ParametrageAtelierComponent } from './parametrage-atelier/parametrage-atelier.component';


registerLocaleData(localeFr);
moment.locale('fr');

@NgModule({
  declarations: [
    AppComponent,
    Page404Component,
    AccueilComponent,
    UtilisateurComponent,
    GestionMenuComponent,
    AdminComponent,
    FilterPipe,
    ParametrageComponent,
    PerformanceAtelierComponent,
    // PerformanceOperationComponent,
    // QualiteOperationComponent,
    PerformanceIndividuelleComponent,
    RetourClientComponent,
    RetardDeLivraisonComponent,
    QualiteProjetComponent,
    PlanActionComponent,
    BilanProjetComponent,
    QualiteIndividuelleComponent,
    ParametrageAtelierComponent,
  
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    DragDropModule,
    NgbModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'fr' }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
