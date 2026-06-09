import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubscriptionService } from "@/services/gym-service";
import { Loader2, CheckCircle2 } from "lucide-react";

interface SubscriptionFormProps {
  onSuccess: () => void;
}

export function SubscriptionForm({ onSuccess }: SubscriptionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    const payload = {
      name: formData.get("name") as string,
      price: parseFloat(formData.get("price") as string),
      duration: parseInt(formData.get("duration") as string),
      entry_until: formData.get("entry_until") || null,
    };

    try {
      await SubscriptionService.create(payload);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create subscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 py-4">
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Subscription Name
        </label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. Open Monthly"
          required
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="price" className="text-sm font-medium">
            Price (PLN)
          </label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            placeholder="149.99"
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="duration" className="text-sm font-medium">
            Duration (Days)
          </label>
          <Input
            id="duration"
            name="duration"
            type="number"
            placeholder="30"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="entry_until" className="text-sm font-medium">
          Valid Until Date (Optional)
        </label>
        <Input
          id="entry_until"
          name="entry_until"
          type="date"
          disabled={isLoading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Save Subscription
          </>
        )}
      </Button>
    </form>
  );
}
