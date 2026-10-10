export const SITE = {
  name: "Horizonte Quindío",
  tagline: "Prospectiva territorial hacia 2050",
  headline: ["Proyectamos el futuro", "De la región uniendo", "El esfuerzo del", "talento local."],
  email: "contacto@horizontequindio.com",
  phone: "+57 310 565 6351",
  phoneHref: "tel:+573105656351",
  address: "Calle 24 # 12 - 34",
  city: "Armenia, Quindío, Colombia",
  social: {
    facebook: "https://www.facebook.com/",
    instagram: "https://www.instagram.com/",
    x: "https://x.com/",
  },
};

/**
 * Datos legales editables (Ajustes → Legal). Viven en la fila de configuración
 * del sitio y los usan el aviso de privacidad y los términos de uso.
 *
 * Van vacíos a propósito: el responsable, su NIT, el canal de derechos ARCO y el
 * plazo de conservación solo los conoce la organización. Mientras sigan así, la
 * página muestra un marcador entre corchetes en cada hueco para que nadie dé por
 * completo el aviso sin estarlo. Este objeto es el respaldo cuando la API falla.
 */
export type Legal = {
  responsable: string;
  nit: string;
  direccion: string;
  ciudad: string;
  correoArco: string;
  plazoConservacion: string;
  quienesAcceden: string;
  actualizado: string;
};

export const LEGAL: Legal = {
  responsable: "",
  nit: "",
  direccion: "",
  ciudad: "",
  correoArco: "",
  plazoConservacion: "",
  quienesAcceden: "",
  actualizado: "",
};

export const STATS = [
  { value: "11", label: "Entidades Aliadas", subtext: "Públicas, privadas y academia" },
  { value: "2050", label: "Visión de Futuro", subtext: "Horizonte temporal de región" },
  { value: "3", label: "Etapas de Prospectiva", subtext: "Diagnóstico, escenarios e institucionalización" },
  { value: "60", label: "Años del Departamento", subtext: "Gobernanza y pertenencia territorial" },
] as const;

/**
 * Enlaces del menú del encabezado, y textos del logo.
 *
 * Esto ya no es la fuente de verdad: el orden y los textos vienen de la base, se
 * editan en Ajustes → Header y llegan por `/api/site`. Queda como **respaldo**
 * para los dos casos en que no haya nada guardable: que la API falle y para que
 * el sitio se vea completo sin conexión.
 *
 * El respaldo también es lo que se siembra por defecto, así que un entorno recién
 * instalado muestra el mismo menú de siempre en vez de una barra vacía.
 */
export const NAV = [
{ label: "Inicio", href: "/", match: "/" },
  { label: "El proyecto", href: "/proyecto", match: "/proyecto" },
  { label: "Dimensiones", href: "/dimensiones", match: "/dimensiones" },
  { label: "Documentos", href: "/documentos", match: "/documentos" },
  { label: "Repositorio", href: "/repositorio", match: "/repositorio" },
  { label: "Noticias", href: "/noticias", match: "/noticias" },
  { label: "Participa", href: "/participa", match: "/participa" },
  { label: "Contáctanos", href: "/contactos", match: "/contactos" },
] as const;

/** Textos que van al lado del logo. Editables en Ajustes → Header. */
export const LOGO = {
  titulo: "Horizonte Quindío",
  subtitulo: "Prospectiva 2050",
  /** La imagen que se suba desde Ajustes → Header, si la hay. */
  url: "" as string,
};

/**
 * Los colores con los que se puede pintar un botón de la portada.
 *
 * No son solo del hero: **todos** los botones de la portada eligen de esta misma
 * lista, y es lo que hace que el sitio se vea igual aunque cada sección tenga el
 * suyo. Deben coincidir con `COLORES_BOTON` del backend —la clave es lo que viaja
 * por la API y lo que se guarda— y con el mapa de clases de
 * `portada-colores.ts`, que es donde la clave se traduce a color. Si se añade un
 * color en uno de los tres sitios y no en los otros, el backend responde 400 al
 * guardar o el botón sale sin fondo.
 *
 * La lista es cerrada y corta a propósito: cada color viene con el texto que sí
 * contrasta con él (los ratios están en `portada-colores.ts`), y con un selector
 * libre se podía elegir un fondo claro con la letra oscura encima y quedaría
 * ilegible sin que nada lo avisara.
 */
export const COLORES_BOTON = ["lima", "lima-oscuro", "verde", "tinta", "convoca"] as const;
export type ColorBoton = (typeof COLORES_BOTON)[number];

/**
 * Los colores válidos para el botón que va **encima de la caja lima** del hero.
 *
 * Una lista aparte porque la caja es lima: un botón lima encima de una caja lima
 * es el mismo color con el mismo texto encima, y el botón deja de verse. Los tres
 * que quedan son oscuros y se leen bien tanto ahí como sobre el papel. El backend
 * valida contra su propia copia de esta lista.
 */
export const COLORES_BOTON_SOBRE_LIMA = ["verde", "tinta", "convoca"] as const;
export type ColorBotonSobreLima = (typeof COLORES_BOTON_SOBRE_LIMA)[number];

/**
 * Las entidades aliadas de la red institucional.
 *
 * Antes viajaban en su propia tabla (`config_entidades`) con una pantalla
 * aparte en el panel. Desde que la lista se edita y ordena en Ajustes → El
 * proyecto viven en `PORTADA.elProyecto.entidades` —como el resto del contenido
 * de esa página, con un solo guardado—, y esta constante queda como respaldo
 * para cuando no hay nada guardado.
 *
 * CEPAL no está aquí: va siempre al final del respaldo de `elProyecto` (es la
 * entidad que trae el acompañamiento técnico), y en `/proyecto` se pinta con su
 * caja lima cuando el nombre contiene "CEPAL".
 */
export const ENTITIES = [
  "Gobernación del Quindío",
  "Alcaldía de Armenia",
  "Universidad del Quindío",
  "Universidad La Gran Colombia",
  "Cámara de Comercio de Armenia y del Quindío",
  "Comité de Cafeteros del Quindío",
  "Comité Intergremial del Quindío",
  "Corporación Autónoma Regional del Quindío",
  "ProQuindío",
  "Comfenalco Quindío",
  "Facilísimo",
  "Empresa de Energía del Quindío",
];

/**
 * La portada: el hero y las secciones que van desde ahí hasta antes del pie de
 * página, **más la página `/proyecto`** (la sección `elProyecto`).
 *
 * El contenido de `/proyecto` vive aquí porque las secciones editables del
 * sitio viven todas en `home` (jsonb) y el módulo «El proyecto» del panel la
 * edita con el mismo guardado que el resto. No es que la página sea parte de la
 * portada: es que comparten almacenamiento.
 *
 * Esto ya no es la fuente de verdad: llega de la base, se edita bloque a bloque en
 * Ajustes y viene por `/api/site`. Queda como **respaldo** para cuando no hay nada
 * guardado o la API falla, con el mismo criterio que el menú y los textos del
 * logo: un texto vacío cae aquí en vez de dejar la sección a medias.
 *
 * Está duplicado a propósito en `backend/src/seed-data.ts` (semilla) — los dos
 * paquetes no se importan entre sí —, así que **si se cambia aquí, hay que
 * cambiarlo allá**.
 */
export const PORTADA = {
  hero: {
    // Imagen única del héroe: trae el fondo y las personas en una sola pieza.
    fondo: "/images/hero-banner.jpg",
    botonTexto: "Explorar más »",
    botonColor: "lima" as ColorBoton,
    cajaTitulo: "¿Tienes alguna pregunta o quieres darnos una recomendación?",
    cajaBotonColor: "verde" as ColorBotonSobreLima,
  },
  proyecto: {
    fondo: "/images/city-aerial.jpg",
    titulo: "El proyecto",
    texto:
      "Un ejercicio participativo con catorce entidades y la CEPAL para construir la visión de largo plazo del departamento.",
    tarjetaBoton: "Explorar más >>",
    botonColor: "lima" as ColorBoton,
    dimsTitulo: "Las cuatro dimensiones",
    dimsTexto:
      "Cuatro lecturas del territorio que estructuran la lectura del Quindío. Toca una para desplegar su resumen.",
    accionTitulo: "Del diagnóstico a la acción",
  },
  elProyecto: {
    fondo: "/images/hero-city.jpg",
    titulo: "Una visión compartida para el Quindío",
    intro:
      "Catorce entidades del departamento y la CEPAL construyen, entre 2026 y 2027, la hoja de ruta al 2050.",
    parrafoUno:
      "Horizonte Quindío es un ejercicio de prospectiva territorial. No predice el futuro: lo acuerda. Parte del diagnóstico de capacidades, construye escenarios con la gente del departamento e institucionaliza un observatorio para que la visión sobreviva a los ciclos políticos.",
    parrafoDos:
      "El 24 de marzo de 2026 se presentó en la Universidad del Quindío, con el acompañamiento del ILPES-CEPAL. Es el primer ejercicio de este tipo en el departamento en más de veinte años.",
    etapas: [
      "Diagnóstico y diseño metodológico",
      "Escenarios y visión compartida",
      "Institucionalización y observatorio",
    ],
    entidades: [...ENTITIES, "CEPAL — ILPES (acompañamiento técnico)"],
  },
  elDimensiones: {
    titulo: "Las cuatro dimensiones del territorio",
    intro:
      "Cuatro lecturas del Quindío que articulan el diagnóstico, los escenarios y los acuerdos del Horizonte 2050.",
  },
  cobertura: {
    titulo: "Todo el departamento participa",
    texto: "La visión del 2050 se construye para el Quindío completo, no solo para Armenia.",
  },
  documentos: {
    titulo: "Documentos y publicaciones",
    texto:
      "Acceso público a los documentos del proceso: convenios, informes, memorias, boletines y piezas de socialización. Explora cada categoría del repositorio.",
    botonColor: "lima" as ColorBoton,
  },
  repositorio: {
    titulo: "El inventario documental del territorio",
    // `{total}` lo sustituye el sitio por el número real de documentos del
    // repositorio, para que la cifra no se quede congelada en el Panel.
    texto:
      "Más de {total} documentos de referencia sobre el Quindío: planes, informes, acuerdos, boletines y piezas de socialización, agrupados en las cuatro dimensiones del proceso.",
    dashboardBoton: "Dashboard del repositorio",
    dashboardColor: "lima" as ColorBoton,
    catalogoBoton: "Explorar al catálogo",
  },
  noticias: {
    titulo: "Noticias",
    texto:
      "Comunicados, talleres, convocatorias y avances del ejercicio de prospectiva territorial.",
    botonTexto: "Ver todas",
    botonColor: "lima" as ColorBoton,
    tarjetaBotonColor: "lima" as ColorBoton,
  },
  contacto: {
    titulo: "Contactos",
    texto:
      "Escríbenos para más información sobre el ejercicio de prospectiva, los talleres o las convocatorias abiertas del departamento.",
    formTitulo: "Escríbenos para más información",
    botonColor: "tinta" as ColorBoton,
    enviarColor: "tinta" as ColorBoton,
  },
};

export type Portada = typeof PORTADA;

export type ProjectPage = {
  slug: string;
  title: string;
  kicker: string;
  image: string;
  excerpt: string;
  lead: string;
  body: string[];
};

export const PROJECT_PAGES: ProjectPage[] = [
  {
    slug: "que-es",
    title: "¿Qué es Horizonte Quindío 2050?",
    kicker: "El proyecto",
    image: "/images/card-que-es.jpg",
    excerpt:
      "Un ejercicio colectivo de prospectiva territorial para trazar la visión compartida del departamento.",
    lead: "Horizonte Quindío es el proceso de prospectiva con el que catorce organizaciones del departamento construyen una visión de largo plazo para el territorio.",
    body: [
      "El 24 de marzo de 2026 se presentó oficialmente en el auditorio Euclides Jaramillo Arango de la Universidad del Quindío. El ejercicio responde al convenio específico 012 del 30 de enero de 2026, firmado entre la Universidad del Quindío —en representación de las entidades aliadas— y la Comisión Económica para América Latina y el Caribe (CEPAL), a través del ILPES.",
      "No se trata de predecir el futuro. Se trata de anticiparlo: identificar tendencias, capacidades y riesgos para acordar el futuro deseado y las decisiones que hay que tomar hoy. Es el primer ejercicio de este tipo en el departamento en más de dos décadas.",
      "La marca visual —una Q construida como línea de tiempo— sintetiza el tránsito entre lo que el Quindío ha sido, lo que es y lo que puede llegar a ser. El horizonte de planeación es 2050, con una hoja de ruta que se construye de forma participativa entre 2026 y 2027.",
      "El proceso se desarrolla en el marco de una alianza multiinstitucional de catorce organizaciones, con una estructura de gobernanza que garantiza orientación estratégica, acompañamiento técnico, articulación institucional y participación ampliada.",
    ],
  },
  {
    slug: "contexto",
    title: "Contexto y justificación",
    kicker: "El proyecto",
    image: "/images/card-contexto.jpg",
    excerpt:
      "Tras más de veinte años sin un ejercicio de futuro, el departamento retoma la prospectiva como herramienta de gobierno.",
    lead: "El Quindío ha tenido planes, agendas y documentos de desarrollo. Lo que ha faltado es una visión compartida, de largo aliento, con seguimiento institucional.",
    body: [
      "El departamento cumple seis décadas de vida y hereda aprendizajes de ejercicios como Quindío 2020, el Corpes de Occidente y los estudios de cooperación internacional. Muchos de esos documentos se formularon y no se ejecutaron. Horizonte Quindío nace para no repetir esa historia.",
      "El territorio enfrenta presiones simultáneas: transición del modelo cafetero, turismo en expansión, cambio climático, seguridad hídrica, envejecimiento poblacional, y una economía que necesita más valor agregado. Un plan de desarrollo de cuatro años no alcanza para transformar esas estructuras.",
      "La CEPAL acompaña experiencias similares en Quintana Roo (México), Córdoba (Argentina) y Ceará (Brasil). El Quindío se suma a esa red de territorios que apuestan por la gobernanza anticipatoria: pasar de reaccionar a los problemas a construir escenarios y acuerdos antes de que lleguen.",
      "El proceso se extiende desde el diagnóstico hasta la institucionalización, con una hoja de ruta que se construye de forma participativa y se instala en el territorio.",
    ],
  },
  {
    slug: "objetivo",
    title: "Objetivo",
    kicker: "El proyecto",
    image: "/images/card-objetivo.jpg",
    excerpt:
      "Construir una visión compartida al 2050 e institucionalizar la prospectiva en la toma de decisiones públicas.",
    lead: "El objetivo no es un informe. Es un acuerdo de región y un mecanismo que lo sostenga más allá de los ciclos políticos.",
    body: [
      "Horizonte Quindío persigue tres resultados concretos: un diagnóstico honesto de capacidades y tensiones del territorio; una visión y un conjunto de escenarios de futuro construidos con actores institucionales y sociales; y un modelo de gobernanza anticipatoria con observatorio regional.",
      "El propósito, en palabras de Javier Medina Vásquez, articula dos ideas: anticipar —crear escenarios, leer tendencias y sus consecuencias— y construir el futuro deseado —acordar planes, programas y proyectos para esa visión compartida.",
      "El rector Luis Fernando Polanía Obando lo resume así: no se trata de construir solamente un documento, sino de que trascienda con apropiación previa y seguimiento. Las lecciones de procesos anteriores están sobre la mesa para que esta vez el ejercicio cambie la dinámica de desarrollo regional.",
      "Al cierre, el departamento debería contar con una hoja de ruta al 2050, capacidades locales en prospectiva y un arreglo institucional que vigile la materialización de lo acordado.",
    ],
  },
  {
    slug: "gobernanza",
    title: "Gobernanza",
    kicker: "El proyecto",
    image: "/images/hero-city.jpg",
    excerpt:
      "Catorce organizaciones aliadas conforman el arreglo institucional que sostiene el ejercicio.",
    lead: "La gobernanza de Horizonte Quindío combina un comité técnico interinstitucional, el acompañamiento del ILPES-CEPAL y un diseño pensado para sobrevivir a los cambios de gobierno.",
    body: [
      "La Universidad del Quindío representa a las entidades aliadas ante la CEPAL. El comité técnico reúne a gobierno departamental y municipal, academia, gremios, empresa de servicios y autoridades ambientales.",
      "La alianza está conformada por catorce organizaciones: Universidad del Quindío, Universidad Gran Colombia, Institución Universitaria EAM, SUEJE, Comité de Cafeteros, Comité Intergremial, ProQuindío, Cámara de Comercio del Quindío y Armenia, Facilísimo, Comfanalco, EDEQ, Corporación Autónoma Regional del Quindío, Alcaldía de Armenia y Gobernación del Quindío.",
      "El modelo de gobernanza anticipatoria que se formulará al final del proceso busca que la prospectiva no dependa de una administración. Incluye un observatorio de seguimiento de políticas derivadas y un protocolo de actualización de escenarios.",
      "La participación ciudadana no es un anexo: talleres, convocatorias y canales de recomendación alimentan el diagnóstico y la construcción de la visión.",
    ],
  },
  {
    slug: "principios",
    title: "Principios y valores",
    kicker: "El proyecto",
    image: "/images/cocora.jpg",
    excerpt:
      "Intergeneracionalidad, inclusión, evidencia y sentido de pertenencia territorial.",
    lead: "El ejercicio se sostiene en un conjunto de principios que orientan tanto el método como la conversación pública.",
    body: [
      "Responsabilidad intergeneracional: las decisiones de hoy configuran la vida de quienes habitarán el Quindío en 2050. El lanzamiento incluyó la lectura de una carta de una niña del futuro, precisamente para no olvidar esa deuda.",
      "Inclusión y enfoque de derechos: el proceso convoca a sociedad civil, gremios, academia, administraciones y comunidades rurales. La visión no puede ser solo urbana ni solo sectorial.",
      "Evidencia y honestidad diagnóstica: se parte de lo que el territorio ya sabe —planes de turismo, movilidad, ambiente— para articularlo, no para sustituirlo con un relato nuevo.",
      "Pertenencia territorial: el Quindío se entiende como formación social en evolución, moldeada por su historia cafetera, sus paisajes, sus capacidades y las decisiones que se tomen ahora.",
    ],
  },
  {
    slug: "linea-de-tiempo",
    title: "Línea de tiempo",
    kicker: "El proyecto",
    image: "/images/news-eventos.jpg",
    excerpt:
      "Tres etapas entre 2026 y 2027: diagnóstico, prospectiva e institucionalización.",
    lead: "El calendario del ejercicio está diseñado para pasar del diagnóstico a la acción sin perder el carácter participativo.",
    body: [
      "Etapa 1 — Diagnóstico inicial y diseño metodológico (2026): identificación de tendencias, desafíos y capacidades del territorio. Reuniones del equipo CEPAL con el comité técnico y actores de gobierno, educación y empresa.",
      "Etapa 2 — Ejecución del ejercicio prospectivo: formación especializada con certificación internacional, construcción de escenarios de futuro y acuerdo de una visión compartida —el qué— y de la estrategia para hacerla realidad —el cómo.",
      "Etapa 3 — Institucionalización: incorporación de la prospectiva en la planificación territorial, diseño del observatorio y del modelo de gobernanza anticipatoria.",
      "El 24 de marzo de 2026 quedó como hito de partida. El trabajo de campo, los talleres y las convocatorias se despliegan a lo largo de los diez meses siguientes.",
    ],
  },
];

export type ChartSeries = {
  name: string;
  color: string;
  data: { year: string; value: number }[];
};

export type Dimension = {
  slug: string;
  title: string;
  short: string;
  /**
   * 'dimension' = una de las 4 dimensiones de análisis del proyecto.
   * 'bloque'    = contenido de apoyo (misiones, retos, iniciativas, hallazgos).
   * El backend lo manda; si no viene se asume 'dimension'.
   */
  tipo: "dimension" | "bloque";
  icon: "target" | "chart" | "leaf" | "users" | "trophy" | "alert" | "folder" | "file";
  summary: string;
  body: string[];
  charts: ChartSeries[];
  layers: string[];
  steps: { n: string; title: string }[];
  /**
   * Rótulos que encabezan las listas `steps` y `layers`. Cada fila nombra las
   * suyas: en las 4 dimensiones son «Retos principales» / «Líneas de trabajo»,
   * pero en los bloques de apoyo no (en «Misiones» los steps son las misiones).
   * Si vienen vacíos, el sitio usa esos dos por defecto.
   */
  stepsLabel: string;
  layersLabel: string;
};

export const DIMENSIONS: Dimension[] = [
  {
    slug: "politico-institucional",
    title: "Dimensión político-institucional",
    short: "Político-institucional",
    tipo: "dimension",
    icon: "target",
    summary: "Gobernanza territorial, institucionalidad pública y privada, planeación, participación ciudadana y seguridad pública.",
    stepsLabel: "Retos principales",
    layersLabel: "Líneas de trabajo",
    body: ["Este eje analiza la gobernanza territorial, la institucionalidad pública y privada, la planeación, la participación ciudadana, la seguridad pública y la capacidad de coordinación entre organizaciones.", "El proyecto busca fortalecer la articulación institucional entre niveles de gobierno y actores del territorio, mejorar la capacidad de planeación pública y seguimiento a largo plazo, promover una gobernanza más abierta, coordinada y participativa, e integrar la vigilancia tecnológica y el análisis de tendencias en la toma de decisiones."],
    layers: ["Gobernanza territorial y ejercicio político", "Institucionalidad pública y gremial", "Planeación y gestión territorial", "Participación ciudadana y control social", "Seguridad pública y gobernabilidad"],
    steps: [
  {
    n: "01",
    title: "Articular los niveles de gobierno"
  },
  {
    n: "02",
    title: "Mejorar la planeación pública"
  },
  {
    n: "03",
    title: "Abrir la gobernanza a la participación"
  },
  {
    n: "04",
    title: "Integrar vigilancia tecnológica"
  }
],
    charts: []
  },
  {
    slug: "economica-productiva",
    title: "Dimensión económico-productiva",
    short: "Económico-productiva",
    tipo: "dimension",
    icon: "chart",
    summary: "Caficultura, turismo, agroindustria, nuevas economías, emprendimiento, innovación y transición productiva.",
    stepsLabel: "Retos principales",
    layersLabel: "Líneas de trabajo",
    body: ["Este eje examina la estructura económica del Quindío, con énfasis en caficultura, turismo, agroindustria, nuevas economías, emprendimiento, innovación, transición productiva y transformación digital.", "Los retos principales son diversificar y fortalecer la base productiva del departamento, potenciar cadenas de valor con mayor innovación y competitividad, anticipar los efectos de la automatización, la inteligencia artificial y la transición energética, y consolidar apuestas productivas estratégicas con visión de largo plazo."],
    layers: ["Caficultura y agroindustria", "Turismo y economía creativa", "Bioeconomía y economía del cuidado", "Inteligencia artificial y transformación digital productiva", "Emprendimiento, innovación y economía circular"],
    steps: [
  {
    n: "01",
    title: "Diversificar la base productiva"
  },
  {
    n: "02",
    title: "Potenciar cadenas de valor"
  },
  {
    n: "03",
    title: "Anticipar automatización y transición energética"
  },
  {
    n: "04",
    title: "Consolidar apuestas estratégicas"
  }
],
    charts: []
  },
  {
    slug: "fisico-ambiental",
    title: "Dimensión físico-ambiental",
    short: "Físico-ambiental",
    tipo: "dimension",
    icon: "leaf",
    summary: "Sistema físico-biótico, cambio climático, recursos hídricos, biodiversidad, gestión del riesgo y sostenibilidad.",
    stepsLabel: "Retos principales",
    layersLabel: "Líneas de trabajo",
    body: ["Este eje aborda el sistema físico-biótico del departamento, el cambio climático, los recursos hídricos, la biodiversidad, la gestión del riesgo, el ordenamiento territorial, la movilidad, la infraestructura y la sostenibilidad ambiental.", "Los retos principales son proteger y regenerar los ecosistemas estratégicos, reducir vulnerabilidades frente al cambio climático y el riesgo, articular el desarrollo urbano, la infraestructura y el ordenamiento territorial, e integrar herramientas SIG y análisis espacial para mejorar la lectura territorial."],
    layers: ["Cambio climático y adaptación territorial", "Biodiversidad y sostenibilidad ecosistémica", "Recursos hídricos y gestión ambiental", "Ordenamiento territorial y desarrollo urbano", "Infraestructura, vivienda, servicios públicos y gestión del riesgo"],
    steps: [
  {
    n: "01",
    title: "Proteger los ecosistemas estratégicos"
  },
  {
    n: "02",
    title: "Reducir la vulnerabilidad al clima y al riesgo"
  },
  {
    n: "03",
    title: "Articular desarrollo urbano e infraestructura"
  },
  {
    n: "04",
    title: "Integrar SIG y análisis espacial"
  }
],
    charts: []
  },
  {
    slug: "socio-cultural",
    title: "Dimensión socio-cultural",
    short: "Socio-cultural",
    tipo: "dimension",
    icon: "users",
    summary: "Estructura social, calidad de vida, educación, salud, equidad, identidades territoriales, juventud y cohesión social.",
    stepsLabel: "Retos principales",
    layersLabel: "Líneas de trabajo",
    body: ["Este eje analiza la estructura social del Quindío, la calidad de vida, la educación, la salud, la equidad, las identidades territoriales, la juventud, la diversidad y la cohesión social.", "Los retos principales son mejorar el bienestar, la inclusión y la calidad de vida; reconocer la diversidad social, cultural y generacional del territorio; fortalecer la participación de comunidades y grupos poblacionales diversos; e incorporar las voces del territorio en la construcción de futuro."],
    layers: ["Salud y calidad de vida", "Educación y comunidad educativa", "Demografía e inclusión social", "Género, diversidad e identidades", "Juventud, cultura, historia, artes, deporte y convivencia"],
    steps: [
  {
    n: "01",
    title: "Mejorar el bienestar y la inclusión"
  },
  {
    n: "02",
    title: "Reconocer la diversidad del territorio"
  },
  {
    n: "03",
    title: "Fortalecer la participación de las comunidades"
  },
  {
    n: "04",
    title: "Incorporar las voces del territorio"
  }
],
    charts: []
  },
  {
    slug: "misiones",
    title: "Misiones del proceso",
    short: "Misiones",
    tipo: "bloque",
    icon: "trophy",
    summary: "Las cinco misiones que articulan el desarrollo del estudio prospectivo.",
    stepsLabel: "Misiones",
    layersLabel: "Líneas de trabajo",
    body: ["Las misiones son los instrumentos de trabajo del proceso. Cada una agrupa un conjunto de actividades que se ejecutan de manera articulada y que, en conjunto, llevan desde el diagnóstico hasta la capacidad instalada en el territorio."],
    layers: ["Misión de diagnóstico", "Misión de visión", "Misión de escenarios", "Misión estratégica", "Misión de institucionalización"],
    steps: [
  {
    n: "01",
    title: "Diagnóstico: comprender el presente con rigor técnico y territorial"
  },
  {
    n: "02",
    title: "Visión: construir una aspiración compartida de futuro al 2050"
  },
  {
    n: "03",
    title: "Escenarios: explorar futuros posibles y sus implicaciones"
  },
  {
    n: "04",
    title: "Estratégica: convertir la visión en prioridades, acciones y hoja de ruta"
  },
  {
    n: "05",
    title: "Institucionalización: dejar capacidad instalada para que el proceso continúe"
  }
],
    charts: []
  },
  {
    slug: "retos",
    title: "Retos transversales",
    short: "Retos",
    tipo: "bloque",
    icon: "alert",
    summary: "Condiciones comunes que el proceso debe atender en todas sus dimensiones.",
    stepsLabel: "Retos transversales",
    layersLabel: "Condiciones comunes",
    body: ["Los retos transversales atraviesan las cuatro dimensiones y condicionan el éxito de todo el estudio. No pertenecen a un eje en particular: son condiciones que el proceso debe resolver de manera transversal."],
    layers: ["Participación amplia, representativa y continua", "Traducir el lenguaje técnico a mensajes claros", "Mantener memoria, trazabilidad y acceso a la información", "Asegurar continuidad institucional más allá del convenio", "Hacer del sitio una herramienta viva de comunicación"],
    steps: [
  {
    n: "01",
    title: "Garantizar participación amplia y representativa"
  },
  {
    n: "02",
    title: "Traducir el lenguaje técnico a la ciudadanía"
  },
  {
    n: "03",
    title: "Mantener memoria y trazabilidad"
  },
  {
    n: "04",
    title: "Asegurar continuidad institucional"
  },
  {
    n: "05",
    title: "Sostener el sitio como herramienta viva"
  }
],
    charts: []
  },
  {
    slug: "iniciativas",
    title: "Iniciativas y fichas por dimensión",
    short: "Iniciativas",
    tipo: "bloque",
    icon: "folder",
    summary: "Espacio para registrar las iniciativas y fichas que se construyan sobre cada eje del proyecto.",
    stepsLabel: "Ciclo de la iniciativa",
    layersLabel: "Frentes de trabajo",
    body: ["Este bloque reúne las iniciativas y fichas que el equipo técnico elabore a partir del trabajo de cada dimensión. Se alimenta a medida que avancen los productos del estudio."],
    layers: [],
    steps: [],
    charts: []
  },
  {
    slug: "hallazgos",
    title: "Hallazgos y tendencias",
    short: "Hallazgos",
    tipo: "bloque",
    icon: "file",
    summary: "Espacio para consolidar los hallazgos, señales débiles y tendencias que surjan del diagnóstico.",
    stepsLabel: "Ruta del análisis",
    layersLabel: "Escalas",
    body: ["Este bloque consolida los hallazgos del diagnóstico: tendencias globales, nacionales y locales, señales débiles e incertidumbres críticas identificadas para el departamento."],
    layers: [],
    steps: [],
    charts: []
  },
];


export type DocCategory = {
  slug: string;
  title: string;
  description: string;
  icon: "file" | "chart" | "scroll" | "news" | "presentation" | "book";
};

export const DOC_CATEGORIES: DocCategory[] = [
  {
    slug: "proyecto",
    title: "Documentos del proyecto",
    description: "Convenio, marco metodológico y piezas fundacionales del ejercicio.",
    icon: "file",
  },
  {
    slug: "informes",
    title: "Informes y resultados",
    description: "Avances de cada etapa, hallazgos y reportes técnicos.",
    icon: "chart",
  },
  {
    slug: "memorias",
    title: "Memorias y actas",
    description: "Registro de talleres, comités y sesiones de trabajo.",
    icon: "scroll",
  },
  {
    slug: "boletines",
    title: "Boletines",
    description: "Síntesis periódica para la ciudadanía y las entidades aliadas.",
    icon: "news",
  },
  {
    slug: "presentaciones",
    title: "Presentaciones",
    description: "Material de socialización usado en el lanzamiento y los talleres.",
    icon: "presentation",
  },
  {
    slug: "publicaciones",
    title: "Publicaciones y artículos",
    description: "Ensayos, notas de prensa y piezas de análisis.",
    icon: "book",
  },
];

export const WORKSHOPS = [
  {
    date: "24 mar 2026",
    title: "Lanzamiento institucional",
    place: "Universidad del Quindío",
    status: "Realizado",
  },
  {
    date: "8 may 2026",
    title: "Taller gremios y empresa",
    place: "Cámara de Comercio",
    status: "Realizado",
  },
  {
    date: "19 jun 2026",
    title: "Laboratorio de escenarios — jóvenes",
    place: "Armenia",
    status: "Abierto",
  },
  {
    date: "3 jul 2026",
    title: "Mesa ambiental y de paisaje",
    place: "CRQ",
    status: "Próximo",
  },
  {
    date: "21 ago 2026",
    title: "Visión compartida — plenaria",
    place: "Gobernación del Quindío",
    status: "Próximo",
  },
];

export const FOOTER_COLS = [
  {
    // La columna del mapa del sitio: reprodujo el menú del encabezado y no se
    // elige desde el panel —es el temario del sitio entero—. Los ocho enlaces
    // (Inicio incluido) son fijos y salen del código, igual que las dimensiones.
    title: "Mapa del sitio",
    links: [
      { label: "Inicio", href: "/" },
      { label: "El proyecto", href: "/proyecto" },
      { label: "Dimensiones", href: "/dimensiones" },
      { label: "Documentos", href: "/documentos" },
      { label: "Repositorio", href: "/repositorio" },
      { label: "Noticias", href: "/noticias" },
      { label: "Participa", href: "/participa" },
      { label: "Contáctanos", href: "/contactos" },
    ],
  },
  {
    title: "",
    links: [
      { label: "Qué es Horizonte Quindío 2050", href: "/proyecto/que-es" },
      { label: "Contexto y justificación", href: "/proyecto/contexto" },
      { label: "Objetivo", href: "/proyecto/objetivo" },
      { label: "Gobernanza", href: "/proyecto/gobernanza" },
      { label: "Principios y valores", href: "/proyecto/principios" },
      { label: "Línea de tiempo", href: "/proyecto/linea-de-tiempo" },
    ],
  },
  {
    title: "",
    links: [
      { label: "Dimensión político-institucional", href: "/dimensiones/politico-institucional" },
      { label: "Dimensión económica-productiva", href: "/dimensiones/economica-productiva" },
      { label: "Dimensión físico-ambiental", href: "/dimensiones/fisico-ambiental" },
      { label: "Dimensión socio-cultural", href: "/dimensiones/socio-cultural" },
      { label: "Misiones del proceso", href: "/dimensiones/misiones" },
      { label: "Retos transversales", href: "/dimensiones/retos" },
      { label: "Iniciativas y fichas", href: "/dimensiones/iniciativas" },
      { label: "Hallazgos y tendencias", href: "/dimensiones/hallazgos" },
    ],
  },
];

/**
 * La columna del pie que sí se elige desde el panel: las tarjetas de «El
 * proyecto».
 *
 * Las otras dos columnas son fijas y salen de `FOOTER_COLS`: son el temario
 * del sitio entero (el mapa de páginas y las dimensiones), no contenido que
 * cambie según quien administre. Esta, en cambio, se edita en **Ajustes →
 * Footer** y vive en `home.footer.enlaces`; lo que hay aquí es solo su
 * respaldo —lo que se ve si nunca se ha guardado nada—, igual que `NAV` frente
 * a los enlaces del menú.
 *
 * El respaldo es además lo que siembra el backend en una base nueva, así que
 * si cambia aquí, hay que cambiarlo también en `backend/src/seed-data.ts`.
 */
export const FOOTER_PROYECTO_FALLBACK = FOOTER_COLS[1].links;

/**
 * El texto de la barra inferior del pie de página.
 *
 * Es lo que se ve a la izquierda del copyright, con los enlaces legales a la
 * derecha: «Horizonte Quindío 2050 — Todos los derechos reservados». Se edita
 * en **Ajustes → Footer** y vive en `home.footer.copyright`. Lo que hay aquí es
 * solo su respaldo —lo que se ve si nunca se ha guardado nada o si el campo se
 * dejó vacío—.
 *
 * El respaldo es además lo que siembra el backend en una base nueva, así que si
 * cambia aquí, hay que cambiarlo también en `backend/src/seed-data.ts`.
 */
export const FOOTER_COPYRIGHT = "Horizonte Quindío 2050 — Todos los derechos reservados";

export function getProject(slug: string) {
  return PROJECT_PAGES.find((p) => p.slug === slug);
}
export function getDimension(slug: string) {
  return DIMENSIONS.find((d) => d.slug === slug);
}

export type SearchHit = {
  href: string;
  title: string;
  kind: string;
  excerpt: string;
};

export function searchSite(query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const hits: SearchHit[] = [];
  for (const p of PROJECT_PAGES) {
    if (`${p.title} ${p.excerpt} ${p.lead}`.toLowerCase().includes(q)) {
      hits.push({ href: `/proyecto/${p.slug}`, title: p.title, kind: "Proyecto", excerpt: p.excerpt });
    }
  }
  for (const d of DIMENSIONS) {
    if (`${d.title} ${d.summary}`.toLowerCase().includes(q)) {
      hits.push({ href: `/dimensiones/${d.slug}`, title: d.title, kind: "Dimensión", excerpt: d.summary });
    }
  }
  for (const cat of DOC_CATEGORIES) {
    if (`${cat.title} ${cat.description}`.toLowerCase().includes(q)) {
      hits.push({
        href: `/documentos/${cat.slug}`,
        title: cat.title,
        kind: "Documentos",
        excerpt: cat.description,
      });
    }
  }
  for (const w of WORKSHOPS) {
    if (`${w.title} ${w.place}`.toLowerCase().includes(q)) {
      hits.push({ href: "/participa", title: w.title, kind: "Taller", excerpt: `${w.date} · ${w.place}` });
    }
  }
  return hits.slice(0, 12);
}
