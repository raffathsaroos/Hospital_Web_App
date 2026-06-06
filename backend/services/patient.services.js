import patientDao from '../dao/patient.dao.js';

const buildPatientFilter = ({ status, bloodGroup, search } = {}) => {
	const filter = {};

	if (status) filter.status = status;
	if (bloodGroup) filter.bloodGroup = bloodGroup;

	if (search) {
		filter.$or = [
			{ firstName: { $regex: search, $options: 'i' } },
			{ lastName: { $regex: search, $options: 'i' } },
			{ phone: { $regex: search, $options: 'i' } },
			{ email: { $regex: search, $options: 'i' } },
			{ nationalId: { $regex: search, $options: 'i' } }
		];
	}

	return filter;
};

const ensureUniquePatient = async ({ email, nationalId }, patientIdToSkip = null) => {
	if (email) {
		const patient = await patientDao.findPatientByEmail(email);
		if (patient && patient._id.toString() !== patientIdToSkip) {
			const error = new Error('Patient email already exists.');
			error.statusCode = 400;
			throw error;
		}
	}

	if (nationalId) {
		const patient = await patientDao.findPatientByNationalId(nationalId);
		if (patient && patient._id.toString() !== patientIdToSkip) {
			const error = new Error('Patient national ID already exists.');
			error.statusCode = 400;
			throw error;
		}
	}
};

const createPatient = async (patientData) => {
	await ensureUniquePatient(patientData);
	const patient = await patientDao.createPatient(patientData);

	return {
		message: 'Patient created successfully!',
		patient
	};
};

const getPatients = async (query) => {
	const patients = await patientDao.findPatients(buildPatientFilter(query));

	return {
		message: 'Patients fetched successfully!',
		patients
	};
};

const getPatientById = async (patientId) => {
	const patient = await patientDao.findPatientById(patientId);

	if (!patient) {
		const error = new Error('Patient not found.');
		error.statusCode = 404;
		throw error;
	}

	return {
		message: 'Patient fetched successfully!',
		patient
	};
};

const updatePatient = async (patientId, patientData) => {
	await ensureUniquePatient(patientData, patientId);
	const patient = await patientDao.updatePatientById(patientId, patientData);

	if (!patient) {
		const error = new Error('Patient not found.');
		error.statusCode = 404;
		throw error;
	}

	return {
		message: 'Patient updated successfully!',
		patient
	};
};

const deletePatient = async (patientId) => {
	const patient = await patientDao.deletePatientById(patientId);

	if (!patient) {
		const error = new Error('Patient not found.');
		error.statusCode = 404;
		throw error;
	}

	return {
		message: 'Patient deleted successfully!'
	};
};

export default {
	createPatient,
	getPatients,
	getPatientById,
	updatePatient,
	deletePatient
};
