import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoomService, GymService } from "@/services/gym-service";
import type { Room, Gym } from "@/types/gym-types";
import { Loader2, Building2, DoorOpen, CheckCircle, XCircle } from "lucide-react";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";

interface EditRoomFormProps {
    roomId: number;
    onSuccess: () => void;
}

export function EditRoomForm({ roomId, onSuccess }: EditRoomFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [roomData, setRoomData] = useState<Room | null>(null);
    const [gyms, setGyms] = useState<Gym[]>([]);
    const [selectedGym, setSelectedGym] = useState<string>("");

    // Client-side validation errors
    const [validationErrors, setValidationErrors] = useState<{
        name?: string;
        gym_id?: string;
    }>({});

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsFetchingData(true);
                const [roomItem, gymsData] = await Promise.all([
                    RoomService.getById(roomId),
                    GymService.getAll(),
                ]);

                setRoomData(roomItem);
                setGyms(gymsData);
                setSelectedGym(roomItem.gym_id.toString());
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load room data");
            } finally {
                setIsFetchingData(false);
            }
        };

        loadData();
    }, [roomId]);

    const validateForm = (formData: FormData): boolean => {
        const errors: { name?: string; gym_id?: string } = {};

        // Validate name
        const name = formData.get("name") as string;
        if (!name || name.trim() === "") {
            errors.name = "Room name is required";
        } else if (name.length > 64) {
            errors.name = "Room name cannot exceed 64 characters";
        } else if (name.length < 2) {
            errors.name = "Room name must be at least 2 characters";
        } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
            errors.name = "Room name can only contain letters, numbers, spaces, hyphens, and underscores";
        }

        // Validate gym_id
        const gymId = formData.get("gym_id") as string;
        if (!gymId || gymId === "") {
            errors.gym_id = "Please select a gym";
        } else {
            const gymIdNum = parseInt(gymId);
            if (isNaN(gymIdNum) || gymIdNum <= 0) {
                errors.gym_id = "Invalid gym selection";
            } else if (!gyms.some(g => g.gym_id === gymIdNum)) {
                errors.gym_id = "Selected gym does not exist";
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
            gym_id: parseInt(formData.get("gym_id") as string),
        };

        try {
            await RoomService.update(roomId, payload);
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update room");
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
                    <Building2 className="w-4 h-4" /> Gym
                    <span className="text-destructive">*</span>
                </label>
                <select
                    name="gym_id"
                    required
                    value={selectedGym}
                    onChange={(e) => {
                        setSelectedGym(e.target.value);
                        if (validationErrors.gym_id) {
                            setValidationErrors(prev => ({ ...prev, gym_id: undefined }));
                        }
                    }}
                    disabled={isLoading}
                    className={`flex h-10 w-full rounded-md border ${validationErrors.gym_id ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                >
                    <option value="">Select gym...</option>
                    {gyms.map((gym) => (
                        <option key={gym.gym_id} value={gym.gym_id}>
                            {gym.name}
                        </option>
                    ))}
                </select>
                {validationErrors.gym_id && (
                    <p className="text-sm text-destructive">{validationErrors.gym_id}</p>
                )}
            </div>

            <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                    <DoorOpen className="w-4 h-4" /> Room Name
                    <span className="text-destructive">*</span>
                </label>
                <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    defaultValue={roomData?.name}
                    onChange={handleNameChange}
                    disabled={isLoading}
                    maxLength={64}
                    minLength={2}
                    placeholder="e.g., Main Studio, Yoga Room, Weight Room"
                    className={validationErrors.name ? 'border-destructive' : ''}
                    pattern="[a-zA-Z0-9\s\-_]+"
                    title="Only letters, numbers, spaces, hyphens, and underscores allowed"
                />
                {validationErrors.name ? (
                    <p className="text-sm text-destructive">{validationErrors.name}</p>
                ) : (
                    <p className="text-xs text-muted-foreground">
                        Maximum 64 characters. Letters, numbers, spaces, hyphens, and underscores only.
                    </p>
                )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating room...
                    </>
                ) : (
                    <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Update Room
                    </>
                )}
            </Button>
        </form>
    );
}