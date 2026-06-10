import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { EmployeeService, ReceptionistService, TrainerService } from "@/services/gym-service";

interface FormBaseProps {
  title: string;
  submitUrl: string; 
  children?: ReactNode; 
}

export function EmployeeFormBase({ title, submitUrl, children }: FormBaseProps) {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    salary: "",
    gender: "M",
    birth_date: "",
    date_employed: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formElement = e.currentTarget as HTMLFormElement;
      
      const rawData = Object.fromEntries(new FormData(formElement));
      

      const finalPayload: any = {
        name: String(rawData.name),
        surname: String(rawData.surname),
        gender: rawData.gender, 
        date_employed: rawData.date_employed, 
        
        birth_date: rawData.birth_date === "" ? null : rawData.birth_date,
        
        salary: rawData.salary === "" ? null : Number(rawData.salary),
      };

      if ("shift" in rawData) {
        finalPayload.shift = String(rawData.shift);
        await ReceptionistService.add(finalPayload)
      }
      
      else if ("specialization" in rawData || "hourly_wage" in rawData) {
        finalPayload.specialization = String(rawData.specialization);
        finalPayload.hourly_wage = rawData.hourly_wage === "" ? null : Number(rawData.hourly_wage);
        await TrainerService.add(finalPayload)
      }
      else{
        await EmployeeService.add(finalPayload);
      }
      setLocation("/employees");
      

      console.log(` ${submitUrl} z payloadem:`, finalPayload);
      
      
      
    } catch (err) {
      console.error("Błąd zapisu pracownika na frontendzie:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6 bg-card border rounded-lg shadow-sm mt-8">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">First Name</label>
            <Input name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Last Name</label>
            <Input name="surname" value={formData.surname} onChange={handleChange} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Salary (PLN)</label>
            <Input name="salary" type="number" value={formData.salary} onChange={handleChange} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Gender</label>
            <select 
              name="gender" 
              value={formData.gender} 
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
            >
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Birth Date</label>
            <Input name="birth_date" type="date" value={formData.birth_date} onChange={handleChange} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Date Employed</label>
            <Input name="date_employed" type="date" value={formData.date_employed} onChange={handleChange} required />
          </div>
        </div>

        {children}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => setLocation("/employees")}>
            Cancel
          </Button>
          <Button type="submit">Save Employee</Button>
        </div>
      </form>
    </div>
  );
}