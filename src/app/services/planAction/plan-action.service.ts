import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalApiUrlService } from '../global-api-url.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root'
})
export class PlanActionService {

  constructor(private http: HttpClient, private url: GlobalApiUrlService) {}

  insertPlanAction(Obj) {
    var API_URL = this.url.REST_API + '/insert-plan-action'; 
    return this.http.post(API_URL, { Obj }, httpOptions);
  }
  affichagePlanAction(Obj) {
    var API_URL = this.url.REST_API + '/affichage-plan-action'; 
    return this.http.post(API_URL, { Obj }, httpOptions);
  }
  getDetailKB(Obj) {
    var API_URL = this.url.REST_API + '/get-detail-kanboard'; 
    return this.http.post(API_URL, { Obj }, httpOptions);
  }
  affichagesPlanActions(Obj) {
    var API_URL = this.url.REST_API + '/affichage-plans-actions'; 
    return this.http.post(API_URL, { Obj }, httpOptions);
  }
  getPlanActions(id_ligne, id_plan, id_fonction, id_operation, debut,fin,  matricule,menu){
    var API_URL = this.url.REST_API + '/get-plan-action'; 
    return this.http.post(API_URL, { id_ligne, id_plan, id_fonction, id_operation, debut,fin, matricule,menu }, httpOptions);
  }
  getMatricule() {
    var API_URL = this.url.REST_API + '/get-matricule'; 
    return this.http.post(API_URL, { }, httpOptions);
  }
  
  getZoneEnregistrement() {
    var API_URL = this.url.REST_API + '/get-zone-enregistrement'; 
    return this.http.post(API_URL, { }, httpOptions);
  }
}
