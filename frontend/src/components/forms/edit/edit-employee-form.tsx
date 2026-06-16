import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmployeeService } from "@/services/gym-service";
import type { Employee } from "@/types/gym-types";
import { Loader2, User, Wallet, Calendar, CheckCircle, XCircle, Briefcase } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EditEmployeeFormProps {
  employeeId: number | string;
  onSuccess: () => void;
}

export function EditEmployeeForm({ employeeId, onSuccess }: EditEmployeeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeData, setEmployeeData] = useState<Employee | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsFetchingData(true);
        const response = await EmployeeService.getById(employeeId);
        const data = response?.data ? response.data : response;
        setEmployeeData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load employee data");
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
    };

    try {
      await EmployeeService.update(employeeId, payload);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update employee");
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
          <Input id="name" name="name" required defaultValue={employeeData?.name} disabled={isLoading} />
        </div>

        <div className="space-y-2">
          <label htmlFor="surname" className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4" /> Surname
          </label>
          <Input id="surname" name="surname" required defaultValue={employeeData?.surname} disabled={isLoading} />
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
            defaultValue={employeeData?.gender || "M"}
            disabled={isLoading}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="salary" className="text-sm font-medium flex items-center gap-2">
            <Wallet className="w-4 h-4" /> Base Salary (PLN)
          </label>
          <Input
            id="salary"
            name="salary"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={employeeData?.salary}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="date_employed" className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Date Employed
          </label>
          <Input
            id="date_employed"
            name="date_employed"
            type="date"
            required
            defaultValue={employeeData?.date_employed ? employeeData.date_employed.split("T")[0] : ""}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="is_employed" className="text-sm font-medium flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> Employment Status
          </label>
          <select
            id="is_employed"
            name="is_employed"
            required
            defaultValue={employeeData?.is_employed ? "true" : "false"}
            disabled={isLoading}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="true">Active (Employed)</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating employee...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Update Employee
          </>
        )}
      </Button>
    </form>
  );
}