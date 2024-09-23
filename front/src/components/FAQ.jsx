import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import './FAQ.css'; 

const FAQ = () => {
  return (
    <div className="faq-container">
      <Typography variant="h4" className="faq-title" gutterBottom>
        Preguntas Frecuentes
      </Typography>
      <Accordion className="faq-accordion">
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h6" className="faq-question">¿Cómo funciona el servicio?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography className="faq-answer">
            Nuestro servicio proporciona una plataforma para gestionar las necesidades de tus mascotas, incluyendo reservas de servicios y seguimiento de salud.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion className="faq-accordion">
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography variant="h6" className="faq-question">¿Cuáles son los planes de suscripción?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography className="faq-answer">
            Ofrecemos varios planes de suscripción que se adaptan a las necesidades de tu mascota, desde planes básicos hasta premium.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion className="faq-accordion">
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3a-content"
          id="panel3a-header"
        >
          <Typography variant="h6" className="faq-question">¿Cómo puedo contactar con el soporte?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography className="faq-answer">
            Puedes contactar con nuestro soporte a través de la sección de contacto en nuestra página web o enviando un correo electrónico a soporte@petmate.com.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion className="faq-accordion">
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel4a-content"
          id="panel4a-header"
        >
          <Typography variant="h6" className="faq-question">¿El servicio está disponible en mi área?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography className="faq-answer">
            Puedes verificar la disponibilidad de nuestro servicio en tu área introduciendo tu código postal en la sección de búsqueda de nuestra web.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion className="faq-accordion">
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel5a-content"
          id="panel5a-header"
        >
          <Typography variant="h6" className="faq-question">¿Qué tipos de pagos aceptan?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography className="faq-answer">
            Aceptamos solamente pagos a través de PayPal y tarjeta bancaria.
          </Typography>
        </AccordionDetails>
      </Accordion>
      {/* <Accordion className="faq-accordion">
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel6a-content"
          id="panel6a-header"
        >
          <Typography variant="h6" className="faq-question">¿Cómo puedo cancelar mi suscripción?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography className="faq-answer">
            Puedes cancelar tu suscripción en la sección de gestión de suscripciones en tu perfil de usuario. También puedes contactar con nuestro soporte para asistencia.
          </Typography>
        </AccordionDetails>
      </Accordion> */}
    </div>
  );
};

export default FAQ;