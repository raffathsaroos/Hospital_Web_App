import mongoose from "mongoose";

// Patient-only data belongs here; shared personal details live in User.
const PatientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

// Registers the patient profile schema with Mongoose.
const Patient = mongoose.model("Patient", PatientSchema);

export default Patient;
