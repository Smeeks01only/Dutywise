# DutyWise Zimbabwe

A Zimbabwe Import Duty & Customs Calculator.

## Project Overview

DutyWise Zimbabwe helps individuals and businesses estimate import duties, VAT, surtax, excise duty, and other customs charges when importing goods into Zimbabwe.

This repository contains the foundation for both the frontend and backend applications.

## Architecture

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router.
- **Backend**: Django, Django REST Framework, PostgreSQL, JWT Authentication.
- **Infrastructure**: Docker & Docker Compose.

## Database Schema Design

The database schema is heavily normalized to support flexible configurations and accurate tariff calculations.
- **Core**: Contains `Country` and `Currency` definitions.
- **Products**: Stores hierarchical `Category` records, standard `HSCode` details, and searchable `Product` configurations.
- **Tariffs**: Connects `HSCode` and `Country` to customs percentages in `TariffRate`, and handles rules in `ImportRestriction`.
- **Exchange Rates**: Periodically updated `ExchangeRate` definitions from base to target currencies.
- **Calculations**: Stores financial inputs and tax outputs logically separated from mutable product details in `SavedCalculation` and `ImportHistory`.
- **Dashboard**: Simple profile relations such as `FavoriteProduct`.

All application models derive from a common UUID base for IDs, soft-delete boolean flags (`is_active`), and timestamps (`created_at`, `updated_at`).

## Folder Structure

- `/frontend` - Contains the React Vite application.
- `/backend` - Contains the Django application.

## Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local frontend development without Docker)
- Python 3.12+ (for local backend development without Docker)

## How to Install & Run (Docker)

To run the entire stack (Frontend, Backend, and PostgreSQL) using Docker:

1. Clone the repository.
2. Copy `.env.example` to `.env` in both `frontend` and `backend` directories.
3. Run the following command in the root directory:

```bash
docker-compose up --build
```

- Frontend will be available at `http://localhost:5173`
- Backend API will be available at `http://localhost:8000/api/v1/`
- Backend Health Check: `http://localhost:8000/api/v1/health/`
- Admin Panel: `http://localhost:8000/admin/`

## Environment Variables

Check the `.env.example` files in both the `frontend` and `backend` directories for required environment variables.

## Future Roadmap

- Duty Calculator implementation
- Product & HS Code Search
- Tariff Explorer
- Import Cost Simulator
- Exchange Rates integration
- Import Rules details
- User Accounts & Dashboard
- AI Assistant features
- PDF Export of calculations
