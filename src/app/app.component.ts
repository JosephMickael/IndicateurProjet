import { Component, HostListener } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from './services/auth/auth.service';
import { MenuService } from './services/menu/menu.service';
import { ToastService } from './services/toast/toast.service';
import { UsersService } from './services/users/users.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  
  constructor(private router:Router, private formBuilder:UntypedFormBuilder, private authService: AuthService, private menuService:MenuService, private cookies:CookieService, private userService:UsersService, private toast:ToastService) {
    if(sessionStorage.getItem('hide') == 'true' && this.cookies.get('matricule') != '' && this.router.url == '/'){
      this.router.navigate([sessionStorage.getItem('currentUrl')])
    }
  }

  nameApp: any
  nameMenuMax: any
  nameMenuMin: any

  title = 'demo-angular'
  innerWidth: any;

  hide: boolean
  hideLogin: boolean = true
  hideMenu: boolean = false

  menu:boolean

  matricule: any
  password: any
  resultat: any
  element: any
  liste_menu: any
  erreur: boolean = false
  status: boolean = false
  show: boolean = true
  buttonName:any
  role:any

  accessibilite:any

  menuResize:any 

  titreComponent:any

  authentificationForm = this.formBuilder.group({
    matricule: ['',Validators.required],
    password: ['',Validators.required]
  })
    
  changerMenuSize(){
    if(this.menuResize == true){
      this.menuResize = false
    } else {
      this.menuResize = true
    }
  }

  changeTitle(route:any, routeSM:any){
    let currentRoute = route == '' ? routeSM : route 
    let titleComponent   
    for(let i=0; i<this.router.config.length; i++){
      if(this.router.config[i].path == currentRoute){
        titleComponent = this.router.config[i].data.titreComponent
        this.router.config[i].title = sessionStorage.getItem('nameApp') + " | " + titleComponent
      }
    }
    if(titleComponent == '' || titleComponent == undefined || titleComponent == null){
      for(let i=0; i<this.router.config.length; i++){
        if('/'+this.router.config[i].path == sessionStorage.getItem('currentUrl')){
          this.titreComponent = this.router.config[i].data.titreComponent
          this.router.config[i].title = sessionStorage.getItem('nameApp') + " | " + this.titreComponent
        }
      }
    } else {
      this.titreComponent = titleComponent
    }
  }

  ngOnInit(){

    this.getTitreApp()
    
    this.changerMenuSize()

    this.hide = JSON.parse(sessionStorage.getItem('hide'))
    
    if(this.hide == false || this.hide == undefined || this.hide == null){
      this.hideLogin = true
      this.hideMenu = false
    } else {
      this.hideLogin = false
      this.hideMenu = true
      this.matricule = this.cookies.get('matricule')
    }
    this.listeMenu()
    
  }

  getTitreApp(){
    this.menuService.getTitre().subscribe(
      data => {
        this.nameApp = data[0].titreLogin
        sessionStorage.setItem('nameApp',this.nameApp)

        this.nameMenuMax = data[0].titreMenuMax
        this.nameMenuMin = data[0].titreMenuMin
      }
    )
  }

  deconnexion(){
    this.authService.logout()
    for(let i=0; i<this.router.config.length; i++){
      if('/'+this.router.config[i].path == sessionStorage.getItem('currentUrl')){
        this.titreComponent = this.router.config[i].data.titreComponent
        this.router.config[i].title = sessionStorage.getItem('nameApp') + " | " + this.titreComponent
      }
    }
    this.hideLogin = true
    this.hideMenu = false
  }

  listeMenu(){
    this.role = this.cookies.get('role')

    if(this.role == 'Administrateur'){
      this.accessibilite = 3
    } else if(this.role == 'Responsable'){
      this.accessibilite = 2
    } else {
      this.accessibilite = 1
    }

    this.menuService.getMenu(this.accessibilite).subscribe(
      data => {this.liste_menu = data},
      error => {},
      () => {
        for(let i=0; i<this.liste_menu.length; i++){
          this.liste_menu[i].sous_menu = JSON.parse(this.liste_menu[i].sous_menu)
          for(let item in this.liste_menu[i].sous_menu){
            this.liste_menu[i].sous_menu = this.liste_menu[i].sous_menu.filter(f => f.accessibilite_sous_menu <= this.accessibilite)
          }
        }
      } 
    )

    for(let i=0; i<this.router.config.length; i++){
      if('/'+this.router.config[i].path == sessionStorage.getItem('currentUrl')){
        this.titreComponent = this.router.config[i].data.titreComponent
        this.router.config[i].title = sessionStorage.getItem('nameApp') + " | " + this.titreComponent
      }
    }
  }

  connexion(data: any){        
    this.matricule = data.matricule
    this.password = data.password

    if(this.authentificationForm.status == 'INVALID'){
      this.status = true
      this.erreur = false
    } else {
      this.menuService.getLogin(this.matricule, this.password).subscribe(
        data => {this.resultat = data[0].count
          console.log(data[0])},
        error => {},
        () => {   
          if(this.resultat == 0){
            this.erreur = true
            this.status = false
            this.hideLogin = true
            this.hideMenu = false
          } else {
            this.authService.login(this.matricule, this.resultat).subscribe(
              data => {console.log(data)},
              error => {},
              () => {
                let matricule = this.cookies.get('matricule')
                let role
                this.userService.getUser(matricule).subscribe(
                  data => {
                    this.cookies.set('nom', data[0].nom_user)
                    this.cookies.set('prenom', data[0].prenom_user)
                    this.cookies.set('fullname', data[0].nom_user + ' ' + data[0].prenom_user)
                    this.cookies.set('role', data[0].role_user)
                    this.cookies.set('id_utilisateur', data[0].id_utilisateur)
                    role = data[0].role_user
                  }, 
                  error => {},
                  () => {
                    this.role = role
                    let dataMenu
                    
                    this.listeMenu()
                  
                    this.menuService.getMenu(this.accessibilite).subscribe(
                      data => {dataMenu = data},
                      error => {},
                      () => {
                        let acces 
                        console.log(dataMenu)
                        for(let item in dataMenu){
                          dataMenu[item].sous_menu = JSON.parse(dataMenu[item].sous_menu)
                          dataMenu[item].sous_menu = dataMenu[item].sous_menu.filter(f => f.accessibilite_sous_menu <= this.accessibilite)
                          if('/'+dataMenu[item].route_menu == this.router.url){
                            acces = true
                          }
                          for(let item_sm in dataMenu[item].sous_menu){
                            if('/'+dataMenu[item].sous_menu[item_sm].route_sous_menu == this.router.url){
                              acces = true
                            }                            
                          }
                        }
                        if(acces == undefined){
                          for(let i=0; i<this.router.config.length; i++){
                            if('/'+this.router.config[i].path == '/accueil'){
                              this.titreComponent = this.router.config[i].data.titreComponent
                              this.router.config[i].title = sessionStorage.getItem('nameApp') + " | " + this.titreComponent
                            }
                          }
                          this.router.navigate(['accueil'])
                          this.toast.Info('Vous ne pouvez pas accéder à cette partie (\''+this.router.url+'\')')
                        }
                      }
                    )

                    for(let i=0; i<this.router.config.length; i++){
                      if('/'+this.router.config[i].path == this.router.url){
                        this.titreComponent = this.router.config[i].data.titreComponent
                        this.router.config[i].title = sessionStorage.getItem('nameApp') + " | " + this.titreComponent
                      }
                    }
                    
                    this.hideLogin = false
                    this.hideMenu = true
                  }
                )
                let hide = sessionStorage.getItem('hide')
                if(matricule != ''){
                  if(this.router.url == '/'){
                    this.hide = JSON.parse(hide)
                    this.router.navigate(['/accueil'])
                  } else {
                    this.hide = JSON.parse(hide)
                  }
                }
              }
            )
            this.authentificationForm.reset()
            this.erreur = false
            this.status = false
          }
        }
      )
    }
  }

}

