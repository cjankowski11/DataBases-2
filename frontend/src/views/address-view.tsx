import { useEffect, useState } from "react";
import { AddressService } from "@/services/gym-service";
import { AddressListView } from "@/components/tables/address-table";
import type { Address } from "@/types/gym-types";
import { Loader2, AlertCircle, MapPinHouse, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function AddressesView() {
  const [data, setData] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const addresses = await AddressService.getAll();
        setData(addresses);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load addresses");
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
          <MapPinHouse className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Addresses</h1>
        </div>
        <Button onClick={() => setLocation("/addresses/new")} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Address
        </Button>
      </div>
      <AddressListView data={data} />
    </div>
  );
}