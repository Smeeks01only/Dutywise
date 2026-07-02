from rest_framework import viewsets, generics, views
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Q
from django.contrib.contenttypes.models import ContentType

from products.models import Product, HSCode, Category
from tariffs.models import TariffRate, ImportRestriction
from customs.models import GovernmentAgency, TradeAgreement, CustomsGlossaryTerm, UserBookmark, RecentlyViewedItem
from customs.serializers import (
    ProductSerializer, HSCodeSerializer, CategorySerializer,
    ImportRestrictionSerializer, GovernmentAgencySerializer, TradeAgreementSerializer,
    CustomsGlossaryTermSerializer, UserBookmarkSerializer, RecentlyViewedItemSerializer,
    TariffRateSerializer
)

class ExplorerHomeView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        stats = {
            'hscodes': HSCode.objects.filter(status='Active').count(),
            'products': Product.objects.filter(status='Active').count(),
            'categories': Category.objects.filter(status='Active').count(),
            'countries': 50 # Or Country.objects.count() if we want it dynamic
        }

        popular_categories = CategorySerializer(
            Category.objects.filter(status='Active')[:6], many=True
        ).data

        popular_products = ProductSerializer(
            Product.objects.filter(status='Active').order_by('-popularity_score')[:8], many=True
        ).data

        return Response({
            'stats': stats,
            'popular_categories': popular_categories,
            'popular_products': popular_products
        })

class ExplorerHSCodeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HSCode.objects.filter(status='Active').select_related('parent')
    serializer_class = HSCodeSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        level = self.request.query_params.get('level')
        parent = self.request.query_params.get('parent')
        chapter = self.request.query_params.get('chapter')

        if level == 'chapter':
            # Chapters are HS codes with 2 digits usually, or where heading is null
            qs = qs.filter(heading__isnull=True)
        if parent:
            qs = qs.filter(parent_id=parent)
        if chapter:
            qs = qs.filter(chapter=chapter)

        return qs

class ExplorerCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(status='Active')
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        parent = self.request.query_params.get('parent')
        if parent == 'null':
            qs = qs.filter(parent_category__isnull=True)
        elif parent:
            qs = qs.filter(parent_category_id=parent)
        return qs

class ExplorerProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(status='Active').select_related('category', 'hs_code')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category_id=category)
        return qs

class ExplorerTariffViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TariffRate.objects.filter(status='Active').select_related('hs_code', 'country')
    serializer_class = TariffRateSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        tariff_type = self.request.query_params.get('type')
        hs_code = self.request.query_params.get('hs_code')
        if tariff_type:
            qs = qs.filter(tariff_type=tariff_type)
        if hs_code:
            qs = qs.filter(hs_code_id=hs_code)
        return qs

class ExplorerRestrictionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ImportRestriction.objects.all().select_related('government_agency', 'hs_code')
    serializer_class = ImportRestrictionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        hs_code = self.request.query_params.get('hs_code')
        if hs_code:
            qs = qs.filter(hs_code_id=hs_code)
        return qs

class ExplorerAgencyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GovernmentAgency.objects.all()
    serializer_class = GovernmentAgencySerializer
    permission_classes = [AllowAny]

class ExplorerAgreementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TradeAgreement.objects.all().prefetch_related('countries_covered')
    serializer_class = TradeAgreementSerializer
    permission_classes = [AllowAny]

class ExplorerGlossaryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CustomsGlossaryTerm.objects.all()
    serializer_class = CustomsGlossaryTermSerializer
    permission_classes = [AllowAny]

class ExplorerSearchView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response([])

        # Simple cross-model search
        products = Product.objects.filter(name__icontains=query, status='Active')[:5]
        hscodes = HSCode.objects.filter(Q(code__icontains=query) | Q(description__icontains=query), status='Active')[:5]
        categories = Category.objects.filter(name__icontains=query, status='Active')[:5]
        glossary = CustomsGlossaryTerm.objects.filter(Q(term__icontains=query) | Q(definition__icontains=query))[:5]

        results = []
        for p in products:
            results.append({'id': p.id, 'title': p.name, 'subtitle': p.hs_code.code, 'type': 'Product'})
        for h in hscodes:
            results.append({'id': h.id, 'title': h.code, 'subtitle': h.description[:100], 'type': 'HSCode'})
        for c in categories:
            results.append({'id': c.id, 'title': c.name, 'subtitle': c.description, 'type': 'Category'})
        for g in glossary:
            results.append({'id': g.id, 'title': g.term, 'subtitle': g.definition[:100], 'type': 'Glossary'})

        return Response(results)

class UserBookmarkViewSet(viewsets.ModelViewSet):
    serializer_class = UserBookmarkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserBookmark.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class RecentlyViewedItemViewSet(viewsets.ModelViewSet):
    serializer_class = RecentlyViewedItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return RecentlyViewedItem.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ct = serializer.validated_data['content_type']
        obj_id = serializer.validated_data['object_id']
        
        item, created = RecentlyViewedItem.objects.update_or_create(
            user=request.user,
            content_type=ct,
            object_id=obj_id,
            defaults={}
        )
        # update_or_create saves it, we just return
        res_serializer = self.get_serializer(item)
        return Response(res_serializer.data, status=201 if created else 200)
