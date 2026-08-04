from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework import generics
from .models import SavedCalculation
from .serializers import (
    RegisterSerializer, 
    SavedCalculationSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer
)

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class SavedCalculationListCreateView(generics.ListCreateAPIView):
    serializer_class = SavedCalculationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        # Only return the logged-in user's calculations
        return SavedCalculation.objects.filter(user=self.request.user)

class SavedCalculationDestroyView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk, format=None):
        try:
            calculation = SavedCalculation.objects.get(pk=pk)
        except SavedCalculation.DoesNotExist:
            return Response({"error": "Calculation not found."}, status=status.HTTP_404_NOT_FOUND)

        # Explicitly check ownership so we can return 403 rather than relying on get_queryset hiding it
        if calculation.user != request.user:
            return Response({"error": "You do not have permission to delete this calculation."}, status=status.HTTP_403_FORBIDDEN)
        
        calculation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data.get("current_password")):
                return Response({"current_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(serializer.validated_data.get("new_password"))
            user.save()
            return Response({"message": "Password updated successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
