# VideoCloud Frontend

This is the frontend application for the VideoCloud platform, built with Vue.js and following the Feature-Sliced Design (FSD) methodology.

## Project Structure

The project follows the Feature-Sliced Design (FSD) methodology, which organizes code by business domain and technical purpose:

```
src/
├── app/              # Application initialization, global providers, styles
│   ├── styles/       # Global styles
│   ├── App.vue       # Root component
│   └── main.ts       # Entry point
├── pages/            # Application routes and layouts
│   ├── home/         # Home page
│   └── about/        # About page
├── widgets/          # Composite components that represent business features
│   └── welcome/      # Welcome widget
├── features/         # User interactions, actions that change the state
├── entities/         # Business entities with their data and logic
└── shared/           # Reusable infrastructure code, UI kit, API, etc.
    ├── api/          # API clients
    ├── config/       # Configuration constants
    ├── lib/          # Utility functions
    └── ui/           # UI components
        ├── icons/    # Icon components
        └── WelcomeItem/ # Welcome item component
```

For more information about Feature-Sliced Design, visit [feature-sliced.design](https://feature-sliced.design/).

## Requirements

### Core Technologies

- **Vue**: For building the user interface and managing state.
- **Nuxt**: A powerful framework for building Vue.js applications, providing server-side rendering, static site generation, and more.
- **MobX**: For state management with a focus on simplicity and reactivity.
- **TypeScript**: To add static typing, which helps prevent errors and improve code quality.
- **SCSS**: For styling components with an extended feature set over vanilla CSS.

### Development Tools

- **Node.js** (20.16.0): Required for running the development environment and build processes.
- **pnpm** (7.33.6): A fast, disk space efficient package manager.

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/kirull1/videocloud.git
   cd videocloud/frontend
   ```

2. **Install Dependencies**:
   ```bash
   pnpm install
   ```

3. **Start the Development Server**:
   ```bash
   pnpm run dev
   ```

   Your application should now be running on `http://localhost:3000`.

## Testing

### End-to-End (E2E) Testing

We use **Cypress** for end-to-end testing, allowing us to test the user interface and the interactions from the user's perspective.

- **Run E2E Tests**:
  ```bash
  pnpm run test:e2e
  ```

### Unit Testing

For unit tests, we use **Jest** and **Vue Testing Library** to verify the functionality of individual components and utilities.

- **Run Unit Tests**:
  ```bash
  pnpm run test
  ```

  Combine unit tests with coverage:
  ```bash
  pnpm run test:coverage
  ```

## Storybook

Storybook is employed to document and test UI components in isolation. It enables developers to create, browse, and interact with components separate from the app.

- **Start Storybook**:
  ```bash
  pnpm run storybook
  ```

  This will start Storybook on `http://localhost:6006`, where you can view all available UI components.

## CI/CD

Continuous Integration and Continuous Deployment (CI/CD) are crucial for maintaining the quality and consistency of the VideoCloud project. We use **GitHub Actions** as our CI/CD tool to automate the testing and deployment processes.

### Workflow

1. **Triggering Events**: The CI/CD pipeline is triggered by events such as commits pushed to the main branch or the creation of pull requests.

2. **Build and Test**:
   - The pipeline installs dependencies and builds the project using Nuxt.js.
   - All unit and E2E tests are executed to ensure code quality.

3. **Deployment**:
   - If tests pass, the application is automatically deployed to our staging environment.
   - Manual approval is required to deploy to the production environment.
