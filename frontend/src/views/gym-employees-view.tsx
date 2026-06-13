import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { GymEmployeeService, GymService, EmployeeService } from "@/services/gym-service";
import type { GymEmployee, Gym } from "@/types/gym-types";
import { Loader2, Users, ArrowLeft, Plus, XCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { GymEmployeeListView } from "@/components/tables/gym-employee-table";
import { DeleteConfirmDialog } from "@/components/forms/delete-confirm-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { GymEmployeeForm } from "@/components/forms/gym-employee-form";

export default function GymEmployeesDetailView() {
  const params = useParams();
  const [, setLocation] = useLocation();

  const rawId = params?.gym_id;
  const numericGymId = Number(rawId);

  const [employees, setEmployees] = useState<GymEmployee[]>([]);
  const [gymDetails, setGymDetails] = useState<Gym | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const [deletingRelation, setDeletingRelation] = useState<GymEmployee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    if (!rawId || isNaN(numericGymId)) {
      setError(`Invalid gym ID in the URL.`);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      try {
        const gymResponse = await GymService.getById(numericGymId);
        const gymData = (gymResponse as any).data || gymResponse;
        setGymDetails(gymData);
      } catch (gymErr) {
        console.warn("Could not fetch gym details:", gymErr);
      }

      const relationsResponse = await GymEmployeeService.getAll({ gym_id: numericGymId });
      
      let relations: GymEmployee[] = [];
      if (Array.isArray(relationsResponse)) {
        relations = relationsResponse;
      } else if (relationsResponse && Array.isArray((relationsResponse as any).data)) {
        relations = (relationsResponse as any).data;
      }

      if (relations.length > 0) {
        const enrichedData = await Promise.all(
          relations.map(async (relation) => {
            try {
              const response = await EmployeeService.getById(relation.employee_id);
              const employeeData = (response as any).data || response;

              return {
                ...relation,
                employee: employeeData, 
              };
            } catch (empErr) {
              console.error(`Could not fetch details for employee ID ${relation.employee_id}:`, empErr);
              return relation;
            }
          })
        );
        setEmployees(enrichedData);
      } else {
        setEmployees([]);
      }

    } catch (err) {
      console.error("Error in fetchData:", err);
      setError("Could not fetch the staff list.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [rawId]);

  const handleSuccess = () => {
    setIsSheetOpen(false);
    setSuccessMessage("Employee has been successfully assigned to this gym!");
    fetchData();
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleDeleteClick = (gymId: number, employeeId: number) => {
    const targetRelation = employees.find(
      (e) => e.employee_id === employeeId && e.gym_id === gymId
    );
    
    if (targetRelation) {
      setDeletingRelation(targetRelation);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRelation) return;

    setIsDeleting(true);
    try {
      await (GymEmployeeService as any).deleteComposite(
        deletingRelation.gym_id,
        deletingRelation.employee_id
      );
      
      setSuccessMessage("Employee has been removed from this gym.");
      
      setEmployees((prev) => 
        prev.filter((e) => e.employee_id !== deletingRelation.employee_id)
      );
      
      setDeletingRelation(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error("Delete error:", err);
      setError(err instanceof Error ? err.message : "Could not remove the employee.");
      setTimeout(() => setError(null), 5000);
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

      <Button 
        variant="ghost" 
        className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
        onClick={() => setLocation("/gyms")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to gyms
      </Button>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {gymDetails ? `${gymDetails.name} — Staff` : "Gym Staff"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage employees assigned to this location.
            </p>
          </div>
        </div>
        <Button className="gap-2" onClick={() => setIsSheetOpen(true)}>
          <Plus className="h-4 w-4" />
          Assign Employee
        </Button>
      </div>

      <div className="mt-4">
        <GymEmployeeListView 
          data={employees} 
          onDelete={handleDeleteClick} 
        />
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="sm:max-w-[425px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Assign Employee</SheetTitle>
            <SheetDescription>
              Add a staff member to work at <strong>{gymDetails?.name || "this gym"}</strong>.
            </SheetDescription>
          </SheetHeader>
          
          <GymEmployeeForm 
            defaultGymId={numericGymId}
            onSuccess={handleSuccess} 
          />
        </SheetContent>
      </Sheet>

      <DeleteConfirmDialog
        isOpen={deletingRelation !== null}
        onClose={() => setDeletingRelation(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Employee from Gym"
        description={`Are you sure you want to remove employee "${deletingRelation?.employee?.name || "This employee"} ${deletingRelation?.employee?.surname || ""}" from this gym's staff list?`}
        isLoading={isDeleting}
      />
    </div>
  );
}