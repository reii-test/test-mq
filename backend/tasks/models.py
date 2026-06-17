from django.db import models


from django.core.validators import MinValueValidator
from decimal import Decimal

## CONSTANTES
# UF a pesos chilenos 1 UF = 40000 clp
UF_TO_CLP = Decimal("40000")


# MODELO COLLECTION (cobro) es el cobro que hace la inmobiliaria por mes
class Collection(models.Model):
    class Moneda(models.TextChoices):
        CLP = "CLP", "Peso chileno"
        UF = "UF", "Unidad fomento"

    contract_id = models.IntegerField()
    mes_cobro = models.DateField()
    monto_cobro = models.DecimalField(max_digits=12, decimal_places=2)
    moneda = models.CharField(max_length=3, choices=Moneda.choices)

# cambiar monto_cobro para usar float y no tan detallado

    class Meta:
                #al hacer un select ordena por descendente el mes cobro para evitar en frontend
        ordering = ["-mes_cobro"]

    def __str__(self):
        return f"Collection {self.pk} - Contrato {self.contract_id} ({self.mes_cobro})"

    """pasar el monto de pesos chilenos toma la cte UF_TO_CLP y multiplicamos por monto_cobro"""
    @property
    def monto_cobro_en_clp(self) -> Decimal:
        if self.moneda == self.Moneda.UF:
            return self.monto_cobro * UF_TO_CLP
        return self.monto_cobro


    """sumamos totos los montos abonados de todos los payment realizados """
    @property
    def total_abonado_clp(self) -> Decimal:
        result = self.payments.aggregate(total=models.Sum("monto_abonado"))
        return result["total"] or Decimal("0")


    """
    Retorna el monto pendiente en la moneda original del cobro si es en uf queda en uf
    negativo quedamos con mas saldo
    """
    @property
    def monto_pendiente(self) -> Decimal:
        abonado_clp = self.total_abonado_clp
        if self.moneda == self.Moneda.UF:
            abonado_uf = abonado_clp / UF_TO_CLP
            return self.monto_cobro - abonado_uf
        return self.monto_cobro - abonado_clp


    '''
    estado son 3 pendiente, parcial y pagado
    pendiente cuando no hemos pagado nada (no hay ningun abono)
    parcial cuando aun queda monto pendiente
    pagado cuando ya pagamos el collection o cobro total
    '''
    @property
    def estado(self) -> str:
        abonado_clp = self.total_abonado_clp
        if abonado_clp <= 0:
            return "pendiente"
        if self.monto_pendiente > 0:
            return "parcial"
        return "pagado"


## MODELO BankMovement
# crea una clase con fecha glosa y monto 
class BankMovement(models.Model):
    fecha = models.DateField()
    glosa = models.CharField(max_length=255)
    monto = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )

    class Meta:
        #al hacer un select ordena por descendente las fechas para evitar hacerlo en front
        ordering = ["-fecha"]

    def __str__(self):
        return f"BankMovement {self.pk} - ${self.monto} ({self.fecha})"




    """total asignado en pesos chilenos en cobros"""
    @property
    def total_asignado(self) -> Decimal:
        result = self.payments.aggregate(total=models.Sum("monto_abonado"))
        return result["total"] or Decimal("0")


    """saldo restante del movimiento disponible para asignar"""
    @property
    def saldo_disponible(self) -> Decimal:

        return self.monto - self.total_asignado


''' tabla intermedia que une una collection con un bankmovement (cobro con movimiento)'''
class Payment(models.Model):

    bank_movement = models.ForeignKey(
        BankMovement,
        on_delete=models.CASCADE,
        related_name="payments",
    )

    collection = models.ForeignKey(
        Collection,
        on_delete=models.CASCADE,
        related_name="payments",
    )
    
    monto_abonado = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    

    class Meta:
            # combinacion unica un movimiento y una coleccion porque la transferencia pertenece a un cobro y a un movimiento
        unique_together = [("bank_movement", "collection")]

    def __str__(self):
        return f"Payment: BankMovement {self.bank_movement_id} -> Collection {self.collection_id} (${self.monto_abonado})"
