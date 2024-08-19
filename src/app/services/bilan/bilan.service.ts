import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { GlobalApiUrlService } from '../global-api-url.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})

export class BilanService {

  constructor(private http: HttpClient, private url: GlobalApiUrlService) { }

  getBilan(id_ligne,annee) {
    var API_URL = this.url.REST_API + '/get-bilan';
    return this.http.post(API_URL, { id_ligne,annee }, httpOptions);
  }
}