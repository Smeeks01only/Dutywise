from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, 
    SavedCalculationListCreateView, 
    SavedCalculationDestroyView,
    UserProfileView,
    ChangePasswordView
)

urlpatterns = [
    # Auth endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile endpoints
    path('auth/me/', UserProfileView.as_view(), name='user-profile'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    
    # Saved calculations
    path('calculations/', SavedCalculationListCreateView.as_view(), name='calculation-list-create'),
    path('calculations/<int:pk>/', SavedCalculationDestroyView.as_view(), name='calculation-delete'),
]
