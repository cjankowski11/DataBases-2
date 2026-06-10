import { useEffect, useState } from "react";
import { ClientSubscriptionService } from "@/services/gym-service";
import { SalesListView } from "@/components/tables/sales-table";
import type { ClientSubscription } from "@/types/gym-types";
import { Loader2, AlertCircle, ShoppingCart, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { ClientSubscriptionForm } from "@/components/forms/client-subscription-form";

export default function SalesView() {
  const [data, setData] = useState<ClientSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "Y" | "N">("all");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const sales = await ClientSubscriptionService.getAll();
      setData(sales);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sales");
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

  const filtered =
    filter === "all" ? data : data.filter((s) => s.paid_now === filter);

  const paidCount   = data.filter((s) => s.paid_now === "Y").length;
  const unpaidCount = data.filter((s) => s.paid_now === "N").length;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <ShoppingCart className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Sales (Client Subscriptions)</h1>
        </div>
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Sale
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-[425px]">
            <SheetHeader>
              <SheetTitle>Register New Sale</SheetTitle>
              <SheetDescription>
                Assign a subscription plan to a client. The expiration date will be calculated automatically.
              </SheetDescription>
            </SheetHeader>
            <ClientSubscriptionForm 
              onSuccess={() => {
                setIsSheetOpen(false);
                fetchData();
              }} 
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <Badge
          variant={filter === "all" ? "default" : "outline"}
          className="cursor-pointer px-3 py-1 text-sm"
          onClick={() => setFilter("all")}
        >
          All ({data.length})
        </Badge>
        <Badge
          variant={filter === "Y" ? "default" : "outline"}
          className="cursor-pointer px-3 py-1 text-sm"
          onClick={() => setFilter("Y")}
        >
          Paid ({paidCount})
        </Badge>
        <Badge
          variant={filter === "N" ? "default" : "outline"}
          className="cursor-pointer px-3 py-1 text-sm"
          onClick={() => setFilter("N")}
        >
          Unpaid ({unpaidCount})
        </Badge>
      </div>

      <SalesListView data={filtered} />
    </div>
  );
}
