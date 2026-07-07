import mongoose from "mongoose";

const MedicineItemSchema = new mongoose.Schema(
  {
    medicineName: { type: String, required: true, trim: true },
    dosageQuantity: { type: Number, required: true, min: 0.01 },
    frequencyPerDay: { type: Number, required: true, min: 1 },
    numberOfDays: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0.01 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: true },
);

const PrescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
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
    instructions: { type: String, trim: true, maxlength: 2000, default: "" },
    medicines: { type: [MedicineItemSchema], default: [] },
    status: {
      type: String,
      enum: ["Pending", "Dispensed"],
      default: "Pending",
    },
    grandTotal: { type: Number, min: 0, default: 0 },
    dispensedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    dispensedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("Prescription", PrescriptionSchema);
