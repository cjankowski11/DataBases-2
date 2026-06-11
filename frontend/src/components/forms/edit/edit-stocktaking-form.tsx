import { useState, useEffect } from "react"
import { StocktakingService, GymService } from "@/services/gym-service"
import type { Gym } from "@/types/gym-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, CheckCircle, XCircle, Building2, Calendar } from "lucide-react"

interface EditStocktakingFormProps {
  stocktakingId: number | null
  onSuccess: () => void
}

export function EditStocktakingForm({ stocktakingId, onSuccess }: EditStocktakingFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingData, setIsFetchingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [gyms, setGyms] = useState<Gym[]>([])
  const [selectedGym, setSelectedGym] = useState<string>("")
  const [defaultDate, setDefaultDate] = useState<string>("")

  const [validationErrors, setValidationErrors] = useState<{
    gym_id?: string;
    stocktaking_date?: string;
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!stocktakingId) return
      
      try {
        setIsFetchingData(true)
        const [gymsData, stockData] = await Promise.all([
          GymService.getAll(),
          StocktakingService.getById(stocktakingId)
        ])
        setGyms(gymsData)
        setSelectedGym(stockData.gym_id.toString())
        setDefaultDate(stockData.stocktaking_date)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load details")
      } finally {
        setIsFetchingData(false)
      }
    }
    fetchData()
  }, [stocktakingId])

  const validateForm = (formData: FormData): boolean => {
    const errors: { gym_id?: string; stocktaking_date?: string } = {};

    const gymId = formData.get("gym_id") as string;
    if (!gymId || gymId === "") {
      errors.gym_id = "Gym selection is required";
    }

    const date = formData.get("stocktaking_date") as string;
    if (!date || date.trim() === "") {
      errors.stocktaking_date = "Date is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stocktakingId) return;

    setError(null);

    const formData = new FormData(e.currentTarget);

    if (!validateForm(formData)) {
      return;
    }

    setIsLoading(true);

    const payload = {
      gym_id: parseInt(formData.get("gym_id") as string),
      stocktaking_date: formData.get("stocktaking_date") as string,
    };

    try {
      await StocktakingService.update(stocktakingId, payload)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update stocktaking")
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
            handleInputChange('gym_id');
          }}
          disabled={isLoading}
          className={`flex h-10 w-full rounded-md border ${validationErrors.gym_id ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <option value="">Select a gym</option>
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
        <label htmlFor="stocktaking_date" className="text-sm font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Stocktaking Date
          <span className="text-destructive">*</span>
        </label>
        <Input
          id="stocktaking_date"
          name="stocktaking_date"
          type="date"
          required
          defaultValue={defaultDate}
          disabled={isLoading}
          onChange={() => handleInputChange('stocktaking_date')}
          className={validationErrors.stocktaking_date ? 'border-destructive' : ''}
        />
        {validationErrors.stocktaking_date && (
          <p className="text-sm text-destructive">{validationErrors.stocktaking_date}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Save Changes
          </>
        )}
      </Button>
    </form>
  )
}
