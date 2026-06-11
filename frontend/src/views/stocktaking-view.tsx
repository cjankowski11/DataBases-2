import { useEffect, useState } from "react";
import { StocktakingService } from "@/services/gym-service";
import { StocktakingListView } from "@/components/tables/stocktaking-table";
import type { Stocktaking } from "@/types/gym-types";
import { Loader2, ClipboardList, Plus, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { StocktakingForm } from "@/components/forms/stocktaking-form";
import { EditStocktakingForm } from "@/components/forms/edit/edit-stocktaking-form";
import { DeleteConfirmDialog } from "@/components/forms/delete-confirm-dialog";

export default function StocktakingsView() {
  const [data, setData] = useState<Stocktaking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingStocktakingId, setEditingStocktakingId] = useState<number | null>(null);
  const [deletingStocktakingId, setDeletingStocktakingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const stocktakings = await StocktakingService.getAll();
      setData(stocktakings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stocktakings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (stocktakingId: number) => {
    setEditingStocktakingId(stocktakingId);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (stocktakingId: number) => {
    setDeletingStocktakingId(stocktakingId);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingStocktakingId) return;

    setIsDeleting(true);
    try {
      await StocktakingService.delete(deletingStocktakingId);
      setSuccessMessage("Stocktaking deleted successfully!");
      await fetchData();
      setDeletingStocktakingId(null);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete stocktaking");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingStocktakingId(null);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setTimeout(() => {
      setEditingStocktakingId(null);
    }, 300);
  };

  const handleSuccess = () => {
    setIsSheetOpen(false);
    setSuccessMessage("Stocktaking saved successfully!");
    fetchData();
    setTimeout(() => {
      setEditingStocktakingId(null);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }, 300);
  };

  const isEditing = editingStocktakingId !== null;
  const stocktakingToDelete = deletingStocktakingId
    ? data.find(s => s.stocktaking_id === deletingStocktakingId)
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
          <ClipboardList className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Stocktakings</h1>
        </div>
        <Button 
          className="gap-2"
          onClick={() => {
            setEditingStocktakingId(null);
            setIsSheetOpen(true);
          }}
        >
            <Plus className="h-4 w-4" />
            Add Stocktaking
        </Button>
      </div>

      <StocktakingListView 
        data={data} 
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
        <SheetContent side="right" className="sm:max-w-[425px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {isEditing ? "Edit Stocktaking" : "Record Stocktaking"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Update the stocktaking record."
                : "Create a new stocktaking record for a gym."}
            </SheetDescription>
          </SheetHeader>
          {isEditing ? (
            <EditStocktakingForm
              stocktakingId={editingStocktakingId}
              onSuccess={handleSuccess}
            />
          ) : (
            <StocktakingForm onSuccess={handleSuccess} />
          )}
        </SheetContent>
      </Sheet>

      <DeleteConfirmDialog
        isOpen={deletingStocktakingId !== null}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Stocktaking"
        description={`Are you sure you want to delete stocktaking #${stocktakingToDelete?.stocktaking_id}? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
