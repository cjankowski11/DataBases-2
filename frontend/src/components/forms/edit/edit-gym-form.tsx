import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GymService, AddressService } from "@/services/gym-service";
import type { Gym, Address } from "@/types/gym-types";
import { Loader2, Calendar, Tag, PlusCircle, XCircle, Phone, Mail, MapPinHouse, LandPlot } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface EditGymFormProps {
    gymId: number;
    onSuccess: () => void;
}

export function EditGymForm({ gymId, onSuccess }: EditGymFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gymData, setGymData] = useState<Gym | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    area?: string;
    open_hour?: string;
    close_hour?: string;
    address_id?: string;
  }>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsFetchingData(true);
        const [gymItem, addressesData] = await Promise.all([
          GymService.getById(gymId),
          AddressService.getAll()
        ]);

        setGymData(gymItem);
        setAddresses(addressesData);
        setSelectedAddress(gymItem.address_id.toString());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load gym data");
      } finally {
        setIsFetchingData(false);
      }
    };

    loadData();
  }, [gymId]);

  const validateForm = (formData: FormData): boolean => {
    const errors: {
      name?: string;
      email?: string;
      phone?: string;
      area?: string;
      open_hour?: string;
      close_hour?: string;
      address_id?: string; 
    } = {};

    //Validating name
    const name = formData.get("name") as string;
    if(!name || name === "") {
      errors.name = "Name value is required";
    }

    //Validating phone
    const phone = formData.get("phone") as string;
    if(phone && phone.length > 9) {
      errors.phone = "Phone number too long";
    } else if (phone && !(/^\d+$/.test(phone))) {
      errors.phone = "Phone number can only contain digits";
    }

    //Validating area
    const area = formData.get("area") as string;
    if (area && area !== "") {
      const areaNum = parseInt(area);
      if (isNaN(areaNum) || areaNum <= 0) {
        errors.area = "Invalid area value"
      }
    }

    const open_hour = formData.get("open_hour") as string;
    const close_hour = formData.get("close_hour") as string;
    //Validate open hour
    if (!open_hour || open_hour.trim() === "") {
      errors.open_hour = "Opening hour is required";
    } else {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
      
      if (!timeRegex.test(open_hour)) {
        errors.open_hour = "Invalid time format";
      }
    }

    // Validate close hour
    if (!close_hour || close_hour.trim() === "") {
      errors.close_hour = "Closing hour is required";
    } else {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
      if (!timeRegex.test(close_hour)) {
        errors.close_hour = "Invalid time format";
      } 
    }

    //Validating address
    const addressId = formData.get("address_id") as string;
    if (!addressId || addressId === "") {
      errors.address_id = "Please select a address";
    } else {
      const addressIdNum = parseInt(addressId);
      if (isNaN(addressIdNum) || addressIdNum <= 0) {
        errors.address_id = "Invalid address selection";
      } else if (!addresses.some(a => a.address_id === addressIdNum)) {
        errors.address_id = "Selected address does not exist";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    if (!validateForm(formData)) {
      return;
    }
    setIsLoading(true);

    const emailInput = formData.get("email") as string;
    const phoneInput = formData.get("phone") as string;
    const areaInput = formData.get("area") as string;
    const openHourInput = formData.get("open_hour") as string;
    const closeHourInput = formData.get("close_hour") as string;

    const payload = {
      name: formData.get("name") as string,
      email: emailInput && emailInput.trim() !== "" ? emailInput.trim() : null,
      phone: phoneInput && phoneInput.trim() !== "" ? phoneInput.trim() : null,
      area: areaInput && areaInput.trim() !== "" ? parseInt(areaInput.trim()) : null,
      open_hour: openHourInput && openHourInput.trim() !== "" ? openHourInput.trim() : null,
      close_hour: closeHourInput && closeHourInput.trim() !== "" ? closeHourInput.trim() : null,
      address_id: parseInt(formData.get("address_id") as string)
    };

    try {
      await GymService.update(gymId, payload);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update gym");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChange = (field: 'address_id') => {
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
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

      {/* name */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Tag className="w-4 h-4" /> Name
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
          defaultValue={gymData?.name}
          disabled={isLoading}
          placeholder="e.g., Best Gym"
          className={validationErrors.name ? 'border-destructive' : ''}
        />
        {validationErrors.name && (
          <p className="text-sm text-destructive">{validationErrors.name}</p>
        )}
      </div>
      
      {/* read only established date */}
      <div className="space-y-2 p-3 rounded-lg border bg-muted/40">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-primary" /> Date Established
        </label>
        <input type="hidden" name="established" value={gymData?.established} />
        <p className="text-sm font-medium text-foreground px-1">
          {gymData?.established}
        </p>
      </div>
      
      {/* mail */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Mail className="w-4 h-4" /> Email
        </label>
        <Input
          id="email"
          type="text"
          name="email"
          onChange={() => {
            if (validationErrors.email) {
              setValidationErrors(prev => ({ ...prev, email: undefined }));
            }
          }}
          defaultValue={gymData?.email}
          disabled={isLoading}
          placeholder="e.g., contact@gmail.com"
          className={validationErrors.email ? 'border-destructive' : ''}
        />
        {validationErrors.email && (
          <p className="text-sm text-destructive">{validationErrors.email}</p>
        )}
      </div>
      
      {/* phone */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Phone className="w-4 h-4" /> Phone Number
        </label>
        <Input
          id="phone"
          type="text"
          name="phone"
          onChange={() => {
            if (validationErrors.phone) {
              setValidationErrors(prev => ({ ...prev, phone: undefined }));
            }
          }}
          defaultValue={gymData?.phone}
          disabled={isLoading}
          placeholder="e.g., 222222222"
          className={validationErrors.phone ? 'border-destructive' : ''}
        />
        {validationErrors.phone && (
          <p className="text-sm text-destructive">{validationErrors.phone}</p>
        )}
      </div>
      
      {/* area */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <LandPlot className="w-4 h-4" /> Area
        </label>
        <div className="flex items-center gap-2">
          <Input
            id="area"
            type="number"
            name="area"
            onChange={() => {
              if (validationErrors.area) {
                setValidationErrors(prev => ({ ...prev, area: undefined }));
              }
            }}
            defaultValue={gymData?.area}
            disabled={isLoading}
            placeholder="e.g., 67"
            className={validationErrors.area ? 'border-destructive' : ''}
          />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            m²
          </span>
        </div>

        {validationErrors.area && (
          <p className="text-sm text-destructive">{validationErrors.area}</p>
        )}
      </div>
      
      {/* open */}
      <div className="space-y-2">
        <label htmlFor="open_hour" className="text-sm font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Open Hour
        </label>
        <Input
          id="open_hour"
          name="open_hour"
          type="time"
          step="1"
          onChange={() => {
            if (validationErrors.open_hour) {
              setValidationErrors(prev => ({ ...prev, open_hour: undefined }));
            }
          }}
          defaultValue={gymData?.open_hour}
          disabled={isLoading}
          className={validationErrors.open_hour ? 'border-destructive' : ''}
        />
        {validationErrors.open_hour && (
          <p className="text-sm text-destructive">{validationErrors.open_hour}</p>
        )}
      </div>
      
      {/* close */}
      <div className="space-y-2">
        <label htmlFor="close_hour" className="text-sm font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Close Hour
        </label>
        <Input
          id="close_hour"
          name="close_hour"
          type="time"
          step="1"
          onChange={() => {
            if (validationErrors.close_hour) {
              setValidationErrors(prev => ({ ...prev, close_hour: undefined }));
            }
          }}
          defaultValue={gymData?.close_hour}
          disabled={isLoading}
          className={validationErrors.close_hour ? 'border-destructive' : ''}
        />
        {validationErrors.close_hour && (
          <p className="text-sm text-destructive">{validationErrors.close_hour}</p>
        )}
      </div>

      {/* address */}
      <div>
        <label className="text-sm font-medium flex items-center gap-2">
            <MapPinHouse className="w-4 h-4" /> Address
            <span className="text-destructive">*</span>
          </label>
        <select
          name="address_id"
          value={selectedAddress}
          onChange={(e) => {
            setSelectedAddress(e.target.value);
            handleSelectChange('address_id');
          }}
          required
          disabled={isLoading}
          className={`flex h-10 w-full rounded-md border ${validationErrors.address_id ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <option value="">-- Choose an Address --</option>
          {addresses.map(address => (
            <option key={address.address_id} value={address.address_id}>{address.city} {address.street} {address.building_number}</option>
          ))}
        </select>
        {validationErrors.address_id && (
          <p className="text-sm text-destructive">{validationErrors.address_id}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving changes...
          </>
        ) : (
          <>
            <PlusCircle className="mr-2 h-4 w-4" />
            Edit Gym Details
          </>
        )}
      </Button>
    </form>
  );
}

