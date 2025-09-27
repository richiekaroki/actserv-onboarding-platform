# ==== backend/forms/permissions.py =====
from rest_framework.permissions import SAFE_METHODS, BasePermission


# Custom permission classes for the forms app
class IsAdminUserOrReadOnly(BasePermission):
    """
    Allow read-only access for all users,
    but restrict write access to admin users.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

# Custom permission class to allow only admin users full access


class IsAdminUserOnly(BasePermission):
    """
    Only allow admin users full access.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_staff
