# SwissHacks CLI Guidelines

## Build Commands
- Frontend: `npm run dev` (develop), `npm run build` (production)
- Backend: `uvicorn app.main:app --reload` (develop)
- Docker: `docker compose up -d` (start all services)

## Lint & Test Commands
- Frontend: `npm run lint` (lint), `npm run typecheck` (type check)
- Backend: `pytest` (all tests), `pytest path/to/test.py::test_function` (single test)

## Code Style
- TypeScript: Strict types, functional React components, interface-based types
- Python: PEP 8, type hints, docstrings, organized imports (stdlib → third-party → local)
- Error handling: Try/catch blocks, specific exceptions, detailed error messages
- Naming: camelCase (TS), snake_case (Python), PascalCase for React components
- Testing: Unit tests for core logic, integration tests for API endpoints

## Infrastructure
- AWS deployment via Terraform
- Frontend on S3/CloudFront, Backend on ECS/Fargate
- Database on RDS PostgreSQL