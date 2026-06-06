import { z } from 'zod'

export const patientSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName:  z.string().min(2, 'Last name must be at least 2 characters'),
  email:     z.string().email('Enter a valid email address'),
  phone:     z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
  nic:       z.string().min(1, 'NIC is required'),
  dob:       z.string().min(1, 'Date of birth is required'),
  gender:    z.enum(['Male', 'Female', 'Other'], { message: 'Please select a gender' }),
  password:  z.string().min(8, 'Password must be at least 8 characters'),
})
