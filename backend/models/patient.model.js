import mongoose from 'mongoose';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const PATIENT_STATUSES = ['active', 'inactive', 'discharged'];

const PatientSchema = new mongoose.Schema( {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
    },

    allergies: {
      type: [String],
      default: [],
    },

    chronicConditions: {
      type: [String],
      default: [],
    },

    emergencyContact: {
      name: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      relationship: {
        type: String,
        trim: true, // "Father", "Spouse", "Sibling" etc.
      },
    },

    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      district: { type: String, trim: true },
      postalCode: { type: String, trim: true },
    },
    status: {
        type: String,
        enum: PATIENT_STATUSES,
    }
  },
  {
    timestamps: true, // auto adds createdAt and updatedAt
  }
);

// Index for fast lookup by userId
PatientSchema.index({ userId: 1 }, { timestamps: true });

const Patient = mongoose.model('Patient', PatientSchema);
export default Patient;