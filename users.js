const bcrypt = require('bcryptjs');

const users = [
  //usuario 1 se almacena el usuario y la contraseña 
  {
    id: 1,
    username: 'usuario1',
    password: bcrypt.hashSync('password123', 10) // Contraseña encriptada
  },
  //usuario 2 se almacena el usuario y la contraseña 
  {
    id: 2,
    username: 'usuario2',
    password: bcrypt.hashSync('password456', 10)
  }
];

module.exports = users;
