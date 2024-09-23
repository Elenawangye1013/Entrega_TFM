import React from 'react';
import { Container, Grid, Card, CardContent, CardMedia, Typography, Button } from '@mui/material';
import './styles/SubscriptionPlans.css';
import plan1 from './../assets/plan1.jpg';
import plan2 from './../assets/plan2.jpg';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';



const plans = [
  {
    title: 'Plan Básico',
    description: 'Accede a todos los veterinarios de la zona, puedes registrar solamente 1 mascota, y te ofrecemos seguimiento de medicamentos y citas.',
    price: 'Gratis',
    image: plan1,
    details: [
      'Acceso a veterinarios colaboradores',
      'Registro de 1 mascota',
      'Seguimiento de citas y medicamentos',
      'Asesoramiento 24 horas con el chat de veterinario inteligente'
    ]
  },
  {
    title: 'Plan Premium',
    description: 'Incluye todos los beneficios del Plan Básico, además de acceso a servicios premium y soporte prioritario para tu mascota.',
    price: '3 € al mes',
    image: plan2,
    details: [
      'Acceso a veterinarios colaboradores con preferencia',
      'Registro de todas tus mascotas',
      'Seguimiento avanzado de citas y medicamentos',
      'Soporte prioritario',
      'Asesoramiento 24 horas con el chat de veterinario inteligente'
    ]
  },
];

const SubscriptionPlans = () => {
  return (
    <Container maxWidth="md" style={{ padding: '40px 20px', justifyContent:'center', display: 'flex', flexDirection:'column', alignItems: 'center'}}>

      <h1>Planes de Suscripción</h1>
      <Typography variant="h5" className="about-us-subtitle" gutterBottom>
        Elige el plan que mejor se adapte a tu número de mascotas
      </Typography>
      <Grid container spacing={4}>
        {plans.map((plan, index) => (
          <Grid item xs={12} key={index}>
            <Card elevation={3} style={{ display: 'flex', flexDirection: 'row', borderRadius: '10px', overflow: 'hidden' }}>
              <CardMedia
                component="img"
                height="400"
                image={plan.image}
                alt={`Imagen del ${plan.title}`}
                style={{ width: '40%', objectFit: 'cover' }}
              />
              <CardContent style={{ flex: 1, padding: '20px' }}>
                <Typography variant="h5" component="div" style={{ marginBottom: '10px', color: '#EA5141' }}>
                  {plan.title}
                </Typography>
                <Typography variant="body1" style={{ marginBottom: '10px', color: '#2D2D2D' }}>
                  {plan.description}
                </Typography>
                <ul style={{ marginBottom: '20px', paddingLeft: '20px', color: '#2D2D2D' }}>
                  {plan.details.map((detail, i) => (
                    <li key={i}>{detail}</li>
                  ))}
                </ul>
                <Typography variant="h6" component="div" style={{ marginBottom: '20px', color: '#2D2D2D' }}>
                  {plan.price}
                </Typography>
                <Link to="/login" className="no-underline">
                  <Button variant="contained" color="primary" style={{ borderRadius: '5px' }}>
                    Suscribirse
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default SubscriptionPlans;
