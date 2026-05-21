import { ApiClient } from "./api-client";
import type { GymClass, Room, Registration, ClassType, Subscription, Entry,Equipment, ClientSubscription, Employee } from "@/types/gym-types";

export const ClassService = new ApiClient<GymClass>("/classes/");
export const RoomService = new ApiClient<Room>("/rooms/");
export const RegistrationService = new ApiClient<Registration>("/registrations/");
export const ClassTypeService = new ApiClient<ClassType>("/class_types/");
export const SubscriptionService = new ApiClient<Subscription>("/subscriptions/");
export const EntryService = new ApiClient<Entry>("/entries/");
export const EquipmentService = new ApiClient<Equipment>("/equipment/");
export const ClientSubscriptionService = new ApiClient<ClientSubscription>("/subscriptions/client-subscriptions/");
export const EmployeeService = new ApiClient<Employee>("/employees/");