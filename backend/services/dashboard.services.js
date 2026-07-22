import dashboardDao from "../dao/dashboard.dao.js";

const excludedStatuses = ["Rejected", "Cancelled"];

// Scopes personal dashboards while leaving hospital operations roles system-wide.
const actorFilter = (actor) => {
  const filter = { status: { $nin: excludedStatuses } };
  if (actor.role === "Doctor") filter.doctorId = actor._id;
  if (actor.role === "Patient") filter.patientId = actor._id;
  return filter;
};

const getAnalytics = async (actor) => {
  const appointments = await dashboardDao.findAppointmentsForAnalytics(
    actorFilter(actor),
  );
  const doctorIds = [
    ...new Set(
      appointments
        .map((appointment) => appointment.doctorId?._id?.toString())
        .filter(Boolean),
    ),
  ];
  const doctorProfiles = await dashboardDao.findDoctorFees(doctorIds);
  const feeByDoctor = new Map(
    doctorProfiles.map((doctor) => [
      doctor.userId.toString(),
      doctor.consultationFee,
    ]),
  );

  const visitsByDoctor = new Map();
  const revenueByDoctor = new Map();
  const dayType = { weekday: 0, weekend: 0 };
  const timeOfDay = { morning: 0, evening: 0 };

  for (const appointment of appointments) {
    const doctor = appointment.doctorId;
    if (!doctor) continue;

    const doctorId = doctor._id.toString();
    const doctorName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
    visitsByDoctor.set(
      doctorId,
      buildDoctorMetric(visitsByDoctor.get(doctorId), doctorId, doctorName, 1),
    );

    const appointmentDay = new Date(appointment.appointmentDate).getUTCDay();
    if (appointmentDay === 0 || appointmentDay === 6) dayType.weekend += 1;
    else dayType.weekday += 1;

    const startHour = Number.parseInt(appointment.timeSlot?.slice(0, 2), 10);
    if (Number.isFinite(startHour) && startHour < 12) timeOfDay.morning += 1;
    else timeOfDay.evening += 1;

    if (["Paid", "Diagnosed"].includes(appointment.status)) {
      const fee = Number(feeByDoctor.get(doctorId) ?? 0);
      revenueByDoctor.set(
        doctorId,
        buildRevenueMetric(
          revenueByDoctor.get(doctorId),
          doctorId,
          doctorName,
          fee,
        ),
      );
    }
  }

  return {
    visitsByDoctor: [...visitsByDoctor.values()].sort(
      (a, b) => b.value - a.value,
    ),
    dayType,
    timeOfDay,
    revenueByDoctor: [...revenueByDoctor.values()].sort(
      (a, b) => b.value - a.value,
    ),
  };
};

const buildDoctorMetric = (current, id, label, amount) => ({
  id,
  label,
  value: (current?.value ?? 0) + amount,
});

const buildRevenueMetric = (current, id, label, amount) => ({
  id,
  label,
  value: (current?.value ?? 0) + amount,
  appointmentCount: (current?.appointmentCount ?? 0) + 1,
});

export default { getAnalytics };
