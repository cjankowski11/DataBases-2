import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientSubscriptionService, ClientService, SubscriptionService, ReceptionistService } from "@/services/gym-service";
import type { Client, Subscription, Employee } from "@/types/gym-types";
import { Loader2, CreditCard, User, Tag, Calendar, UserCheck } from "lucide-react";

interface ClientSubscriptionFormProps {
  onSuccess: () => void;
}

export function ClientSubscriptionForm({ onSuccess }: ClientSubscriptionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  // Stan dla automatycznie obliczanej daty
  const [expirationDate, setExpirationDate] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsData, subsData, employeesData] = await Promise.all([
          ClientService.getAll(),
          SubscriptionService.getAll(),
          ReceptionistService.getAll(),
        ]);
        setClients(clientsData);
        setSubscriptions(subsData);
        setEmployees(employeesData);
      } catch (err) {
        setError("Failed to load required data (clients, subscriptions or employees)");
      } finally {
        setIsFetchingData(false);
      }
    };
    loadData();
  }, []);

  // Funkcja obliczająca datę wygaśnięcia po wybraniu karnetu
  const handleSubscriptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subId = parseInt(e.target.value);
    const selectedSub = subscriptions.find(s => s.subscription_id === subId);
    
    if (selectedSub) {
      const date = new Date();
      date.setDate(date.getDate() + selectedSub.duration);
      setExpirationDate(date.toISOString().split('T')[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    const payload = {
      client_id: parseInt(formData.get("client_id") as string),
      subscription_id: parseInt(formData.get("subscription_id") as string),
      receptionist_employee_id: parseInt(formData.get("employee_id") as string),
      transaction_date: formData.get("transaction_date") as string,
      expiration_date: formData.get("expiration_date") as string,
      paid_now: formData.get("paid_now") === "on" ? "Y" : "N",
    };

    try {
      await ClientSubscriptionService.create(payload);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create client subscription");
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
    <form onSubmit={handleSubmit} className="space-y-5 py-4">
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
          {error}
        </div>
      )}

      {/* Wybór Klienta */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <User className="w-4 h-4 text-primary" /> Client
        </label>
        <select name="client_id" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Select client...</option>
          {clients.map(c => (
            <option key={c.client_id} value={c.client_id}>{c.name} {c.surname}</option>
          ))}
        </select>
      </div>

      {/* Wybór Karnetu */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Tag className="w-4 h-4 text-primary" /> Subscription Plan
        </label>
        <select 
          name="subscription_id" 
          required 
          onChange={handleSubscriptionChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Select plan...</option>
          {subscriptions.map(s => (
            <option key={s.subscription_id} value={s.subscription_id}>
              {s.name} ({s.price} PLN - {s.duration} days)
            </option>
          ))}
        </select>
      </div>

      {/* Wybór Pracownika */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-primary" /> Sold By (Receptionist)
        </label>
        <select name="employee_id" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Select receptionist...</option>
          {employees.map(e => (
            <option key={e.employee_id} value={e.employee_id}>{e.name} {e.surname}</option>
          ))}
        </select>
      </div>

      {/* Daty */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Sale Date
          </label>
          <Input 
            name="transaction_date" 
            type="date" 
            required 
            defaultValue={new Date().toISOString().split('T')[0]} 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Expiry Date
          </label>
          <Input 
            name="expiration_date" 
            type="date" 
            required 
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
          />
        </div>
      </div>

      {/* Płatność */}
      <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
        <input 
          type="checkbox" 
          name="paid_now" 
          id="paid_now" 
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          defaultChecked
        />
        <label htmlFor="paid_now" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Payment received (Paid Now)
        </label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Complete Sale
          </>
        )}
      </Button>
    </form>
  );
}
