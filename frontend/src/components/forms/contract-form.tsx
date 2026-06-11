import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContractService, GymService, SponsorService } from "@/services/gym-service";
import type { Gym, Sponsor } from "@/types/gym-types";
import { Loader2, PlusCircle, Calendar, Dumbbell, XCircle, CircleDollarSign } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface ContractFormProps {
  onSuccess: () => void;
}

export function ContractForm({ onSuccess }: ContractFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [selectedGym, setSelectedGym] = useState<string>("");
  const [selectedSponsor, setSelectedSponsor] = useState<string>("");

  const [validationErrors, setValidationErrors] = useState<{
    gym_id?: string;
    sponsor_id?: string;
    payment?: string;
    contract_date?: string;
    expiration_date?: string;
  }>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [gymsData, sponsorsData] = await Promise.all([
          GymService.getAll(),
          SponsorService.getAll(),
        ]);
        setGyms(gymsData);
        setSponsors(sponsorsData);
      } catch (err) {
        setError("Failed to load gyms or sponsors list");
      } finally {
        setIsFetchingData(false);
      }
    };
    loadData();
  }, []);

  const validateForm = (formData: FormData): boolean => {
    const errors: { gym_id?: string; sponsor_id?: string; payment?: string; contract_date?: string; expiration_date?: string; } = {};

    //Validating gym
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

    //Validating sponsor
    const sponsorId = formData.get("sponsor_id") as string;
    if (!sponsorId || sponsorId === "") {
      errors.sponsor_id = "Please select a sponsor";
    } else {
      const sponsorIdNum = parseInt(sponsorId);
      if (isNaN(sponsorIdNum) || sponsorIdNum <= 0) {
        errors.sponsor_id = "Invalid sponsor selection";
      } else if (!sponsors.some(s => s.sponsor_id === sponsorIdNum)) {
        errors.sponsor_id = "Selected sponsor does not exist";
      }
    }

    //Validating payment
    const payment = formData.get("payment") as string;
    if (!payment || payment === "") {
      errors.payment = "Payment value is required";
    } else {
      const paymentFloat = parseFloat(payment);
      const hasTwoDecimals = /^\d+\.\d{2}$/.test(payment);
      if (isNaN(paymentFloat) || paymentFloat <= 0) {
        errors.payment = "Invalid payment value";
      } else if (!hasTwoDecimals) {
        errors.payment = "Payment value must have two decimal places";
      }
    }

    //Validating contract date
    const contractDate = formData.get("contract_date") as string;
    if (!contractDate) {
      errors.contract_date = "Contract date is required";
    } else {
      const selectedContractDate = new Date(contractDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(selectedContractDate.getTime())) {
        errors.contract_date = "Invalid date format";
      } else if (selectedContractDate < today) {
        errors.contract_date = "Contract date cannot be in the past";
      } else {

        //Validating expiration date
        const expirationDate = formData.get("expiration_date") as string;
        if (!expirationDate) {
          errors.expiration_date = "Expiration date is required";
        } else {
          const selectedDate = new Date(expirationDate);

          if (isNaN(selectedDate.getTime())) {
            errors.expiration_date = "Invalid date format";
          } else if (selectedDate <= selectedContractDate) {
            errors.expiration_date = "Expiration date has to be after the contract date";
          }
        }
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

    const payload = {
      gym_id: parseInt(formData.get("gym_id") as string),
      sponsor_id: parseInt(formData.get("sponsor_id") as string),
      payment: parseFloat(formData.get("payment") as string),
      contract_date:formData.get("contract_date") as string,
      expiration_date: formData.get("expiration_date") as string
    };

    try {
      await ContractService.add(payload);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create contract");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChange = (field: 'gym_id' | 'sponsor_id') => {
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

      <div>
        <label className="text-sm font-medium flex items-center gap-2">
            <Dumbbell className="w-4 h-4" /> Gym
            <span className="text-destructive">*</span>
          </label>
        <select
          name="gym_id"
          value={selectedGym}
          onChange={(e) => {
            setSelectedGym(e.target.value);
            handleSelectChange('gym_id');
          }}
          required
          disabled={isLoading}
          className={`flex h-10 w-full rounded-md border ${validationErrors.gym_id ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <option value="">-- Choose a Gym --</option>
          {gyms.map(gym => (
            <option key={gym.gym_id} value={gym.gym_id}>{gym.name}</option>
          ))}
        </select>
        {validationErrors.gym_id && (
          <p className="text-sm text-destructive">{validationErrors.gym_id}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium flex items-center gap-2">
            <CircleDollarSign className="w-4 h-4" /> Sponsor
            <span className="text-destructive">*</span>
          </label>
        <select
          name="sponsor_id"
          value={selectedSponsor}
          onChange={(e) => {
            setSelectedSponsor(e.target.value);
            handleSelectChange('sponsor_id');
          }}
          required
          disabled={isLoading}
          className={`flex h-10 w-full rounded-md border ${validationErrors.sponsor_id ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <option value="">-- Choose a Sponsor --</option>
          {sponsors.map(sponsor => (
            <option key={sponsor.sponsor_id} value={sponsor.sponsor_id}>{sponsor.name}</option>
          ))}
        </select>
        {validationErrors.sponsor_id && (
          <p className="text-sm text-destructive">{validationErrors.sponsor_id}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Amount</label>
        <Input
          id="payment"
          type="number"
          step="0.01"
          name="payment"
          onChange={() => {
            if (validationErrors.payment) {
              setValidationErrors(prev => ({ ...prev, payment: undefined }));
            }
          }}
          required
          disabled={isLoading}
          placeholder="0.00"
          className={validationErrors.payment ? 'border-destructive' : ''}
        />
        {validationErrors.payment && (
            <p className="text-sm text-destructive">{validationErrors.payment}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="contract_date" className="text-sm font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Contract Date
          <span className="text-destructive">*</span>
        </label>
        <Input
          id="contract_date"
          name="contract_date"
          type="date"
          required
          defaultValue={new Date().toISOString().split("T")[0]}
          onChange={() => {
            if (validationErrors.contract_date) {
              setValidationErrors(prev => ({ ...prev, contract_date: undefined }));
            }
          }}
          disabled={isLoading}
          min={new Date().toISOString().split("T")[0]}
          className={validationErrors.contract_date ? 'border-destructive' : ''}
        />
        {validationErrors.contract_date ? (
          <p className="text-sm text-destructive">{validationErrors.contract_date}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Contract cannot be started in the past
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="expiration_date" className="text-sm font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Expiration Date
          <span className="text-destructive">*</span>
        </label>
        <Input
          id="expiration_date"
          name="expiration_date"
          type="date"
          required
          defaultValue={
            (() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              return tomorrow.toISOString().split("T")[0];
            })()
          }
          onChange={() => {
            if (validationErrors.expiration_date) {
              setValidationErrors(prev => ({ ...prev, expiration_date: undefined }));
            }
          }}
          disabled={isLoading}
          min={
            (() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              return tomorrow.toISOString().split("T")[0];
            })()
          }
          className={validationErrors.expiration_date ? 'border-destructive' : ''}
        />
        {validationErrors.expiration_date ? (
          <p className="text-sm text-destructive">{validationErrors.expiration_date}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Contract cannot end before its start date
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating contract...
          </>
        ) : (
          <>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Contract
          </>
        )}
      </Button>
    </form>
  );
}
