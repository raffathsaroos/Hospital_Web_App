import { useEffect, useState } from "react";
import { BarChart3, CalendarRange, SunMoon, WalletCards } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardReports from "@/components/dashboard/DashboardReports";
import { useAuth } from "@/context/AuthContext";
import { getDashboardAnalytics } from "@/services/dashboardService";

export default function DashboardPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboardAnalytics().then((result) => {
      if (result.error) setError(result.error);
      else setAnalytics(result.data);
    });
  }, []);

  return (
    <div>
      <div className="dashboard-screen-only">
        <TopBar title="Dashboard" />
      </div>
      <div className="dashboard-screen-only rounded-2xl bg-gradient-to-r from-blue-700 to-slate-700 p-7 text-white">
        <p className="text-blue-100">Welcome back, {user?.firstName}</p>
        <h2 className="mt-1 text-3xl font-bold">Hospital analytics</h2>
        <p className="mt-3 max-w-2xl text-blue-100">
          Visualize appointment demand, patient timing, and doctor revenue.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!error && !analytics && <DashboardSkeleton />}
      {analytics && (
        <div className="dashboard-screen-only mt-6 grid gap-6 xl:grid-cols-2">
          <ChartCard
            icon={BarChart3}
            title="Patient Visits by Doctor"
            description="Number of active appointments assigned to each doctor."
          >
            <HorizontalBarChart
              data={analytics.visitsByDoctor}
              emptyMessage="No doctor appointment data is available."
            />
          </ChartCard>

          <ChartCard
            icon={WalletCards}
            title="Revenue by Doctor"
            description="Consultation revenue from paid and diagnosed appointments."
          >
            <HorizontalBarChart
              data={analytics.revenueByDoctor}
              valueFormatter={(value) => `LKR ${value.toLocaleString()}`}
              emptyMessage="No paid appointment revenue is available."
              color="bg-orange-500"
            />
          </ChartCard>

          <ChartCard
            icon={CalendarRange}
            title="Weekday vs Weekend Visits"
            description="Appointment demand based on the scheduled day."
          >
            <ComparisonChart
              items={[
                { label: "Weekdays", value: analytics.dayType.weekday },
                { label: "Weekends", value: analytics.dayType.weekend },
              ]}
            />
          </ChartCard>

          <ChartCard
            icon={SunMoon}
            title="Morning vs Evening Visits"
            description="Morning is before 12:00; evening begins at 12:00."
          >
            <ComparisonChart
              items={[
                { label: "Morning", value: analytics.timeOfDay.morning },
                { label: "Evening", value: analytics.timeOfDay.evening },
              ]}
            />
          </ChartCard>
        </div>
      )}
      {analytics && user?.role === "Admin" && (
        <DashboardReports analytics={analytics} user={user} />
      )}
    </div>
  );
}

function ChartCard({ icon: Icon, title, description, children }) {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <div className="flex items-start gap-3">
          <span className="rounded-lg bg-blue-100 p-2 text-blue-700">
            <Icon />
          </span>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function HorizontalBarChart({
  data,
  valueFormatter = (value) => value.toLocaleString(),
  emptyMessage,
  color = "bg-blue-600",
}) {
  if (!data.length) {
    return (
      <p className="py-10 text-center text-sm text-slate-500">{emptyMessage}</p>
    );
  }

  const maximum = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.id}>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
            <span className="truncate font-medium text-slate-700">
              {item.label}
            </span>
            <span className="shrink-0 font-semibold text-slate-900">
              {valueFormatter(item.value)}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${color}`}
              style={{ width: `${Math.max((item.value / maximum) * 100, 2)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ComparisonChart({ items }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const colors = ["bg-blue-600", "bg-orange-500"];

  if (!total) {
    return (
      <p className="py-10 text-center text-sm text-slate-500">
        No appointment timing data is available.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex h-7 overflow-hidden rounded-full bg-slate-100">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={colors[index]}
            style={{ width: `${(item.value / total) * 100}%` }}
            title={`${item.label}: ${item.value}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {items.map((item, index) => (
          <div key={item.label} className="rounded-lg border bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${colors[index]}`} />
              <span className="text-sm text-slate-600">{item.label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {item.value}
            </p>
            <p className="text-xs text-slate-500">
              {Math.round((item.value / total) * 100)}% of visits
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-80" />
      ))}
    </div>
  );
}
