import { useEffect, useState } from "react";
import { RegistrationService } from "@/services/gym-service";
import type { Registration } from "@/types/gym-types";
import { Loader2, AlertCircle, ClipboardList, Plus, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RegistrationListView } from "@/components/tables/registration-table";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { RegistrationForm } from "@/components/forms/registration-form";
import { EditRegistrationForm } from "@/components/forms/edit/edit-registration-form";
import { DeleteConfirmDialog } from "@/components/forms/delete-confirm-dialog";

export default function RegistrationsView() {
  const [data, setData] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingRegistrationId, setEditingRegistrationId] = useState<number | null>(null);
  const [deletingRegistrationId, setDeletingRegistrationId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const registrations = await RegistrationService.getAll();
      setData(registrations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load registrations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (registrationId: number) => {
    setEditingRegistrationId(registrationId);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (registrationId: number) => {
    setDeletingRegistrationId(registrationId);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRegistrationId) return;

    setIsDeleting(true);
    try {
      await RegistrationService.delete(deletingRegistrationId);
      setSuccessMessage("Registration deleted successfully!");
      await fetchData();
      setDeletingRegistrationId(null);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete registration");

      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingRegistrationId(null);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setTimeout(() => {
      setEditingRegistrationId(null);
    }, 300);
  };

  const handleSuccess = () => {
    setIsSheetOpen(false);
    setSuccessMessage("Registration saved successfully!");
    fetchData();
    setTimeout(() => {
      setEditingRegistrationId(null);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }, 300);
  };

  const isEditing = editingRegistrationId !== null;
  const registrationToDelete = deletingRegistrationId
    ? data.find(r => r.class_registration_id === deletingRegistrationId)
    : null;

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !deletingRegistrationId) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
          <ClipboardList className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Registrations</h1>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditingRegistrationId(null);
            setIsSheetOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Registration
        </Button>
      </div>

      <RegistrationListView
        data={data}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
        <SheetContent side="right" className="sm:max-w-[425px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {isEditing ? "Edit Registration" : "Add New Registration"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Update the registration details. Modify client, class, or date."
                : "Create a new registration. Choose the client and class."}
            </SheetDescription>
          </SheetHeader>
          {isEditing ? (
            <EditRegistrationForm
              registrationId={editingRegistrationId}
              onSuccess={handleSuccess}
            />
          ) : (
            <RegistrationForm
              onSuccess={handleSuccess}
            />
          )}
        </SheetContent>
      </Sheet>

      <DeleteConfirmDialog
        isOpen={deletingRegistrationId !== null}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Registration"
        description={`Are you sure you want to delete registration #${registrationToDelete?.class_registration_id}? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}