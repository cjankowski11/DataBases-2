import { useEffect, useState } from "react";
import { ClientSubscriptionService } from "@/services/gym-service";
import { SalesListView } from "@/components/tables/sales-table";
import type { ClientSubscription } from "@/types/gym-types";
import { Loader2, AlertCircle, ShoppingCart, Plus, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
} from "@/components/ui/sheet";
import { ClientSubscriptionForm } from "@/components/forms/client-subscription-form";
import { EditClientSubscriptionForm } from "@/components/forms/edit/edit-client-subscription-form";
import { DeleteConfirmDialog } from "@/components/forms/delete-confirm-dialog";

export default function SalesView() {
  const [data, setData] = useState<ClientSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "Y" | "N">("all");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingSaleId, setEditingSaleId] = useState<number | null>(null);
  const [deletingSaleId, setDeletingSaleId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const sales = await ClientSubscriptionService.getAll();
      setData(sales);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sales");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (saleId: number) => {
    setEditingSaleId(saleId);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (saleId: number) => {
    setDeletingSaleId(saleId);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSaleId) return;

    setIsDeleting(true);
    try {
      await ClientSubscriptionService.delete(deletingSaleId);
      setSuccessMessage("Sale deleted successfully!");
      await fetchData();
      setDeletingSaleId(null);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete sale");

      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingSaleId(null);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setTimeout(() => {
      setEditingSaleId(null);
    }, 300);
  };

  const handleSuccess = () => {
    setIsSheetOpen(false);
    setSuccessMessage("Sale saved successfully!");
    fetchData();
    setTimeout(() => {
      setEditingSaleId(null);
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

  const isEditing = editingSaleId !== null;
  const saleToDelete = deletingSaleId
    ? data.find(s => s.client_subscription_id === deletingSaleId)
    : null;

  const filtered =
    filter === "all" ? data : data.filter((s) => s.paid_now === filter);

  const paidCount   = data.filter((s) => s.paid_now === "Y").length;
  const unpaidCount = data.filter((s) => s.paid_now === "N").length;

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
          <h1 className="text-3xl font-bold tracking-tight">Sales (Client Subscriptions)</h1>
        </div>
        
        <Button
          className="gap-2"
          onClick={() => {
            setEditingSaleId(null);
            setIsSheetOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          New Sale
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <Badge
          variant={filter === "all" ? "default" : "outline"}
          className="cursor-pointer px-3 py-1 text-sm"
          onClick={() => setFilter("all")}
        >
          All ({data.length})
        </Badge>
        <Badge
          variant={filter === "Y" ? "default" : "outline"}
          className="cursor-pointer px-3 py-1 text-sm"
          onClick={() => setFilter("Y")}
        >
          Paid ({paidCount})
        </Badge>
        <Badge
          variant={filter === "N" ? "default" : "outline"}
          className="cursor-pointer px-3 py-1 text-sm"
          onClick={() => setFilter("N")}
        >
          Unpaid ({unpaidCount})
        </Badge>
      </div>

      <SalesListView 
        data={filtered} 
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
        <SheetContent side="right" className="sm:max-w-[425px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {isEditing ? "Edit Sale" : "Register New Sale"}
            </SheetTitle>
            <SheetDescription>
              {isEditing 
                ? "Update the subscription assignment details."
                : "Assign a subscription plan to a client. The expiration date will be calculated automatically."}
            </SheetDescription>
          </SheetHeader>
          {isEditing ? (
            <EditClientSubscriptionForm
              saleId={editingSaleId}
              onSuccess={handleSuccess}
            />
          ) : (
            <ClientSubscriptionForm onSuccess={handleSuccess} />
          )}
        </SheetContent>
      </Sheet>

      <DeleteConfirmDialog
        isOpen={deletingSaleId !== null}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Sale"
        description={`Are you sure you want to delete the sale for ${saleToDelete?.client ? `${saleToDelete.client.name} ${saleToDelete.client.surname}` : `Client #${saleToDelete?.client_id}`}? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}