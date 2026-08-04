from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q, Count, Case, When, Value, IntegerField
from .models import HSCode, TariffCategory
from .serializers import HSCodeSearchSerializer, TariffCategorySerializer

class SearchView(APIView):
    def get(self, request, *args, **kwargs):
        query = request.query_params.get('q', '').strip()
        
        if not query:
            return Response([])

        # Filter: match name, code, search_aliases, or category name
        q_objects = (
            Q(name__icontains=query) |
            Q(code__icontains=query) |
            Q(search_aliases__icontains=query) |
            Q(category__name__icontains=query)
        )

        # Ordering heuristic:
        # 1. Exact name match
        # 2. Exact code match
        # 3. Contains in alias
        # 4. Partial match in name/category
        
        results = HSCode.objects.filter(q_objects).annotate(
            match_rank=Case(
                When(name__iexact=query, then=Value(1)),
                When(code__iexact=query, then=Value(2)),
                When(search_aliases__icontains=query, then=Value(3)),
                default=Value(4),
                output_field=IntegerField(),
            )
        ).select_related('category').order_by('match_rank', 'name')[:20]

        serializer = HSCodeSearchSerializer(results, many=True)
        return Response(serializer.data)

class CategoryListView(APIView):
    def get(self, request, *args, **kwargs):
        categories = TariffCategory.objects.annotate(
            hs_code_count=Count('hs_codes')
        ).order_by('name')
        
        serializer = TariffCategorySerializer(categories, many=True)
        return Response(serializer.data)
