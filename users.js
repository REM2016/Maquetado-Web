const bcrypt = require('bcryptjs'); // Importa la librería bcryptjs, que se utiliza para encriptar y comparar contraseñas

const users = [
  // Usuario 1: Se almacena el nombre de usuario y la contraseña encriptada
  {
    id: 1, // Identificador único del usuario
    username: 'usuario1', // Nombre de usuario
    password: bcrypt.hashSync('password123', 10) // Contraseña encriptada con bcrypt. El número 10 indica la cantidad de "salt rounds" (rondas de encriptación) aplicadas.
  },
  // Usuario 2: Se almacena el nombre de usuario y la contraseña encriptada
  {
    id: 2, // Identificador único del segundo usuario
    username: 'usuario2', // Nombre de usuario
    password: bcrypt.hashSync('password456', 10) // Contraseña encriptada usando bcrypt
  }
];

module.exports = users; // Exporta el array 'users' para que pueda ser utilizado en otros archivos del proyecto
