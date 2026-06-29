import appointmentService from '../services/appointment.services.js';

// Keep appointment errors predictable for both public and staff screens.
const sendError = (res, error) => {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(
      ({ message }) => message
    );

    return res.status(400).json({
      message: 'Validation failed.',
      errors,
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid appointment data.',
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      message: 'Selected time slot is already booked.',
    });
  }

  return res.status(error.statusCode || 500).json({
    message: error.message || 'Internal server error.',
  });
};

const createPublic = async (req, res) => {
  try {
    const appointment =
      await appointmentService.createPublicAppointment(req.body);

    res.status(201).json({
      message: 'Appointment request submitted successfully.',
      appointment,
    });
  } catch (error) {
    sendError(res, error);
  }
};

const createByStaff = async (req, res) => {
  try {
    const appointment =
      await appointmentService.createStaffAppointment(req.body);

    res.status(201).json({
      message: 'Appointment created successfully.',
      appointment,
    });
  } catch (error) {
    sendError(res, error);
  }
};

const getAll = async (req, res) => {
  try {
    const result = await appointmentService.getAppointments(
      req.query,
      req.user
    );

    res.status(200).json(result);
  } catch (error) {
    sendError(res, error);
  }
};

const getById = async (req, res) => {
  try {
    const appointment = await appointmentService.getAppointment(
      req.params.id,
      req.user
    );

    res.status(200).json({ appointment });
  } catch (error) {
    sendError(res, error);
  }
};

const reschedule = async (req, res) => {
  try {
    const appointment =
      await appointmentService.rescheduleAppointment(
        req.params.id,
        req.body
      );

    res.status(200).json({
      message: 'Appointment rescheduled successfully.',
      appointment,
    });
  } catch (error) {
    sendError(res, error);
  }
};

const updateStatus = async (req, res) => {
  try {
    const appointment =
      await appointmentService.updateAppointmentStatus(
        req.params.id,
        req.body,
        req.user
      );

    res.status(200).json({
      message: 'Appointment status updated successfully.',
      appointment,
    });
  } catch (error) {
    sendError(res, error);
  }
};

export default {
  createPublic,
  createByStaff,
  getAll,
  getById,
  reschedule,
  updateStatus,
};
