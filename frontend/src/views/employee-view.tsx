import { useEffect, useState } from "react";
import { EmployeeService } from "@/services/gym-service";
import { EmployeeListView } from "@/components/tables/employee-table";
import { ReceptionistListView } from "@/components/tables/receptionist-table";
import { TrainerListView } from "@/components/tables/trainer-table";
import type { Employee } from "@/types/gym-types";
import { Loader2, AlertCircle, Users, UserPlus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation, Link } from "wouter";

export default function EmployeeView() {
  const [data, setData] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [, setLocation] = useLocation();

  useEffect(() => {
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

  const filters = ["all", "receptionist", "trainer"] as const;

  const filtered =
    filter === "all" ? data : data.filter((e) => e.employee_type === filter);

  const buttonConfig = {
    all: { 
      text: "Add Employee", 
      icon: <UserPlus className="h-4 w-4" />, 
      href: "/employees/new" 
    },
    receptionist: { 
      text: "Add Receptionist", 
      icon: <UserPlus className="h-4 w-4 text-blue-500" />, 
      href: "/receptionists/new" 
    },
    trainer: { 
      text: "Add Trainer", 
      icon: <UserPlus className="h-4 w-4 text-green-500" />, 
      href: "/trainers/new" 
    },
  } as const;

  const currentButton = buttonConfig[filter as keyof typeof buttonConfig] || buttonConfig.all;

  return (
    <div className="p-8 space-y-6">
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
        </div>
        
        <Link to={currentButton.href}>
          <Button className="gap-2 capitalize animate-in fade-in duration-200">
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
              return <TrainerListView data={filtered} />;
            case "receptionist":
              return <ReceptionistListView data={filtered} />;
            default:
              return <EmployeeListView data={filtered} />;
          }
        })()}
      </div>

    </div>
  );
}