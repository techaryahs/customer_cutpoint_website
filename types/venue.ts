export type VenueType = 'salon' | 'spa';

export type VenueService = {
  serviceId: string;
  name: string;
  category?: string;
  price: string | number;
  duration: string | number;
  description?: string;
  image?: string;
  isActive?: boolean;
};

export type EmployeeService = {
  serviceId: string;
  name: string;
  isActive: boolean;
};

export type Employee = {
  empid: string;
  name: string;
  role: string;
  experience: string | number;
  gender: string;
  isActive: boolean;
  services: EmployeeService[];
};

export type Venue = {
  id: string;
  name: string;
  type: VenueType;
  address?: string;
  branch?: string;
  image?: string;
  rating?: number;
  description?: string;
  services?: Record<string, VenueService> | VenueService[];
  slotsByDate?: Record<string, any>;
  timings?: any;
};

export type BookingService = {
  serviceId: string;
  name: string;
  price: string | number;
  duration: string | number;
};
