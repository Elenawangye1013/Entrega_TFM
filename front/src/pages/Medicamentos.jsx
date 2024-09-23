import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Typography, Box, Container, TextField, MenuItem, Grid, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Select } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './styles/ReservarCita.css';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';

const Medicamentos = () => {
    const [userData, setUserData] = useState(null);
    const [medicamentos, setMedicamentos] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [currentMedicamento, setCurrentMedicamento] = useState(null);
    const [selectedPet, setSelectedPet] = useState('');
    const [pets, setPets] = useState([]);
    const [error, setError] = useState('');
    const [dateError, setDateError] = useState('');


    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const email = localStorage.getItem('userEmail');
                if (!email) {
                    setError('No email encontrado en localStorage');
                    return;
                }

                const userResponse = await axios.get('http://localhost:5001/api/auth/user-data', { params: { email } });
                const user = userResponse.data.user || { citas: [] };
                const petsData = userResponse.data.pets || [];
                
                setUserData(user); 
                setPets(petsData);
                setSelectedPet(petsData.length > 0 ? petsData[0].id_mascota : '');

                const medicamentosResponse = await axios.get('http://localhost:5001/api/auth/get-medicamentos', {
                    params: { email }
                  });
          
                setMedicamentos(medicamentosResponse.data || []);
    
            } catch (error) {
                setError('Error recuperando data');
                console.error('Error recuperando data:', error);
            }
        };
    
        fetchUserData();
    }, []);

    const handleOpenModal = (medicamento) => {
        setCurrentMedicamento(medicamento || {
            nombre_medicamento: '',
            dosis: '',
            fecha_inicio: null,
            fecha_fin: null,
            hora_toma: '',
            intervalo_toma: '',
            notas: ''
        });
        setSelectedPet(medicamento ? medicamento.id_mascota : (pets.length > 0 ? pets[0].id_mascota : ''));
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setCurrentMedicamento(null);
        setSelectedPet('');
    };

    const formatDateForMySQL = (date) => {
        if (!date) return null;
        return format(date, 'yyyy-MM-dd');
    };
    const validateDates = () => {
        const startDate = new Date(currentMedicamento.fecha_inicio);
        const endDate = new Date(currentMedicamento.fecha_fin);
        if (endDate < startDate) {
          setDateError('La fecha de fin no puede ser anterior a la fecha de inicio.');
          return false;
        }
        setDateError('');
        return true;
      };
    
    const handleSaveMedicamento = async () => {
        if (!validateDates()) {
            return; 
          }
        try {
            const formattedMedicamento = {
                ...currentMedicamento,
                fecha_inicio: formatDateForMySQL(currentMedicamento.fecha_inicio),
                fecha_fin: formatDateForMySQL(currentMedicamento.fecha_fin),
            };
    
            if (currentMedicamento.id_medicamento) {
                await axios.put(`http://localhost:5001/api/auth/medicamentos/${currentMedicamento.id_medicamento}`, formattedMedicamento);
            } else {
                await axios.post('http://localhost:5001/api/auth/add-medicamento', {
                    ...formattedMedicamento,
                    id_cliente: userData.id_cliente,
                    id_mascota: selectedPet
                });
            }
            // actualizar lista de medicamentos 

            const email = localStorage.getItem('userEmail');
            const medicamentosResponse = await axios.get('http://localhost:5001/api/auth/get-medicamentos', { params: { email } });
            setMedicamentos(medicamentosResponse.data || []);
            handleCloseModal();
        } catch (error) {
            setError('Error guardar medicamento');
            console.error('Error guardar medicamento:', error);
        }
    };

    const handleDeleteMedicamento = async (id_medicamento) => {
        try {
            await axios.delete(`http://localhost:5001/api/auth/medicamentos/${id_medicamento}`);
            setMedicamentos(medicamentos.filter(medicamento => medicamento.id_medicamento !== id_medicamento));
            console.log('Medicamento eliminado correctamente');
        } catch (error) {
            setError('Error eliminando medicamento');
            console.error('Error eliminando medicamento:', error);
        }
    };
    

    return (
        <Container className="container">
            <Box>
                <Box className="pets-header" display="flex" justifyContent="end" alignItems="center" mb={2}>
                    <IconButton color="primary" aria-label="add medicamento" onClick={() => handleOpenModal()}>
                        <AddIcon />
                    </IconButton>
                </Box>
                <Grid container spacing={2}>
                    {medicamentos
                        .filter(medicamento => new Date(medicamento.fecha_fin) >= new Date()) 
                        .map((medicamento) => (
                            <Grid item xs={12} sm={6} md={4} key={medicamento.id_medicamento}>
                                <Box className="pet-card" p={2} border={1} borderRadius={1} boxShadow={1}>
                                    <Box className="pet-info" mb={2}>
                                        <Typography variant="body1"><strong>Medicamento:</strong> {medicamento.nombre_medicamento}</Typography>
                                        <Typography variant="body1"><strong>Fecha Inicio:</strong> {format(new Date(medicamento.fecha_inicio), 'dd/MM/yyyy')}</Typography>
                                        <Typography variant="body1"><strong>Fecha Fin:</strong> {format(new Date(medicamento.fecha_fin), 'dd/MM/yyyy')}</Typography>
                                        <Typography variant="body1"><strong>Mascota:</strong> {medicamento.nombre_mascota}</Typography>
                                        <Typography variant="body1"><strong>Notas:</strong> {medicamento.notas}</Typography>
                                    </Box>
                                    <Box className="pet-actions" display="flex" justifyContent="flex-end">
                                        <IconButton color="primary" onClick={() => handleOpenModal(medicamento)} aria-label="edit medicamento">
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton color="primary" onClick={() => handleDeleteMedicamento(medicamento.id_medicamento)} aria-label="delete medicamento" sx={{ ml: 1 }}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                </Grid>

            </Box>

            <Dialog open={openModal} onClose={handleCloseModal}>
            <DialogTitle>{currentMedicamento?.id_medicamento ? 'Editar Medicamento' : 'Añadir Medicamento'}</DialogTitle>                <DialogContent>
                    
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
                        label="Nombre del Medicamento"
                        fullWidth
                        margin="normal"
                        value={currentMedicamento?.nombre_medicamento || ''}
                        onChange={(e) => setCurrentMedicamento({ ...currentMedicamento, nombre_medicamento: e.target.value })}
                    />
                    <TextField
                        label="Dosis"
                        fullWidth
                        margin="normal"
                        value={currentMedicamento?.dosis || ''}
                        onChange={(e) => setCurrentMedicamento({ ...currentMedicamento, dosis: e.target.value })}
                    />
                    <DatePicker
                        selected={currentMedicamento?.fecha_inicio ? new Date(currentMedicamento.fecha_inicio) : null}
                        onChange={(date) => setCurrentMedicamento({ ...currentMedicamento, fecha_inicio: date })}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Fecha Inicio"
                    />
                    <DatePicker
                        selected={currentMedicamento?.fecha_fin ? new Date(currentMedicamento.fecha_fin) : null}
                        onChange={(date) => setCurrentMedicamento({ ...currentMedicamento, fecha_fin: date })}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Fecha Fin"
                    />
                    <TextField
                        label="Hora de Toma"
                        type="time"
                        fullWidth
                        margin="normal"
                        value={currentMedicamento?.hora_toma || ''}
                        onChange={(e) => setCurrentMedicamento({ ...currentMedicamento, hora_toma: e.target.value })}
                    />
                    <TextField
                        label="Intervalo de Toma (horas)"
                        type="number"
                        fullWidth
                        margin="normal"
                        value={currentMedicamento?.intervalo_toma || ''}
                        onChange={(e) => setCurrentMedicamento({ ...currentMedicamento, intervalo_toma: e.target.value })}
                    />
                    <TextField
                        label="Notas"
                        multiline
                        rows={4}
                        fullWidth
                        margin="normal"
                        value={currentMedicamento?.notas || ''}
                        onChange={(e) => setCurrentMedicamento({ ...currentMedicamento, notas: e.target.value })}
                        error={Boolean(dateError)} 
                        helperText={dateError} 
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="secondary">Cancelar</Button>
                    <Button onClick={handleSaveMedicamento} color="primary">Guardar</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Medicamentos;
