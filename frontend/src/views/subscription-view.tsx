import { useEffect, useState } from "react";
import { SubscriptionService } from "@/services/gym-service";
import type { Subscription } from "@/types/gym-types";
import { Loader2, AlertCircle, CreditCard, Plus, Clock, CalendarX, CheckCircle, XCircle } from "lucide-react";
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
} from "@/components/ui/sheet";
import { SubscriptionForm } from "@/components/forms/subscription-form";
import { EditSubscriptionForm } from "@/components/forms/edit/edit-subscription-form";
import { DeleteConfirmDialog } from "@/components/forms/delete-confirm-dialog";

export default function SubscriptionView() {
  const [data, setData] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingSubscriptionId, setEditingSubscriptionId] = useState<number | null>(null);
  const [deletingSubscriptionId, setDeletingSubscriptionId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleEdit = (subscriptionId: number) => {
    setEditingSubscriptionId(subscriptionId);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (subscriptionId: number) => {
    setDeletingSubscriptionId(subscriptionId);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSubscriptionId) return;

    setIsDeleting(true);
    try {
      await SubscriptionService.delete(deletingSubscriptionId);
      setSuccessMessage("Subscription deleted successfully!");
      await fetchData();
      setDeletingSubscriptionId(null);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete subscription");

      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingSubscriptionId(null);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setTimeout(() => {
      setEditingSubscriptionId(null);
    }, 300);
  };

  const handleSuccess = () => {
    setIsSheetOpen(false);
    setSuccessMessage("Subscription saved successfully!");
    fetchData();
    setTimeout(() => {
      setEditingSubscriptionId(null);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }, 300);
  };

  const isEditing = editingSubscriptionId !== null;
  const subscriptionToDelete = deletingSubscriptionId
    ? data.find(s => s.subscription_id === deletingSubscriptionId)
    : null;

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
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

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditingSubscriptionId(null);
            setIsSheetOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Subscription
        </Button>
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleEdit(sub.subscription_id)}
                >
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => handleDeleteClick(sub.subscription_id)}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
        <SheetContent side="right" className="sm:max-w-[425px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {isEditing ? "Edit Subscription Plan" : "Add Subscription Plan"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Update the subscription plan details. Modify name, price, duration, or validity."
                : "Create a new membership plan for your clients. Fill in all the details below."}
            </SheetDescription>
          </SheetHeader>
          {isEditing ? (
            <EditSubscriptionForm
              subscriptionId={editingSubscriptionId}
              onSuccess={handleSuccess}
            />
          ) : (
            <SubscriptionForm onSuccess={handleSuccess} />
          )}
        </SheetContent>
      </Sheet>

      <DeleteConfirmDialog
        isOpen={deletingSubscriptionId !== null}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Subscription"
        description={`Are you sure you want to delete subscription "${subscriptionToDelete?.name} #${subscriptionToDelete?.subscription_id}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}