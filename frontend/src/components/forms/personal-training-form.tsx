import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PersonalTrainingService, ClientService, TrainerService } from "@/services/gym-service";
import { Loader2, PlusCircle, User, Clock, Calendar, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PersonalTrainingFormProps {
  onSuccess: () => void;
}

interface BasicUser {
  id?: number;
  client_id?: number;
  trainer_id?: number;
  employee_id?: number;
  name: string;
  surname: string;
}

export function PersonalTrainingForm({ onSuccess }: PersonalTrainingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRelations, setIsLoadingRelations] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [clients, setClients] = useState<BasicUser[]>([]);
  const [trainers, setTrainers] = useState<BasicUser[]>([]);

  const [clientSearchText, setClientSearchText] = useState("");
  const [trainerSearchText, setTrainerSearchText] = useState("");

  const [validationErrors, setValidationErrors] = useState<{
    client_id?: string;
    trainer_id?: string;
    start_time?: string;
    duration?: string;
  }>({});

  useEffect(() => {
    const fetchRelations = async () => {
      try {
        setIsLoadingRelations(true);
        const [clientsRes, trainersRes] = await Promise.all([
          ClientService.getAll(),
          TrainerService.getAll()
        ]);
        
        setClients(Array.isArray(clientsRes) ? clientsRes : clientsRes?.data || []);
        setTrainers(Array.isArray(trainersRes) ? trainersRes : trainersRes?.data || []);
      } catch (err) {
        console.error("Failed to load relation lists:", err);
        setError("Could not load clients or trainers list.");
      } finally {
        setIsLoadingRelations(false);
      }
    };

    fetchRelations();
  }, []);

  const validateForm = (formData: FormData, selectedClient: BasicUser | undefined, selectedTrainer: BasicUser | undefined): boolean => {
    const errors: typeof validationErrors = {};

    if (!clientSearchText.trim() || !selectedClient) {
      errors.client_id = "Please select a valid client from the suggested list";
    }
    if (!trainerSearchText.trim() || !selectedTrainer) {
      errors.trainer_id = "Please select a valid trainer from the suggested list";
    }
    if (!formData.get("start_time")) {
      errors.start_time = "Date and time are required";
    }
    
    const duration = formData.get("duration") as string;
    if (!duration || isNaN(parseInt(duration)) || parseInt(duration) <= 0) {
      errors.duration = "Duration must be greater than 0";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const matchedClient = clients.find(
      (c) => `${c.name} ${c.surname}`.trim().toLowerCase() === clientSearchText.trim().toLowerCase()
    );
    const matchedTrainer = trainers.find(
      (t) => `${t.name} ${t.surname}`.trim().toLowerCase() === trainerSearchText.trim().toLowerCase()
    );

    const formData = new FormData(e.currentTarget);
    
    if (!validateForm(formData, matchedClient, matchedTrainer)) return;

    setIsLoading(true);

    let startTime = formData.get("start_time") as string;
    if (startTime && startTime.length === 16) {
      startTime += ":00";
    }

    const clientId = matchedClient?.client_id || matchedClient?.id;
    const trainerId = matchedTrainer?.trainer_id || matchedTrainer?.id || matchedTrainer?.employee_id;

    const payload = {
      client_id: parseInt(clientId!.toString(), 10),
      trainer_id: parseInt(trainerId!.toString(), 10),
      start_time: startTime, 
      duration: parseInt(formData.get("duration") as string, 10),
    };

    try {
      await PersonalTrainingService.add(payload);
      onSuccess();
    } catch (err: any) {
      if (err.response?.data) {
        console.error("Detale błędu walidacji z Backendupa:", err.response.data);
      } else {
        console.error("Pełny obiekt błędu łapanego w formularzu:", err);
      }
      setError(err instanceof Error ? err.message : "Failed to create personal training");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingRelations) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading form options...</span>
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
        <label htmlFor="client_search" className="text-sm font-medium flex items-center gap-2">
          <User className="w-4 h-4" /> Client <span className="text-destructive">*</span>
        </label>
        <input
          id="client_search"
          list="clients_add_list"
          required
          disabled={isLoading}
          value={clientSearchText}
          onChange={(e) => setClientSearchText(e.target.value)}
          placeholder="Type client name to search..."
          className={`flex h-10 w-full rounded-md border ${validationErrors.client_id ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
        />
        <datalist id="clients_add_list">
          {clients.map((c, index) => {
            const cId = c.client_id || c.id;
            return (
              <option key={`client-opt-${cId || index}`} value={`${c.name} ${c.surname}`} />
            );
          })}
        </datalist>
        {validationErrors.client_id && (
          <p className="text-sm text-destructive">{validationErrors.client_id}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="trainer_search" className="text-sm font-medium flex items-center gap-2">
          <User className="w-4 h-4" /> Trainer <span className="text-destructive">*</span>
        </label>
        <input
          id="trainer_search"
          list="trainers_add_list"
          required
          disabled={isLoading}
          value={trainerSearchText}
          onChange={(e) => setTrainerSearchText(e.target.value)}
          placeholder="Type trainer name to search..."
          className={`flex h-10 w-full rounded-md border ${validationErrors.trainer_id ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
        />
        <datalist id="trainers_add_list">
          {trainers.map((t, index) => {
            const tId = t.trainer_id || t.id || t.employee_id;
            return (
              <option key={`trainer-opt-${tId || index}`} value={`${t.name} ${t.surname}`} />
            );
          })}
        </datalist>
        {validationErrors.trainer_id && (
          <p className="text-sm text-destructive">{validationErrors.trainer_id}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="start_time" className="text-sm font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Date & Time <span className="text-destructive">*</span>
        </label>
        <Input
          id="start_time"
          name="start_time"
          type="datetime-local"
          required
          disabled={isLoading}
          className={validationErrors.start_time ? 'border-destructive' : ''}
        />
        {validationErrors.start_time && (
          <p className="text-sm text-destructive">{validationErrors.start_time}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="duration" className="text-sm font-medium flex items-center gap-2">
          <Clock className="w-4 h-4" /> Duration (minutes) <span className="text-destructive">*</span>
        </label>
        <Input
          id="duration"
          name="duration"
          type="number"
          placeholder="e.g. 60"
          required
          disabled={isLoading}
          min="1"
          className={validationErrors.duration ? 'border-destructive' : ''}
        />
        {validationErrors.duration && (
          <p className="text-sm text-destructive">{validationErrors.duration}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Scheduling training...
          </>
        ) : (
          <>
            <PlusCircle className="mr-2 h-4 w-4" />
            Schedule Training
          </>
        )}
      </Button>
    </form>
  );
}