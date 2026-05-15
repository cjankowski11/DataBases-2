import { useEffect, useState } from "react";
import { ClassTypeService } from "@/services/gym-service";
import { ClassTypeListView } from "@/components/tables/class-type-table";
import type { ClassType } from "@/types/gym-types";
import { Loader2, AlertCircle, Layers, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function ClassTypesView() {
  const [data, setData] = useState<ClassType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const types = await ClassTypeService.getAll();
        setData(types);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load class categories");
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
          <Layers className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Class Types</h1>
        </div>
        <Button onClick={() => console.log("Open Create Modal")} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Class Type
        </Button>
      </div>
      <ClassTypeListView data={data} />
    </div>
  );
}