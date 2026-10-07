export type SeedNoticia = {
  slug: string;
  titulo: string;
  categoria: string;
  autor?: string;
  fecha: string;
  imagen: string | null;
  resumen: string;
  contenido: string[];
  etiquetas: string[];
  publicado: boolean;
  destacado: boolean;
  publicadoEn?: string;
};

// El repositorio vive en `data/repositorio-seed.ts` (297 ítems generados desde
// el Excel original); aquí solo se re-exporta para que el seeder siga teniendo
// un único punto de importación.
export {
  SEED_REPOSITORIO,
  type SeedRepositorioItem,
} from './data/repositorio-seed';

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

export type SeedNavLink = { label: string; href: string };

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
  /** `null` = se usa la marca propia del sitio, que es lo que había antes. */
  logoUrl: string | null;
  logoTitulo: string;
  logoSubtitulo: string;
  navLinks: SeedNavLink[];
  /**
   * Datos legales editables (módulo "Legal"). Van vacíos a propósito: el
   * responsable, su NIT, el canal de derechos ARCO y el plazo de conservación
   * solo los conoce la organización. Mientras estén vacíos, el aviso de
   * privacidad muestra un marcador visible en cada hueco.
   */
  legal: {
    responsable: string;
    nit: string;
    direccion: string;
    ciudad: string;
    correoArco: string;
    plazoConservacion: string;
    quienesAcceden: string;
    actualizado: string;
  };
};

export type SeedStat = { value: string; label: string; subtext: string };
export type SeedMunicipio = { nombre: string; dato?: string; descripcion?: string };
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
  /**
   * 'dimension' = una de las 4 dimensiones de análisis del proyecto.
   * 'bloque'    = contenido de apoyo (misiones, retos, iniciativas, hallazgos).
   */
  tipo?: "dimension" | "bloque";
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
  consentimiento?: boolean;
};

export const SEED_NOTICIAS: SeedNoticia[] = [
  // Importadas del Excel oficial de noticias (docs/doc/2-NOTICIAS).
  // La columna "Imagen principal" del Excel trae una descripción, no un archivo:
  // por eso imagen queda en null y la web usa su imagen de respaldo.
  {
    slug: "nace-horizonte-quindio-prospectiva-2050-un-ejercicio-para-construir-el-futuro-de-la-region",
    titulo: "Nace Horizonte Quindío - Prospectiva 2050, un ejercicio para construir el futuro de la región",
    categoria: "Institucional",
    autor: "Equipo Horizonte Quindío 2050",
    fecha: "2026-03-24",
    imagen: null,
    resumen: "Horizonte Quindío Prospectiva 2050 fue presentado oficialmente como una iniciativa regional para construir una visión estratégica de largo plazo con la participación de instituciones, sector empresarial y ciudadanía.",
    contenido: [
      "Nace Horizonte Quindío - Prospectiva 2050, un ejercicio para construir el futuro de la región",
      "En el auditorio Euclides Jaramillo Arango de la Universidad del Quindío, y mediante una puesta en escena participativa e incluyente, cargada de simbolismo, reflexión y sentido de pertenencia territorial, se realizó este martes la presentación oficial de Horizonte Quindío - Prospectiva 2050. Este ejercicio colaborativo traza una visión estratégica de largo plazo para el departamento, construida de manera articulada entre la sociedad civil, el Estado, la academia y el sector productivo.",
      "Este proceso, que responde al convenio específico número 012 del 30 de enero del 2026 de cooperación firmado entre la Universidad del Quindío (en representación. De 11 entidades del Quindío) y la Comisión Económica para América Latina y el Caribe (CEPAL), marca un hito para el departamento porque asume la prospectiva como herramienta clave para pensar el desarrollo, más de dos décadas después del último ejercicio que se realizó en este sentido.",
      "Javier Medina Vásquez, secretario ejecutivo adjunto y oficial a cargo del Instituto Latinoamericano y del Caribe de Planificación Económica y Social (ILPES) de la CEPAL, destacó que: \"la prospectiva tiene que ver con dos conceptos clave: anticipar, es decir, la creación de escenarios futuros, identificación de tendencias y sus consecuencias en el territorio; la otra tiene que ver con la construcción de los futuros deseados, lo que se traduce en ponerse de acuerdo en qué planes, programas y proyectos son necesarios para esa visión compartida de futuro, por eso hablamos más un ejercicio de gobernanza anticipatoria\".",
      "La CEPAL cuenta con más de 40 años de experiencia en procesos de prospectiva y en particular el ILPES ha sido referente latinoamericano y caribeño en la materia.",
      "\"Con gran complacencia hemos visto la solicitud que hizo el Quindío de contar con nosotros. Hay muchos ejercicios territoriales de desarrollo local y territorial como este.",
      "Actualmente estamos acompañando experiencias interesantes en la región de Quintana Roo en México; Córdoba, Argentina; Ceará, Brasil; entre otros\", indicó Medina Vásquez.",
      "La prospectiva territorial es una disciplina que permite analizar las distintas alternativas de futuro de un territorio con el propósito de tomar mejores decisiones en el presente. No se trata de predecir lo que vendrá, sino de construirlo de forma conjunta para anticipar escenarios, identificar oportunidades y reducir la incertidumbre en la toma de decisiones.",
      "Esta labor se fundamenta en la concepción de que el territorio no es estático, sino que se configura como formación social en constante evolución, moldeada por su historia, sus capacidades y, sobre todo, por las decisiones que se toman hoy.",
      "Un acuerdo para fortalecer capacidades y visión de futuro La presentación de Horizonte Quindío está respaldada por el acuerdo de cooperación entre la CEPAL y la Universidad del Quindío, complementado con la participación activa de once entidades del departamento: Comité de Cafeteros del Quindío, Comité Intergremial del Quindío, Cámara de Comercio de Armenia y del Quindío, Corporación Autónoma Regional del Quindío, ProQuindío, Comfenalco Quindío, Facilísimo, Empresa de Energía del Quindío, Gobernación del Quindío, Alcaldía de Armenia y Universidad La Gran Colombia.",
      "\"Somos once instituciones de la región que nos hemos unido con una visión de futuro, para pensar en un mejor Armenia y un mejor Quindío. En ese sentido, con aportes en recursos de cada una de las entidades involucradas hemos hecho un análisis muy detallado de cuál sería la consultoría que podría apoyar de la mejor manera y conjuntamente decidimos que la CEPAL nos daba las mejores garantías, porque la prospectiva no se trata de construir solamente un documento sino de que trascienda con apropiación previa y seguimiento\", enfatizó Luis Fernando Polanía Obando, rector de la Universidad del Quindío.",
      "Asimismo, resaltó que en este proceso será fundamental la construcción de un observatorio que hará seguimiento para que el documento de prospectiva y las políticas públicas que de allí resulten se cumplan.",
      "\"Esto sumado a las lecciones aprendidas de procesos anteriores nos va a llevar a que este sea un ejercicio exitoso y pueda cambiar la dinámica de desarrollo regional del Quindío\".",
      "Un proceso por fases: del diagnóstico a la acción El ejercicio de prospectiva se desarrollará en tres grandes etapas entre 2026 y 2027: Diagnóstico inicial y diseño metodológico: identificación de tendencias, desafíos y capacidades del territorio.",
      "Ejecución del ejercicio prospectivo: construcción de escenarios de futuro y una visión compartida.",
      "Institucionalización: incorporación de la prospectiva en la planificación territorial y la toma de decisiones públicas y este enfoque permitirá pasar de una gestión reactiva a una gestión anticipatoria, en la que el futuro no se espera, sino que se diseña.",
      "El secretario adjunto de la CEPAL, Javier Enrique Medina Vásquez, y el director de Horizonte Quindío, Juan Esteban Gil Chavarría, harán parte de una completa agenda que se desarrollará del 24 al 26 de marzo y en la que, junto al comité técnico, se reunirán con diferentes actores del departamento de los sectores gobierno, educación y empresarial, dando así inicio a la primera etapa de diagnóstico y diseño metodológico.",
      "Un evento que encendió la visión colectiva Horizonte Quindío fue, en sí mismo, una experiencia prospectiva. Desde la penumbra inicial, acompañada por un artista visual que dibujaba en tiempo real los posibles futuros del territorio, hasta el encendido simbólico de faroles por parte de once entidades aliadas, el evento invitó a reflexionar sobre el papel de cada actor en la construcción del mañana.",
      "Uno de los momentos más significativos fue el \"viaje al futuro\", una simulación sonora de noticias del año 2050 que confrontó a los asistentes con posibles escenarios -retos y oportunidades-, recordando que las decisiones de hoy impactarán a generaciones que aún no han nacido.",
      "La lectura simbólica de una carta escrita por una niña del futuro reforzó este mensaje: la prospectiva no es solo una herramienta técnica, es un acto de responsabilidad intergeneracional.",
      "Horizonte Quindío: una visión que conecta pasado, presente y futuro Bajo la marca Horizonte Quindío - Prospectiva 2050, el proyecto integra en un solo concepto la historia, el territorio y la proyección hacia el futuro. Su identidad visual, representada en una \"Q\" construida como línea del tiempo, simboliza el tránsito continuo entre lo que el Quindío ha sido, lo que es y lo que puede llegar a ser.",
      "Más allá de constituirse en una ejecución institucional, Horizonte Quindío se plantea como un proyecto ambicioso que reúne varias fuerzas comunitarias en función de un modelo de visión estructurado y compartido por todos.",
      "Porque construir el mañana no es una opción, es una decisión. Y en el Quindío, esa decisión ya comenzó.",
],
    etiquetas: ["Horizonte Quindío", "Prospectiva 2050", "Lanzamiento"],
    publicado: true,
    destacado: true,
    publicadoEn: "2026-03-24T09:00:00.000Z",
  },
  {
    slug: "el-diagnostico-del-quindio-inicia",
    titulo: "El diagnóstico del Quindío inicia",
    categoria: "Diagnóstico",
    autor: "Equipo Horizonte Quindío 2050",
    fecha: "2026-03-25",
    imagen: null,
    resumen: "Se definió la ruta metodológica, la gobernanza y los equipos de trabajo para iniciar el diagnóstico territorial del departamento.",
    contenido: [
      "El diagnóstico del Quindío inicia Comité técnico analiza potencialidades, retos, problemáticas y desafíos",
      "Este miércoles 25 de marzo, en el auditorio de Ciencias Agroindustriales de la Universidad del Quindío, Horizonte Quindío - Prospectiva 2050 definió la ruta de gobernanza y conformó los equipos y roles para avanzar en el estudio que trazará el camino de las nuevas generaciones del Corazón Verde de Colombia y que durante el 2026 desarrollará 4 fases: diagnóstico y diseño metodológico, formación en prospectiva, ejercicio de visión y construcción de escenarios, así como la propuesta de institucionalización.",
      "Durante la jornada estuvieron presentes el comité núcleo liderado por Juan Esteban Gil Chavarría, el comité técnico delegado por las 11 entidades que integran el estudio, y los delegados de la Comisión Económica para América Latina y el Caribe (Cepal): Luis Riffo Pérez, coordinador de planeación del Instituto Latinoamericano y del Caribe de Planificación Económica y Social (Ilpes); Alexis Andrés Aguilera Alvear, consultor nacional del Ilpes en Colombia y coordinador del proyecto de prospectiva para el Quindío; Javier Vitale, Paola Aceituno y Antonia Díaz, funcionarios del Ilpes.",
      "Elementos de análisis en la visión para el Quindío",
      "Para la fase de diagnóstico del estudio de prospectiva Quindío 2050 se realizará la identificación de los siguientes elementos de análisis:",
      "* Contextualización geográfica, económica y social del territorio.",
      "* Identificación y clasificación de actores territoriales.",
      "* Definición de dimensiones internas (del departamento) y externas (entorno).",
      "* Reconocimiento de apuestas, vocaciones y prioridades territoriales.",
      "* Identificación y análisis de tendencias globales, nacionales y locales.",
      "* Identificación y análisis de capacidades y brechas territoriales.",
      "* Referenciación de mejores prácticas y modelos territoriales de regiones pares.",
      "Con estos insumos, se realizará el análisis del entorno que permita generar un balance de potencialidades, retos, problemáticas y desafíos del departamento.",
      "Una mirada a los sectores educación y gobierno",
      "Este miércoles la agenda también contó con las mesas de trabajo integradas con los rectores de las 10 universidades del departamento que hacen parte de la Red de Instituciones de Educación Superior, Red IQ, para conocer y retroalimentar el ejercicio con la realidad de la educación en la región y hacia donde quiere ir.",
      "Asimismo, se adelantó el encuentro con el equipo de gobierno de la administración departamental para conocer el panorama desde diferentes sectores en el territorio y las propuestas que se tienen con visión de futuro.",
      "La planificación es esencial",
      "Según indicaron los delegados del Ilpes, la prospectiva es una de las funciones básicas de la planificación, al ser parte de un concepto integral de gestión estratégica donde también se encuentran las funciones de coordinación, evaluación y concertación. Cabe mencionar que la prospectiva no es un elemento nuevo de este conjunto de funciones; y que de ninguna manera la prospectiva puede sustituir a la planificación.",
      "Bajo esa perspectiva, la práctica de las funciones básicas de la planificación es esencial para orientar las decisiones estratégicas; su valor radica en trascender la visión cortoplacista y proporcionar una lectura más amplia de la realidad (Medina Vásquez, Becerra, & Castaño, 2014).",
],
    etiquetas: ["Diagnóstico", "Planeación"],
    publicado: true,
    destacado: false,
    publicadoEn: "2026-03-25T09:00:00.000Z",
  },
  {
    slug: "horizonte-quindio-2050-avanzo-en-su-agenda-metodologica",
    titulo: "Horizonte Quindío 2050 avanzó en su agenda metodológica",
    categoria: "Talleres",
    autor: "Equipo Horizonte Quindío 2050",
    fecha: "2026-03-26",
    imagen: null,
    resumen: "Actores estratégicos participaron en un taller sobre construcción de escenarios y visión de futuro para el Quindío.",
    contenido: [
      "Horizonte Quindío 2050 avanzó en su agenda metodológica con jornada de trabajo sobre escenarios de futuro y articulación con sectores estratégicos",
      "Armenia, 26 de marzo de 2026. En el marco de la agenda de desarrollo metodológico de Horizonte Quindío – Prospectiva 2050, este jueves se cumplió una nueva jornada de trabajo orientada a fortalecer capacidades, sensibilizar actores clave del territorio y continuar la articulación con sectores estratégicos del departamento. Esta actividad da continuidad al proceso presentado oficialmente el pasado 24 de marzo como una apuesta regional de largo plazo para construir, de manera participativa, una visión compartida de futuro para el Quindío.",
      "Construcción de escenarios para el Quindío",
      "La jornada inició en la sede campestre de la Universidad La Gran Colombia, con un taller sobre construcción de escenarios para el Quindío, centrado en la visión de futuro y el conocimiento práctico de la metodología prospectiva. El espacio fue liderado por los delegados de la Comisión Económica para América Latina y el Caribe (Cepal): Luis Riffo Pérez, coordinador de planeación del Instituto Latinoamericano y del Caribe de Planificación Económica y Social (Ilpes) y Alexis Andrés Aguilera Alvear, consultor nacional del Ilpes en Colombia y coordinador del proyecto de prospectiva para el Quindío; y reunió a 110 representantes de diferentes sectores de la sociedad quindiana que trabajaron en 7 mesas que abordaron los temas relevantes para la región: desarrollo económico y competitividad, sostenibilidad ambiental, educación ciencia y tecnología, infraestructura logística, jóvenes, agroindustria y turismo, y el componente social y cultural.",
      "Juan Esteban Gil, director del proyecto Horizonte Quindío – Prospectiva 2050: “Este taller es algo histórico, tener en un mismo escenario a universidades, gremios, empresas públicas y privadas, y el sector oficial, es una gran oportunidad para que, con la guía y experticia metodológica de CEPAL trabajemos en el ejercicio de prospectiva que mejor se ajuste a las necesidades de la región.",
      "Estamos muy complacidos de tener una asistencia tan nutrida en este espacio con los expertos técnicos, porque lo más valioso de este proceso es que los representantes de la sociedad quindiana quedaremos con el conocimiento y las herramientas técnicas y metodológicas que Naciones Unidas, a través de CEPAL, nos entregarán para que construyamos la carta de navegación con la que cumpliremos los sueños que tenemos los diferentes sectores para el Quindío”.",
      "Durante el taller, las y los participantes vivieron un ejercicio práctico guiado por facilitadores, con apoyo de recursos lúdicos y metodológicos, que permitió ensayar la construcción de escenarios y sensibilizar a los equipos de trabajo sobre la importancia de pensar el desarrollo del Quindío desde una perspectiva anticipatoria. Más que un ejercicio teórico, la actividad buscó acercar a los distintos actores a la lógica de la prospectiva, entendida como una herramienta para identificar tendencias, explorar alternativas de futuro y fortalecer la toma de decisiones en el presente. Este enfoque coincide con el espíritu del proyecto, que propone pasar de una gestión reactiva a una gestión anticipatoria.",
      "Cristian Fernando Tovar Orrego, en representación de las juventudes del Quindío resaltó el ejercicio: “Este taller es una manera efectiva de recolectar insumos para esta iniciativa de prospectiva 2050. Una jornada dinámica que integra diferentes sectores lo que permite tener una mirada más global; en 2050 esperamos que seamos una de las principales ciudades del país, pero hay mucho camino por recorrer en cuanto a vías, movilidad y empleabilidad para que los jóvenes tengamos un mejor porvenir”.",
      "Sector empresarial, actor fundamental en el futuro del Quindío",
      "En la jornada de la tarde, en el Club Campestre, se desarrolló una reunión entre representantes de la CEPAL, el Comité Técnico de la iniciativa Horizonte Quindío – Prospectiva 2050 y ProQuindío, la Cámara de Comercio de Armenia y del Quindío y el Comité Intergremial del Quindío. Este encuentro permitió ampliar el diálogo con Javier Enrique Medina Vásquez, secretario ejecutivo adjunto de la CEPAL y oficial a cargo del Ilpes, y el sector empresarial, un actor fundamental dentro de Horizonte Quindío, cuya construcción ha sido planteada desde su origen como un ejercicio articulado entre instituciones, sector productivo y ciudadanía.",
      "María Camila Martínez Muriel, directora ejecutiva de ProQuindío: “Todo el tejido productivo del Quindío está comprometido con el territorio y su desarrollo, con esta iniciativa que venimos jalonando 11 empresas quindianas, buscamos la sostenibilidad, mejorar la infraestructura vial, tener un mejor transporte público, garantizar la participación de los jóvenes en la política pública, de forma que tengamos un conglomerado de desarrollo integral para nuestro territorio”.",
      "Los aportes de los participantes del sector de la construcción, agroindustria, turismo, salud, entretenimiento, deportivo y logístico se centraron en trabajar en temas críticos como el definir un rumbo claro para el territorio, fortalecer la institucionalidad y los liderazgos regionales, trabajar en la identidad del Quindío, así como crear un entorno en el que la educación y la tecnología aporten al desarrollo del territorio.",
      "Por su parte José Alejandro Mejía, representante de CAMU y CAMACOL Capítulo Quindío, afirmó: “Es muy importante que la ciudad y el departamento construyan una ruta para saber qué quiere ser para 2050, y aún más importante que lo hagamos los actores del sector público, la academia, los empresarios y la institucionalidad para que construyamos una ruta realizable, viva y concertada”.",
      "Reunión con Alcaldía de Armenia",
      "La agenda del día concluyó en la Alcaldía de Armenia, con una reunión entre los representantes de la CEPAL, el gabinete municipal y el Comité Técnico de la iniciativa Horizonte Quindío; este espacio permitió fortalecer el componente institucional del proceso y avanzar en la vinculación de actores públicos que serán determinantes en la consolidación de una visión compartida de largo plazo para el municipio y el departamento.",
      "Estas actividades hacen parte del inicio de la primera etapa de diagnóstico y diseño metodológico de Horizonte Quindío – Prospectiva 2050, proceso que, de acuerdo con su hoja de ruta, contempla posteriormente la construcción de escenarios de futuro y una visión compartida, así como la incorporación de la prospectiva en la planificación territorial y en la toma de decisiones públicas y privadas.",
      "Con esta jornada, Horizonte Quindío continúa consolidándose como un ejercicio colectivo de gobernanza anticipatoria, porque construir el futuro del Quindío no es un ejercicio aislado, sino una decisión colectiva que requiere método, participación y visión compartida.",
],
    etiquetas: ["Escenarios", "Prospectiva"],
    publicado: true,
    destacado: false,
    publicadoEn: "2026-03-26T09:00:00.000Z",
  },
  {
    slug: "diputados-del-quindio-se-suman-a-horizonte-quindio-prospectiva-2050",
    titulo: "Diputados del Quindío se suman a Horizonte Quindío Prospectiva 2050",
    categoria: "Socialización",
    autor: "Equipo Horizonte Quindío 2050",
    fecha: "2026-05-12",
    imagen: null,
    resumen: "La Asamblea conoció el alcance del proyecto y manifestó su interés en participar activamente en el proceso.",
    contenido: [
      "Diputados del Quindío se suman a Horizonte Quindío Prospectiva 2050",
      "Armenia, 12 de mayo de 2026. En el marco de la agenda de desarrollo metodológico de Horizonte Quindío – Prospectiva 2050, este viernes 8 de mayo se realizó una jornada de socialización en la Asamblea Departamental del Quindío, orientada a presentar los alcances, metodologías, cronograma y objetivos de esta ruta de planeación territorial a largo plazo que busca construir una visión compartida de futuro para el departamento.",
      "Juan Esteban Gil Chavarría, director del proyecto Horizonte Quindío – Prospectiva 2050, explicó el alcance de esta apuesta regional y resaltó la importancia de la participación de la Comisión Económica para América Latina y el Caribe (CEPAL), organismo de Naciones Unidas referente en prospectiva y planificación territorial. Asimismo, destacó el trabajo articulado que actualmente desarrollan las 11 organizaciones vinculadas a la iniciativa, promoviendo una gobernanza colaborativa enfocada en proyectar el desarrollo del Quindío hacia el año 2050.",
      "La jornada permitió socializar las metodologías, cronogramas y diferentes etapas que integran el proceso prospectivo, así como las formas en las que la Asamblea Departamental podrá vincularse activamente al ejercicio. En este espacio, los diputados manifestaron su interés en participar como expertos temáticos y referentes desde sus diferentes áreas de experiencia, aportando visiones y propuestas en la construcción colectiva del estudio.",
      "Durante el diálogo se resaltó la importancia de consolidar un ejercicio sostenible en el tiempo, que permita fortalecer la planeación territorial y aprender de experiencias desarrolladas anteriormente en el departamento. Los diputados manifestaron su interés en participar como expertos temáticos del ejercicio y realizaron aportes relacionados con enfoques, antecedentes y oportunidades para el desarrollo regional, destacando la importancia de avanzar en un proceso articulado que contribuya a la construcción de una visión de futuro para el Quindío.",
      "Con esta jornada, Horizonte Quindío – Prospectiva 2050 continúa consolidándose como un ejercicio colectivo de gobernanza anticipatoria, enfocado en fortalecer la participación de diferentes actores del territorio y promover una construcción conjunta del futuro del departamento.",
],
    etiquetas: ["Asamblea", "Gobernanza"],
    publicado: true,
    destacado: false,
    publicadoEn: "2026-05-12T09:00:00.000Z",
  },
  {
    slug: "horizonte-quindio-2050-ya-avanza-asi-se-empieza-a-construir-el-futuro-del-departamento",
    titulo: "Horizonte Quindío 2050 ya avanza: así se empieza a construir el futuro del departamento",
    categoria: "Avances",
    autor: "Equipo Horizonte Quindío 2050",
    fecha: "2026-06-01",
    imagen: null,
    resumen: "El proyecto culminó su primera fase e inició el diagnóstico territorial con una metodología participativa.",
    contenido: [
      "Armenia, 01 de junio de 2026",
      "Segunda misión de la Cepal en el Quindío",
      "Horizonte Quindío Prospectiva 2050 ya se encuentra consolidando la fase de diagnóstico territorial junto a la Comisión Económica para América Latina y el Caribe, Cepal, en un ejercicio que busca construir una visión compartida de largo plazo para el departamento.",
      "Durante el mes de abril se finalizó la etapa preprospectiva con la se construyó la metodología, el esquema de gobernanza, el plan de trabajo, el cronograma, el mapa de actores, el plan de comunicaciones, el plan de participación y todos los elementos necesarios para la implementación de las actividades en adelante.",
      "Desde el mes de mayo se avanza en la primera fase de la Etapa Prospectiva, la construcción del diagnóstico territorial, el cual tiene una duración aproximada de 3 meses.",
      "\"Implementando las herramientas metodológicas de Cepal, estamos avanzando en la recopilación, organización y análisis de información estratégica sobre las dinámicas sociales, económicas, ambientales, institucionales y territoriales del Quindío\", detalló Juan Esteban Gil Chavarría, gerente de Horizonte Quindío 2025.",
      "Estas actividades de recopilación de información de los sectores público, privado y académico, busca tener todo el mapeo de planes, diagnósticos, programas, proyectos y demás iniciativas que acerquen el proceso a la realidad del Quindío y de Armenia, como punto de partida para la construcción de las actividades posteriores.",
      "Dentro del proceso de participación, se adelanta la construcción del mapa de actores que participan en el desarrollo de las diferentes etapas de la prospectiva. Ya se cuenta con más de 217 expertos temáticos distribuidos en las dimensiones económico-productiva, físico-ambiental, político-institucional y sociocultural, fortaleciendo así un ejercicio interdisciplinario y abierto a diferentes sectores del territorio.",
      "Como parte de la fase de desarrollo de competencias locales, la Cepal está realizando el segundo curso de profundización en Prospectiva Territorial en el que están participando 93 personas, entre representantes institucionales, academia, gremios, sector privado y organizaciones sociales del departamento. Con este curso, el proceso de formación de capacidades especializadas en prospectiva en el departamento asciende a más de 120 personas. Adicionalmente, se ha logrado la vinculación de 14 pasantes y auxiliares de investigación de la Universidad La Gran Colombia y la Universidad del Quindío, quienes apoyan las labores de sistematización documental, análisis territorial, identificación de actores y construcción de información estratégica para el estudio prospectivo del departamento.",
      "Luego del diagnóstico territorial, se adelantará la construcción colectiva de la visión 2050, luego la construcción de escenarios, posteriormente la construcción de la estrategia de implementación de la hoja de ruta y finalmente la institucionalización e implementación del resultado de la prospectiva.",
      "Segunda Misión CEPAL",
      "Entre el 6 y el 13 de junio de 2026 se desarrollará la segunda misión técnica de los expertos de la Cepal en el departamento del Quindío, una agenda que contempla recorridos territoriales, talleres participativos, reuniones técnicas, ejercicios de construcción colectiva y encuentros temáticos.",
      "Dentro de las actividades previstas está un evento de gobernanza anticipatoria, talleres de cartografía social, reuniones temáticas y espacios de construcción participativa orientados a fortalecer el diagnóstico prospectivo del departamento.",
      "La agenda también contempla espacios de participación dirigidos a medios de comunicación, organizaciones sociales y ambientales, juventudes, actores comunitarios, instituciones públicas, academia y sector privado, buscando ampliar las voces presentes dentro del proceso y fortalecer la construcción colectiva del Horizonte Quindío 2050.",
],
    etiquetas: ["Prospectiva"],
    publicado: true,
    destacado: false,
    publicadoEn: "2026-06-01T09:00:00.000Z",
  },
  {
    slug: "gobernanza-anticipatoria-y-participacion-ciudadana-marcaran-la-agenda-de-horizonte-quindio",
    titulo: "Gobernanza anticipatoria y participación ciudadana marcarán la agenda de Horizonte Quindío",
    categoria: "Misión CEPAL",
    autor: "Equipo Horizonte Quindío 2050",
    fecha: "2026-06-09",
    imagen: null,
    resumen: "Comenzó la Segunda Misión Técnica de CEPAL–ILPES con una agenda enfocada en fortalecer el diagnóstico territorial.",
    contenido: [
      "Gobernanza anticipatoria y participación ciudadana marcarán la agenda de Horizonte Quindío Prospectiva 2050.",
      "Armenia, Quindío, 9 de junio de 2026. Con una rueda de prensa, realizada en la Universidad del Quindío, inició oficialmente este martes la Segunda Misión Técnica de la Cepal – Ilpes, en el marco de Horizonte Quindío Prospectiva 2050. El encuentro permitió socializar los principales avances del proyecto y presentar la agenda de trabajo que se desarrollará durante la presente semana con la participación de actores institucionales, sociales, académicos y empresariales del departamento.",
      "La jornada matutina contempló la conferencia “Gobernanza Anticipatoria: reflexiones a partir de una experiencia”, orientada por la investigadora de Cepal-Ilpes Paola Aceituno Olivares. La experta compartió herramientas y experiencias para fortalecer la capacidad de los territorios para anticipar desafíos y construir estrategias de largo plazo.",
      "Actualmente, Horizonte Quindío Prospectiva 2050 avanza en la fase de diagnóstico territorial y registra importantes resultados, entre ellos la vinculación de 359 expertos temáticos al Panel de Expertos, más de 500 actores estratégicos identificados, 120 participantes en el Curso de Prospectiva Territorial desarrollado por Cepal - Ilpes y el análisis de 520 documentos regionales que sirven como base para la construcción de la Visión Quindío 2050.",
      "“La Segunda Misión Técnica de la Cepal representa un momento clave para el proyecto. Estamos convocando a instituciones, academia, empresarios, organizaciones sociales, jóvenes y ciudadanía para construir juntos el diagnóstico territorial que servirá de base para definir el futuro que queremos para el Quindío. Queremos que esta visión sea el resultado de cientos de voces y no de unas pocas decisiones, porque el futuro del departamento debe construirse entre todos”, afirmó Juan Esteban Gil Chavarría, director de Horizonte Quindío Prospectiva 2050.",
      "La agenda continuará este miércoles con el Taller de Construcción Participativa y Cartografía Social Cepal en la Universidad La Gran Colombia, un espacio que reunirá a actores estratégicos del territorio para identificar potencialidades, desafíos y oportunidades que aportarán a la construcción de la Visión Quindío 2050. Asimismo, durante la tarde se desarrollará una jornada de trabajo con el gabinete departamental, la Asamblea Departamental y las alcaldías municipales, fortaleciendo la articulación institucional alrededor de los retos y oportunidades que definirán el desarrollo del Quindío en las próximas décadas.",
      "Estas actividades hacen parte de un proceso participativo que busca construir una hoja de ruta de largo plazo para el departamento, consolidando una visión compartida que permita orientar las decisiones estratégicas del territorio hacia el año 2050.",
      "Horizonte Quindío Prospectiva 2050 continúa consolidándose como una conversación abierta con el territorio, donde cada aporte fortalece la construcción del Quindío que soñamos hacia el año 2050.",
],
    etiquetas: ["CEPAL", "Gobernanza"],
    publicado: true,
    destacado: false,
    publicadoEn: "2026-06-09T09:00:00.000Z",
  },
  {
    slug: "cartografia-social-y-dialogo-institucional-avanzan-en-la-construccion-de-la-vision-quindio-2050",
    titulo: "Cartografía social y diálogo institucional avanzan en la construcción de la Visión Quindío 2050",
    categoria: "Participación",
    autor: "Equipo Horizonte Quindío 2050",
    fecha: "2026-06-10",
    imagen: null,
    resumen: "Los talleres participativos permitieron recoger aportes de actores territoriales e institucionales.",
    contenido: [
      "Más voces se suman a la construcción de la visión Quindío 2050",
      "Armenia, Quindío, 10 de junio de 2026. La Segunda Misión Técnica de CEPAL–ILPES continuó este miércoles con una jornada de trabajo enfocada en la construcción colectiva de la Visión Quindío 2050, mediante espacios de participación que reunieron a actores territoriales, representantes institucionales y líderes de diferentes sectores del departamento.",
      "Durante la mañana se desarrolló el Taller de Construcción Participativa y Cartografía Social en la Universidad La Gran Colombia, con la participación de más de 40 asistentes. El ejercicio permitió identificar fortalezas, desafíos y oportunidades del Quindío desde diversas perspectivas, aportando insumos fundamentales para el diagnóstico territorial que actualmente adelanta Horizonte Quindío Prospectiva 2050.",
      "Laura Natalia Martínez, estudiante de Ingeniería de la Universidad La Gran Colombia, quien destacó el valor de la cartografía social como herramienta para comprender las dinámicas del territorio. “Es una herramienta que nos permite acercarnos mucho a la realidad que vive nuestro territorio y entender las dinámicas que se presentan desde lo social, ambiental y económico”, señaló.",
      "La estudiante también resaltó la importancia de proyectar el desarrollo del departamento con una visión de largo plazo. “Es una gran herramienta que nos permite pensarnos a mediano y largo plazo como departamento, reconociendo nuestras fortalezas para potenciar lo que tenemos como territorio”, afirmó.",
      "En horas de la tarde, la Asamblea Departamental fue escenario del Taller de Construcción Participativa sobre el Quindío, liderado metodológicamente por CEPAL–ILPES. La actividad contó con la participación del gabinete departamental y diputados, quienes compartieron sus perspectivas sobre los principales desafíos y oportunidades que marcarán el desarrollo del departamento en las próximas décadas.",
      "El presidente de la Asamblea Departamental, César Augusto Londoño López, destacó la importancia de fortalecer los procesos de planificación estratégica para el futuro del territorio. “Hoy es muy importante que de verdad planifiquemos el territorio. Durante años hemos actuado frente a las emergencias, resolviendo los problemas del momento, pero sin pensar en el futuro que necesita el Quindío. Por eso, este ejercicio es tan valioso: porque reúne voluntades alrededor de una visión de largo plazo que debe trascender los gobiernos y convertirse en una hoja de ruta para el desarrollo del departamento”, afirmó.",
      "La agenda continuará este jueves con el Taller de Construcción Participativa del municipio de Armenia, que se llevará a cabo en la Alcaldía y contará con la participación del gabinete municipal y concejales de la ciudad. Este espacio permitirá identificar desafíos, oportunidades y apuestas estratégicas para el futuro del territorio, contribuyendo a la construcción de una visión compartida de largo plazo.",
      "Las actividades hacen parte del proceso participativo que impulsa Horizonte Quindío Prospectiva 2050, una iniciativa que busca construir, junto con la ciudadanía y los diferentes sectores del departamento, una hoja de ruta que oriente las decisiones estratégicas del Quindío hacia el año 2050.",
],
    etiquetas: ["Cartografía Social"],
    publicado: true,
    destacado: false,
    publicadoEn: "2026-06-10T09:00:00.000Z",
  },
  {
    slug: "la-construccion-de-la-vision-quindio-2050-entra-en-su-etapa-mas-importante",
    titulo: "La construcción de la Visión Quindío 2050 entra en su etapa más importante",
    categoria: "Avances",
    autor: "Equipo Horizonte Quindío 2050",
    fecha: "2026-06-11",
    imagen: null,
    resumen: "El proyecto avanza hacia la consolidación del diagnóstico prospectivo y la siguiente fase metodológica.",
    contenido: [
      "La construcción de la visión Quindío 2050 entra en su etapa más importante",
      "Armenia, Quindío, 11 de junio de 2026. La Segunda Misión Técnica de CEPAL–ILPES continuó este jueves con una agenda enfocada en la evaluación de avances con el comité técnico, la articulación institucional y la preparación de la siguiente fase de Horizonte Quindío Prospectiva 2050, iniciativa que busca construir una visión compartida de largo plazo para el departamento.",
      "La jornada inició con las sesiones del Comité Directivo y del Comité Técnico, espacios en los que participaron representantes de las once organizaciones que integran la alianza multiinstitucional que lidera este ejercicio de planificación estratégica para el futuro del Quindío.",
      "Durante ambos encuentros, el equipo técnico de CEPAL–ILPES presentó un balance positivo de los avances alcanzados durante la segunda misión técnica y compartió recomendaciones para el desarrollo de las próximas etapas del proceso. Asimismo, se destacó que el proyecto se encuentra en un momento clave de transición entre el diagnóstico territorial y la construcción del diagnóstico prospectivo.",
      "Actualmente, CEPAL adelanta la revisión técnica de más de 520 documentos e insumos recopilados durante las diferentes actividades desarrolladas en el territorio. Este trabajo permitirá consolidar la información necesaria para identificar los principales factores que incidirán en el futuro del departamento y fortalecer la construcción de escenarios de largo plazo.",
      "Durante las sesiones se resaltó la importancia de avanzar desde la evidencia y la información recopilada hacia la construcción de conocimiento prospectivo, integrando la experiencia, el conocimiento técnico y las visiones de los diferentes actores del territorio. De igual manera, se reiteró la necesidad de continuar fortaleciendo la participación de instituciones, sectores productivos, academia, organizaciones sociales y ciudadanía, con el propósito de garantizar una visión legítima y representativa para todo el departamento.",
      "En horas de la tarde, la agenda se trasladó a la Alcaldía de Armenia, donde se realizó el Taller de Construcción Participativa del Municipio de Armenia con la participación del gabinete municipal y concejales de la ciudad. El espacio permitió analizar el papel de la capital quindiana en la construcción de la Visión Quindío 2050, así como identificar elementos clave para fortalecer la articulación entre la planeación",
      "La concejal de Armenia, Steffanny Castellanos Muñoz, destacó la importancia de construir una visión de ciudad que integre las necesidades y expectativas de todos los sectores del territorio. “Definitivamente ese es el ejercicio. Yo creo que hoy hay que planear una ciudad con todos y para todos. Que hoy estén participando cada uno de los sectores: el académico, el empresarial, el político, el público, el privado y las instituciones educativas. Si logramos escuchar y aterrizar las necesidades de cada uno de los ciudadanos y materializarlas en oportunidades para el municipio de Armenia, esa es la planeación a la que tenemos que llegar y esa es la forma en la que estamos llamados a construir nuestro territorio”,",
      "La agenda de la Segunda Misión Técnica de CEPAL–ILPES continuará este viernes con el Coloquio del Curso de Prospectiva Territorial para el Quindío y Armenia, que se realizará en la sede Granada de Comfenalco Quindío. Este espacio permitirá compartir reflexiones, aprendizajes y aportes construidos durante el proceso formativo que ha acompañado el desarrollo de Horizonte Quindío Prospectiva 2050.",
      "En horas de la tarde se llevará a cabo un Taller de Cartografía Social con jóvenes y colectivos sociales del departamento, con el propósito de incorporar sus visiones, experiencias y expectativas frente al futuro del territorio, fortaleciendo así el carácter participativo y plural de la construcción de la Visión Quindío 2050.",
],
    etiquetas: ["Diagnóstico"],
    publicado: true,
    destacado: false,
    publicadoEn: "2026-06-11T09:00:00.000Z",
  },
  {
    slug: "mas-de-450-personas-se-sumaron-a-la-construccion-de-la-vision-quindio-2050-durante-la-segunda-mision-tecnica-de-cepal-il",
    titulo: "Más de 450 personas se sumaron a la construcción de la Visión Quindío 2050 durante la Segunda Misión Técnica de CEPAL-ILPES",
    categoria: "Avances",
    autor: "Equipo Horizonte Quindío 2050",
    fecha: "2026-06-12",
    imagen: null,
    resumen: "La Segunda Misión Técnica de CEPAL-ILPES culminó con la certificación de 93 participantes del Curso de Prospectiva Territorial y una jornada de cartografía social con jóvenes y colectivos ambientales. Durante seis días de trabajo, más de 450 personas participaron en actividades que fortalecieron la construcción de la Visión Quindío 2050.",
    contenido: [
      "Más de 450 personas se sumaron a la construcción de la Visión Quindío 2050 durante la Segunda Misión Técnica de CEPAL-ILPES",
      "Armenia, Quindío, 12 de junio de 2026. Con la certificación de 93 participantes del Curso de Prospectiva Territorial para Armenia y el Quindío y la realización de una mesa de cartografía social con jóvenes y colectivos ambientales, culminó este viernes la Segunda Misión Técnica de CEPAL-ILPES en el marco de Horizonte Quindío Prospectiva 2050.",
      "Durante seis días de trabajo, más de 450 personas participaron en recorridos territoriales, talleres, encuentros institucionales, espacios de formación y ejercicios de construcción colectiva que permitieron avanzar en la identificación de los principales desafíos y oportunidades que marcarán el futuro del Quindío.",
      "La agenda inició con recorridos por diferentes municipios del departamento, permitiendo al equipo técnico de CEPAL-ILPES conocer de primera mano las dinámicas sociales, económicas, ambientales e institucionales del territorio.",
      "Posteriormente, se desarrollaron reuniones con actores estratégicos, talleres participativos, encuentros con autoridades locales, mesas de trabajo y espacios de formación que consolidaron insumos fundamentales para la construcción de la Visión Quindío 2050.",
      "La misión también contempló espacios de diálogo con representantes de los sectores público, privado, académico, social y comunitario, fortaleciendo el carácter participativo de Horizonte Quindío Prospectiva 2050 y promoviendo la articulación entre actores clave para la construcción de una visión de futuro compartida para el departamento.",
      "La jornada de cierre inició con el Coloquio del Curso de Prospectiva Territorial para Armenia y el Quindío, un espacio de reflexión, intercambio de experiencias y socialización de aprendizajes construidos durante el proceso formativo. En este escenario se certificó a 93 participantes que asumieron el reto de pensar el futuro de Armenia y del Quindío desde una perspectiva estratégica y de largo plazo.",
      "Durante el coloquio se presentaron algunos de los principales hallazgos del ejercicio prospectivo adelantado para la construcción de la Visión Quindío 2050. Entre las principales palancas de transformación identificadas se encuentran la formación del talento humano, la transformación digital, la sostenibilidad ambiental, la innovación, la seguridad hídrica, la participación ciudadana y una gobernanza basada en datos.",
      "Asimismo, se reconocieron desafíos relacionados con el desempleo, la informalidad, la fuga de talento, el cambio climático, el desabastecimiento hídrico, las brechas territoriales y digitales, la migración juvenil, la desigualdad y el fortalecimiento de la confianza institucional.",
      "Alejandro Miranda Santamaría, graduado del programa Trabajo Social de la Universidad del Quindío, destacó la importancia de este ejercicio para fortalecer la participación ciudadana y la construcción colectiva de futuro.",
      "\"Es una oportunidad que tenemos como municipio y departamento para centrarnos y pensar realmente hacia dónde queremos ir como comunidad. Este espacio nos permite cuestionarnos como ciudadanos y entender qué estamos haciendo por nuestra ciudad y nuestro departamento. También es importante que estos ejercicios lleguen a los territorios y a las comunidades para fortalecer una cultura prospectiva y de participación\", afirmó.",
      "Por su parte, Camila Lugo Robledo, de la Empresa de Energía del Quindío, resaltó el valor de construir una visión compartida más allá de los periodos de gobierno. \"Fue una experiencia muy valiosa porque nos pone en un escenario de pensar el futuro del departamento y de Armenia. Más allá de una administración, este debe ser un ejercicio prospectivo que genere impactos importantes y duraderos para nuestro territorio\", señaló.",
      "En horas de la tarde, la agenda terminó en la Corporación Autónoma Regional del Quindío con una mesa de cartografía aocial que reunió a más de 50 jóvenes y colectivos ambientales del departamento.",
      "El encuentro permitió recoger sus visiones, expectativas y preocupaciones frente al futuro del territorio, fortaleciendo la inclusión de nuevas generaciones en la construcción de la Visión Quindío 2050.",
      "La jornada también dejó reflexiones positivas entre los participantes. “Fue un espacio donde, a pesar de tener diferentes perspectivas, pudimos dialogar sobre las problemáticas y fortalezas del departamento, especialmente en lo social y ambiental, e identificar aspectos clave para construir el futuro del Quindío”, destacó Valeria Urrea Orozco, joven del municipio de Salento e integrante del movimiento social.",
      "Con el cierre de esta segunda misión técnica, Horizonte Quindío Prospectiva 2050 entra en una etapa clave de transición entre el diagnóstico territorial y la construcción del diagnóstico prospectivo. Este proceso permitirá consolidar la información recopilada a través de los recorridos territoriales, los espacios participativos y los aportes de los diferentes actores del departamento para identificar los factores estratégicos que incidirán en el futuro del Quindío y avanzar en la construcción de escenarios de largo plazo que orienten la toma de decisiones hacia el año 2050.",
],
    etiquetas: ["Horizonte Quindío 2050", "CEPAL-ILPES", "Prospectiva Territorial", "Visión Quindío 2050", "Participación Ciudadana", "Cartografía Social", "Curso de Prospectiva"],
    publicado: true,
    destacado: false,
    publicadoEn: "2026-06-12T09:00:00.000Z",
  },
  {
    slug: "filandia-montenegro-circasia-y-armenia-nutrieron-la-vision-quindio-2050",
    titulo: "Filandia, Montenegro, Circasia y Armenia nutrieron la Visión Quindío 2050",
    categoria: "Municipios",
    autor: "Equipo Horizonte Quindío 2050",
    fecha: "2026-07-10",
    imagen: null,
    resumen: "Los municipios aportaron información clave mediante talleres de construcción participativa y cartografía social.",
    contenido: [
      "Filandia, Montenegro, Circasia y Armenia nutrieron la visión Quindío 2050 Armenia, Quindío, 10 de julio de 2026. Horizonte Quindío Prospectiva 2050 continúa consolidando el diagnóstico territorial y prospectivo del departamento mediante los talleres de construcción participativa y cartografía social que se desarrollan en los municipios a través de mesas temáticas. Con la participación de líderes sociales, autoridades locales, empresarios, comerciantes, agricultores, representantes de organizaciones sociales, academia y comunidad en general, estos espacios permiten identificar las fortalezas, oportunidades, retos y potencialidades de cada territorio, insumos fundamentales para la construcción del diagnóstico de Horizonte Quindío 2050.",
      "El primer encuentro se desarrolló en el municipio de Filandia, donde participaron 72 personas. Durante la jornada, los asistentes identificaron las principales fortalezas, oportunidades, debilidades y desafíos del municipio, aportando información clave para la construcción del diagnóstico territorial y prospectivo que orientará la planeación estratégica del departamento con horizonte al año 2050.",
      "La metodología permitió generar un diálogo abierto entre los diferentes actores del territorio, promoviendo el reconocimiento de las potencialidades del municipio y los retos que deberán enfrentarse para avanzar hacia un desarrollo sostenible, competitivo e incluyente.",
      "Para Claudia Arbeláez, participante del taller en Filandia, estos espacios representan una oportunidad para que la ciudadanía sea protagonista del futuro del departamento: \"Me parece una gran oportunidad que se le brinda a la comunidad quindiana para construir, entre todos, este plan estratégico. Nuestra participación activa también es un deber. Sueño con un Quindío que en el año 2050 conserve sus recursos naturales y que responda con responsabilidad al reconocimiento que ha recibido como Paisaje Cultural Cafetero. Ese patrimonio debemos protegerlo y preservarlo para las futuras generaciones\".",
      "El recorrido continuó en Montenegro con un taller realizado en la Casa de la Cultura, donde más 40 ciudadanos (líderes comunitarios, representantes del sector productivo, academia y organizaciones sociales) participaron activamente en la identificación de los principales factores que inciden en el desarrollo del denominado Emporio Cafetero.",
      "A través del ejercicio de cartografía social, los participantes analizaron las dinámicas económicas, sociales, ambientales e institucionales del municipio, construyendo de manera colectiva una lectura del territorio que permitirá fortalecer el proceso de formulación de escenarios prospectivos para el Quindío.",
      "Sueño con que en el año 2050 el Quindío cuente con escenarios deportivos en todos los municipios y con una infraestructura capaz de potenciar nuestro talento. Montenegro tiene una gran fortaleza en la participación de niños, jóvenes y adultos en el deporte, la actividad física y la cultura, lo que nos ha permitido destacarnos a nivel nacional\", aportó Diego Pantoja, representante del sector deportivo montenegrino.",
      "En Circasia, 42 ciudadanos participaron del taller de construcción participativa y cartografía social. Geimar Herley Líbano Ruiz, integrante del Consejo Municipal de Juventud de Circasia, resaltó la importancia de estos espacios de participación para construir una visión de futuro del departamento: \"Estos talleres nos permiten pensar más allá del presente, identificar nuestras fortalezas y reconocer los retos que tenemos como territorio. Es una oportunidad para construir el Quindío que queremos dejar a las próximas generaciones\", afirmó.",
      "Sobre su visión del departamento al 2050, agregó: \"Sueño con un Quindío donde los jóvenes tengan más oportunidades, con sostenibilidad social, cultural y ambiental, y que sea un lugar ideal para vivir y disfrutar.\"",
      "La jornada concluyó en Armenia con el desarrollo del taller de la Dimensión Sociocultural – Salud e Inclusión Social, que reunió a representantes de instituciones públicas y privadas, organizaciones sociales, academia, gremios y expertos para analizar los principales retos, oportunidades y desafíos del departamento en materia de salud, bienestar e inclusión social.",
      "Cada una de las reflexiones, propuestas y aportes realizados por la ciudadanía se convierte en un insumo fundamental para consolidar un diagnóstico construido desde el territorio, basado en las realidades, necesidades y aspiraciones de quienes habitan cada uno de los municipios y que servirá como base para la formulación de la Visión Quindío 2050.",
      "La agenda de la próxima semana Horizonte Quindío Prospectiva 2050 continuará durante la próxima semana su recorrido por el departamento con nuevos espacios de construcción participativa. El martes 14 de julio se desarrollará el taller municipal de cartografía social en Calarcá y se realizará la segunda sesión de la Dimensión Ambiental; el miércoles 15 de julio el recorrido llegará a Córdoba; el jueves 16 de julio se realizará en Armenia la primera sesión de la Dimensión Sociocultural, enfocada en educación, formación y trayectoria socioeducativa; y el viernes 17 de julio los talleres municipales se harán en Quimbaya y Salento, además de la segunda sesión de la Dimensión Sociocultural, dedicada a Cultura, deporte, recreación e identidad territorial y juventudes.",
      "Actualmente, Horizonte Quindío Prospectiva 2050 avanza en la fase de diagnóstico territorial y prospectivo, una etapa fundamental para comprender las dinámicas sociales, económicas, ambientales, institucionales y culturales de los 12 municipios del departamento. La información recopilada en estos encuentros permitirá construir escenarios prospectivos y definir estrategias que orienten el desarrollo del Quindío hacia el año 2050, consolidando una visión compartida construida desde la participación ciudadana.",
],
    etiquetas: ["Talleres", "Participación"],
    publicado: true,
    destacado: false,
    publicadoEn: "2026-07-10T09:00:00.000Z",
  },
  {
    slug: "mas-de-600-ciudadanos-construyen-la-vision-quindio-2050-desde-sus-territorios",
    titulo: "Más de 600 ciudadanos construyen la Visión Quindío 2050 desde sus territorios",
    categoria: "Participación Ciudadana",
    autor: "Equipo Horizonte Quindío 2050",
    fecha: "2026-07-24",
    imagen: null,
    resumen: "La participación ciudadana fortaleció el diagnóstico territorial con talleres y mesas temáticas.",
    contenido: [
      "Más de 600 ciudadanos construyen la Visión Quindío 2050 desde sus territorios Armenia, Quindío, 24 de julio de 2026. La participación ciudadana continúa consolidándose como el eje central de Horizonte Quindío Prospectiva 2050. Durante las últimas semanas, más de 600 ciudadanos participaron en talleres de construcción colectiva, cartografía social y mesas temáticas en municipios del departamento, aportando conocimientos, experiencias y propuestas que fortalecen la construcción del diagnóstico territorial, etapa fundamental para identificar las fortalezas, desafíos y oportunidades que marcarán el futuro del Quindío.",
      "La primera jornada de actividades reunió a ciudadanos de Calarcá, Córdoba, Quimbaya y Salento, además de representantes de distintos sectores que participaron en los talleres de las dimensiones Físico Ambiental y Social Cultural, con énfasis en educación, formación, cultura, deporte, recreación e identidad territorial. Estos espacios permitieron recoger aportes sobre sostenibilidad ambiental, desarrollo social, calidad educativa, fortalecimiento del tejido comunitario y preservación de la identidad del departamento.",
      "Durante estos encuentros, Luis Eduardo García, participante de uno de los talleres municipales, expresó: \"Sueño con un Quindío próspero y unido, que sepa aprovechar de manera responsable sus recursos naturales; un territorio donde los sectores culturales y sociales estén empoderados, donde el agro reciba un gran acompañamiento y el turismo se desarrolle de forma organizada y sostenible. Imagino un departamento en el que todos sintamos que existen oportunidades de crecimiento y desarrollo. Para el año 2050, sueño con un Quindío donde todas las personas tengan acceso a la educación superior y donde nuestra mayor fortaleza siga siendo la riqueza de nuestros recursos naturales\".",
      "Nicole Loaiza, estudiante de la Institución Educativa La Adiela, destacó la importancia de involucrar a las nuevas generaciones en este ejercicio de planificación de largo plazo. \"Nunca me había detenido a pensar cómo queremos que sea el Quindío en el 2050. Hoy entiendo que todos podemos aportar desde nuestros espacios para construir un mejor futuro\".",
      "La segunda etapa del recorrido llegó a La Tebaida, Córdoba, Buenavista y Pijao, mientras que nuevos encuentros de la Dimensión Económico Productiva reunieron a representantes de las cadenas productivas del café, el plátano, los cítricos y otros cultivos, así como de los sectores transporte y economía regional. Paralelamente, un nuevo espacio de la Dimensión Social Cultural permitió continuar consolidando aportes relacionados con la cultura, el deporte, la recreación, la identidad territorial y las juventudes.",
      "En Pijao, Amparo Hurtado Osorio, presidenta de la Veeduría Ciudadana Cordillerana del Sur del Quindío y Norte del Valle, resaltó el alcance del proceso: \"Muy complacida de estar en estos talleres representando toda una subregión, porque permite que la construcción de la Prospectiva 2050 tenga una visión amplia, donde toda la comunidad participa. Aspiramos a que todos los aportes realizados en las diferentes zonas sean tenidos en cuenta para el desarrollo del Quindío y orienten los futuros procesos de planificación del departamento\".",
      "La construcción colectiva del Quindío 2050 continúa la próxima semana Una nueva agenda de talleres de construcción participativa y cartografía social convocará a actores de los sectores de Tecnologías de la Información y las Comunicaciones (TIC), Ciencia, Tecnología e Innovación (CTeI), Turismo y Café, Constructores, Infraestructura, Vivienda, Ordenamiento Territorial y Servicios Públicos, así como partidos políticos y candidatos. Estos espacios seguirán fortaleciendo el diagnóstico territorial con nuevas miradas y aportes de los diferentes sectores del departamento.",
      "Con más de 600 ciudadanos vinculados a este proceso, Horizonte Quindío Prospectiva 2050 continúa consolidando el ejercicio de participación ciudadana más ambicioso de las últimas décadas en el departamento. Los aportes recogidos en los municipios y en las mesas temáticas fortalecerán el diagnóstico territorial, permitiendo identificar las principales fortalezas, desafíos y oportunidades del Quindío desde la mirada de sus habitantes.",
],
    etiquetas: ["Ciudadanía", "Talleres"],
    publicado: true,
    destacado: false,
    publicadoEn: "2026-07-24T09:00:00.000Z",
  },
  {
    slug: "horizonte-quindio-2050-invita-a-la-ciudadania-a-construir-la-vision-de-futuro-del-departamento",
    titulo: "Horizonte Quindío 2050 invita a la ciudadanía a construir la visión de futuro del departamento",
    categoria: "Consulta Ciudadana",
    autor: "Equipo Horizonte Quindío 2050",
    fecha: "2026-07-30",
    imagen: null,
    resumen: "Se lanzó la Encuesta Ciudadana Prospectiva para conocer las prioridades y expectativas de la comunidad.",
    contenido: [
      "Horizonte Quindío 2050 invita a la ciudadanía a construir la visión de futuro del departamento Armenia, Quindío, 28 de julio de 2026. La construcción del futuro del departamento comienza con la voz de quienes lo habitan. Por ello, Horizonte Quindío Prospectiva 2050 puso en marcha la Encuesta Ciudadana Prospectiva, una consulta digital que busca conocer las percepciones, prioridades, expectativas y propuestas de la ciudadanía para la construcción de la Visión Quindío 2050.",
      "Esta iniciativa hace parte de la Consulta Ampliada, una estrategia participativa que se desarrolla en el marco de la fase diagnóstica del proyecto y que cuenta con el acompañamiento metodológico de la Comisión Económica para América Latina y el Caribe (CEPAL), a través del Instituto Latinoamericano y del Caribe de Planificación Económica y Social (ILPES).",
      "A través de esta encuesta, los habitantes de los doce municipios del departamento podrán expresar cómo imaginan el Quindío del futuro, cuáles consideran que son los principales desafíos del territorio y qué acciones deberían impulsarse para avanzar hacia un desarrollo sostenible, competitivo e incluyente.",
      "La participación es sencilla. Los ciudadanos solo deben escanear el código QR dispuesto en las piezas oficiales de la campaña o ingresar al enlace habilitado para responder el formulario desde cualquier dispositivo con acceso a internet.",
      "La información recopilada será un insumo fundamental para fortalecer el diagnóstico estratégico del departamento y contribuir a la formulación de escenarios prospectivos que orientarán la construcción de la Visión Quindío 2050.",
      "Horizonte Quindío Prospectiva 2050 invita a toda la ciudadanía, organizaciones sociales, sector empresarial, academia, gremios, instituciones públicas y comunidad en general a participar activamente en este ejercicio colectivo, porque cada respuesta aporta a la construcción del Quindío que queremos dejar a las próximas generaciones.",
],
    etiquetas: ["Encuesta", "Participación"],
    publicado: true,
    destacado: false,
    publicadoEn: "2026-07-30T09:00:00.000Z",
  },
];;


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
  logoUrl: null,
  logoTitulo: "Horizonte Quindío",
  logoSubtitulo: "Prospectiva 2050",
  navLinks: [
    { label: "Inicio", href: "/" },
    { label: "El proyecto", href: "/proyecto" },
    { label: "Dimensiones", href: "/dimensiones" },
    { label: "Documentos", href: "/documentos" },
    { label: "Repositorio", href: "/repositorio" },
    { label: "Noticias", href: "/noticias" },
    { label: "Participa", href: "/participa" },
    { label: "Contáctanos", href: "/contactos" },
  ],
  legal: {
    responsable: "",
    nit: "",
    direccion: "",
    ciudad: "",
    correoArco: "",
    plazoConservacion: "",
    quienesAcceden: "",
    actualizado: "",
  },
};

/**
 * Contenido de la portada: el hero y las secciones que van desde ahí hasta antes
 * del pie de página.
 *
 * Hasta ahora esto estaba escrito en el código del frontend. Es la **semilla**,
 * no la fuente de verdad: el backoffice lo edita bloque a bloque en Ajustes, y el
 * frontend guarda su propia copia como respaldo (`PORTADA`) para cuando la API
 * falle o no haya nada guardado. Los dos tienen que decir lo mismo, pero no
 *_read_ uno del otro: el frontend no puede importar del backend, ni al revés.
 *
 * Los valores vacíos son válidos y significan "usa el texto del sitio", nunca
 * "sin texto". Ver la nota de `config_site.home`.
 *
 * **Las tres imágenes se siembran en `null`, no con la ruta del sitio.** Un
 * `null` es "no hay imagen puesta": el sitio usa la suya (el respaldo `PORTADA`
 * del frontend) y el panel muestra «La del sitio» sin botón de deshacer. Si en
 * cambio se sembraran con `"/images/hero-city.jpg"` —que es literalmente la
 * misma foto que trae el sitio—, el panel la mostraría como una imagen subida
 * por el usuario, con su botón «Usar la del sitio» al lado; al pulsarlo se
 * volvería a la misma foto y parecería que el botón no hace nada. Sembrar
 * `null` deja las imágenes en el estado en el que de verdad son opcionales.
 */
export const SEED_HOME = {
  hero: {
    fondo: null,
    imagen: null,
    botonTexto: "Explorar más »",
    botonColor: "lima" as const,
    cajaTitulo: "¿Tienes alguna pregunta o quieres darnos una recomendación?",
    // El «Enviar» va sobre la caja lima, así que no puede ser lima. `verde` es el
    // color con el que estaba escrito en el código.
    cajaBotonColor: "verde" as const,
  },
  proyecto: {
    fondo: null,
    titulo: "El proyecto",
    texto:
      "Un ejercicio participativo con catorce entidades y la CEPAL para construir la visión de largo plazo del departamento.",
    tarjetaBoton: "Explorar más >>",
    botonColor: "lima" as const,
    dimsTitulo: "Las cuatro dimensiones",
    dimsTexto:
      "Cuatro lecturas del territorio que estructuran la lectura del Quindío. Toca una para desplegar su resumen.",
    accionTitulo: "Del diagnóstico a la acción",
  },
  // La página «El proyecto» (/proyecto). Debe coincidir con `PORTADA.elProyecto`
  // del frontend, igual que el resto de la portada.
  elProyecto: {
    fondo: null,
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
    // CEPAL va en la lista —no aparte— porque desde el panel se reordena todo:
    // es la entidad del acompañamiento técnico y en `/proyecto` sale pintada de
    // lima por tener "CEPAL" en el nombre, sin importar el puesto.
    entidades: [
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
      "CEPAL — ILPES (acompañamiento técnico)",
    ],
  },
  cobertura: {
    titulo: "Todo el departamento participa",
    texto:
      "La visión del 2050 se construye para el Quindío completo, no solo para Armenia.",
  },
  documentos: {
    titulo: "Documentos y publicaciones",
    texto:
      "Acceso público a los documentos del proceso: convenios, informes, memorias, boletines y piezas de socialización. Explora cada categoría del repositorio.",
    botonColor: "lima" as const,
  },
  // La sección oscura del repositorio en la portada. `{total}` lo sustituye el
  // sitio por el número real de documentos publicados.
  repositorio: {
    titulo: "El inventario documental del territorio",
    texto:
      "Más de {total} documentos de referencia sobre el Quindío: planes, informes, acuerdos, boletines y piezas de socialización, agrupados en las cuatro dimensiones del proceso.",
    dashboardBoton: "Dashboard del repositorio",
    dashboardColor: "lima" as const,
    catalogoBoton: "Explorar al catálogo",
  },
  noticias: {
    titulo: "Noticias",
    texto:
      "Comunicados, talleres, convocatorias y avances del ejercicio de prospectiva territorial.",
    botonTexto: "Ver todas",
    botonColor: "lima" as const,
    tarjetaBotonColor: "lima" as const,
  },
  contacto: {
    titulo: "Contactos",
    texto:
      "Escríbenos para más información sobre el ejercicio de prospectiva, los talleres o las convocatorias abiertas del departamento.",
    formTitulo: "Escríbenos para más información",
    // El bloque de contacto es el único que **no** es lima: su botón del
    // teléfono y su "Enviar" son de tinta, y sembrarlos en lima cambiaría el
    // aspecto del sitio en una instalación nueva sin que nadie lo pidiera. Es
    // el color con el que estaban escritos en el código.
    botonColor: "tinta" as const,
    enviarColor: "tinta" as const,
  },
  // La columna del pie que sí se elige desde el panel (las tarjetas de «El
  // proyecto»). Vacía significa "el sitio muestra las suyas", así que en una
  // base nueva se siembran las mismas seis páginas que trae el frontend por
  // defecto (`FOOTER_PROYECTO_FALLBACK` en frontend/src/data/site.ts), para que
  // el panel las muestre marcadas y ordenables, no vacío. Si cambia aquí o allá,
  // hay que cambiarlo **en los dos sitios**: la semilla la usa la base nueva y
  // el respaldo lo usa el frontend cuando la lista está vacía.
  footer: {
    enlaces: [
      { label: "Qué es Horizonte Quindío 2050", href: "/proyecto/que-es" },
      { label: "Contexto y justificación", href: "/proyecto/contexto" },
      { label: "Objetivo", href: "/proyecto/objetivo" },
      { label: "Gobernanza", href: "/proyecto/gobernanza" },
      { label: "Principios y valores", href: "/proyecto/principios" },
      { label: "Línea de tiempo", href: "/proyecto/linea-de-tiempo" },
    ],
    // El texto de la barra inferior del pie. El guion es el largo (—) y no un
    // guion corto: es el que trae el sitio por defecto. Si se cambia aquí, hay
    // que cambiarlo también en `FOOTER_COPYRIGHT` del frontend
    // (`frontend/src/data/site.ts`), que es el respaldo cuando la base no lo
    // trae.
    copyright: "Horizonte Quindío 2050 — Todos los derechos reservados",
  },
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

/**
 * Los doce municipios del departamento del Quindío, en orden alfabético.
 *
 * El `dato` y la `descripcion` son el texto de apoyo de la sección de cobertura
 * territorial. La participación se construye para todo el departamento y no solo
 * para Armenia, y eso se cuenta con nombres propios: el nombre de cada municipio
 * y qué aporta al ejercicio.
 *
 * Los dos campos son opcionales y se editan desde el panel, así que estas frases
 * son un punto de partida, no un texto definitivo.
 */
export const SEED_MUNICIPIOS: SeedMunicipio[] = [
  {
    nombre: "Armenia",
    dato: "Capital del departamento",
    descripcion:
      "Sede de la Gobernación, la Cámara de Comercio y la Universidad del Quindío. Concentra buena parte de la academia y del aparato público departamental, y es el punto de encuentro de los doce municipios.",
  },
  {
    nombre: "Buenavista",
    dato: "Eje agropecuario del sur",
    descripcion:
      "Municipio del sur quindiano, con una base económica basada en la agricultura y la ganadería. Aporta al ejercicio la mirada del territorio rural y de la relación entre el campo y la ciudad.",
  },
  {
    nombre: "Calarcá",
    dato: "Cuna del movimiento obrero agrario",
    descripcion:
      "Cuna del movimiento obrero agrario del departamento. Lleva al ejercicio la memoria de la lucha por la tierra y del liderazgo campesino quindiano.",
  },
  {
    nombre: "Circasia",
    dato: "Portal del eje cafetero",
    descripcion:
      "Paso obligado hacia el eje cafetero y el Cañón del Río La Vieja. Es un municipio con presencia fuerte de turismo rural y de naturaleza.",
  },
  {
    nombre: "Córdoba",
    dato: "Patrimonio y saberes ancestrales",
    descripcion:
      "Reconocido por su arquitectura patrimonio y por la producción artesanal de alimentos. Aporta al ejercicio los aprendizajes del conocimiento tradicional del territorio.",
  },
  {
    nombre: "Filandia",
    dato: "Reserva de la biosfera",
    descripcion:
      "Conformado por varias veredas, es el municipio más conservado del departamento y hace parte de la reserva de la biosfera. Es una referencia nacional en la gestión del territorio.",
  },
  {
    nombre: "Génova",
    dato: "Frontera cafetera",
    descripcion:
      "Ubicado en la franja cafetera del límite con Risaralda. Su participación conecta la experiencia del Quindío con la del resto del eje cafetero.",
  },
  {
    nombre: "La Tebaida",
    dato: "Corredor de la próxima década",
    descripcion:
      "Municipio joven, formado en 1986, que ha crecido al ritmo de la expansión del valle. Es hoy el principal corredor de crecimiento entre Armenia y el sur del departamento.",
  },
  {
    nombre: "Montúbel",
    dato: "Bosque alto y agua",
    descripcion:
      "El de mayor altura del departamento, con su casco urbano por encima de los mil metros. Su bosque alto y sus fuentes de agua son la referencia del ejercicio frente al cambio climático.",
  },
  {
    nombre: "Pijao",
    dato: "Cultura cafetera ancestral",
    descripcion:
      "Su arquitectura y su tradición cafetera ancestral, compartidas con Salento, son la base del patrimonio cultural del territorio rural.",
  },
  {
    nombre: "Quimbaya",
    dato: "Corredor vial y turístico",
    descripcion:
      "Puerta de entrada al corredor vial entre Armenia y Pereira, y una de las principales destinaciones turísticas del departamento.",
  },
  {
    nombre: "Salento",
    dato: "Patrimonio cafetero de altura",
    descripcion:
      "Pueblo patrimonio de la arquitectura cafetera. Es la sede de la Explotación Rural Nacional del Parque del Café, y el escenario de referencia del turismo de la Serranía de los Nevados.",
  },
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

/**
 * Dimensiones y bloques de apoyo del proyecto.
 *
 * `tipo` separa lo que el documento de arquitectura define como las **4
 * dimensiones de análisis** de los bloques de contenido que las acompañan
 * (misiones, retos, iniciativas, hallazgos). Antes venían 8 filas del mismo
 * tipo y en la web parecían 8 dimensiones, cuando solo 4 lo son.
 *
 * El texto de las dimensiones viene del documento de arquitectura del proyecto
 * (descripción, retos principales y líneas de trabajo de cada eje).
 *
 * NOTA SOBRE `charts`: el documento de arquitectura NO aporta cifras para
 * estas dimensiones. Antes había series con datos inventados (2018: 42, 2020:
 * 48…) presentados como si fueran reales, lo cual es engañoso en un sitio
 * institucional. Se dejan vacías a la espera de que el equipo técnico entregue
 * las series reales; el frontend simplemente no dibuja la sección sin ellas.
 */
export const SEED_DIMENSIONES: SeedDimension[] = [
  // ══════════════════════════════════════════════════════════════════════
  // LAS 4 DIMENSIONES DE ANÁLISIS
  // ══════════════════════════════════════════════════════════════════════
  {
    slug: "politico-institucional",
    title: "Dimensión político-institucional",
    short: "Político-institucional",
    tipo: "dimension",
    icon: "target",
    summary:
      "Gobernanza territorial, institucionalidad pública y privada, planeación, participación ciudadana y seguridad pública.",
    body: [
      "Este eje analiza la gobernanza territorial, la institucionalidad pública y privada, la planeación, la participación ciudadana, la seguridad pública y la capacidad de coordinación entre organizaciones.",
      "El proyecto busca fortalecer la articulación institucional entre niveles de gobierno y actores del territorio, mejorar la capacidad de planeación pública y seguimiento a largo plazo, promover una gobernanza más abierta, coordinada y participativa, e integrar la vigilancia tecnológica y el análisis de tendencias en la toma de decisiones.",
    ],
    layers: [
      "Gobernanza territorial y ejercicio político",
      "Institucionalidad pública y gremial",
      "Planeación y gestión territorial",
      "Participación ciudadana y control social",
      "Seguridad pública y gobernabilidad",
    ],
    steps: [
      { n: "01", title: "Articular los niveles de gobierno" },
      { n: "02", title: "Mejorar la planeación pública" },
      { n: "03", title: "Abrir la gobernanza a la participación" },
      { n: "04", title: "Integrar vigilancia tecnológica" },
    ],
    charts: [],
  },
  {
    slug: "economica-productiva",
    title: "Dimensión económico-productiva",
    short: "Económico-productiva",
    tipo: "dimension",
    icon: "chart",
    summary:
      "Caficultura, turismo, agroindustria, nuevas economías, emprendimiento, innovación y transición productiva.",
    body: [
      "Este eje examina la estructura económica del Quindío, con énfasis en caficultura, turismo, agroindustria, nuevas economías, emprendimiento, innovación, transición productiva y transformación digital.",
      "Los retos principales son diversificar y fortalecer la base productiva del departamento, potenciar cadenas de valor con mayor innovación y competitividad, anticipar los efectos de la automatización, la inteligencia artificial y la transición energética, y consolidar apuestas productivas estratégicas con visión de largo plazo.",
    ],
    layers: [
      "Caficultura y agroindustria",
      "Turismo y economía creativa",
      "Bioeconomía y economía del cuidado",
      "Inteligencia artificial y transformación digital productiva",
      "Emprendimiento, innovación y economía circular",
    ],
    steps: [
      { n: "01", title: "Diversificar la base productiva" },
      { n: "02", title: "Potenciar cadenas de valor" },
      { n: "03", title: "Anticipar automatización y transición energética" },
      { n: "04", title: "Consolidar apuestas estratégicas" },
    ],
    charts: [],
  },
  {
    slug: "fisico-ambiental",
    title: "Dimensión físico-ambiental",
    short: "Físico-ambiental",
    tipo: "dimension",
    icon: "leaf",
    summary:
      "Sistema físico-biótico, cambio climático, recursos hídricos, biodiversidad, gestión del riesgo y sostenibilidad.",
    body: [
      "Este eje aborda el sistema físico-biótico del departamento, el cambio climático, los recursos hídricos, la biodiversidad, la gestión del riesgo, el ordenamiento territorial, la movilidad, la infraestructura y la sostenibilidad ambiental.",
      "Los retos principales son proteger y regenerar los ecosistemas estratégicos, reducir vulnerabilidades frente al cambio climático y el riesgo, articular el desarrollo urbano, la infraestructura y el ordenamiento territorial, e integrar herramientas SIG y análisis espacial para mejorar la lectura territorial.",
    ],
    layers: [
      "Cambio climático y adaptación territorial",
      "Biodiversidad y sostenibilidad ecosistémica",
      "Recursos hídricos y gestión ambiental",
      "Ordenamiento territorial y desarrollo urbano",
      "Infraestructura, vivienda, servicios públicos y gestión del riesgo",
    ],
    steps: [
      { n: "01", title: "Proteger los ecosistemas estratégicos" },
      { n: "02", title: "Reducir la vulnerabilidad al clima y al riesgo" },
      { n: "03", title: "Articular desarrollo urbano e infraestructura" },
      { n: "04", title: "Integrar SIG y análisis espacial" },
    ],
    charts: [],
  },
  {
    slug: "socio-cultural",
    title: "Dimensión socio-cultural",
    short: "Socio-cultural",
    tipo: "dimension",
    icon: "users",
    summary:
      "Estructura social, calidad de vida, educación, salud, equidad, identidades territoriales, juventud y cohesión social.",
    body: [
      "Este eje analiza la estructura social del Quindío, la calidad de vida, la educación, la salud, la equidad, las identidades territoriales, la juventud, la diversidad y la cohesión social.",
      "Los retos principales son mejorar el bienestar, la inclusión y la calidad de vida; reconocer la diversidad social, cultural y generacional del territorio; fortalecer la participación de comunidades y grupos poblacionales diversos; e incorporar las voces del territorio en la construcción de futuro.",
    ],
    layers: [
      "Salud y calidad de vida",
      "Educación y comunidad educativa",
      "Demografía e inclusión social",
      "Género, diversidad e identidades",
      "Juventud, cultura, historia, artes, deporte y convivencia",
    ],
    steps: [
      { n: "01", title: "Mejorar el bienestar y la inclusión" },
      { n: "02", title: "Reconocer la diversidad del territorio" },
      { n: "03", title: "Fortalecer la participación de las comunidades" },
      { n: "04", title: "Incorporar las voces del territorio" },
    ],
    charts: [],
  },

  // ══════════════════════════════════════════════════════════════════════
  // BLOQUES DE APOYO (no son dimensiones)
  // ══════════════════════════════════════════════════════════════════════
  {
    slug: "misiones",
    title: "Misiones del proceso",
    short: "Misiones",
    tipo: "bloque",
    icon: "trophy",
    summary: "Las cinco misiones que articulan el desarrollo del estudio prospectivo.",
    body: [
      "Las misiones son los instrumentos de trabajo del proceso. Cada una agrupa un conjunto de actividades que se ejecutan de manera articulada y que, en conjunto, llevan desde el diagnóstico hasta la capacidad instalada en el territorio.",
    ],
    layers: [
      "Misión de diagnóstico",
      "Misión de visión",
      "Misión de escenarios",
      "Misión estratégica",
      "Misión de institucionalización",
    ],
    steps: [
      { n: "01", title: "Diagnóstico: comprender el presente con rigor técnico y territorial" },
      { n: "02", title: "Visión: construir una aspiración compartida de futuro al 2050" },
      { n: "03", title: "Escenarios: explorar futuros posibles y sus implicaciones" },
      { n: "04", title: "Estratégica: convertir la visión en prioridades, acciones y hoja de ruta" },
      { n: "05", title: "Institucionalización: dejar capacidad instalada para que el proceso continúe" },
    ],
    charts: [],
  },
  {
    slug: "retos",
    title: "Retos transversales",
    short: "Retos",
    tipo: "bloque",
    icon: "alert",
    summary: "Condiciones comunes que el proceso debe atender en todas sus dimensiones.",
    body: [
      "Los retos transversales atraviesan las cuatro dimensiones y condicionan el éxito de todo el estudio. No pertenecen a un eje en particular: son condiciones que el proceso debe resolver de manera transversal.",
    ],
    layers: [
      "Participación amplia, representativa y continua",
      "Traducir el lenguaje técnico a mensajes claros",
      "Mantener memoria, trazabilidad y acceso a la información",
      "Asegurar continuidad institucional más allá del convenio",
      "Hacer del sitio una herramienta viva de comunicación",
    ],
    steps: [
      { n: "01", title: "Garantizar participación amplia y representativa" },
      { n: "02", title: "Traducir el lenguaje técnico a la ciudadanía" },
      { n: "03", title: "Mantener memoria y trazabilidad" },
      { n: "04", title: "Asegurar continuidad institucional" },
      { n: "05", title: "Sostener el sitio como herramienta viva" },
    ],
    charts: [],
  },
  {
    slug: "iniciativas",
    title: "Iniciativas y fichas por dimensión",
    short: "Iniciativas",
    tipo: "bloque",
    icon: "folder",
    summary:
      "Espacio para registrar las iniciativas y fichas que se construyan sobre cada eje del proyecto.",
    body: [
      "Este bloque reúne las iniciativas y fichas que el equipo técnico elabore a partir del trabajo de cada dimensión. Se alimenta a medida que avancen los productos del estudio.",
    ],
    layers: [],
    steps: [],
    charts: [],
  },
  {
    slug: "hallazgos",
    title: "Hallazgos y tendencias",
    short: "Hallazgos",
    tipo: "bloque",
    icon: "file",
    summary:
      "Espacio para consolidar los hallazgos, señales débiles y tendencias que surjan del diagnóstico.",
    body: [
      "Este bloque consolida los hallazgos del diagnóstico: tendencias globales, nacionales y locales, señales débiles e incertidumbres críticas identificadas para el departamento.",
    ],
    layers: [],
    steps: [],
    charts: [],
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
  /**
   * Contraseña inicial, o null para generarla al vuelo.
   *
   * null significa "una contraseña aleatoria que solo se muestra una vez". Es
   * lo que hay que usar siempre: una contraseña fija en el repositorio acaba
   * publicada en internet en cuanto el repo es público, y con ella entra
   * cualquiera como administrador. Ya pasó con 'Admin123*', que llegó a
   * producción y se podía usar para iniciar sesión en el panel.
   *
   * Cuando la semilla pone null, el seeder genera una contraseña aleatoria de
   * 20 caracteres, la siembra y la imprime en el log una única vez. Esos logs
   * solo los ve quien tenga acceso al servidor, que es justo quien puede
   * cambiar la contraseña desde el backoffice.
   */
  password: string | null;
  role: 'admin' | 'editor';
};

export const SEED_USERS: SeedUser[] = [
  {
    // Credencial temporal acordada con el dueño de la plataforma: el correo es
    // a la vez usuario y contraseña, para que pueda entrar y cambiarla desde
    // «Mi cuenta». DEBE cambiarse: al ser el repo público, cualquiera que lea
    // este archivo conoce la contraseña.
    email: 'prospectiva@horizontequindio2050.com',
    password: 'prospectiva@horizontequindio2050.com',
    role: 'admin',
  },
];