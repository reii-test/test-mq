"use client"

import { useState } from "react"
import styled from "styled-components"

import { createCollection } from "@/lib/api"
import type { CollectionFormData, Moneda } from "@/lib/types"

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
`

const Input = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  outline: none;
  &:focus {
    border-color: #2563eb;
  }
`

const Select = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  outline: none;
  &:focus {
    border-color: #2563eb;
  }
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

interface Props {
  onCreated: () => void
}


// collection form con inicializacion de los estado en 0 o nulo y moneda pesos chilenos
export default function CollectionForm({ onCreated }: Props): JSX.Element {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<CollectionFormData>({
    contract_id: 0,
    mes_cobro: "",
    monto_cobro: 0,
    moneda: "CLP",
  })

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await createCollection(form)
      onCreated()
      setForm({ contract_id: 0, mes_cobro: "", monto_cobro: 0, moneda: "CLP" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear cobro")
    } finally {
      setLoading(false)
    }
  }


  // retorna el id contrato mes de cobro y moneda
  return (
    <Form onSubmit={handleSubmit}>
      <Label>
        ID Contrato
        <Input
          type="number"
          required
          value={form.contract_id || ""}
          onChange={(e) => setForm({ ...form, contract_id: Number(e.target.value) })}
        />
      </Label>
      <Label>
        Mes de cobro
        <Input
          type="date"
          required
          value={form.mes_cobro}
          onChange={(e) => setForm({ ...form, mes_cobro: e.target.value })}
        />
      </Label>
      <Label>
        Monto
        <Input
          type="number"
          step="0.01"
          required
          value={form.monto_cobro || ""}
          onChange={(e) => setForm({ ...form, monto_cobro: Number(e.target.value) })}
        />
      </Label>
      <Label>
        Moneda
        <Select
          value={form.moneda}
          onChange={(e) => setForm({ ...form, moneda: e.target.value as Moneda })}
        >
          <option value="CLP">CLP</option>
          <option value="UF">UF</option>
        </Select>
      </Label>
      {error && <ErrorText>{error}</ErrorText>}
      <Button type="submit" disabled={loading}>
        {loading ? "Creando..." : "Crear Cobro"}
      </Button>
    </Form>
  )
}
