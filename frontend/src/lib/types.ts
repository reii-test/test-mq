
// Importar las 2 tipos de monedas peso chileno y uf y los 3 esstados (pendiente,
// parcial y pagado)

export type Moneda = "CLP" | "UF"

export type Estado = "pendiente" | "parcial" | "pagado"

// modelo payment detalle

export interface PaymentDetail {
  bank_movement_id: number
  monto_abonado: string
  fecha: string
  glosa: string
}


// modelo cobro
export interface Collection {
  id: number
  contract_id: number
  mes_cobro: string
  monto_cobro: string
  moneda: Moneda
  estado: Estado
  monto_pendiente: string
  payments: PaymentDetail[]
}

// modelo bankmovement transferncia
export interface BankMovement {
  id: number
  fecha: string
  glosa: string
  monto: string
  saldo_disponible: string
}


// item de pagos con el collection id correspondiente y el monto que se abona
export interface PaymentItem {
  collection_id: number
  monto_abonado: number
}


// lista de pagos
export interface PaymentInput {
  payments: PaymentItem[]
}

// informacion de los collection y pago
export interface CollectionFormData {
  contract_id: number
  mes_cobro: string
  monto_cobro: number
  moneda: Moneda
}

// fecha monto y glosa de bankmovement
export interface BankMovementFormData {
  fecha: string
  glosa: string
  monto: number
}
