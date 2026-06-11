import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContractService } from "@/services/gym-service";
import type { Contract } from "@/types/gym-types";
import { Loader2, Calendar, Dumbbell, CircleDollarSign, PlusCircle, XCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface EditContractFormProps {
    contractId: number;
    onSuccess: () => void;
}

export function EditContractForm({ contractId, onSuccess }: EditContractFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [contractData, setContractData] = useState<Contract | null>(null);
  const [selectedGym, setSelectedGym] = useState<string>("");
  const [selectedSponsor, setSelectedSponsor] = useState<string>("");
  const [gymName, setGymName] = useState<string>("");
  const [sponsorName, setSponsorName] = useState<string>("");

  const [validationErrors, setValidationErrors] = useState<{
      payment?: string;
      expiration_date?: string;
  }>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsFetchingData(true);
        const [contractItem] = await Promise.all([
          ContractService.getById(contractId)
        ]);

        setContractData(contractItem);
        setSelectedGym(contractItem.gym_id.toString());
        setSelectedSponsor(contractItem.sponsor_id.toString());

        setGymName(contractItem.gym?.name || `Gym #${contractItem.gym_id}`);
        setSponsorName(contractItem.sponsor?.name || `Sponsor #${contractItem.sponsor_id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load contract data");
      } finally {
        setIsFetchingData(false);
      }
    };

    loadData();
  }, [contractId]);

  const validateForm = (formData: FormData): boolean => {
    const errors: { payment?: string; expiration_date?: string; } = {};

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

    //Validating expiration date
    const expirationDate = formData.get("expiration_date") as string;
    if (!expirationDate) {
      errors.expiration_date = "Expiration date is required";
    } else {
      const selectedDate = new Date(expirationDate);

      if (isNaN(selectedDate.getTime())) {
        errors.expiration_date = "Invalid date format";
      } else if (contractData != null && selectedDate <= new Date(contractData.contract_date)) {
        errors.expiration_date = "Expiration date has to be after the contract date";
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
      payment: parseFloat(formData.get("payment") as string),
      expiration_date: formData.get("expiration_date") as string
    };

    try {
      await ContractService.update(contractId, payload);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update contract");
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

      {/* 1. GYM Read only */}
      <div className="space-y-2 p-3 rounded-lg border bg-muted/40">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Dumbbell className="w-3.5 h-3.5 text-primary" /> Gym
        </label>
        <input type="hidden" name="gym_id" value={selectedGym} />
        <p className="text-sm font-medium text-foreground px-1">
          {gymName || `Gym #${selectedGym}`}
        </p>
      </div>

      {/* 2. SPONSOR Read only ) */}
      <div className="space-y-2 p-3 rounded-lg border bg-muted/40">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <CircleDollarSign className="w-3.5 h-3.5 text-primary" /> Sponsor
        </label>
        <input type="hidden" name="sponsor_id" value={selectedSponsor} />
        <p className="text-sm font-medium text-foreground px-1">
          {sponsorName || `Sponsor #${selectedSponsor}`}
        </p>
      </div>

      {/* 3. payment */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Payment Amount <span className="text-destructive">*</span>
        </label>
        <Input
          id="payment"
          type="number"
          step="0.01"
          name="payment"
          defaultValue={contractData?.payment}
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

      {/* 4. ctrct date */}
      <div className="space-y-2 p-3 rounded-lg border bg-muted/40">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" /> Start Date
        </label>
        <input type="hidden" name="contract_date" value={contractData?.contract_date} />
        <p className="text-sm font-mono text-foreground px-1">
          {contractData?.contract_date}
        </p>
      </div>

      {/* expiration date */}
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
          defaultValue={contractData?.expiration_date}
          onChange={() => {
            if (validationErrors.expiration_date) {
              setValidationErrors(prev => ({ ...prev, expiration_date: undefined }));
            }
          }}
          disabled={isLoading}
          min={contractData?.contract_date} 
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
            Saving changes...
          </>
        ) : (
          <>
            <PlusCircle className="mr-2 h-4 w-4" />
            Save Contract Details
          </>
        )}
      </Button>
    </form>
  );
}