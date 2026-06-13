export interface Room {
  room_id: number;
  gym_id: number;
  name: string;
  gym: Gym;
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
  client: Client;
  registration_date: string;
  class_info: {
    class_id: number;
    class_date: string;
    class_type_id: number;
    duration: number;
    capacity: number;
    room_id: number;
    occupancy_pct: number;
    class_type: {
      name: string;
      difficulty: number;
      class_type_id: number;
    };
    room: {
      name: string;
      gym_id: number;
      room_id: number;
      gym: {
        gym_id: number;
        name: string;
        established: string;
        email: string;
        phone: string;
        area: number;
        open_hour: string;
        close_hour: string;
        address_id: number;
      };
    };
  };
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

export interface Subscription {
  subscription_id: number;
  name: string;
  price: number;
  duration: number;
  entry_until?: string;

}

export interface ClientSubscription{
  client_subscription_id: number;
  client_id: number;
  subscription_id: number;
  transaction_date: string;
  expiration_date: string;
  paid_now:  'Y' | 'N';
  client?: Client;
  subscription?:Subscription;
}

export interface Entry {
  entry_id: number;
  entry_time: string;
  client_id: number;
  gym_id: number;
  client?: Client;
  gym?: Gym;
}

export type EquipmentType = 'machine' | 'weight' | 'accessory';

export interface Equipment {
  equipment_id: number;
  name: string;
  producer: string;
  state: string;
  price: number;
  equipment_type: EquipmentType;
  gym_id: number;
  gym?: Gym;
  weight?: number;
  max_weight?: number;
  bodypart_target?: string;
}

export interface Client {
  client_id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  birth_date?: string;
}

export interface Article {
  article_id: number;
  name: string;
  price: number;
  type: string;
  stock: number;
}

export interface Stocktaking {
  stocktaking_id: number;
  gym_id: number;
  stocktaking_date: string;
}

export interface TransactionArticle {
  transaction_client_id: number;
  article_id: number;
  quantity?: number;
  article?: Article;
}

export interface TransactionClient {
  transaction_client_id: number;
  client_id: number;
  receptionist_employee_id: number;
  transaction_date: string;
  articles: TransactionArticle[];
}

export interface Employee {
  employee_id: number;
  name: string;
  surname: string;
  date_employed: string;
  is_employed: boolean;
  birth_date?: string;
  gender: 'M' | 'F';
  salary: number;
}

export interface Receptionist extends Employee {
  shift: string;
}
  
export interface Trainer extends Employee {
  specialization: string;
  hourly_wage: number;
}

export interface PersonalTraining {
  personal_training_id: number;
  client_id: number;
  trainer_id: number;
  duration: number;
  start_time: string;   

  client?: {
    name: string;
  };
  trainer?: {
    name: string;
    surname: string
    specialization?: string;
  };
}

export interface GymEmployee {
  gym_id: number;
  employee_id: number;
  
  gym?: Gym;
  employee?: Employee;
}

export interface Address {
  address_id: number;
  city: string;
  street: string;
  building_number: number;
  postal_code: string;
}

export interface Gym {
  gym_id: number;
  name: string;
  established: string;
  email?: string;
  phone?: string;
  area?: number;
  open_hour?: string;
  close_hour?: string;
  address_id: number;
  address?: Address;
}

export interface Sponsor {
  sponsor_id: number;
  name: string;
}

export interface Contract {
  contract_id: number;
  gym_id: number;
  sponsor_id: number;
  payment: number;
  contract_date: string;
  expiration_date: string;
  gym?: Gym;
  sponsor?: Sponsor;
}