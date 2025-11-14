export interface Location {
  lat: number
  lng: number
}

export enum ProgressStatus {
  not_started = 'not_started',
  in_progress = 'in_progress',
  completed = 'completed',
  on_hold = 'on_hold',
}

export interface Report {
  id: string
  description: string
  severity: string
  status?: ProgressStatus
  location?: Location | null
  photo?: string | null
  createdAt: string
}

export interface Auth {
  token: string
  user: string
}

export interface Worker {
  id: string
  name: string
  role?: string
  email?: string
  phone?: string
  assignedVehicleId?: string | null
  createdAt?: string
}

export interface Vehicle {
  id: string
  plate?: string
  brand?: string
  model?: string
  status?: string
  driverId?: string | null
  createdAt?: string
}
