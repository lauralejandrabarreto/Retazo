// Datos locales de prueba de Retazo.
//
// Este archivo reemplaza los arreglos que antes estaban repetidos dentro de cada
// pantalla. Las pantallas NO importan este archivo directamente: consultan los
// datos a través de services/placesService.js, que es el punto que se sustituirá
// por la API en Ktor.
//
// Advertencias sobre el contenido:
// - Las imágenes son fotografías ILUSTRATIVAS (Unsplash) usadas como marcador de
//   posición: no son fotografías verificadas del lugar ni de la época indicada.
// - Los textos son descripciones breves de prueba. Ninguno ha sido contrastado
//   todavía con fuentes documentales, por eso `contenidoVerificado` es false y la
//   lista `fuentes` está vacía. La interfaz lo informa al usuario.

const unsplash = (id, w = 600, h = 600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format`;

const IMG = {
  plazaBolivar: '1639910310293-4b03ccac91cc',
  parqueCentral: '1637966201771-b0b251baa2ef',
  suyapa: '1682451240518-a55d229f5027',
  sabana: '1697919046731-6474a584cc20',
  museo: '1628128594359-25d5e30661dd',
  catedral: '1699177247360-3540d424e739',
  fortaleza: '1721056609609-3bcbc27e08ee',
  teatro: '1715503052107-34c1ec2ec84a',
  calleAntigua: '1645537762185-acecf1e9b5ec',
  ciudadHoy: '1568632234157-ce7aecd03d0d',
};

export const MAP_BACKGROUND = unsplash('1568632234165-47bb34c35708', 900, 500);

// Ubicación simulada del usuario (centro de Bogotá). No proviene del GPS.
export const SIMULATED_LOCATION = {
  label: 'Bogotá, Colombia',
  coords: { lat: 4.5990, lng: -74.0745 },
};

// Periodos disponibles en el filtro de la pantalla Buscar.
export const PERIODS = [
  { id: 'todos', label: 'Todos' },
  { id: 'prehispanico', label: 'Prehispánico' },
  { id: 'XVI', label: 'Siglo XVI' },
  { id: 'XVII', label: 'Siglo XVII' },
  { id: 'XVIII', label: 'Siglo XVIII' },
  { id: 'XIX', label: 'Siglo XIX' },
  { id: 'XX', label: 'Siglo XX' },
];

const historiaPendiente = (nombre) => [
  {
    titulo: 'Origen y construcción',
    texto: `Resumen de prueba sobre el origen de ${nombre}. Este apartado se completará con información contrastada en archivos y publicaciones académicas.`,
  },
  {
    titulo: 'Transformaciones del lugar',
    texto: 'Apartado pendiente: cambios arquitectónicos y urbanos documentados a lo largo del tiempo.',
  },
  {
    titulo: 'Significado cultural',
    texto: 'Apartado pendiente: valor patrimonial y relación del lugar con la memoria de la ciudad.',
  },
];

export const PLACES = [
  {
    id: 'plaza-bolivar',
    nombre: 'Plaza de Bolívar',
    sector: 'La Candelaria',
    ciudad: 'Bogotá',
    pais: 'Colombia',
    siglo: 'XVI',
    epoca: 'Siglo XVI',
    coords: { lat: 4.5981, lng: -74.0760 },
    imagen: unsplash(IMG.plazaBolivar, 300, 300),
    imagenActual: 'https://commons.wikimedia.org/wiki/Special:FilePath/Plaza_de_Bol%C3%ADvar_desde_el_Museo_de_la_Independencia.JPG?width=1280',
    fotosHistoricas: [
      { anio: '1846', uri: '/imagenes/plaza-bolivar-historica-1846.jpg' },
      { anio: '1950', uri: 'https://i.pinimg.com/736x/fc/38/74/fc38747650a917ec1d4553a9bdd7818c.jpg' },
      //{ anio: '1985', uri: null },
    ],
    descripcion:
      'Plaza principal del centro histórico de Bogotá. A su alrededor se encuentran edificaciones como el Capitolio Nacional, la Catedral Primada y el Palacio Liévano.',
    historia: [
      {
        titulo: 'Origen y construcción',
        texto:
          'El espacio corresponde a la antigua plaza mayor de la ciudad, trazada en el periodo colonial. Con el tiempo recibió el nombre del Libertador Simón Bolívar.',
      },
      {
        titulo: 'Transformaciones del lugar',
        texto:
          'Su entorno cambió con la construcción de los edificios institucionales que la rodean y con las sucesivas remodelaciones de su superficie.',
      },
      {
        titulo: 'Significado cultural',
        texto:
          'Es uno de los principales escenarios cívicos del país: allí se realizan actos oficiales, manifestaciones y eventos culturales.',
      },
    ],
    fuentes: [],
    contenidoVerificado: false,
  },
  {
    id: 'museo-oro',
    nombre: 'Museo del Oro',
    sector: 'Santa Fe',
    ciudad: 'Bogotá',
    pais: 'Colombia',
    siglo: 'XX',
    epoca: 'Siglo XX',
    coords: { lat: 4.6018, lng: -74.0721 },
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/BOG_Museo_del_Oro.JPG?width=1280',
    imagenActual: 'https://commons.wikimedia.org/wiki/Special:FilePath/BOG_Museo_del_Oro.JPG?width=1280',
    fotosHistoricas: [
      { anio: '1950', uri: 'https://images.adsttc.com/media/images/51f6/a4bf/e8e4/4ef7/d400/002a/newsletter/1_(17)_-_copia.jpg?1375118520' },
    ],
    descripcion:
      'Museo del Banco de la República dedicado a la orfebrería y a las culturas prehispánicas del territorio colombiano.',
    historia: historiaPendiente('el Museo del Oro'),
    fuentes: [],
    contenidoVerificado: false,
  },
  {
    id: 'teatro-colon',
    nombre: 'Teatro Colón',
    sector: 'La Candelaria',
    ciudad: 'Bogotá',
    pais: 'Colombia',
    siglo: 'XIX',
    epoca: 'Siglo XIX',
    coords: { lat: 4.5966, lng: -74.0743 },
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Teatro_Cristobal_Col%C3%B3n.JPG?width=1280',
    imagenActual: 'https://commons.wikimedia.org/wiki/Special:FilePath/Teatro_Cristobal_Col%C3%B3n.JPG?width=1280',
    fotosHistoricas: [
      { anio: '~ 1890', uri: 'https://www.elnuevosiglo.com.co/sites/default/files/2020-10/23ad%20foto2-oct04.jpg' },
      { anio: '~ 1940', uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwAzqAEYb4_BIA5XnHEU6wD56hmKa4zwjJ2bPQ_QpP3n74EXfNaj4QE4CD&s=10' }
    ],
    descripcion:
      'Teatro de ópera y artes escénicas ubicado en el centro histórico, inaugurado a finales del siglo XIX.',
    historia: historiaPendiente('el Teatro Colón'),
    fuentes: [],
    contenidoVerificado: false,
  },
  {
    id: 'museo-nacional',
    nombre: 'Museo Nacional de Colombia',
    sector: 'Santa Fe',
    ciudad: 'Bogotá',
    pais: 'Colombia',
    siglo: 'XIX',
    epoca: 'Siglo XIX',
    coords: { lat: 4.6155, lng: -74.0687 },
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR4vbld9ZoGJp5PB1cLG1_ZKeAecgLQkJsen5rY7n7gQ&s=10',
    imagenActual: 'https://www.infobae.com/new-resizer/w-jFlaGBM4Iu6p7FYrYHoKaG5Mo=/arc-anglerfish-arc2-prod-infobae/public/C5WZSIPOWZEF3LUHC5ENHU22PI.jpeg',
    fotosHistoricas: [
      { anio: '~ 1850', uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwzdVHfnNscK4dTulA9FluY52Y--CNtbNGQ7hlDcpAug9nfp8fS9NxB8zV&s=10' },
      { anio: '~ 1920', uri: 'https://babel.banrepcultural.org/digital/api/singleitem/image/p17054coll19/1029/default.jpg' }
    ],
    descripcion:
      'Museo fundado en el siglo XIX. Desde mediados del siglo XX funciona en el edificio que antes fue la penitenciaría conocida como el Panóptico.',
    historia: historiaPendiente('el Museo Nacional de Colombia'),
    fuentes: [],
    contenidoVerificado: false,
  },
  {
    id: 'estacion-sabana',
    nombre: 'Estación de La Sabana',
    sector: 'Los Mártires',
    ciudad: 'Bogotá',
    pais: 'Colombia',
    siglo: 'XX',
    epoca: 'Siglo XX',
    coords: { lat: 4.6037, lng: -74.0866 },
    imagen: unsplash(IMG.sabana, 300, 300),
    imagenActual: unsplash(IMG.sabana, 900, 700),
    fotosHistoricas: [
      { anio: '1960', uri: '/imagenes/estacion-sabana-historica-1960.jpg' },
    ],
    descripcion:
      'Antigua estación central del ferrocarril en Bogotá, cuyo edificio principal data de comienzos del siglo XX.',
    historia: historiaPendiente('la Estación de La Sabana'),
    fuentes: [],
    contenidoVerificado: false,
  },
  {
    id: 'parque-central',
    nombre: 'Parque Central',
    sector: 'Centro Histórico',
    ciudad: 'Tegucigalpa',
    pais: 'Honduras',
    siglo: 'XIX',
    epoca: 'Siglo XIX',
    coords: { lat: 14.1050, lng: -87.2045 },
    imagen: 'https://diarioroatan.com/wp-content/uploads/2023/12/plaza-central.jpg',
    imagenActual: 'https://diarioroatan.com/wp-content/uploads/2023/12/plaza-central.jpg',
    fotosHistoricas: [
      { anio: '1904', uri: 'https://commons.wikimedia.org/wiki/Special:FilePath/Parque_Central_de_Tegucigalpa_1904.JPG?width=1280' },
      { anio: '1950', uri: null },
    ],
    descripcion:
      'Plaza central del casco histórico de Tegucigalpa, frente a la Catedral de San Miguel Arcángel.',
    historia: historiaPendiente('el Parque Central de Tegucigalpa'),
    fuentes: [],
    contenidoVerificado: false,
  },
  {
    id: 'catedral-san-miguel',
    nombre: 'Catedral de San Miguel Arcángel',
    sector: 'Centro Histórico',
    ciudad: 'Tegucigalpa',
    pais: 'Honduras',
    siglo: 'XVIII',
    epoca: 'Siglo XVIII',
    coords: { lat: 14.1052, lng: -87.2041 },
    imagen: 'https://commons.wikimedia.org/wiki/Special:FilePath/Inside_St._Michael_Archangel_Cathedral_Tegucigalpa.jpg?width=600',
    imagenActual: 'https://commons.wikimedia.org/wiki/Special:FilePath/Catedral_Metropolitana_de_San_Miguel_Arc%C3%A1ngel_de_Tegucigalpa.jpg?width=1280',
    fotosHistoricas: [
      { anio: '1904', uri: 'https://commons.wikimedia.org/wiki/Special:FilePath/Parque_Central_de_Tegucigalpa_1904.JPG?width=1280' },
      { anio: '1970', uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5Z_muny3bk-u8xcOJ_c-ZNbovmkMVR_8OAQ_okC-tt2ost_vyT4UOnCm1&s=10' },
    ],
    descripcion:
      'Catedral de estilo barroco colonial construida durante el siglo XVIII en el centro de Tegucigalpa.',
    historia: historiaPendiente('la Catedral de San Miguel Arcángel'),
    fuentes: [],
    contenidoVerificado: false,
  },
  {
    id: 'basilica-suyapa',
    nombre: 'Basílica de Suyapa',
    sector: 'Suyapa',
    ciudad: 'Tegucigalpa',
    pais: 'Honduras',
    siglo: 'XX',
    epoca: 'Siglo XX',
    coords: { lat: 14.0870, lng: -87.1640 },
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCSp3SVbpwDPGtYcxw0HpogrNIc9gbCAbTJbNkpXLnjZVJPv_u52-qrRo&s=10',
    imagenActual: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/47/38/50/basilica-de-suyapa.jpg?w=1200&h=-1&s=1',
    fotosHistoricas: [
      { anio: '1973', uri: '/imagenes/basilica-suyapa-historica-1973.jpg' },
    ],
    descripcion:
      'Santuario dedicado a la Virgen de Suyapa. Su construcción comenzó a mediados del siglo XX y es un importante centro de peregrinación.',
    historia: [
      {
        titulo: 'Origen y construcción',
        texto:
          'La devoción está vinculada al hallazgo de la imagen de la Virgen de Suyapa en el siglo XVIII. El templo actual se construyó posteriormente para recibir a los peregrinos.',
      },
      {
        titulo: 'Transformaciones del lugar',
        texto:
          'Su entorno ha cambiado con el crecimiento de Tegucigalpa y con el aumento de visitantes durante las festividades religiosas.',
      },
      {
        titulo: 'Significado cultural',
        texto:
          'Es uno de los principales símbolos religiosos de Honduras, asociado con la devoción a la Virgen de Suyapa.',
      },
    ],
    fuentes: [],
    contenidoVerificado: false,
  },
  {
    id: 'catedral-comayagua',
    nombre: 'Catedral de Comayagua',
    sector: 'Centro',
    ciudad: 'Comayagua',
    pais: 'Honduras',
    siglo: 'XVII',
    epoca: 'Siglo XVII',
    coords: { lat: 14.4597, lng: -87.6390 },
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdcDwkaLGQozYLgwNMSRBx54ykYVD4mFtToethkBCZBTfDO3KL437DLiM&s=10',
    imagenActual: 'https://images.trvl-media.com/place/553248621532964659/01ed5c0d-2344-4b9d-827b-81c950306c1f.jpg',
    fotosHistoricas: [
      { anio: '~ 1881', uri: 'https://commons.wikimedia.org/wiki/Special:FilePath/Catedral_de_Comayagua_1881.png?width=1280' },
      { anio: '~ 1950', uri: 'https://commons.wikimedia.org/wiki/Special:FilePath/Catedral_de_Comayagua_siglo_XX.jpg?width=1280' },
    ],
    descripcion:
      'Catedral colonial de la antigua capital de Honduras, conocida por el reloj antiguo de su torre.',
    historia: historiaPendiente('la Catedral de Comayagua'),
    fuentes: [],
    contenidoVerificado: false,
  },
  {
    id: 'fortaleza-san-fernando',
    nombre: 'Fortaleza de San Fernando',
    sector: 'Omoa',
    ciudad: 'Omoa',
    pais: 'Honduras',
    siglo: 'XVIII',
    epoca: 'Siglo XVIII',
    coords: { lat: 15.7745, lng: -88.0373 },
    imagen: unsplash(IMG.fortaleza, 300, 300),
    imagenActual: unsplash(IMG.fortaleza, 900, 700),
    fotosHistoricas: [
      { anio: '~ 1900', uri: 'https://maravillashonduras.wordpress.com/wp-content/uploads/2013/06/7c009-fort_omoa_photo.jpg?w=548&h=214' },
    ],
    descripcion:
      'Fortificación colonial construida en el siglo XVIII en la costa caribeña de Honduras para defender el puerto de Omoa.',
    historia: historiaPendiente('la Fortaleza de San Fernando de Omoa'),
    fuentes: [],
    contenidoVerificado: false,
  },
];
