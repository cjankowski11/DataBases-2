import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClassTypeService } from "@/services/gym-service";
import { Loader2, PlusCircle, Dumbbell, Activity, XCircle, CheckCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface ClassTypeFormProps {
  onSuccess: () => void;
}

export function ClassTypeForm({ onSuccess }: ClassTypeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");

  // Client-side validation errors
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    difficulty?: string;
  }>({});

  const validateForm = (formData: FormData): boolean => {
    const errors: { name?: string; difficulty?: string } = {};

    // Validate name
    const name = formData.get("name") as string;
    if (!name || name.trim() === "") {
      errors.name = "Class name is required";
    } else if (name.length > 32) {
      errors.name = "Class name cannot exceed 32 characters";
    } else if (name.length < 2) {
      errors.name = "Class name must be at least 2 characters";
    } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
      errors.name = "Class name can only contain letters, numbers, spaces, hyphens, and underscores";
    }

    // Validate difficulty
    const difficulty = formData.get("difficulty") as string;
    if (!difficulty || difficulty === "") {
      errors.difficulty = "Please select a difficulty level";
    } else {
      const difficultyNum = parseInt(difficulty);
      if (isNaN(difficultyNum) || difficultyNum < 1 || difficultyNum > 5) {
        errors.difficulty = "Difficulty must be between 1 and 5";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    // Client-side validation
    if (!validateForm(formData)) {
      return;
    }

    setIsLoading(true);

    const payload = {
      name: (formData.get("name") as string).trim(),
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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (validationErrors.name) {
      setValidationErrors(prev => ({ ...prev, name: undefined }));
    }
    // Prevent XSS by sanitizing input
    if (value.includes('<') || value.includes('>')) {
      setValidationErrors(prev => ({ ...prev, name: "HTML tags are not allowed" }));
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
        <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
          <Dumbbell className="w-4 h-4" /> Class Name
          <span className="text-destructive">*</span>
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="e.g., Yoga, Pilates, HIIT, Spinning"
          required
          onChange={handleNameChange}
          disabled={isLoading}
          maxLength={32}
          minLength={2}
          className={validationErrors.name ? 'border-destructive' : ''}
          pattern="[a-zA-Z0-9\s\-_]+"
          title="Only letters, numbers, spaces, hyphens, and underscores allowed"
        />
        {validationErrors.name ? (
          <p className="text-sm text-destructive">{validationErrors.name}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Maximum 32 characters. Letters, numbers, spaces, hyphens, and underscores only.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="difficulty" className="text-sm font-medium flex items-center gap-2">
          <Activity className="w-4 h-4" /> Difficulty Level
          <span className="text-destructive">*</span>
        </label>
        <select
          name="difficulty"
          id="difficulty"
          required
          value={selectedDifficulty}
          onChange={(e) => {
            setSelectedDifficulty(e.target.value);
            if (validationErrors.difficulty) {
              setValidationErrors(prev => ({ ...prev, difficulty: undefined }));
            }
          }}
          disabled={isLoading}
          className={`flex h-10 w-full rounded-md border ${validationErrors.difficulty ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <option value="">Select difficulty...</option>
          <option value="1">1 - Beginner</option>
          <option value="2">2 - Easy</option>
          <option value="3">3 - Intermediate</option>
          <option value="4">4 - Advanced</option>
          <option value="5">5 - Expert</option>
        </select>
        {validationErrors.difficulty ? (
          <p className="text-sm text-destructive">{validationErrors.difficulty}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            1 = Beginner, 2 = Easy, 3 = Intermediate, 4 = Advanced, 5 = Expert
          </p>
        )}
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