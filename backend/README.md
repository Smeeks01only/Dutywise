# DutyWise Backend

This is the Django backend for DutyWise Zimbabwe.

## Local Setup

1. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables:**
   - Copy `.env.example` to `.env`
   - Update `DATABASE_URL` with your local PostgreSQL credentials.

4. **Run Migrations:**
   ```bash
   python manage.py migrate
   ```

5. **Start the Development Server:**
   ```bash
   python manage.py runserver
   ```

## API Documentation

| Endpoint | Method | Auth Required | Description |
|---|---|---|---|
| `/api/calculate/` | `POST` | No | Calculates full duty, taxes, and CIF value from inputs. |
| `/api/search/?q=<query>` | `GET` | No | Searches HS Codes across names, codes, aliases, and categories. |
| `/api/categories/` | `GET` | No | Lists all tariff categories with HS Code counts. |
| `/api/exchange-rates/` | `GET` | No | Fetches the latest system exchange rates. |
| `/api/auth/register/` | `POST` | No | Registers a new user account (email, password). |
| `/api/auth/login/` | `POST` | No | Authenticates a user and returns JWT access/refresh tokens. |
| `/api/auth/refresh/` | `POST` | No | Refreshes an expired access token. |
| `/api/calculations/` | `POST` | **Yes** | Saves a calculation result to the authenticated user's history. |
| `/api/calculations/` | `GET` | **Yes** | Retrieves a paginated list of the user's saved calculations. |
| `/api/calculations/<id>/` | `DELETE` | **Yes** | Deletes a specific saved calculation owned by the user. |
| `/api/auth/me/` | `GET` | **Yes** | Retrieves the authenticated user's profile details. |
| `/api/auth/me/` | `PATCH` | **Yes** | Updates the authenticated user's profile (e.g. email). |
| `/api/auth/change-password/` | `POST` | **Yes** | Changes the authenticated user's password securely. |
