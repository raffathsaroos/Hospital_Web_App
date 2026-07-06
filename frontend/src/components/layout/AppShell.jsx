import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

// Keeps the sidebar around the current management page.
export default function AppShell() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <main className="min-h-screen bg-background p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
