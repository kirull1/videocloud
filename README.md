# VideoCloud Project

## Project Overview

VideoCloud is a comprehensive video hosting platform designed for scalability, user-friendliness, and performance. It allows users to seamlessly upload, manage, and stream their video content. The project is divided into two main components:

- **Frontend**: Built with Vue.js, Nuxt.js, and MobX, this module handles the client-side user interface and experience.
- **Backend**: Developed using NestJS, this module manages the server-side logic, API services, and database interactions.

## Project Structure

```
videocloud/
├── frontend/           # Vue.js frontend application
├── backend/            # NestJS backend application
├── memory-bank/        # Project documentation
├── .editorconfig       # Editor configuration
├── .gitattributes      # Git attributes
├── .gitignore          # Git ignore rules
├── .prettierrc         # Prettier configuration
├── docker-compose.yml  # Docker services for development
├── eslint.config.js    # ESLint configuration
├── package.json        # Root package.json for workspace management
├── tsconfig.base.json  # Base TypeScript configuration
└── tsconfig.json       # Root TypeScript configuration
```

## Prerequisites

- **Node.js**: Version 20.16.0 or higher
- **pnpm**: Version 7.33.6 or higher
- **Docker**: Latest version (optional, for running PostgreSQL and Redis)

## Getting Started

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/kirull1/videocloud.git
   cd videocloud
   ```

2. **Install Dependencies**:
   ```bash
   pnpm install
   ```

3. **Start Development Services** (optional):
   ```bash
   docker-compose up -d
   ```

4. **Start Development Servers**:
   ```bash
   # Start both frontend and backend
   pnpm run dev
   
   # Or start them individually
   pnpm run frontend:dev
   pnpm run backend:dev
   ```

## Development

### Available Scripts

- `pnpm run dev`: Start both frontend and backend development servers
- `pnpm run build`: Build both frontend and backend for production
- `pnpm run test`: Run tests for both frontend and backend
- `pnpm run lint`: Lint both frontend and backend code
- `pnpm run format`: Format all code with Prettier

### Frontend-specific Scripts

- `pnpm run frontend:dev`: Start frontend development server
- `pnpm run frontend:build`: Build frontend for production
- `pnpm run frontend:test`: Run frontend tests
- `pnpm run frontend:lint`: Lint frontend code

### Backend-specific Scripts

- `pnpm run backend:dev`: Start backend development server
- `pnpm run backend:build`: Build backend for production
- `pnpm run backend:test`: Run backend tests
- `pnpm run backend:lint`: Lint backend code

## Testing

Both the frontend and backend have comprehensive test suites. Please refer to the respective README files in the `frontend` and `backend` directories for detailed testing instructions.

## CI/CD

The project uses **GitHub Actions** for automating the CI/CD process, ensuring code quality through tests and facilitating easy deployments.

## Documentation

Comprehensive project documentation is available in the `memory-bank` directory, including:

- Project brief and requirements
- Product context and goals
- System architecture and patterns
- Technical context and setup
- Current progress and roadmap

## License

[License information to be added]
