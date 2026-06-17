from django.db import transaction
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from tasks.models import BankMovement, Collection, Payment
from tasks.serializers import (
    BankMovementSerializer,
    CollectionSerializer,
    PaymentInputSerializer,
)

'''
CollectionListCreateView maneja la logica para traer la lista de los cobros usando el serializer
para mostrarlos en el formato json que se estructuró
'''
## VISTA de lista de cobros
class CollectionListCreateView(APIView):
    def get(self, request):
        # prefetch related va a traer todos los pagos en una query
        collections = Collection.objects.prefetch_related("payments__bank_movement").all()

        # estados del cobro: (pendiente, parcial o pagado)
        estado = request.query_params.get("estado")
        if estado:
            collections = [c for c in collections if c.estado == estado]

        serializer = CollectionSerializer(collections, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CollectionSerializer(data=request.data)
        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

'''
BankMOvementCreateeView maneja la logica para traer la lista de los movimientos usando el serializer
para mostrarlos en el formato json que se estructuró
'''

class BankMovementListCreateView(APIView):
    def get(self, request):
        movements = BankMovement.objects.prefetch_related("payments").all()
        serializer = BankMovementSerializer(movements, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BankMovementSerializer(data=request.data)
        if serializer.is_valid():

            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



'''
BankMOvementPayView es la vista que recibe el movimiento lista los cobros y luego de validar crea el pago luego entrega 
el resultado de la validacion
'''
class BankMovementPayView(APIView):
    def post(self, request, bank_movement_id):


        try:
            movement = BankMovement.objects.prefetch_related("payments").get(
                pk=bank_movement_id
            )
        except BankMovement.DoesNotExist:
            return Response(
                {"detail": "Movimiento bancario no se encontro"},
                status=status.HTTP_404_NOT_FOUND,
            )


        # usa serializer sino mandamos error 400
        serializer = PaymentInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        payments = serializer.validated_data["payments"]

        total_solicitado = sum(p["monto_abonado"] for p in payments)
        if total_solicitado > movement.saldo_disponible:
            return Response(
                {
                    "detail": "El monto total supera el saldo disponible del movimiento",
                    "saldo_disponible": movement.saldo_disponible,
                    "total_solicitado": total_solicitado,
                },

                # si no mandamos error 400
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            created_payments = []
            for item in payments:
                payment, created = Payment.objects.get_or_create(
                    bank_movement=movement,
                    collection_id=item["collection_id"],
                    defaults={"monto_abonado": item["monto_abonado"]},
                )
                if not created:

                    return Response(
                        {
                            "detail": f"Ya existe un pago del movimiento {movement.pk} al cobro {item['collection_id']}."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                created_payments.append(payment)

        # actualizacion
        movement.refresh_from_db()
        return Response(
            {
                "detail": f"Se crearon {len(created_payments)} pago(s) correctamente.",
                "saldo_disponible": movement.saldo_disponible,
                "payments_creados": len(created_payments),
            },

            # 200 OK ya se crea
            status=status.HTTP_201_CREATED,
        )
