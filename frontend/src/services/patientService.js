import axios from 'axios'

const http = axios.create({ baseURL: '/api' })

async function call(fn) {
  try {
    const res = await fn()
    return { data: res.data, error: null }
  } catch (err) {
    const body = err.response?.data
    const message =
      body?.errors?.map?.((e) => e.message ?? e)?.join(', ') ??
      body?.message ??
      (err.code === 'ERR_NETWORK'
        ? 'Cannot connect to the API server. Make sure the backend is running on port 5000.'
        : null) ??
      'Something went wrong'
    return { data: null, error: message }
  }
}

export const getPatients      = ()           => call(() => http.get('/patients'))
export const registerPatient  = (body)       => call(() => http.post('/patients', body))
export const getPatientById   = (id)         => call(() => http.get(`/patients/${id}`))
export const updatePatient    = (id, body)   => call(() => http.put(`/patients/${id}`, body))
export const setPatientStatus = (id, active) => call(() => http.patch(`/patients/${id}/status`, { isActive: active }))
export const deletePatient    = (id)         => call(() => http.delete(`/patients/${id}`))
