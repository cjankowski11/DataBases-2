import { useState, useEffect } from "react"
import { ClientService } from "@/services/gym-service"
import type { Client } from "@/types/gym-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, User, Mail, Phone, Calendar, CheckCircle, XCircle } from "lucide-react"

interface EditClientFormProps {
  clientId: number | null
  onSuccess: () => void
}

export function EditClientForm({ clientId, onSuccess }: EditClientFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingData, setIsFetchingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clientData, setClientData] = useState<Client | null>(null)
  
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    surname?: string;
    email?: string;
    phone?: string;
    birth_date?: string;
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!clientId) return
      
      try {
        setIsFetchingData(true)
        const data = await ClientService.getById(clientId)
        setClientData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load client details")
      } finally {
        setIsFetchingData(false)
      }
    }

    fetchData()
  }, [clientId])

  const validateForm = (formData: FormData): boolean => {
    const errors: { name?: string; surname?: string; email?: string; phone?: string; birth_date?: string } = {};

    const name = formData.get("name") as string;
    if (!name || name.trim() === "") errors.name = "Name is required";

    const surname = formData.get("surname") as string;
    if (!surname || surname.trim() === "") errors.surname = "Surname is required";

    const email = formData.get("email") as string;
    if (!email || email.trim() === "") {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Invalid email address";
    }

    const phone = formData.get("phone") as string;
    if (!phone || phone.trim() === "") {
      errors.phone = "Phone number is required";
    } else if (phone.length > 9) {
      errors.phone = "Max 9 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!clientId) return;

    setError(null);

    const formData = new FormData(e.currentTarget);

    if (!validateForm(formData)) {
      return;
    }

    setIsLoading(true);

    const rawBirthDate = formData.get("birth_date") as string;

    const payload = {
      name: (formData.get("name") as string).trim(),
      surname: (formData.get("surname") as string).trim(),
      email: (formData.get("email") as string).trim(),
      phone: (formData.get("phone") as string).trim(),
      birth_date: rawBirthDate === "" ? null : rawBirthDate,
    };

    try {
      await ClientService.update(clientId, payload)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update client")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string) => {
    if (validationErrors[field as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (isFetchingData) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
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
        <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
          <User className="w-4 h-4" /> First Name
          <span className="text-destructive">*</span>
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="John"
          required
          disabled={isLoading}
          defaultValue={clientData?.name}
          onChange={() => handleInputChange('name')}
          className={validationErrors.name ? 'border-destructive' : ''}
        />
        {validationErrors.name && (
          <p className="text-sm text-destructive">{validationErrors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="surname" className="text-sm font-medium flex items-center gap-2">
          <User className="w-4 h-4" /> Last Name
          <span className="text-destructive">*</span>
        </label>
        <Input
          id="surname"
          name="surname"
          type="text"
          placeholder="Doe"
          required
          disabled={isLoading}
          defaultValue={clientData?.surname}
          onChange={() => handleInputChange('surname')}
          className={validationErrors.surname ? 'border-destructive' : ''}
        />
        {validationErrors.surname && (
          <p className="text-sm text-destructive">{validationErrors.surname}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
          <Mail className="w-4 h-4" /> Email
          <span className="text-destructive">*</span>
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="john.doe@example.com"
          required
          disabled={isLoading}
          defaultValue={clientData?.email}
          onChange={() => handleInputChange('email')}
          className={validationErrors.email ? 'border-destructive' : ''}
        />
        {validationErrors.email && (
          <p className="text-sm text-destructive">{validationErrors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
          <Phone className="w-4 h-4" /> Phone
          <span className="text-destructive">*</span>
        </label>
        <Input
          id="phone"
          name="phone"
          type="text"
          placeholder="123456789"
          required
          maxLength={9}
          disabled={isLoading}
          defaultValue={clientData?.phone}
          onChange={() => handleInputChange('phone')}
          className={validationErrors.phone ? 'border-destructive' : ''}
        />
        {validationErrors.phone && (
          <p className="text-sm text-destructive">{validationErrors.phone}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="birth_date" className="text-sm font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Birth Date (Optional)
        </label>
        <Input
          id="birth_date"
          name="birth_date"
          type="date"
          disabled={isLoading}
          defaultValue={clientData?.birth_date || ""}
          onChange={() => handleInputChange('birth_date')}
          className={validationErrors.birth_date ? 'border-destructive' : ''}
        />
        {validationErrors.birth_date && (
          <p className="text-sm text-destructive">{validationErrors.birth_date}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating client...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Update Client
          </>
        )}
      </Button>
    </form>
  )
}
