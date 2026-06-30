import mongoose from 'mongoose';
import { DEPARTMENTS } from '../constants/departments.const.js';

// Lists the visit types accepted during booking.
export const APPOINTMENT_TYPES = [
  'OPD',
  'IPD',
  'Emergency',
];

// Defines every stage in the appointment workflow.
export const APPOINTMENT_STATUSES = [
  'Pending',
  'Accepted',
  'Rejected',
  'Completed',
  'Cancelled',
];

const timeSlotPattern =
  /^([01]\d|2[0-3]):[0-5]\d - ([01]\d|2[0-3]):[0-5]\d$/;

const GuestPatientSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Guest first name is required'],
      trim: true,
      minlength: [2, 'Guest first name must be at least 2 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Guest last name is required'],
      trim: true,
      minlength: [2, 'Guest last name must be at least 2 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Guest phone number is required'],
      trim: true,
      match: [/^[0-9]{10}$/, 'Guest phone must contain 10 digits'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Guest email must be valid'],
      default: null,
    },
  },
  {
    _id: false,
  }
);

// Booking state lives here; clinical and payment records remain separate.
const AppointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    guestPatient: {
      type: GuestPatientSchema,
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
      validate: {
        validator(value) {
          if (!timeSlotPattern.test(value)) return true;

          const [startTime, endTime] = value.split(' - ');
          return endTime > startTime;
        },
        message: 'Time slot end must be later than its start',
      },
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
    isSlotReserved: {
      type: Boolean,
      default: true,
      select: false,
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
AppointmentSchema.index(
  {
    doctorId: 1,
    appointmentDate: 1,
    timeSlot: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isSlotReserved: true,
    },
  }
);

// Every booking must identify one patient source, never two.
AppointmentSchema.pre('validate', function validatePatientSource() {
  const hasRegisteredPatient = Boolean(this.patientId);
  const hasGuestPatient = Boolean(this.guestPatient);

  if (hasRegisteredPatient === hasGuestPatient) {
    this.invalidate(
      'patientId',
      'Provide either patientId or guestPatient'
    );
  }
});

// A terminal status releases the unique slot for another booking.
AppointmentSchema.pre('save', function syncSlotReservation() {
  this.isSlotReserved = ['Pending', 'Accepted'].includes(this.status);
});

// Registers the booking schema with Mongoose.
const Appointment = mongoose.model(
  'Appointment',
  AppointmentSchema
);

export default Appointment;
