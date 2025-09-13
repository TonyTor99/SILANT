from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from rest_framework_simplejwt.views import (
    TokenObtainPairView, TokenRefreshView, TokenVerifyView
)

from core.views import health
from equipment.views import MachineViewSet, MaintenanceTypeViewSet, MaintenanceViewSet, ClaimViewSet, MachineSearchView, me

router = DefaultRouter()
router.register(r'machines', MachineViewSet, basename='machines')
router.register(r'maintenance-types', MaintenanceTypeViewSet,
                basename='maintenance-types')
router.register(r'maintenance', MaintenanceViewSet, basename='maintenance')
router.register(r'claims', ClaimViewSet, basename='claims')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health', health),

    path('api/', include(router.urls)),
    path('api/search', MachineSearchView.as_view(), name='machine-search'),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema')),
    
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path("api/me/", me),
]
