import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClassTypeService } from "@/services/gym-service";
import { Loader2, PlusCircle, Dumbbell, Activity, Hash } from "lucide-react";

interface ClassTypeFormProps {
  onSuccess: () => void;
}

export function ClassTypeForm({ onSuccess }: ClassTypeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const payload = {
      name: formData.get("name") as string,
      difficulty: parseInt(formData.get("difficulty") as string),
    };

    try {
      await ClassTypeService.add(payload);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create class type");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
          <Dumbbell className="w-4 h-4" /> Class Name
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="e.g., Yoga, Pilates, HIIT, Spinning"
          required
          disabled={isLoading}
          maxLength={32}
        />
        <p className="text-xs text-muted-foreground">
          Maximum 32 characters
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="difficulty" className="text-sm font-medium flex items-center gap-2">
          <Activity className="w-4 h-4" /> Difficulty Level
        </label>
        <select
          name="difficulty"
          id="difficulty"
          required
          disabled={isLoading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select difficulty...</option>
          <option value="1">1 - Beginner</option>
          <option value="2">2 - Easy</option>
          <option value="3">3 - Intermediate</option>
          <option value="4">4 - Advanced</option>
          <option value="5">5 - Expert</option>
        </select>
        <p className="text-xs text-muted-foreground">
          1 = Beginner, 5 = Expert
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating class type...
          </>
        ) : (
          <>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Class Type
          </>
        )}
      </Button>
    </form>
  );
}