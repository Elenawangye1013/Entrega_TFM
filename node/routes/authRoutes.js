const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const veterinarioController = require('../controllers/veterinarioController');
const petController = require('../controllers/petController');
const citasController = require('../controllers/citasController');
const medicamentosController= require('../controllers/medicamentosController');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/change-plan',  authController.changePlan);
router.post('/contact', authController.contactForm);

router.get('/veterinarios', veterinarioController.getVets);

router.get('/user-data', authController.getUserData);
router.post('/logout', authController.logout);

router.post('/add', petController.addPet);
router.delete('/delete/:id_mascota', petController.deletePet);
router.put('/edit/:id_mascota', petController.updatePet);

router.post('/citas', citasController.createCita);
router.get('/get-citas', citasController.getCitas);
router.delete('/citas/:idCita', citasController.deleteCita);
router.put('/citas/:id_cita', citasController.updateCita);
router.get('/citas/:id_cita', citasController.getCitaById);

router.post('/add-medicamento', medicamentosController.addMedicamento);
router.get('/get-medicamentos', medicamentosController.getMedicamentos);
router.delete('/medicamentos/:id_medicamento', medicamentosController.deleteMedicamento);
router.put('/medicamentos/:id_medicamento', medicamentosController.updateMedicamento);


module.exports = router;

