import Doctor from '../models/doctor.model.js';

const userFields =
  'firstName lastName email phone nic dob gender role isActive avatar';

const createDoctor = (doctorData) => Doctor.create(doctorData);

// Inactive users are omitted so soft-deleted doctors stay hidden.
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

const findActiveDoctorById = (id) =>
  Doctor.findById(id).populate({
    path: 'userId',
    match: { isActive: true },
    select: userFields,
  });

const findDoctorById = (id) =>
  Doctor.findById(id).populate('userId', userFields);

export default {
  createDoctor,
  findAllActiveDoctors,
  findActiveDoctorById,
  findDoctorById,
};
