from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from mongoengine import ValidationError, NotUniqueError
from ..models import Grievance, GrievanceUpdate
from ..serializers import GrievanceSerializer, GrievanceUpdateSerializer


class HealthCheckView(APIView):
    """API health check endpoint."""
    
    def get(self, request):
        return Response({
            'status': 'ok',
            'message': 'Backend is running'
        }, status=status.HTTP_200_OK)

