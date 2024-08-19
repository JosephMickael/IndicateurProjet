import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalApiUrlService } from '../global-api-url.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root'
})

export class ParametrageAtelierService {

  constructor(private http: HttpClient, private url: GlobalApiUrlService) { }

  getOperation(id_ligne,id_plan,id_fonction,annee) {
    var API_URL = this.url.REST_API + '/getListeOperationParam'; 
    return this.http.post(API_URL, { id_ligne,id_plan,id_fonction,annee}, httpOptions);
  }
  insertOperationParam(id_ligne, id_plan, id_fonction, operations) {
    var API_URL = this.url.REST_API + '/insertOperationParam'; 
    return this.http.post(API_URL, { id_ligne, id_plan, id_fonction, operations }, httpOptions);
  }
  getListeFrequence(frequence,annee) {
    var API_URL = this.url.REST_API + '/select-type-frequence'; 
    return this.http.post(API_URL, { frequence,annee }, httpOptions);
  }
  insertPrevisionParam(obj) {
    var API_URL = this.url.REST_API + '/insert-prevision-param'; 
    return this.http.post(API_URL, { obj }, httpOptions);
  }
}
