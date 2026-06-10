import { useEffect, useState } from "react";
import { EmployeeService } from "@/services/gym-service";
import { EmployeeListView } from "@/components/tables/employee-table";
import { ReceptionistListView } from "@/components/tables/receptionist-table";
import { TrainerListView } from "@/components/tables/trainer-table";
import type { Employee } from "@/types/gym-types";
import { Loader2, AlertCircle, Users, UserPlus, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation, Link } from "wouter";
import { DeleteConfirmDialog } from "@/components/forms/delete-confirm-dialog";

export default function EmployeeView() {
  const [data, setData] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [, setLocation] = useLocation();

  const [deletingEmployeeId, setDeletingEmployeeId] = useState<number | string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await EmployeeService.getAll();
      
      if (response && Array.isArray(response.data)) {
        setData(response.data);
      } else if (Array.isArray(response)) {
        setData(response);
      } else {
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

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteClick = (employeeId: number | string) => {
    setDeletingEmployeeId(employeeId);
  };

  const handleDeleteCancel = () => {
    setDeletingEmployeeId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEmployeeId) return;

    setIsDeleting(true);
    try {
      await EmployeeService.delete(deletingEmployeeId);
      setSuccessMessage("Employee deleted successfully!");
      
      setData((prevData) => prevData.filter((e) => e.employee_id !== deletingEmployeeId));
      setDeletingEmployeeId(null);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete employee");
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const filters = ["all", "receptionist", "trainer"] as const;

  const filtered =
    filter === "all" ? data : data.filter((e) => e.employee_type === filter);

  const buttonConfig = {
    all: { text: "Add Employee", icon: <UserPlus className="h-4 w-4" />, href: "/employees/new" },
    receptionist: { text: "Add Receptionist", icon: <UserPlus className="h-4 w-4 text-blue-500" />, href: "/receptionists/new" },
    trainer: { text: "Add Trainer", icon: <UserPlus className="h-4 w-4 text-green-500" />, href: "/trainers/new" },
  } as const;

  const currentButton = buttonConfig[filter as keyof typeof buttonConfig] || buttonConfig.all;

  const employeeToDelete = deletingEmployeeId
    ? data.find(e => e.employee_id === deletingEmployeeId)
    : null;

  return (
    <div className="p-8 space-y-6">
      {successMessage && (
        <Alert className="border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
        </div>
        
        <Link to={currentButton.href}>
          <Button className="gap-2 capitalize">
            {currentButton.icon}
            {currentButton.text}
          </Button>
        </Link>
      </div>

      <div className="flex gap-2">
        {filters.map((f) => (
          <Badge
            key={f}
            variant={filter === f ? "default" : "outline"}
            className="cursor-pointer capitalize px-3 py-1 text-sm"
            onClick={() => setFilter(f)}
          >
            {f}
            <span className="ml-1 text-xs opacity-70">
              ({f === "all" ? data.length : data.filter((e) => e.employee_type === f).length})
            </span>
          </Badge>
        ))}
      </div>

      <div className="mt-4">
        {(() => {
          switch (filter) {
            case "trainer":
              return <TrainerListView data={filtered} onDelete={handleDeleteClick} />;
            case "receptionist":
              return <ReceptionistListView data={filtered} onDelete={handleDeleteClick} />;
            default:
              return <EmployeeListView data={filtered} onDelete={handleDeleteClick} />;
          }
        })()}
      </div>


      <DeleteConfirmDialog
        isOpen={deletingEmployeeId !== null}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Employee"
        description={`Are you sure you want to delete employee "${employeeToDelete?.name} ${employeeToDelete?.surname}" (ID: #${employeeToDelete?.employee_id})? This will also wipe their role data. This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}