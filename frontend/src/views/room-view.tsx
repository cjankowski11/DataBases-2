import { useEffect, useState } from "react";
import { RoomService } from "@/services/gym-service";
import type { Room } from "@/types/gym-types";
import { Loader2, DoorOpen, Plus, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RoomListView } from "@/components/tables/room-table";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { RoomForm } from "@/components/forms/room-form";
import { EditRoomForm } from "@/components/forms/edit/edit-room-form";
import { DeleteConfirmDialog } from "@/components/forms/delete-confirm-dialog";

export default function RoomsView() {
  const [data, setData] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [deletingRoomId, setDeletingRoomId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const rooms = await RoomService.getAll();
      setData(rooms);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load rooms");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (roomId: number) => {
    setEditingRoomId(roomId);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (roomId: number) => {
    setDeletingRoomId(roomId);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRoomId) return;

    setIsDeleting(true);
    try {
      await RoomService.delete(deletingRoomId);
      setSuccessMessage("Room deleted successfully!");
      await fetchData();
      setDeletingRoomId(null);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete room");

      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingRoomId(null);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setTimeout(() => {
      setEditingRoomId(null);
    }, 300);
  };

  const handleSuccess = () => {
    setIsSheetOpen(false);
    setSuccessMessage("Room saved successfully!");
    fetchData();
    setTimeout(() => {
      setEditingRoomId(null);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }, 300);
  };

  const isEditing = editingRoomId !== null;
  const roomToDelete = deletingRoomId
    ? data.find(r => r.room_id === deletingRoomId)
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
          <DoorOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Rooms</h1>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditingRoomId(null);
            setIsSheetOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Room
        </Button>
      </div>

      <RoomListView
        data={data}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
        <SheetContent side="right" className="sm:max-w-[425px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {isEditing ? "Edit Room" : "Add New Room"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Update the room details. Modify room name or gym location."
                : "Create a new room. Fill in the room name and select the gym."}
            </SheetDescription>
          </SheetHeader>
          {isEditing ? (
            <EditRoomForm
              roomId={editingRoomId}
              onSuccess={handleSuccess}
            />
          ) : (
            <RoomForm onSuccess={handleSuccess} />
          )}
        </SheetContent>
      </Sheet>

      <DeleteConfirmDialog
        isOpen={deletingRoomId !== null}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Room"
        description={`Are you sure you want to delete room "${roomToDelete?.name}"? This action cannot be undone and may affect existing classes.`}
        isLoading={isDeleting}
      />
    </div>
  );
}