import { useEffect, useState } from "react";
import { GymEmployeeService, GymService, EmployeeService } from "@/services/gym-service";
import type { Gym, Employee } from "@/types/gym-types";
import { Loader2, PlusCircle, Building2, User, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface GymEmployeeFormProps {
  defaultGymId?: number;
  onSuccess: () => void;
}

export function GymEmployeeForm({ defaultGymId, onSuccess }: GymEmployeeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLists, setIsLoadingLists] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [gyms, setGyms] = useState<Gym[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [gymSearchText, setGymSearchText] = useState("");
  const [employeeSearchText, setEmployeeSearchText] = useState("");

  const [validationErrors, setValidationErrors] = useState<{
    gym_id?: string;
    employee_id?: string;
  }>({});

  useEffect(() => {
    const loadFormData = async () => {
      try {
        setIsLoadingLists(true);
        setSubmitError(null);

        if (!defaultGymId) {
          const gymsResponse = await GymService.getAll();
          const gymsData = Array.isArray(gymsResponse)
            ? gymsResponse
            : (gymsResponse as any).data || [];
          setGyms(gymsData);
        }

        const employeesResponse = await EmployeeService.getAll();
        const employeesData = Array.isArray(employeesResponse)
          ? employeesResponse
          : (employeesResponse as any).data || [];
        setEmployees(employeesData);

      } catch (err) {
        console.error("Failed to load form lists:", err);
        setSubmitError("Failed to load employees or gyms list.");
      } finally {
        setIsLoadingLists(false);
      }
    };

    loadFormData();
  }, [defaultGymId]);

  const filteredGyms = gyms.filter((gym) =>
    gym.name.toLowerCase().includes(gymSearchText.toLowerCase())
  );

  const filteredEmployees = employees.filter((emp) =>
    `${emp.name} ${emp.surname}`.toLowerCase().includes(employeeSearchText.toLowerCase())
  );

  const validateForm = async (
    selectedGymId: number | undefined,
    selectedEmployee: Employee | undefined
  ): Promise<boolean> => {
    const errors: typeof validationErrors = {};

    if (!defaultGymId && !selectedGymId) {
      errors.gym_id = "Please select a valid gym location from the suggested list";
    }
    if (!employeeSearchText.trim() || !selectedEmployee) {
      errors.employee_id = "Please select a valid employee from the suggested list";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return false;
    }

    try {
      if (selectedGymId && selectedEmployee) {
        const response = await GymEmployeeService.getAll({ gym_id: selectedGymId });
        const existingRelations = Array.isArray(response) 
          ? response 
          : (response as any).data || [];

        const isAlreadyAssigned = existingRelations.some(
          (rel: any) => Number(rel.employee_id) === Number(selectedEmployee.employee_id)
        );

        if (isAlreadyAssigned) {
          errors.employee_id = "This employee is already assigned to this gym location.";
        }
      }
    } catch (err) {
      console.error("Validation duplicate check failed:", err);
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    const matchedGym = defaultGymId
      ? undefined
      : gyms.find((g) => g.name.trim().toLowerCase() === gymSearchText.trim().toLowerCase());

    const matchedEmployee = employees.find(
      (emp) => `${emp.name} ${emp.surname}`.trim().toLowerCase() === employeeSearchText.trim().toLowerCase()
    );

    const targetGymId = defaultGymId || matchedGym?.gym_id;

    const isValid = await validateForm(targetGymId, matchedEmployee);
    if (!isValid) return;

    setIsLoading(true);
    const targetEmployeeId = matchedEmployee?.employee_id;

    try {
      await GymEmployeeService.create({
        gym_id: Number(targetGymId),
        employee_id: Number(targetEmployeeId),
      });

      setGymSearchText("");
      setEmployeeSearchText("");
      setValidationErrors({});
      onSuccess();
    } catch (err) {
      console.error("Error creating relationship:", err);
      
      const errorMsg = err instanceof Error ? err.message : "";
      if (errorMsg.includes("409") || errorMsg.toLowerCase().includes("already") || errorMsg.toLowerCase().includes("exist")) {
        setSubmitError("Database conflict: This employee assignment already exists.");
      } else {
        setSubmitError(errorMsg || "Failed to assign employee to gym.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingLists) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading form options...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      {submitError && (
        <Alert variant="destructive" className="mb-4">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {!defaultGymId && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="gym_search" className="text-sm font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" /> Gym / Location <span className="text-destructive">*</span>
            </label>
            <span className="text-xs text-muted-foreground">
              {gymSearchText ? `${filteredGyms.length} found` : `${gyms.length} total`}
            </span>
          </div>
          <input
            id="gym_search"
            list="gyms_search_list"
            required
            disabled={isLoading}
            value={gymSearchText}
            onChange={(e) => setGymSearchText(e.target.value)}
            placeholder="Type gym name to search..."
            className={`flex h-10 w-full rounded-md border ${
              validationErrors.gym_id ? "border-destructive focus-visible:ring-destructive" : "border-input"
            } bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
          />
          <datalist id="gyms_search_list">
            ={filteredGyms.map((gym) => (
              <option key={`gym-opt-${gym.gym_id}`} value={gym.name} />
            ))}
          </datalist>
          {validationErrors.gym_id && (
            <p className="text-sm text-destructive">{validationErrors.gym_id}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="employee_search" className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" /> Employee <span className="text-destructive">*</span>
          </label>
          <span className="text-xs text-muted-foreground">
            {employeeSearchText ? `${filteredEmployees.length} found` : `${employees.length} total`}
          </span>
        </div>
        <input
          id="employee_search"
          list="employees_search_list"
          required
          disabled={isLoading}
          value={employeeSearchText}
          onChange={(e) => setEmployeeSearchText(e.target.value)}
          placeholder="Type employee name to search..."
          className={`flex h-10 w-full rounded-md border ${
            validationErrors.employee_id ? "border-destructive focus-visible:ring-destructive" : "border-input"
          } bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
        />
        <datalist id="employees_search_list">
          {filteredEmployees.map((emp) => {
            const position = (emp as any).employee_type || emp.role || "Staff";
            return (
              <option
                key={`emp-opt-${emp.employee_id}`}
                value={`${emp.name} ${emp.surname}`}
                label={`(${position})`}
              />
            );
          })}
        </datalist>
        {validationErrors.employee_id && (
          <p className="text-sm text-destructive">{validationErrors.employee_id}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Assigning employee...
          </>
        ) : (
          <>
            <PlusCircle className="mr-2 h-4 w-4" />
            Assign to Gym
          </>
        )}
      </Button>
    </form>
  );
}