import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientSubscriptionService, ClientService, SubscriptionService, ReceptionistService } from "@/services/gym-service";
import type { Client, Subscription } from "@/types/gym-types";
import { Loader2, User, Tag, Calendar, UserCheck, CheckCircle, XCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface EditClientSubscriptionFormProps {
  saleId: number;
  onSuccess: () => void;
}

export function EditClientSubscriptionForm({ saleId, onSuccess }: EditClientSubscriptionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  const [transactionDate, setTransactionDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [saleData, setSaleData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsFetchingData(true);
        const [clientsData, subsData, employeesData, saleInfo] = await Promise.all([
          ClientService.getAll(),
          SubscriptionService.getAll(),
          ReceptionistService.getAll(),
          ClientSubscriptionService.getById(saleId)
        ]);
        setClients(clientsData);
        setSubscriptions(subsData);
        setEmployees(employeesData);
        setSaleData(saleInfo);
        setTransactionDate(saleInfo.transaction_date.split("T")[0]);
        setExpirationDate(saleInfo.expiration_date.split("T")[0]);
      } catch (err) {
        setError("Failed to load necessary data");
      } finally {
        setIsFetchingData(false);
      }
    };
    loadData();
  }, [saleId]);

  const handleSubscriptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subId = parseInt(e.target.value);
    const selectedSub = subscriptions.find(s => s.subscription_id === subId);

    if (selectedSub && transactionDate) {
      const date = new Date(transactionDate);
      date.setDate(date.getDate() + selectedSub.duration);
      setExpirationDate(date.toISOString().split('T')[0]);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setTransactionDate(newDate);

    // Aktualizacja daty ważności jeśli zmieniono datę transakcji
    const subSelect = document.querySelector('select[name="subscription_id"]') as HTMLSelectElement;
    if (subSelect && subSelect.value) {
      const selectedSub = subscriptions.find(s => s.subscription_id === parseInt(subSelect.value));
      if (selectedSub) {
        const date = new Date(newDate);
        date.setDate(date.getDate() + selectedSub.duration);
        setExpirationDate(date.toISOString().split('T')[0]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(e.currentTarget);

    const payload = {
      client_id: parseInt(formData.get("client_id") as string),
      subscription_id: parseInt(formData.get("subscription_id") as string),
      receptionist_employee_id: parseInt(formData.get("employee_id") as string),
      transaction_date: transactionDate,
      expiration_date: expirationDate,
      paid_now: formData.get("paid_now") === "on" ? "Y" : "N",
    };

    try {
      await ClientSubscriptionService.update(saleId, payload);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update client subscription");
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

      {/* Select Client */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <User className="w-4 h-4 text-primary" /> Client
        </label>
        <select
          name="client_id"
          required
          disabled={isLoading}
          defaultValue={saleData?.client_id}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
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
          disabled={isLoading}
          defaultValue={saleData?.subscription_id}
          onChange={handleSubscriptionChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select plan...</option>
          {subscriptions.map(s => (
            <option key={s.subscription_id} value={s.subscription_id}>
              {s.name} ({s.price} PLN - {s.duration} days)
            </option>
          ))}
        </select>
      </div>

      {/* Select Worker*/}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-primary" /> Sold By (Receptionist)
        </label>
        <select
          name="employee_id"
          required
          disabled={isLoading}
          defaultValue={saleData?.receptionist_employee_id}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select receptionist...</option>
          {employees.map(e => (
            <option key={e.employee_id} value={e.employee_id}>{e.name} {e.surname}</option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Sale Date
          </label>
          <Input
            name="transaction_date"
            type="date"
            required
            disabled={isLoading}
            value={transactionDate}
            onChange={handleDateChange}
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
            disabled={isLoading}
            min={transactionDate}
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <input 
          type="checkbox" 
          name="paid_now" 
          id="paid_now" 
          className="w-4 h-4 rounded border-gray-300"
          defaultChecked={saleData?.paid_now === "Y"}
          disabled={isLoading}
        />
        <label htmlFor="paid_now" className="text-sm font-medium">
          Paid immediately
        </label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating sale...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Update Sale
          </>
        )}
      </Button>
    </form>
  );
}