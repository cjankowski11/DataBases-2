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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        const formData = new FormData(e.currentTarget);

        const payload = {
            name: formData.get("name") as string,
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
                <label className="text-sm font-medium flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Class Type Name
                </label>
                <Input
                    name="name"
                    type="text"
                    required
                    defaultValue={classTypeData?.name}
                    disabled={isLoading}
                    maxLength={32}
                    placeholder="e.g., Yoga, Pilates, CrossFit"
                />
                <p className="text-xs text-muted-foreground">
                    Maximum 32 characters
                </p>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                    <Star className="w-4 h-4" /> Difficulty (1-5)
                </label>
                <Input
                    name="difficulty"
                    type="number"
                    min="1"
                    max="5"
                    required
                    defaultValue={classTypeData?.difficulty}
                    disabled={isLoading}
                    placeholder="1"
                />
                <p className="text-xs text-muted-foreground">
                    1 = Beginner, 5 = Advanced
                </p>
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