"""
URL configuration for swaraj_setu project.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from grievances import views as grievance_views

# Create a router and register viewsets
router = DefaultRouter()

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(router.urls)),
    path('api/v1/grievances/', include('grievances.urls')),
    path('api-auth/', include('rest_framework.urls')),
    path('api/health/', grievance_views.HealthCheckView.as_view(), name='health-check'),
]
