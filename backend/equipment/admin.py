from django.contrib import admin
from .models import Machine, Maintenance, Claim, MaintenanceType


@admin.register(Machine)
class MachineAdmin(admin.ModelAdmin):
    list_display = ("serial_number", "model_name", "service_company",
                    "client", "service_org", "shipment_date")
    list_filter = ("service_company", "model_name",
                   "shipment_date", "client", "service_org")
    search_fields = ("serial_number", "buyer", "recipient",
                     "delivery_address", "client__username", "service_org__username")
    ordering = ("serial_number",)


@admin.register(Maintenance)
class MaintenanceAdmin(admin.ModelAdmin):
    list_display = (
        "machine", "maintenance_type", "date", "operating_hours", "service_company"
    )
    list_filter = ("maintenance_type", "service_company", "date")
    search_fields = ("machine__serial_number",
                     "maintenance_type", "order_number")
    ordering = ("-date",)


@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    list_display = (
        "machine", "failure_date", "failure_node", "operating_hours", "downtime_hours"
    )
    list_filter = ("failure_node", "failure_date")
    search_fields = (
        "machine__serial_number", "failure_description",
        "recovery_method", "used_spare"
    )
    ordering = ("-failure_date",)


@admin.register(MaintenanceType)
class MaintenanceTypeAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)
    ordering = ("name",)
