import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalApiUrlService } from '../global-api-url.service';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root'
})
export class PerformanceAtelierService {

  constructor(private http: HttpClient, private url: GlobalApiUrlService) { }

  getPerfAtelier_old(id_ligne,id_plan,id_fonction,debut,fin ) {
    var API_URL = this.url.REST_API + '/get-list-perfomance-atelier'; 
    return this.http.post(API_URL, { id_ligne,id_plan,id_fonction,debut,fin}, httpOptions);
  }
  getPerfAtelier(id_ligne,id_plan,id_fonction,debut,fin ) {
    var API_URL = this.url.REST_API + '/atelier-performance'; 
    return this.http.post(API_URL, { id_ligne,id_plan,id_fonction,debut,fin}, httpOptions);
  }
  insertReception(Obj) {
    var API_URL = this.url.REST_API + '/insert-reception'; 
    return this.http.post(API_URL, { Obj }, httpOptions);
  }
  insertPrevision(Obj) {
    var API_URL = this.url.REST_API + '/insert-prevision'; 
    return this.http.post(API_URL, { Obj }, httpOptions);
  }

  ajoutPrevision(previsionData, semaine, typeParametre, mois, annee) {
    var API_URL = this.url.REST_API + '/ajoutPrevision'; 
    return this.http.post(API_URL, { previsionData, semaine, typeParametre, mois, annee}, httpOptions);
  }

  ajoutObJournalier(ObjJournalierData, value, objJournalier) {
    var API_URL = this.url.REST_API + '/ajoutObjJournalier';  
    return this.http.post(API_URL, { ObjJournalierData, value, objJournalier }, httpOptions);
  }

  updateRange(operations, range) {
    var API_URL = this.url.REST_API + '/updateRange';  
    return this.http.post(API_URL, { operations, range }, httpOptions);
  }

  getOperations(id_ligne, id_plan,id_fonction, selectedParametre, selectedSemaine, selectedMonths, annee) {
    var API_URL = this.url.REST_API + '/getOperations';
    return this.http.post(API_URL, { id_ligne, id_plan, id_fonction, selectedParametre, selectedSemaine, selectedMonths, annee }, httpOptions);
  }

  ajoutReception(ReceptionData, value, objreception) {
    var API_URL = this.url.REST_API + '/ajoutReception';  
    return this.http.post(API_URL, { ReceptionData, value, objreception }, httpOptions);
  }
  addParamAtelier(id_ligne,id_plan,id_fonction,id_operation,prevision,annee,frequence,detail_frequence) {
    var API_URL = this.url.REST_API + '/addParamAtelier';  
    return this.http.post(API_URL, { id_ligne,id_plan,id_fonction,id_operation,prevision,annee,frequence,detail_frequence}, httpOptions);
  }
}
