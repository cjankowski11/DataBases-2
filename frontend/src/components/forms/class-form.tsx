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
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedClassType, setSelectedClassType] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");

  // Client-side validation errors
  const [validationErrors, setValidationErrors] = useState<{
    class_type_id?: string;
    room_id?: string;
    class_date?: string;
    duration?: string;
    capacity?: string;
  }>({});

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

  const validateForm = (formData: FormData): boolean => {
    const errors: { class_type_id?: string; room_id?: string; class_date?: string; duration?: string; capacity?: string } = {};

    // Validate class type
    const classTypeId = formData.get("class_type_id") as string;
    if (!classTypeId || classTypeId === "") {
      errors.class_type_id = "Please select a class type";
    } else {
      const classTypeIdNum = parseInt(classTypeId);
      if (isNaN(classTypeIdNum) || classTypeIdNum <= 0) {
        errors.class_type_id = "Invalid class type selection";
      } else if (!classTypes.some(ct => ct.class_type_id === classTypeIdNum)) {
        errors.class_type_id = "Selected class type does not exist";
      }
    }

    // Validate room
    const roomId = formData.get("room_id") as string;
    if (!roomId || roomId === "") {
      errors.room_id = "Please select a room";
    } else {
      const roomIdNum = parseInt(roomId);
      if (isNaN(roomIdNum) || roomIdNum <= 0) {
        errors.room_id = "Invalid room selection";
      } else if (!rooms.some(r => r.room_id === roomIdNum)) {
        errors.room_id = "Selected room does not exist";
      }
    }

    // Validate class date
    const classDate = formData.get("class_date") as string;
    if (!classDate) {
      errors.class_date = "Class date is required";
    } else {
      const selectedDate = new Date(classDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(selectedDate.getTime())) {
        errors.class_date = "Invalid date format";
      } else if (selectedDate < today) {
        errors.class_date = "Class date cannot be in the past";
      }
    }

    // Validate duration
    const duration = formData.get("duration") as string;
    if (!duration || duration === "") {
      errors.duration = "Duration is required";
    } else {
      const durationNum = parseInt(duration);
      if (isNaN(durationNum)) {
        errors.duration = "Duration must be a number";
      } else if (durationNum < 15) {
        errors.duration = "Duration must be at least 15 minutes";
      } else if (durationNum > 180) {
        errors.duration = "Duration cannot exceed 180 minutes";
      } else if (durationNum % 5 !== 0) {
        errors.duration = "Duration must be in multiples of 5 minutes";
      }
    }

    // Validate capacity
    const capacity = formData.get("capacity") as string;
    if (!capacity || capacity === "") {
      errors.capacity = "Capacity is required";
    } else {
      const capacityNum = parseInt(capacity);
      if (isNaN(capacityNum)) {
        errors.capacity = "Capacity must be a number";
      } else if (capacityNum < 1) {
        errors.capacity = "Capacity must be at least 1";
      } else if (capacityNum > 100) {
        errors.capacity = "Capacity cannot exceed 100 people";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    // Client-side validation
    if (!validateForm(formData)) {
      return;
    }

    setIsLoading(true);

    const payload = {
      class_date: formData.get("class_date") as string,
      class_type_id: parseInt(formData.get("class_type_id") as string),
      duration: parseInt(formData.get("duration") as string),
      capacity: parseInt(formData.get("capacity") as string),
      room_id: parseInt(formData.get("room_id") as string),
    };

    try {
      await ClassService.add(payload);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create fitness class");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChange = (field: 'class_type_id' | 'room_id') => {
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
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

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Dumbbell className="w-4 h-4" /> Class Type
          <span className="text-destructive">*</span>
        </label>
        <select
          name="class_type_id"
          required
          value={selectedClassType}
          onChange={(e) => {
            setSelectedClassType(e.target.value);
            handleSelectChange('class_type_id');
          }}
          disabled={isLoading}
          className={`flex h-10 w-full rounded-md border ${validationErrors.class_type_id ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <option value="">Select class type...</option>
          {classTypes.map((t) => (
            <option key={t.class_type_id} value={t.class_type_id}>
              {t.name} (Level {t.difficulty})
            </option>
          ))}
        </select>
        {validationErrors.class_type_id && (
          <p className="text-sm text-destructive">{validationErrors.class_type_id}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <DoorOpen className="w-4 h-4" /> Room
          <span className="text-destructive">*</span>
        </label>
        <select
          name="room_id"
          required
          value={selectedRoom}
          onChange={(e) => {
            setSelectedRoom(e.target.value);
            handleSelectChange('room_id');
          }}
          disabled={isLoading}
          className={`flex h-10 w-full rounded-md border ${validationErrors.room_id ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <option value="">Select room...</option>
          {rooms.map((r) => (
            <option key={r.room_id} value={r.room_id}>
              {r.name} — {r.gym?.name || `Gym #${r.gym_id}`}
            </option>
          ))}
        </select>
        {validationErrors.room_id && (
          <p className="text-sm text-destructive">{validationErrors.room_id}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="class_date" className="text-sm font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Class Date
          <span className="text-destructive">*</span>
        </label>
        <Input
          id="class_date"
          name="class_date"
          type="date"
          required
          defaultValue={new Date().toISOString().split("T")[0]}
          onChange={() => {
            if (validationErrors.class_date) {
              setValidationErrors(prev => ({ ...prev, class_date: undefined }));
            }
          }}
          disabled={isLoading}
          min={new Date().toISOString().split("T")[0]}
          className={validationErrors.class_date ? 'border-destructive' : ''}
        />
        {validationErrors.class_date ? (
          <p className="text-sm text-destructive">{validationErrors.class_date}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Class cannot be scheduled in the past
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="duration" className="text-sm font-medium flex items-center gap-2">
            <Timer className="w-4 h-4" /> Duration (min)
            <span className="text-destructive">*</span>
          </label>
          <Input
            id="duration"
            name="duration"
            type="number"
            min="15"
            max="180"
            step="5"
            placeholder="60"
            required
            onChange={() => {
              if (validationErrors.duration) {
                setValidationErrors(prev => ({ ...prev, duration: undefined }));
              }
            }}
            disabled={isLoading}
            className={validationErrors.duration ? 'border-destructive' : ''}
          />
          {validationErrors.duration ? (
            <p className="text-sm text-destructive">{validationErrors.duration}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              15-180 minutes, in multiples of 5
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="capacity" className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4" /> Capacity
            <span className="text-destructive">*</span>
          </label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            min="1"
            max="100"
            placeholder="20"
            required
            onChange={() => {
              if (validationErrors.capacity) {
                setValidationErrors(prev => ({ ...prev, capacity: undefined }));
              }
            }}
            disabled={isLoading}
            className={validationErrors.capacity ? 'border-destructive' : ''}
          />
          {validationErrors.capacity ? (
            <p className="text-sm text-destructive">{validationErrors.capacity}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Maximum 100 people per class
            </p>
          )}
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
