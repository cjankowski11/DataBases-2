import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClassTypeService } from "@/services/gym-service";
import type { ClassType } from "@/types/gym-types";
import { Loader2, Tag, Star, CheckCircle, XCircle } from "lucide-react";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";

interface EditClassTypeFormProps {
    classTypeId: number;
    onSuccess: () => void;
}

export function EditClassTypeForm({ classTypeId, onSuccess }: EditClassTypeFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [classTypeData, setClassTypeData] = useState<ClassType | null>(null);

    // Client-side validation errors
    const [validationErrors, setValidationErrors] = useState<{
        name?: string;
        difficulty?: string;
    }>({});

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsFetchingData(true);
                const data = await ClassTypeService.getById(classTypeId);
                setClassTypeData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load class type data");
            } finally {
                setIsFetchingData(false);
            }
        };

        loadData();
    }, [classTypeId]);

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
            errors.difficulty = "Difficulty level is required";
        } else {
            const difficultyNum = parseInt(difficulty);
            if (isNaN(difficultyNum)) {
                errors.difficulty = "Difficulty must be a number";
            } else if (difficultyNum < 1 || difficultyNum > 5) {
                errors.difficulty = "Difficulty must be between 1 and 5";
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

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
            await ClassTypeService.update(classTypeId, payload);
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update class type");
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

    const handleDifficultyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (validationErrors.difficulty) {
            setValidationErrors(prev => ({ ...prev, difficulty: undefined }));
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

            <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Class Type Name
                    <span className="text-destructive">*</span>
                </label>
                <Input
                    name="name"
                    type="text"
                    required
                    defaultValue={classTypeData?.name}
                    onChange={handleNameChange}
                    disabled={isLoading}
                    maxLength={32}
                    minLength={2}
                    className={validationErrors.name ? 'border-destructive' : ''}
                    pattern="[a-zA-Z0-9\s\-_]+"
                    title="Only letters, numbers, spaces, hyphens, and underscores allowed"
                    placeholder="e.g., Yoga, Pilates, CrossFit"
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
                <label className="text-sm font-medium flex items-center gap-2">
                    <Star className="w-4 h-4" /> Difficulty (1-5)
                    <span className="text-destructive">*</span>
                </label>
                <Input
                    name="difficulty"
                    type="number"
                    min="1"
                    max="5"
                    step="1"
                    required
                    defaultValue={classTypeData?.difficulty}
                    onChange={handleDifficultyChange}
                    disabled={isLoading}
                    className={validationErrors.difficulty ? 'border-destructive' : ''}
                    placeholder="1"
                />
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
                        Updating class type...
                    </>
                ) : (
                    <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Update Class Type
                    </>
                )}
            </Button>
        </form>
    );
}