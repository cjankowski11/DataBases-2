import type { Address } from "@/types/gym-types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import React, { useState } from "react"
import { TablePagination } from "./table-pagination"
import { TableActions } from "./table-actions"
import { AddressService } from "@/services/gym-service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface AddressListViewProps {
  data: Address[]
}

export function AddressListView({ data }: AddressListViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [addressToDelete, setAddressToDelete] = useState<number | string | null>(null);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  const handleDeleteConfirm = async () => {
    if (!addressToDelete) return;

    try {
      console.log("Delete finalized for address ID: " + addressToDelete);
      await AddressService.delete(addressToDelete);
      window.location.reload();
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred.";

      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(`Deletion Failed:\n${errorMessage}`);
      console.error("Failed to delete address:", error);
    } finally {
      setAddressToDelete(null);
    }
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>City</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Postal Code</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((a) => (
              <TableRow key={a.address_id}>
                {/* City */}
                <TableCell className="font-medium">
                  {a.city}
                </TableCell>

                {/* Street and number */}
                <TableCell>
                  {`${a.street} ${a.building_number}`}
                </TableCell>

                {/* Postal code */}
                <TableCell className="text-muted-foreground text-sm">
                  {a.postal_code}
                </TableCell>

                <TableCell className="text-right">
                  <TableActions
                    label="Address Management"
                    onDelete={() => setAddressToDelete(a.address_id)}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No addresses found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <AlertDialog 
        open={addressToDelete !== null} 
        onOpenChange={(open) => { if (!open) setAddressToDelete(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Do you want to delete this address?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

