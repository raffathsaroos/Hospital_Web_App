import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Keep unchanged",
  onConfirm,
  loading = false,
  reasonLabel,
  reason = "",
  onReasonChange,
}) {
  const reasonRequired = Boolean(reasonLabel);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-slate-200 sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 h-1.5 w-14 rounded-full bg-red-500" />
          <DialogTitle className="text-slate-900">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-slate-600">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {reasonRequired && (
          <div className="space-y-2">
            <Label>{reasonLabel}</Label>
            <textarea
              required
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              className={[
                "min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none",
                "focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
              ].join(" ")}
              placeholder="Enter a clear reason"
            />
          </div>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading || (reasonRequired && !reason.trim())}
          >
            {loading ? "Please wait..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
