import patientService from '../services/patient.services.js';

const createPatient = async (req, res) => {
	try {
		const result = await patientService.createPatient(req.body);
		res.status(201).json(result);
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message || 'Server error while creating patient.'
		});
	}
};

const getPatients = async (req, res) => {
	try {
		const result = await patientService.getPatients(req.query);
		res.status(200).json(result);
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message || 'Server error while fetching patients.'
		});
	}
};

const getPatientById = async (req, res) => {
	try {
		const result = await patientService.getPatientById(req.params.id);
		res.status(200).json(result);
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message || 'Server error while fetching patient.'
		});
	}
};

const updatePatient = async (req, res) => {
	try {
		const result = await patientService.updatePatient(req.params.id, req.body);
		res.status(200).json(result);
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message || 'Server error while updating patient.'
		});
	}
};

const deletePatient = async (req, res) => {
	try {
		const result = await patientService.deletePatient(req.params.id);
		res.status(200).json(result);
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message || 'Server error while deleting patient.'
		});
	}
};

export default {
	createPatient,
	getPatients,
	getPatientById,
	updatePatient,
	deletePatient
};
