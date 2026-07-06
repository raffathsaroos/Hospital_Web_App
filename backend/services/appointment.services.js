import mongoose from 'mongoose';
import appointmentDao from '../dao/appointment.dao.js';
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
} from '../models/appointment.model.js';
import { DEPARTMENTS } from '../constants/departments.const.js';

const staffRoles = ['Admin', 'Receptionist'];
const timeSlotPattern =
  /^([01]\d|2[0-3]):[0-5]\d - ([01]\d|2[0-3]):[0-5]\d$/;

// Builds an error with the HTTP status the controller should return.
const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Checks whether a value can be used as a MongoDB ID.
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Stops the request early when an ID has the wrong shape.
const requireValidId = (id, label) => {
  if (!isValidId(id)) {
    throw createError(`Invalid ${label}.`, 400);
  }
};

// Turns a date input into one UTC calendar day.
const parseDate = (value) => {
  const date = new Date(value);

  if (!value || Number.isNaN(date.getTime())) {
    throw createError('Invalid appointment date.', 400);
  }

  date.setUTCHours(0, 0, 0, 0);
  return date;
};

// Keeps new bookings from being placed on an earlier day.
const ensureFutureDate = (date) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  if (date < today) {
    throw createError('Appointment date cannot be in the past.', 400);
  }
};

const ensureFutureTime = (date, timeSlot) => {
  const now = new Date();
  const isToday = date.getUTCFullYear() === now.getFullYear() &&
    date.getUTCMonth() === now.getMonth() && date.getUTCDate() === now.getDate();
  if (!isToday) return;
  const [startTime] = timeSlot.split(' - ');
  if (toMinutes(startTime) <= now.getHours() * 60 + now.getMinutes()) {
    throw createError('Cannot book a time slot that has already passed.', 400);
  }
};

// Converts a clock value into minutes for easy comparison.
const toMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Reads and checks the start and end of one booking slot.
const parseTimeSlot = (timeSlot) => {
  if (!timeSlotPattern.test(timeSlot || '')) {
    throw createError(
      'Time slot must use HH:mm - HH:mm format.',
      400
    );
  }

  const [startTime, endTime] = timeSlot.split(' - ');
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);

  if (end <= start) {
    throw createError('Time slot end must be after its start.', 400);
  }

  return {
    start,
    end,
  };
};

// Checks the fields shared by every booking request.
const ensureRequiredBookingFields = (data) => {
  const requiredFields = [
    'doctorId',
    'appointmentDate',
    'timeSlot',
    'appointmentType',
  ];

  const missingField = requiredFields.find((field) => !data[field]);

  if (missingField) {
    throw createError(`${missingField} is required.`, 400);
  }

  if (!APPOINTMENT_TYPES.includes(data.appointmentType)) {
    throw createError('Invalid appointment type.', 400);
  }
};

// Checks the minimum details needed for a guest booking.
const ensureGuestPatient = (guestPatient) => {
  if (!guestPatient || typeof guestPatient !== 'object') {
    throw createError('Guest patient details are required.', 400);
  }

  const requiredFields = ['firstName', 'lastName', 'phone'];
  const missingField = requiredFields.find(
    (field) => !guestPatient[field]
  );

  if (missingField) {
    throw createError(
      `Guest patient ${missingField} is required.`,
      400
    );
  }
};

// Finds the weekday name used by doctor schedules.
const getWeekDay = (date) =>
  [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ][date.getUTCDay()];

// Confirms that a requested slot fits the doctor's schedule.
const ensureAvailableSlot = (doctor, date, timeSlot) => {
  if (!doctor || !doctor.isAvailable) {
    throw createError('Doctor is not available for booking.', 409);
  }

  if (!doctor.userId || !doctor.userId.isActive) {
    throw createError('Doctor account is inactive.', 409);
  }

  const day = getWeekDay(date);

  if (!doctor.availableDays.includes(day)) {
    throw createError('Doctor is not available on this day.', 409);
  }

  const requested = parseTimeSlot(timeSlot);
  const matchingWindow = doctor.availableTimeSlots.find((slot) => {
    if (slot.day !== day) return false;

    const windowStart = toMinutes(slot.startTime);
    const windowEnd = toMinutes(slot.endTime);
    const duration = requested.end - requested.start;

    return (
      requested.start >= windowStart &&
      requested.end <= windowEnd &&
      duration === slot.slotDurationMinutes &&
      (requested.start - windowStart) % slot.slotDurationMinutes === 0
    );
  });

  if (!matchingWindow) {
    throw createError('Selected time slot is not available.', 409);
  }
};

// Validates a booking and gathers its trusted schedule values.
const prepareBooking = async (data) => {
  ensureRequiredBookingFields(data);
  requireValidId(data.doctorId, 'doctor ID');

  const appointmentDate = parseDate(data.appointmentDate);
  const timeSlot = data.timeSlot.trim();
  ensureFutureDate(appointmentDate);
  parseTimeSlot(timeSlot);
  ensureFutureTime(appointmentDate, timeSlot);

  const doctor = await appointmentDao.findDoctorProfile(data.doctorId);
  ensureAvailableSlot(doctor, appointmentDate, timeSlot);

  const conflict = await appointmentDao.findSlotConflict({
    doctorId: data.doctorId,
    appointmentDate,
    timeSlot,
    excludeId: data.excludeId,
  });

  if (conflict) {
    throw createError('Selected time slot is already booked.', 409);
  }

  return {
    appointmentDate,
    department: doctor.department,
    timeSlot,
  };
};

// Keeps only the fields stored on a new appointment.
const buildBookingData = (data, prepared) => ({
  patientId: data.patientId || null,
  guestPatient: data.guestPatient || null,
  doctorId: data.doctorId,
  department: prepared.department,
  appointmentDate: prepared.appointmentDate,
  timeSlot: prepared.timeSlot,
  appointmentType: data.appointmentType,
  notes: data.notes || '',
});

// Creates an appointment for a patient without an account.
const createPublicAppointment = async (data) => {
  if (data.patientId) {
    throw createError(
      'Public bookings must use guest patient details.',
      400
    );
  }

  ensureGuestPatient(data.guestPatient);
  const prepared = await prepareBooking(data);
  const appointment = await appointmentDao.createAppointment(
    buildBookingData(data, prepared)
  );

  return appointmentDao.findAppointmentById(appointment._id);
};

// Creates a booking entered by hospital staff.
const createStaffAppointment = async (data) => {
  const hasPatientId = Boolean(data.patientId);
  const hasGuestPatient = Boolean(data.guestPatient);

  if (hasPatientId === hasGuestPatient) {
    throw createError(
      'Provide either patientId or guestPatient.',
      400
    );
  }

  if (hasPatientId) {
    requireValidId(data.patientId, 'patient ID');
    const patient = await appointmentDao.findActivePatient(data.patientId);

    if (!patient) {
      throw createError('Active patient account not found.', 404);
    }
  } else {
    ensureGuestPatient(data.guestPatient);
  }

  const prepared = await prepareBooking(data);
  const appointment = await appointmentDao.createAppointment(
    buildBookingData(data, prepared)
  );

  return appointmentDao.findAppointmentById(appointment._id);
};

// Builds a safe appointment filter for the current user's role.
const buildListFilter = (query, actor) => {
  const filter = {};

  if (actor.role === 'Doctor') {
    filter.doctorId = actor._id;
  } else if (actor.role === 'Patient') {
    filter.patientId = actor._id;
  } else {
    if (query.doctorId) {
      requireValidId(query.doctorId, 'doctor ID');
      filter.doctorId = query.doctorId;
    }

    if (query.patientId) {
      requireValidId(query.patientId, 'patient ID');
      filter.patientId = query.patientId;
    }
  }

  if (query.status) {
    if (!APPOINTMENT_STATUSES.includes(query.status)) {
      throw createError('Invalid appointment status.', 400);
    }

    filter.status = query.status;
  }

  if (query.department) {
    if (!DEPARTMENTS.includes(query.department)) {
      throw createError('Invalid department.', 400);
    }

    filter.department = query.department;
  }

  if (query.date) {
    filter.appointmentDate = parseDate(query.date);
  }

  return filter;
};

// Returns one page of appointments the user may view.
const getAppointments = async (query, actor) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const requestedLimit = Number.parseInt(query.limit, 10) || 20;
  const limit = Math.min(Math.max(requestedLimit, 1), 100);
  const filter = buildListFilter(query, actor);
  const result = await appointmentDao.findAppointments(
    filter,
    page,
    limit
  );

  return {
    ...result,
    page,
    limit,
    pages: Math.ceil(result.total / limit),
  };
};

// Checks whether the current user owns or manages an appointment.
const canAccessAppointment = (appointment, actor) => {
  if (staffRoles.includes(actor.role)) return true;

  const patientId = appointment.patientId?._id || appointment.patientId;
  const doctorId = appointment.doctorId?._id || appointment.doctorId;

  if (actor.role === 'Patient') {
    return patientId?.toString() === actor._id.toString();
  }

  if (actor.role === 'Doctor') {
    return doctorId?.toString() === actor._id.toString();
  }

  return false;
};

// Finds one appointment after checking access rights.
const getAppointment = async (id, actor) => {
  requireValidId(id, 'appointment ID');
  const appointment = await appointmentDao.findAppointmentById(id);

  if (!appointment) {
    throw createError('Appointment not found.', 404);
  }

  if (!canAccessAppointment(appointment, actor)) {
    throw createError('You cannot access this appointment.', 403);
  }

  return appointment;
};

// Moves a pending appointment to another valid slot.
const rescheduleAppointment = async (id, data) => {
  requireValidId(id, 'appointment ID');
  const appointment =
    await appointmentDao.findAppointmentDocumentById(id);

  if (!appointment) {
    throw createError('Appointment not found.', 404);
  }

  if (appointment.status !== 'Pending') {
    throw createError(
      'Only pending appointments can be rescheduled.',
      409
    );
  }

  const bookingData = {
    doctorId: data.doctorId || appointment.doctorId,
    appointmentDate:
      data.appointmentDate || appointment.appointmentDate,
    timeSlot: data.timeSlot || appointment.timeSlot,
    appointmentType:
      data.appointmentType || appointment.appointmentType,
  };

  const prepared = await prepareBooking({
    ...bookingData,
    excludeId: appointment._id,
  });

  appointment.doctorId = bookingData.doctorId;
  appointment.department = prepared.department;
  appointment.appointmentDate = prepared.appointmentDate;
  appointment.timeSlot = prepared.timeSlot;
  appointment.appointmentType = bookingData.appointmentType;

  if (data.notes !== undefined) {
    appointment.notes = data.notes;
  }

  await appointment.save();
  return appointmentDao.findAppointmentById(appointment._id);
};

const statusTransitions = {
  Pending: ['Confirmed', 'Rejected', 'Cancelled'],
  Confirmed: ['Paid', 'Cancelled'],
  Paid: ['InQueue', 'Cancelled'],
  InQueue: ['Diagnosed', 'Cancelled'],
  Rejected: [],
  Diagnosed: [],
  Cancelled: [],
};

// Checks whether a role may apply the requested status.
const ensureRoleCanSetStatus = (appointment, actor, nextStatus) => {
  if (actor.role === 'Admin') return;

  if (actor.role === 'Receptionist' && ['Confirmed', 'Paid', 'InQueue', 'Rejected', 'Cancelled'].includes(nextStatus)) return;

  if (actor.role === 'Patient') {
    if (
      appointment.patientId?.toString() === actor._id.toString() &&
      nextStatus === 'Cancelled'
    ) {
      return;
    }
  }

  if (actor.role === 'Doctor') {
    const ownsAppointment =
      appointment.doctorId.toString() === actor._id.toString();
    const doctorStatus = ['Rejected', 'Diagnosed'].includes(nextStatus);

    if (ownsAppointment && doctorStatus) return;
  }

  throw createError(
    'You cannot apply this appointment status.',
    403
  );
};

// Applies a valid status change and its related details.
const updateAppointmentStatus = async (id, data, actor) => {
  requireValidId(id, 'appointment ID');

  const aliases = { Accepted: 'Confirmed', Completed: 'Diagnosed' };
  const nextStatus = aliases[data.status] || data.status;

  if (!APPOINTMENT_STATUSES.includes(nextStatus)) {
    throw createError('Invalid appointment status.', 400);
  }

  const appointment =
    await appointmentDao.findAppointmentDocumentById(id);

  if (!appointment) {
    throw createError('Appointment not found.', 404);
  }

  ensureRoleCanSetStatus(appointment, actor, nextStatus);

  if (!statusTransitions[appointment.status]?.includes(nextStatus)) {
    throw createError(
      `Cannot change ${appointment.status} to ${nextStatus}.`,
      409
    );
  }

  if (nextStatus === 'Rejected' && !data.rejectionReason?.trim()) {
    throw createError('Rejection reason is required.', 400);
  }

  appointment.status = nextStatus;
  appointment.rejectionReason =
    nextStatus === 'Rejected' ? data.rejectionReason : '';

  if (nextStatus === 'Confirmed') appointment.confirmedAt = new Date();
  if (nextStatus === 'Paid') appointment.paidAt = new Date();
  if (nextStatus === 'InQueue') appointment.queuedAt = new Date();
  if (nextStatus === 'Diagnosed') {
    appointment.hasVisited = true;
    appointment.diagnosedAt = new Date();
  }

  await appointment.save();
  return appointmentDao.findAppointmentById(appointment._id);
};

const getDoctorQueue = async (actor, dateValue) => {
  if (actor.role !== 'Doctor') throw createError('Only doctors can access their queue.', 403);
  const date = dateValue ? parseDate(dateValue) : undefined;
  return appointmentDao.findDoctorQueue(actor._id, date);
};

export default {
  createPublicAppointment,
  createStaffAppointment,
  getAppointments,
  getAppointment,
  rescheduleAppointment,
  updateAppointmentStatus,
  getDoctorQueue,
};
