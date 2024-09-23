import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Grid, Paper } from '@mui/material';
import './styles/Contact.css';
import FAQ from '../components/FAQ';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5001/api/auth/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Mensaje enviado con éxito. Se ha enviado un correo de confirmación.');
      } else {
        alert('Hubo un problema al enviar su mensaje. Por favor, inténtelo de nuevo más tarde.');
      }
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      alert('Hubo un problema al enviar su mensaje. Por favor, inténtelo de nuevo más tarde.');
    }
  };

  return (
    <Container component="main" maxWidth="md" className="contact-container">
      <Paper elevation={3} className="contact-paper">
        <Typography variant="h4" gutterBottom align="center">
          Contacta con Nosotros
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Información de Contacto</Typography> <br />
            <Typography variant="body1">
              Si tienes alguna pregunta o inquietud, no dudes en contactarnos a través de los siguientes medios:
            </Typography> <br />
            <Typography variant="body1" gutterBottom>
              <strong>Dirección:</strong> Calle Madrid, Madrid, España
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Teléfono:</strong> (34) 911 888 000
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Correo Electrónico:</strong> contacto@petmate.com
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Envíanos un Mensaje</Typography>
            <form noValidate autoComplete="off" onSubmit={handleSubmit}>
              <TextField
                label="Nombre"
                name="name"
                variant="outlined"
                fullWidth
                margin="normal"
                required
                value={formData.name}
                onChange={handleChange}
              />
              <TextField
                label="Correo Electrónico"
                name="email"
                variant="outlined"
                fullWidth
                margin="normal"
                required
                value={formData.email}
                onChange={handleChange}
              />
              <TextField
                label="Asunto"
                name="subject"
                variant="outlined"
                fullWidth
                margin="normal"
                required
                value={formData.subject}
                onChange={handleChange}
              />
              <TextField
                label="Mensaje"
                name="message"
                variant="outlined"
                fullWidth
                margin="normal"
                multiline
                rows={4}
                required
                value={formData.message}
                onChange={handleChange}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                className="contact-button"
              >
                Enviar Mensaje
              </Button>
            </form>
          </Grid>
        </Grid>
      </Paper>
      <FAQ />
    </Container>
  );
};

export default Contact;
