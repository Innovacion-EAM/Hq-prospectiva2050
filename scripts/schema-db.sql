-- ════════════════════════════════════════════════════════════════════════════
--  Esquema de la base de datos — HQ Prospectiva 2050
-- ════════════════════════════════════════════════════════════════════════════
--
--  Para PRODUCCIÓN, donde DB_SYNCHRONIZE=false y TypeORM no crea nada:
--      make db-schema     → aplica este archivo
--
--  Está generado con `pg_dump --schema-only` sobre la base ya sincronizada, para
--  que no haya que mantener el SQL a mano y se parezca a lo que el backend
--  espera. Para REGENERARLO tras cambiar las entidades:
--      docker compose -f infra/compose/docker-compose.yml \
--        --project-directory infra/compose exec -T postgres \
--        pg_dump -U postgres -d hq_prospectiva2050 --schema-only \
--        --no-owner --no-privileges > scripts/schema-db.sql
--
--  A partir de aquí, los cambios incrementales van como migraciones numeradas en
--  scripts/migrations/, no editando este archivo:
--      make db-migrate
-- ════════════════════════════════════════════════════════════════════════════

--
-- PostgreSQL database dump
--


-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: config_dimensiones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.config_dimensiones (
    id integer NOT NULL,
    slug character varying NOT NULL,
    title character varying NOT NULL,
    short text,
    icon character varying NOT NULL,
    summary text NOT NULL,
    body jsonb DEFAULT '[]'::jsonb NOT NULL,
    layers jsonb DEFAULT '[]'::jsonb NOT NULL,
    steps jsonb DEFAULT '[]'::jsonb NOT NULL,
    charts jsonb DEFAULT '[]'::jsonb NOT NULL,
    tipo text DEFAULT 'dimension'::text NOT NULL,
    eliminado_at timestamp with time zone
);


--
-- Name: config_dimensiones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.config_dimensiones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: config_dimensiones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.config_dimensiones_id_seq OWNED BY public.config_dimensiones.id;


--
-- Name: config_doc_categorias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.config_doc_categorias (
    id integer NOT NULL,
    slug character varying NOT NULL,
    title character varying NOT NULL,
    description text NOT NULL,
    icon character varying NOT NULL,
    eliminado_at timestamp with time zone
);


--
-- Name: config_doc_categorias_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.config_doc_categorias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: config_doc_categorias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.config_doc_categorias_id_seq OWNED BY public.config_doc_categorias.id;


--
-- Name: config_entidades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.config_entidades (
    id integer NOT NULL,
    nombre character varying NOT NULL,
    eliminado_at timestamp with time zone
);


--
-- Name: config_entidades_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.config_entidades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: config_entidades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.config_entidades_id_seq OWNED BY public.config_entidades.id;


--
-- Name: config_municipios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.config_municipios (
    id integer NOT NULL,
    dato character varying(120),
    descripcion character varying(500),
    eliminado_at timestamp with time zone,
    nombre character varying NOT NULL
);


--
-- Name: config_municipios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.config_municipios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: config_municipios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.config_municipios_id_seq OWNED BY public.config_municipios.id;


--
-- Name: config_proyecto_paginas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.config_proyecto_paginas (
    id integer NOT NULL,
    slug character varying NOT NULL,
    title character varying NOT NULL,
    kicker character varying NOT NULL,
    image character varying,
    excerpt text NOT NULL,
    lead text,
    body jsonb DEFAULT '[]'::jsonb NOT NULL,
    eliminado_at timestamp with time zone
);


--
-- Name: config_proyecto_paginas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.config_proyecto_paginas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: config_proyecto_paginas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.config_proyecto_paginas_id_seq OWNED BY public.config_proyecto_paginas.id;


--
-- Name: config_site; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.config_site (
    id integer NOT NULL,
    nombre character varying NOT NULL,
    tagline character varying NOT NULL,
    headline jsonb DEFAULT '[]'::jsonb NOT NULL,
    email character varying NOT NULL,
    telefono character varying NOT NULL,
    "telefonoHref" character varying NOT NULL,
    direccion character varying NOT NULL,
    ciudad character varying NOT NULL,
    facebook text,
    instagram text,
    x text
);


--
-- Name: config_site_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.config_site_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: config_site_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.config_site_id_seq OWNED BY public.config_site.id;


--
-- Name: config_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.config_stats (
    id integer NOT NULL,
    value character varying NOT NULL,
    label character varying NOT NULL,
    subtext text,
    eliminado_at timestamp with time zone
);


--
-- Name: config_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.config_stats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: config_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.config_stats_id_seq OWNED BY public.config_stats.id;


--
-- Name: config_talleres; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.config_talleres (
    id integer NOT NULL,
    date date NOT NULL,
    title character varying NOT NULL,
    place text NOT NULL,
    status character varying NOT NULL,
    eliminado_at timestamp with time zone
);


--
-- Name: config_talleres_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.config_talleres_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: config_talleres_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.config_talleres_id_seq OWNED BY public.config_talleres.id;


--
-- Name: convocatorias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.convocatorias (
    id integer NOT NULL,
    titulo character varying NOT NULL,
    fecha date,
    descripcion text,
    enlace text,
    activa boolean DEFAULT true NOT NULL,
    eliminado_at timestamp with time zone
);


--
-- Name: convocatorias_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.convocatorias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: convocatorias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.convocatorias_id_seq OWNED BY public.convocatorias.id;


--
-- Name: documentos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documentos (
    id integer NOT NULL,
    titulo character varying NOT NULL,
    autor character varying NOT NULL,
    fecha date NOT NULL,
    tipo character varying NOT NULL,
    delimitacion character varying NOT NULL,
    formato character varying NOT NULL,
    link text,
    archivo text,
    eliminado_at timestamp with time zone
);


--
-- Name: documentos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.documentos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: documentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.documentos_id_seq OWNED BY public.documentos.id;


--
-- Name: media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media (
    id integer NOT NULL,
    filename character varying NOT NULL,
    url character varying NOT NULL,
    mime character varying NOT NULL,
    size integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: media_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.media_id_seq OWNED BY public.media.id;


--
-- Name: mensajes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mensajes (
    id integer NOT NULL,
    nombre character varying NOT NULL,
    email character varying,
    asunto character varying NOT NULL,
    mensaje text,
    tipo character varying NOT NULL,
    fecha date NOT NULL,
    leido boolean DEFAULT false NOT NULL,
    consentimiento boolean DEFAULT false NOT NULL,
    estado character varying(20) DEFAULT 'nuevo'::character varying NOT NULL,
    seguimiento text
);


--
-- Name: mensajes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mensajes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mensajes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mensajes_id_seq OWNED BY public.mensajes.id;


--
-- Name: noticias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.noticias (
    id integer NOT NULL,
    slug character varying NOT NULL,
    titulo character varying NOT NULL,
    categoria character varying NOT NULL,
    fecha date NOT NULL,
    imagen character varying,
    resumen text NOT NULL,
    contenido jsonb NOT NULL,
    etiquetas jsonb DEFAULT '[]'::jsonb NOT NULL,
    publicado boolean DEFAULT true NOT NULL,
    destacado boolean DEFAULT false NOT NULL,
    "publicadoEn" timestamp without time zone,
    autor character varying,
    eliminado_at timestamp with time zone
);


--
-- Name: noticias_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.noticias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: noticias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.noticias_id_seq OWNED BY public.noticias.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    name text NOT NULL,
    applied_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying NOT NULL,
    "passwordHash" character varying NOT NULL,
    role character varying DEFAULT 'editor'::character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: config_dimensiones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.config_dimensiones ALTER COLUMN id SET DEFAULT nextval('public.config_dimensiones_id_seq'::regclass);


--
-- Name: config_doc_categorias id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.config_doc_categorias ALTER COLUMN id SET DEFAULT nextval('public.config_doc_categorias_id_seq'::regclass);


--
-- Name: config_entidades id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.config_entidades ALTER COLUMN id SET DEFAULT nextval('public.config_entidades_id_seq'::regclass);


--
-- Name: config_municipios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.config_municipios ALTER COLUMN id SET DEFAULT nextval('public.config_municipios_id_seq'::regclass);


--
-- Name: config_proyecto_paginas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.config_proyecto_paginas ALTER COLUMN id SET DEFAULT nextval('public.config_proyecto_paginas_id_seq'::regclass);


--
-- Name: config_site id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.config_site ALTER COLUMN id SET DEFAULT nextval('public.config_site_id_seq'::regclass);


--
-- Name: config_stats id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.config_stats ALTER COLUMN id SET DEFAULT nextval('public.config_stats_id_seq'::regclass);


--
-- Name: config_talleres id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.config_talleres ALTER COLUMN id SET DEFAULT nextval('public.config_talleres_id_seq'::regclass);


--
-- Name: convocatorias id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.convocatorias ALTER COLUMN id SET DEFAULT nextval('public.convocatorias_id_seq'::regclass);


--
-- Name: documentos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documentos ALTER COLUMN id SET DEFAULT nextval('public.documentos_id_seq'::regclass);


--
-- Name: media id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media ALTER COLUMN id SET DEFAULT nextval('public.media_id_seq'::regclass);


--
-- Name: mensajes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensajes ALTER COLUMN id SET DEFAULT nextval('public.mensajes_id_seq'::regclass);


--
-- Name: noticias id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.noticias ALTER COLUMN id SET DEFAULT nextval('public.noticias_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: mensajes PK_20c919d08249bb93d84ce01beb4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensajes
    ADD CONSTRAINT "PK_20c919d08249bb93d84ce01beb4" PRIMARY KEY (id);


--
-- Name: documentos PK_30b7ee230a352e7582842d1dc02; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documentos
    ADD CONSTRAINT "PK_30b7ee230a352e7582842d1dc02" PRIMARY KEY (id);


--
-- Name: config_stats PK_35065626200ed618c71263738ce; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.config_stats
    ADD CONSTRAINT "PK_35065626200ed618c71263738ce" PRIMARY KEY (id);


--
-- Name: noticias PK_526a107301fc9dfe8d836d6cf27; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.noticias
    ADD CONSTRAINT "PK_526a107301fc9dfe8d836d6cf27" PRIMARY KEY (id);


--
-- Name: config_dimensiones PK_7202836f36354aaf9cb9d64b875; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.config_dimensiones
    ADD CONSTRAINT "PK_7202836f36354aaf9cb9d64b875" PRIMARY KEY (id);


--
-- Name: config_entidades PK_74708bdf0eab1a1e34509f50b78; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.config_entidades
    ADD CONSTRAINT "PK_74708bdf0eab1a1e34509f50b78" PRIMARY KEY (id);


--
-- Name: config_proyecto_paginas PK_83086a1f15d2ec25e95f0c0ee87; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.config_proyecto_paginas
    ADD CONSTRAINT "PK_83086a1f15d2ec25e95f0c0ee87" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: config_site PK_b0797a4ee30ada32fdcf2374b53; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.config_site
    ADD CONSTRAINT "PK_b0797a4ee30ada32fdcf2374b53" PRIMARY KEY (id);


--
-- Name: config_talleres PK_b09952ab2077d5bb86a945c9305; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.config_talleres
    ADD CONSTRAINT "PK_b09952ab2077d5bb86a945c9305" PRIMARY KEY (id);


--
-- Name: convocatorias PK_c56366d176570e0203f116e84cb; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.convocatorias
    ADD CONSTRAINT "PK_c56366d176570e0203f116e84cb" PRIMARY KEY (id);


--
-- Name: media PK_f4e0fcac36e050de337b670d8bd; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY (id);


--
-- Name: config_doc_categorias PK_fbe31c0186af7ec84eaa7b6b29b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.config_doc_categorias
    ADD CONSTRAINT "PK_fbe31c0186af7ec84eaa7b6b29b" PRIMARY KEY (id);


--
-- Name: noticias UQ_8b6a1631530f1d3acc047b32fe2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.noticias
    ADD CONSTRAINT "UQ_8b6a1631530f1d3acc047b32fe2" UNIQUE (slug);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: config_municipios config_municipios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.config_municipios
    ADD CONSTRAINT config_municipios_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (name);


--
-- PostgreSQL database dump complete
--


