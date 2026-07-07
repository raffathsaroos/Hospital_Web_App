import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  CalendarClock,
  CalendarDays,
  FileText,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Pill,
  ScanLine,
  Stethoscope,
  UserRoundCog,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: null },
  { to: "/doctors", label: "Doctors", icon: Stethoscope, roles: ["Admin"] },
  {
    to: "/doctor-schedules",
    label: "Doctor Schedules",
    icon: CalendarClock,
    roles: ["Admin", "Receptionist"],
  },
  {
    to: "/staff/receptionist",
    label: "Receptionists",
    icon: UserRoundCog,
    roles: ["Admin"],
  },
  {
    to: "/staff/pharmacist",
    label: "Pharmacists",
    icon: Pill,
    roles: ["Admin"],
  },
  {
    to: "/staff/lab-operator",
    label: "Lab Operators",
    icon: FlaskConical,
    roles: ["Admin"],
  },
  {
    to: "/staff/radiologist",
    label: "Radiologists",
    icon: ScanLine,
    roles: ["Admin"],
  },
  {
    to: "/patients",
    label: "Patients",
    icon: Users,
    roles: ["Admin", "Receptionist", "Doctor"],
  },
  {
    to: "/appointments",
    label: "Appointments",
    icon: CalendarDays,
    roles: ["Admin", "Receptionist", "Doctor", "Patient"],
  },
  {
    to: "/reports",
    label: "Reports",
    icon: FileText,
    roles: ["Doctor"],
  },
  {
    to: "/pharmacy-queue",
    label: "Prescription Queue",
    icon: Pill,
    roles: ["Pharmacist"],
  },
  {
    to: "/lab-queue",
    label: "Lab Test Queue",
    icon: FlaskConical,
    roles: ["Lab Operator"],
  },
  {
    to: "/radiology-queue",
    label: "Scan Request Queue",
    icon: ScanLine,
    roles: ["Radiologist"],
  },
];

// Shows the main hospital navigation and staff area.
export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role),
  );
  const canViewProfile = user?.role && user.role !== "Admin";

  function handleLogout() {
    logout();
    navigate("/login");
  }
  return (
    <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col bg-slate-900 text-slate-300 md:flex">
      <Link
        to="/"
        className="flex items-center gap-2 border-b border-slate-700 px-4 py-5 hover:bg-slate-800"
      >
        <img
          src="/new-hospital-logo.png"
          alt="New Hospital logo"
          className="h-8 w-8 object-contain"
        />
        <span className="text-lg font-semibold text-white">New Hospital</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white",
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-700 p-4">
        {canViewProfile ? (
          <Link
            to="/profile"
            className="flex items-center gap-3 rounded-md p-2 hover:bg-slate-800"
          >
            <AccountSummary user={user} showProfileHint />
          </Link>
        ) : (
          <div className="flex items-center gap-3 rounded-md p-2">
            <AccountSummary user={user} />
          </div>
        )}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="mt-3 w-full justify-start text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <LogOut /> Sign out
        </Button>
      </div>
    </aside>
  );
}

function AccountSummary({ user, showProfileHint = false }) {
  return (
    <>
      <div className="h-8 w-8 rounded-full bg-slate-700" />
      <div>
        <p className="text-xs font-medium text-slate-300">
          {user?.firstName} {user?.lastName}
        </p>
        <p className="text-xs text-slate-500">
          {user?.role}
          {showProfileHint ? " · View profile" : ""}
        </p>
      </div>
    </>
  );
}
