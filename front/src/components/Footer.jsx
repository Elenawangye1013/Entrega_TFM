import React from 'react';
import { Container, Typography, IconButton, Link } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import './Footer.css'; 

const Footer = () => (
  <footer className="footer-container">
    <Container>
      <Typography variant="body2" className="footer-text">
        Siempre estaremos a tu disposición para ayudarte y a tus mascotas.
      </Typography>
      <Typography variant="body2" className="footer-text">
        Como tú lo prefieras, te ofrecemos nuestras herramientas y tú eliges cómo utilizarlas.
      </Typography>
      <div className="footer-links">
        <Link href="/privacy-policy" className="footer-link">Política de Privacidad</Link>
        <Link href="/cookie-policy" className="footer-link">Uso de Cookies</Link>
        <Link href="/terms-of-service" className="footer-link">Términos de Servicio</Link>
      </div>
      <div className="social-icons">
        <IconButton
          color="inherit"
          aria-label="Facebook"
          href="https://www.facebook.com"
          target="_blank"
          rel="noopener"
        >
          <FacebookIcon />
        </IconButton>
        <IconButton
          color="inherit"
          aria-label="Twitter"
          href="https://www.twitter.com"
          target="_blank"
          rel="noopener"
        >
          <TwitterIcon />
        </IconButton>
        <IconButton
          color="inherit"
          aria-label="Instagram"
          href="https://www.instagram.com"
          target="_blank"
          rel="noopener"
        >
          <InstagramIcon />
        </IconButton>
        <IconButton
          color="inherit"
          aria-label="LinkedIn"
          href="https://www.linkedin.com"
          target="_blank"
          rel="noopener"
        >
          <LinkedInIcon />
        </IconButton>
      </div>
      <Typography variant="body2" className="footer-bottom">
        © {new Date().getFullYear()} PetMate. Todos los derechos reservados.
      </Typography>
    </Container>
  </footer>
);

export default Footer;
