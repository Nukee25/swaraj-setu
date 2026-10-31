from rest_framework import serializers


class SmartPreviewSerializer(serializers.Serializer):
    text = serializers.CharField(min_length=10, max_length=10000)


class LocationSerializer(serializers.Serializer):
    lat = serializers.FloatField(min_value=-90, max_value=90)
    lng = serializers.FloatField(min_value=-180, max_value=180)


class ComplaintCreateSerializer(serializers.Serializer):
    title = serializers.CharField(min_length=3, max_length=180)
    description = serializers.CharField(min_length=10, max_length=10000)
    location = LocationSerializer()
    classification = serializers.DictField(required=False)
    media = serializers.ListField(child=serializers.CharField(max_length=35_000_000), required=False, allow_empty=True)


class StatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=["Pending", "In Progress", "Resolved"])
    resolution_notes = serializers.CharField(required=False, allow_blank=True, max_length=5000)
