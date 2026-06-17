"use client"

import { useState } from "react"
import styled from "styled-components"

import type { Collection } from "@/lib/types"

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`

const Th = styled.th`
  text-align: left;
  padding: 0.6rem 0.75rem;
  background: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
`

const Td = styled.td`
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: top;
`


// defino colores para estado parcial pagado
const EstadoBadge = styled.span<{ $estado: string }>`
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ $estado }) =>
    $estado === "pagado" ? "#f0fdf4" : $estado === "parcial" ? "#fefce8" : "#fef2f2"};
  color: ${({ $estado }) =>
    $estado === "pagado" ? "#15803d" : $estado === "parcial" ? "#a16207" : "#b91c1c"};
  border: 1px solid ${({ $estado }) =>
    $estado === "pagado" ? "#bbf7d0" : $estado === "parcial" ? "#fde68a" : "#fecaca"};
`

const FilterRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`

// boton de filtrado
const FilterButton = styled.button<{ $active: boolean }>`
  padding: 0.3rem 0.7rem;
  border-radius: 5px;
  border: 1px solid ${({ $active }) => ($active ? "#111827" : "#e5e7eb")};
  background: ${({ $active }) => ($active ? "#111827" : "white")};
  color: ${({ $active }) => ($active ? "white" : "#6b7280")};
  font-size: 0.8rem;
  cursor: pointer;
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
`

const PaymentDetail = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`

const EmptyText = styled.p`
  color: #9ca3af;
  text-align: center;
  padding: 2rem;
`

interface Props {
  collections: Collection[]
}

type Filtro = "todos" | "pendiente" | "parcial" | "pagado"

export default function CollectionList({ collections }: Props): JSX.Element {
  const [filtro, setFiltro] = useState<Filtro>("todos")

  const filtered = filtro === "todos" ? collections : collections.filter((c) => c.estado === filtro)

  return (
    <div>
      <FilterRow>
        {(["todos", "pendiente", "parcial", "pagado"] as Filtro[]).map((f) => (
          <FilterButton key={f} $active={filtro === f} onClick={() => setFiltro(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </FilterButton>
        ))}
      </FilterRow>

      {filtered.length === 0 ? (
        <EmptyText>No hay cobros para mostrar</EmptyText>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>#</Th>
              <Th>Contrato</Th>
              <Th>Mes cobro</Th>
              <Th>Monto</Th>
              <Th>Pendiente</Th>
              <Th>Estado</Th>
              <Th>Pagos recibidos</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <Td>{c.id}</Td>
                <Td>{c.contract_id}</Td>
                <Td>{c.mes_cobro}</Td>
                <Td>
                  {Number(c.monto_cobro).toLocaleString("es-CL")} {c.moneda}
                </Td>
                <Td>
                  {Number(c.monto_pendiente).toLocaleString("es-CL")} {c.moneda}
                </Td>
                <Td>
                  <EstadoBadge $estado={c.estado}>{c.estado}</EstadoBadge>
                </Td>
                <Td>
                  {c.payments.length === 0 ? (
                    <span style={{ color: "#9ca3af" }}>—</span>
                  ) : (
                    c.payments.map((p, i) => (
                      <PaymentDetail key={i}>
                        #{p.bank_movement_id} — ${Number(p.monto_abonado).toLocaleString("es-CL")} CLP
                        ({p.fecha} · {p.glosa})
                      </PaymentDetail>
                    ))
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  )
}
