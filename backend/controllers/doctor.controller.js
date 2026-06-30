import doctorService from '../services/doctor.services.js';

const sendError = (res, error) => {
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid doctor ID.' });
  }

  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(({ message }) => message);
    return res.status(400).json({ message: 'Validation failed.', errors });
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || error.keyValue || {})[0];
    return res.status(409).json({
      message: `A doctor with this ${field || 'value'} already exists.`,
    });
  }

  return res.status(error.statusCode || 500).json({
    message: error.message || 'Internal server error.',
  });
};

const create = async (req, res) => {
  try {
    const doctor = await doctorService.addDoctor(req.body);
    res.status(201).json({
      message: 'Doctor added successfully.',
      doctor,
    });
  } catch (error) {
    sendError(res, error);
  }
};

const getAll = async (_req, res) => {
  try {
    const doctors = await doctorService.getDoctors();
    res.status(200).json({ count: doctors.length, doctors });
  } catch (error) {
    sendError(res, error);
  }
};

const getById = async (req, res) => {
  try {
    const doctor = await doctorService.getDoctor(req.params.id);
    res.status(200).json({ doctor });
  } catch (error) {
    sendError(res, error);
  }
};

const remove = async (req, res) => {
  try {
    await doctorService.deactivateDoctor(req.params.id);
    res.status(200).json({
      message: 'Doctor deactivated and hidden successfully.',
    });
  } catch (error) {
    sendError(res, error);
  }
};

export default {
  create,
  getAll,
  getById,
  remove,
};
