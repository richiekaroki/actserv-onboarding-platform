from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def register_client(request):
    """
    Client registration endpoint
    """
    try:
        data = request.data
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return Response(
                {"error": "Email and password are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already exists
        if User.objects.filter(email=data['email']).exists():
            return Response(
                {"error": "User with this email already exists"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create client user
        user = User.objects.create_user(
            username=data['email'],
            email=data['email'],
            password=data['password'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            role='client'  # Set role as client
        )
        
        return Response({
            "message": "Client registered successfully",
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )