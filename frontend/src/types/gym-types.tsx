export interface Room {
  room_id: number;
  gym_id: number;
  name: string;
}

export interface ClassType {
  class_type_id: number;
  name: string;
  difficulty: number;
}

export interface GymClass {
  class_id: number;
  class_date: string;
  class_type_id: number;
  duration: number;
  capacity: number;
  room_id: number;
  class_type: ClassType;
  room: Room;
  occupancy_pct: number;
}

export interface Registration {
  class_registration_id: number;
  client_id: number;
  class_id: number;
  registration_date: string;
}

export interface ClassType {
  class_type_id: number;
  name: string;
  difficulty: number;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message: string;
}