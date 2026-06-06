import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import PatientListPage from '@/pages/patients/PatientListPage'
import PatientRegisterPage from '@/pages/patients/PatientRegisterPage'
import PatientDetailPage from '@/pages/patients/PatientDetailPage'
import PatientEditPage from '@/pages/patients/PatientEditPage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/patients" replace />} />
      <Route element={<AppShell />}>
        <Route path="/patients" element={<PatientListPage />} />
        <Route path="/patients/register" element={<PatientRegisterPage />} />
        <Route path="/patients/:id" element={<PatientDetailPage />} />
        <Route path="/patients/:id/edit" element={<PatientEditPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
