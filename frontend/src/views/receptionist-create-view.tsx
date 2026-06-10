import { EmployeeFormBase } from "./employee-create-base";

export default function NewReceptionistView() {
  return (
    <EmployeeFormBase title="Add New Receptionist" submitUrl="/employees/receptionists">
      <div className="space-y-1 border-t pt-4 mt-4">
        <label className="text-sm font-medium text-blue-600">Work Shift</label>
        <select 
          name="shift" 
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
        >
          <option value="Morning">Morning</option>
          <option value="Afternoon">Afternoon</option>
          <option value="Night">Night</option>
        </select>
      </div>
    </EmployeeFormBase>
  );
}