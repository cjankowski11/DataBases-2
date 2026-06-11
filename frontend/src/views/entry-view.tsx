import { useEffect, useState } from "react";
import { EntryService } from "@/services/gym-service";
import { EntryListView } from "@/components/tables/entry-table";
import type { Entry } from "@/types/gym-types";
import { Loader2, AlertCircle, DoorOpen, Plus, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
} from "@/components/ui/sheet";
import { EntryForm } from "@/components/forms/entry-form";
import { EditEntryForm } from "@/components/forms/edit/edit-entry-form";
import { DeleteConfirmDialog } from "@/components/forms/delete-confirm-dialog";

export default function EntryView() {
  const [data, setData] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);
  const [deletingEntryId, setDeletingEntryId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const entries = await EntryService.getAll();
      setData(entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load entries");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (entryId: number) => {
    setEditingEntryId(entryId);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (entryId: number) => {
    setDeletingEntryId(entryId);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEntryId) return;

    setIsDeleting(true);
    try {
      await EntryService.delete(deletingEntryId);
      setSuccessMessage("Entry deleted successfully!");
      await fetchData();
      setDeletingEntryId(null);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete entry");

      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingEntryId(null);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setTimeout(() => {
      setEditingEntryId(null);
    }, 300);
  };

  const handleSuccess = () => {
    setIsSheetOpen(false);
    setSuccessMessage("Entry saved successfully!");
    fetchData();
    setTimeout(() => {
      setEditingEntryId(null);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const isEditing = editingEntryId !== null;
  const entryToDelete = deletingEntryId
    ? data.find(e => e.entry_id === deletingEntryId)
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
          <DoorOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Gym Entries</h1>
        </div>
        
        <Button
          className="gap-2"
          onClick={() => {
            setEditingEntryId(null);
            setIsSheetOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Register Entry
        </Button>
      </div>

      <EntryListView 
        data={data} 
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
        <SheetContent side="right" className="sm:max-w-[425px]">
          <SheetHeader>
            <SheetTitle>
              {isEditing ? "Edit Entry" : "Register New Entry"}
            </SheetTitle>
            <SheetDescription>
              {isEditing 
                ? "Update the client's entry details. Modify the client, gym, or entry time."
                : "Record a client's entry to the gym. Select the client and gym location."}
            </SheetDescription>
          </SheetHeader>
          {isEditing ? (
            <EditEntryForm
              entryId={editingEntryId}
              onSuccess={handleSuccess}
            />
          ) : (
            <EntryForm onSuccess={handleSuccess} />
          )}
        </SheetContent>
      </Sheet>

      <DeleteConfirmDialog
        isOpen={deletingEntryId !== null}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Entry"
        description={`Are you sure you want to delete the entry for ${entryToDelete?.client ? `${entryToDelete.client.name} ${entryToDelete.client.surname}` : `Client #${entryToDelete?.client_id}`}? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}