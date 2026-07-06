import { call, http } from './api'

export const getMyProfile = () => call(() => http.get('/me'))
export const createUser = (body) => call(() => http.post('/users', body))
export const createPatient = (body) => call(() => http.post('/patients', body))
export const createDoctor = (body) => call(() => http.post('/doctors', body))
export const getUsers = (role) => call(() => http.get('/users', { params: { role } }))
export const getUser = (id) => call(() => http.get(`/users/${id}`))
export const updateUser = (id, body) => call(() => http.put(`/users/${id}`, body))
export const setUserStatus = (id, isActive) => call(() => http.patch(`/users/${id}/status`, { isActive }))
