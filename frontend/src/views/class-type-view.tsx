import { useEffect, useState } from "react";
import { ClassTypeService } from "@/services/gym-service";
import type { ClassType } from "@/types/gym-types";
import { Loader2, Tag, Plus, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ClassTypeListView } from "@/components/tables/class-type-table";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ClassTypeForm } from "@/components/forms/class-type-form";
import { EditClassTypeForm } from "@/components/forms/edit/edit-class-type-form";
import { DeleteConfirmDialog } from "@/components/forms/delete-confirm-dialog";

export default function ClassTypesView() {
  const [data, setData] = useState<ClassType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingClassTypeId, setEditingClassTypeId] = useState<number | null>(null);
  const [deletingClassTypeId, setDeletingClassTypeId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const classTypes = await ClassTypeService.getAll();
      setData(classTypes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load class types");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (classTypeId: number) => {
    setEditingClassTypeId(classTypeId);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (classTypeId: number) => {
    setDeletingClassTypeId(classTypeId);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingClassTypeId) return;

    setIsDeleting(true);
    try {
      await ClassTypeService.delete(deletingClassTypeId);
      setSuccessMessage("Class type deleted successfully!");
      await fetchData();
      setDeletingClassTypeId(null);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete class type");

      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingClassTypeId(null);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setTimeout(() => {
      setEditingClassTypeId(null);
    }, 300);
  };

  const handleSuccess = () => {
    setIsSheetOpen(false);
    setSuccessMessage("Class type saved successfully!");
    fetchData();
    setTimeout(() => {
      setEditingClassTypeId(null);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }, 300);
  };

  const isEditing = editingClassTypeId !== null;
  const classTypeToDelete = deletingClassTypeId
    ? data.find(c => c.class_type_id === deletingClassTypeId)
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
      {/* Success Message Alert */}
      {successMessage && (
        <Alert className="border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Error Message Alert */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Tag className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Class Types</h1>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditingClassTypeId(null);
            setIsSheetOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Class Type
        </Button>
      </div>

      <ClassTypeListView
        data={data}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
        <SheetContent side="right" className="sm:max-w-[425px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {isEditing ? "Edit Class Type" : "Add New Class Type"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Update the class type details. Modify name or difficulty level."
                : "Create a new class type. Fill in the name and difficulty level."}
            </SheetDescription>
          </SheetHeader>
          {isEditing ? (
            <EditClassTypeForm
              classTypeId={editingClassTypeId}
              onSuccess={handleSuccess}
            />
          ) : (
            <ClassTypeForm onSuccess={handleSuccess} />
          )}
        </SheetContent>
      </Sheet>

      <DeleteConfirmDialog
        isOpen={deletingClassTypeId !== null}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Class Type"
        description={`Are you sure you want to delete class type "${classTypeToDelete?.name}"? This action cannot be undone and may affect existing classes.`}
        isLoading={isDeleting}
      />
    </div>
  );
}