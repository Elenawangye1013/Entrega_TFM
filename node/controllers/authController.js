const pool = require('../config/db');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const nodemailer = require('nodemailer');

exports.register = async (req, res) => {
  const { nombre, apellido, email, password, tipo_plan } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Hashed Password:', hashedPassword);

    const [result] = await pool.query(
      'INSERT INTO clientes (nombre, apellido, email, contrasena, tipo_plan) VALUES (?, ?, ?, ?, ?)', 
      [nombre, apellido, email, hashedPassword, tipo_plan]
    );

    console.log('Insert Result:', result);
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error('Error registro de usuario:', error);
    return res.status(500).json({ message: "Error registro de usuario", error: error.message });
  }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const [results] = await pool.query('SELECT * FROM clientes WHERE email = ?', [email]);
  
      if (results.length === 0) {
        return res.status(401).json({ message: "Email o contraseña inválidos. Email no encontrado" });
      }
  
      const user = results[0];
  
      const match = await bcrypt.compare(password, user.contrasena);
  
      if (match) {
        return res.status(200).json({ message: "Login correcto" });
      } else {
        return res.status(401).json({ message: "Email o contraseña inválidos." });
      }
    } catch (error) {
      console.error('Error al comparar passwords:', error);
      return res.status(500).json({ message: "Error al comparar passwords", error: error.message });
    }
  };

exports.getUserData = async (req, res) => {
  try {
    const email = req.query.email; 

    if (!email) {
      return res.status(400).json({ message: 'Email requerido' });
    }


    const [userResults] = await pool.query('SELECT * FROM clientes WHERE email = ?', [email]);
    const user = userResults[0];
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const [petResults] = await pool.query('SELECT * FROM mascotas WHERE id_cliente = ?', [user.id_cliente]);

    res.json({ user, pets: petResults });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.changePlan =  async (req, res) => {
  const { email, newPlan } = req.body;
  console.log('email:',email)
  try {
    await pool.query('UPDATE clientes SET tipo_plan = ? WHERE email = ?', [newPlan, email]);
    res.json({ message: 'Plan cambiado correctamente' });
  } catch (error) {
    console.error('Error cambio plan:', error);
    res.status(500).json({ message: 'Error cambio plan' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('authToken'); 
  res.status(200).json({ message: 'Logout correcto' });
};

exports.contactForm = async (req, res) => {
  const { name, email, subject, message } = req.body;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
          user: '', // Email de envío
          pass: '' // Contraseña de aplicación
      },
      debug: true, 
      logger: true 
    });

  const mailOptions = {
    from: '', //email de envío
    to: email, 
    subject: 'Confirmación de recepción de su mensaje',
    text: `Hola ${name},\n\nGracias por contactarnos. Hemos recibido su mensaje con el asunto "${subject}". Nos pondremos en contacto con usted a la mayor brevedad posible.\n\nMensaje:\n${message}\n\nSaludos,\nPetmate`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email enviado' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
};