import { useEffect, useState } from "react";
import { EntryService } from "@/services/gym-service";
import { EntryListView } from "@/components/tables/entry-table";
import type { Entry } from "@/types/gym-types";
import { Loader2, AlertCircle, DoorOpen, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function EntryView() {
  const [data, setData] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const entries = await EntryService.getAll();
        setData(entries);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load entries");
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
          <DoorOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Gym Entries</h1>
        </div>
        <Button onClick={() => console.log("Open Create Modal")} className="gap-2">
          <Plus className="h-4 w-4" />
          Register Entry
        </Button>
      </div>
      <EntryListView data={data} />
    </div>
  );
}