import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PersonalTrainingService, EmployeeService, ClientService } from "@/services/gym-service";
import type { PersonalTraining, Employee, Client } from "@/types/gym-types";
import { Loader2, User, Clock, Calendar, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EditPersonalTrainingFormProps {
  trainingId: number | string;
  onSuccess: () => void;
}

export function EditPersonalTrainingForm({ trainingId, onSuccess }: EditPersonalTrainingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trainingData, setTrainingData] = useState<PersonalTraining | null>(null);

  const [allClients, setAllClients] = useState<Client[]>([]);
  const [allTrainers, setAllTrainers] = useState<Employee[]>([]);

  const [clientSearchText, setClientSearchText] = useState("");
  const [trainerSearchText, setTrainerSearchText] = useState("");

  useEffect(() => {
    const loadAllFormData = async () => {
      try {
        setIsFetchingData(true);
        setError(null);

        const trainingResponse = await PersonalTrainingService.getById(trainingId);
        const tData = trainingResponse?.data ? trainingResponse.data : trainingResponse;
        setTrainingData(tData);

        if (tData) {
          if (tData.client) {
            setClientSearchText(`${tData.client.name} ${tData.client.surname}`);
          }
          if (tData.trainer) {
            setTrainerSearchText(`${tData.trainer.name} ${tData.trainer.surname}`);
          }
        }

        const clientsResponse = await ClientService.getAll();
        const cData = clientsResponse?.data ? clientsResponse.data : clientsResponse;
        if (Array.isArray(cData)) setAllClients(cData);

        const trainersResponse = await EmployeeService.getAll();
        const trData = trainersResponse?.data ? trainersResponse.data : trainersResponse;
        if (Array.isArray(trData)) setAllTrainers(trData);

      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load required form data");
      } finally {
        setIsFetchingData(false);
      }
    };

    loadAllFormData();
  }, [trainingId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const selectedClient = allClients.find(
      (c) => `${c.name} ${c.surname}`.trim() === clientSearchText.trim()
    );
    const selectedTrainer = allTrainers.find(
      (t) => `${t.name} ${t.surname}`.trim() === trainerSearchText.trim()
    );

    if (!selectedClient || !selectedTrainer) {
      setError("Please select a valid Client and Trainer from the list. Type and click one.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);

    const payload = {
      client_id: selectedClient.client_id,
      trainer_id: selectedTrainer.employee_id,
      start_time: formData.get("start_time") as string, 
      duration: parseInt(formData.get("duration") as string),
    };

    try {
      await PersonalTrainingService.update(trainingId, payload);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update personal training");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTimeForInput = (dateTimeString: string | undefined) => {
    if (!dateTimeString) return "";
    return dateTimeString.substring(0, 16);
  };

  if (isFetchingData || !trainingData) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="client_search" className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4" /> Client
          </label>
          <input
            id="client_search"
            list="clients_list"
            required
            disabled={isLoading}
            value={clientSearchText}
            onChange={(e) => setClientSearchText(e.target.value)}
            placeholder="Type client name..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <datalist id="clients_list">
            {allClients.map((client) => (
              <option key={client.client_id} value={`${client.name} ${client.surname}`} />
            ))}
          </datalist>
        </div>

        <div className="space-y-2">
          <label htmlFor="trainer_search" className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4" /> Trainer
          </label>
          <input
            id="trainer_search"
            list="trainers_list"
            required
            disabled={isLoading}
            value={trainerSearchText}
            onChange={(e) => setTrainerSearchText(e.target.value)}
            placeholder="Type trainer name..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <datalist id="trainers_list">
            {allTrainers.map((trainer) => (
              <option key={trainer.employee_id} value={`${trainer.name} ${trainer.surname}`} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="start_time" className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Date & Time
          </label>
          <Input
            id="start_time"
            name="start_time"
            type="datetime-local"
            required
            defaultValue={formatDateTimeForInput(trainingData.start_time)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="duration" className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" /> Duration (min)
          </label>
          <Input
            id="duration"
            name="duration"
            type="number"
            min="1"
            required
            defaultValue={trainingData.duration}
            disabled={isLoading}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating training...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Update Training Session
          </>
        )}
      </Button>
    </form>
  );
}