from django.contrib import admin
from .models import Host, HostListingsCount, Neighbourhood, Listing, ListingCategorical, Availability, MinMaxNight, ListingReviews, Review, Calendar

# Register your models here.
admin.site.register(Host)
admin.site.register(HostListingsCount)
admin.site.register(Neighbourhood)
admin.site.register(Listing)
admin.site.register(ListingCategorical)
admin.site.register(Availability)
admin.site.register(MinMaxNight)
admin.site.register(ListingReviews)
admin.site.register(Review)
admin.site.register(Calendar)
