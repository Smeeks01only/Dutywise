from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('core.api.v1.urls')),
    path('api/auth/', include('accounts.urls')),
    path('api/customs/', include('customs.urls')),
    path('api/calculations/', include('calculations.urls')),
    path('api/admin/', include('customs.admin_urls')),
    path('api/explorer/', include('customs.explorer_urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
