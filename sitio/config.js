/* ================================================================
   CONFIGURACIÓN DEL EVENTO: es el único archivo que necesitas editar.
   ================================================================ */
window.RF_CONFIG = {

  /* 1) Pega aquí la configuración de tu proyecto de Firebase.
        Consola de Firebase > engrane > Configuración del proyecto >
        Tus apps > app web > "Configuración del SDK" > opción "Config".
        Ya está conectada al proyecto rv-reformas-2027
        (cuenta Invitaciones Ruvalcaba).                          */
  firebase: {
    apiKey: "AIzaSyDI4cu3mohXvg8fqHEOjrc8inthsQXaCGs",
    authDomain: "rv-reformas-2027.firebaseapp.com",
    databaseURL: "https://rv-reformas-2027-default-rtdb.firebaseio.com",
    projectId: "rv-reformas-2027",
    storageBucket: "rv-reformas-2027.firebasestorage.app",
    messagingSenderId: "23377855923",
    appId: "1:23377855923:web:0a443a275dd445a082f7c6"
  },

  /* 2) Datos del evento. Las horas van con zona horaria (-06:00 es
        Guadalajara). Si algo cambia, se actualiza en las tres páginas. */
  evento: {
    nombre: "Reformas Fiscales 2027",
    inicio: "2026-12-03T16:00:00-06:00",
    fin: "2026-12-03T19:30:00-06:00",
    lugar: "Hotel RIU, Guadalajara",
    mapa: "https://www.google.com/maps/search/?api=1&query=Hotel+Riu+Plaza+Guadalajara",

    /* Correo para dudas y cancelaciones. Si lo dejas vacío, no se muestra. */
    contacto: "",

    /* Enlace al aviso de privacidad del despacho. Si lo dejas vacío, no se muestra. */
    avisoPrivacidad: "",

    /* Inicio de los folios de los pases (RF27-XXXXXX). */
    prefijoFolio: "RF27"
  }
};
