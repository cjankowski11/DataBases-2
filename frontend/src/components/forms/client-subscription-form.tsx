import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientSubscriptionService, ClientService, SubscriptionService, ReceptionistService } from "@/services/gym-service";
import type { Client, Subscription, Employee } from "@/types/gym-types";
import { Loader2, PlusCircle, User, Tag, Calendar, UserCheck, CheckCircle, XCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface ClientSubscriptionFormProps {
  onSuccess: () => void;
}

export function ClientSubscriptionForm({ onSuccess }: ClientSubscriptionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);


  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
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


  const handleSubscriptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subId = parseInt(e.target.value);
    const selectedSub = subscriptions.find(s => s.subscription_id === subId);

    if (selectedSub) {
      const date = new Date(transactionDate);
      date.setDate(date.getDate() + selectedSub.duration);
      setExpirationDate(date.toISOString().split('T')[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(e.currentTarget);
    const expDate = formData.get("expiration_date") as string;

    const payload = {
      client_id: parseInt(formData.get("client_id") as string),
      subscription_id: parseInt(formData.get("subscription_id") as string),
      receptionist_employee_id: parseInt(formData.get("employee_id") as string),
      transaction_date: transactionDate,
      expiration_date: expDate,
      paid_now: formData.get("paid_now") === "on" ? "Y" : "N",
    };

    try {
      await ClientSubscriptionService.create(payload);
      setSuccessMessage("Client subscription created successfully!");
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
            onChange={(e) => setTransactionDate(e.target.value)}
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

      {/* Payment*/}
      <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
        <input
          type="checkbox"
          name="paid_now"
          id="paid_now"
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
          defaultChecked
          disabled={isLoading}
        />
        <label htmlFor="paid_now" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Payment received (Paid Now)
        </label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating sale...
          </>
        ) : (
          <>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Sale
          </>
        )}
      </Button>
    </form>
  );
}
