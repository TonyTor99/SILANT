from rest_framework import serializers
from .models import Machine, Maintenance, Claim, MaintenanceType


class MaintenanceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceType
        fields = ["id", "name"]


class MaintenanceSerializer(serializers.ModelSerializer):
    maintenance_type = MaintenanceTypeSerializer(read_only=True)
    machine_serial = serializers.CharField(
        source="machine.serial_number", read_only=True)

    class Meta:
        model = Maintenance
        fields = [
            "id",
            "machine_serial",
            "maintenance_type",
            "date",
            "operating_hours",
            "order_number",
            "order_date",
            "service_company",
        ]
        read_only_fields = fields


class ClaimSerializer(serializers.ModelSerializer):
    machine_serial = serializers.CharField(
        source="machine.serial_number", read_only=True)

    class Meta:
        model = Claim
        fields = [
            "id",
            "machine_serial",
            "failure_date",
            "operating_hours",
            "failure_node",
            "failure_description",
            "recovery_method",
            "used_spare",
            "restored_date",
            "downtime_hours",
        ]
        read_only_fields = fields


class MachineListSerializer(serializers.ModelSerializer):
    maintenance_count = serializers.SerializerMethodField()
    claims_count = serializers.SerializerMethodField()

    class Meta:
        model = Machine
        fields = [
            "id",
            "serial_number",
            "model_name",
            "engine_model",
            "shipment_date",
            "service_company",
            "maintenance_count",
            "claims_count",
        ]
        read_only_fields = fields

    def get_maintenance_count(self, obj):
        return getattr(obj, 'maintenance_count', obj.maintenance_set.count())

    def get_claims_count(self, obj):
        return getattr(obj, 'claims_count', obj.claim_set.count())


class MachineDetailSerializer(serializers.ModelSerializer):
    maintenance = MaintenanceSerializer(
        many=True, read_only=True, source="maintenance_set"
    )
    claims = ClaimSerializer(
        many=True, read_only=True, source="claim_set"
    )

    class Meta:
        model = Machine
        fields = [
            "id",
            "serial_number",
            "model_name",
            "engine_model", "engine_serial",
            "transmission_model", "transmission_serial",
            "drive_axle_model", "drive_axle_serial",
            "steer_axle_model", "steer_axle_serial",
            "shipment_date",
            "buyer", "recipient", "delivery_address",
            "options", "service_company",
            "maintenance", "claims",
        ]
        read_only_fields = fields


class MachineAnonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Machine
        fields = (
            "serial_number",
            "model_name",
            "engine_model",
            "engine_serial",
            "transmission_model",
            "transmission_serial",
            "drive_axle_model",
            "drive_axle_serial",
            "steer_axle_model",
            "steer_axle_serial",
        )
        read_only_fields = fields


class MaintenanceWriteSerializer(serializers.ModelSerializer):
    machine_id = serializers.PrimaryKeyRelatedField(
        source="machine", queryset=Machine.objects.all(), write_only=True
    )

    class Meta:
        model = Maintenance
        fields = (
            "id", "machine_id", "maintenance_type", "date", "operating_hours",
            "order_number", "order_date", "service_company",
        )
        read_only_fields = ("id",)


class ClaimWriteSerializer(serializers.ModelSerializer):
    machine_id = serializers.PrimaryKeyRelatedField(
        source="machine", queryset=Machine.objects.all(), write_only=True
    )

    class Meta:
        model = Claim
        fields = (
            "id", "machine_id", "failure_date", "operating_hours", "failure_node",
            "failure_description", "recovery_method", "used_spare",
            "restored_date", "downtime_hours",
        )
        read_only_fields = ("id",)


class MachineWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Machine
        fields = [
            "id",
            "model_name",
            "serial_number",
            "engine_model", "engine_serial",
            "transmission_model", "transmission_serial",
            "drive_axle_model", "drive_axle_serial",
            "steer_axle_model", "steer_axle_serial",
            "shipment_date",
            "buyer", "recipient", "delivery_address",
            "options",
            "service_company",
        ]
