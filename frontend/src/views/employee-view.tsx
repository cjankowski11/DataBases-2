import { useEffect, useState } from "react";
import { EmployeeService } from "@/services/gym-service";
import { EmployeeListView } from "@/components/tables/employee-table";
import type { Employee } from "@/types/gym-types";
import { Loader2, AlertCircle, Users, UserPlus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function EmployeeView() {
  const [data, setData] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await EmployeeService.getAll();
      
      if (Array.isArray(response)) {
        setData(response);
      }

      else {
        console.error("Nieoczekiwana struktura danych:", response);
        setData([]);
      }
    } catch (err) {
      console.error("Błąd w useEffect:", err);
      setError("Nie udało się pobrać pracowników.");
    } finally {
      setIsLoading(false);
    }
  };
  fetchData();
}, []);

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <EmployeeListView data={data} />
    </div>
  );
}