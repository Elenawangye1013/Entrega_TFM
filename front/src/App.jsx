import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemText, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Home from './pages/Home';
import SubscriptionPlans from './pages/SubscriptionPlans';
import Collaborators from './pages/Collaborators';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import Login from './pages/Login';
import './App.css';
import logo from './assets/logo-no-background.png'; 
import Footer from './components/Footer';
import Acceso from './pages/Acceso';
import ProtectedRoute from './components/ProtectedRoute';
import ReservarCita from './pages/ReservarCita';
import Chatbot from './components/Chatbot';

const App = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(loggedInStatus === 'true'); 
    console.log('isLoggedIn:', loggedInStatus)
  }, []);

  const drawer = (
    <div>
      <List>

        <ListItem button component={Link} to="/subscription-plans" onClick={handleDrawerToggle}>
          <ListItemText primary="Planes de Suscripción" />
        </ListItem>
        <ListItem button component={Link} to="/collaborators" onClick={handleDrawerToggle}>
          <ListItemText primary="Colaboradores" />
        </ListItem>
        <ListItem button component={Link} to="/about-us" onClick={handleDrawerToggle}>
          <ListItemText primary="Sobre Nosotros" />
        </ListItem>
        <ListItem button component={Link} to="/contact" onClick={handleDrawerToggle}>
          <ListItemText primary="Contacto" />
        </ListItem>
        <ListItem button component={Link} to={isLoggedIn ? "/acceso" : "/login"} onClick={handleDrawerToggle}>
          <ListItemText primary={isLoggedIn ? "Mi cuenta" : "Acceder"} />
        </ListItem>
      </List>
    </div>
  );

  return (
    <Router>
      <div className="App">

      <AppBar position="fixed" style={{ height: '90px' }}>
        <Toolbar style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                disableRipple
                disableFocusRipple
              >
                <MenuIcon />
              </IconButton>
              <Link to="/" >
                <img
                  src={logo}
                  alt="PetMate Logo"
                  className="logo"
                  style={{ height: '70px', objectFit: 'contain' }}
                />
              </Link>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between'}}>
              <Link to="/" >
                <img
                  src={logo}
                  alt="PetMate Logo"
                  className="logo"
                  style={{ height: '70px', objectFit: 'contain' }}
                />
              </Link>
              <div style={{ display: 'flex', gap: '16px' }}>
                <Link to="/subscription-plans" className="nav-link">Planes Suscripción</Link>
                <Link to="/collaborators" className="nav-link">Nuestros Colaboradores</Link>
                <Link to="/about-us" className="nav-link">Sobre Nosotros</Link>
                <Link to="/contact" className="nav-link">Contacto</Link>
                <Link to={isLoggedIn ? "/acceso" : "/login"} className="nav-link">
                    {isLoggedIn ? "Mi cuenta" : "Acceder"}
                </Link>              
              </div>
            </div>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
      >
        {drawer}
      </Drawer>

      <main style={{ marginTop: '84px', marginBottom: '50px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/subscription-plans" element={<SubscriptionPlans />} />
          <Route path="/collaborators" element={<Collaborators />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<PrivateRoute><Login /></PrivateRoute>} />
          <Route path="/acceso" element={
            <ProtectedRoute>
              <Acceso />
            </ProtectedRoute>
          } />       
          <Route path="/reservarcita" element={<ReservarCita />} />
        </Routes>
      </main>
      <Chatbot />
      <Footer />
              
      </div>
    </Router>
  );
};


const PrivateRoute = ({ children }) => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/acceso');
    }
  }, [isLoggedIn, navigate]);

  return !isLoggedIn ? children : null;
};

export default App;
