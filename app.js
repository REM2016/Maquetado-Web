const express = require('express'); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const users = require('./users'); // Archivo con usuarios simulados

dotenv.config(); // Cargar las variables de entorno

const app = express();
const port = process.env.PORT || 3001;

// Middleware para parsear JSON
app.use(express.json());

// Almacenar temporalmente los OTPs generados para los usuarios
let otpStorage = {};

// Ruta de login: Genera JWT y OTP
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const otp = Math.floor(100000 + Math.random() * 900000); // Generar OTP
    otpStorage[user.id] = otp; // Almacenar OTP temporalmente
    console.log(`OTP generado para el usuario ${user.id}: ${otp}`); // Simular el envío de OTP (consola)
    res.json({ token, otp }); // Enviar token JWT y OTP en la respuesta
  } else {
    res.status(401).json({ message: 'Credenciales incorrectas' });
  }
});

// Middleware para verificar el JWT
function verificarToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearerToken = bearerHeader.split(' ')[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403); // Prohibido
  }
}

// Ruta protegida (ejemplo)
app.get('/protected', verificarToken, (req, res) => {
  jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      res.json({ message: 'Acceso concedido', authData });
    }
  });
});

// Ruta para validar OTP y realizar la transferencia bancaria
app.post('/transferir', verificarToken, (req, res) => {
  const { monto, cuentaDestino, otp } = req.body;
  const decoded = jwt.verify(req.token, process.env.JWT_SECRET);
  const userId = decoded.id; // Obtener el ID del usuario autenticado con JWT

  // Verificar si el OTP ingresado es válido
  if (otpStorage[userId] && otpStorage[userId] === parseInt(otp)) {
    // Transferencia simulada
    console.log(`Transferencia de ${monto} a la cuenta ${cuentaDestino} realizada exitosamente por el usuario ${userId}`);

    // Eliminar el OTP después de ser validado
    delete otpStorage[userId];

    res.json({ success: true, message: 'Transferencia realizada con éxito' });
  } else {
    res.status(400).json({ success: false, message: 'OTP incorrecto o expirado' });
  }
});

// Ruta para verificar OTP de manera independiente (opcional)
app.post('/validar-otp', verificarToken, (req, res) => {
  const { otp } = req.body;
  const decoded = jwt.verify(req.token, process.env.JWT_SECRET);
  const userId = decoded.id;

  if (otpStorage[userId] && otpStorage[userId] === parseInt(otp)) {
    res.json({ message: 'OTP validado correctamente' });
  } else {
    res.status(400).json({ message: 'OTP incorrecto o expirado' });
  }
});

// Servir archivos estáticos (HTML, CSS)
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Servidor corriendo en: http://localhost:${port}`);
});
