import { useEffect, useState } from "react";
import { EquipmentService, GymService } from "@/services/gym-service";
import { EquipmentListView } from "@/components/tables/equipment-table";
import type { Equipment, Gym } from "@/types/gym-types";
import { Loader2, AlertCircle, Wrench, Plus, CheckCircle, XCircle } from "lucide-react";
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
import { EquipmentForm } from "@/components/forms/equipment-form";
import { EditEquipmentForm } from "@/components/forms/edit/edit-equipment-form";
import { DeleteConfirmDialog } from "@/components/forms/delete-confirm-dialog";

export default function EquipmentView() {
  const [data, setData] = useState<Equipment[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEquipmentId, setEditingEquipmentId] = useState<number | null>(null);
  const [deletingEquipmentId, setDeletingEquipmentId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [equipment, gymsData] = await Promise.all([
        EquipmentService.getAll(),
        GymService.getAll()
      ]);
      setData(equipment);
      setGyms(gymsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (equipmentId: number) => {
    setEditingEquipmentId(equipmentId);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (equipmentId: number) => {
    setDeletingEquipmentId(equipmentId);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEquipmentId) return;

    setIsDeleting(true);
    try {
      await EquipmentService.delete(deletingEquipmentId);
      setSuccessMessage("Equipment deleted successfully!");
      await fetchData();
      setDeletingEquipmentId(null);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete equipment");

      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingEquipmentId(null);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setTimeout(() => {
      setEditingEquipmentId(null);
    }, 300);
  };

  const handleSuccess = () => {
    setIsSheetOpen(false);
    setSuccessMessage("Equipment saved successfully!");
    fetchData();
    setTimeout(() => {
      setEditingEquipmentId(null);
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

  const filters = ["all", "machine", "weight", "accessory"] as const;

  const filtered =
    filter === "all" ? data : data.filter((e) => e.equipment_type === filter);

  const isEditing = editingEquipmentId !== null;
  const equipmentToDelete = deletingEquipmentId
    ? data.find(e => e.equipment_id === deletingEquipmentId)
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
          <Wrench className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Equipment</h1>
        </div>
        
        <Button
          className="gap-2"
          onClick={() => {
            setEditingEquipmentId(null);
            setIsSheetOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Equipment
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <Badge
            key={f}
            variant={filter === f ? "default" : "outline"}
            className="cursor-pointer capitalize px-3 py-1 text-sm"
            onClick={() => setFilter(f)}
          >
            {f}
            <span className="ml-1 text-xs opacity-70">
              ({f === "all" ? data.length : data.filter((e) => e.equipment_type === f).length})
            </span>
          </Badge>
        ))}
      </div>

      <EquipmentListView 
        data={filtered} 
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
        <SheetContent side="right" className="sm:max-w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {isEditing ? "Edit Equipment" : "Add New Equipment"}
            </SheetTitle>
            <SheetDescription>
              {isEditing 
                ? "Update the equipment details. Modify common or specific fields."
                : "Register a new piece of equipment. Select the type first to see specific fields."}
            </SheetDescription>
          </SheetHeader>
          {isEditing ? (
            <EditEquipmentForm
              equipmentId={editingEquipmentId}
              gyms={gyms}
              onSuccess={handleSuccess}
            />
          ) : (
            <EquipmentForm 
              gyms={gyms}
              onSuccess={handleSuccess} 
            />
          )}
        </SheetContent>
      </Sheet>

      <DeleteConfirmDialog
        isOpen={deletingEquipmentId !== null}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Equipment"
        description={`Are you sure you want to delete equipment "${equipmentToDelete?.name} #${equipmentToDelete?.equipment_id}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}