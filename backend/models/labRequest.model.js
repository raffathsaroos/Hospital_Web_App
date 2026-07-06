import mongoose from "mongoose";

const LabRequestSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    testName: { type: String, required: true, trim: true },
    instructions: { type: String, trim: true, maxlength: 2000, default: "" },
    result: { type: String, trim: true, maxlength: 5000, default: "" },
    price: { type: Number, min: 0.01, default: null },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("LabRequest", LabRequestSchema);
