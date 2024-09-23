const db = require('../config/db');
const nodemailer = require('nodemailer');
const { format } = require('date-fns');
const cron = require('node-cron');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: '', //email de envío
        pass: '' // Contraseña de aplicación
    },
    debug: true, 
    logger: true 
});

const sendMedicationReminderEmail = (cliente, medicamentos) => {
    const formattedToday = format(new Date(), 'dd-MM-yyyy');

    let medicationList = medicamentos.map(medicamento => {
        return `- ${medicamento.nombre_medicamento} para ${medicamento.nombre_mascota}:\n  Dosis: ${medicamento.dosis}\n  Notas: ${medicamento.notas}\n  Hora: ${medicamento.hora_toma}\n`;
    }).join('\n');

    const mailOptions = {
        from: '',
        to: cliente.email,
        subject: 'Recordatorio Diario de Medicamentos',
        text: `Hola ${cliente.nombre},\n\nEste es un recordatorio de los medicamentos que tu mascota(s) debe(n) tomar hoy, ${formattedToday}:\n\n${medicationList}\nPor favor, asegúrate de administrar los medicamentos a tiempo.`,
    };

    console.log('Enviando correo a:', cliente.email);
    console.log('Opciones del correo:', mailOptions);

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error al enviar el correo:', error);
        } else {
            console.log('Correo enviado: ' + info.response);
        }
    });
};

const getClientsWithMedications = async () => {
    try {
        const today = new Date();
        const formattedToday = format(today, 'yyyy-MM-dd');

        const [clientes] = await db.query(`
            SELECT DISTINCT c.id_cliente, c.nombre, c.email
            FROM clientes c
            JOIN medicamentos m ON c.id_cliente = m.id_cliente
            WHERE DATE(m.fecha_inicio) <= CURDATE()
            AND DATE(m.fecha_fin) >= CURDATE()
        `);

        if (clientes.length === 0) {
            console.log('No hay clientes con medicamentos pendientes para hoy');
            return [];
        }

        const clientsWithMedications = await Promise.all(clientes.map(async (cliente) => {
            const [medicamentos] = await db.query(`
                SELECT m.*, mas.nombre_mascota
                FROM medicamentos m
                JOIN mascotas mas ON m.id_mascota = mas.id_mascota
                WHERE m.id_cliente = ?
                AND DATE(m.fecha_inicio) <= CURDATE()
                AND DATE(m.fecha_fin) >= CURDATE()
            `, [cliente.id_cliente]);

            return {
                ...cliente,
                medicamentos
            };
        }));

        return clientsWithMedications;
    } catch (error) {
        console.error('Error al obtener clientes con medicamentos:', error);
        throw error;
    }
};

const notifyClientsOfDailyMedications = async () => {
    try {
        const clientsWithMedications = await getClientsWithMedications();

        clientsWithMedications.forEach((client) => {
            sendMedicationReminderEmail(client, client.medicamentos);
        });

        console.log('Notificaciones de medicamentos enviadas con éxito.');
    } catch (error) {
        console.error('Error al enviar recordatorios de medicamentos:', error);
    }
};

cron.schedule('0 9 * * *', () => {
    console.log('Ejecutando tarea de notificación de medicamentos...');
    notifyClientsOfDailyMedications();
});


const addMedicamento = async (req, res) => {
    try {
        const { id_cliente, id_mascota, nombre_medicamento, dosis, fecha_inicio, fecha_fin, hora_toma, intervalo_toma, notas } = req.body;
        console.log('Datos recibidos:', req.body);
        const newMedicamento = await db.query(
            `INSERT INTO medicamentos (id_cliente, id_mascota, nombre_medicamento, dosis, fecha_inicio, fecha_fin, hora_toma, intervalo_toma, notas)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id_cliente, id_mascota, nombre_medicamento, dosis, fecha_inicio, fecha_fin, hora_toma, intervalo_toma, notas]
        );

        res.status(201).json({ message: 'Medicamento registrado correctamente', id_medicamento: newMedicamento.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar medicamento' });
    }
};

const getMedicamentos = async (req, res) => {
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
            console.log('Client not found for email:', email);
            return res.status(404).json({ message: 'Client not found' });
        }

        const id_cliente = clienteResult[0].id_cliente;

        const [medicamentosResult] = await db.query(
            `SELECT 
                m.*, 
                mas.nombre_mascota 
             FROM 
                medicamentos m 
             JOIN 
                mascotas mas 
             ON 
                m.id_mascota = mas.id_mascota 
             WHERE 
                m.id_cliente = ?`,
            [id_cliente]
        );

        if (medicamentosResult.length === 0) {
            console.log('No medicamentos found for client ID:', id_cliente);
            return res.status(404).json({ message: 'No medicamentos found' });
        }


        res.json(medicamentosResult);
    } catch (error) {
        console.error('Error fetching medicamentos:', error);
        res.status(500).json({ message: 'Error fetching medicamentos' });
    }
};

const deleteMedicamento = async (req, res) => {
    try {
        const { id_medicamento } = req.params;

        if (!id_medicamento) {
            return res.status(400).json({ message: 'ID de medicamento es requerido' });
        }

        const [result] = await db.query('DELETE FROM medicamentos WHERE id_medicamento = ?', [id_medicamento]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Medicamento no encontrado' });
        }

        // Enviar respuesta exitosa
        res.status(200).json({ message: 'Medicamento eliminado correctamente' });
    } catch (error) {
        console.error('Error eliminando medicamento:', error);
        res.status(500).json({ message: 'Error eliminando medicamento' });
    }
};

const updateMedicamento = async (req, res) => {
    try {
        const { id_medicamento } = req.params;
        const { nombre_medicamento, dosis, fecha_inicio, fecha_fin, hora_toma, intervalo_toma, notas } = req.body;

        const formattedFechaInicio = new Date(fecha_inicio).toISOString().slice(0, 10);  
        const formattedFechaFin = new Date(fecha_fin).toISOString().slice(0, 10);  

        const [existingMedicamento] = await db.query(
            'SELECT * FROM medicamentos WHERE id_medicamento = ?',
            [id_medicamento]
        );

        if (existingMedicamento.length === 0) {
            return res.status(404).json({ message: 'Medicamento not found' });
        }

        await db.query(
            `UPDATE medicamentos 
             SET nombre_medicamento = ?, dosis = ?, fecha_inicio = ?, fecha_fin = ?, hora_toma = ?, intervalo_toma = ?, notas = ?
             WHERE id_medicamento = ?`,
            [nombre_medicamento, dosis, formattedFechaInicio, formattedFechaFin, hora_toma, intervalo_toma, notas, id_medicamento]
        );

        res.status(200).json({ message: 'Medicamento updated successfully' });
    } catch (error) {
        console.error('Error updating medicamento:', error);
        res.status(500).json({ message: 'Error updating medicamento' });
    }
};

module.exports = {
    addMedicamento,
    getMedicamentos,
    deleteMedicamento,
    updateMedicamento
};
