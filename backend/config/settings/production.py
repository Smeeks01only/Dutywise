from .base import *

DEBUG = False

# Ensure you have secure settings in production
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
# SECURE_SSL_REDIRECT = True # Uncomment if using SSL
# SESSION_COOKIE_SECURE = True # Uncomment if using SSL
# CSRF_COOKIE_SECURE = True # Uncomment if using SSL
