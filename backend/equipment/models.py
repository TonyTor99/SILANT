from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator


class Machine(models.Model):
    model_name = models.CharField(
        max_length=100, verbose_name="Модель техники")
    serial_number = models.CharField(
        max_length=32,
        unique=True,
        db_index=True,
        validators=[RegexValidator(r'^\d+$', message='Только цифры')],
        verbose_name="Зав. № машины",
    )

    engine_model = models.CharField(
        max_length=100, blank=True, verbose_name="Модель двигателя")
    engine_serial = models.CharField(
        max_length=100, blank=True, verbose_name="Зав. № двигателя")

    transmission_model = models.CharField(
        max_length=150, blank=True, verbose_name="Модель трансмиссии")
    transmission_serial = models.CharField(
        max_length=100, blank=True, verbose_name="Зав. № трансмиссии")

    drive_axle_model = models.CharField(
        max_length=100, blank=True, verbose_name="Модель ведущего моста")
    drive_axle_serial = models.CharField(
        max_length=100, blank=True, verbose_name="Зав. № ведущего моста")

    steer_axle_model = models.CharField(
        max_length=100, blank=True, verbose_name="Модель управляемого моста")
    steer_axle_serial = models.CharField(
        max_length=100, blank=True, verbose_name="Зав. № управляемого моста")

    shipment_date = models.DateField(
        null=True, blank=True, verbose_name="Дата отгрузки с завода")
    buyer = models.CharField(max_length=255, blank=True,
                             verbose_name="Покупатель (организация)")
    recipient = models.CharField(
        max_length=255, blank=True, verbose_name="Грузополучатель (конечный потребитель)")
    delivery_address = models.CharField(
        max_length=255, blank=True, verbose_name="Адрес поставки")
    options = models.TextField(
        blank=True, verbose_name="Комплектация (доп. опции)")
    service_company = models.CharField(
        max_length=255, blank=True, verbose_name="Сервисная компания")

    client = models.ForeignKey(
        User, null=True, blank=True, related_name="machines_as_client",
        on_delete=models.SET_NULL, verbose_name="Клиент"
    )
    service_org = models.ForeignKey(
        User, null=True, blank=True, related_name="machines_as_service",
        on_delete=models.SET_NULL, verbose_name="Сервисная организация"
    )

    class Meta:
        ordering = ["serial_number"]
        verbose_name = "Машина"
        verbose_name_plural = "Машины"

    def __str__(self):
        return f"{self.model_name} #{self.serial_number}"


class MaintenanceType(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Вид ТО")

    class Meta:
        ordering = ["name"]
        verbose_name = "Вид ТО"
        verbose_name_plural = "Виды ТО"

    def __str__(self):
        return self.name


class Maintenance(models.Model):
    machine = models.ForeignKey(
        Machine, on_delete=models.CASCADE, verbose_name="Зав. № машины")
    maintenance_type = models.ForeignKey(
        MaintenanceType, on_delete=models.CASCADE, verbose_name="Вид ТО")
    date = models.DateField(null=True, blank=True,
                            verbose_name="Дата проведения ТО")
    operating_hours = models.PositiveIntegerField(
        null=True, blank=True, verbose_name="Наработка, м/час")
    order_number = models.CharField(
        max_length=100, blank=True, verbose_name="№ заказ-наряда")
    order_date = models.DateField(
        null=True, blank=True, verbose_name="Дата заказ-наряда")
    service_company = models.CharField(
        max_length=255, blank=True, verbose_name="Организация, проводившая ТО")

    class Meta:
        ordering = ["-date", "machine__serial_number"]
        verbose_name = "ТО"
        verbose_name_plural = "ТО"

    def __str__(self):
        return f"ТО {self.maintenance_type} — {self.machine}"


class Claim(models.Model):
    machine = models.ForeignKey(
        Machine, on_delete=models.CASCADE, verbose_name="Зав. № машины")
    failure_date = models.DateField(
        null=True, blank=True, verbose_name="Дата отказа")
    operating_hours = models.PositiveIntegerField(
        null=True, blank=True, verbose_name="Наработка, м/час")
    failure_node = models.CharField(
        max_length=255, blank=True, verbose_name="Узел отказа")
    failure_description = models.TextField(
        blank=True, verbose_name="Описание отказа")
    recovery_method = models.TextField(
        blank=True, verbose_name="Способ восстановления")
    used_spare = models.TextField(
        null=True, blank=True, verbose_name="Использованные запчасти")
    restored_date = models.DateField(
        null=True, blank=True, verbose_name="Дата восстановления")
    downtime_hours = models.PositiveIntegerField(
        null=True, blank=True, verbose_name="Время простоя (часов)")

    class Meta:
        ordering = ["-failure_date", "machine__serial_number"]
        verbose_name = "Рекламация"
        verbose_name_plural = "Рекламации"

    def __str__(self):
        return f"Рекламация {self.machine} ({self.failure_date})"
