const bcrypt = require('bcryptjs');

const users = [
  {
    id: 1,
    username: 'usuario1',
    password: bcrypt.hashSync('password123', 10) // Contraseña encriptada
  },
  {
    id: 2,
    username: 'usuario2',
    password: bcrypt.hashSync('password456', 10)
  }
];

module.exports = users;
