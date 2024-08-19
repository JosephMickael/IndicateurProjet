import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ToastService } from '../services/toast/toast.service';
import { UsersService } from '../services/users/users.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-utilisateur',
  templateUrl: './utilisateur.component.html',
  styleUrls: ['./utilisateur.component.css']
})
export class UtilisateurComponent implements OnInit {
  registerForm: FormGroup;

  constructor(private router:Router, private usersService:UsersService, private toast:ToastService, private cookies:CookieService) { 
    sessionStorage.setItem('currentUrl', this.router.url) 
  }

  titreComponent: string = "Gestion des utilisateurs"
  liste_user : any = []
  nom_user:any
  prenom_user:any
  matricule:any
  password_user:any
  data:any
  role_user:any
  role:any = this.cookies.get('role')
  matricule_log:any = this.cookies.get('matricule')

  ngOnInit(): void {
    this.listeUsers()
  }

  getUserGPAO(matricule: any){
    if(matricule == '' || matricule == undefined){
      this.nom_user = ''
      this.prenom_user = ''
    } else {
      this.usersService.getAllUserGPAO(matricule).subscribe(
        data => {
          this.nom_user = data[0].nom
          this.prenom_user = data[0].prenoms
          this.password_user = data[0].passwd
          console.log(data)
        }
      )
    }
  }

  listeUsers(){
    this.usersService.getAllUser().subscribe(
      data => this.liste_user = data
    )
  }

  ajouterUser(nom_user:any, prenom_user:any, matricule:any, password_user:any, role_user:any){
    if (role_user == undefined || nom_user == '' || prenom_user == '' ||  role_user == '' || role_user == null || matricule == '' || matricule == undefined || password_user == '' || password_user == undefined){
      this.toast.Warning('Veuillez remplir les champs !')
      return
    }  
    this.usersService.insertUser(nom_user, prenom_user, matricule, password_user, role_user).subscribe(
      data => {},
      error => {},
      () => {
        this.toast.Success('')
        this.listeUsers()
        this.nom_user =''
        this.prenom_user =''
        this.matricule =''
        this.password_user =''
        this.role_user =''
      }
    )
  }

  modifierUser(data:any){
    let id_utilisateur = data.id_utilisateur
    let matricule = data.matricule
    let nom_user = data.nom_user
    let prenom_user = data.prenom_user
    let password_user = data.password_user
    let role_user = data.role_user
    this.usersService.updateUser(matricule,nom_user,prenom_user,password_user,role_user,id_utilisateur).subscribe(
      data =>{
        this.listeUsers()
        this.toast.Success('')
      }
    )
  }
  supprimerUser(id_utilisateur:any){
    Swal.fire({
      title: 'Suppression',
      text: "Voulez-vous vraiment supprimer ces coordonnées ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Non'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usersService.supprimerUser(id_utilisateur).subscribe(
          data => {}, 
          error => {},
          () => {
            this.listeUsers()
            this.toast.Success('')
          }
        )
      }
    })
  }

}
