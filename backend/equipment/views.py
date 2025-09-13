from django.db.models import Q, Count, Prefetch
from rest_framework import viewsets, permissions, filters
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListAPIView
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Machine, Maintenance, Claim, MaintenanceType
from .serializers import (
    MachineListSerializer,
    MaintenanceTypeSerializer,
    MaintenanceSerializer, ClaimSerializer,
    MachineAnonSerializer, MaintenanceWriteSerializer, ClaimWriteSerializer, MachineDetailSerializer, MachineWriteSerializer
)

CLIENT_GROUP = "Клиент"
SERVICE_GROUP = "Сервисная организация"
MANAGER_GROUP = "Менеджер"


def get_user_role(user):
    if not user.is_authenticated:
        return None
    if user.is_superuser or user.groups.filter(name=MANAGER_GROUP).exists():
        return "manager"
    if user.groups.filter(name=SERVICE_GROUP).exists():
        return "service"
    if user.groups.filter(name=CLIENT_GROUP).exists():
        return "client"
    return None


def _role(user):
    return get_user_role(user)


class DjangoModelPermissionsOrAnonReadOnly(permissions.DjangoModelPermissions):
    def has_permission(self, request, view):
        if request.user.is_anonymous:
            return request.method in permissions.SAFE_METHODS
        return super().has_permission(request, view)


class MachineViewSet(viewsets.ModelViewSet):
    """
    /api/machines        -> список (с пагинацией/поиском/сортировкой)
    /api/machines/{id}   -> детальная карточка (с вложенными ТО и рекламациями)
    """
    permission_classes = [DjangoModelPermissionsOrAnonReadOnly]
    filter_backends = [DjangoFilterBackend,
                       filters.SearchFilter, filters.OrderingFilter]

    # Фильтры по точному совпадению
    filterset_fields = {
        "model_name": ["exact", "icontains"],
        "engine_model": ["exact", "icontains"],
        "transmission_model": ["exact", "icontains"],
        "steer_axle_model": ["exact", "icontains"],
        "drive_axle_model": ["exact", "icontains"],
        "serial_number": ["exact", "icontains"],
    }
    # Поиск по нескольким полям
    search_fields = ['serial_number', 'engine_serial',
                     'transmission_serial', 'buyer', 'recipient', 'delivery_address']
    # Разрешённые сортировки
    ordering_fields = ['serial_number', 'shipment_date', 'model_name']

    def get_serializer_class(self):
        if not self.request.user.is_authenticated:
            return MachineAnonSerializer
        if self.request.method in ("POST", "PUT", "PATCH"):
            return MachineWriteSerializer
        return MachineListSerializer if self.action == "list" else MachineDetailSerializer

    def _restrict_by_role(self, qs):
        role = get_user_role(self.request.user)
        if role == "manager":
            return qs
        if role == "service":
            return qs.filter(service_org=self.request.user)
        if role == "client":
            return qs.filter(client=self.request.user)
        return qs.none()

    def get_queryset(self):
        qs = Machine.objects.all()

        if self.action == "list":
            qs = qs.annotate(
                maintenance_count=Count("maintenance", distinct=True),
                claims_count=Count("claim", distinct=True),
            ).order_by("-shipment_date")
            return self._restrict_by_role(qs)

        if self.action == "retrieve":
            qs = qs.prefetch_related(
                Prefetch(
                    "maintenance_set",
                    queryset=Maintenance.objects.select_related(
                        "maintenance_type").order_by("-date"),
                ),
                Prefetch(
                    "claim_set",
                    queryset=Claim.objects.order_by("-failure_date"),
                ),
            )
            return self._restrict_by_role(qs)

        return self._restrict_by_role(qs)

    def _ensure_manager(self):
        if get_user_role(self.request.user) != "manager":
            raise PermissionDenied(
                "Изменение данных машины доступно только менеджеру.")

    def perform_create(self, serializer):
        self._ensure_manager()
        serializer.save()

    def perform_update(self, serializer):
        self._ensure_manager()
        serializer.save()

    def perform_destroy(self, instance):
        self._ensure_manager()
        return super().perform_destroy(instance)

    @action(detail=False, methods=["get"])
    def facets(self, request):
        qs = self._restrict_by_role(Machine.objects.all())
        data = {
            "model_name":        list(qs.exclude(model_name="").values_list("model_name", flat=True).distinct().order_by("model_name")),
            "engine_model":      list(qs.exclude(engine_model="").values_list("engine_model", flat=True).distinct().order_by("engine_model")),
            "transmission_model": list(qs.exclude(transmission_model="").values_list("transmission_model", flat=True).distinct().order_by("transmission_model")),
            "steer_axle_model":  list(qs.exclude(steer_axle_model="").values_list("steer_axle_model", flat=True).distinct().order_by("steer_axle_model")),
            "drive_axle_model":  list(qs.exclude(drive_axle_model="").values_list("drive_axle_model", flat=True).distinct().order_by("drive_axle_model")),
            "service_company":   list(qs.exclude(service_company="").values_list("service_company", flat=True).distinct().order_by("service_company")),
        }
        return Response(data)


class MaintenanceTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    /api/maintenance-types -> список справочника видов ТО
    """
    queryset = MaintenanceType.objects.all().order_by('name')
    serializer_class = MaintenanceTypeSerializer
    permission_classes = [DjangoModelPermissionsOrAnonReadOnly]


class MaintenanceViewSet(viewsets.ModelViewSet):
    """
    /api/maintenance — список ТО (read-only)
    Фильтры: по виду ТО, сервисной компании, серийному номеру машины и датам.
    """
    queryset = Maintenance.objects.select_related(
        'machine', 'maintenance_type').all().order_by('-date')
    serializer_class = MaintenanceSerializer
    permission_classes = [DjangoModelPermissionsOrAnonReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = {
        "maintenance_type": ["exact"],
        "machine__serial_number": ["exact"],
        "service_company": ["exact", "icontains"]
    }
    ordering_fields = ['date', 'operating_hours', 'order_date']

    def get_serializer_class(self):
        return MaintenanceWriteSerializer if self.request.method in ("POST", "PUT", "PATCH") else MaintenanceSerializer

    def _restrict_by_role(self, qs):
        role = get_user_role(self.request.user)
        if role == "manager":
            return qs
        if role == "service":
            return qs.filter(machine__service_org=self.request.user)
        if role == "client":
            return qs.filter(machine__client=self.request.user)
        return qs.none()

    def get_queryset(self):
        return self._restrict_by_role(super().get_queryset()).order_by("machine__serial_number", "-date")

    def _ensure_can_create_for_machine(self, machine):
        role = get_user_role(self.request.user)
        if role == "manager":
            return
        if role == "service":
            if machine.service_org_id != self.request.user.id:
                raise PermissionDenied(
                    "Эта машина не относится к вашей сервисной организации.")
            return
        if role == "client":
            if machine.client_id != self.request.user.id:
                raise PermissionDenied(
                    "Эта машина не относится к вам как к клиенту.")
            return
        raise PermissionDenied("Недостаточно прав.")

    def _ensure_can_modify(self, instance):
        role = get_user_role(self.request.user)
        if role == "manager":
            return
        if role == "service" and instance.machine.service_org_id == self.request.user.id:
            return

    def perform_update(self, serializer):
        instance = self.get_object()
        role = get_user_role(self.request.user)
        if role == "client":
            raise PermissionDenied(
                "Клиент не может изменять записи ТО (только добавлять).")
        serializer.validated_data.pop("machine", None)
        self._ensure_can_modify(instance)
        serializer.save()

    def perform_destroy(self, instance):
        self._ensure_can_modify(instance)
        super().perform_destroy(instance)

    @action(detail=False, methods=["get"])
    def facets(self, request):
        qs = self.get_queryset()
        data = {
            "maintenance_type": list(qs.values_list("maintenance_type__id", "maintenance_type__name").distinct().order_by("maintenance_type__name")),
            "machine_serial": list(qs.values_list("machine__serial_number", flat=True).distinct().order_by("machine__serial_number")),
            "service_company": list(qs.values_list("service_company", flat=True).exclude(service_company="").distinct().order_by("service_company")),
        }
        return Response(data)


class ClaimViewSet(viewsets.ModelViewSet):
    queryset = Claim.objects.select_related(
        'machine').order_by('-failure_date')
    serializer_class = ClaimSerializer
    permission_classes = [DjangoModelPermissionsOrAnonReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]

    filterset_fields = {
        "failure_node": ["exact", "icontains"],
        "recovery_method": ["icontains"],
        "machine__serial_number": ["exact"],
        "machine__service_company": ["exact", "icontains"],
    }

    ordering_fields = ["failure_date", "downtime_hours", "operating_hours"]

    def get_serializer_class(self):
        return ClaimWriteSerializer if self.request.method in ("POST", "PUT", "PATCH") else ClaimSerializer

    def _restrict_by_role(self, qs):
        role = get_user_role(self.request.user)
        if role == "manager":
            return qs
        if role == "service":
            return qs.filter(machine__service_org=self.request.user)
        if role == "client":
            return qs.filter(machine__client=self.request.user)
        return qs.none()

    def get_queryset(self):
        return self._restrict_by_role(super().get_queryset()).order_by("machine__serial_number", "-failure_date")

    def _ensure_can_modify(self, machine):
        role = get_user_role(self.request.user)
        if role == "manager":
            return
        if role == "service" and machine.service_org_id == self.request.user.id:
            return
        raise PermissionDenied(
            "Недостаточно прав для создания/изменения рекламации.")

    def perform_create(self, serializer):
        self._ensure_can_modify(serializer.validated_data["machine"])
        serializer.save()

    def perform_update(self, serializer):
        instance = self.get_object()
        serializer.validated_data.pop("machine", None)
        self._ensure_can_modify(instance.machine)
        serializer.save()

    def perform_destroy(self, instance):
        self._ensure_can_modify(instance.machine)
        super().perform_destroy(instance)

    @action(detail=False, methods=["get"])
    def facets(self, request):
        qs = self.get_queryset()
        data = {
            "failure_node": list(
                qs.values_list("failure_node", flat=True)
                  .exclude(failure_node="")
                  .distinct().order_by("failure_node")
            ),
            "machine_serial": list(
                qs.values_list("machine__serial_number", flat=True)
                  .distinct().order_by("machine__serial_number")
            ),
            "service_company": list(
                qs.values_list("machine__service_company", flat=True)
                  .exclude(machine__service_company="")
                  .distinct().order_by("machine__service_company")
            ),
        }
        return Response(data)


class MachineSearchView(ListAPIView):
    """
    GET /api/search?q=...
    Возвращает список машин (MachineListSerializer) по запросу q.
    """
    serializer_class = MachineAnonSerializer
    permission_classes = [DjangoModelPermissionsOrAnonReadOnly]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='q',
                type=OpenApiTypes.STR,
                required=True,
                description='Строка поиска: серийный номер (только цифры) или часть текста (модель, двигатель, покупатель и т.п.)'
            )
        ],
        responses=MachineListSerializer(many=True),
        summary="Поиск машин"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        q = self.request.query_params.get('q', '').strip()
        if not q:
            raise ValidationError(
                {'q': 'Введите строку поиска (параметр ?q=...)'})

        qs = Machine.objects.all()

        if q.isdigit():
            qs = qs.filter(serial_number=q)
        else:
            qs = qs.filter(
                Q(model_name__icontains=q) |
                Q(engine_model__icontains=q) |
                Q(engine_serial__icontains=q) |
                Q(transmission_model__icontains=q) |
                Q(transmission_serial__icontains=q) |
                Q(buyer__icontains=q) |
                Q(recipient__icontains=q) |
                Q(delivery_address__icontains=q) |
                Q(service_company__icontains=q)
            )

        role = get_user_role(self.request.user)
        if role == "service":
            qs = qs.filter(service_org=self.request.user)
        elif role == "client":
            qs = qs.filter(client=self.request.user)

        return qs.annotate(
            maintenance_count=Count('maintenance', distinct=True),
            claims_count=Count('claim', distinct=True),
        ).order_by('serial_number')


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    u = request.user
    return Response({
        "id": u.id,
        "username": u.username,
        "first_name": u.first_name,
        "last_name": u.last_name,
        "is_staff": u.is_staff,
        "groups": list(u.groups.values_list("name", flat=True)),
    })
