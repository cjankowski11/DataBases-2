import { ApiClient } from "./api-client";
import type { GymClass, Room, Registration, ClassType, Subscription, Entry,Equipment, ClientSubscription, Employee, Client, Article, Stocktaking, TransactionClient, Gym, Address, Sponsor, Contract } from "@/types/gym-types";

export const ClassService = new ApiClient<GymClass>("/classes/");
export const RoomService = new ApiClient<Room>("/rooms/");
export const RegistrationService = new ApiClient<Registration>("/registrations/");
export const ClassTypeService = new ApiClient<ClassType>("/class_types/");
export const SubscriptionService = new ApiClient<Subscription>("/subscriptions/");
export const EntryService = new ApiClient<Entry>("/entries/");
export const ReceptionistService = new ApiClient<any>("/receptionists/");
export const EquipmentService = Object.assign(new ApiClient<Equipment>("/equipment/"), {
  createWeight: async (data: any) => {
    const response = await fetch(`http://localhost:8000/equipment/weights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  createMachine: async (data: any) => {
    const response = await fetch(`http://localhost:8000/equipment/machines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  createAccessory: async (data: any) => {
    const response = await fetch(`http://localhost:8000/equipment/accessories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },
});
export const ClientSubscriptionService = new ApiClient<ClientSubscription>("/subscriptions/client-subscriptions/");
export const EmployeeService = new ApiClient<Employee>("/employees/");
export const GymService = new ApiClient<Gym>("/gyms/");
export const AddressService = new ApiClient<Address>("/addresses/");
export const SponsorService = new ApiClient<Sponsor>("/sponsors/");
export const ContractService = new ApiClient<Contract>("/contracts/");
export const ClientService = new ApiClient<Client>("/clients/");
export const ArticleService = new ApiClient<Article>("/articles/");
export const StocktakingService = new ApiClient<Stocktaking>("/stocktakings/");
export const TransactionService = new ApiClient<TransactionClient>("/transactions/");
