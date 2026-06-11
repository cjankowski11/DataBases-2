import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RegistrationService, ClientService, ClassService } from "@/services/gym-service";
import type { Client, GymClass, Registration } from "@/types/gym-types";
import { Loader2, Calendar, User, Dumbbell, CheckCircle, XCircle } from "lucide-react";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";

interface EditRegistrationFormProps {
    registrationId: number;
    onSuccess: () => void;
}

export function EditRegistrationForm({ registrationId, onSuccess }: EditRegistrationFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [registration, setRegistration] = useState<Registration | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [classes, setClasses] = useState<GymClass[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>("");
    const [selectedClient, setSelectedClient] = useState<string>("");

    // Client-side validation errors
    const [validationErrors, setValidationErrors] = useState<{
        client_id?: string;
        class_id?: string;
        registration_date?: string;
    }>({});

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsFetchingData(true);
                const [registrationData, clientsData, classesData] = await Promise.all([
                    RegistrationService.getById(registrationId),
                    ClientService.getAll(),
                    ClassService.getAll(),
                ]);

                setRegistration(registrationData);
                setClients(clientsData);
                setClasses(classesData);

                setSelectedClient(registrationData.client_id.toString());
                setSelectedClass(registrationData.class_id.toString());
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load registration data");
            } finally {
                setIsFetchingData(false);
            }
        };

        loadData();
    }, [registrationId]);

    const validateForm = (formData: FormData): boolean => {
        const errors: { client_id?: string; class_id?: string; registration_date?: string } = {};

        // Validate client
        const clientId = formData.get("client_id") as string;
        if (!clientId || clientId === "") {
            errors.client_id = "Please select a client";
        } else {
            const clientIdNum = parseInt(clientId);
            if (isNaN(clientIdNum) || clientIdNum <= 0) {
                errors.client_id = "Invalid client selection";
            } else if (!clients.some(c => c.client_id === clientIdNum)) {
                errors.client_id = "Selected client does not exist";
            }
        }

        // Validate class
        const classId = formData.get("class_id") as string;
        if (!classId || classId === "") {
            errors.class_id = "Please select a class";
        } else {
            const classIdNum = parseInt(classId);
            if (isNaN(classIdNum) || classIdNum <= 0) {
                errors.class_id = "Invalid class selection";
            } else if (!classes.some(c => c.class_id === classIdNum)) {
                errors.class_id = "Selected class does not exist";
            } else {
                // Check if class is full (excluding current registration)
                const selectedClassObj = classes.find(c => c.class_id === classIdNum);
                if (selectedClassObj) {
                    // Calculate current registrations excluding this one
                    const currentRegistrations = selectedClassObj.occupancy_pct
                        ? (selectedClassObj.occupancy_pct / 100) * selectedClassObj.capacity
                        : 0;

                    // If changing class, check if new class is full
                    if (classIdNum !== registration?.class_id && currentRegistrations >= selectedClassObj.capacity) {
                        errors.class_id = "This class is already full";
                    }
                }
            }
        }

        // Validate registration date
        const registrationDate = formData.get("registration_date") as string;
        if (!registrationDate) {
            errors.registration_date = "Registration date is required";
        } else {
            const selectedDate = new Date(registrationDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (isNaN(selectedDate.getTime())) {
                errors.registration_date = "Invalid date format";
            } else if (selectedDate >= today) {
                errors.registration_date = "Registration date cannot be in the future";
            } else {
                // Check if registration date is before class date
                const selectedClassObj = classes.find(c => c.class_id === parseInt(classId));
                if (selectedClassObj) {
                    const classDate = new Date(selectedClassObj.class_date);
                    if (selectedDate >= classDate) {
                        errors.registration_date = "Registration must be before the class date";
                    }
                }
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const getClassDisplay = (classItem: GymClass, currentClassId?: number) => {
        // Check if class is full (excluding current registration if editing)
        let isFull = classItem.occupancy_pct >= 100;
        if (currentClassId && classItem.class_id === currentClassId) {
            // Current class is allowed even if full
            isFull = false;
        }

        const status = isFull ? " (FULL - Cannot switch to this class)" :
                       classItem.occupancy_pct >= 80 ? ` (${classItem.occupancy_pct}% full - ${classItem.capacity - Math.ceil((classItem.occupancy_pct / 100) * classItem.capacity)} spots left)` :
                       classItem.occupancy_pct >= 100 ? " (FULL)" : "";

        return `${classItem.class_type?.name || `Class #${classItem.class_id}`} - ${classItem.class_date} (Capacity: ${classItem.capacity})${status}`;
    };

    const getClientDisplay = (client: Client) => {
        return `${client.name} ${client.surname}`;
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
            client_id: parseInt(formData.get("client_id") as string),
            class_id: parseInt(formData.get("class_id") as string),
            registration_date: formData.get("registration_date") as string,
        };

        try {
            await RegistrationService.update(registrationId, payload);
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update registration");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectChange = (field: 'client_id' | 'class_id') => {
        if (validationErrors[field]) {
            setValidationErrors(prev => ({ ...prev, [field]: undefined }));
        }
        // Clear date validation when class changes
        if (field === 'class_id' && validationErrors.registration_date) {
            setValidationErrors(prev => ({ ...prev, registration_date: undefined }));
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
                    <User className="w-4 h-4" /> Client
                    <span className="text-destructive">*</span>
                </label>
                <select
                    name="client_id"
                    required
                    value={selectedClient}
                    onChange={(e) => {
                        setSelectedClient(e.target.value);
                        handleSelectChange('client_id');
                    }}
                    disabled={isLoading}
                    className={`flex h-10 w-full rounded-md border ${validationErrors.client_id ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                >
                    <option value="">Select client...</option>
                    {clients.map((client) => (
                        <option key={client.client_id} value={client.client_id}>
                            {getClientDisplay(client)}
                        </option>
                    ))}
                </select>
                {validationErrors.client_id && (
                    <p className="text-sm text-destructive">{validationErrors.client_id}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                    <Dumbbell className="w-4 h-4" /> Class
                    <span className="text-destructive">*</span>
                </label>
                <select
                    name="class_id"
                    required
                    value={selectedClass}
                    onChange={(e) => {
                        setSelectedClass(e.target.value);
                        handleSelectChange('class_id');
                    }}
                    disabled={isLoading}
                    className={`flex h-10 w-full rounded-md border ${validationErrors.class_id ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                >
                    <option value="">Select class...</option>
                    {classes.map((classItem) => (
                        <option key={classItem.class_id} value={classItem.class_id}>
                            {getClassDisplay(classItem, registration?.class_id)}
                        </option>
                    ))}
                </select>
                {validationErrors.class_id && (
                    <p className="text-sm text-destructive">{validationErrors.class_id}</p>
                )}
                {selectedClass === registration?.class_id.toString() && (
                    <p className="text-xs text-muted-foreground">
                        Current class - you can keep this even if full
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <label htmlFor="registration_date" className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Registration Date
                    <span className="text-destructive">*</span>
                </label>
                <Input
                    id="registration_date"
                    name="registration_date"
                    type="date"
                    required
                    defaultValue={registration?.registration_date?.split("T")[0] || new Date().toISOString().split("T")[0]}
                    onChange={() => {
                        if (validationErrors.registration_date) {
                            setValidationErrors(prev => ({ ...prev, registration_date: undefined }));
                        }
                    }}
                    disabled={isLoading}
                    max={new Date().toISOString().split("T")[0]}
                    className={validationErrors.registration_date ? 'border-destructive' : ''}
                />
                {validationErrors.registration_date ? (
                    <p className="text-sm text-destructive">{validationErrors.registration_date}</p>
                ) : (
                    <p className="text-xs text-muted-foreground">
                        Registration date must be before the class date and cannot be in the future
                    </p>
                )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating registration...
                    </>
                ) : (
                    <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Update Registration
                    </>
                )}
            </Button>
        </form>
    );
}