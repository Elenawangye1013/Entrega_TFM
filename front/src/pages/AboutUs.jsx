import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia } from '@mui/material';
import './styles/AboutUs.css';
import about1 from './../assets/about1.jpg';
import about2 from './../assets/about2.jpg';
import about3 from './../assets/about3.jpg';


const teamMembers = [
  {
    name: 'Elena López',
    role: 'CEO',
    image: about1,
    description: 'Elena es la fundadora y CEO de PetMate, con más de 10 años de experiencia en el sector de servicios para mascotas.'
  },
  {
    name: 'Carlos Martínez',
    role: 'CTO',
    image: about2,
    description: 'Carlos lidera el desarrollo tecnológico en PetMate, asegurando que nuestros servicios sean de la más alta calidad.'
  },
  {
    name: 'Laura Fernández',
    role: 'Veterinaria',
    image: about3,
    description: 'Laura es nuestra veterinaria principal, con más de 8 años de experiencia cuidando y tratando a mascotas de todo tipo.'
  },
];

const AboutUs = () => {
  return (
    <Container className="about-us-container">
      <h1>Sobre Nosotros</h1>

      {/* <Typography variant="h2" className="about-us-title" gutterBottom>
        Sobre Nosotros
      </Typography> */}
      {/* <Typography variant="h5" className="about-us-subtitle" gutterBottom>
        Subtítulo
      </Typography> */}
      <Typography variant="body1" className="about-us-description" paragraph>
        PetMate es una startup dedicada a ayudar a las mascotas y sus dueños a gestionar todas sus necesidades de manera eficiente y efectiva. 
        Ofrecemos una plataforma integral que permite a los propietarios de mascotas reservar servicios, realizar seguimientos de salud, 
        y acceder a información vital sobre el cuidado de sus compañeros peludos.
      </Typography>
      <Typography variant="body1" className="about-us-description-bottom" paragraph>
        Nuestra misión es simplificar la vida de las mascotas y sus dueños a través de la tecnología. 
        Creemos en un futuro donde cada mascota recibe el cuidado y la atención que merece, 
        y estamos comprometidos a hacer esto posible mediante soluciones innovadoras y fáciles de usar.
      </Typography>
      <Typography variant="h4" className="about-us-team-title" gutterBottom>
        Nuestro Equipo
      </Typography>
      <Grid container spacing={4}>
        {teamMembers.map((member, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card className="team-member-card">
              <CardMedia
                component="img"
                alt={member.name}
                height="200"
                image={member.image}
                title={member.name}
              />
              <CardContent>
                <Typography variant="h6" className="team-member-name" gutterBottom>
                  {member.name}
                </Typography>
                <Typography variant="subtitle1" className="team-member-role" color="textSecondary" gutterBottom>
                  {member.role}
                </Typography>
                <Typography variant="body2" className="team-member-description">
                  {member.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AboutUs;
