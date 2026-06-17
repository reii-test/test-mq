"use client"

import { useState } from "react"
import styled from "styled-components"

import { createBankMovement } from "@/lib/api"
import type { BankMovementFormData } from "@/lib/types"

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

// inicializacion en fecha glosa nulos y monto 0
export default function BankMovementForm({ onCreated }: Props): JSX.Element {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<BankMovementFormData>({
    fecha: "",
    glosa: "",
    monto: 0,
  })

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await createBankMovement(form)
      onCreated()
      setForm({ fecha: "", glosa: "", monto: 0 })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear transferencia")
    } finally {
      setLoading(false)
    }
  }


  // trae fecha glosa y monto en pesos chilenos
  return (
    <Form onSubmit={handleSubmit}>
      <Label>
        Fecha
        <Input
          type="date"
          required
          value={form.fecha}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })}
        />
      </Label>
      <Label>
        Glosa
        <Input
          type="text"
          required
          placeholder="Ej: Arriendo abril contrato 123"
          value={form.glosa}
          onChange={(e) => setForm({ ...form, glosa: e.target.value })}
        />
      </Label>
      <Label>
        Monto (CLP)
        <Input
          type="number"
          step="1"
          required
          value={form.monto || ""}
          onChange={(e) => setForm({ ...form, monto: Number(e.target.value) })}
        />
      </Label>
      {error && <ErrorText>{error}</ErrorText>}
      <Button type="submit" disabled={loading}>
        {loading ? "Registrando..." : "Registrar Transferencia"}
      </Button>
    </Form>
  )
}
