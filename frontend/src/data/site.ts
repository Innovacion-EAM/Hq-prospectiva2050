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

export const STATS = [
  { value: "11", label: "Entidades Aliadas", subtext: "Públicas, privadas y academia" },
  { value: "2050", label: "Visión de Futuro", subtext: "Horizonte temporal de región" },
  { value: "3", label: "Etapas de Prospectiva", subtext: "Diagnóstico, escenarios e institucionalización" },
  { value: "60", label: "Años del Departamento", subtext: "Gobernanza y pertenencia territorial" },
] as const;

export const NAV = [
  { label: "Inicio", href: "/", match: "/" },
  { label: "El proyecto", href: "/proyecto", match: "/proyecto" },
  { label: "Dimensiones", href: "/dimensiones", match: "/dimensiones" },
  { label: "Documentos", href: "/documentos", match: "/documentos" },
  { label: "Noticias", href: "/noticias", match: "/noticias" },
  { label: "Participa", href: "/participa", match: "/participa" },
  { label: "Contáctanos", href: "/contactos", match: "/contactos" },
] as const;




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
    lead: "Horizonte Quindío es el proceso de prospectiva con el que once instituciones del departamento, junto a la CEPAL, construyen una visión de largo plazo para el territorio.",
    body: [
      "El 24 de marzo de 2026 se presentó oficialmente en el auditorio Euclides Jaramillo Arango de la Universidad del Quindío. El ejercicio responde al convenio específico 012 del 30 de enero de 2026, firmado entre la Universidad del Quindío —en representación de las entidades aliadas— y la Comisión Económica para América Latina y el Caribe (CEPAL), a través del ILPES.",
      "No se trata de predecir el futuro. Se trata de anticiparlo: identificar tendencias, capacidades y riesgos para acordar el futuro deseado y las decisiones que hay que tomar hoy. Es el primer ejercicio de este tipo en el departamento en más de dos décadas.",
      "La marca visual —una Q construida como línea de tiempo— sintetiza el tránsito entre lo que el Quindío ha sido, lo que es y lo que puede llegar a ser. El horizonte de planeación es 2050, con una hoja de ruta que se construye de forma participativa entre 2026 y 2027.",
      "El proceso está dirigido por Juan Esteban Gil Chavarría y cuenta con el acompañamiento técnico de Javier Medina Vásquez, secretario ejecutivo adjunto del ILPES-CEPAL. Once entidades públicas, privadas y académicas aportan recursos y conocimiento para que el resultado no se quede en un documento, sino que se institucionalice.",
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
      "El presupuesto conjunto se acerca a los 220 millones de pesos, con aportes de las once entidades. El trabajo se extiende cerca de diez meses, de diagnóstico a institucionalización.",
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
      "Once entidades y la CEPAL conforman el arreglo institucional que sostiene el ejercicio.",
    lead: "La gobernanza de Horizonte Quindío combina un comité técnico interinstitucional, el acompañamiento del ILPES-CEPAL y un diseño pensado para sobrevivir a los cambios de gobierno.",
    body: [
      "La Universidad del Quindío representa a las entidades aliadas ante la CEPAL. El comité técnico reúne a gobierno departamental y municipal, academia, gremios, empresa de servicios y autoridades ambientales.",
      "Las entidades participantes son: Gobernación del Quindío, Alcaldía de Armenia, Universidad del Quindío, Universidad La Gran Colombia, Cámara de Comercio de Armenia y del Quindío, Comité de Cafeteros del Quindío, Comité Intergremial del Quindío, CRQ, ProQuindío, Comfenalco Quindío, Facilísimo y la Empresa de Energía del Quindío.",
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
  icon: "target" | "chart" | "leaf" | "users" | "trophy" | "alert" | "folder" | "file";
  summary: string;
  body: string[];
  charts: ChartSeries[];
  layers: string[];
  steps: { n: string; title: string }[];
};

export const DIMENSIONS: Dimension[] = [
  {
    slug: "politico-institucional",
    title: "Dimensión político - Institucional",
    short: "Dimensión político Institucional",
    icon: "target",
    summary:
      "Capacidades de gobierno, articulación entre entidades y reglas que hacen posible una visión de largo plazo.",
    body: [
      "Esta dimensión observa la calidad de las instituciones públicas, la coordinación multinivel y la capacidad de sostener acuerdos más allá de un periodo de gobierno.",
      "Incluye el diseño del observatorio de prospectiva, la formación de servidores y la incorporación de escenarios en los planes de desarrollo municipales y departamental.",
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
      {
        name: "Capacidad de seguimiento",
        color: "#5c7072",
        data: [
          { year: "2018", value: 22 },
          { year: "2020", value: 24 },
          { year: "2022", value: 30 },
          { year: "2024", value: 38 },
          { year: "2026", value: 47 },
        ],
      },
    ],
    layers: ["Normas y competencias", "Arreglos de coordinación", "Cultura de lo público"],
    steps: [
      { n: "01", title: "Mapeo" },
      { n: "02", title: "Diagnóstico" },
      { n: "03", title: "Actores" },
      { n: "04", title: "Escenarios" },
      { n: "05", title: "Acuerdos" },
      { n: "06", title: "Observatorio" },
      { n: "07", title: "Seguimiento" },
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
      "El Quindío necesita un modelo productivo que no dependa de un solo cultivo ni de un turismo de temporada. Esta dimensión articula encadenamientos, empleo y sofisticación empresarial.",
      "Se analizan la agroindustria, el Paisaje Cultural Cafetero como activo económico, la energía, los servicios y el talento joven.",
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
      {
        name: "Inversión productiva",
        color: "#5c7072",
        data: [
          { year: "2018", value: 20 },
          { year: "2020", value: 18 },
          { year: "2022", value: 27 },
          { year: "2024", value: 35 },
          { year: "2026", value: 48 },
        ],
      },
    ],
    layers: ["Base cafetera", "Servicios y turismo", "Nueva industria"],
    steps: [
      { n: "01", title: "Cadenas" },
      { n: "02", title: "Brechas" },
      { n: "03", title: "Talento" },
      { n: "04", title: "Escenarios" },
      { n: "05", title: "Apuestas" },
      { n: "06", title: "Inversión" },
      { n: "07", title: "Empleo" },
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
      "Esta dimensión cruza la autoridad ambiental, el ordenamiento territorial y las infraestructuras que el departamento necesita sin romper el paisaje que lo sostiene.",
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
      {
        name: "Calidad del aire urbano",
        color: "#5c7072",
        data: [
          { year: "2018", value: 70 },
          { year: "2020", value: 72 },
          { year: "2022", value: 68 },
          { year: "2024", value: 71 },
          { year: "2026", value: 74 },
        ],
      },
    ],
    layers: ["Ecosistemas", "Ocupación del suelo", "Infraestructura verde"],
    steps: [
      { n: "01", title: "Inventario" },
      { n: "02", title: "Riesgos" },
      { n: "03", title: "Agua" },
      { n: "04", title: "Suelo" },
      { n: "05", title: "Paisaje" },
      { n: "06", title: "Norma" },
      { n: "07", title: "Cuidado" },
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
      {
        name: "Participación cultural",
        color: "#5c7072",
        data: [
          { year: "2018", value: 40 },
          { year: "2020", value: 32 },
          { year: "2022", value: 45 },
          { year: "2024", value: 52 },
          { year: "2026", value: 58 },
        ],
      },
    ],
    layers: ["Talento y educación", "Cultura viva", "Bienestar"],
    steps: [
      { n: "01", title: "Gente" },
      { n: "02", title: "Oficios" },
      { n: "03", title: "Escuela" },
      { n: "04", title: "Cultura" },
      { n: "05", title: "Cuidado" },
      { n: "06", title: "Voces" },
      { n: "07", title: "Pertenencia" },
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
      {
        name: "Hitos cumplidos",
        color: "#5c7072",
        data: [
          { year: "2018", value: 10 },
          { year: "2020", value: 16 },
          { year: "2022", value: 21 },
          { year: "2024", value: 33 },
          { year: "2026", value: 50 },
        ],
      },
    ],
    layers: ["Misión agua", "Misión talento", "Misión paisaje"],
    steps: [
      { n: "01", title: "Definir" },
      { n: "02", title: "Priorizar" },
      { n: "03", title: "Aliados" },
      { n: "04", title: "Metas" },
      { n: "05", title: "Ruta" },
      { n: "06", title: "Pilotos" },
      { n: "07", title: "Escalar" },
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
      {
        name: "Brecha neta",
        color: "#5c7072",
        data: [
          { year: "2018", value: 48 },
          { year: "2020", value: 54 },
          { year: "2022", value: 42 },
          { year: "2024", value: 28 },
          { year: "2026", value: 18 },
        ],
      },
    ],
    layers: ["Estructura", "Coyuntura", "Emergentes"],
    steps: [
      { n: "01", title: "Inventario" },
      { n: "02", title: "Severidad" },
      { n: "03", title: "Urgencia" },
      { n: "04", title: "Viabilidad" },
      { n: "05", title: "Prioridad" },
      { n: "06", title: "Dueños" },
      { n: "07", title: "Ruta" },
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
        name: "En ejecución",
        color: "#8fcb32",
        data: [
          { year: "2018", value: 4 },
          { year: "2020", value: 5 },
          { year: "2022", value: 8 },
          { year: "2024", value: 13 },
          { year: "2026", value: 21 },
        ],
      },
      {
        name: "Con financiamiento",
        color: "#5c7072",
        data: [
          { year: "2018", value: 3 },
          { year: "2020", value: 4 },
          { year: "2022", value: 7 },
          { year: "2024", value: 11 },
          { year: "2026", value: 18 },
        ],
      },
    ],
    layers: ["Formulación", "Banco de proyectos", "Financiamiento"],
    steps: [
      { n: "01", title: "Ideas" },
      { n: "02", title: "Filtro" },
      { n: "03", title: "Ficha" },
      { n: "04", title: "Costo" },
      { n: "05", title: "Líder" },
      { n: "06", title: "Banco" },
      { n: "07", title: "Gestión" },
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
      {
        name: "Presión turística",
        color: "#5c7072",
        data: [
          { year: "2018", value: 40 },
          { year: "2020", value: 22 },
          { year: "2022", value: 55 },
          { year: "2024", value: 68 },
          { year: "2026", value: 74 },
        ],
      },
    ],
    layers: ["Globales", "Nacionales", "Locales"],
    steps: [
      { n: "01", title: "Señales" },
      { n: "02", title: "Drivers" },
      { n: "03", title: "Impacto" },
      { n: "04", title: "Incertidumbre" },
      { n: "05", title: "Escenarios" },
      { n: "06", title: "Implicaciones" },
      { n: "07", title: "Alertas" },
    ],
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
    title: "Mapa del sitio",
    links: [
      { label: "El proyecto", href: "/proyecto" },
      { label: "Dimensiones", href: "/dimensiones" },
      { label: "Documentos", href: "/documentos" },
      { label: "Participa", href: "/participa" },
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
      { label: "Iniciativas y fichas", href: "/dimensiones/iniciativas" },
      { label: "Hallazgos y tendencias", href: "/dimensiones/hallazgos" },
    ],
  },
];

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
