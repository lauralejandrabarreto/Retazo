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
    imagenActual: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Plaza_de_Bol%C3%ADvar_desde_el_Museo_de_la_Independencia.JPG?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original',
    fotosHistoricas: [
      { anio: '1846', uri: 'https://www.utadeo.edu.co/sites/tadeo/files/node/wysiwyg/plaza_mayordebogota.1846.edward.wallhouse_mark_-coleccion.banco_.de_.la_.republica.jpg' },
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
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/BOG_Museo_del_Oro.JPG?utm_source=es.wikipedia.org&utm_campaign=index&utm_content=original',
    imagenActual: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/BOG_Museo_del_Oro.JPG?utm_source=es.wikipedia.org&utm_campaign=index&utm_content=original',
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
    imagen: 'https://bogota.gov.co/sites/default/files/2019-03/archivo_instituto_distrital_de_turismo_12.jpg',
    imagenActual: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Teatro_Cristobal_Col%C3%B3n.JPG?utm_source=es.wikipedia.org&utm_campaign=index&utm_content=original',
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
      { anio: '1960', uri: 'https://scontent.ftgu3-4.fna.fbcdn.net/v/t39.30808-6/494683416_735917832192728_7462988334583427310_n.jpg?stp=dst-jpg_tt6&cstp=mx720x936&ctp=p526x296&_nc_cat=107&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=sFMFjXGlx7gQ7kNvwF1rqz5&_nc_oc=Adq0YSCVVX3P2gS9V_TbqrOLJoe1MpkSPom7RmThuu-oKJ8tMTMCAi9Zfpq6bBhv5X8&_nc_zt=23&_nc_ht=scontent.ftgu3-4.fna&_nc_gid=tKHJK9v2vhF2zpIFFlLO1w&_nc_ss=7b289&oh=00_AQPX2yoUlpMz4v3Btx9W-F7v1UVG6BBkA5239-dKjKIAkg&oe=6AE4B603' },
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
      { anio: '1883', uri: 'https://scontent.ftgu3-3.fna.fbcdn.net/v/t39.30808-6/527787669_24206570408999362_1794793955454114525_n.jpg?stp=dst-jpg_tt6&cstp=mx1125x798&ctp=s720x720&_nc_cat=103&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=LkTxBu4ixoIQ7kNvwESoO-E&_nc_oc=Adp9LUvDnumx0diab_Sp7VxhUOk-0PUWmaVRVQKAHbjsiyVgBjdtV4vQ8_uITUZWnAE&_nc_zt=23&_nc_ht=scontent.ftgu3-3.fna&_nc_gid=klSJc5dVfBq25E6Vujy0ZQ&_nc_ss=7b289&oh=00_AQMKoJKa6TC_bURXrSo_5_kXNi2ZOBcE1GNoWCNrGaNnWQ&oe=6AE4DD3A' },
      { anio: '1950', uri: 'https://scontent.ftgu3-4.fna.fbcdn.net/v/t39.30808-6/565786717_10172286005785517_1155195831033608567_n.jpg?stp=dst-jpg_tt6&cstp=mx794x534&ctp=s794x534&_nc_cat=101&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=127cfc&_nc_ohc=7tifzZ3upGwQ7kNvwElQjA5&_nc_oc=AdoDiKma-neYzM2axZQUE9ezZ8PAYF84NBIdlLOe7U50R8QX1-QwLuF-NpsLogrtVEQ&_nc_zt=23&_nc_ht=scontent.ftgu3-4.fna&_nc_gid=Ap9e4J2zsTTgFH1IjkW-oA&_nc_ss=7b289&oh=00_AQMTC9iDGNQUhpXzO_V2ZqQmT-i01BiJgjKfH_Gq71VlKQ&oe=6AE4D321' },
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
    imagen: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1a/Inside_St._Michael_Archangel_Cathedral_Tegucigalpa.jpg/330px-Inside_St._Michael_Archangel_Cathedral_Tegucigalpa.jpg?utm_source=es.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    imagenActual: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Catedral_Metropolitana_de_San_Miguel_Arc%C3%A1ngel_de_Tegucigalpa.jpg?utm_source=es.wikipedia.org&utm_campaign=index&utm_content=original',
    fotosHistoricas: [
      { anio: '1889', uri: 'https://scontent.ftgu3-4.fna.fbcdn.net/v/t39.30808-6/483102505_662285806294106_8262968863749489950_n.jpg?stp=dst-jpg_tt6&cstp=mx1485x1194&ctp=s640x640&_nc_cat=109&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=p9ba-RgbjKsQ7kNvwHEPKq1&_nc_oc=Adpdiu3JwOd8HUCjy30aUxClLNtbGlUcoHAryn2vuNTd8LFmsJ39Fd2MPQVRDEeXN_0&_nc_zt=23&_nc_ht=scontent.ftgu3-4.fna&_nc_gid=H3IBL4376EoUC0cPQneglQ&_nc_ss=7b289&oh=00_AQNqdN9vHbnsvRpFwTwV_sYIrwfzcW0xpbYCePJRHmtVEQ&oe=6AE4D59C' },
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
      { anio: '1973', uri: 'https://scontent.ftgu3-3.fna.fbcdn.net/v/t39.99422-6/753418320_2229800371119541_345133690155013292_n.png?stp=dst-jpg_tt6&cstp=mx747x552&ctp=s747x552&_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=127cfc&_nc_ohc=aXH0_AGxvI8Q7kNvwFKWjJo&_nc_oc=AdryjDPVEQf4-5qGd2uBzBV8q4Nf2p7oqIRsiwWnokEr4K19zpIMNLuYWHZQcR8j0vI&_nc_zt=14&_nc_ht=scontent.ftgu3-3.fna&_nc_gid=_fzsQCq9jrDCcw1TcmPrDQ&_nc_ss=7b289&oh=00_AQMdem4wpaYzYVBWZLx4nweeZGUP5g18kvsZjxviQcTEkA&oe=6AE4AFED' },
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
      { anio: '~ 1881', uri: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Catedral_de_Comayagua_1881.png?utm_source=es.wikipedia.org&utm_campaign=index&utm_content=original' },
      { anio: '~ 1950', uri: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Catedral_de_Comayagua_siglo_XX.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original' },
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
