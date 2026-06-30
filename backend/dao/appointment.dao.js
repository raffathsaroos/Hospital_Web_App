import Appointment from '../models/appointment.model.js';
import Doctor from '../models/doctor.model.js';
import User from '../models/user.model.js';

const patientFields = 'firstName lastName email phone nic';
const doctorFields = 'firstName lastName email phone';

// Adds safe patient and doctor details to an appointment query.
const populatePeople = (query) =>
  query
    .populate('patientId', patientFields)
    .populate('doctorId', doctorFields);

// Inserts one appointment record.
const createAppointment = (appointmentData) =>
  Appointment.create(appointmentData);

// Returns a sorted appointment page and its full count.
const findAppointments = async (filter, page, limit) => {
  const skip = (page - 1) * limit;

  const [appointments, total] = await Promise.all([
    populatePeople(
      Appointment.find(filter)
        .sort({ appointmentDate: 1, timeSlot: 1 })
        .skip(skip)
        .limit(limit)
    ),
    Appointment.countDocuments(filter),
  ]);

  return {
    appointments,
    total,
  };
};

// Finds one appointment with its patient and doctor details.
const findAppointmentById = (id) =>
  populatePeople(Appointment.findById(id));

// Finds the raw document needed for updates.
const findAppointmentDocumentById = (id) =>
  Appointment.findById(id);

// Looks for another active booking in the same slot.
const findSlotConflict = ({
  doctorId,
  appointmentDate,
  timeSlot,
  excludeId,
}) => {
  const filter = {
    doctorId,
    appointmentDate,
    timeSlot,
    status: {
      $in: ['Pending', 'Accepted'],
    },
  };

  if (excludeId) {
    filter._id = {
      $ne: excludeId,
    };
  }

  return Appointment.findOne(filter);
};

// Loads the doctor schedule linked to a user account.
const findDoctorProfile = (userId) =>
  Doctor.findOne({ userId }).populate(
    'userId',
    'firstName lastName role isActive'
  );

// Confirms that a patient account exists and is active.
const findActivePatient = (id) =>
  User.findOne({
    _id: id,
    role: 'Patient',
    isActive: true,
  });

export default {
  createAppointment,
  findAppointments,
  findAppointmentById,
  findAppointmentDocumentById,
  findSlotConflict,
  findDoctorProfile,
  findActivePatient,
};
