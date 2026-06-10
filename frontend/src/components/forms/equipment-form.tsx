import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EquipmentService } from "@/services/gym-service";
import type { Gym } from "@/types/gym-types";
import { Loader2, Dumbbell, Cog, Package, CheckCircle2 } from "lucide-react";

type EquipmentType = "weight" | "machine" | "accessory";

interface EquipmentFormProps {
  onSuccess: () => void;
  gyms: Gym[];
}

export function EquipmentForm({ onSuccess, gyms }: EquipmentFormProps) {
  const [type, setType] = useState<EquipmentType>("weight");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    
    const commonData = {
      name: formData.get("name") as string,
      producer: formData.get("producer") as string,
      serial_number: parseInt(formData.get("serial_number") as string),
      price: parseFloat(formData.get("price") as string),
      state: formData.get("state") as string,
      date_bought: formData.get("date_bought") as string,
      date_produced: formData.get("date_produced") as string,
      gym_id: parseInt(formData.get("gym_id") as string),
      equipment_type: type
    };

    try {
      let result;
      if (type === "weight") {
        result = await EquipmentService.createWeight({
          ...commonData,
          weight: parseFloat(formData.get("weight") as string),
          type: formData.get("weight_sub_type") as string,
          material: formData.get("material") as string
        });
      } else if (type === "machine") {
        result = await EquipmentService.createMachine({
          ...commonData,
          max_weight: parseInt(formData.get("max_weight") as string),
          bodypart_target: formData.get("bodypart_target") as string
        });
      } else {
        result = await EquipmentService.createAccessory({
          ...commonData,
          type: formData.get("acc_type") as string
        });
      }

      if (result.status === "FAILED") {
        throw new Error(result.message || "Failed to create equipment");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
          {error}
        </div>
      )}

      {/* Type Selector */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        {(["weight", "machine", "accessory"] as const).map((t) => (
          <Button
            key={t}
            type="button"
            variant={type === t ? "default" : "ghost"}
            className="flex-1 capitalize h-9"
            onClick={() => setType(t)}
            disabled={isLoading}
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
          <label className="text-sm font-medium">Equipment Name</label>
          <Input name="name" placeholder="e.g. Olympic Bar" required disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Producer</label>
          <Input name="producer" placeholder="e.g. Rogue" required disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Serial Number</label>
          <Input name="serial_number" type="number" placeholder="12345" required disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Price (PLN)</label>
          <Input name="price" type="number" step="0.01" placeholder="99.99" required disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Gym Location</label>
          <select 
            name="gym_id" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" 
            required
            disabled={isLoading}
          >
            <option value="">Select Gym</option>
            {gyms.map(g => <option key={g.gym_id} value={g.gym_id}>{g.name}</option>)}
          </select>
        </div>
        <div className="col-span-2 space-y-2">
          <label className="text-sm font-medium">Condition / State</label>
          <Input name="state" placeholder="e.g. New, Used" required disabled={isLoading} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t pt-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Produced</label>
          <Input name="date_produced" type="date" required disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Bought</label>
          <Input name="date_bought" type="date" required disabled={isLoading} />
        </div>
      </div>

      {/* Specific fields */}
      <div className="space-y-4 border-t pt-4 bg-primary/5 p-4 rounded-xl">
        <p className="text-xs font-bold uppercase text-primary">Specific details for {type}</p>
        
        {type === "weight" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Weight (kg)</label>
              <Input name="weight" type="number" step="0.1" placeholder="20" required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Material</label>
              <Input name="material" placeholder="e.g. Rubber" required disabled={isLoading} />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Weight Type</label>
              <Input name="weight_sub_type" placeholder="e.g. Plate, Dumbbell, Kettlebell" required disabled={isLoading} />
            </div>
          </div>
        )}

        {type === "machine" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Weight (kg)</label>
              <Input name="max_weight" type="number" placeholder="200" required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Body Part</label>
              <Input name="bodypart_target" placeholder="e.g. Legs, Chest" required disabled={isLoading} />
            </div>
          </div>
        )}

        {type === "accessory" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Accessory Category</label>
            <Input name="acc_type" placeholder="e.g. Yoga Mat, Lifting Belt" required disabled={isLoading} />
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Save {type.charAt(0).toUpperCase() + type.slice(1)}
          </>
        )}
      </Button>
    </form>
  );
}
