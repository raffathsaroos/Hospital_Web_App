import mongoose from 'mongoose';

const DiagnosisSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symptoms: { type: String, trim: true, maxlength: 2000, default: '' },
  diagnosis: { type: String, required: true, trim: true, maxlength: 3000 },
  treatmentPlan: { type: String, trim: true, maxlength: 3000, default: '' },
  notes: { type: String, trim: true, maxlength: 2000, default: '' },
}, { timestamps: true });

export default mongoose.model('Diagnosis', DiagnosisSchema);
