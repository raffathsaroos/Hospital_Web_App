import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[75vh] items-center justify-center p-5">
      <Card className="max-w-md border-orange-200">
        <CardContent className="flex flex-col items-center p-10 text-center">
          <span className="rounded-full bg-orange-100 p-4 text-orange-700">
            <ShieldAlert className="h-8 w-8" />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Access not permitted
          </h1>
          <p className="mt-2 text-slate-500">
            Your hospital role does not have permission to open this page.
          </p>
          <Button asChild className="mt-6">
            <Link to="/dashboard">Return to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
