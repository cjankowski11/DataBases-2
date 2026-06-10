import { useEffect, useState } from "react";
import { ClassService } from "@/services/gym-service";
import type { GymClass } from "@/types/gym-types";
import { Loader2, AlertCircle, Dumbbell, Plus, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ClassListView } from "@/components/tables/class-table";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ClassForm } from "@/components/forms/class-form";
import { EditClassForm } from "@/components/forms/edit/edit-class-form";
import { DeleteConfirmDialog } from "@/components/forms/delete-confirm-dialog";

export default function ClassesView() {
  const [data, setData] = useState<GymClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [deletingClassId, setDeletingClassId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const classes = await ClassService.getAll();
      setData(classes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load classes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (classId: number) => {
    setEditingClassId(classId);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (classId: number) => {
    setDeletingClassId(classId);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingClassId) return;

    setIsDeleting(true);
    try {
      await ClassService.delete(deletingClassId);
      setSuccessMessage("Class deleted successfully!");
      await fetchData();
      setDeletingClassId(null);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete class");

      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingClassId(null);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setTimeout(() => {
      setEditingClassId(null);
    }, 300);
  };

  const handleSuccess = () => {
    setIsSheetOpen(false);
    setSuccessMessage("Class saved successfully!");
    fetchData();
    setTimeout(() => {
      setEditingClassId(null);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }, 300);
  };

  const isEditing = editingClassId !== null;
  const classToDelete = deletingClassId
    ? data.find(c => c.class_id === deletingClassId)
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
          <Dumbbell className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditingClassId(null);
            setIsSheetOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Class
        </Button>
      </div>

      <ClassListView
        data={data}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
        <SheetContent side="right" className="sm:max-w-[425px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {isEditing ? "Edit Class" : "Add New Class"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Update the class details. Modify date, type, duration, capacity, or room."
                : "Create a new class. Fill in all the details below."}
            </SheetDescription>
          </SheetHeader>
          {isEditing ? (
            <EditClassForm
              classId={editingClassId}
              onSuccess={handleSuccess}
            />
          ) : (
            <ClassForm onSuccess={handleSuccess} />
          )}
        </SheetContent>
      </Sheet>

      <DeleteConfirmDialog
        isOpen={deletingClassId !== null}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Class"
        description={`Are you sure you want to delete class "${classToDelete?.class_type?.name} #${classToDelete?.class_id}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}