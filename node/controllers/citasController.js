
const db = require('../config/db');
const nodemailer = require('nodemailer');
const { format } = require('date-fns');
const cron = require('node-cron');

const notifyClientsOfDailyCitas = async () => {
    try {
        const today = new Date();
        const formattedToday = format(today, 'yyyy-MM-dd');

        const [citasResult] = await db.query(`
            SELECT 
                c.fecha,
                c.motivo,
                m.nombre_mascota,
                v.nombre AS nombre_veterinario,
                v.direccion,
                v.ciudad,
                v.postalCode,
                cl.email AS email_cliente
            FROM citas c
            JOIN mascotas m ON c.id_mascota = m.id_mascota
            JOIN veterinarios v ON c.id_centro = v.id
            JOIN clientes cl ON c.id_cliente = cl.id_cliente
            WHERE DATE(c.fecha) = ?`,
            [formattedToday]
        );

        if (citasResult.length === 0) {
            console.log('No hay citas para hoy.');
            return;
        }

        citasResult.forEach((cita) => {
            const cliente = { email: cita.email_cliente };
            const appointmentDetails = {
                fecha: cita.fecha,
                nombre_mascota: cita.nombre_mascota,
                nombre_veterinario: cita.nombre_veterinario,
                nombre_centro: cita.nombre_veterinario, 
                direccion: cita.direccion,
                ciudad: cita.ciudad,
                codigo_postal: cita.postalCode
            };
            
            sendConfirmationEmail(cliente, appointmentDetails);
        });

        console.log('Notificaciones de citas enviadas con éxito.');
    } catch (error) {
        console.error('Error al enviar notificaciones de citas:', error);
    }
};

cron.schedule('0 9 * * *', () => {
    console.log('Ejecutando tarea de notificación de citas...');
    notifyClientsOfDailyCitas();
});

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: '', //email de envío
      pass: '' //app password
    }
  });

const sendConfirmationEmail = (cliente, appointmentDetails) => {
    const formattedDate = format(new Date(appointmentDetails.fecha), 'dd-MM-yyyy HH:mm');
    const mailOptions = {
        from: '', //email de envío
        to: cliente.email,
        subject: 'Confirmación de Cita Veterinaria',
        text: `Hola, 
        Tu cita ha sido confirmada para el ${formattedDate}.
        Detalles:
        - Mascota: ${appointmentDetails.nombre_mascota}
        - Veterinario: ${appointmentDetails.nombre_veterinario}
        - Centro: ${appointmentDetails.nombre_centro} - ${appointmentDetails.direccion}, ${appointmentDetails.ciudad} - ${appointmentDetails.codigo_postal}
        `,
    };
    console.log('appointmentDetails:', appointmentDetails);
    console.log('correo:', cliente.email)

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error al enviar el correo:', error);
        } else {
            console.log('Correo enviado: ' + info.response);
        }
    });
};

const createCita = async (req, res) => {
    try {
        const { id_cliente, id_centro, id_mascota, fecha, motivo } = req.body;

        const formattedFecha = new Date(fecha).toISOString().slice(0, 19).replace('T', ' ');

        const result = await db.query(
            'INSERT INTO citas (id_cliente, id_centro, id_mascota, fecha, motivo) VALUES (?, ?, ?, ?, ?)',
            [id_cliente, id_centro, id_mascota, formattedFecha, motivo]
        );

        const [mascotaResult] = await db.query('SELECT nombre_mascota FROM mascotas WHERE id_mascota = ?', [id_mascota]);
        const [veterinarioResult] = await db.query(`
            SELECT nombre AS nombre_veterinario, direccion, ciudad, provincia, postalCode
            FROM veterinarios
            WHERE id = ?
        `, [id_centro]);
        const [clienteResult] = await db.query('SELECT email FROM clientes WHERE id_cliente = ?', [id_cliente]);

        const mascota = mascotaResult[0];
        const veterinario = veterinarioResult[0];
        const cliente = clienteResult[0];

        console.log('mascota:', mascota);
        console.log('veterinario:', veterinario);
        console.log('cliente:', cliente);

        const appointmentDetails = {
            fecha,
            nombre_mascota: mascota.nombre_mascota,
            nombre_veterinario: veterinario.nombre_veterinario,
            nombre_centro: veterinario.nombre_veterinario,
            direccion: veterinario.direccion,
            ciudad: veterinario.ciudad,
            codigo_postal: veterinario.postalCode
        };


        sendConfirmationEmail(cliente, appointmentDetails);

        res.status(201).json({ message: 'Cita reservada con éxito', id_cita: result.insertId });
    } catch (error) {
        console.error('Error al crear la cita:', error);
        res.status(500).json({ message: 'Error al reservar la cita' });
    }
};

const getCitas = async (req, res) => {
    try {
        const { email } = req.query; 

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const [clienteResult] = await db.query(
            'SELECT id_cliente FROM clientes WHERE email = ?',
            [email]
        );

        if (clienteResult.length === 0) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const id_cliente = clienteResult[0].id_cliente;

        const [citasResult] = await db.query(
            `SELECT 
                c.id_cita,
                c.fecha,
                c.motivo,
                v.nombre AS vetCenter,
                m.nombre_mascota
            FROM citas c
            JOIN veterinarios v ON c.id_centro = v.id
            JOIN mascotas m ON c.id_mascota = m.id_mascota  
            WHERE c.id_cliente = ?`,
            [id_cliente]
        );

        if (citasResult.length === 0) {
            return res.status(404).json({ message: 'No hay citas registradas' });
        }

        const formattedCitas = citasResult.map(cita => ({
            id_cita: cita.id_cita,
            title: `${cita.motivo} - ${cita.vetCenter}`, 
            start: new Date(cita.fecha),
            end: new Date(new Date(cita.fecha).getTime() + 30 * 60 * 1000),
            nombre_mascota: cita.nombre_mascota
        }));

        res.json(formattedCitas);
    } catch (error) {
        console.error('Error fetching citas:', error);
        res.status(500).json({ message: 'Error fetching citas' });
    }
};


const deleteCita = async (req, res) => {
    try {
        const { idCita } = req.params;

        if (!idCita) {
            return res.status(400).json({ message: 'ID de cita es requerido' });
        }

        const [citaDetails] = await db.query(`
            SELECT 
                c.id_cita,
                c.fecha,
                c.motivo,
                m.nombre_mascota,
                v.nombre AS nombre_veterinario,
                v.direccion,
                v.ciudad,
                v.postalCode,
                cl.email AS email_cliente
            FROM citas c
            JOIN mascotas m ON c.id_mascota = m.id_mascota
            JOIN veterinarios v ON c.id_centro = v.id
            JOIN clientes cl ON c.id_cliente = cl.id_cliente
            WHERE c.id_cita = ?
        `, [idCita]);

        if (citaDetails.length === 0) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

        const cita = citaDetails[0];

        const [result] = await db.query('DELETE FROM citas WHERE id_cita = ?', [idCita]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

        const appointmentDetails = {
            fecha: cita.fecha,
            nombre_mascota: cita.nombre_mascota,
            nombre_veterinario: cita.nombre_veterinario,
            nombre_centro: cita.nombre_veterinario,
            direccion: cita.direccion,
            ciudad: cita.ciudad,
            codigo_postal: cita.postalCode,
        };

        const cliente = { email: cita.email_cliente };

        sendCancellationEmail(cliente, appointmentDetails);

        res.status(204).send(); 
    } catch (error) {
        console.error('Error al eliminar la cita:', error);
        res.status(500).json({ message: 'Error al eliminar la cita' });
    }
};
const sendCancellationEmail = (cliente, appointmentDetails) => {
    const formattedDate = format(new Date(appointmentDetails.fecha), 'dd-MM-yyyy HH:mm');
    const mailOptions = {
        from: '', //email de envío
        to: cliente.email,
        subject: 'Notificación de Cancelación de Cita Veterinaria',
        text: `Hola, 
        Le informamos que su cita ha sido cancelada correctamente. 
        Detalles de la cita cancelada:
        - Fecha: ${formattedDate}
        - Mascota: ${appointmentDetails.nombre_mascota}
        - Veterinario: ${appointmentDetails.nombre_veterinario}
        - Centro: ${appointmentDetails.nombre_centro} - ${appointmentDetails.direccion}, ${appointmentDetails.ciudad} - ${appointmentDetails.codigo_postal}
        
        Si deseas reprogramar tu cita, por favor contacta con nosotros.
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error al enviar el correo de cancelación:', error);
        } else {
            console.log('Correo de cancelación enviado: ' + info.response);
        }
    });
};
const formatISOtoMySQL = (date) => {
    if (!date || isNaN(new Date(date).getTime())) {
        throw new Error("Invalid date format");
    }

    const tzOffset = new Date().getTimezoneOffset() * 60000; 
    const localISOTime = new Date(new Date(date) - tzOffset).toISOString().slice(0, 19).replace('T', ' ');
    return localISOTime;
};
const updateCita = async (req, res) => {
    try {
        const { id_cita } = req.params;
        const { id_centro, id_mascota, fecha, motivo } = req.body;

        const formattedDate = formatISOtoMySQL(fecha);

        const [result] = await db.query(
            'UPDATE citas SET id_centro = ?, id_mascota = ?, fecha = ?, motivo = ? WHERE id_cita = ?',
            [id_centro, id_mascota, formattedDate, motivo, id_cita]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

        const [citaDetails] = await db.query(`
            SELECT 
                c.id_cita,
                c.fecha,
                c.motivo,
                m.nombre_mascota,
                v.nombre AS nombre_veterinario,
                v.direccion,
                v.ciudad,
                v.postalCode,
                cl.email AS email_cliente
            FROM citas c
            JOIN mascotas m ON c.id_mascota = m.id_mascota
            JOIN veterinarios v ON c.id_centro = v.id
            JOIN clientes cl ON c.id_cliente = cl.id_cliente
            WHERE c.id_cita = ?
        `, [id_cita]);

        if (citaDetails.length === 0) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

        const cita = citaDetails[0];

        const appointmentDetails = {
            fecha: cita.fecha,
            nombre_mascota: cita.nombre_mascota,
            nombre_veterinario: cita.nombre_veterinario,
            nombre_centro: cita.nombre_veterinario,
            direccion: cita.direccion,
            ciudad: cita.ciudad,
            codigo_postal: cita.codigo_postal,
        };

        const cliente = { email: cita.email_cliente };

        sendUpdateEmail(cliente, appointmentDetails);

        res.json({ message: 'Cita actualizada con éxito' });
    } catch (error) {
        console.error('Error al actualizar la cita:', error);
        res.status(500).json({ error: 'Error al actualizar la cita' });
    }
};

const sendUpdateEmail = (cliente, appointmentDetails) => {
    const formattedDate = format(new Date(appointmentDetails.fecha), 'dd-MM-yyyy HH:mm');
    const mailOptions = {
        from: '', //email de envío
        to: cliente.email,
        subject: 'Notificación de Actualización de Cita Veterinaria',
        text: `Hola, 
        Le informamos que su cita ha sido actualizada correctamente. 
        Detalles de la cita actualizada:
        - Fecha: ${formattedDate}
        - Mascota: ${appointmentDetails.nombre_mascota}
        - Veterinario: ${appointmentDetails.nombre_veterinario}
        - Centro: ${appointmentDetails.nombre_centro} - ${appointmentDetails.direccion}, ${appointmentDetails.ciudad} - ${appointmentDetails.codigo_postal}
        
        Si necesitas hacer más cambios, por favor contacta con nosotros.
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error al enviar el correo de actualización:', error);
        } else {
            console.log('Correo de actualización enviado: ' + info.response);
        }
    });
};

const getCitaById = async (req, res) => {
    try {
        const { id_cita } = req.params;

        const [rows] = await db.query(
            `SELECT citas.id_cita, citas.fecha, citas.motivo, 
                    mascotas.id_mascota, mascotas.nombre_mascota, mascotas.raza_mascota, mascotas.tipo_animal, mascotas.edad, mascotas.sexo,
                    veterinarios.id AS id_veterinario, veterinarios.nombre AS nombre_veterinario
             FROM citas 
             JOIN mascotas ON citas.id_mascota = mascotas.id_mascota
             JOIN veterinarios ON citas.id_centro = veterinarios.id
             WHERE citas.id_cita = ?`,
            [id_cita]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener la cita:', error);
        res.status(500).json({ error: 'Error al obtener la cita' });
    }
};




module.exports = {
    createCita,
    getCitas,
    deleteCita,
    updateCita,
    getCitaById
};


