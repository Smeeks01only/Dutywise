from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .explorer_views import (
    ExplorerHomeView, ExplorerHSCodeViewSet, ExplorerCategoryViewSet,
    ExplorerProductViewSet, ExplorerRestrictionViewSet, ExplorerAgencyViewSet,
    ExplorerAgreementViewSet, ExplorerGlossaryViewSet, ExplorerSearchView,
    UserBookmarkViewSet, RecentlyViewedItemViewSet, ExplorerTariffViewSet
)

router = DefaultRouter()
router.register(r'hscodes', ExplorerHSCodeViewSet, basename='explorer-hscodes')
router.register(r'categories', ExplorerCategoryViewSet, basename='explorer-categories')
router.register(r'products', ExplorerProductViewSet, basename='explorer-products')
router.register(r'tariffs', ExplorerTariffViewSet, basename='explorer-tariffs')
router.register(r'restrictions', ExplorerRestrictionViewSet, basename='explorer-restrictions')
router.register(r'agencies', ExplorerAgencyViewSet, basename='explorer-agencies')
router.register(r'agreements', ExplorerAgreementViewSet, basename='explorer-agreements')
router.register(r'glossary', ExplorerGlossaryViewSet, basename='explorer-glossary')
router.register(r'bookmarks', UserBookmarkViewSet, basename='explorer-bookmarks')
router.register(r'recent', RecentlyViewedItemViewSet, basename='explorer-recent')

urlpatterns = [
    path('home/', ExplorerHomeView.as_view(), name='explorer-home'),
    path('search/', ExplorerSearchView.as_view(), name='explorer-search'),
    path('', include(router.urls)),
]
