

import React, { useState } from 'react';
import './styles/Home.css';
import { Link } from 'react-router-dom';
import home1 from './../assets/home1.jpg';
import home2 from './../assets/home2.jpg';
import home3 from './../assets/home3.jpg';
import { Card, CardContent, CardMedia, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FAQ from '../components/FAQ';
import plan1 from './../assets/plan1.jpg';
import plan2 from './../assets/plan2.jpg';

const Home = () => {
  const [flipped, setFlipped] = useState([false, false, false]);

  const handleFlip = index => {
    const newFlipped = [...flipped];
    newFlipped[index] = !newFlipped[index];
    setFlipped(newFlipped);
  };

  return (
    <div className="home-container">
      <div className="home-intro">
        <div className="background-image" />
        <div className="home-content">
          <div className="overlay">
            <h1 className="main-text">Bienvenido a PetMate</h1>
            <p className="sub-text">Tu solución perfecta para la gestión de mascotas</p>
            <Link to="/subscription-plans" className="cta-button">Empieza Ahora</Link>
          </div>
        </div>
      </div>
      <div className="home-intro-mobile">
        <div className="home-content">
          <div className="overlay">
            <h1 className="main-text">Bienvenido a PetMate</h1>
            <p className="sub-text">Tu solución perfecta para la gestión de mascotas</p>
            <Link to="/subscription-plans" className="cta-button">Empieza Ahora</Link>
          </div>
        </div>
        <div className="background-image" />
      </div>
      <section className="cromo-section">
      <Typography variant="h4" className="faq-title" gutterBottom>
        Por lo que destacamos
      </Typography>
        <div className="cromo-container">
          <div className={`cromo ${flipped[0] ? 'flipped' : ''}`} onClick={() => handleFlip(0)}>
            <img src={home1} alt="Servicio 1" className="cromo-image" />
            <div className="cromo-back">
              <p>Donde tú quieras podrás encontrar a todos los profesionales veterinarios de tu zona para cuidar de tu mascota con la mejor atención y servicios especializados.</p>
            </div>
          </div>
          <div className={`cromo ${flipped[1] ? 'flipped' : ''}`} onClick={() => handleFlip(1)}>
            <img src={home2} alt="Servicio 2" className="cromo-image" />
            <div className="cromo-back">
              <p>Siempre estaremos a tu disposición para ayudarte y a tus mascotas. Encuentra asistencia profesional cuando más la necesites, con el respaldo de un equipo comprometido y cercano.</p>
            </div>
          </div>
          <div className={`cromo ${flipped[2] ? 'flipped' : ''}`} onClick={() => handleFlip(2)}>
            <img src={home3} alt="Servicio 3" className="cromo-image" />
            <div className="cromo-back">
              <p>Como tú lo prefieras, te ofrecemos nuestras herramientas y tú decides cómo utilizarlas. Adapta nuestras soluciones a tus necesidades y encuentra la flexibilidad que mejor se ajusta a tu estilo de vida y el de tus mascotas.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="cards-section">
      <Typography variant="h4" className="faq-title" gutterBottom>
        Nuestras Suscripciones
      </Typography>
      <div className="cards-container">
        <Link to="/subscription-plans" className="no-underline">
          <Card className="card">
            <CardMedia
              component="img"
              height="200"
              image={plan1}
              alt="Imagen de tarjeta 1"
            />
            <CardContent className="card-box">
              <Typography variant="h5" component="div" className="card-title">
                Plan básico - Gratis
              </Typography>
              <List className="card-content">
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon className="icon" />
                  </ListItemIcon>
                  <ListItemText primary="Accede a todos los veterinarios de la zona" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon className="icon" />
                  </ListItemIcon>
                  <ListItemText primary="Podrás registrar solamente 1 mascota" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon className="icon" />
                  </ListItemIcon>
                  <ListItemText primary="Seguimiento de medicamentos y citas de la mascota" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/subscription-plans" className="no-underline">
          <Card className="card">
            <CardMedia
              component="img"
              height="200"
              image={plan2}
              alt="Imagen de tarjeta 2"
            />
            <CardContent>
              <Typography variant="h5" component="div" className="card-title">
                Plan premium - 3€/mes
              </Typography>
              <List className="card-content">
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon className="icon" />
                  </ListItemIcon>
                  <ListItemText primary="Accede a todos los veterinarios de la zona" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon className="icon" />
                  </ListItemIcon>
                  <ListItemText primary="Podrás registrar hasta 3 mascotas" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon className="icon" />
                  </ListItemIcon>
                  <ListItemText primary="Seguimiento de medicamentos y citas de las mascotas" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon className="icon" />
                  </ListItemIcon>
                  <ListItemText primary="Consultas online ilimitadas" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Link>
        
      </div>
    </section>
    <FAQ />
    </div>
  );
};

export default Home;
