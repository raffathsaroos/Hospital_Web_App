import { call, http } from "./api";

export const getDashboardAnalytics = () =>
  call(() => http.get("/dashboard/analytics"));
