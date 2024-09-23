import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, ToggleButton, ToggleButtonGroup, Box, Link, Modal } from '@mui/material';
import './styles/Login.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

const validateEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

const Login = () => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [registerNombre, setRegisterNombre] = useState('');
  const [registerApellido, setRegisterApellido] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPlan, setRegisterPlan] = useState('basico');
  const [registerError, setRegisterError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [openRegisterModal, setOpenRegisterModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (registerPlan === 'premium') {
      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=';
      script.async = true;
      document.body.appendChild(script);
      script.onload = () => {
        window.paypal.Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: '3.00'
                }
              }]
            });
          },
          onApprove: async (data, actions) => {
            return actions.order.capture().then(async (details) => {
              try {
                const response = await axios.post('http://localhost:5001/api/auth/register', {
                  nombre: registerNombre,
                  apellido: registerApellido,
                  email: registerEmail,
                  password: registerPassword,
                  tipo_plan: registerPlan,
                });
                if (response.data.message === 'User registered successfully') {
                  console.log('Usuario registrado correctamente');
                } else {
                  setRegisterError(response.data.message);
                }
              } catch (error) {
                setRegisterError('Error en el registro');
              }
            });
          },
          onError: (err) => {
            console.error('Error en el pago de PayPal:', err);
            setRegisterError('Error en el pago de PayPal');
          }
        }).render('#paypal-button-container');
      };
    }
  }, [registerPlan]);

  const handlePlanChange = (event, newPlan) => {
    if (newPlan !== null) {
      setRegisterPlan(newPlan);
    }
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setLoginError('');
    if (!validateEmail(loginEmail)) {
      setLoginError('El email no es válido');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', { email: loginEmail, password: loginPassword });
      if (response.data.message === 'Login correcto') {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', loginEmail);
        navigate('/acceso');
      } else {
        setLoginError(response.data.message);
      }
    } catch (error) {
      setLoginError('Error en login');
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setRegisterError('');

    if (!validateEmail(registerEmail)) {
      setRegisterError('El email no es válido');
      return;
    }

    if (registerPlan === 'premium') {
    } else {
      try {
        const response = await axios.post('http://localhost:5001/api/auth/register', {
          nombre: registerNombre,
          apellido: registerApellido,
          email: registerEmail,
          password: registerPassword,
          tipo_plan: registerPlan,
        });
        if (response.data.message === 'User registered successfully') {
          console.log('Usuario registrado correctamente');
          setOpenRegisterModal(true);
        } else {
          setRegisterError(response.data.message);
        }
      } catch (error) {
        setRegisterError('Error en el registro');
      }
    }
  };

  return (
    <Container maxWidth="lg" className="login-container">
      <Modal open={openRegisterModal} onClose={() => setOpenRegisterModal(false)}>
        <Box className="modal-box">
          <Typography>Registro completado, ya puedes dirigirte a iniciar tu sesión.</Typography>
          <Button onClick={() => setOpenRegisterModal(false)}>Cerrar</Button>
        </Box>
      </Modal>
      <Box className="login-form">
        {showRegister ? (
          <>
            <Typography variant="h4" component="h1" gutterBottom>
              Regístrate
            </Typography>
            <form onSubmit={handleRegisterSubmit}>
              <TextField
                label="Nombre"
                variant="outlined"
                fullWidth
                margin="normal"
                required
                autoComplete="given-name"
                className="form-input"
                value={registerNombre}
                onChange={(e) => setRegisterNombre(e.target.value)}
              />
              <TextField
                label="Apellido"
                variant="outlined"
                fullWidth
                margin="normal"
                required
                autoComplete="family-name"
                className="form-input"
                value={registerApellido}
                onChange={(e) => setRegisterApellido(e.target.value)}
              />
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                margin="normal"
                required
                autoComplete="email"
                className="form-input"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                error={!validateEmail(registerEmail) && registerEmail !== ''}
                helperText={!validateEmail(registerEmail) && registerEmail !== '' ? 'El email no es válido' : ''}
              />
              <TextField
                label="Contraseña"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                required
                autoComplete="new-password"
                className="form-input"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
              />
              <Typography id="register-plan-title" variant="h6">
                Selecciona tu plan
              </Typography>
              <ToggleButtonGroup
                value={registerPlan}
                exclusive
                onChange={handlePlanChange}
                className="toggle-group"
              >
                <ToggleButton value="basico" className={`toggle-button ${registerPlan === 'basico' ? 'selected' : ''}`}>
                  Básico
                </ToggleButton>
                <ToggleButton value="premium" className={`toggle-button ${registerPlan === 'premium' ? 'selected' : ''}`}>
                  Premium
                </ToggleButton>
              </ToggleButtonGroup>
              {registerError && <Typography color="error">{registerError}</Typography>}
              {registerPlan === 'basico' && (
                <Button type="submit" variant="contained" color="primary" fullWidth>
                  Registrarse Gratis
                </Button>
              )}
              {registerPlan === 'premium' && <div id="paypal-button-container"></div>}
              <Box mt={2}>
                <Link href="#" onClick={() => setShowRegister(false)} variant="body2">
                  ¿Ya tienes cuenta? Inicia sesión
                </Link>
              </Box>
            </form>
          </>
        ) : (
          <>
            <Typography variant="h4" component="h1" gutterBottom>
              Iniciar Sesión
            </Typography>
            <form onSubmit={handleLoginSubmit}>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                margin="normal"
                required
                autoComplete="email"
                className="form-input"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                error={!validateEmail(loginEmail) && loginEmail !== ''}
                helperText={!validateEmail(loginEmail) && loginEmail !== '' ? 'El email no es válido' : ''}
              />
              <TextField
                label="Contraseña"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                required
                autoComplete="current-password"
                className="form-input"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              {loginError && <Typography color="error">{loginError}</Typography>}
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Acceder
              </Button>
              <Box mt={2}>
                <Link href="#" onClick={() => setShowRegister(true)} variant="body2">
                  ¿Todavía no estás registrado? Regístrate aquí.
                </Link>
              </Box>
            </form>
          </>
        )}
      </Box>
    </Container>
  );
};


export default Login;
