import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalApiUrlService } from '../global-api-url.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root'
})
export class QualiteProjetService {

  constructor(private http: HttpClient, private url: GlobalApiUrlService) { }

  getQualiteProjet(id_ligne,annee) {
    var API_URL = this.url.REST_API + '/get-list-qualite-projet';
    return this.http.post(API_URL, { id_ligne,annee }, httpOptions);
  }
}
