CREATE TABLE public.qualite_individuelle (
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
  volume DOUBLE PRECISION,
  qualite VARCHAR,
  date_recup DATE,
  date_creation TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT qualite_individuelle_pkey PRIMARY KEY(id)
) 

/**/


CREATE TABLE public.performance_atelier (
  id INTEGER DEFAULT nextval('performance_atelier_id_seq'::regclass) NOT NULL,
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
  prevision DOUBLE PRECISION,
  prev_initial DOUBLE PRECISION,
  reception DOUBLE PRECISION,
  obj_journalier DOUBLE PRECISION,
  rang INTEGER,
  date_recup DATE,
  date_creation TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT now(),
  CONSTRAINT performance_atelier_ppkey PRIMARY KEY(id)
) 