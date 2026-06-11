import { useEffect, useState } from "react";
import { TransactionService } from "@/services/gym-service";
import { TransactionListView } from "@/components/tables/transaction-table";
import type { TransactionClient } from "@/types/gym-types";
import { Loader2, ShoppingCart, Plus, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { TransactionForm } from "@/components/forms/transaction-form";
import { EditTransactionForm } from "@/components/forms/edit/edit-transaction-form";
import { DeleteConfirmDialog } from "@/components/forms/delete-confirm-dialog";

export default function TransactionsView() {
  const [data, setData] = useState<TransactionClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<number | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const transactions = await TransactionService.getAll();
      setData(transactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (transactionId: number) => {
    setEditingTransactionId(transactionId);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (transactionId: number) => {
    setDeletingTransactionId(transactionId);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTransactionId) return;

    setIsDeleting(true);
    try {
      await TransactionService.delete(deletingTransactionId);
      setSuccessMessage("Transaction deleted successfully!");
      await fetchData();
      setDeletingTransactionId(null);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete transaction");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingTransactionId(null);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setTimeout(() => {
      setEditingTransactionId(null);
    }, 300);
  };

  const handleSuccess = () => {
    setIsSheetOpen(false);
    setSuccessMessage("Transaction saved successfully!");
    fetchData();
    setTimeout(() => {
      setEditingTransactionId(null);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }, 300);
  };

  const isEditing = editingTransactionId !== null;
  const transactionToDelete = deletingTransactionId
    ? data.find(t => t.transaction_client_id === deletingTransactionId)
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
          <ShoppingCart className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        </div>
        <Button 
          className="gap-2"
          onClick={() => {
            setEditingTransactionId(null);
            setIsSheetOpen(true);
          }}
        >
            <Plus className="h-4 w-4" />
            New Transaction
        </Button>
      </div>

      <TransactionListView 
        data={data} 
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
        <SheetContent side="right" className="sm:max-w-[500px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {isEditing ? "Edit Transaction" : "New Transaction"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Update transaction details and the list of articles."
                : "Create a new sales transaction for a client."}
            </SheetDescription>
          </SheetHeader>
          {isEditing ? (
            <EditTransactionForm
              transactionId={editingTransactionId}
              onSuccess={handleSuccess}
            />
          ) : (
            <TransactionForm onSuccess={handleSuccess} />
          )}
        </SheetContent>
      </Sheet>

      <DeleteConfirmDialog
        isOpen={deletingTransactionId !== null}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        description={`Are you sure you want to delete transaction #${transactionToDelete?.transaction_client_id}? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
