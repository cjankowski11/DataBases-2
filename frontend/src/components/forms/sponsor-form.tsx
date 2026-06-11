import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SponsorService } from "@/services/gym-service";
import { Loader2, PlusCircle, XCircle, CircleDollarSign } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface SponsorFormProps {
  onSuccess: () => void;
}

export function SponsorForm({ onSuccess }: SponsorFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
  }>({});

  const validateForm = (formData: FormData): boolean => {
    const errors: { name?: string } = {};

    //Validating name
    const name = formData.get("name") as string;
    if(!name || name === "") {
      errors.name = "Name is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    if (!validateForm(formData)) {
      return;
    }
    setIsLoading(true);

    const payload = {
      name: formData.get("name") as string
    };

    try {
      await SponsorService.add(payload);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create sponsor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <CircleDollarSign className="w-4 h-4" /> Name
          <span className="text-destructive">*</span>
        </label>
        <Input
          id="name"
          type="text"
          name="name"
          onChange={() => {
            if (validationErrors.name) {
              setValidationErrors(prev => ({ ...prev, name: undefined }));
            }
          }}
          required
          disabled={isLoading}
          placeholder="e.g., Company 1"
          className={validationErrors.name ? 'border-destructive' : ''}
        />
        {validationErrors.name && (
          <p className="text-sm text-destructive">{validationErrors.name}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating sponsor...
          </>
        ) : (
          <>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Sponsor
          </>
        )}
      </Button>
    </form>
  );
}