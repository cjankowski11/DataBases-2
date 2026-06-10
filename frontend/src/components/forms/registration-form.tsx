import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RegistrationService, ClientService, ClassService } from "@/services/gym-service";
import type { Client, GymClass } from "@/types/gym-types";
import { Loader2, PlusCircle, Calendar, User, Dumbbell, CheckCircle } from "lucide-react";

interface RegistrationFormProps {
  onSuccess: () => void;
}

export function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedClient, setSelectedClient] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsData, classesData] = await Promise.all([
          ClientService.getAll(),
          ClassService.getAll(),
        ]);
        setClients(clientsData);
        setClasses(classesData);
      } catch (err) {
        setError("Failed to load clients or classes list");
      } finally {
        setIsFetchingData(false);
      }
    };
    loadData();
  }, []);

  const getClassDisplay = (classItem: GymClass) => {
    return `${classItem.class_type?.name || `Class #${classItem.class_id}`} - ${classItem.class_date} (Capacity: ${classItem.capacity})`;
  };

  const getClientDisplay = (client: Client) => {
    return `${client.name} ${client.surname}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const payload = {
      client_id: parseInt(formData.get("client_id") as string),
      class_id: parseInt(formData.get("class_id") as string),
      registration_date: formData.get("registration_date") as string,
    };

    try {
      await RegistrationService.add(payload);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create registration");
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
          <User className="w-4 h-4" /> Client
        </label>
        <select
          name="client_id"
          required
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          disabled={isLoading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select client...</option>
          {clients.map((client) => (
            <option key={client.client_id} value={client.client_id}>
              {getClientDisplay(client)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Dumbbell className="w-4 h-4" /> Class
        </label>
        <select
          name="class_id"
          required
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          disabled={isLoading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select class...</option>
          {classes.map((classItem) => (
            <option key={classItem.class_id} value={classItem.class_id}>
              {getClassDisplay(classItem)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="registration_date" className="text-sm font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Registration Date
        </label>
        <Input
          id="registration_date"
          name="registration_date"
          type="date"
          required
          defaultValue={new Date().toISOString().split("T")[0]}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Date when the client registered for the class
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating registration...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Register Client
          </>
        )}
      </Button>
    </form>
  );
}