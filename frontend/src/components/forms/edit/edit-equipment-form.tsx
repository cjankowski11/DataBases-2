import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EquipmentService } from "@/services/gym-service";
import type { Gym, Equipment } from "@/types/gym-types";
import { Loader2, Dumbbell, Cog, Package, PlusCircle, Tag, Factory, Hash, Coins, Building2, Activity, Calendar, Weight, Target, Layers, CheckCircle, XCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

type EquipmentType = "weight" | "machine" | "accessory";

interface EditEquipmentFormProps {
  equipmentId: number;
  onSuccess: () => void;
  gyms: Gym[];
}

export function EditEquipmentForm({ equipmentId, onSuccess, gyms }: EditEquipmentFormProps) {
  const [type, setType] = useState<EquipmentType>("weight");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [dateProduced, setDateProduced] = useState("");
  const [equipmentData, setEquipmentData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsFetchingData(true);
        const data = await EquipmentService.getById(equipmentId);
        setEquipmentData(data);
        setType(data.equipment_type as EquipmentType);
        setDateProduced(data.date_produced?.split("T")[0] || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load equipment data");
      } finally {
        setIsFetchingData(false);
      }
    };
    loadData();
  }, [equipmentId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(e.currentTarget);
    const price = parseFloat(formData.get("price") as string);
    const formDateProduced = formData.get("date_produced") as string;
    const dateBought = formData.get("date_bought") as string;

    const commonData = {
      name: formData.get("name") as string,
      producer: formData.get("producer") as string,
      serial_number: parseInt(formData.get("serial_number") as string),
      price,
      state: formData.get("state") as string,
      date_bought: dateBought,
      date_produced: formDateProduced,
      gym_id: parseInt(formData.get("gym_id") as string),
      equipment_type: type
    };

    try {
      let result;
      if (type === "weight") {
        const weight = parseFloat(formData.get("weight") as string);
        result = await EquipmentService.updateWeight(equipmentId, {
          ...commonData,
          weight,
          type: formData.get("weight_sub_type") as string,
          material: formData.get("material") as string
        });
      } else if (type === "machine") {
        const maxWeight = parseInt(formData.get("max_weight") as string);
        result = await EquipmentService.updateMachine(equipmentId, {
          ...commonData,
          max_weight: maxWeight,
          bodypart_target: formData.get("bodypart_target") as string
        });
      } else {
        result = await EquipmentService.updateAccessory(equipmentId, {
          ...commonData,
          type: formData.get("acc_type") as string
        });
      }

      if (result.status === "FAILED") {
        throw new Error(result.message || "Failed to update equipment");
      }

      setSuccessMessage("Equipment updated successfully!");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
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

      {/* Type Selector */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg opacity-70 pointer-events-none">
        {(["weight", "machine", "accessory"] as const).map((t) => (
          <Button
            key={t}
            type="button"
            variant={type === t ? "default" : "ghost"}
            className="flex-1 capitalize h-9"
          >
            {t === "weight" && <Dumbbell className="w-4 h-4 mr-2" />}
            {t === "machine" && <Cog className="w-4 h-4 mr-2" />}
            {t === "accessory" && <Package className="w-4 h-4 mr-2" />}
            {t}
          </Button>
        ))}
      </div>

      {/* Common Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Tag className="w-4 h-4" /> Equipment Name
          </label>
          <Input name="name" placeholder="e.g. Olympic Bar" defaultValue={equipmentData?.name} required disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Factory className="w-4 h-4" /> Producer
          </label>
          <Input name="producer" placeholder="e.g. Rogue" defaultValue={equipmentData?.producer} required disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Hash className="w-4 h-4" /> Serial Number
          </label>
          <Input name="serial_number" type="number" min="0" placeholder="12345" defaultValue={equipmentData?.serial_number} required disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Coins className="w-4 h-4" /> Price (PLN)
          </label>
          <Input name="price" type="number" step="0.01" min="0" placeholder="99.99" defaultValue={equipmentData?.price} required disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Gym Location
          </label>
          <select
            name="gym_id"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
            defaultValue={equipmentData?.gym_id}
            disabled={isLoading}
          >
            <option value="">Select Gym</option>
            {gyms.map(g => <option key={g.gym_id} value={g.gym_id}>{g.name}</option>)}
          </select>
        </div>
        <div className="col-span-2 space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4" /> Condition / State
          </label>
          <Input name="state" placeholder="e.g. New, Used" defaultValue={equipmentData?.state} required disabled={isLoading} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t pt-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Date Produced
          </label>
          <Input
            name="date_produced"
            type="date"
            max={new Date().toISOString().split("T")[0]}
            value={dateProduced}
            onChange={(e) => setDateProduced(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Date Bought
          </label>
          <Input
            name="date_bought"
            type="date"
            min={dateProduced}
            max={new Date().toISOString().split("T")[0]}
            defaultValue={equipmentData?.date_bought?.split("T")[0]}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Specific fields */}
      <div className="space-y-4 border-t pt-4 bg-primary/5 p-4 rounded-xl">
        <p className="text-xs font-bold uppercase text-primary">Specific details for {type}</p>

        {type === "weight" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Weight className="w-4 h-4" /> Weight (kg)
              </label>
              <Input name="weight" type="number" step="0.1" min="0.1" placeholder="20" defaultValue={equipmentData?.weight} required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Layers className="w-4 h-4" /> Material
              </label>
              <Input name="material" placeholder="e.g. Rubber" defaultValue={equipmentData?.material} required disabled={isLoading} />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tag className="w-4 h-4" /> Weight Type
              </label>
              <Input name="weight_sub_type" placeholder="e.g. Plate, Dumbbell, Kettlebell" defaultValue={equipmentData?.type} required disabled={isLoading} />
            </div>
          </div>
        )}

        {type === "machine" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Weight className="w-4 h-4" /> Max Weight (kg)
              </label>
              <Input name="max_weight" type="number" min="1" placeholder="200" defaultValue={equipmentData?.max_weight} required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" /> Target Body Part
              </label>
              <Input name="bodypart_target" placeholder="e.g. Legs, Chest" defaultValue={equipmentData?.bodypart_target} required disabled={isLoading} />
            </div>
          </div>
        )}

        {type === "accessory" && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Tag className="w-4 h-4" /> Accessory Category
            </label>
            <Input name="acc_type" placeholder="e.g. Yoga Mat, Lifting Belt" defaultValue={equipmentData?.type} required disabled={isLoading} />
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating equipment...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Update {type.charAt(0).toUpperCase() + type.slice(1)}
          </>
        )}
      </Button>
    </form>
  );
}