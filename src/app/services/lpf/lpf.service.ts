import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { GlobalApiUrlService } from '../global-api-url.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})

export class LPFService {

  constructor(private http: HttpClient, private url: GlobalApiUrlService) {}

  getListeAnnee() {
    var API_URL = this.url.REST_API + '/get-list-annee';
    return this.http.get(API_URL, {});
  }
  
  // getListeMois() {
  //   var API_URL = this.url.REST_API + '/get-list-mois';
  //   return this.http.get(API_URL, {});
  // }
  
  
  getListeLigne() {
    var API_URL = this.url.REST_API + '/get-list-ligne';
    return this.http.get(API_URL, {});
  }

  getListePlan(id_ligne) {
    var API_URL = this.url.REST_API + '/get-list-plan';
    return this.http.post(API_URL, { id_ligne }, httpOptions);
  }

  getListeFonction(id_ligne, id_plan) {
    var API_URL = this.url.REST_API + '/get-list-fonction';
    return this.http.post(API_URL, { id_ligne, id_plan }, httpOptions);
  }
  getListeOperation(id_ligne, id_plan,id_fonction) {
    var API_URL = this.url.REST_API + '/get-list-operation';
    return this.http.post(API_URL, { id_ligne, id_plan,id_fonction }, httpOptions);
  }
}
