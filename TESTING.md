# CI/CD and Testing Setup

This document describes the continuous integration and testing infrastructure for the AI Job Matcher project.

## Overview

The project uses:
- **GitHub Actions** for CI/CD pipelines
- **Vitest + React Testing Library** for frontend testing
- **Jest + Supertest** for backend API testing
- **Pytest** for ML service testing

## Running Tests Locally

### Frontend (Client)
```bash
cd client
npm install
npm test              # Run tests once
npm run test:ui       # Run with UI
npm run test:coverage # Generate coverage report
```

### Backend (Server)
```bash
cd server
npm install
npm test              # Run tests once
npm run test:watch    # Watch mode
npm run test:coverage # Generate coverage report
```

### ML Service
```bash
cd ml-service
pip install -r requirements.txt
python -m spacy download en_core_web_sm
pytest                # Run all tests
pytest --cov=.       # With coverage
```

## CI/CD Pipeline

### Workflows

#### 1. Main CI Pipeline (`.github/workflows/ci.yml`)
Runs on every push and pull request to `main` and `develop` branches.

**Jobs:**
- `test-client`: Lints, tests, and builds the React frontend
- `test-server`: Tests the Node.js backend with PostgreSQL
- `test-ml-service`: Tests the Python ML service
- `deploy-staging`: Deploys to staging (on develop branch)
- `deploy-production`: Deploys to production (on main branch)
- `security-scan`: Runs Trivy vulnerability scanner

#### 2. Security Audit (`.github/workflows/security.yml`)
Runs weekly and can be triggered manually.

**Jobs:**
- `npm-audit`: Checks for npm package vulnerabilities
- `python-security`: Checks Python dependencies with Safety

### Environment Variables

Required secrets in GitHub repository settings:

```
DATABASE_URL          # PostgreSQL connection string
ADZUNA_APP_ID        # Adzuna API credentials
ADZUNA_API_KEY       # Adzuna API credentials
```

Optional for deployment:
```
DEPLOY_SSH_KEY       # SSH key for deployment
PRODUCTION_HOST      # Production server address
STAGING_HOST         # Staging server address
```

## Test Structure

### Frontend Tests (`client/src/__tests__/`)
- Component unit tests
- Integration tests for user flows
- Mock Firebase authentication
- Test user interactions with userEvent

### Backend Tests (`server/__tests__/`)
- API endpoint tests
- Database operation tests
- Integration tests with Prisma
- Mock external API calls

### ML Service Tests (`ml-service/tests/`)
- API endpoint tests
- NLP processing tests
- Resume parsing logic tests
- Mock Redis for caching

## Code Coverage

Coverage reports are automatically generated and uploaded to Codecov:
- Frontend: `client/coverage/`
- Backend: `server/coverage/`
- ML Service: `ml-service/htmlcov/`

## Best Practices

1. **Write tests before pushing code**
2. **Aim for >80% code coverage**
3. **Test edge cases and error scenarios**
4. **Keep tests fast and isolated**
5. **Use meaningful test descriptions**
6. **Mock external dependencies**

## Deployment

### Staging
- Triggered on push to `develop` branch
- Automatic deployment after all tests pass

### Production
- Triggered on push to `main` branch
- Automatic deployment after all tests pass
- Requires successful staging deployment

## Troubleshooting

### Tests Failing Locally
1. Ensure all dependencies are installed
2. Check that environment variables are set
3. Verify database is running (for server tests)
4. Check Redis is running (for ML service)

### CI Pipeline Failures
1. Check GitHub Actions logs
2. Verify all secrets are configured
3. Ensure package versions are compatible
4. Check for environment-specific issues

## Future Improvements

- [ ] Add E2E tests with Playwright/Cypress
- [ ] Implement visual regression testing
- [ ] Add performance benchmarks
- [ ] Set up automated dependency updates (Dependabot)
- [ ] Add Docker-based testing environment
- [ ] Implement blue-green deployments
