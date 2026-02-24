import { useLocation } from "wouter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useDeleteBusiness } from "@/hooks/use-businesses";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  business: { id: number; name: string };
  /** Called after successful delete (e.g. navigate to dashboard). Defaults to navigating to /dashboard. */
  onDeleted?: () => void;
};

export function ConfirmDeleteBusinessDialog({ open, onOpenChange, business, onDeleted }: Props) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const deleteMutation = useDeleteBusiness();

  const handleConfirm = () => {
    deleteMutation.mutate(business.id, {
      onSuccess: () => {
        onOpenChange(false);
        if (onDeleted) onDeleted();
        else setLocation("/dashboard");
        toast({ title: "Business removed", description: `"${business.name}" has been deleted.` });
      },
      onError: (e: Error) => {
        toast({ variant: "destructive", title: "Error", description: e.message });
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete business?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove &quot;{business.name}&quot; and all its reviews. The Google Business Profile
            location will be unlinked so you can add it again later. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? "Deleting…" : "Delete business"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
