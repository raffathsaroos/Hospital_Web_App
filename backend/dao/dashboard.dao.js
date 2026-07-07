import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import "../models/user.model.js";

// Loads visit records and pricing profiles used by dashboard aggregations.
const findAppointmentsForAnalytics = (filter) =>
  Appointment.find(filter)
    .select("doctorId patientId guestPatient appointmentDate timeSlot status")
    .populate("doctorId", "firstName lastName")
    .lean();

const findDoctorFees = (userIds) =>
  Doctor.find({ userId: { $in: userIds } })
    .select("userId consultationFee")
    .lean();

export default { findAppointmentsForAnalytics, findDoctorFees };
