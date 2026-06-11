import { useEffect, useState } from "react";
import { GymService } from "@/services/gym-service";
import { GymListView } from "@/components/tables/gym-table";
import type { Gym } from "@/types/gym-types";
import { Loader2, CheckCircle, XCircle, Building2, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { GymForm } from "@/components/forms/gym-form";
// import { EditGymForm } from "@/components/forms/edit/edit-gym-form";
import { DeleteConfirmDialog } from "@/components/forms/delete-confirm-dialog";

export default function GymsView() {
  const [data, setData] = useState<Gym[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingGymId, setEditingGymId] = useState<number | null>(null);
  const [deletingGymId, setDeletingGymId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
      try {
        setIsLoading(true);
        const gyms = await GymService.getAll();
        setData(gyms);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load gyms");
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (gymId: number) => {
    setEditingGymId(gymId);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (gymId: number) => {
    setDeletingGymId(gymId);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingGymId) return;

    setIsDeleting(true);
    try {
      await GymService.delete(deletingGymId);
      setSuccessMessage("Gym deleted successfully!");
      await fetchData();
      setDeletingGymId(null);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete gym");

      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingGymId(null);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setTimeout(() => {
      setEditingGymId(null);
    }, 300);
  };

  const handleSuccess = () => {
    setIsSheetOpen(false);
    setSuccessMessage("Gym saved successfully!");
    fetchData();
    setTimeout(() => {
      setEditingGymId(null);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }, 300);
  };

  const isEditing = editingGymId !== null;
  const gymToDelete = deletingGymId
    ? data.find(g => g.gym_id === deletingGymId)
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
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Gyms</h1>
        </div>
        <Button
          onClick={() => {
            setEditingGymId(null);
            setIsSheetOpen(true);
          }}
          className="gap-2"
        >
            <Plus className="h-4 w-4" />
            Add Gym
        </Button>
      </div>

      <GymListView
        data={data}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
        <SheetContent side="right" className="sm:max-w-[425px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {isEditing ? "Edit Gym" : "Add New Gym"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Update the gym details. Modify name, address, contact info and area."
                : "Create a new gym. Fill in all the details below."}
            </SheetDescription>
          </SheetHeader>
          {/* {isEditing ? (
            <EditGymForm
              gymId={editingGymId}
              onSuccess={handleSuccess}
            />
          ) : (
            <GymForm onSuccess={handleSuccess} />
          )} */}
          <GymForm onSuccess={handleSuccess} />
        </SheetContent>
      </Sheet>

      <DeleteConfirmDialog
        isOpen={deletingGymId !== null}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Gym"
        description={`Are you sure you want to delete gym "${gymToDelete?.name} #${gymToDelete?.gym_id}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}