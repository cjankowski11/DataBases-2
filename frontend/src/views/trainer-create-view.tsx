import { EmployeeFormBase } from "./employee-create-base";
import { Input } from "@/components/ui/input";

export default function NewTrainerView() {
  return (
    <EmployeeFormBase title="Add New Personal Trainer" submitUrl="/employees/trainers">
      {/* Dodatkowe pola specyficzne tylko dla trenera */}
      <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-green-600">Specialization</label>
          <Input name="specialization" placeholder="e.g. Crossfit, Yoga" required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-green-600">Hourly Wage (PLN)</label>
          <Input name="hourly_wage" type="number" step="0.01" placeholder="e.g. 80.00" required />
        </div>
      </div>
    </EmployeeFormBase>
  );
}

