import { useEffect, useState } from "react";
import { GymService } from "@/services/gym-service";
import { GymListView } from "@/components/tables/gym-table";
import type { Gym } from "@/types/gym-types";
import { Loader2, AlertCircle, Building2, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function GymsView() {
  const [data, setData] = useState<Gym[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const gyms = await GymService.getAll();
        setData(gyms);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load gyms");
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
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Gyms</h1>
        </div>
        <Button onClick={() => console.log("Open Create Modal")} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Gym
        </Button>
      </div>
      <GymListView data={data} />
    </div>
  );
}