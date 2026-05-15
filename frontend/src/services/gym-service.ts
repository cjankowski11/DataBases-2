import { ApiClient } from "./api-client";
import type { GymClass, Room, Registration, ClassType } from "@/types/gym-types";

export const ClassService = new ApiClient<GymClass>("/classes/");
export const RoomService = new ApiClient<Room>("/rooms/");
export const RegistrationService = new ApiClient<Registration>("/registrations/");
export const ClassTypeService = new ApiClient<ClassType>("/class_types/");