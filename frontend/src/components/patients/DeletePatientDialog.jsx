import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Confirms a permanent patient deletion before it runs.
export default function DeletePatientDialog({
  open,
  onOpenChange,
  patientName,
  onConfirm,
  loading,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Are you sure you want to delete this patient?
          </DialogTitle>
          <DialogDescription>
            Deleting <strong>{patientName}</strong> cannot be undone and will
            permanently remove the patient record and their account.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} disabled={loading}>
            No
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
