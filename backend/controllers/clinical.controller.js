import clinicalService from "../services/clinical.services.js";

const sendError = (res, error) => {
  if (error.name === "ValidationError")
    return res.status(400).json({
      message: "Validation failed.",
      errors: Object.values(error.errors).map(({ message }) => message),
    });
  if (error.name === "CastError")
    return res.status(400).json({ message: "Invalid record ID." });
  if (error.code === 11000)
    return res
      .status(409)
      .json({ message: "A record already exists for this appointment." });
  return res
    .status(error.statusCode || 500)
    .json({ message: error.message || "Internal server error." });
};

// Keeps every compact clinical controller on the same error/response path.
const action =
  (fn, status = 200) =>
  async (req, res) => {
    try {
      const result = await fn(req);
      res.status(status).json(result);
    } catch (error) {
      sendError(res, error);
    }
  };

const createDiagnosis = action(
  async (req) => ({
    message: "Diagnosis report created.",
    diagnosis: await clinicalService.createDiagnosis(req.body, req.user),
  }),
  201,
);
const createPrescription = action(
  async (req) => ({
    message: "Prescription created.",
    prescription: await clinicalService.createPrescription(req.body, req.user),
  }),
  201,
);
const createLabRequest = action(
  async (req) => ({
    message: "Lab request created.",
    labRequest: await clinicalService.createLabRequest(req.body, req.user),
  }),
  201,
);
const createRadiologyRequest = action(
  async (req) => ({
    message: "Radiology request created.",
    radiologyRequest: await clinicalService.createRadiologyRequest(
      req.body,
      req.user,
    ),
  }),
  201,
);
const createEndoscopyRequest = action(
  async (req) => ({
    message: "Endoscopy request created.",
    endoscopyRequest: await clinicalService.createEndoscopyRequest(
      req.body,
      req.user,
    ),
  }),
  201,
);
const listPrescriptions = action(async (req) => {
  const prescriptions = await clinicalService.listPrescriptions(
    req.user,
    req.query,
  );
  return { count: prescriptions.length, prescriptions };
});
const listLabRequests = action(async (req) => {
  const labRequests = await clinicalService.listLabRequests(
    req.user,
    req.query,
  );
  return { count: labRequests.length, labRequests };
});
const listRadiologyRequests = action(async (req) => {
  const radiologyRequests = await clinicalService.listRadiologyRequests(
    req.user,
    req.query,
  );
  return { count: radiologyRequests.length, radiologyRequests };
});
const listEndoscopyRequests = action(async (req) => {
  const endoscopyRequests = await clinicalService.listEndoscopyRequests(
    req.user,
    req.query,
  );
  return { count: endoscopyRequests.length, endoscopyRequests };
});
const dispensePrescription = action(async (req) => ({
  message: "Prescription dispensed and bill generated.",
  prescription: await clinicalService.dispensePrescription(
    req.params.id,
    req.body,
    req.user,
  ),
}));
const completeLabRequest = action(async (req) => ({
  message: "Lab result completed and bill generated.",
  labRequest: await clinicalService.completeLabRequest(
    req.params.id,
    req.body,
    req.user,
  ),
}));
const completeRadiologyRequest = action(async (req) => ({
  message: "Radiology report completed and bill generated.",
  radiologyRequest: await clinicalService.completeRadiologyRequest(
    req.params.id,
    req.body,
    req.user,
  ),
}));
const completeEndoscopyRequest = action(async (req) => ({
  message: "Endoscopy report completed and bill generated.",
  endoscopyRequest: await clinicalService.completeEndoscopyRequest(
    req.params.id,
    req.body,
    req.user,
  ),
}));
const getReports = action(async (req) => clinicalService.getReports(req.user));

export default {
  createDiagnosis,
  createPrescription,
  createLabRequest,
  createRadiologyRequest,
  createEndoscopyRequest,
  listPrescriptions,
  listLabRequests,
  listRadiologyRequests,
  listEndoscopyRequests,
  dispensePrescription,
  completeLabRequest,
  completeRadiologyRequest,
  completeEndoscopyRequest,
  getReports,
};
