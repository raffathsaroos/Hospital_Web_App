import mongoose from "mongoose";
import { DEPARTMENTS } from "../constants/departments.const.js";
import { WEEK_DAYS } from "../constants/weekdays.const.js";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

// A slot is embedded because it has no lifecycle outside its doctor.
const AvailableTimeSlotSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: [true, "Time slot day is required"],
      enum: {
        values: WEEK_DAYS,
        message: "Invalid time slot day",
      },
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: [timePattern, "Start time must use HH:mm format"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: [timePattern, "End time must use HH:mm format"],
      validate: {
        validator(value) {
          return !this.startTime || value > this.startTime;
        },
        message: "End time must be later than start time",
      },
    },
    slotDurationMinutes: {
      type: Number,
      default: 30,
      min: [5, "Slot duration must be at least 5 minutes"],
      max: [480, "Slot duration cannot exceed 480 minutes"],
    },
  },
  {
    _id: false,
  },
);

// Doctor-only details stay separate from the shared User account.
const DoctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      unique: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      enum: {
        values: DEPARTMENTS,
        message: "Invalid department",
      },
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: [true, "License number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    qualifications: {
      type: [String],
      default: [],
      // Removes extra space from every saved qualification.
      set: (values) => values.map((value) => value.trim()),
    },
    experience: {
      type: Number,
      required: [true, "Experience is required"],
      min: [0, "Experience cannot be negative"],
    },
    consultationFee: {
      type: Number,
      required: [true, "Consultation fee is required"],
      min: [0, "Consultation fee cannot be negative"],
    },
    availableDays: {
      type: [String],
      default: [],
      enum: {
        values: WEEK_DAYS,
        message: "Invalid available day",
      },
    },
    availableTimeSlots: {
      type: [AvailableTimeSlotSchema],
      default: [],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Supports the public doctor list and receptionist availability filters.
DoctorSchema.index({ department: 1, isAvailable: 1 });

// Registers the doctor profile schema with Mongoose.
const Doctor = mongoose.model("Doctor", DoctorSchema);

export default Doctor;
