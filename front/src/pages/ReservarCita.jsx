import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Typography, Box, Container, TextField, MenuItem, Grid, IconButton, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './styles/ReservarCita.css';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';

const ReservarCita = ({ onCitaReserved }) => {
    const [userData, setUserData] = useState(null);
    const [pets, setPets] = useState([]);
    const [vets, setVets] = useState([]);
    const [selectedPet, setSelectedPet] = useState('');
    const [selectedVet, setSelectedVet] = useState('');
    const [appointmentDate, setAppointmentDate] = useState(null);
    const [motivo, setMotivo] = useState('');
    const [vetSchedule, setVetSchedule] = useState({ open: '', close: '' });
    const [error, setError] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCita, setCurrentCita] = useState(null);

    useEffect(() => {
      const fetchUserData = async () => {
          try {
              const email = localStorage.getItem('userEmail');
              if (!email) {
                  setError('No email found in localStorage');
                  return;
              }
  
              const userResponse = await axios.get('http://localhost:5001/api/auth/user-data', { params: { email } });
              const user = userResponse.data.user || { citas: [] };
              const petsData = userResponse.data.pets || [];
              
              setUserData(user); 
              setPets(petsData);
              setSelectedPet(petsData.length > 0 ? petsData[0].id_mascota : '');
  
              // Fetch veterinarios
              const vetsResponse = await axios.get('http://localhost:5001/api/auth/veterinarios');
              const vetsData = vetsResponse.data || [];
              
              setVets(vetsData);
              setSelectedVet(vetsData.length > 0 ? vetsData[0].id : '');
              setVetSchedule({
                  open: vetsData.length > 0 ? vetsData[0].horario_apertura : '',
                  close: vetsData.length > 0 ? vetsData[0].horario_cierre : ''
              });
  
              const citasResponse = await axios.get('http://localhost:5001/api/auth/get-citas', { params: { email } });

              const citasData = citasResponse.data || [];
              
              setUserData(prevData => ({
                  ...prevData,
                  citas: citasData
              }));
  
          } catch (error) {
              setError('Error fetching data');
              console.error('Error fetching data:', error);
          }
      };
  
      fetchUserData();
  }, []);
  

  

    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => {
        setOpenModal(false);
        setIsEditing(false);
        setCurrentCita(null);
        setSelectedPet('');
        setSelectedVet('');
        setAppointmentDate(null);
        setMotivo('');
        setError('');
    };
  
    const handleEditCita = async (id_cita) => {
      try {
          const response = await axios.get(`http://localhost:5001/api/auth/citas/${id_cita}`);
          
          if (response.status === 200) {
              const citaData = response.data;
  
              setSelectedPet(citaData.id_mascota);
              setSelectedVet(citaData.id_veterinario);
              setAppointmentDate(new Date(citaData.fecha));
              setMotivo(citaData.motivo);
              setIsEditing(true);
              setCurrentCita(citaData); 
              setOpenModal(true); 
          } else {
              setError('Error al obtener los datos de la cita.');
          }
      } catch (error) {
          setError('Error al obtener los datos de la cita.');
          console.error('Error:', error);
      }
  };
  

    const handleDeleteCita = async (idCita) => {
        try {
            if (!idCita) {
                console.error('ID de cita no proporcionado');
                return;
            }

            await axios.delete(`http://localhost:5001/api/auth/citas/${idCita}`);

            const email = localStorage.getItem('userEmail');
            const citasResponse = await axios.get('http://localhost:5001/api/auth/get-citas', { params: { email } });

            setUserData(prevData => ({
                ...prevData,
                citas: citasResponse.data || []
            }));
        } catch (error) {
            console.error('Error al eliminar la cita:', error);
            setError('Error al eliminar la cita');
        }
    };

    const handleVetChange = (e) => {
        const vetId = e.target.value;
        setSelectedVet(vetId);

        const selectedVetData = vets.find(vet => vet.id === vetId);
        if (selectedVetData) {
            setVetSchedule({
                open: selectedVetData.horario_apertura,
                close: selectedVetData.horario_cierre
            });
        }
    };

    const validateAppointmentTime = (date) => {
        const minutes = date.getMinutes();
        return [0, 15, 30, 45].includes(minutes);
    };

    const handleSubmit = async () => {
        if (!selectedPet || !selectedVet || !appointmentDate || !motivo) {
            setError('Por favor, completa todos los campos.');
            return;
        }

        const currentDateTime = new Date();
        const selectedDateTime = appointmentDate;

        if (selectedDateTime < currentDateTime) {
            setError('La fecha y hora de la cita no puede ser anterior a la actual.');
            return;
        }

        if (!validateAppointmentTime(appointmentDate)) {
            setError('Por favor, selecciona un horario con minutos válidos (00, 15, 30, 45).');
            return;
        }
        if (isNaN(appointmentDate.getTime())) {
          setError('Fecha de cita no válida.');
          return;
      }

        const [openHour, openMinute] = vetSchedule.open.split(':').map(Number);
        const [closeHour, closeMinute] = vetSchedule.close.split(':').map(Number);

        const openingTime = new Date(selectedDateTime);
        openingTime.setHours(openHour, openMinute);

        const closingTime = new Date(selectedDateTime);
        closingTime.setHours(closeHour, closeMinute);

        if (selectedDateTime < openingTime || selectedDateTime > closingTime) {
            setError('La hora seleccionada está fuera del horario de atención del veterinario.');
            return;
        }

        try {
            if (isEditing) {
                const response = await axios.put(`http://localhost:5001/api/auth/citas/${currentCita.id_cita}`, {
                    id_centro: selectedVet,
                    id_mascota: selectedPet,
                    fecha: appointmentDate.toISOString(),
                    motivo,
                });

                if (response.status === 200) {
                    setIsEditing(false);
                    setCurrentCita(null);
                    handleCloseModal();
                } else {
                    setError('Error al editar la cita');
                }
            } else {
                const response = await axios.post('http://localhost:5001/api/auth/citas', {
                    id_cliente: userData.id_cliente,
                    id_centro: selectedVet,
                    id_mascota: selectedPet,
                    fecha: appointmentDate.toISOString(),
                    motivo,
                });

                if (response.status === 201) {
                    if (onCitaReserved) onCitaReserved();
                    handleCloseModal();
                } else {
                    setError('Error al reservar la cita');
                }
            }

            const email = localStorage.getItem('userEmail');
            const citasResponse = await axios.get('http://localhost:5001/api/auth/get-citas', { params: { email } });
            setUserData(prevData => ({
                ...prevData,
                citas: citasResponse.data || []
            }));
        } catch (error) {
            setError('Error al reservar/editar la cita');
            console.error('Error:', error);
        }
    };

    const filterPassedTime = (time) => {
        const currentDate = new Date();
        const selectedDate = new Date(time);

        const [openHour, openMinute] = vetSchedule.open.split(':').map(Number);
        const [closeHour, closeMinute] = vetSchedule.close.split(':').map(Number);

        const openingTime = new Date(selectedDate);
        openingTime.setHours(openHour, openMinute);

        const closingTime = new Date(selectedDate);
        closingTime.setHours(closeHour, closeMinute);

        return selectedDate >= currentDate && selectedDate >= openingTime && selectedDate <= closingTime;
    };

    return (
        <Container className="container">
            <Box>
                <Box className="pets-header" display="flex" justifyContent="end" alignItems="center" mb={2}>
                    <IconButton color="primary" onClick={handleOpenModal} aria-label="add cita">
                        <AddIcon />
                    </IconButton>
                </Box>
                <Grid container spacing={2}>
                    {userData && userData.citas && (
                        userData.citas
                            .filter((cita) => new Date(cita.start) >= new Date())
                            .map((cita) => (
                                <Grid item xs={12} sm={6} md={4} key={cita.id_cita || `${cita.start}-${cita.nombre_mascota}`}>
                                    <Box className="pet-card" p={2} border={1} borderRadius={1} boxShadow={1}>
                                        <Box className="pet-info" mb={2}>
                                            <Typography variant="body1"><strong>Motivo:</strong> {cita.title}</Typography>
                                            <Typography variant="body1"><strong>Fecha:</strong> {format(new Date(cita.start), 'dd/MM/yyyy HH:mm')}</Typography>
                                            <Typography variant="body1"><strong>Mascota:</strong> {cita.nombre_mascota}</Typography>
                                        </Box>
                                        <Box className="pet-actions" display="flex" justifyContent="flex-end">
                                            <IconButton color="primary" onClick={() => handleEditCita(cita.id_cita)} aria-label="edit cita">
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton color="primary" onClick={() => handleDeleteCita(cita.id_cita)} aria-label="delete cita" sx={{ ml: 1 }}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </Grid>
                            ))
                    )}
                </Grid>
            </Box>

            <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
                <DialogTitle>{isEditing ? 'Editar Cita' : 'Reservar Cita'}</DialogTitle>
                <DialogContent>
                    <Box>
                        <TextField
                            select
                            label="Selecciona Mascota"
                            value={selectedPet}
                            onChange={(e) => setSelectedPet(e.target.value)}
                            fullWidth
                            margin="normal"
                        >
                            {pets.map((pet) => (
                                <MenuItem key={pet.id_mascota} value={pet.id_mascota}>
                                    {pet.nombre_mascota}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            label="Selecciona Veterinario"
                            value={selectedVet}
                            onChange={handleVetChange}
                            fullWidth
                            margin="normal"
                        >
                            {vets.map((vet) => (
                                <MenuItem key={vet.id} value={vet.id}>
                                    {`${vet.nombre} - ${vet.direccion}, ${vet.ciudad} - ${vet.postalCode}`}
                                </MenuItem>
                            ))}
                        </TextField>
                        <DatePicker
                            selected={appointmentDate}
                            onChange={(date) => setAppointmentDate(date)}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="MMMM d, yyyy h:mm aa"
                            minDate={new Date()}
                            filterTime={filterPassedTime}
                            placeholderText="Selecciona una fecha y hora"
                            customInput={<TextField fullWidth margin="normal" />}
                        />
                        <TextField
                            label="Motivo"
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                        {error && <Typography color="error">{error}</Typography>}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="primary">Cancelar</Button>
                    <Button onClick={handleSubmit} color="primary">
                        {isEditing ? 'Guardar Cambios' : 'Reservar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ReservarCita;
