import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  ExternalLink,
  MapPin,
  Phone,
  Search,
  Stethoscope,
} from "lucide-react";
import PublicHeader from "@/components/public/PublicHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getDoctors } from "@/services/doctorService";

export default function LandingPage() {
  const [doctors, setDoctors] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDoctors() {
      const result = await getDoctors();
      if (result.error) setError(result.error);
      else setDoctors(result.data.doctors ?? []);
      setLoading(false);
    }
    loadDoctors();
  }, []);

  const filteredDoctors = useMemo(() => {
    const term = query.toLowerCase().trim();
    if (!term) return doctors;
    return doctors.filter((doctor) => {
      const user = doctor.userId ?? {};
      return [
        user.firstName,
        user.lastName,
        doctor.department,
        doctor.specialization,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [doctors, query]);

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader />
      <section className="overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-slate-700 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-[1.2fr_.8fr] md:items-center">
          <div>
            <Badge className="mb-5 border-orange-300 bg-orange-400 text-slate-900">
              Trusted hospital care
            </Badge>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
              Meet the right doctor. Book your visit in minutes.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-blue-100">
              Explore specialists, view their schedules, and request an
              appointment without creating an account.
            </p>
          </div>
          <div className="rounded-3xl border border-white/20 bg-white/10 p-7 shadow-2xl backdrop-blur">
            <CalendarDays className="h-10 w-10 text-orange-300" />
            <p className="mt-5 text-2xl font-semibold">Simple public booking</p>
            <p className="mt-2 text-blue-100">
              Choose a doctor, select an available day and time, then provide
              your contact details.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 py-14">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="font-semibold text-orange-600">Our medical team</p>
            <h2 className="mt-1 text-3xl font-bold text-slate-900">
              Find your doctor
            </h2>
          </div>
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search doctor or department"
              className="bg-white pl-9"
            />
          </div>
        </div>

        {error && (
          <Alert className="mt-8 border-orange-300 bg-orange-50 text-slate-800">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {loading && (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-72 rounded-xl" />
            ))}
          </div>
        )}
        {!loading && !error && (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDoctors.map((doctor) => {
              const user = doctor.userId ?? {};
              return (
                <Card
                  key={doctor._id}
                  className="overflow-hidden border-slate-200 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="h-2 bg-gradient-to-r from-blue-600 to-orange-400" />
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl bg-blue-100 p-4 text-blue-700">
                        <Stethoscope />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">
                          Dr. {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-sm font-medium text-blue-600">
                          {doctor.specialization}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 space-y-2 text-sm text-slate-600">
                      <p>
                        <span className="font-medium text-slate-800">
                          Department:
                        </span>{" "}
                        {doctor.department}
                      </p>
                      <p>
                        <span className="font-medium text-slate-800">
                          Experience:
                        </span>{" "}
                        {doctor.experience} years
                      </p>
                      <p>
                        <span className="font-medium text-slate-800">
                          Available:
                        </span>{" "}
                        {doctor.availableDays?.join(", ") || "Contact hospital"}
                      </p>
                    </div>
                    {doctor.availableTimeSlots?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {doctor.availableTimeSlots.slice(0, 3).map((slot) => (
                          <span
                            key={`${slot.day}-${slot.startTime}`}
                            className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600"
                          >
                            {slot.day.slice(0, 3)} {slot.startTime}–
                            {slot.endTime}
                          </span>
                        ))}
                      </div>
                    )}
                    <Button asChild className="mt-6 w-full">
                      <Link to={`/book/${doctor._id}`}>
                        View times & book <ArrowRight />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        {!loading && !error && filteredDoctors.length === 0 && (
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            No doctors match your search.
          </div>
        )}
      </main>
      <section className="border-t border-slate-200 bg-slate-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 md:grid-cols-2">
          <div className="flex items-start gap-4 rounded-xl border border-slate-700 bg-slate-800 p-5">
            <span className="rounded-lg bg-blue-600 p-3">
              <MapPin />
            </span>
            <div>
              <p className="text-sm font-medium text-blue-300">Our Location</p>
              <h2 className="mt-1 text-lg font-semibold">New Hospital</h2>
              <address className="mt-1 not-italic text-slate-300">
                Kurunegala Road, Puttalam
              </address>
              <a
                href="https://www.google.com/maps/search/?api=1&query=New%20Hospital%2C%20Kurunegala%20Road%2C%20Puttalam"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-blue-300 hover:text-blue-200"
              >
                View on Map <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-xl border border-slate-700 bg-slate-800 p-5">
            <span className="rounded-lg bg-orange-500 p-3">
              <Phone />
            </span>
            <div>
              <p className="text-sm font-medium text-orange-300">
                Hospital Hotline
              </p>
              <a
                href="tel:0322269434"
                className="mt-1 block text-2xl font-bold hover:text-orange-200"
              >
                032 226 9434
              </a>
              <p className="mt-1 text-sm text-slate-400">
                Call for hospital information and assistance.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
