import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EntryService, ClientService, GymService } from "@/services/gym-service";
import type { Client, Gym } from "@/types/gym-types";
import { Loader2, PlusCircle, User, Building, Calendar, CheckCircle, XCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface EntryFormProps {
  onSuccess: () => void;
}

export function EntryForm({ onSuccess }: EntryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);


  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsData, gymsData] = await Promise.all([
          ClientService.getAll(),
          GymService.getAll(),
        ]);
        setClients(clientsData);
        setGyms(gymsData);
      } catch (err) {
        setError("Failed to load clients or gyms list");
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
    const entryTime = formData.get("entry_time") as string;

    const payload = {
      client_id: parseInt(formData.get("client_id") as string),
      gym_id: parseInt(formData.get("gym_id") as string),
      entry_time: new Date(entryTime).toISOString(),
    };

    try {
      await EntryService.create(payload);
      setSuccessMessage("Entry recorded successfully!");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record entry");
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

      {/* Select Client*/}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <User className="w-4 h-4" /> Client
        </label>
        <select
          name="client_id"
          required
          disabled={isLoading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select a client...</option>
          {clients.map((c) => (
            <option key={c.client_id} value={c.client_id}>
              {c.name} {c.surname} ({c.email})
            </option>
          ))}
        </select>
      </div>

      {/* Select Gym */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Building className="w-4 h-4" /> Gym Location
        </label>
        <select
          name="gym_id"
          required
          disabled={isLoading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select gym...</option>
          {gyms.map((g) => (
            <option key={g.gym_id} value={g.gym_id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {/* Entry time */}
      <div className="space-y-2">
        <label htmlFor="entry_time" className="text-sm font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Entry Date & Time
        </label>
        <Input
          id="entry_time"
          name="entry_time"
          type="datetime-local"
          required
          max={new Date().toISOString().slice(0, 16)}
          defaultValue={new Date().toISOString().slice(0, 16)} // Domyślnie aktualny czas
          disabled={isLoading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating entry...
          </>
        ) : (
          <>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Entry
          </>
        )}
      </Button>
    </form>
  );
}

