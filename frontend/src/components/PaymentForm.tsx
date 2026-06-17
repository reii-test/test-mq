"use client"

import { useState } from "react"
import styled from "styled-components"

import { payBankMovement } from "@/lib/api"
import type { BankMovement, Collection, PaymentItem } from "@/lib/types"


// estilos para boton, saldo input entre otros
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const Select = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  width: 100%;
`

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
`

const SaldoTag = styled.span`
  display: inline-block;
  background: #f3f4f6;
  color: #374151;
  font-size: 0.78rem;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-weight: 600;
  border: 1px solid #e5e7eb;
`

const AllocationRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 160px 36px;
  gap: 0.5rem;
  align-items: center;
`

const Input = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
`

const RemoveButton = styled.button`
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem 0.5rem;
`

const AddButton = styled.button`
  background: #f3f4f6;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
  width: 100%;
`

const Button = styled.button`
  padding: 0.6rem 1rem;
  background: #111827;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: #374151;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const ErrorText = styled.p`
  color: #dc2626;
  font-size: 0.8rem;
  margin: 0;
`

const SuccessText = styled.p`
  color: #16a34a;
  font-size: 0.8rem;
  margin: 0;
`

interface Props {
  bankMovements: BankMovement[]
  collections: Collection[]
  onDone: () => void
}

// trae las constantes
export default function PaymentForm({ bankMovements, collections, onDone }: Props): JSX.Element {
  const [selectedMovementId, setSelectedMovementId] = useState<number | null>(null)
  const [items, setItems] = useState<PaymentItem[]>([{ collection_id: 0, monto_abonado: 0 }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const selectedMovement = bankMovements.find((m) => m.id === selectedMovementId)
  const pendingCollections = collections.filter((c) => c.estado !== "pagado")

  // constante de uf a pesos chilenos se rellena en 40000
  const UF_TO_CLP = 40000

  const getMontoPendienteCLP = (collection: Collection): number => {
    const pendiente = Number(collection.monto_pendiente)
    return collection.moneda === "UF"
      ? Math.round(pendiente * UF_TO_CLP)
      : Math.round(pendiente)
  }

  const updateItem = (index: number, field: keyof PaymentItem, value: number): void => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const handleCollectionChange = (index: number, collectionId: number): void => {
    const collection = pendingCollections.find((c) => c.id === collectionId)
    const montoPendienteCLP = collection ? getMontoPendienteCLP(collection) : 0
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, collection_id: collectionId, monto_abonado: montoPendienteCLP } : item
      )
    )
  }

  // agregar y quitar item
  const addItem = (): void => {
    setItems((prev) => [...prev, { collection_id: 0, monto_abonado: 0 }])
  }

  const removeItem = (index: number): void => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!selectedMovementId) return
    setLoading(true)
    setError(null)
    setSuccess(null)
    // asigna un movement con un pago y realiza la conciliacion
    try {
      await payBankMovement(selectedMovementId, { payments: items })
      setSuccess("Conciliación realizada correctamente")
      setItems([{ collection_id: 0, monto_abonado: 0 }])
      setSelectedMovementId(null)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al conciliar")
    } finally {
      setLoading(false)
    }
  }


  // seccion de transferencia
  return (
    <Wrapper>
      <Label>
        Transferencia bancaria
        <Select
          value={selectedMovementId ?? ""}
          onChange={(e) => setSelectedMovementId(Number(e.target.value))}
        >
          <option value="">Selecciona una transferencia</option>
          {bankMovements.map((m) => (
            <option key={m.id} value={m.id}>
              #{m.id} — {m.glosa} — ${Number(m.monto).toLocaleString("es-CL")} CLP
            </option>
          ))}
        </Select>
      </Label>

      {selectedMovement && (
        <SaldoTag>
          Saldo disponible: ${Number(selectedMovement.saldo_disponible).toLocaleString("es-CL")} CLP
        </SaldoTag>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.75rem" }}>
          {items.map((item, index) => (
            <AllocationRow key={index}>
              <Select
                value={item.collection_id || ""}
                onChange={(e) => handleCollectionChange(index, Number(e.target.value))}
                required
              >
                <option value="">Selecciona cobro</option>
                {pendingCollections.map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.id} — Contrato {c.contract_id} — {c.monto_cobro} {c.moneda} ({c.estado})
                  </option>
                ))}
              </Select>
              <Input
                type="number"
                placeholder="Monto CLP"
                step="1"
                min="1"
                required
                value={item.monto_abonado || ""}
                onChange={(e) => updateItem(index, "monto_abonado", Number(e.target.value))}
              />
              {items.length > 1 && (
                <RemoveButton type="button" onClick={() => removeItem(index)}>✕</RemoveButton>
              )}
            </AllocationRow>
          ))}
        </div>

        <AddButton type="button" onClick={addItem}>
          + Agregar cobro
        </AddButton>

        {error && <ErrorText style={{ marginTop: "0.5rem" }}>{error}</ErrorText>}
        {success && <SuccessText style={{ marginTop: "0.5rem" }}>{success}</SuccessText>}

        <Button
          type="submit"
          disabled={loading || !selectedMovementId}
          style={{ marginTop: "0.75rem", width: "100%" }}
        >
          {loading ? "Conciliando..." : "Confirmar Conciliación"}
        </Button>
      </form>
    </Wrapper>
  )
}
