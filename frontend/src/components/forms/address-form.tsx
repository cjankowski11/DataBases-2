import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddressService } from "@/services/gym-service";
import { Loader2, PlusCircle, Building2, Road, Building, Mailbox, XCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface AddressFormProps {
  onSuccess: () => void;
}

export function AddressForm({ onSuccess }: AddressFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [validationErrors, setValidationErrors] = useState<{
    city?: string;
    street?: string;
    building_number?: string;
    postal_code?: string;
  }>({});

  const validateForm = (formData: FormData): boolean => {
    const errors: { city?: string; street?: string; building_number?: string; postal_code?: string } = {};

    //Validating city
    const city = formData.get("city") as string;
    if(!city || city === "") {
      errors.city = "City is required";
    }

    //Validating street
    const street = formData.get("street") as string;
    if(!street || street === "") {
      errors.street = "Street is required";
    }

    //Validate building number
    const building_number = formData.get("building_number") as string;
    if(!building_number || building_number === "") {
      errors.building_number = "Building number is required";
    } else {
      const buildingNrNum = parseInt(building_number);
      if (isNaN(buildingNrNum)) {
        errors.building_number = "Capacity must be a number";
      } else if (buildingNrNum < 1) {
        errors.building_number = "Building number cannot be negative";
      }
    }

    //Validate postal code
    const postal_code = formData.get("postal_code") as string;
    if(!postal_code || postal_code === "") {
      errors.postal_code = "Postal code is required";
    } else {
      if(postal_code.length !== 6) {
        errors.postal_code = "Postal code length has to be 6";
      } else if (postal_code[2] != "-") {
        errors.postal_code = "Postal code has to be in format XX-XXX";
      }
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
      city: formData.get("city") as string,
      street: formData.get("street") as string,
      building_number: parseInt(formData.get("building_number") as string),
      postal_code: formData.get("postal_code") as string
    };

    try {
      await AddressService.add(payload);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create address");
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
          <Building2 className="w-4 h-4" /> City
          <span className="text-destructive">*</span>
        </label>
        <Input
          id="city"
          type="text"
          name="city"
          onChange={() => {
            if (validationErrors.city) {
              setValidationErrors(prev => ({ ...prev, city: undefined }));
            }
          }}
          required
          disabled={isLoading}
          placeholder="e.g., Warsaw"
          className={validationErrors.city ? 'border-destructive' : ''}
        />
        {validationErrors.city && (
          <p className="text-sm text-destructive">{validationErrors.city}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Road className="w-4 h-4" /> Street
          <span className="text-destructive">*</span>
        </label>
        <Input
          id="street"
          type="text"
          name="street"
          onChange={() => {
            if (validationErrors.street) {
              setValidationErrors(prev => ({ ...prev, street: undefined }));
            }
          }}
          required
          disabled={isLoading}
          placeholder="e.g., Pulawska"
          className={validationErrors.street ? 'border-destructive' : ''}
        />
        {validationErrors.street && (
          <p className="text-sm text-destructive">{validationErrors.street}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Building className="w-4 h-4" /> Building Number
          <span className="text-destructive">*</span>
        </label>
        <Input
          id="building_number"
          type="number"
          name="building_number"
          onChange={() => {
            if (validationErrors.building_number) {
              setValidationErrors(prev => ({ ...prev, building_number: undefined }));
            }
          }}
          required
          disabled={isLoading}
          placeholder="e.g., 14"
          className={validationErrors.building_number ? 'border-destructive' : ''}
        />
        {validationErrors.building_number && (
          <p className="text-sm text-destructive">{validationErrors.building_number}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Mailbox className="w-4 h-4" /> Postal Code
          <span className="text-destructive">*</span>
        </label>
        <Input
          id="postal_code"
          type="text"
          name="postal_code"
          onChange={() => {
            if (validationErrors.postal_code) {
              setValidationErrors(prev => ({ ...prev, postal_code: undefined }));
            }
          }}
          required
          disabled={isLoading}
          placeholder="e.g., 00-000"
          className={validationErrors.postal_code ? 'border-destructive' : ''}
        />
        {validationErrors.postal_code && (
          <p className="text-sm text-destructive">{validationErrors.postal_code}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating address...
          </>
        ) : (
          <>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Address
          </>
        )}
      </Button>
    </form>
  );
}