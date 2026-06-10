import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EntryService, ClientService, GymService } from "@/services/gym-service";
import type { Client, Gym } from "@/types/gym-types";
import { Loader2, LogIn, User, Building } from "lucide-react";

interface EntryFormProps {
  onSuccess: () => void;
}

export function EntryForm({ onSuccess }: EntryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);

  // Pobieramy listy klientów i siłowni do Selectów
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

    const formData = new FormData(e.currentTarget);
    
    // Formatowanie daty i czasu dla backendu (ISO string)
    const entryTime = formData.get("entry_time") as string;
    
    const payload = {
      client_id: parseInt(formData.get("client_id") as string),
      gym_id: parseInt(formData.get("gym_id") as string),
      entry_time: new Date(entryTime).toISOString(),
    };

    try {
      await EntryService.create(payload);
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
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
          {error}
        </div>
      )}

      {/* Wybór Klienta */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <User className="w-4 h-4" /> Client
        </label>
        <select 
          name="client_id" 
          required 
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">Select a client...</option>
          {clients.map((c) => (
            <option key={c.client_id} value={c.client_id}>
              {c.name} {c.surname} ({c.email})
            </option>
          ))}
        </select>
      </div>

      {/* Wybór Siłowni */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Building className="w-4 h-4" /> Gym Location
        </label>
        <select 
          name="gym_id" 
          required 
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">Select gym...</option>
          {gyms.map((g) => (
            <option key={g.gym_id} value={g.gym_id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {/* Czas Wejścia */}
      <div className="space-y-2">
        <label htmlFor="entry_time" className="text-sm font-medium flex items-center gap-2">
          Entry Date & Time
        </label>
        <Input
          id="entry_time"
          name="entry_time"
          type="datetime-local"
          required
          defaultValue={new Date().toISOString().slice(0, 16)} // Domyślnie aktualny czas
          disabled={isLoading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Recording...
          </>
        ) : (
          <>
            <LogIn className="mr-2 h-4 w-4" />
            Record Entry
          </>
        )}
      </Button>
    </form>
  );
}
