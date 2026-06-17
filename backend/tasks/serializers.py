from decimal import Decimal

from rest_framework import serializers

from tasks.models import BankMovement, Collection, Payment


''' detalle de pago en un cobro muestra la transferencia y de cuanto es '''
class PaymentDetailSerializer(serializers.ModelSerializer):

    fecha = serializers.DateField(source="bank_movement.fecha")
    glosa = serializers.CharField(source="bank_movement.glosa")

    class Meta:
        model = Payment
        fields = ["bank_movement_id", "monto_abonado", "fecha", "glosa"]

''' collection crea y lista los collection-cobros '''
class CollectionSerializer(serializers.ModelSerializer):

    estado = serializers.CharField(read_only=True)
    monto_pendiente = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )
    payments = PaymentDetailSerializer(many=True, read_only=True)

    class Meta:
        model = Collection
        fields = [
            "id",
            "contract_id",
            "mes_cobro",
            "monto_cobro",
            "moneda",
            "estado",
            "monto_pendiente",
            "payments",
        ]


''' bankmovement crea y lista transferencias '''

class BankMovementSerializer(serializers.ModelSerializer):

    saldo_disponible = serializers.DecimalField(
        max_digits=14, decimal_places=2, read_only=True
    )

    class Meta:
        model = BankMovement
        fields = ["id", "fecha", "glosa", "monto", "saldo_disponible"]




''' item con el id collection y el monto del cobro que se abonó  '''
class PaymentItemSerializer(serializers.Serializer):


    collection_id = serializers.IntegerField()
    monto_abonado = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        min_value=Decimal("0.01"),
    )


''' 
Ingreso del payment o pago
validaciones son:
1. no es posible mandar el mismo cobro 2 veces
2. collection id debe existir porque sino no podria ingresar un pago al cobro si no hay
'''  
class PaymentInputSerializer(serializers.Serializer):

    payments = PaymentItemSerializer(many=True)

    def validate_payments(self, payments):
        if not payments:
            raise serializers.ValidationError("Debe incluir al menos un cobro")
        ids = [p["collection_id"] for p in payments]
        if len(ids) != len(set(ids)):
            raise serializers.ValidationError(
                "No puede abonar dos veces al mismo cobro en un mismo request"
            )

        existing_ids = set(
            Collection.objects.filter(id__in=ids).values_list("id", flat=True)
        )
        missing = set(ids) - existing_ids
        if missing:
            raise serializers.ValidationError(
                f"Los siguientes cobros no existen: {sorted(missing)}"
            )

        return payments
