import { useEffect, useState, useCallback } from "react";
import { RegistrationService } from "@/services/gym-service";
import type { Registration } from "@/types/gym-types";
import type { SortField, SortOrder } from "@/components/tables/registration-table";
import { Loader2, ClipboardList, Plus, CheckCircle, XCircle } from "lucide-react";
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

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [appliedStartDate, setAppliedStartDate] = useState<string>("");
  const [appliedEndDate, setAppliedEndDate] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: Record<string, any> = {
        page: currentPage,
        limit: 10,
        sort_by: sortField,
        sort_order: sortOrder
      };

      if (appliedStartDate) params.start_date = appliedStartDate;
      if (appliedEndDate) params.end_date = appliedEndDate;

      const response = await RegistrationService.getAll(params) as any;

      if (response && Array.isArray(response.items)) {
        setData(response.items);
        setTotalPages(response.total_pages || 1);
      } else if (Array.isArray(response)) {
        setData(response);
        setTotalPages(1);
      } else {
        console.warn("Received unexpected payload layout:", response);
        setData([]);
        setTotalPages(1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load registrations");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, sortField, sortOrder, appliedStartDate, appliedEndDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
    setCurrentPage(1);
  };

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
      setDeletingRegistrationId(null);
      await fetchData();

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

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setAppliedStartDate("");
    setAppliedEndDate("");
    setCurrentPage(1);
  };

  const applyFilters = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setCurrentPage(1);
  };

  const isEditing = editingRegistrationId !== null;
  const registrationToDelete = deletingRegistrationId
    ? data.find(r => r.class_registration_id === deletingRegistrationId)
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

      <div className="flex gap-4 items-end bg-muted/50 p-4 rounded-lg">
        <div className="space-y-2">
          <p className="text-sm font-medium">From</p>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">To</p>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <Button onClick={applyFilters} size="sm">Apply</Button>
        {(appliedStartDate || appliedEndDate) && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
        )}
      </div>

      <div className="rounded-md border p-1 min-h-[300px] relative flex flex-col justify-between">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] z-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : null}

        <RegistrationListView
          data={data}
          totalPages={totalPages}
          currentPage={currentPage}
          sortField={sortField}
          sortOrder={sortOrder}
          onPageChange={setCurrentPage}
          onSortChange={handleSortChange}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      </div>

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