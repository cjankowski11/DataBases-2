import { useEffect, useState } from "react";
import { EquipmentService } from "@/services/gym-service";
import { EquipmentListView } from "@/components/tables/equipment-table";
import type { Equipment } from "@/types/gym-types";
import { Loader2, AlertCircle, Wrench, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function EquipmentView() {
  const [data, setData] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const equipment = await EquipmentService.getAll();
        setData(equipment);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load equipment");
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

  const filters = ["all", "machine", "weight", "accessory"] as const;

  const filtered =
    filter === "all" ? data : data.filter((e) => e.equipment_type === filter);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Wrench className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Equipment</h1>
        </div>
        <Button onClick={() => console.log("Open Create Modal")} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Equipment
        </Button>
      </div>

      {/* Filter tabs */}
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
              ({f === "all" ? data.length : data.filter((e) => e.equipment_type === f).length})
            </span>
          </Badge>
        ))}
      </div>

      <EquipmentListView data={filtered} />
    </div>
  );
}