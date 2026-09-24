export type SeedNoticia = {
  slug: string;
  titulo: string;
  categoria: string;
  fecha: string;
  imagen: string;
  resumen: string;
  contenido: string[];
  etiquetas: string[];
  publicado: boolean;
  destacado: boolean;
};

export type SeedDocumento = {
  titulo: string;
  autor: string;
  fecha: string;
  tipo: string;
  delimitacion: string;
  formato: string;
  link: string;
};

export type SeedConvocatoria = {
  titulo: string;
  fecha: string;
  descripcion: string;
  enlace: string;
  activa: boolean;
};

export type SeedSite = {
  nombre: string;
  tagline: string;
  headline: string[];
  email: string;
  telefono: string;
  telefonoHref: string;
  direccion: string;
  ciudad: string;
  facebook: string;
  instagram: string;
  x: string;
};

export type SeedStat = { value: string; label: string; subtext: string };
export type SeedEntidad = { nombre: string };
export type SeedTaller = { date: string; title: string; place: string; status: string };
export type SeedDocCategoria = { slug: string; title: string; description: string; icon: string };

export type SeedPaginaProyecto = {
  slug: string;
  title: string;
  kicker: string;
  image: string;
  excerpt: string;
  lead: string;
  body: string[];
};

export type SeedDimension = {
  slug: string;
  title: string;
  short: string;
  icon: string;
  summary: string;
  body: string[];
  layers: string[];
  steps: { n: string; title: string }[];
  charts: { name: string; color: string; data: { year: string; value: number }[] }[];
};

export type SeedMensaje = {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
  tipo: string;
  fecha: string;
  leido: boolean;
};

export const SEED_NOTICIAS: SeedNoticia[] = [
  {
    slug: "lanzamiento-oficial-horizonte-quindio-2050",
    titulo: "Lanzamiento oficial del proyecto Horizonte Quindío 2050",
    categoria: "Noticias y Comunicados",
    fecha: "2026-03-24",
    imagen: "/images/news-ciudad.jpg",
    resumen:
      "Once entidades públicas, privadas y académicas junto a la CEPAL presentaron en la Universidad del Quindío el ejercicio de prospectiva territorial.",
    contenido: [
      "El 24 de marzo de 2026 se presentó oficialmente en el auditorio Euclides Jaramillo Arango de la Universidad del Quindío el ejercicio de prospectiva territorial Horizonte Quindío 2050.",
      "El convenio específico 012 de 2026 une a las once principales instituciones del departamento para construir de forma participativa la hoja de ruta estratégica hacia el año 2050.",
      "El evento contó con la participación de autoridades gubernamentales, rectores universitarios, líderes gremiales y representantes de la CEPAL-ILPES.",
    ],
    etiquetas: ["lanzamiento", "convenio", "CEPAL"],
    publicado: true,
    destacado: true,
  },
  {
    slug: "taller-gremios-y-sector-empresarial",
    titulo: "Taller estratégico con gremios y sector empresarial del Quindío",
    categoria: "Talleres y Eventos",
    fecha: "2026-05-08",
    imagen: "/images/news-eventos.jpg",
    resumen:
      "Empresarios, emprendedores y dirigentes gremiales definieron los principales retos de competitividad e innovación para el departamento.",
    contenido: [
      "En la sede de la Cámara de Comercio de Armenia y del Quindío se llevó a cabo el primer taller enfocado en el desarrollo económico y la sofisticación productiva.",
      "Los participantes analizaron el impacto de la transición del modelo cafetero, el turismo sostenible, las industrias creativas y las oportunidades de exportación.",
    ],
    etiquetas: ["gremios", "empresa", "competitividad"],
    publicado: true,
    destacado: false,
  },
  {
    slug: "convocatoria-laboratorio-escenarios-jovenes",
    titulo: "Convocatoria abierta: Laboratorio de escenarios para jóvenes del Quindío",
    categoria: "Convocatorias Abiertas",
    fecha: "2026-06-19",
    imagen: "/images/news-convocatoria.jpg",
    resumen:
      "Se abren inscripciones para que jóvenes líderes de los 12 municipios participen en la construcción de escenarios futuros.",
    contenido: [
      "Horizonte Quindío convoca a estudiantes universitarios, líderes juveniles y emprendedores a sumarse al Laboratorio de Escenarios Futuros.",
      "Las jornadas contarán con metodologías participativas y formación en herramientas de prospección territorial.",
    ],
    etiquetas: ["jóvenes", "inscripciones", "laboratorio"],
    publicado: true,
    destacado: false,
  },
  {
    slug: "mesa-tecnica-ambiental-y-paisaje-cultural",
    titulo: "Mesa técnica ambiental: Agua, biodiversidad y Paisaje Cultural Cafetero",
    categoria: "Talleres y Eventos",
    fecha: "2026-07-03",
    imagen: "/images/news-paisaje.jpg",
    resumen:
      "Expertos ambientales y la CRQ instalaron la mesa de trabajo sobre seguridad hídrica y conservación de ecosistemas estratégicos.",
    contenido: [
      "La Corporación Autónoma Regional del Quindío lideró la sesión técnica para evaluar el estado de las cuencas hidrográficas y la preservación del suelo.",
    ],
    etiquetas: ["ambiental", "agua", "CRQ"],
    publicado: true,
    destacado: false,
  },
  {
    slug: "acuerdo-red-gobernanza-cepal",
    titulo: "El Quindío se suma a la red regional de gobernanza anticipatoria de la CEPAL",
    categoria: "Noticias y Comunicados",
    fecha: "2026-08-21",
    imagen: "/images/hero-city.jpg",
    resumen:
      "El departamento se integra a la red de territorios pioneros en planificación de largo aliento en América Latina.",
    contenido: [
      "Junto a experiencias en México, Argentina y Brasil, el Quindío adopta estándares internacionales para institucionalizar el seguimiento de la visión 2050.",
    ],
    etiquetas: ["CEPAL", "gobernanza", "red"],
    publicado: true,
    destacado: false,
  },
];

export const SEED_DOCUMENTOS: SeedDocumento[] = [
  {
    titulo: "Convenio específico 012 de 2026",
    autor: "Universidad del Quindío · CEPAL-ILPES",
    fecha: "2026-01-30",
    tipo: "proyecto",
    delimitacion: "Departamental",
    formato: "PDF",
    link: "",
  },
  {
    titulo: "Marco metodológico — Prospectiva territorial 2050",
    autor: "Equipo técnico Horizonte Quindío",
    fecha: "2026-02-20",
    tipo: "proyecto",
    delimitacion: "Departamental",
    formato: "PDF",
    link: "",
  },
  {
    titulo: "Diagnóstico inicial — lectura de tendencias",
    autor: "Comité técnico interinstitucional",
    fecha: "2026-05-30",
    tipo: "informes",
    delimitacion: "Departamental",
    formato: "PDF",
    link: "",
  },
  {
    titulo: "Memoria — Lanzamiento institucional 24 de marzo",
    autor: "Secretaría técnica",
    fecha: "2026-04-10",
    tipo: "memorias",
    delimitacion: "Departamental",
    formato: "PDF",
    link: "",
  },
  {
    titulo: "Boletín #1 — Convocatoria laboratorio de jóvenes",
    autor: "Equipo de comunicaciones",
    fecha: "2026-06-15",
    tipo: "boletines",
    delimitacion: "Departamental",
    formato: "PDF",
    link: "",
  },
  {
    titulo: "Presentación — Lanzamiento y gobernanza",
    autor: "Juan Esteban Gil Chavarría",
    fecha: "2026-03-24",
    tipo: "presentaciones",
    delimitacion: "Departamental",
    formato: "PPTX",
    link: "",
  },
  {
    titulo: "Artículo — Prospectiva y gobernanza anticipatoria en territorios",
    autor: "Javier Medina Vásquez",
    fecha: "2026-07-01",
    tipo: "publicaciones",
    delimitacion: "Departamental",
    formato: "PDF",
    link: "",
  },
];

export const SEED_CONVOCATORIAS: SeedConvocatoria[] = [
  {
    titulo: "Laboratorio de escenarios para jóvenes del Quindío",
    fecha: "2026-06-19",
    descripcion:
      "Inscripciones abiertas para que jóvenes líderes de los 12 municipios participen en la construcción de escenarios futuros del departamento.",
    enlace: "https://forms.example.com/laboratorio-jovenes",
    activa: true,
  },
  {
    titulo: "Mesa ambiental y del paisaje — convocatoria a expertos",
    fecha: "2026-07-03",
    descripcion:
      "Convocatoria a profesionales ambientales para la mesa técnica sobre seguridad hídrica y Paisaje Cultural Cafetero.",
    enlace: "",
    activa: false,
  },
];

export const SEED_SITE: SeedSite = {
  nombre: "Horizonte Quindío",
  tagline: "Prospectiva territorial hacia 2050",
  headline: ["Proyectamos el futuro", "De la región uniendo", "El esfuerzo del", "talento local."],
  email: "contacto@horizontequindio.com",
  telefono: "+57 310 565 6351",
  telefonoHref: "tel:+573105656351",
  direccion: "Calle 24 # 12 - 34",
  ciudad: "Armenia, Quindío, Colombia",
  facebook: "https://www.facebook.com/",
  instagram: "https://www.instagram.com/",
  x: "https://x.com/",
};

export const SEED_STATS: SeedStat[] = [
  { value: "11", label: "Entidades Aliadas", subtext: "Públicas, privadas y academia" },
  { value: "2050", label: "Visión de Futuro", subtext: "Horizonte temporal de región" },
  {
    value: "3",
    label: "Etapas de Prospectiva",
    subtext: "Diagnóstico, escenarios e institucionalización",
  },
  { value: "60", label: "Años del Departamento", subtext: "Gobernanza y pertenencia territorial" },
];

export const SEED_ENTIDADES: SeedEntidad[] = [
  { nombre: "Gobernación del Quindío" },
  { nombre: "Alcaldía de Armenia" },
  { nombre: "Universidad del Quindío" },
  { nombre: "Universidad La Gran Colombia" },
  { nombre: "Cámara de Comercio de Armenia y del Quindío" },
  { nombre: "Comité de Cafeteros del Quindío" },
  { nombre: "Comité Intergremial del Quindío" },
  { nombre: "Corporación Autónoma Regional del Quindío" },
  { nombre: "ProQuindío" },
  { nombre: "Comfenalco Quindío" },
  { nombre: "Facilísimo" },
  { nombre: "Empresa de Energía del Quindío" },
];

export const SEED_TALLERES: SeedTaller[] = [
  { date: "2026-03-24", title: "Lanzamiento institucional", place: "Universidad del Quindío", status: "Realizado" },
  { date: "2026-05-08", title: "Taller gremios y empresa", place: "Cámara de Comercio", status: "Realizado" },
  { date: "2026-06-19", title: "Laboratorio de escenarios — jóvenes", place: "Armenia", status: "Abierto" },
  { date: "2026-07-03", title: "Mesa ambiental y de paisaje", place: "CRQ", status: "Próximo" },
  { date: "2026-08-21", title: "Visión compartida — plenaria", place: "Gobernación del Quindío", status: "Próximo" },
];

export const SEED_CATEGORIAS: SeedDocCategoria[] = [
  { slug: "proyecto", title: "Documentos del proyecto", description: "Convenio, marco metodológico y piezas fundacionales del ejercicio.", icon: "file" },
  { slug: "informes", title: "Informes y resultados", description: "Avances de cada etapa, hallazgos y reportes técnicos.", icon: "chart" },
  { slug: "memorias", title: "Memorias y actas", description: "Registro de talleres, comités y sesiones de trabajo.", icon: "scroll" },
  { slug: "boletines", title: "Boletines", description: "Síntesis periódica para la ciudadanía y las entidades aliadas.", icon: "news" },
  { slug: "presentaciones", title: "Presentaciones", description: "Material de socialización usado en el lanzamiento y los talleres.", icon: "presentation" },
  { slug: "publicaciones", title: "Publicaciones y artículos", description: "Ensayos, notas de prensa y piezas de análisis.", icon: "book" },
];

export const SEED_PROYECTO_PAGINAS: SeedPaginaProyecto[] = [
  {
    slug: "que-es",
    title: "¿Qué es Horizonte Quindío 2050?",
    kicker: "El proyecto",
    image: "/images/card-que-es.jpg",
    excerpt:
      "Un ejercicio colectivo de prospectiva territorial para trazar la visión compartida del departamento.",
    lead: "Horizonte Quindío es el proceso de prospectiva con el que once instituciones del departamento, junto a la CEPAL, construyen una visión de largo plazo para el territorio.",
    body: [
      "El 24 de marzo de 2026 se presentó oficialmente en el auditorio Euclides Jaramillo Arango de la Universidad del Quindío. El ejercicio responde al convenio específico 012 del 30 de enero de 2026.",
      "No se trata de predecir el futuro. Se trata de anticiparlo: identificar tendencias, capacidades y riesgos para acordar el futuro deseado y las decisiones que hay que tomar hoy.",
      "La marca visual —una Q construida como línea de tiempo— sintetiza el tránsito entre lo que el Quindío ha sido, lo que es y lo que puede llegar a ser.",
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
      "El departamento cumple seis décadas de vida y hereda aprendizajes de ejercicios como Quindío 2020, el Corpes de Occidente y los estudios de cooperación internacional.",
      "El territorio enfrenta presiones simultáneas: transición del modelo cafetero, turismo en expansión, cambio climático, seguridad hídrica y una economía que necesita más valor agregado.",
      "La CEPAL acompaña experiencias similares en Quintana Roo (México), Córdoba (Argentina) y Ceará (Brasil).",
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
      "Horizonte Quindío persigue tres resultados concretos: un diagnóstico honesto; una visión y escenarios construidos con actores; y un modelo de gobernanza anticipatoria con observatorio regional.",
      "Al cierre, el departamento debería contar con una hoja de ruta al 2050, capacidades locales en prospectiva y un arreglo institucional que vigile la materialización de lo acordado.",
    ],
  },
  {
    slug: "gobernanza",
    title: "Gobernanza",
    kicker: "El proyecto",
    image: "/images/hero-city.jpg",
    excerpt: "Once entidades y la CEPAL conforman el arreglo institucional que sostiene el ejercicio.",
    lead: "La gobernanza de Horizonte Quindío combina un comité técnico interinstitucional, el acompañamiento del ILPES-CEPAL y un diseño pensado para sobrevivir a los cambios de gobierno.",
    body: [
      "La Universidad del Quindío representa a las entidades aliadas ante la CEPAL.",
      "El modelo de gobernanza anticipatoria que se formulará al final del proceso busca que la prospectiva no dependa de una administración.",
      "La participación ciudadana no es un anexo: talleres, convocatorias y canales de recomendación alimentan el diagnóstico y la construcción de la visión.",
    ],
  },
  {
    slug: "principios",
    title: "Principios y valores",
    kicker: "El proyecto",
    image: "/images/cocora.jpg",
    excerpt: "Intergeneracionalidad, inclusión, evidencia y sentido de pertenencia territorial.",
    lead: "El ejercicio se sostiene en un conjunto de principios que orientan tanto el método como la conversación pública.",
    body: [
      "Responsabilidad intergeneracional: las decisiones de hoy configuran la vida de quienes habitarán el Quindío en 2050.",
      "Inclusión y enfoque de derechos: el proceso convoca a sociedad civil, gremios, academia, administraciones y comunidades rurales.",
      "Evidencia y honestidad diagnóstica: se parte de lo que el territorio ya sabe para articularlo, no para sustituirlo.",
    ],
  },
  {
    slug: "linea-de-tiempo",
    title: "Línea de tiempo",
    kicker: "El proyecto",
    image: "/images/news-eventos.jpg",
    excerpt: "Tres etapas entre 2026 y 2027: diagnóstico, prospectiva e institucionalización.",
    lead: "El calendario del ejercicio está diseñado para pasar del diagnóstico a la acción sin perder el carácter participativo.",
    body: [
      "Etapa 1 — Diagnóstico inicial y diseño metodológico (2026).",
      "Etapa 2 — Ejecución del ejercicio prospectivo: formación especializada, escenarios y visión compartida.",
      "Etapa 3 — Institucionalización: observatorio y modelo de gobernanza anticipatoria.",
    ],
  },
];

export const SEED_DIMENSIONES: SeedDimension[] = [
  {
    slug: "politico-institucional",
    title: "Dimensión político - Institucional",
    short: "Dimensión político Institucional",
    icon: "target",
    summary:
      "Capacidades de gobierno, articulación entre entidades y reglas que hacen posible una visión de largo plazo.",
    body: [
      "Esta dimensión observa la calidad de las instituciones públicas, la coordinación multinivel y la capacidad de sostener acuerdos más allá de un periodo de gobierno.",
      "Incluye el diseño del observatorio de prospectiva, la formación de servidores y la incorporación de escenarios en los planes de desarrollo.",
    ],
    layers: ["Normas y competencias", "Arreglos de coordinación", "Cultura de lo público"],
    steps: [
      { n: "01", title: "Mapeo" },
      { n: "02", title: "Diagnóstico" },
      { n: "03", title: "Actores" },
      { n: "04", title: "Escenarios" },
      { n: "05", title: "Acuerdos" },
      { n: "06", title: "Observatorio" },
    ],
    charts: [
      {
        name: "Confianza institucional",
        color: "#0b3336",
        data: [
          { year: "2018", value: 42 },
          { year: "2020", value: 48 },
          { year: "2022", value: 44 },
          { year: "2024", value: 51 },
          { year: "2026", value: 57 },
        ],
      },
      {
        name: "Articulación interinstitucional",
        color: "#8fcb32",
        data: [
          { year: "2018", value: 28 },
          { year: "2020", value: 33 },
          { year: "2022", value: 41 },
          { year: "2024", value: 49 },
          { year: "2026", value: 62 },
        ],
      },
    ],
  },
  {
    slug: "economica-productiva",
    title: "Dimensión económica - Productiva",
    short: "Dimensión económica Productiva",
    icon: "chart",
    summary:
      "Café, turismo, industria ligera y nuevas apuestas de valor: cómo se gana la vida el departamento hacia 2050.",
    body: [
      "El Quindío necesita un modelo productivo que no dependa de un solo cultivo ni de un turismo de temporada.",
      "Se analizan la agroindustria, el Paisaje Cultural Cafetero como activo económico, la energía, los servicios y el talento joven.",
    ],
    layers: ["Base cafetera", "Servicios y turismo", "Nueva industria"],
    steps: [
      { n: "01", title: "Cadenas" },
      { n: "02", title: "Brechas" },
      { n: "03", title: "Talento" },
      { n: "04", title: "Escenarios" },
      { n: "05", title: "Apuestas" },
      { n: "06", title: "Inversión" },
    ],
    charts: [
      {
        name: "Valor agregado no cafetero",
        color: "#0b3336",
        data: [
          { year: "2018", value: 31 },
          { year: "2020", value: 29 },
          { year: "2022", value: 36 },
          { year: "2024", value: 44 },
          { year: "2026", value: 53 },
        ],
      },
      {
        name: "Empleo formal",
        color: "#8fcb32",
        data: [
          { year: "2018", value: 38 },
          { year: "2020", value: 34 },
          { year: "2022", value: 40 },
          { year: "2024", value: 46 },
          { year: "2026", value: 52 },
        ],
      },
    ],
  },
  {
    slug: "fisico-ambiental",
    title: "Dimensión físico - Ambiental",
    short: "Dimensión Físico - Ambiental",
    icon: "leaf",
    summary:
      "Agua, biodiversidad, paisaje cafetero y ocupación del suelo en un departamento de montaña.",
    body: [
      "El Quindío es un territorio pequeño y biodiverso. La presión urbana, el turismo y el cambio climático obligan a decidir cómo se ocupa el suelo y cómo se protege el agua.",
      "Esta dimensión cruza la autoridad ambiental, el ordenamiento territorial y las infraestructuras que el departamento necesita sin romper el paisaje.",
    ],
    layers: ["Ecosistemas", "Ocupación del suelo", "Infraestructura verde"],
    steps: [
      { n: "01", title: "Inventario" },
      { n: "02", title: "Riesgos" },
      { n: "03", title: "Agua" },
      { n: "04", title: "Suelo" },
      { n: "05", title: "Paisaje" },
      { n: "06", title: "Norma" },
    ],
    charts: [
      {
        name: "Cobertura boscosa",
        color: "#0b3336",
        data: [
          { year: "2018", value: 58 },
          { year: "2020", value: 57 },
          { year: "2022", value: 59 },
          { year: "2024", value: 61 },
          { year: "2026", value: 63 },
        ],
      },
      {
        name: "Seguridad hídrica",
        color: "#8fcb32",
        data: [
          { year: "2018", value: 64 },
          { year: "2020", value: 61 },
          { year: "2022", value: 58 },
          { year: "2024", value: 60 },
          { year: "2026", value: 66 },
        ],
      },
    ],
  },
  {
    slug: "socio-cultural",
    title: "Dimensión socio - Cultural",
    short: "Dimensión Socio - Cultural",
    icon: "users",
    summary:
      "Gente, cultura cafetera, educación, salud y el derecho a permanecer en el territorio.",
    body: [
      "Sin talento local no hay horizonte. Esta dimensión pone en el centro la demografía, la educación, la cultura viva del café y las desigualdades urbano-rurales.",
      "El ejercicio busca que la visión 2050 se construya con las comunidades, no sobre ellas.",
    ],
    layers: ["Talento y educación", "Cultura viva", "Bienestar"],
    steps: [
      { n: "01", title: "Gente" },
      { n: "02", title: "Oficios" },
      { n: "03", title: "Escuela" },
      { n: "04", title: "Cultura" },
      { n: "05", title: "Cuidado" },
      { n: "06", title: "Voces" },
    ],
    charts: [
      {
        name: "Retención de talento joven",
        color: "#0b3336",
        data: [
          { year: "2018", value: 36 },
          { year: "2020", value: 33 },
          { year: "2022", value: 35 },
          { year: "2024", value: 41 },
          { year: "2026", value: 49 },
        ],
      },
      {
        name: "Cobertura educativa superior",
        color: "#8fcb32",
        data: [
          { year: "2018", value: 44 },
          { year: "2020", value: 46 },
          { year: "2022", value: 50 },
          { year: "2024", value: 55 },
          { year: "2026", value: 61 },
        ],
      },
    ],
  },
  {
    slug: "misiones",
    title: "Misiones del proceso",
    short: "Misiones del proceso",
    icon: "trophy",
    summary:
      "Un puñado de misiones orientadoras que organizan el esfuerzo colectivo alrededor de resultados verificables.",
    body: [
      "Las misiones traducen la visión en apuestas concretas: agua segura, empleo de calidad, paisaje vivo, instituciones que anticipan.",
      "Cada misión cruza dimensiones y obliga a coordinar entidades que normalmente trabajan por separado.",
    ],
    layers: ["Misión agua", "Misión talento", "Misión paisaje"],
    steps: [
      { n: "01", title: "Definir" },
      { n: "02", title: "Priorizar" },
      { n: "03", title: "Aliados" },
      { n: "04", title: "Metas" },
      { n: "05", title: "Ruta" },
      { n: "06", title: "Pilotos" },
    ],
    charts: [
      {
        name: "Avance misional",
        color: "#0b3336",
        data: [
          { year: "2018", value: 12 },
          { year: "2020", value: 18 },
          { year: "2022", value: 27 },
          { year: "2024", value: 39 },
          { year: "2026", value: 54 },
        ],
      },
      {
        name: "Alianzas activas",
        color: "#8fcb32",
        data: [
          { year: "2018", value: 8 },
          { year: "2020", value: 14 },
          { year: "2022", value: 22 },
          { year: "2024", value: 31 },
          { year: "2026", value: 45 },
        ],
      },
    ],
  },
  {
    slug: "retos",
    title: "Retos priorizados",
    short: "Retos priorizados",
    icon: "alert",
    summary:
      "Los nudos que, si no se resuelven, impiden cualquier escenario de futuro deseable.",
    body: [
      "Los retos no son una lista infinita. Se priorizan con evidencia y con la voz de quienes viven el territorio: empleo juvenil, agua, ordenamiento, coordinación institucional y diversificación productiva.",
      "Priorizar es también decir qué no se va a atender de primero. Esa conversación es parte del ejercicio.",
    ],
    layers: ["Estructura", "Coyuntura", "Emergentes"],
    steps: [
      { n: "01", title: "Inventario" },
      { n: "02", title: "Severidad" },
      { n: "03", title: "Urgencia" },
      { n: "04", title: "Viabilidad" },
      { n: "05", title: "Prioridad" },
      { n: "06", title: "Dueños" },
    ],
    charts: [
      {
        name: "Severidad percibida",
        color: "#0b3336",
        data: [
          { year: "2018", value: 72 },
          { year: "2020", value: 80 },
          { year: "2022", value: 76 },
          { year: "2024", value: 70 },
          { year: "2026", value: 64 },
        ],
      },
      {
        name: "Capacidad de respuesta",
        color: "#8fcb32",
        data: [
          { year: "2018", value: 24 },
          { year: "2020", value: 26 },
          { year: "2022", value: 34 },
          { year: "2024", value: 42 },
          { year: "2026", value: 55 },
        ],
      },
    ],
  },
  {
    slug: "iniciativas",
    title: "Iniciativas y fichas por dimensión",
    short: "Iniciativas y fichas por Dimensión",
    icon: "folder",
    summary:
      "El portafolio de iniciativas que convierte la visión en proyectos con responsable, costo y meta.",
    body: [
      "Cada iniciativa se documenta en una ficha: problema, población, entidad líder, aliados, presupuesto indicativo y contribución a la visión 2050.",
      "El portafolio se alimenta de lo que ya existe en el departamento y de lo que el ejercicio prospectivo revela que falta.",
    ],
    layers: ["Formulación", "Banco de proyectos", "Financiamiento"],
    steps: [
      { n: "01", title: "Ideas" },
      { n: "02", title: "Filtro" },
      { n: "03", title: "Ficha" },
      { n: "04", title: "Costo" },
      { n: "05", title: "Líder" },
      { n: "06", title: "Banco" },
    ],
    charts: [
      {
        name: "Fichas formuladas",
        color: "#0b3336",
        data: [
          { year: "2018", value: 6 },
          { year: "2020", value: 9 },
          { year: "2022", value: 14 },
          { year: "2024", value: 22 },
          { year: "2026", value: 36 },
        ],
      },
      {
        name: "Con financiamiento",
        color: "#8fcb32",
        data: [
          { year: "2018", value: 3 },
          { year: "2020", value: 4 },
          { year: "2022", value: 7 },
          { year: "2024", value: 11 },
          { year: "2026", value: 18 },
        ],
      },
    ],
  },
  {
    slug: "hallazgos",
    title: "Hallazgos y tendencias",
    short: "Hallazgos y tendencias",
    icon: "file",
    summary:
      "Las señales del entorno global, nacional y local que condicionan cualquier escenario del Quindío.",
    body: [
      "Cambio climático, transición energética, envejecimiento, digitalización y nuevas geografías del turismo son tendencias que no caben en un plan de cuatro años.",
      "El diagnóstico inicial lee esas tendencias a la luz de las capacidades reales del departamento para no construir una visión ingenua.",
    ],
    layers: ["Globales", "Nacionales", "Locales"],
    steps: [
      { n: "01", title: "Señales" },
      { n: "02", title: "Drivers" },
      { n: "03", title: "Impacto" },
      { n: "04", title: "Incertidumbre" },
      { n: "05", title: "Escenarios" },
      { n: "06", title: "Implicaciones" },
    ],
    charts: [
      {
        name: "Exposición climática",
        color: "#0b3336",
        data: [
          { year: "2018", value: 48 },
          { year: "2020", value: 52 },
          { year: "2022", value: 58 },
          { year: "2024", value: 63 },
          { year: "2026", value: 67 },
        ],
      },
      {
        name: "Digitalización de mipymes",
        color: "#8fcb32",
        data: [
          { year: "2018", value: 18 },
          { year: "2020", value: 29 },
          { year: "2022", value: 38 },
          { year: "2024", value: 47 },
          { year: "2026", value: 58 },
        ],
      },
    ],
  },
];

export const SEED_MENSAJES: SeedMensaje[] = [
  {
    nombre: "María Fernanda López",
    email: "maria.lopez@gmail.com",
    asunto: "Inscripción al laboratorio de jóvenes",
    mensaje: "Taller: Laboratorio de escenarios — jóvenes. Perfil: Academia — Municipio: Calarcá.",
    tipo: "inscripciones",
    fecha: "2026-06-20",
    leido: false,
  },
  {
    nombre: "Carlos Rivera",
    email: "carlos.rivera@empresa.co",
    asunto: "Queremos apoyar el ejercicio",
    mensaje: "Nuestra empresa quiere sumarse como aliada en la etapa de escenarios.",
    tipo: "contacto",
    fecha: "2026-06-21",
    leido: false,
  },
];

export type SeedUser = {
  email: string;
  password: string;
  role: 'admin' | 'editor';
};

export const SEED_USERS: SeedUser[] = [
  {
    email: 'admin@prospectiva.com',
    password: 'Admin123*',
    role: 'admin',
  },
];