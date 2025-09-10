export interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
  year: number
  type: string
  fuelType: string
}

export interface FuelPurchase {
  id: string
  date: string
  vehicleId: string
  quantity: number
  total: number
  provider: string
  state: boolean
  createdAt: string
  updatedAt: string
  vehicle: Vehicle
}

export interface FuelPurchaseFormData {
  date: Date
  vehicleId: string
  quantity: number
  total: number
  provider: string
}
