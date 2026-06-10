import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClassService, ClassTypeService, RoomService } from "@/services/gym-service";
import type { ClassType, Room } from "@/types/gym-types";
import { Loader2, PlusCircle, Calendar, Dumbbell, DoorOpen, Timer, Users, CheckCircle, XCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface ClassFormProps {
  onSuccess: () => void;
}

export function ClassForm({ onSuccess }: ClassFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [typesData, roomsData] = await Promise.all([
          ClassTypeService.getAll(),
          RoomService.getAll(),
        ]);
        setClassTypes(typesData);
        setRooms(roomsData);
      } catch (err) {
        setError("Failed to load class types or rooms list");
      } finally {
        setIsFetchingData(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(e.currentTarget);

    const payload = {
      class_date: formData.get("class_date") as string,
      class_type_id: parseInt(formData.get("class_type_id") as string),
      duration: parseInt(formData.get("duration") as string),
      capacity: parseInt(formData.get("capacity") as string),
      room_id: parseInt(formData.get("room_id") as string),
    };

    try {
      await ClassService.add(payload);
      setSuccessMessage("Class created successfully!");

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create fitness class");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingData) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-4 border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Dumbbell className="w-4 h-4" /> Class Type
        </label>
        <select
          name="class_type_id"
          required
          disabled={isLoading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select class type...</option>
          {classTypes.map((t) => (
            <option key={t.class_type_id} value={t.class_type_id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <DoorOpen className="w-4 h-4" /> Room
        </label>
        <select
          name="room_id"
          required
          disabled={isLoading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select room...</option>
          {rooms.map((r) => (
            <option key={r.room_id} value={r.room_id}>
              {r.name} — {r.gym?.name || `Gym #${r.gym_id}`}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="class_date" className="text-sm font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Class Date
        </label>
        <Input
          id="class_date"
          name="class_date"
          type="date"
          required
          defaultValue={new Date().toISOString().split("T")[0]}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="duration" className="text-sm font-medium flex items-center gap-2">
            <Timer className="w-4 h-4" /> Duration (min)
          </label>
          <Input
            id="duration"
            name="duration"
            type="number"
            min="1"
            placeholder="60"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="capacity" className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4" /> Capacity
          </label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            min="1"
            placeholder="20"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating class...
          </>
        ) : (
          <>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Class
          </>
        )}
      </Button>
    </form>
  );
}