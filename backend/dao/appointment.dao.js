import Appointment from '../models/appointment.model.js';
import Doctor from '../models/doctor.model.js';
import User from '../models/user.model.js';

const patientFields = 'firstName lastName email phone nic';
const doctorFields = 'firstName lastName email phone';

const populatePeople = (query) =>
  query
    .populate('patientId', patientFields)
    .populate('doctorId', doctorFields);

const createAppointment = (appointmentData) =>
  Appointment.create(appointmentData);

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

const findAppointmentById = (id) =>
  populatePeople(Appointment.findById(id));

const findAppointmentDocumentById = (id) =>
  Appointment.findById(id);

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

const findDoctorProfile = (userId) =>
  Doctor.findOne({ userId }).populate(
    'userId',
    'firstName lastName role isActive'
  );

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
