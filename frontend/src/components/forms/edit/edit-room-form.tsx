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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        const formData = new FormData(e.currentTarget);

        const payload = {
            name: formData.get("name") as string,
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
                    <Building2 className="w-4 h-4" /> Gym
                </label>
                <select
                    name="gym_id"
                    required
                    value={selectedGym}
                    onChange={(e) => setSelectedGym(e.target.value)}
                    disabled={isLoading}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="">Select gym...</option>
                    {gyms.map((gym) => (
                        <option key={gym.gym_id} value={gym.gym_id}>
                            {gym.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                    <DoorOpen className="w-4 h-4" /> Room Name
                </label>
                <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    defaultValue={roomData?.name}
                    disabled={isLoading}
                    maxLength={64}
                    placeholder="e.g., Main Studio, Yoga Room, Weight Room"
                />
                <p className="text-xs text-muted-foreground">
                    Maximum 64 characters
                </p>
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