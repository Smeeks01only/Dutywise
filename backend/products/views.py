from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from customs.serializers import ProductSerializer, HSCodeSerializer, CategorySerializer
from .services.search_service import SearchService

class SearchAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        query = request.query_params.get('q', '')
        
        results = SearchService.global_search(query)
        
        return Response({
            'products': ProductSerializer(results['products'], many=True).data,
            'hs_codes': HSCodeSerializer(results['hs_codes'], many=True).data,
            'categories': CategorySerializer(results['categories'], many=True).data,
        })
