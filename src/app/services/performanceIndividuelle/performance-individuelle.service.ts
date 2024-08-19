import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalApiUrlService } from '../global-api-url.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class PerformanceIndividuelleService {
  constructor(private http: HttpClient, private url: GlobalApiUrlService) {}

  getListe(id_ligne, id_plan, id_fonction, id_operation, debut, fin) {
    var API_URL = this.url.REST_API + '/get-list-perfomance-individuelle';
    return this.http.post(
      API_URL,
      { id_ligne, id_plan, id_fonction, id_operation, debut, fin },
      httpOptions
    );
  }
}
