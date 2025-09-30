# 🚀 Developer Onboarding Guide

**Time to productivity: < 1 hour**

Welcome to GHXSTSHIP! This guide will get you up and running in less than 1 hour.

---

## ⚡ Quick Start (15 minutes)

### Prerequisites

Install these tools (5 minutes):

```bash
# macOS
brew install node pnpm git

# Windows (with Chocolatey)
choco install nodejs pnpm git

# Linux
curl -fsSL https://get.pnpm.io/install.sh | sh
```

### Automated Setup (10 minutes)

```bash
# Clone repository
git clone https://github.com/ghxstship/platform.git
cd platform

# Run automated setup
npx @ghxstship/cli setup

# Start development
pnpm dev
```

**That's it!** Open http://localhost:3000

---

## 📚 Project Structure (5 minutes)

```
ghxstship/
├── apps/
│   ├── web/          # Next.js web app
│   ├── mobile/       # React Native mobile app
│   └── desktop/      # Electron desktop app
├── packages/
│   ├── ui/           # Shared UI components
│   ├── domain/       # Business logic
│   ├── application/  # Use cases
│   └── infrastructure/ # External services
├── infrastructure/   # Terraform, Kubernetes
├── tests/           # Test suites
└── tooling/         # Development tools
```

---

## 🛠️ Development Workflow (10 minutes)

### Daily Commands

```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Check types
pnpm type-check

# Lint code
pnpm lint

# Format code
pnpm format
```

### Generate Code

```bash
# Generate component
ghxstship generate component --name MyComponent

# Generate page
ghxstship generate page --name my-page

# Generate API route
ghxstship generate api --name my-endpoint
```

---

## 🧪 Testing (5 minutes)

```bash
# Run all tests
pnpm test

# Run specific test type
pnpm test:unit
pnpm test:integration
pnpm test:e2e

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

---

## 🐛 Debugging (5 minutes)

### VS Code

Press `F5` to start debugging (pre-configured)

### Chrome DevTools

1. Start dev server: `pnpm dev`
2. Open Chrome DevTools
3. Go to Sources > Node

### React DevTools

Install browser extension:
- [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

---

## 📖 Key Concepts (10 minutes)

### Architecture

- **Clean Architecture** - Separation of concerns
- **Domain-Driven Design** - Business logic first
- **CQRS** - Command Query Responsibility Segregation
- **Atomic Design** - Component hierarchy

### Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **Mobile:** React Native, Expo
- **Desktop:** Electron
- **Backend:** Next.js API Routes, Supabase
- **Database:** PostgreSQL (Supabase)
- **Cache:** Redis
- **Auth:** Supabase Auth
- **Payments:** Stripe

---

## 🎯 Your First Task (10 minutes)

Let's create a simple feature:

```bash
# 1. Generate component
ghxstship generate component --name WelcomeCard

# 2. Edit the component
# File: packages/ui/src/components/WelcomeCard/WelcomeCard.tsx

# 3. Add to a page
# File: apps/web/app/page.tsx

# 4. Run tests
pnpm test

# 5. Commit changes
git add .
git commit -m "feat: add welcome card"
```

---

## 🚀 Deployment (5 minutes)

### Development

```bash
# Deploy to dev environment
ghxstship deploy dev
```

### Staging

```bash
# Deploy to staging
ghxstship deploy staging
```

### Production

```bash
# Deploy to production (requires approval)
ghxstship deploy prod
```

---

## 📚 Resources

### Documentation
- [Architecture Guide](./architecture/README.md)
- [API Documentation](./api/README.md)
- [Component Library](./components/README.md)

### Tools
- [CLI Reference](./cli/README.md)
- [VS Code Extensions](./vscode/README.md)
- [Git Workflow](./git/README.md)

### Support
- Slack: #dev-support
- Email: dev@ghxstship.com
- Wiki: https://wiki.ghxstship.com

---

## ✅ Onboarding Checklist

- [ ] Prerequisites installed
- [ ] Repository cloned
- [ ] Automated setup completed
- [ ] Development server running
- [ ] First component created
- [ ] Tests passing
- [ ] Code committed
- [ ] Documentation read
- [ ] Team introduced

**Estimated time:** < 1 hour

---

## 🎉 Welcome to the Team!

You're now ready to contribute to GHXSTSHIP. If you have any questions, reach out on Slack #dev-support.

Happy coding! 🚀
