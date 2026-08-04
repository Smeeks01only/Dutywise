"""
URL configuration for dutywise_backend project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('calculator.urls')),
    path('api/', include('tariffs.urls')),
    path('api/', include('exchange.urls')),
    path('api/', include('accounts.urls')),
]
