import Doctor from '../models/doctor.model.js';

const userFields =
  'firstName lastName email phone nic dob gender role isActive avatar';

// Inserts one doctor profile.
const createDoctor = (doctorData) => Doctor.create(doctorData);

// Lists profiles whose linked accounts are still active.
const findAllActiveDoctors = async () => {
  const doctors = await Doctor.find()
    .populate({
      path: 'userId',
      match: { isActive: true },
      select: userFields,
    })
    .sort({ createdAt: -1 });

  return doctors.filter((doctor) => doctor.userId);
};

// Finds one visible doctor and safe account details.
const findActiveDoctorById = (id) =>
  Doctor.findById(id).populate({
    path: 'userId',
    match: { isActive: true },
    select: userFields,
  });

// Finds a doctor even when its account is inactive.
const findDoctorById = (id) =>
  Doctor.findById(id).populate('userId', userFields);

export default {
  createDoctor,
  findAllActiveDoctors,
  findActiveDoctorById,
  findDoctorById,
};
