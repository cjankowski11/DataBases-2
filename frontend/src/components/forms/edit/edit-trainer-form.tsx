import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmployeeService } from "@/services/gym-service";
import { Loader2, User, Wallet, Calendar, CheckCircle, XCircle, Dumbbell, Briefcase } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EditTrainerFormProps {
  employeeId: number | string;
  onSuccess: () => void;
}

export function EditTrainerForm({ employeeId, onSuccess }: EditTrainerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trainerData, setTrainerData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsFetchingData(true);
        const response = await EmployeeService.getById(employeeId);
        const data = response?.data ? response.data : response;
        setTrainerData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load trainer data");
      } finally {
        setIsFetchingData(false);
      }
    };

    loadData();
  }, [employeeId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const payload = {
      name: formData.get("name") as string,
      surname: formData.get("surname") as string,
      gender: formData.get("gender") as string,
      salary: parseFloat(formData.get("salary") as string),
      date_employed: formData.get("date_employed") as string,
      is_employed: formData.get("is_employed") === "true",
      specialization: formData.get("specialization") as string,
      hourly_wage: parseFloat(formData.get("hourly_wage") as string),
    };

    try {
      await EmployeeService.update(employeeId, payload);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update trainer");
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
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4" /> Name
          </label>
          <Input id="name" name="name" required defaultValue={trainerData?.name} disabled={isLoading} />
        </div>

        <div className="space-y-2">
          <label htmlFor="surname" className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4" /> Surname
          </label>
          <Input id="surname" name="surname" required defaultValue={trainerData?.surname} disabled={isLoading} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="gender" className="text-sm font-medium flex items-center gap-2">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            required
            defaultValue={trainerData?.gender || "M"}
            disabled={isLoading}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="is_employed" className="text-sm font-medium flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> Status
          </label>
          <select
            id="is_employed"
            name="is_employed"
            required
            defaultValue={trainerData?.is_employed ? "true" : "false"}
            disabled={isLoading}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="specialization" className="text-sm font-medium flex items-center gap-2">
          <Dumbbell className="w-4 h-4" /> Specialization
        </label>
        <Input
          id="specialization"
          name="specialization"
          placeholder="e.g., Crossfit, Yoga, Bodybuilding"
          required
          defaultValue={trainerData?.specialization}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="salary" className="text-sm font-medium flex items-center gap-2">
            <Wallet className="w-4 h-4" /> Base Salary
          </label>
          <Input
            id="salary"
            name="salary"
            type="number"
            step="0.01"
            required
            defaultValue={trainerData?.salary}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="hourly_wage" className="text-sm font-medium flex items-center gap-2">
            <Wallet className="w-4 h-4" /> Hourly Wage
          </label>
          <Input
            id="hourly_wage"
            name="hourly_wage"
            type="number"
            step="0.01"
            required
            defaultValue={trainerData?.hourly_wage}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="date_employed" className="text-sm font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Date Employed
        </label>
        <Input
          id="date_employed"
          name="date_employed"
          type="date"
          required
          defaultValue={trainerData?.date_employed ? trainerData.date_employed.split("T")[0] : ""}
          disabled={isLoading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating trainer...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Update Trainer
          </>
        )}
      </Button>
    </form>
  );
}