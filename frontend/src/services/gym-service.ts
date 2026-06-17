import { ApiClient } from "./api-client";
import type { GymClass, Room, Registration,GymEmployee, PersonalTraining, ClassType, Subscription, Entry,Equipment, ClientSubscription, Employee, Client, Article, Stocktaking, TransactionClient, Gym, Address, Sponsor, Contract, Receptionist, Trainer } from "@/types/gym-types";

export const ClassService = new ApiClient<GymClass>("/classes/");
export const RoomService = new ApiClient<Room>("/rooms/");
export const RegistrationService = new ApiClient<Registration>("/registrations/");
export const ClassTypeService = new ApiClient<ClassType>("/class_types/");
export const SubscriptionService = new ApiClient<Subscription>("/subscriptions/");
export const EntryService = new ApiClient<Entry>("/entries/");
export const PersonalTrainingService = new ApiClient<PersonalTraining>("/personaltrainings/");
export const GymEmployeeService = Object.assign(new ApiClient<GymEmployee>("/gym-employments/"), {
  deleteComposite: async (gymId: number, employeeId: number) => {
    const response = await fetch(`http://localhost:8000/gym-employments/?gym_id=${gymId}&employee_id=${employeeId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to remove employee from gym. Server status: ${response.status}`);
    }

    return response.json();
  }
});
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
  updateWeight: async (id: number, data: any) => {
    const response = await fetch(`http://localhost:8000/equipment/weights/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  updateMachine: async (id: number, data: any) => {
    const response = await fetch(`http://localhost:8000/equipment/machines/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  updateAccessory: async (id: number, data: any) => {
    const response = await fetch(`http://localhost:8000/equipment/accessories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },
});
export const ClientSubscriptionService = new ApiClient<ClientSubscription>("/subscriptions/client-subscriptions/");
export const EmployeeService = new ApiClient<Employee>("/employees/");
export const ReceptionistService = new ApiClient<Receptionist>("/employees/receptionists/");
export const TrainerService = new ApiClient<Trainer>("/employees/trainers/");
export const GymService = new ApiClient<Gym>("/gyms/");
export const AddressService = new ApiClient<Address>("/addresses/");
export const SponsorService = new ApiClient<Sponsor>("/sponsors/");
export const ContractService = new ApiClient<Contract>("/contracts/");
export const ClientService = new ApiClient<Client>("/clients/");
export const ArticleService = new ApiClient<Article>("/articles/");
export const StocktakingService = new ApiClient<Stocktaking>("/stocktakings/");
export const TransactionService = new ApiClient<TransactionClient>("/transactions/");

export const AnalyticsClassTypeService = new ApiClient<any>("/analytics/popular-class-types");