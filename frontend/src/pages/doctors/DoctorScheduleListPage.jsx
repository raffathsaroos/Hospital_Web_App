import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDoctors } from "@/services/doctorService";

export default function DoctorScheduleListPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDoctors().then((result) => {
      if (result.error) setError(result.error);
      else setDoctors(result.data.doctors ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <TopBar title="Doctor Schedules" />
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-14" />
          ))}
        </div>
      )}
      {!loading && error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!loading && !error && doctors.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            No active doctors are available for scheduling.
          </CardContent>
        </Card>
      )}
      {!loading && !error && doctors.length > 0 && (
        <div className="overflow-hidden rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Available days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Schedule</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((doctor) => (
                <TableRow key={doctor._id}>
                  <TableCell className="font-medium">
                    Dr. {doctor.userId.firstName} {doctor.userId.lastName}
                  </TableCell>
                  <TableCell>{doctor.department}</TableCell>
                  <TableCell>
                    {doctor.availableDays?.length
                      ? doctor.availableDays.join(", ")
                      : "No time slots"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        doctor.isAvailable
                          ? "border-blue-300 bg-blue-50 text-blue-700"
                          : "border-orange-300 bg-orange-50 text-orange-700"
                      }
                    >
                      {doctor.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/doctor-schedules/${doctor._id}`}>
                        <CalendarClock /> Manage
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
