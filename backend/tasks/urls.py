from django.urls import path

from tasks.views import (
    BankMovementListCreateView,
    BankMovementPayView,
    CollectionListCreateView,
)

urlpatterns = [
    path("collections/", CollectionListCreateView.as_view(), name="collection-list-create"),
    path("bank-movements/", BankMovementListCreateView.as_view(), name="bank-movement-list-create"),
    path("bank-movements/<int:bank_movement_id>/pay/", BankMovementPayView.as_view(), name="bank-movement-pay"),
]
