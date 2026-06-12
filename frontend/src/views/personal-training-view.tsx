import { useEffect, useState } from "react";
import { PersonalTrainingService } from "@/services/gym-service";
import type { PersonalTraining } from "@/types/gym-types";
import { Loader2, Flame, XCircle, Plus, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PersonalTrainingListView } from "@/components/tables/personal-training-table";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/forms/delete-confirm-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { PersonalTrainingForm } from "@/components/forms/personal-training-form";
import { EditPersonalTrainingForm } from "@/components/forms/edit/edit-personal-training-form"; 

export default function PersonalTrainingsView() {
  const [data, setData] = useState<PersonalTraining[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [deletingTrainingId, setDeletingTrainingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editingTrainingId, setEditingTrainingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await PersonalTrainingService.getAll();
      
      if (response && Array.isArray(response.data)) {
        setData(response.data);
      } else if (Array.isArray(response)) {
        setData(response);
      } else {
        console.error("Unexpected data structure:", response);
        setData([]);
      }
    } catch (err) {
      console.error("Error in fetchData:", err);
      setError("Failed to load personal trainings.");
    } {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setEditingTrainingId(null);
  };

  const handleSuccess = (mode: "add" | "edit") => {
    setIsSheetOpen(false);
    setEditingTrainingId(null);
    setSuccessMessage(
      mode === "edit" 
        ? "Personal training updated successfully!" 
        : "Personal training scheduled successfully!"
    );
    fetchData();
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  const handleEditClick = (trainingId: number) => {
    setEditingTrainingId(trainingId);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (trainingId: number) => {
    setDeletingTrainingId(trainingId);
  };

  const handleDeleteCancel = () => {
    setDeletingTrainingId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTrainingId) return;

    setIsDeleting(true);
    try {
      await PersonalTrainingService.delete(deletingTrainingId);
      setSuccessMessage("Personal training deleted successfully!");
      
      setData((prevData) => prevData.filter((t) => t.personal_training_id !== deletingTrainingId));
      setDeletingTrainingId(null);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete personal training");
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const trainingToDelete = deletingTrainingId
    ? data.find(t => t.personal_training_id === deletingTrainingId)
    : null;

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
          <Flame className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Personal Trainings</h1>
        </div>
        <Button className="gap-2" onClick={() => { setEditingTrainingId(null); setIsSheetOpen(true); }}>
          <Plus className="h-4 w-4" />
          Add Training
        </Button>
      </div>

      <div className="mt-4">
        <PersonalTrainingListView 
          data={data} 
          onEdit={handleEditClick}
          onDelete={handleDeleteClick} 
        />
      </div>

      <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
        <SheetContent side="right" className="sm:max-w-[425px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingTrainingId ? "Edit Personal Training" : "Add New Personal Training"}
            </SheetTitle>
            <SheetDescription>
              {editingTrainingId 
                ? "Modify the training session details below." 
                : "Fill in the form below to schedule a new personal training session."}
            </SheetDescription>
          </SheetHeader>
          
          {editingTrainingId !== null ? (
            <EditPersonalTrainingForm 
              trainingId={editingTrainingId} 
              onSuccess={() => handleSuccess("edit")} 
            />
          ) : (
            <PersonalTrainingForm 
              onSuccess={() => handleSuccess("add")} 
            />
          )}
        </SheetContent>
      </Sheet>

      <DeleteConfirmDialog
        isOpen={deletingTrainingId !== null}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Personal Training"
        description={`Are you sure you want to cancel and delete personal training session #${trainingToDelete?.personal_training_id} for client "${trainingToDelete?.client?.name} ${trainingToDelete?.client?.surname || ""}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}