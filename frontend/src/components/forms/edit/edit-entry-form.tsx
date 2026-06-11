import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EntryService, ClientService, GymService } from "@/services/gym-service";
import { Loader2, PlusCircle, Building2, User, Calendar, CheckCircle, XCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import type { Client, Gym, Entry } from "@/types/gym-types";

interface EditEntryFormProps {
  entryId: number;
  onSuccess: () => void;
}

export function EditEntryForm({ entryId, onSuccess }: EditEntryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [clients, setClients] = useState<Client[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [entryData, setEntryData] = useState<Entry | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsFetchingData(true);
        const [clientsData, gymsData, entry] = await Promise.all([
          ClientService.getAll(),
          GymService.getAll(),
          EntryService.getById(entryId)
        ]);
        setClients(clientsData);
        setGyms(gymsData);
        setEntryData(entry);
      } catch (err) {
        setError("Failed to load necessary data");
      } finally {
        setIsFetchingData(false);
      }
    };

    fetchInitialData();
  }, [entryId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(e.currentTarget);
    const clientId = formData.get("client_id") as string;
    const gymId = formData.get("gym_id") as string;
    const entryTime = formData.get("entry_time") as string;

    const payload = {
      client_id: parseInt(clientId),
      gym_id: parseInt(gymId),
      entry_time: new Date(entryTime).toISOString(),
    };

    try {
      await EntryService.update(entryId, payload);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update entry");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTimeLocal = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
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

      <div className="space-y-4">
        {/* Client Selection */}
        <div className="space-y-2">
          <label htmlFor="client_id" className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4" /> Client
          </label>
          <select
            id="client_id"
            name="client_id"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
            defaultValue={entryData?.client_id}
            disabled={isLoading}
          >
            <option value="">Select a client...</option>
            {clients.map((c) => (
              <option key={c.client_id} value={c.client_id}>
                {c.name} {c.surname} (ID: {c.client_id})
              </option>
            ))}
          </select>
        </div>

        {/* Gym Selection */}
        <div className="space-y-2">
          <label htmlFor="gym_id" className="text-sm font-medium flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Gym Location
          </label>
          <select
            id="gym_id"
            name="gym_id"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
            defaultValue={entryData?.gym_id}
            disabled={isLoading}
          >
            <option value="">Select a gym...</option>
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
            defaultValue={formatDateTimeLocal(entryData?.entry_time)}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating entry...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Update Entry
          </>
        )}
      </Button>
    </form>
  );
}