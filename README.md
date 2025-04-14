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
- **Docker**: Latest version (for running PostgreSQL and Redis)

### Node.js and pnpm Setup

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source ~/.bashrc  # or ~/.zshrc for macOS

# Use correct Node.js version (from .nvmrc)
nvm use

# Install pnpm
npm install -g pnpm@7.33.6
```

### Platform-Specific Docker Setup

#### macOS

For macOS, especially on Apple Silicon (ARM) machines, we recommend using Colima instead of Docker Desktop:

1. **Install Colima**:

   ```bash
   brew install colima docker docker-compose
   ```

2. **Start Colima** (for Intel Macs):

   ```bash
   colima start
   ```

   **For Apple Silicon (ARM) Macs**:

   ```bash
   colima start --arch aarch64 --vm-type=vz --vz-rosetta --cpu 6 --memory 8
   ```

#### Linux

**Install Docker and Docker Compose**:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
# Log out and log back in to apply group changes
```

## Getting Started

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/kirull1/videocloud.git
   cd videocloud
   ```

2. **Install Dependencies**:

   ```bash
   pnpm run deps
   ```

3. **Start Development Services**:

   ```bash
   # Start PostgreSQL and Redis services
   docker-compose up -d
   ```

4. **Configure Environment Variables**:
   Create a `.env` file in the backend directory:

   ```bash
   # Create backend .env file
   cat > backend/.env << EOL
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=postgres
   DATABASE_PASSWORD=postgres
   DATABASE_NAME=videocloud
   JWT_SECRET=your-secret-key
   EOL
   ```

5. **Start Development Servers**:

   ```bash
   # Start both frontend and backend
   pnpm run dev

   # Or start them individually
   pnpm run frontend:dev  # Runs on http://localhost:3000
   pnpm run backend:dev   # Runs on http://localhost:3001
   ```

## Running the Project

### Development Mode

The project consists of three main components that need to be running:

1. **Database Services** (PostgreSQL and Redis):

   ```bash
   # Start the services
   docker-compose up -d

   # Check if services are running
   docker-compose ps

   # View logs
   docker-compose logs -f
   ```

2. **Backend Server**:

   ```bash
   # Start in development mode with hot reload
   pnpm run backend:dev

   # Run tests
   pnpm run backend:test

   # Lint code
   pnpm run backend:lint
   ```

3. **Frontend Server**:

   ```bash
   # Start in development mode with hot reload
   pnpm run frontend:dev

   # Run tests
   pnpm run frontend:test

   # Lint code
   pnpm run frontend:lint
   ```

### Production Build

To create production builds:

```bash
# Build both frontend and backend
pnpm run build

# Or build them individually
pnpm run frontend:build
pnpm run backend:build
```

### Accessing the Application

- **Frontend**: Open http://localhost:3000 in your browser
- **Backend API**: Available at http://localhost:3001
- **PostgreSQL**: Available at localhost:5432
- **Redis**: Available at localhost:6379

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
