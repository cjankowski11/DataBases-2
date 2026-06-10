import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoomService, GymService } from "@/services/gym-service";
import type { Gym } from "@/types/gym-types";
import { Loader2, PlusCircle, Building2, DoorOpen, MapPin } from "lucide-react";

interface RoomFormProps {
  onSuccess: () => void;
}

export function RoomForm({ onSuccess }: RoomFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gyms, setGyms] = useState<Gym[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const gymsData = await GymService.getAll();
        setGyms(gymsData);
      } catch (err) {
        setError("Failed to load gyms list");
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

    const formData = new FormData(e.currentTarget);

    const payload = {
      name: formData.get("name") as string,
      gym_id: parseInt(formData.get("gym_id") as string),
    };

    try {
      await RoomService.add(payload);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room");
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
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Building2 className="w-4 h-4" /> Gym
        </label>
        <select
          name="gym_id"
          required
          disabled={isLoading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select gym...</option>
          {gyms.map((gym) => (
            <option key={gym.gym_id} value={gym.gym_id}>
              {gym.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
          <DoorOpen className="w-4 h-4" /> Room Name
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="e.g., Main Studio, Yoga Room, Weight Room"
          required
          disabled={isLoading}
          maxLength={64}
        />
        <p className="text-xs text-muted-foreground">
          Maximum 64 characters
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating room...
          </>
        ) : (
          <>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Room
          </>
        )}
      </Button>
    </form>
  );
}