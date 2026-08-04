from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import AnonRateThrottle
from .serializers import CalculateDutySerializer
from .services import calculate_duty, CalculationError

class CalculateDutyView(APIView):
    throttle_classes = [AnonRateThrottle]

    def post(self, request, *args, **kwargs):
        serializer = CalculateDutySerializer(data=request.data)
        if serializer.is_valid():
            try:
                result = calculate_duty(
                    hs_code=serializer.validated_data['hs_code'],
                    product_price=serializer.validated_data['product_price'],
                    shipping_cost=serializer.validated_data['shipping_cost'],
                    insurance=serializer.validated_data['insurance'],
                    quantity=serializer.validated_data.get('quantity', 1),
                    currency=serializer.validated_data['currency']
                )
                return Response(result, status=status.HTTP_200_OK)
            except CalculationError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
