"use client"

import { useCallback, useEffect, useState } from "react"
import styled from "styled-components"

import BankMovementForm from "@/components/BankMovementForm"
import CollectionForm from "@/components/CollectionForm"
import CollectionList from "@/components/CollectionList"
import PaymentForm from "@/components/PaymentForm"
import { getBankMovements, getCollections } from "@/lib/api"
import type { BankMovement, Collection } from "@/lib/types"

const Page = styled.main`
  max-width: 1080px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
`

const Header = styled.div`
  margin-bottom: 2rem;
  border-bottom: 2px solid #e2e5ea;
  padding-bottom: 1rem;
`

const Title = styled.h1`
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0;
  color: #111827;
  letter-spacing: -0.3px;
`

const Subtitle = styled.p`
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: #6b7280;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.25rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const Card = styled.section`
  background: #ffffff;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
`

const CardTitle = styled.h2`
  font-size: 0.85rem;
  font-weight: 700;
  margin: 0 0 1.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6b7280;
`

const EmptyNote = styled.p`
  color: #9ca3af;
  font-size: 0.875rem;
  margin: 0;
`

const ErrorText = styled.p`
  color: #dc2626;
  font-size: 0.875rem;
  margin: 0;
`

export default function TasksPage(): JSX.Element {
  const [collections, setCollections] = useState<Collection[]>([])
  const [bankMovements, setBankMovements] = useState<BankMovement[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const loadData = useCallback(async (): Promise<void> => {
    setLoadingData(true)
    setFetchError(null)
    try {
      const [cols, movements] = await Promise.all([getCollections(), getBankMovements()])
      setCollections(cols)
      setBankMovements(movements)
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Error al cargar datos")
    } finally {
      setLoadingData(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  return (
    <Page>
      <Header>
        <Title>Conciliación de Pagos de Arriendo</Title>
      </Header>

      <Grid>
        <Card>
          <CardTitle>Nuevo Cobro</CardTitle>
          <CollectionForm onCreated={loadData} />
        </Card>
        <Card>
          <CardTitle>Nueva Transferencia</CardTitle>
          <BankMovementForm onCreated={loadData} />
        </Card>
      </Grid>

      <Card style={{ marginBottom: "1.25rem" }}>
        <CardTitle>Conciliar Transferencia</CardTitle>
        {bankMovements.length === 0 ? (
          <EmptyNote>No hay transferencias registradas aún.</EmptyNote>
        ) : (
          <PaymentForm
            bankMovements={bankMovements}
            collections={collections}
            onDone={loadData}
          />
        )}
      </Card>

      <Card>
        <CardTitle>Histórico de Cobros</CardTitle>
        {loadingData ? (
          <EmptyNote>Cargando...</EmptyNote>
        ) : fetchError ? (
          <ErrorText>{fetchError}</ErrorText>
        ) : (
          <CollectionList collections={collections} />
        )}
      </Card>
    </Page>
  )
}
