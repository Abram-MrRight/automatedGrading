from rest_framework.response import Response
from functools import wraps

def role_required(required_role):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(self, request, *args, **kwargs):
            user_role = request.user.groups.values_list('name', flat=True).first()
            if user_role != required_role:
                return Response({'error': 'Access Denied'}, status=403)
            return view_func(self, request, *args, **kwargs)
        return _wrapped_view
    return decorator
