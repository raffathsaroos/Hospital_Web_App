import mongoose from 'mongoose';
import { DEPARTMENTS } from '../constants/departments.const.js';

export const APPOINTMENT_TYPES = [
  'OPD',
  'IPD',
  'Emergency',
];

export const APPOINTMENT_STATUSES = [
  'Pending',
  'Accepted',
  'Rejected',
  'Completed',
  'Cancelled',
];

const timeSlotPattern =
  /^([01]\d|2[0-3]):[0-5]\d - ([01]\d|2[0-3]):[0-5]\d$/;

// Booking state lives here; clinical and payment records remain separate.
const AppointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor is required'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      enum: {
        values: DEPARTMENTS,
        message: 'Invalid department',
      },
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      trim: true,
      match: [
        timeSlotPattern,
        'Time slot must use HH:mm - HH:mm format',
      ],
    },
    appointmentType: {
      type: String,
      required: [true, 'Appointment type is required'],
      enum: {
        values: APPOINTMENT_TYPES,
        message: 'Invalid appointment type',
      },
    },
    status: {
      type: String,
      enum: {
        values: APPOINTMENT_STATUSES,
        message: 'Invalid appointment status',
      },
      default: 'Pending',
    },
    hasVisited: {
      type: Boolean,
      default: false,
    },
    tokenNumber: {
      type: Number,
      default: null,
      min: [1, 'Token number must be at least 1'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: '',
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// These indexes match receptionist lists and the doctor's dated queue.
AppointmentSchema.index({ status: 1, appointmentDate: 1 });
AppointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
AppointmentSchema.index({ patientId: 1, appointmentDate: -1 });

const Appointment = mongoose.model(
  'Appointment',
  AppointmentSchema
);

export default Appointment;
