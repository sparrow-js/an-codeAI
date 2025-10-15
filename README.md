<div align="center">

# needware.dev

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.2-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)

[![needware.dev: AI-Powered Full-Stack Web Development in the Browser](https://github.com/user-attachments/assets/563b1902-465f-4b84-b05c-69548f5872ec)](https://genfly.dev)

**An open-source AI-powered full-stack development platform that generates, previews, and deploys web applications directly in your browser.**

[Demo](https://genfly.dev) • [Documentation](#documentation) • [Features](#features) • [Getting Started](#getting-started)

</div>

---

## 📖 Table of Contents

- [About](#about)
- [Video Demo](#video-demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
- [Project Structure](#project-structure)
- [AI Agents](#ai-agents)
- [Usage](#usage)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## 🎯 About

needware.dev is a cutting-edge AI-powered development platform that revolutionizes how you build web applications. Leveraging multiple AI models and an intelligent agent system, it transforms ideas, screenshots, or URLs into fully functional web applications - all within your browser's isolated sandbox environment.

### Key Highlights

- 🤖 **Multi-Agent System**: Intelligent agents for different code generation tasks
- 🎨 **Visual-to-Code**: Convert screenshots directly into working code
- 🔗 **Clone-to-Code**: Analyze and replicate websites from URLs
- 💡 **Idea-to-Code**: Transform text descriptions into complete applications
- 🏗️ **Real-time Preview**: Instant preview with WebContainer technology
- 🗄️ **Database Integration**: Built-in Supabase support for database operations
- 🎭 **Multi-Model Support**: Works with OpenAI, Anthropic, Google, DeepSeek, and more

---

## 🎬 Video Demo

Here's a feature demonstration video of needware.dev:

<table>
<tr>
<td width="50%">
    
[![](https://github.com/user-attachments/assets/812571f9-4377-4da1-9f31-3b1f2d385338)](https://github.com/user-attachments/assets/812571f9-4377-4da1-9f31-3b1f2d385338)

</td>
<td width="50%">

[![](https://github.com/user-attachments/assets/426b01bf-2b20-4dfe-a63c-6150d1308fc9)](https://github.com/user-attachments/assets/426b01bf-2b20-4dfe-a63c-6150d1308fc9)

</td>
</tr>
</table>

---

## ✨ Features

### Core Capabilities

- 🧠 **AI-Powered Code Generation**: Full-stack web development for Node.js applications directly in your browser
- 📸 **Screenshot to Code**: Upload design mockups and convert them to working code
- 🔗 **URL Cloning**: Analyze existing websites and generate similar implementations
- 💭 **Natural Language**: Describe your idea and watch it come to life
- 🖼️ **Image Context**: Attach images to prompts for better contextual understanding
- 🎨 **Visual Editor**: Built-in code editor with syntax highlighting and autocomplete

### Development Tools

- 🔄 **Real-time Preview**: Instant preview with hot reload in isolated sandbox
- 📦 **Project Export**: Download projects as ZIP files for easy portability
- 🗂️ **File Management**: Complete file system with create, edit, and delete operations
- 🐚 **Integrated Terminal**: Built-in terminal for running commands
- 🔍 **Code Diff View**: Visual comparison of code changes
- 📝 **Markdown Support**: Rich text rendering with syntax highlighting

### Database & Backend

- 🗄️ **Supabase Integration**: Built-in database management and operations
- 🔐 **Authentication**: Secure user authentication with NextAuth.js
- 📊 **Data Visualization**: Charts and analytics for your data
- 🔒 **Encryption**: Database field encryption for sensitive data

### Deployment & Collaboration

- 🚀 **One-Click Deploy**: Deploy to Cloudflare, Netlify, or Vercel
- ☁️ **Cloud Storage**: Save and sync projects to the cloud
- 📜 **Version History**: Track changes with artifact snapshots
- 👥 **Multi-User Support**: User management and project isolation

### AI & Models

- 🤖 **Multiple AI Providers**: OpenAI, Anthropic, Google, DeepSeek, Mistral, Cohere, and more
- 🎯 **LangGraph Agents**: Sophisticated multi-agent workflows
- 🧩 **Firecrawl Integration**: Advanced web scraping for URL analysis
- 📚 **Context-Aware**: Maintains conversation history for better results

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://reactjs.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), SCSS
- **Components**: [Radix UI](https://www.radix-ui.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Code Editor**: [CodeMirror 6](https://codemirror.net/)
- **Terminal**: [xterm.js](https://xtermjs.org/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)

### Backend & AI
- **AI SDK**: [Vercel AI SDK](https://sdk.vercel.ai/)
- **Agent Framework**: [LangChain](https://js.langchain.com/), [LangGraph](https://langchain-ai.github.io/langgraphjs/)
- **AI Providers**: 
  - OpenAI, Anthropic (Claude), Google (Gemini)
  - DeepSeek, Mistral, Cohere
  - AWS Bedrock, OpenRouter
- **Web Scraping**: [Firecrawl](https://www.firecrawl.dev/)

### Database & ORM
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [NextAuth.js 5](https://next-auth.js.org/)

### Sandbox & Runtime
- **Browser Runtime**: [WebContainer API](https://webcontainers.io/)
- **File System**: Custom virtual file system
- **Package Manager**: pnpm

### Deployment & Storage
- **Hosting**: Vercel, Cloudflare Pages, Netlify
- **Storage**: Supabase Storage, Vercel Blob
- **Version Control**: isomorphic-git

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.17 or higher
- **pnpm**: v8.0 or higher
- **Git**: Latest version

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/genfly.git
   cd genfly
   ```

2. **Install pnpm** (if not already installed):

   ```bash
   npm install -g pnpm
   ```

3. **Install dependencies**:

   ```bash
   pnpm install
   ```

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Copy and edit the environment variables
touch .env.local
```

Then add the following variables to your `.env.local` file:

```env
# ====================
# App Configuration
# ====================
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ====================
# Database (Supabase)
# ====================
# PostgreSQL connection string
DATABASE_URL=postgresql://user:password@host:port/database

# Supabase project URL (found in your Supabase project settings)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url

# Supabase anonymous key (found in your Supabase project settings)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase service role key (found in your Supabase project settings)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Supabase access token (for management API operations)
SUPABASE_ACCESS_TOKEN=your_supabase_access_token

# Database encryption key (generate a random 32-character string)
DB_ENCRYPTION_KEY=your_random_32_character_encryption_key

# ====================
# Authentication (NextAuth v5)
# ====================
# Generate with: openssl rand -base64 32
AUTH_SECRET=your_random_secret_string

# Auth URL (same as NEXT_PUBLIC_APP_URL in development)
AUTH_URL=http://localhost:3000

# Optional: Enable auth debugging
# AUTH_DEBUG=true

# GitHub OAuth (optional, for GitHub login)
GITHUB_ID=your_github_oauth_app_client_id
GITHUB_SECRET=your_github_oauth_app_client_secret

# Google OAuth (optional, for Google login)
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# Notion OAuth (optional, for Notion login)
AUTH_NOTION_ID=your_notion_oauth_client_id
AUTH_NOTION_SECRET=your_notion_oauth_client_secret
AUTH_NOTION_REDIRECT_URI=http://localhost:3000/api/auth/callback/notion

# ====================
# AI Model API Keys
# ====================
# Configure at least one AI provider

# OpenAI (GPT-3.5, GPT-4, GPT-4o, etc.)
OPENAI_API_KEY=your_openai_api_key

# Anthropic (Claude models)
ANTHROPIC_API_KEY=your_anthropic_api_key

# DeepSeek
DEEPSEEK_API_KEY=your_deepseek_api_key

# OpenRouter (access to multiple models)
OPEN_ROUTER_API_KEY=your_openrouter_api_key

# ====================
# Optional Services
# ====================
# Firecrawl API for URL cloning feature
FIRECRAWL_API_KEY=your_firecrawl_api_key

# Vercel Blob Storage for file uploads
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# GitHub Personal Access Token (for template fetching and deployment)
NEXT_PUBLIC_GITHUB_TOKEN=your_github_personal_access_token

# Fly.io API Token (for Fly.io deployment)
FLY_API_TOKEN=your_fly_api_token

# Cloudflare API credentials (for Cloudflare Pages deployment)
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id

# Google Site Verification (for Google Search Console)
GOOGLE_SITE_VERIFICATION=your_google_verification_code

# ====================
# Admin Configuration
# ====================
# Comma-separated list of admin email addresses
ADMIN_EMAIL=admin@example.com,admin2@example.com

# Set to "true" to disable new user signups (admin-only mode)
# DISABLE_SIGNUP=true
```

#### 📋 Configuration Notes

**Required (Minimum Setup):**
- `NEXT_PUBLIC_APP_URL` - Your application URL
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `AUTH_SECRET` - NextAuth secret (generate with `openssl rand -base64 32`)
- At least one AI provider API key (OpenAI, Anthropic, Google, or DeepSeek)

**Optional (Enhanced Features):**
- OAuth providers (GitHub, Google, Notion) - for social login
- `FIRECRAWL_API_KEY` - for URL cloning feature
- `BLOB_READ_WRITE_TOKEN` - for file uploads via Vercel Blob
- `NEXT_PUBLIC_GITHUB_TOKEN` - for GitHub template fetching
- `FLY_API_TOKEN` - for Fly.io deployment
- `CLOUDFLARE_API_TOKEN` & `CLOUDFLARE_ACCOUNT_ID` - for Cloudflare deployment
- `ADMIN_EMAIL` - to designate admin users
- `DB_ENCRYPTION_KEY` - for database field encryption

**How to get API keys:**
- **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com)
- **Google AI**: [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
- **DeepSeek**: [platform.deepseek.com](https://platform.deepseek.com)
- **OpenRouter**: [openrouter.ai/keys](https://openrouter.ai/keys)
- **Firecrawl**: [firecrawl.dev](https://www.firecrawl.dev)
- **Supabase**: [supabase.com](https://supabase.com) - create a project and find keys in Settings → API

### Database Setup

1. **Set up Supabase**:
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and API keys to `.env.local`

2. **Run database migrations**:

   ```bash
   pnpm run migrate
   ```

   Or generate new migrations:

   ```bash
   pnpm run generate
   ```

### Running the Application

1. **Start the development server**:

   ```bash
   pnpm run dev
   ```

2. **Open your browser**:

   Navigate to [http://localhost:3000](http://localhost:3000)

3. **Build for production**:

   ```bash
   pnpm run build
   pnpm start
   ```

---

## 📁 Project Structure

```
genfly/
├── agent/                      # AI Agent System
│   ├── clone-url-to-code/     # URL to code conversion agent
│   ├── idea-to-code/          # Natural language to code agent
│   ├── screenshot-to-code/    # Image to code agent
│   ├── supervisor/            # Agent orchestration
│   └── utils/                 # Shared agent utilities
├── app/                       # Next.js App Router
│   ├── api/                   # API routes
│   ├── (auth)/                # Authentication pages
│   └── layout.tsx             # Root layout
├── components/                # React components
│   ├── chat/                  # Chat interface
│   ├── editor/                # Code editor
│   ├── workbench/             # Main workbench UI
│   ├── sidebar/               # Navigation sidebar
│   └── shadui/                # UI components
├── db/                        # Database configuration
│   ├── schema.ts              # Drizzle ORM schema
│   └── index.ts               # Database client
├── lib/                       # Utility libraries
│   ├── modules/               # Core modules
│   ├── stores/                # State management (zustand)
│   ├── hooks/                 # Custom React hooks
│   └── persistence/           # Data persistence layer
├── types/                     # TypeScript type definitions
├── utils/                     # Utility functions
├── migrations/                # Database migrations
├── public/                    # Static assets
└── styles/                    # Global styles

```

---

## 🤖 AI Agents

The platform uses a multi-agent architecture powered by LangGraph:

### Agent Types

1. **Idea to Code Agent** (`agent/idea-to-code/`)
   - Converts natural language descriptions into code
   - Understands project context and requirements
   - Generates full-stack applications

2. **Screenshot to Code Agent** (`agent/screenshot-to-code/`)
   - Analyzes UI design screenshots
   - Extracts layout, styling, and component structure
   - Generates responsive HTML/CSS/JavaScript

3. **Clone URL to Code Agent** (`agent/clone-url-to-code/`)
   - Scrapes and analyzes target websites
   - Uses Firecrawl for content extraction
   - Replicates functionality and styling

4. **Supervisor Agent** (`agent/supervisor/`)
   - Orchestrates multiple agents
   - Routes requests to appropriate agents
   - Manages workflow state and transitions

### Agent Workflow

```
User Input → Supervisor → Route to Specific Agent → Generate Code → Preview → Deploy
                ↓
         Context Management
                ↓
         Multi-Model Selection
```

---

## 📘 Usage

### Creating a Project

1. **From an Idea**:
   - Describe your application in natural language
   - The AI will generate a complete project structure
   - Preview and iterate on the result

2. **From a Screenshot**:
   - Upload a design mockup or UI screenshot
   - The AI analyzes and converts it to code
   - Customize the generated components

3. **From a URL**:
   - Paste the URL of a website you want to clone
   - The AI scrapes and analyzes the site
   - Generates a similar implementation

### Editing Code

- Use the built-in **CodeMirror editor** with syntax highlighting
- **Hot reload** preview updates automatically
- Access the **integrated terminal** for commands
- View **file tree** for easy navigation

### Managing Database

- Create and manage **Supabase tables** directly
- Execute **SQL queries** from the UI
- View and edit **table data**
- Configure **authentication** and **storage**

### Deploying

1. Click the **Deploy** button in the workbench
2. Choose your platform (Vercel, Cloudflare, Netlify)
3. Configure deployment settings
4. Deploy with one click

---

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server with Turbo
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm generate         # Generate Drizzle migrations
pnpm migrate          # Push migrations to database

# Code Quality
pnpm lint             # Run ESLint
```

### Code Style

- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** (recommended) for formatting
- Follow the existing code structure and patterns

---

## 🚢 Deployment

### Self-Hosting

1. **Build the application**:
   ```bash
   pnpm build
   ```

2. **Set up your database**:
   - Configure PostgreSQL or Supabase
   - Run migrations

3. **Configure environment variables** on your hosting platform

4. **Deploy** to your preferred platform:
   - Vercel
   - Cloudflare Pages
   - Netlify
   - Your own VPS

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Contribution Guidelines

- Write clear, descriptive commit messages
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Be respectful and constructive in discussions

---

## 📄 License

This project is licensed under the **Apache License 2.0** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

This project builds upon amazing open-source technologies:

- [WebContainer API](https://webcontainers.io/) - Browser-based runtime
- [LangChain](https://js.langchain.com/) & [LangGraph](https://langchain-ai.github.io/langgraphjs/) - Agent orchestration
- [Vercel AI SDK](https://sdk.vercel.ai/) - Multi-model AI integration
- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) - UI components

Special thanks to all contributors and the open-source community!

---

<div align="center">

**Built with ❤️ by the needware.dev team**

[Website](https://genfly.dev) • [Issues](https://github.com/yourusername/genfly/issues) • [Discussions](https://github.com/yourusername/genfly/discussions)

</div>