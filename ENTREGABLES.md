# Entregables

## funcionalidades implementadas

- Crear y listar Collection (cobros) y BankMovement (transferencias)
- Conciliacion de asignando un BankMovement a uno o mas cobros con monto parcial
- Calcular estado del cobro como parcial pendiente o pagado
- Convertir UF a pesos chilenos
- Historico de cobros filtrando por estado 
- Prerelleno de monto maximo por pagar

## funcionalidades pendientes que se podrían implementar

- Put y Delete de los cobros (collection) y de los bankmovement (transferencias)
- Delete de una conciliacion
- Paginacion de transferencias historicas cuando son muchas
- Opcion de modificar uf dinamica o conectarse con una librería para obtenerla en el momento

## flujo de datos

El usuario interactua con el frontend en Next.js y realiza acciones agregando nuevos cobros, nuevas transferencias o asignando una conciliacion (transferencia a un cobro) esto hace llamadas a los API Rest construidos en el backend que usa Django.

Las llamadas se validan usando los serializers que los convierten y entregan en json y aplica la logica de los views.py. Estos se ejecutan en la BD Postgresql. 

Decisiones que se tomaron: 1. calcular el estado de cada cobro en tiempo real segun el monto abonado porque no eran tantos cobros o transferencias pero se podria agregar una nueva columna estado en el cobro que vaya cambiando en la bd 2. se ordenaron por mes cobro y por fecha usando class meta ordering - para ordenar de forma descendente

## supuestos

- No se usó un modelo contract por lo que el contract_id puede ser cualquiera y no está asignado a otro contrato
- Estado del cobro como se puso en flujo de datos se calcula en cada consulta segun el monto abonado y no se guarda en un estado en la bd
- no se puede abonar un movimiento 2 veces al mismo cobro se usó unique_together para que esta combinacion no se pueda repetir y se pague por error varias transferencias a un mismo cobro


## Preguntas para el equipo de producto

1. ¿El valor de la UF es fijo o debe actualizarse diariamente? ¿Se usa el valor del día del cobro del pago o de la consulta que se hace? 
2. ¿Se tiene pensado agregar el valor uf dinamico?
3. ¿Se puede eliminar o revertir una conciliacion o es definitiva una vez que se agregó un pago o transferencia a un cobro?
4. ¿Qué sucede con el saldo a favor que queda para el arrendatario en un contrato se asigna al siguiente mes o queda asociado al usuario como un excedente que se debe devolver?

