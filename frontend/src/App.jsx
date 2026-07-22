import { Routes, Route } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleRoute from "@/components/auth/RoleRoute";
import LandingPage from "@/pages/public/LandingPage";
import BookAppointmentPage from "@/pages/public/BookAppointmentPage";
import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import AppointmentListPage from "@/pages/appointments/AppointmentListPage";
import StaffBookAppointmentPage from "@/pages/appointments/StaffBookAppointmentPage";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
import UserCreatePage from "@/pages/users/UserCreatePage";
import DoctorListPage from "@/pages/doctors/DoctorListPage";
import DoctorEditPage from "@/pages/doctors/DoctorEditPage";
import DoctorScheduleListPage from "@/pages/doctors/DoctorScheduleListPage";
import DoctorSchedulePage from "@/pages/doctors/DoctorSchedulePage";
import StaffListPage from "@/pages/users/StaffListPage";
import StaffEditPage from "@/pages/users/StaffEditPage";
import PatientListPage from "@/pages/patients/PatientListPage";
import PatientRegisterPage from "@/pages/patients/PatientRegisterPage";
import PatientDetailPage from "@/pages/patients/PatientDetailPage";
import PatientEditPage from "@/pages/patients/PatientEditPage";
import NotFoundPage from "@/pages/NotFoundPage";
import MyProfilePage from "@/pages/users/MyProfilePage";
import DoctorClinicalPage from "@/pages/clinical/DoctorClinicalPage";
import ClinicalWorkQueuePage from "@/pages/clinical/ClinicalWorkQueuePage";
import DoctorReportsPage from "@/pages/clinical/DoctorReportsPage";

// Maps browser paths to the matching hospital screens.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/book/:doctorId" element={<BookAppointmentPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route
            element={
              <RoleRoute
                roles={[
                  "Patient",
                  "Doctor",
                  "Receptionist",
                  "Lab Operator",
                  "Radiologist",
                  "Pharmacist",
                  "Endoscopy Operator",
                ]}
              />
            }
          >
            <Route path="/profile" element={<MyProfilePage />} />
          </Route>
          <Route
            element={
              <RoleRoute
                roles={["Admin", "Receptionist", "Doctor", "Patient"]}
              />
            }
          >
            <Route path="/appointments" element={<AppointmentListPage />} />
          </Route>
          <Route element={<RoleRoute roles={["Admin", "Receptionist"]} />}>
            <Route
              path="/appointments/book"
              element={<StaffBookAppointmentPage />}
            />
          </Route>
          <Route element={<RoleRoute roles={["Doctor"]} />}>
            <Route
              path="/clinical/:appointmentId"
              element={<DoctorClinicalPage />}
            />
            <Route path="/reports" element={<DoctorReportsPage />} />
          </Route>
          <Route element={<RoleRoute roles={["Pharmacist"]} />}>
            <Route
              path="/pharmacy-queue"
              element={<ClinicalWorkQueuePage type="pharmacy" />}
            />
          </Route>
          <Route element={<RoleRoute roles={["Lab Operator"]} />}>
            <Route
              path="/lab-queue"
              element={<ClinicalWorkQueuePage type="lab" />}
            />
          </Route>
          <Route element={<RoleRoute roles={["Radiologist"]} />}>
            <Route
              path="/radiology-queue"
              element={<ClinicalWorkQueuePage type="radiology" />}
            />
          </Route>
          <Route element={<RoleRoute roles={["Endoscopy Operator"]} />}>
            <Route
              path="/endoscopy-queue"
              element={<ClinicalWorkQueuePage type="endoscopy" />}
            />
          </Route>
          <Route element={<RoleRoute roles={["Admin"]} />}>
            <Route path="/users/add" element={<UserCreatePage />} />
            <Route path="/doctors" element={<DoctorListPage />} />
            <Route
              path="/doctors/add"
              element={<UserCreatePage fixedRole="Doctor" />}
            />
            <Route path="/doctors/:id/edit" element={<DoctorEditPage />} />
            <Route
              path="/staff/receptionist"
              element={
                <StaffListPage role="Receptionist" slug="receptionist" />
              }
            />
            <Route
              path="/staff/receptionist/add"
              element={<UserCreatePage fixedRole="Receptionist" />}
            />
            <Route
              path="/staff/receptionist/:id/edit"
              element={
                <StaffEditPage role="Receptionist" slug="receptionist" />
              }
            />
            <Route
              path="/staff/pharmacist"
              element={<StaffListPage role="Pharmacist" slug="pharmacist" />}
            />
            <Route
              path="/staff/pharmacist/add"
              element={<UserCreatePage fixedRole="Pharmacist" />}
            />
            <Route
              path="/staff/pharmacist/:id/edit"
              element={<StaffEditPage role="Pharmacist" slug="pharmacist" />}
            />
            <Route
              path="/staff/lab-operator"
              element={
                <StaffListPage role="Lab Operator" slug="lab-operator" />
              }
            />
            <Route
              path="/staff/lab-operator/add"
              element={<UserCreatePage fixedRole="Lab Operator" />}
            />
            <Route
              path="/staff/lab-operator/:id/edit"
              element={
                <StaffEditPage role="Lab Operator" slug="lab-operator" />
              }
            />
            <Route
              path="/staff/radiologist"
              element={<StaffListPage role="Radiologist" slug="radiologist" />}
            />
            <Route
              path="/staff/radiologist/add"
              element={<UserCreatePage fixedRole="Radiologist" />}
            />
            <Route
              path="/staff/radiologist/:id/edit"
              element={<StaffEditPage role="Radiologist" slug="radiologist" />}
            />
			<Route
              path="/staff/endoscopy-operator"
              element={<StaffListPage role="Endoscopy Operator" slug="endoscopy-operator" />}
            />
            <Route
              path="/staff/endoscopy-operator/add"
              element={<UserCreatePage fixedRole="Endoscopy Operator" />}
            />
            <Route
              path="/staff/endoscopy-operator/:id/edit"
              element={<StaffEditPage role="Endoscopy Operator" slug="endoscopy-operator" />}
            />
            </Route>
          <Route
            element={<RoleRoute roles={["Admin", "Receptionist", "Doctor"]} />}
          >
            <Route path="/patients" element={<PatientListPage />} />
            <Route
              path="/patients/register"
              element={<PatientRegisterPage />}
            />
            <Route path="/patients/:id" element={<PatientDetailPage />} />
            <Route path="/patients/:id/edit" element={<PatientEditPage />} />
          </Route>
          <Route element={<RoleRoute roles={["Admin", "Receptionist"]} />}>
            <Route
              path="/doctor-schedules"
              element={<DoctorScheduleListPage />}
            />
            <Route
              path="/doctor-schedules/:id"
              element={<DoctorSchedulePage />}
            />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
