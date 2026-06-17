from django.core.management.base import BaseCommand

from tasks.models import BankMovement, Collection, Payment


class Command(BaseCommand):
    help = "Carga datos de prueba cobros, transferencias y conciliaciones"

    def handle(self, *args, **kwargs):
        if Collection.objects.exists():
            self.stdout.write("si hay datos omite seed")
            return

        # cobros
        c1 = Collection.objects.create(contract_id=101, mes_cobro="2026-04-01", monto_cobro=2, moneda="UF")
        c2 = Collection.objects.create(contract_id=102, mes_cobro="2026-04-01", monto_cobro=500000, moneda="CLP")
        c3 = Collection.objects.create(contract_id=103, mes_cobro="2026-05-01", monto_cobro=3, moneda="UF")
        c4 = Collection.objects.create(contract_id=101, mes_cobro="2026-05-01", monto_cobro=2, moneda="UF")

        # transferencias
        m1 = BankMovement.objects.create(fecha="2026-04-05", glosa="Arriendo abril - contrato 101", monto=80000)
        m2 = BankMovement.objects.create(fecha="2026-04-07", glosa="Pago arriendo abril - contrato 102", monto=500000)
        m3 = BankMovement.objects.create(fecha="2026-04-10", glosa="Abono parcial contrato 103", monto=60000)
        BankMovement.objects.create(fecha="2026-05-03", glosa="Transferencia sin conciliar", monto=120000)

        # conciliaciones
        Payment.objects.create(bank_movement=m1, collection=c1, monto_abonado=80000)   # c1 pagado completo
        Payment.objects.create(bank_movement=m2, collection=c2, monto_abonado=500000)  # c2 pagado completo
        Payment.objects.create(bank_movement=m3, collection=c3, monto_abonado=60000)   # c3 parcial (faltan 60k)

        self.stdout.write(self.style.SUCCESS(
            f"Seed completado: {Collection.objects.count()} cobros, "
            f"{BankMovement.objects.count()} transferencias, "
            f"{Payment.objects.count()} pagos"
        ))
