import patientService from "../services/patient.services.js";

// Turns patient failures into useful API responses.
const sendError = (res, error) => {
  if (error.name === "CastError") {
    return res.status(400).json({ message: "Invalid patient ID." });
  }

  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map(({ message }) => message);
    return res.status(400).json({ message: "Validation failed.", errors });
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || error.keyValue || {})[0];
    return res.status(409).json({
      message: `A patient with this ${field || "value"} already exists.`,
    });
  }

  return res.status(error.statusCode || 500).json({
    message: error.message || "Internal server error.",
  });
};

// Registers a patient account and profile.
const register = async (req, res) => {
  try {
    const patient = await patientService.registerPatient(req.body);
    res.status(201).json({
      message: "Patient registered successfully.",
      patient,
    });
  } catch (error) {
    sendError(res, error);
  }
};

// Returns every patient record for the management list.
const getAll = async (req, res) => {
  try {
    const patients = await patientService.getPatients();
    res.status(200).json({ count: patients.length, patients });
  } catch (error) {
    sendError(res, error);
  }
};

// Returns one patient selected by profile ID.
const getById = async (req, res) => {
  try {
    const patient = await patientService.getPatient(req.params.id);
    res.status(200).json({ patient });
  } catch (error) {
    sendError(res, error);
  }
};

// Saves allowed changes to a patient's account details.
const update = async (req, res) => {
  try {
    const patient = await patientService.updatePatient(req.params.id, req.body);
    res.status(200).json({
      message: "Patient updated successfully.",
      patient,
    });
  } catch (error) {
    sendError(res, error);
  }
};

// Enables or disables a patient account.
const setActiveStatus = async (req, res) => {
  try {
    if (typeof req.body.isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be a boolean." });
    }

    const patient = await patientService.setPatientActiveStatus(
      req.params.id,
      req.body.isActive,
    );

    res.status(200).json({
      message: `Patient ${patient.user.isActive ? "activated" : "deactivated"} successfully.`,
      patient,
    });
  } catch (error) {
    sendError(res, error);
  }
};

export default {
  register,
  getAll,
  getById,
  update,
  setActiveStatus,
};
