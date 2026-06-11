import { useEffect, useState } from "react";
import { SponsorService } from "@/services/gym-service";
import { SponsorsListView } from "@/components/tables/sponsor-table";
import type { Sponsor } from "@/types/gym-types";
import { Loader2, XCircle, CircleDollarSign, Plus, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DeleteConfirmDialog } from "@/components/forms/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import { SponsorForm } from "@/components/forms/sponsor-form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export default function SponsorsView() {
  const [data, setData] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sponsorToDeleteId, setSponsorToDeleteId] = useState<number | string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const sponsors = await SponsorService.getAll();
      setData(sponsors);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sponsors");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteClick = (sponsorId: number) => {
    setSponsorToDeleteId(sponsorId);
  };

  const handleDeleteConfirm = async () => {
    if (!sponsorToDeleteId) return;
    setIsDeleting(true);

    try {
      console.log("Delete finalized for address ID: " + sponsorToDeleteId);
      await SponsorService.delete(sponsorToDeleteId);
      await fetchData();
      setSuccessMessage("Sponsor deleted successfully!");

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (error: any) {
      setError(error instanceof Error ? error.message : "Failed to delete sponsor");

      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setSponsorToDeleteId(null);
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setSponsorToDeleteId(null);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
  };

  const handleSuccess = () => {
    setIsSheetOpen(false);
    fetchData();
    setSuccessMessage("Sponsor saved successfully!");
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const sponsorToDelete = sponsorToDeleteId
    ? data.find(s => s.sponsor_id === sponsorToDeleteId)
    : null;


  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">

      {successMessage && (
        <Alert className="border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <CircleDollarSign className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Sponsors</h1>
        </div>
        <Button onClick={() => setIsSheetOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Sponsor
        </Button>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
        <SheetContent side="right" className="sm:max-w-[425px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              Add New Sponsor
            </SheetTitle>
            <SheetDescription>
              Create a new sponsor. Fill in all the details below.
            </SheetDescription>
          </SheetHeader>
            <SponsorForm onSuccess={handleSuccess} />
        </SheetContent>
      </Sheet>

      <SponsorsListView
        data={data}
        onDelete={handleDeleteClick}
      />

      <DeleteConfirmDialog
        isOpen={sponsorToDeleteId !== null}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Sponsor"
        description={`Are you sure you want to delete sponsor "${sponsorToDelete?.name} #${sponsorToDelete?.sponsor_id}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}