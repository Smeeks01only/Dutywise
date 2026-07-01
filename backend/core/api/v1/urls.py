from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HealthCheckView
from products.views import SearchAPIView
from customs.views import ProductViewSet, HSCodeViewSet, CategoryViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='v1-product')
router.register(r'hs-codes', HSCodeViewSet, basename='v1-hscode')
router.register(r'categories', CategoryViewSet, basename='v1-category')

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('search/', SearchAPIView.as_view(), name='v1-search'),
    path('', include(router.urls)),
]
