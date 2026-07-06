import axios from 'axios'

export const http = axios.create({ baseURL: '/api' })

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('hms_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export async function call(request) {
  try {
    const response = await request()
    return { data: response.data, error: null }
  } catch (err) {
    const body = err.response?.data
    const message =
      body?.errors?.map?.((item) => item.message ?? item)?.join(', ') ??
      body?.message ??
      'Unable to reach the hospital service. Please try again.'
    return { data: null, error: message }
  }
}
