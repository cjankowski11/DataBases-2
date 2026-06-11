import { useEffect, useState } from "react";
import { ClientService } from "@/services/gym-service";
import { ClientListView } from "@/components/tables/client-table";
import type { Client } from "@/types/gym-types";
import { Loader2, Users, Plus, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ClientForm } from "@/components/forms/client-form";
import { EditClientForm } from "@/components/forms/edit/edit-client-form";
import { DeleteConfirmDialog } from "@/components/forms/delete-confirm-dialog";

export default function ClientsView() {
  const [data, setData] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<number | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const clients = await ClientService.getAll();
      setData(clients);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (clientId: number) => {
    setEditingClientId(clientId);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (clientId: number) => {
    setDeletingClientId(clientId);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingClientId) return;

    setIsDeleting(true);
    try {
      await ClientService.delete(deletingClientId);
      setSuccessMessage("Client deleted successfully!");
      await fetchData();
      setDeletingClientId(null);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete client. They might have active dependencies.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingClientId(null);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setTimeout(() => {
      setEditingClientId(null);
    }, 300);
  };

  const handleSuccess = () => {
    setIsSheetOpen(false);
    setSuccessMessage("Client saved successfully!");
    fetchData();
    setTimeout(() => {
      setEditingClientId(null);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }, 300);
  };

  const isEditing = editingClientId !== null;
  const clientToDelete = deletingClientId
    ? data.find(c => c.client_id === deletingClientId)
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
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        </div>
        <Button 
          className="gap-2"
          onClick={() => {
            setEditingClientId(null);
            setIsSheetOpen(true);
          }}
        >
            <Plus className="h-4 w-4" />
            Add Client
        </Button>
      </div>

      <ClientListView 
        data={data} 
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
        <SheetContent side="right" className="sm:max-w-[425px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {isEditing ? "Edit Client" : "Add New Client"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Update client personal details or contact information."
                : "Create a new client profile."}
            </SheetDescription>
          </SheetHeader>
          {isEditing ? (
            <EditClientForm
              clientId={editingClientId}
              onSuccess={handleSuccess}
            />
          ) : (
            <ClientForm onSuccess={handleSuccess} />
          )}
        </SheetContent>
      </Sheet>

      <DeleteConfirmDialog
        isOpen={deletingClientId !== null}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Client"
        description={`Are you sure you want to delete client "${clientToDelete?.name} ${clientToDelete?.surname}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
