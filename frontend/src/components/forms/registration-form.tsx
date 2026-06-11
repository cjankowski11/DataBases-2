import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RegistrationService, ClientService, ClassService } from "@/services/gym-service";
import type { Client, GymClass } from "@/types/gym-types";
import { Loader2, PlusCircle, Calendar, User, Dumbbell, CheckCircle, XCircle } from "lucide-react";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";

interface RegistrationFormProps {
    onSuccess: () => void;
}

export function RegistrationForm({ onSuccess }: RegistrationFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
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
                const [clientsData, classesData] = await Promise.all([
                    ClientService.getAll(),
                    ClassService.getAll(),
                ]);
                setClients(clientsData);
                setClasses(classesData);
            } catch (err) {
                setError("Failed to load clients or classes list");
            } finally {
                setIsFetchingData(false);
            }
        };
        loadData();
    }, []);

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
                // Check if class is already full
                const selectedClassObj = classes.find(c => c.class_id === classIdNum);
                if (selectedClassObj && selectedClassObj.occupancy_pct >= 100) {
                    errors.class_id = "This class is already full";
                }
            }
        }

        // Validate registration date
        const registrationDate = formData.get("registration_date") as string;
        if (!registrationDate) {
            errors.registration_date = "Registration date is required";
        } else {
            const todayStr = new Date().toLocaleDateString("en-CA"); // "YYYY-MM-DD" in local time

            if (registrationDate > todayStr) {
                errors.registration_date = "Registration date cannot be in the future";
            } else {
                const selectedClassObj = classes.find(c => c.class_id === parseInt(classId));
                if (selectedClassObj) {
                    if (registrationDate >= selectedClassObj.class_date) {
                        errors.registration_date = "Registration must be before the class date";
                    }
                }
            }
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const getClassDisplay = (classItem: GymClass) => {
        const status = classItem.occupancy_pct >= 100 ? " (FULL)" : ` (${classItem.occupancy_pct}% full)`;
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
            await RegistrationService.add(payload);
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create registration");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectChange = (field: 'client_id' | 'class_id') => {
        if (validationErrors[field]) {
            setValidationErrors(prev => ({ ...prev, [field]: undefined }));
        }
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
                            {getClassDisplay(classItem)}
                        </option>
                    ))}
                </select>
                {validationErrors.class_id && (
                    <p className="text-sm text-destructive">{validationErrors.class_id}</p>
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
                    defaultValue={new Date().toISOString().split("T")[0]}
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
                        Creating registration...
                    </>
                ) : (
                    <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Register Client
                    </>
                )}
            </Button>
        </form>
    );
}
