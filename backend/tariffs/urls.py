from django.urls import path
from .views import SearchView, CategoryListView

urlpatterns = [
    path('search/', SearchView.as_view(), name='search'),
    path('categories/', CategoryListView.as_view(), name='categories'),
]
