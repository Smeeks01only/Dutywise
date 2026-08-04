from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ExchangeRate
from .serializers import ExchangeRateSerializer

class ExchangeRateListView(APIView):
    def get(self, request, *args, **kwargs):
        latest_rates = []
        # We only want the absolute latest rate for each supported target currency
        for target in [choice[0] for choice in ExchangeRate.TARGET_CURRENCIES]:
            latest = ExchangeRate.objects.filter(
                base_currency='USD', 
                target_currency=target
            ).order_by('-fetched_at').first()
            
            if latest:
                latest_rates.append(latest)
        
        serializer = ExchangeRateSerializer(latest_rates, many=True)
        return Response(serializer.data)
