import { useEffect, useState } from "react";
import { AddressService } from "@/services/gym-service";
import { AddressListView } from "@/components/tables/address-table";
import type { Address } from "@/types/gym-types";
import { Loader2, MapPinHouse, Plus, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/forms/delete-confirm-dialog";
import { AddressForm } from "@/components/forms/address-form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export default function AddressesView() {
  const [data, setData] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [addressToDeleteId, setAddressToDeleteId] = useState<number | string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const addresses = await AddressService.getAll();
      setData(addresses);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load addresses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteClick = (addressId: number) => {
    setAddressToDeleteId(addressId);
  };

  const handleDeleteConfirm = async () => {
    if (!addressToDeleteId) return;
    setIsDeleting(true);

    try {
      console.log("Delete finalized for address ID: " + addressToDeleteId);
      await AddressService.delete(addressToDeleteId);
      setSuccessMessage("Address deleted successfully!");
      await fetchData();

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (error: any) {
      setError(error instanceof Error ? error.message : "Failed to delete address");

      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setAddressToDeleteId(null);
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setAddressToDeleteId(null);
  };


  const handleSheetClose = () => {
    setIsSheetOpen(false);
  };

  const handleSuccess = () => {
    setIsSheetOpen(false);
    fetchData();
    setSuccessMessage("Address saved successfully!");
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const addressToDelete = addressToDeleteId
    ? data.find(a => a.address_id === addressToDeleteId)
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
          <MapPinHouse className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Addresses</h1>
        </div>
        <Button onClick={() => setIsSheetOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Address
        </Button>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
          <SheetContent side="right" className="sm:max-w-[425px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>
                Add New Address
              </SheetTitle>
              <SheetDescription>
                Create a new address. Fill in all the details below.
              </SheetDescription>
            </SheetHeader>
              <AddressForm onSuccess={handleSuccess} />
          </SheetContent>
        </Sheet>

      <AddressListView
        data={data}
        onDelete={handleDeleteClick}
      />

      <DeleteConfirmDialog
        isOpen={addressToDeleteId !== null}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Address"
        description={`Are you sure you want to delete address "${addressToDelete?.city} ${addressToDelete?.street} #${addressToDelete?.address_id}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}