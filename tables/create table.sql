CREATE TABLE public.bilan_projet (
  id SERIAL,
  id_ligne VARCHAR NOT NULL,
  libelle_ligne VARCHAR NOT NULL,
  id_plan VARCHAR NOT NULL,
  libelle_plan VARCHAR NOT NULL,
  mois VARCHAR NOT NULL,
  annee VARCHAR NOT NULL,
  coef_b DOUBLE PRECISION,
  coef_p DOUBLE PRECISION,
  retour_client DOUBLE PRECISION,
  felicitation_client DOUBLE PRECISION,
  taux_qualite DOUBLE PRECISION,
  retard_livraison DOUBLE PRECISION,
  date_creation TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT bilan_projet_pkey PRIMARY KEY(id)
) 
WITH (oids = false);

ALTER TABLE public.bilan_projet
  OWNER TO postgres;
---------------------------------------

CREATE TABLE public.performance_individuelle (
  id SERIAL,
  id_ligne VARCHAR NOT NULL,
  libelle_ligne VARCHAR NOT NULL,
  id_plan VARCHAR NOT NULL,
  libelle_plan VARCHAR NOT NULL,
  id_fonction VARCHAR NOT NULL,
  libelle_fonction VARCHAR NOT NULL,
  id_operation VARCHAR NOT NULL,
  libelle_operation VARCHAR NOT NULL,
  matricule VARCHAR NOT NULL,
  nom VARCHAR NOT NULL,
  prenom VARCHAR NOT NULL,
  temps DOUBLE PRECISION,
  volume DOUBLE PRECISION,
  cadence DOUBLE PRECISION,
  date_recup DATE,
  date_creation TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT performance_individuelle_pkey PRIMARY KEY(id)
) 
WITH (oids = false);

ALTER TABLE public.performance_individuelle
  OWNER TO postgres;
  
-------------------------------------------

CREATE TABLE public.atelier_param_prevision_config (
  id SERIAL,
  id_ligne VARCHAR NOT NULL,
  id_plan VARCHAR NOT NULL,
  id_fonction VARCHAR NOT NULL,
  annee VARCHAR NOT NULL,
  type_prevision INTEGER NOT NULL,
  data TEXT,
  date_creation TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT atelier_param_prevision_config_pkey PRIMARY KEY(id)
) 
WITH (oids = false);

ALTER TABLE public.atelier_param_prevision_config
  OWNER TO postgres;
--------------------------------------------

CREATE TABLE public.performance_atelier (
  id SERIAL,
  id_ligne VARCHAR NOT NULL,
  libelle_ligne VARCHAR NOT NULL,
  id_plan VARCHAR NOT NULL,
  libelle_plan VARCHAR NOT NULL,
  id_fonction VARCHAR NOT NULL,
  libelle_fonction VARCHAR NOT NULL,
  id_operation VARCHAR NOT NULL,
  libelle_operation VARCHAR NOT NULL,
  volume DOUBLE PRECISION,
  temps DOUBLE PRECISION,
  cadence DOUBLE PRECISION,
  date_recup DATE,
  date_creation TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT now(),
  recepssion DOUBLE PRECISION,
  CONSTRAINT performance_atelier_old_ppkey PRIMARY KEY(id)
) 
WITH (oids = false);

ALTER TABLE public.performance_atelier
  OWNER TO postgres;
-----------------------------------------------
CREATE TABLE public.atelier_param_prevision_daily (
  id SERIAL,
  id_ligne VARCHAR NOT NULL,
  id_plan VARCHAR NOT NULL,
  id_fonction VARCHAR NOT NULL,
  id_operation VARCHAR NOT NULL,
  date_recup DATE NOT NULL,
  prevision DOUBLE PRECISION NOT NULL,
  date_creation TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT atelier_param_prevision_daily_pkey PRIMARY KEY(id)
) 
WITH (oids = false);

ALTER TABLE public.atelier_param_prevision_daily
  OWNER TO postgres;
-----------------------------------------------
CREATE TABLE public.plan_action (
  id SERIAL,
  id_ligne VARCHAR NOT NULL,
  libelle_ligne VARCHAR NOT NULL,
  id_plan VARCHAR,
  libelle_plan VARCHAR,
  id_fonction VARCHAR,
  libelle_fonction VARCHAR,
  id_operation VARCHAR,
  libelle_operation VARCHAR,
  commentaire TEXT,
  tickets TEXT,
  zone_enregistrement INTEGER,
  matricule VARCHAR(5),
  date_creation TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT plan_action_pkey PRIMARY KEY(id)
) 
WITH (oids = false);

COMMENT ON COLUMN public.plan_action.zone_enregistrement
IS '1: performance individuelle
2: qualité individuelle
3: performance atelier
4: qualité projet
5: retour client
6: retard de livraison';

COMMENT ON COLUMN public.plan_action.matricule
IS 'matricule_enregistreur';

ALTER TABLE public.plan_action
  OWNER TO postgres;
  
---------------------------------
CREATE TABLE public.menu (
  id_menu SERIAL,
  nom_menu VARCHAR(100),
  route_menu VARCHAR(100),
  rang_menu VARCHAR(20),
  icon_menu VARCHAR(100),
  sous_menu TEXT DEFAULT ''::text,
  accessibilite INTEGER,
  CONSTRAINT primary_key_table_menu PRIMARY KEY(id_menu)
) 
WITH (oids = false);

ALTER TABLE public.menu
  OWNER TO postgres;
------------------------------------
CREATE TABLE public.titre (
  "titreLogin" VARCHAR NOT NULL,
  "titreMenuMax" VARCHAR NOT NULL,
  "titreMenuMin" VARCHAR NOT NULL
) 
WITH (oids = false);

ALTER TABLE public.titre
  ALTER COLUMN "titreLogin" SET STATISTICS 0;

ALTER TABLE public.titre
  ALTER COLUMN "titreMenuMax" SET STATISTICS 0;

ALTER TABLE public.titre
  ALTER COLUMN "titreMenuMin" SET STATISTICS 0;

ALTER TABLE public.titre
  OWNER TO postgres;
-------------------------------------
  CREATE TABLE public.utilisateur (
  id_utilisateur SERIAL,
  nom_user VARCHAR(100),
  prenom_user VARCHAR(100),
  matricule VARCHAR(20),
  password_user VARCHAR(20),
  role_user VARCHAR(60),
  CONSTRAINT primary_key_table_utilisateur PRIMARY KEY(id_utilisateur)
) 
WITH (oids = false);

ALTER TABLE public.utilisateur
  OWNER TO postgres;