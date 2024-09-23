import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Typography, Box, Container, TextField, IconButton, Modal, Grid, Collapse, Link } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import './styles/Acceso.css';
import EditIcon from '@mui/icons-material/Edit';
import ReservarCita from './ReservarCita';
import Calendario from './Calendario';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css'; 
import 'slick-carousel/slick/slick-theme.css'; 
import Medicamentos from './Medicamentos';
import { Tabs, Tab } from '@mui/material';

const Acceso = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [events, setEvents] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [newPet, setNewPet] = useState({
    nombre_mascota: '',
    raza_mascota: '',
    tipo_animal: 'perro',
    edad: '',
    sexo: 'masculino',
    nombre_medicamento: '', 
    dosis: '',
    fecha_inicio: '', 
    fecha_fin: '', 
    hora_toma: '', 
    intervalo_toma: '', 
    notas: '' 
  });
  const navigate = useNavigate();
  const [dateError, setDateError] = useState('');
  const [edadError, setEdadError] = useState('');
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [hasMultiplePets, setHasMultiplePets] = useState(false);
  const [openChangePlanModal, setOpenChangePlanModal] = useState(false);
  const [deleteError, setDeleteError] = useState(''); 
  const [openDeleteErrorModal, setOpenDeleteErrorModal] = useState(false); 

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (openChangePlanModal){
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
        }).render('#paypal-container');
      };
    }
  });

  const validateDates = () => {
  const startDate = new Date(newPet.fecha_inicio);
  const endDate = new Date(newPet.fecha_fin);
  if (endDate < startDate) {
    setDateError('La fecha de fin no puede ser anterior a la fecha de inicio.');
    return false;
  }
  setDateError('');
  return true;
};
const validateEdad = () => {
  const edad = newPet.edad;
  console.log(newPet.edad);

  if (edad < 0) {
    setEdadError('La edad no puede ser un valor negativo.');
    return false;
  }
  setEdadError('');
  return true;

}

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/auth/get-citas', {
        params: { email: localStorage.getItem('userEmail') }
      });
      const formattedCitas = response.data.map(cita => ({
        title: cita.title,
        start: new Date(cita.start),
        end: new Date(cita.end),
      }));

      setEvents(prevEvents => {
        const combinedEvents = [...prevEvents, ...formattedCitas];
        const uniqueEvents = combinedEvents.filter((event, index, self) =>
          index === self.findIndex(e => 
            e.start.getTime() === event.start.getTime() &&
            e.end.getTime() === event.end.getTime()
          )
        );
        return uniqueEvents;
      });
    } catch (error) {
      console.error('Error obtener citas:', error);
    }
  };

  useEffect(() => {
    fetchEvents(); 
    fetchUserData();
    checkNumberOfPets();
  }, []);

  const handleCitaReserved = () => {
    fetchEvents(); 

  };

  const fetchUserData = async () => {
    try {
      const email = localStorage.getItem('userEmail');
      if (!email) {
        setError('No email encontrado en localStorage');
        return;
      }

      const response = await axios.get('http://localhost:5001/api/auth/user-data', {
        params: { email }
      });

      setUserData(response.data);
    } catch (error) {
      setError('Error al obtener user data');
      console.error('Error al obtener user data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5001/api/auth/logout');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('isLoggedIn');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Error logging out');
    }
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setNewPet({ nombre_mascota: '', raza_mascota: '', tipo_animal: 'perro', edad: '', sexo: 'masculino' });
  };  

  const toggleMoreOptions = () => {
    setShowMoreOptions(!showMoreOptions);
  };

  const handleSubmitMedicamento = async () => {
    if (!validateDates()) {
      return; 
    }
  
    try {
      const email = localStorage.getItem('userEmail');
      if (!email) {
        setError('No email encontrado en localStorage');
        return;
      }
  
      const userResponse = await axios.get('http://localhost:5001/api/auth/user-data', {
        params: { email }
      });
  
      const id_cliente = userResponse.data.user.id_cliente;
  
      const medicamentoData = {
        id_cliente,
        id_mascota: newPet.id_mascota,
        nombre_medicamento: newPet.nombre_medicamento,
        dosis: newPet.dosis,
        fecha_inicio: newPet.fecha_inicio,
        fecha_fin: newPet.fecha_fin,
        hora_toma: newPet.hora_toma,
        intervalo_toma: newPet.intervalo_toma,
        notas: newPet.notas
      };
  
      const response = await axios.post('http://localhost:5001/api/auth/add-medicamento', medicamentoData);
      if (response.data.message === 'Medicamento registrado correctamente') {
        console.log('Medicamento registrado con ID:', response.data.id_medicamento);
        
        generateMedicationEvents(medicamentoData);
        
        handleCloseModal();
      } else {
        setError(response.data.message || 'Error al registrar medicamento');
      }
    } catch (error) {
      console.error('Error al registrar medicamento:', error);
      setError('Error al registrar medicamento');
    }
  };

  const generateMedicationEvents = (medicamentoData) => {
    const { nombre_medicamento, fecha_inicio, fecha_fin, hora_toma, intervalo_toma } = medicamentoData;

    let startDate = new Date(`${fecha_inicio}T${hora_toma}`);
    const endDate = new Date(`${fecha_fin}T23:59`); 
    const events = [];

    setEvents(prevEvents => {
      const filteredEvents = prevEvents.filter(event => 
        event.type !== 'medicamento' || 
        !(event.title.startsWith(`Medicamento: ${nombre_medicamento}`) && 
          event.start.getTime() >= startDate.getTime() &&
          event.start.getTime() <= endDate.getTime())
      );

      while (startDate <= endDate) {
        events.push({
          title: `Medicamento: ${nombre_medicamento}`,
          start: new Date(startDate),
          end: new Date(startDate.getTime() + 10 * 60000), 
          type: 'medicamento'
        });

        startDate.setHours(startDate.getHours() + parseInt(intervalo_toma));
      }

      return [...filteredEvents, ...events];
    });
  };



  const handleAddPet = async () => {
    if (!validateEdad()) {
      return; 
    }
    try {
      const email = localStorage.getItem('userEmail');
      if (!email) {
        setError('No email encontrado localStorage');
        return;
      }

      const response = await axios.post('http://localhost:5001/api/auth/add', { ...newPet, email });
      if (response.data.message === 'Mascota añadida correctamente') {
        setUserData(prevData => ({
          ...prevData,
          pets: [...prevData.pets, { ...newPet, id_mascota: response.data.id_mascota }]
        }));
        handleCloseModal();
      } else {
        setError(response.data.message || 'Error añadiendo mascota');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Error añadiendo mascota');
      }
      console.error('Error añadiendo mascota:', error);
    }
  };

  const handleDeletePet = async (id_mascota) => {
    try {
      const response = await axios.delete(`http://localhost:5001/api/auth/delete/${id_mascota}`);
      if (response.data.message === 'Mascota eliminada correctamente') {
        setUserData(prevData => ({
          ...prevData,
          pets: prevData.pets.filter(pet => pet.id_mascota !== id_mascota)
        }));
      } else {
        setOpenDeleteErrorModal(true);  
      } 
    } catch (error) {
      setError('Error al eliminar');
      console.error('Error al eliminar:', error);
      setOpenDeleteErrorModal(true); 
      setDeleteError('Error: Es posible que su mascota tenga citas o medicamentos relacionados.');
    }
  };
  

  const handleEditPet = (pet) => {
    setNewPet({
      id_mascota: pet.id_mascota, 
      nombre_mascota: pet.nombre_mascota,
      raza_mascota: pet.raza_mascota,
      tipo_animal: pet.tipo_animal,
      edad: pet.edad,
      sexo: pet.sexo,
    });
    setOpenModal(true);
  };

  const handleUpdatePet = async (id_mascota) => {
    if (!validateEdad()) {
      return; 
    }
    try {
      const response = await axios.put(`http://localhost:5001/api/auth/edit/${id_mascota}`, newPet);
      if (response.data.message === 'Mascota actualizada correctamente') {
        const updatedPets = userData.pets.map(pet =>
          pet.id_mascota === id_mascota ? { ...pet, ...newPet } : pet
        );
        setUserData({ ...userData, pets: updatedPets });
        handleCloseModal();
      } else {
        setError(response.data.message || 'Error actualizando mascota');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Error actualizando mascota');
      }
      console.error('Error actualizando mascota:', error);
    }
  };

  const checkNumberOfPets = async () => {
    try {
      const email = localStorage.getItem('userEmail');
      const response = await axios.get('http://localhost:5001/api/auth/user-data', {
        params: { email }
      });
      setHasMultiplePets(response.data.pets.length > 1);
    } catch (error) {
      console.error('Error al recuperar user pets:', error);
    }
  };

  const handleChangePlan = async () => {
    if (userData.user.tipo_plan === 'premium' && hasMultiplePets) {
      setOpenErrorModal(true);
    } else {
      setOpenChangePlanModal(true);
    }
  };

  const handleConfirmChangePlan = async () => {
    try {
      const email = localStorage.getItem('userEmail');
      await axios.post('http://localhost:5001/api/auth/change-plan', {
        email,
        newPlan: userData.user.tipo_plan === 'premium' ? 'basico' : 'premium'
      });
      fetchUserData();
      setOpenChangePlanModal(false);
    } catch (error) {
      console.error('Error cambio plan:', error);
      setError('Error cambio plan');
    }
  };


  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };


  return (
    <Container>
      <Box className="acceso-container">
        <Box className="header">
          <Typography variant="h4">Mi perfil</Typography>
          <Button variant="contained" color="primary" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </Box>

        {userData && (
          <Box>
            <Typography variant="h6"><strong>Mis datos</strong></Typography>
            <Typography variant="body1"><strong>Nombre: </strong>{userData.user.nombre}</Typography>
            <Typography variant="body1"><strong>Apellido:</strong> {userData.user.apellido}</Typography>
            <Typography variant="body1"><strong>Email:</strong> {userData.user.email}</Typography>
            <Typography variant="body1"><strong>Tipo de plan:</strong> {userData.user.tipo_plan}</Typography>
            {userData.user.tipo_plan === 'basico' ? (
              <Button onClick={handleChangePlan}>¿Quieres cambiarte al plan Premium?</Button>
            ) : (
              <Button onClick={handleChangePlan}>¿Quieres cambiarte al plan Básico?</Button>

            )}
          </Box>
        )}
        {userData && (
          <Modal open={openChangePlanModal} onClose={() => setOpenChangePlanModal(false)}>
            <Box className="modal-box">
              {userData.user.tipo_plan === 'basico' ? (
              <Typography>Consigue el plan Premium por solo 3€ al mes</Typography>
              ) : (
                <Typography>¿Estás seguro que quieres cambiarte de plan?</Typography>
              )}
              
              <Button onClick={() => setOpenChangePlanModal(false)}>Cancelar</Button>
                    
              {userData.user.tipo_plan === 'basico' ? (
              <Button onClick={handleConfirmChangePlan}>{<div id="paypal-container"></div>}</Button>
              ) : (
              <Button onClick={handleConfirmChangePlan}>Aceptar</Button>
              )}
            </Box>
          </Modal>
        )}

      <Modal open={openErrorModal} onClose={() => setOpenErrorModal(false)}>
        <Box className="modal-box">
          <Typography>Tienes más de una mascota registrada. Para poder cambiarte al plan Básico solamente puedes tener 1 mascota registrada.</Typography>
          <Button onClick={() => setOpenErrorModal(false)}>Cerrar</Button>
        </Box>
      </Modal>
      </Box>
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box className="modal-box" sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <Typography variant="h6" mb={2}>Añadir Mascota</Typography>
          <TextField
            label="Nombre de la Mascota"
            fullWidth
            margin="normal"
            value={newPet.nombre_mascota}
            onChange={(e) => setNewPet({ ...newPet, nombre_mascota: e.target.value })}
          />
          <TextField
            label="Raza de la Mascota"
            fullWidth
            margin="normal"
            value={newPet.raza_mascota}
            onChange={(e) => setNewPet({ ...newPet, raza_mascota: e.target.value })}
          />
          <TextField
            label="Edad"
            type="number"
            fullWidth
            margin="normal"
            value={newPet.edad}
            onChange={(e) => setNewPet({ ...newPet, edad: e.target.value })}
            error={Boolean(edadError)} 
            helperText={edadError} 
          />
          <TextField
            label="Tipo de Animal"
            select
            fullWidth
            margin="normal"
            value={newPet.tipo_animal}
            onChange={(e) => setNewPet({ ...newPet, tipo_animal: e.target.value })}
            SelectProps={{
              native: true,
            }}
          >
            <option value="perro">Perro</option>
            <option value="gato">Gato</option>
            <option value="otro">Otro</option>
          </TextField>
          <TextField
            label="Sexo"
            select
            fullWidth
            margin="normal"
            value={newPet.sexo}
            onChange={(e) => setNewPet({ ...newPet, sexo: e.target.value })}
            SelectProps={{
              native: true,
            }}
          >
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
          </TextField>
          {error && <Typography color="error">{error}</Typography>}
          <Button variant="contained" color="primary"  onClick={() => {
            newPet.id_mascota ? handleUpdatePet(newPet.id_mascota) : handleAddPet();
            }}>
            {newPet.id_mascota ? 'Actualizar Mascota' : 'Añadir Mascota'}
          </Button>
          <Link component="button" variant="body2" onClick={toggleMoreOptions} sx={{ marginTop: 2, marginLeft: 2 }}>
            {showMoreOptions ? 'Ocultar opciones' : 'Ver más opciones'}
          </Link>
          <Collapse in={showMoreOptions}>
            <TextField
              label="Nombre del Medicamento"
              fullWidth
              margin="normal"
              value={newPet.nombre_medicamento}
              onChange={(e) => setNewPet({ ...newPet, nombre_medicamento: e.target.value })}
            />
            <TextField
              label="Dosis"
              fullWidth
              margin="normal"
              value={newPet.dosis}
              onChange={(e) => setNewPet({ ...newPet, dosis: e.target.value })}
            />
            <TextField
              label="Fecha de Inicio"
              type="date"
              fullWidth
              margin="normal"
              value={newPet.fecha_inicio}
              onChange={(e) => setNewPet({ ...newPet, fecha_inicio: e.target.value })}
              InputLabelProps={{
                shrink: true,
              }}
              error={Boolean(dateError)} 
            />
            <TextField
              label="Fecha de Fin"
              type="date"
              fullWidth
              margin="normal"
              value={newPet.fecha_fin}
              onChange={(e) => setNewPet({ ...newPet, fecha_fin: e.target.value })}
              InputLabelProps={{
                shrink: true,
              }}
              error={Boolean(dateError)} 
              helperText={dateError} 
            />
            <TextField
              label="Hora de Toma"
              type="time"
              fullWidth
              margin="normal"
              value={newPet.hora_toma}
              onChange={(e) => setNewPet({ ...newPet, hora_toma: e.target.value })}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Intervalo entre Tomas (horas)"
              type="number"
              fullWidth
              margin="normal"
              value={newPet.intervalo_toma}
              onChange={(e) => setNewPet({ ...newPet, intervalo_toma: e.target.value })}
            />
            <TextField
              label="Notas"
              fullWidth
              margin="normal"
              multiline
              rows={4}
              value={newPet.notas}
              onChange={(e) => setNewPet({ ...newPet, notas: e.target.value })}
            />
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSubmitMedicamento}  
              sx={{ marginTop: 2 }}
            >
              Guardar Medicamento
            </Button>
          </Collapse>

        </Box>
      </Modal>
      
      

      <Box>
      {userData && (

<Box sx={{ 
        width: '100%', 
        paddingTop: 2,
        '@media (max-width: 600px)': {
          '.MuiTabs-root': {
            flexDirection: 'column', 
          },
          '.MuiTab-root': {
            fontSize: '0.875rem', 
            padding: '6px 16px', 
          },
          '.MuiTabs-flexContainer': {
            flexDirection: 'column', 
          }
        }
      }} paddingTop={2}>
<Tabs value={value} onChange={handleChange} aria-label="tabs example">
  <Tab label={<Typography variant="body1" component="strong">Mis Mascotas</Typography>} />
  <Tab label={<Typography variant="body1" component="strong">Medicamentos</Typography>} />
  <Tab label={<Typography variant="body1" component="strong">Mis citas</Typography>} />
  <Tab label={<Typography variant="body1" component="strong">calendario</Typography>} />
</Tabs>
<Box sx={{ p: 3 }}>
  {value === 0 && (
              <Box>
              <Box className="pets-header" display="flex" justifyContent="end" alignItems="center" mb={2}>
                <IconButton color="primary" onClick={handleOpenModal} aria-label="add pet">
                  <AddIcon />
                </IconButton>
              </Box>
              {userData.pets.length === 0 ? (
                <Typography>No tienes ninguna mascota registrada.</Typography>
              ) : (
                <Grid container spacing={2}>
                  {userData.pets.map((pet) => (
                    <Grid item xs={12} sm={6} md={4} key={pet.id_mascota}>
                      <Box className="pet-card">
                        <Box className="pet-info">
                          <Typography variant="body1"><strong>Nombre:</strong> {pet.nombre_mascota}</Typography>
                          <Typography variant="body1"><strong>Raza:</strong> {pet.raza_mascota}</Typography>
                          <Typography variant="body1"><strong>Tipo:</strong> {pet.tipo_animal}</Typography>
                          <Typography variant="body1"><strong>Edad:</strong> {pet.edad}</Typography>
                          <Typography variant="body1"><strong>Sexo:</strong> {pet.sexo}</Typography>
                        </Box>
                        <Box className="pet-actions">
                          <IconButton color="primary" onClick={() => handleEditPet(pet)} aria-label="edit pet">
                            <EditIcon />
                          </IconButton>
                          <IconButton color="primary" onClick={() => handleDeletePet(pet.id_mascota)} aria-label="delete pet">
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                  <Modal open={openDeleteErrorModal} onClose={() => setOpenDeleteErrorModal(false)}>
                    <Box className="modal-box">
                      <Typography>{deleteError}</Typography>
                      <Button onClick={() => setOpenDeleteErrorModal(false)}>Cerrar</Button>
                    </Box>
                  </Modal>
  
                </Grid>
                
              )}
            </Box>
    
  )}
  {value === 1 && (
    <Box>
      <Medicamentos />
    </Box>
  )}
  {value === 2 && (
    <Box id="reservar-cita-section">
      <ReservarCita onCitaReserved={handleCitaReserved} />
    </Box>
  )}
  {value === 3 && (
    <Box id="calendario-section">
      <Calendario eventsProp={events}/>
    </Box>
  )}
</Box>
</Box>

      )}
      </Box>

    </Container>
  );
};

export default Acceso;
