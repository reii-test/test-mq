import type {
  BankMovement,
  BankMovementFormData,
  Collection,
  CollectionFormData,
  PaymentInput,
} from "@/lib/types"


// levantar en localhost
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"


async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Error desconocido" }))
    throw new Error(error.detail ?? "Error en la solicitud")
  }

  return res.json() as Promise<T>
}

// obtiene todas las collections desde /api/colections
export const getCollections = (estado?: string): Promise<Collection[]> => {
  const query = estado ? `?estado=${estado}` : ""
  return request<Collection[]>(`/api/collections/${query}`)
}

export const createCollection = (data: CollectionFormData): Promise<Collection> =>
  request<Collection>("/api/collections/", {
    method: "POST",
    body: JSON.stringify(data),
  })

//obtiene todos los bank movements
export const getBankMovements = (): Promise<BankMovement[]> =>
  request<BankMovement[]>("/api/bank-movements/")


// post para crear un bankmovement
export const createBankMovement = (data: BankMovementFormData): Promise<BankMovement> =>
  request<BankMovement>("/api/bank-movements/", {
    method: "POST",
    body: JSON.stringify(data),
  })

// conciliacion para agregar un bankmovenet id a un cobro
export const payBankMovement = (id: number, data: PaymentInput): Promise<unknown> =>
  request<unknown>(`/api/bank-movements/${id}/pay/`, {
    method: "POST",
    body: JSON.stringify(data),
  })
