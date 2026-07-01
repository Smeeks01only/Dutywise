from django.db.models import Q, Case, When, Value, IntegerField, F
from django.db.models.functions import Coalesce
from products.models import Product, HSCode, Category

class SearchService:
    @staticmethod
    def search_products(query, limit=20):
        if not query:
            return Product.objects.filter(is_active=True).order_by('-popularity_score', '-search_weight', 'name')[:limit]

        q = query.strip()
        
        products = Product.objects.filter(
            Q(name__icontains=q) |
            Q(hs_code__code__icontains=q) |
            Q(keywords__icontains=q) |
            Q(brand_names__icontains=q) |
            Q(alternative_names__icontains=q) |
            Q(description__icontains=q)
        ).filter(is_active=True)

        products = products.annotate(
            score=Case(
                When(name__iexact=q, then=Value(100)),
                When(hs_code__code__iexact=q, then=Value(90)),
                When(name__istartswith=q, then=Value(75)),
                When(Q(keywords__icontains=q) | Q(brand_names__icontains=q) | Q(alternative_names__icontains=q), then=Value(50)),
                When(name__icontains=q, then=Value(40)),
                When(description__icontains=q, then=Value(20)),
                default=Value(0),
                output_field=IntegerField()
            )
        )
        
        return products.order_by('-score', '-search_weight', '-popularity_score', 'name')[:limit]

    @staticmethod
    def search_hs_codes(query, limit=20):
        if not query:
            return HSCode.objects.filter(is_active=True)[:limit]

        q = query.strip()
        
        hs_codes = HSCode.objects.filter(
            Q(code__icontains=q) |
            Q(description__icontains=q) |
            Q(section__icontains=q) |
            Q(chapter__icontains=q) |
            Q(heading__icontains=q) |
            Q(subheading__icontains=q)
        ).filter(is_active=True)

        hs_codes = hs_codes.annotate(
            score=Case(
                When(code__iexact=q, then=Value(100)),
                When(code__istartswith=q, then=Value(80)),
                When(description__icontains=q, then=Value(40)),
                default=Value(20),
                output_field=IntegerField()
            )
        )
        
        return hs_codes.order_by('-score', 'code')[:limit]

    @staticmethod
    def search_categories(query, limit=10):
        if not query:
            return Category.objects.filter(is_active=True).order_by('name')[:limit]
            
        q = query.strip()
        
        categories = Category.objects.filter(
            Q(name__icontains=q) |
            Q(description__icontains=q)
        ).filter(is_active=True)
        
        categories = categories.annotate(
            score=Case(
                When(name__iexact=q, then=Value(100)),
                When(name__istartswith=q, then=Value(80)),
                When(name__icontains=q, then=Value(40)),
                default=Value(20),
                output_field=IntegerField()
            )
        )
        
        return categories.order_by('-score', 'name')[:limit]

    @staticmethod
    def global_search(query):
        return {
            'products': SearchService.search_products(query, limit=5),
            'hs_codes': SearchService.search_hs_codes(query, limit=5),
            'categories': SearchService.search_categories(query, limit=3)
        }
