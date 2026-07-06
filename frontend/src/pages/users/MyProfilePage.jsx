import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyProfile } from "@/services/userService";

export default function MyProfilePage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyProfile().then((result) => {
      if (result.error) setError(result.error);
      else setUser(result.data.user);
    });
  }, []);

  return (
    <div>
      <TopBar title="My Profile" />
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!error && !user && <Skeleton className="mx-auto h-96 max-w-3xl" />}
      {user && (
        <Card className="mx-auto max-w-3xl">
          <CardHeader className="flex-row items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <UserRound className="h-8 w-8" />
            </div>
            <div>
              <CardTitle>
                {user.firstName} {user.lastName}
              </CardTitle>
              <CardDescription className="mt-1">{user.email}</CardDescription>
              <Badge
                variant="outline"
                className="mt-2 border-blue-300 bg-blue-50 text-blue-700"
              >
                {user.role}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <ProfileField label="First name" value={user.firstName} />
            <ProfileField label="Last name" value={user.lastName} />
            <ProfileField label="Email" value={user.email} />
            <ProfileField label="Phone" value={user.phone} />
            <ProfileField label="NIC" value={user.nic} />
            <ProfileField
              label="Date of birth"
              value={user.dob ? new Date(user.dob).toLocaleDateString() : "—"}
            />
            <ProfileField label="Gender" value={user.gender} />
            <ProfileField
              label="Account status"
              value={user.isActive ? "Active" : "Inactive"}
            />
            <ProfileField
              label="Last login"
              value={
                user.lastLogin
                  ? new Date(user.lastLogin).toLocaleString()
                  : "First login"
              }
            />
            <ProfileField
              label="Member since"
              value={
                user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "—"
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-medium text-slate-900">{value || "—"}</p>
    </div>
  );
}
