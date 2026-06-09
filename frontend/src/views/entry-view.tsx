import { useEffect, useState } from "react";
import { EntryService } from "@/services/gym-service";
import { EntryListView } from "@/components/tables/entry-table";
import type { Entry } from "@/types/gym-types";
import { Loader2, AlertCircle, DoorOpen, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { EntryForm } from "@/components/forms/entry-form";

export default function EntryView() {
  const [data, setData] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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

  useEffect(() => {
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
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Register Entry
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-[425px]">
            <SheetHeader>
              <SheetTitle>Register New Entry</SheetTitle>
              <SheetDescription>
                Record a client's entry to the gym. Select the client and gym location.
              </SheetDescription>
            </SheetHeader>
            <EntryForm 
              onSuccess={() => {
                setIsSheetOpen(false);
                fetchData();
              }} 
            />
          </SheetContent>
        </Sheet>
      </div>
      <EntryListView data={data} />
    </div>
  );
}
