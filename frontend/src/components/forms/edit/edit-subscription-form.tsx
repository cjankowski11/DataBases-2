import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubscriptionService } from "@/services/gym-service";
import type { Subscription } from "@/types/gym-types";
import { Loader2, Tag, Coins, Timer, Calendar, CheckCircle, XCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface EditSubscriptionFormProps {
  subscriptionId: number;
  onSuccess: () => void;
}

export function EditSubscriptionForm({ subscriptionId, onSuccess }: EditSubscriptionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<Subscription | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsFetchingData(true);
        const subData = await SubscriptionService.getById(subscriptionId);
        setSubscriptionData(subData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load subscription data");
      } finally {
        setIsFetchingData(false);
      }
    };

    loadData();
  }, [subscriptionId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(e.currentTarget);
    const price = parseFloat(formData.get("price") as string);
    const duration = parseInt(formData.get("duration") as string);
    const entryUntil = formData.get("entry_until") as string;

    const payload = {
      name: formData.get("name") as string,
      price,
      duration,
      entry_until: entryUntil || null,
    };

    try {
      await SubscriptionService.update(subscriptionId, payload);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update subscription");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingData) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-4 border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
          <Tag className="w-4 h-4" /> Subscription Name
        </label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. Open Monthly"
          required
          defaultValue={subscriptionData?.name}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="price" className="text-sm font-medium flex items-center gap-2">
            <Coins className="w-4 h-4" /> Price (PLN)
          </label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="149.99"
            required
            defaultValue={subscriptionData?.price}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="duration" className="text-sm font-medium flex items-center gap-2">
            <Timer className="w-4 h-4" /> Duration (Days)
          </label>
          <Input
            id="duration"
            name="duration"
            type="number"
            min="1"
            placeholder="30"
            required
            defaultValue={subscriptionData?.duration}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="entry_until" className="text-sm font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Valid Until Date (Optional)
        </label>
        <Input
          id="entry_until"
          name="entry_until"
          type="date"
          min={new Date().toISOString().split("T")[0]}
          defaultValue={subscriptionData?.entry_until ? subscriptionData.entry_until.split("T")[0] : ""}
          disabled={isLoading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating subscription...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Update Subscription
          </>
        )}
      </Button>
    </form>
  );
}
