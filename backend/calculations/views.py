from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import SavedCalculation, ImportHistory
from .serializers import CalculationEstimateRequestSerializer, SavedCalculationSerializer
from .services.calculation_engine import DutyCalculationEngine
from .services.validation_service import ValidationError

class CalculationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling Duty Calculations.
    """
    serializer_class = SavedCalculationSerializer
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return SavedCalculation.objects.filter(user=self.request.user)
        return SavedCalculation.objects.none()

    def get_permissions(self):
        if self.action in ['estimate']:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def estimate(self, request):
        """
        Calculates the duty estimate without saving to the database.
        """
        serializer = CalculationEstimateRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            calc_req = serializer.to_calculation_request()
            result = DutyCalculationEngine.calculate(calc_req)
            return Response(result.to_dict(), status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({"errors": e.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"errors": [str(e)]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def save_estimate(self, request):
        """
        Calculates and saves the estimate to the user's account.
        """
        serializer = CalculationEstimateRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            calc_req = serializer.to_calculation_request()
            result = DutyCalculationEngine.calculate(calc_req)
            
            # Save it
            saved = SavedCalculation.objects.create(
                user=request.user,
                product=calc_req.product,
                hs_code=calc_req.hs_code,
                country=calc_req.country_of_origin,
                currency=calc_req.currency,
                trade_agreement=calc_req.trade_agreement,
                duty_exemption=calc_req.duty_exemption,
                
                product_price=calc_req.product_value,
                shipping_cost=calc_req.shipping_cost,
                insurance_cost=calc_req.insurance_cost,
                quantity=calc_req.quantity,
                exchange_rate_used=result.exchange_rate_used,
                
                total_customs_value=result.total_customs_value,
                total_import_duty=result.total_import_duty,
                total_vat=result.total_vat,
                total_surtax=result.total_surtax,
                total_excise=result.total_excise,
                total_carbon_tax=result.total_carbon_tax,
                other_charges=result.other_charges,
                grand_total=result.grand_total
            )
            
            # Add to history
            ImportHistory.objects.create(
                user=request.user,
                saved_calculation=saved,
                notes=request.data.get('notes', '')
            )
            
            response_data = result.to_dict()
            response_data['saved_id'] = saved.id
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except ValidationError as e:
            return Response({"errors": e.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"errors": [str(e)]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
