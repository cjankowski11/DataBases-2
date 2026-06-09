import { useEffect, useState } from "react";
import { SubscriptionService } from "@/services/gym-service";
import type { Subscription } from "@/types/gym-types";
import { Loader2, AlertCircle, CreditCard, Plus, Clock, CalendarX } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { SubscriptionForm } from "@/components/forms/subscription-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SubscriptionView() {
  const [data, setData] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<number | string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const subscriptions = await SubscriptionService.getAll();
      setData(subscriptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load subscriptions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!subscriptionToDelete) return;

    try {
      console.log("Delete finalized for subscription ID: " + subscriptionToDelete);
      await SubscriptionService.delete(subscriptionToDelete);
      window.location.reload();
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred.";

      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(`Deletion Failed:\n${errorMessage}`);
      console.error("Failed to delete subscription:", error);
    } finally {
      setSubscriptionToDelete(null);
    }
  };

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

  const formatDuration = (days: number) => {
    if (days >= 365) return `${Math.round(days / 365)} year${days >= 730 ? "s" : ""}`;
    if (days >= 30)  return `${Math.round(days / 30)} month${days >= 60 ? "s" : ""}`;
    return `${days} days`;
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Subscription
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-[425px]">
            <SheetHeader>
              <SheetTitle>Add Subscription Plan</SheetTitle>
              <SheetDescription>
                Create a new membership plan for your clients. Click save when you're done.
              </SheetDescription>
            </SheetHeader>
            <SubscriptionForm 
              onSuccess={() => {
                setIsSheetOpen(false);
                fetchData();
              }} 
            />
          </SheetContent>
        </Sheet>
      </div>

      {data.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">No subscriptions found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.map((sub) => (
            <Card key={sub.subscription_id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{sub.name}</CardTitle>
                  <Badge variant="secondary">#{sub.subscription_id}</Badge>
                </div>
                <CardDescription className="text-3xl font-bold text-primary mt-1">
                  {Number(sub.price || 0).toFixed(2)} zł
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(sub.duration)}</span>
                </div>
                {sub.entry_until && (
                  <div className="flex items-center gap-2">
                    <CalendarX className="h-4 w-4" />
                    <span>Offer valid until {new Date(sub.entry_until).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex gap-2">
                <Button variant="outline" size="sm" className="w-full">
                  Manage
                </Button>
                <Button variant="destructive" size="sm" className="w-full" onClick={() => setSubscriptionToDelete(sub.subscription_id)}>
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog 
        open={subscriptionToDelete !== null} 
        onOpenChange={(open) => { if (!open) setSubscriptionToDelete(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Do you want to delete this subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}