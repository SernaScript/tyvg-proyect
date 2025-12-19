// Trip domain types following TypeScript/React naming conventions

export enum MeasureType {
  METROS_CUBICOS = 'METROS_CUBICOS',
  TONELADAS = 'TONELADAS'
}

export interface TripEvidence {
  id: string
  tripId: string
  photoUrl: string
  description?: string
  latitude?: number
  longitude?: number
  dateTime: Date
  uploadedByUserId: string
  createdAt: Date
  updatedAt: Date
  uploadedByUser?: {
    id: string
    name: string
    email: string
  }
}

export interface Trip {
  id: string
  materialId: string
  projectId: string
  date: Date
  driverId: string
  vehicleId: string
  incomingReceiptNumber?: string
  outcomingReceiptNumber?: string
  quantity: number
  measure: MeasureType
  salePrice: number
  outsourcedPrice: number
  invoiceId?: string
  isApproved: boolean
  approvedAt?: Date
  observation?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
  material?: {
    id: string
    name: string
    type: string
    unitOfMeasure: string
  }
  project?: {
    id: string
    name: string
    address?: string
    client?: {
      id: string
      name: string
      identification: string
    }
  }
  driver?: {
    id: string
    name: string
    identification: string
    license: string
  }
  vehicle?: {
    id: string
    plate: string
    brand: string
    model: string
    capacityTons?: number
    capacityM3?: number
  }
  invoice?: {
    id: string
    invoiceNumber: string
  }
  creator?: {
    id: string
    name: string
    email: string
  }
  updater?: {
    id: string
    name: string
    email: string
  }
  evidences?: TripEvidence[]
}

export interface CreateTripRequest {
  materialId: string
  projectId: string
  date: string
  driverId: string
  vehicleId: string
  incomingReceiptNumber?: string
  outcomingReceiptNumber?: string
  quantity: number
  measure: MeasureType
  salePrice?: number
  outsourcedPrice?: number
  invoiceId?: string
  observation?: string
}

export interface UpdateTripRequest {
  materialId?: string
  projectId?: string
  date?: string
  driverId?: string
  vehicleId?: string
  incomingReceiptNumber?: string
  outcomingReceiptNumber?: string
  quantity?: number
  measure?: MeasureType
  salePrice?: number
  outsourcedPrice?: number
  invoiceId?: string
  isApproved?: boolean
  observation?: string
}

export interface CreateTripEvidenceRequest {
  tripId: string
  photoUrl: string
  description?: string
  latitude?: number
  longitude?: number
  dateTime: string
}

export interface TripFilter {
  search?: string
  isApproved?: boolean
  projectId?: string
  driverId?: string
  materialId?: string
  dateFrom?: string
  dateTo?: string
}

export interface TripListResponse {
  trips: Trip[]
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}
