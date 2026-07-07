import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import User from "../models/user.model.js";
import BookingCounter from "../models/bookingCounter.model.js";

const patientFields = "firstName lastName email phone nic";
const doctorFields = "firstName lastName email phone";

// Adds safe patient and doctor details to an appointment query.
const populatePeople = (query) =>
  query.populate("patientId", patientFields).populate("doctorId", doctorFields);

// Inserts one appointment record.
const createAppointment = (appointmentData) =>
  Appointment.create(appointmentData);

// Generates a daily sequence in the same order booking requests are stored.
const getNextBookingOrder = async ({ doctorId, appointmentDate, timeSlot }) => {
  const day = new Date(appointmentDate).toISOString().slice(0, 10);
  const slotKey = `${doctorId}:${day}:${timeSlot}`;
  const counterId = `booking:${slotKey}`;
  const existingCounter = await BookingCounter.findById(counterId);

  if (!existingCounter) {
    const existingBookings = await Appointment.countDocuments({
      doctorId,
      appointmentDate,
      timeSlot,
    });
    await BookingCounter.updateOne(
      { _id: counterId },
      { $setOnInsert: { sequence: existingBookings } },
      { upsert: true },
    );
  }

  const counter = await BookingCounter.findByIdAndUpdate(
    counterId,
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  return counter.sequence;
};

// Returns a sorted appointment page and its full count.
const findAppointments = async (filter, page, limit) => {
  const skip = (page - 1) * limit;

  const [appointments, total] = await Promise.all([
    populatePeople(
      Appointment.find(filter)
        .sort({ appointmentDate: 1, timeSlot: 1 })
        .skip(skip)
        .limit(limit),
    ),
    Appointment.countDocuments(filter),
  ]);

  return {
    appointments,
    total,
  };
};

// Finds one appointment with its patient and doctor details.
const findAppointmentById = (id) => populatePeople(Appointment.findById(id));

// Finds the raw document needed for updates.
const findAppointmentDocumentById = (id) => Appointment.findById(id);

// Looks for another active booking in the same slot.
const countActiveSlotBookings = ({
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
      $in: ["Pending", "Confirmed", "Paid"],
    },
  };

  if (excludeId) {
    filter._id = {
      $ne: excludeId,
    };
  }

  return Appointment.countDocuments(filter);
};

// Loads the doctor schedule linked to a user account.
const findDoctorProfile = (userId) =>
  Doctor.findOne({ userId }).populate(
    "userId",
    "firstName lastName role isActive",
  );

// Confirms that a patient account exists and is active.
const findActivePatient = (id) =>
  User.findOne({
    _id: id,
    role: "Patient",
    isActive: true,
  });

const findDoctorQueue = (doctorId, date) => {
  const filter = { doctorId, status: "Paid" };
  if (date) filter.appointmentDate = date;
  return populatePeople(
    Appointment.find(filter).sort({
      appointmentDate: 1,
      timeSlot: 1,
      createdAt: 1,
    }),
  );
};

export default {
  createAppointment,
  getNextBookingOrder,
  findAppointments,
  findAppointmentById,
  findAppointmentDocumentById,
  countActiveSlotBookings,
  findDoctorProfile,
  findActivePatient,
  findDoctorQueue,
};
