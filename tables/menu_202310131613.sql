INSERT INTO menu (nom_menu,route_menu,rang_menu,icon_menu,sous_menu,accessibilite) VALUES
	 ('Accueil','accueil','1','bi bi-house-fill','[]',1),
	 ('Performance Individuelle','performance-indviduelle','3','bi bi-person-lines-fill ','[]',1),
	 ('Performance Atelier','','5','bi bi-bank2','[{"icon_sous_menu":"bi bi-clipboard2-data","nom_sous_menu":"Données Atelier","route_sous_menu":"performance-atelier","accessibilite_sous_menu":"1"},{"icon_sous_menu":"bi bi-gear-fill","nom_sous_menu":"Paramétrage atelier","route_sous_menu":"parametrage-atelier","accessibilite_sous_menu":"1"}]',1),
	 ('Plan d''action','plan-action','9','bi bi-clipboard-plus-fill ','[]',1),
	 ('Bilan Projet','bilan-projet','2','bi bi-calendar2-check-fill','[]',1),
	 ('Paramètres','','10','bi bi-gear-wide-connected','[{"icon_sous_menu":"bi bi-person-fill","nom_sous_menu":"Gestion des Utilisateurs","route_sous_menu":"users","accessibilite_sous_menu":"2"},{"icon_sous_menu":"bi bi-list","nom_sous_menu":"Gestion des Menus","route_sous_menu":"gestion-menu","accessibilite_sous_menu":"3"}]',2),
	 ('Qualité Projet','qualite-projet','6','bi bi-check-circle-fill ','[]',1),
	 ('Retard de Livraison','retard-de-livraison','8','bi bi-stopwatch-fill','[]',1),
	 ('Retour Client','retour-client','7','bi bi-chat-square-quote-fill ','[]',1),
	 ('Qualité Individuelle','qualite-individuelle','4','bi bi-person-check-fill ','[]',1);