import { call, http } from "./api";

export const login = (credentials) =>
  call(() => http.post("/login", credentials));
