const express = require('express'); 
const jwt = require('jsonwebtoken'); // Librería para generar y verificar JWT
const bcrypt = require('bcryptjs'); // Librería para encriptar y verificar contraseñas
const dotenv = require('dotenv'); // Cargar variables de entorno desde un archivo .env
const users = require('./users'); // Archivo con los usuarios simulados (debemos suponer que contiene información de usuarios)

dotenv.config(); // Cargar las variables de entorno desde el archivo .env

const app = express(); // Inicializa la aplicación Express
const port = process.env.PORT || 3001; // Usa el puerto de las variables de entorno, o por defecto el puerto 3001

// Middleware para parsear el cuerpo de las solicitudes en formato JSON
app.use(express.json()); 

// Almacén temporal de OTPs generados para los usuarios
let otpStorage = {};

// Ruta de login: genera el JWT y OTP
app.post('/login', async (req, res) => {
  const { username, password } = req.body; // Extrae el nombre de usuario y contraseña del cuerpo de la solicitud
  const user = users.find(u => u.username === username); // Busca al usuario en la lista de usuarios simulados

  // Si el usuario existe y la contraseña es correcta
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Genera un token JWT válido por 1 hora
    const otp = Math.floor(100000 + Math.random() * 900000); // Genera un OTP aleatorio de 6 dígitos
    otpStorage[user.id] = otp; // Guarda el OTP generado para el usuario temporalmente
    console.log(`OTP generado para el usuario ${user.id}: ${otp}`); // Simula el envío del OTP al usuario (en la consola)
    res.json({ token, otp }); // Envía el JWT y el OTP al cliente
  } else {
    res.status(401).json({ message: 'Credenciales incorrectas' }); // Devuelve un error si las credenciales no son válidas
  }
});

// Middleware para verificar el token JWT
function verificarToken(req, res, next) {
  const bearerHeader = req.headers['authorization']; // Extrae el encabezado 'Authorization' de la solicitud
  if (typeof bearerHeader !== 'undefined') {
    const bearerToken = bearerHeader.split(' ')[1]; // Obtiene el token JWT del encabezado
    req.token = bearerToken; // Guarda el token en la solicitud
    next(); // Continúa con la siguiente función de middleware o ruta
  } else {
    res.sendStatus(403); // Devuelve "Prohibido" si no hay token en la solicitud
  }
}

// Ruta protegida de ejemplo
app.get('/protected', verificarToken, (req, res) => {
  jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => { // Verifica si el token es válido
    if (err) {
      res.sendStatus(403); // Si el token es inválido o ha expirado, devuelve "Prohibido"
    } else {
      res.json({ message: 'Acceso concedido', authData }); // Devuelve los datos de autenticación si el token es válido
    }
  });
});

// Ruta para validar OTP y realizar la transferencia bancaria
app.post('/transferir', verificarToken, (req, res) => {
  const { monto, cuentaDestino, otp } = req.body; // Extrae monto, cuenta de destino y OTP del cuerpo de la solicitud
  const decoded = jwt.verify(req.token, process.env.JWT_SECRET); // Verifica y decodifica el token JWT
  const userId = decoded.id; // Obtiene el ID del usuario autenticado a partir del token JWT

  // Verifica si el OTP ingresado es correcto para el usuario autenticado
  if (otpStorage[userId] && otpStorage[userId] === parseInt(otp)) {
    // Simula la transferencia
    console.log(`Transferencia de ${monto} a la cuenta ${cuentaDestino} realizada exitosamente por el usuario ${userId}`);

    // Elimina el OTP después de su uso
    delete otpStorage[userId];

    res.json({ success: true, message: 'Transferencia realizada con éxito' }); // Responde que la transferencia fue exitosa
  } else {
    res.status(400).json({ success: false, message: 'OTP incorrecto o expirado' }); // Si el OTP no es válido, devuelve un error
  }
});

// Ruta opcional para verificar OTP sin hacer una transferencia (solo para validación)
app.post('/validar-otp', verificarToken, (req, res) => {
  const { otp } = req.body; // Extrae el OTP del cuerpo de la solicitud
  const decoded = jwt.verify(req.token, process.env.JWT_SECRET); // Verifica el token JWT
  const userId = decoded.id; // Obtiene el ID del usuario

  // Verifica si el OTP ingresado es correcto
  if (otpStorage[userId] && otpStorage[userId] === parseInt(otp)) {
    res.json({ message: 'OTP validado correctamente' }); // OTP es válido
  } else {
    res.status(400).json({ message: 'OTP incorrecto o expirado' }); // OTP no válido
  }
});

// Servir archivos estáticos (por ejemplo, HTML, CSS, JS) desde la carpeta "public"
const path = require('path');
app.use(express.static(path.join(__dirname, 'public'))); // Configura la carpeta de archivos estáticos

// Inicia el servidor en el puerto definido
app.listen(port, () => {
  console.log(`Servidor corriendo en: http://localhost:${port}`); // Muestra en consola la URL donde el servidor está corriendo
});
