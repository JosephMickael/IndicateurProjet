import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable, of } from 'rxjs';
import { tap, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  constructor(private cookies:CookieService, private route:Router) { }

  isUserLoggedIn: boolean = false;

  login(matricule:string, resultat:any): Observable<any>{
    
    this.isUserLoggedIn = resultat > 0;
    this.cookies.set('matricule', this.isUserLoggedIn ? matricule : '' ); // Cookies Services
    sessionStorage.setItem('hide', this.isUserLoggedIn ? 'true' : 'false') // Session Storage
    
    return of(this.isUserLoggedIn).pipe(
      delay(100),
      tap(val =>{
        console.log("Is User Authentication is successful: " + val);        
      })
    )
  }

  logout(): void{
    this.isUserLoggedIn = false;
    this.cookies.set('matricule','') // Cookies Services
    sessionStorage.setItem('hide', 'false') // Session Storage

    this.cookies.delete('nom')
    this.cookies.delete('prenom')
    this.cookies.delete('fullname')
    this.cookies.delete('role')
    this.cookies.delete('id_utilisateur')

    this.route.navigate(['accueil'])
  }
  
}
