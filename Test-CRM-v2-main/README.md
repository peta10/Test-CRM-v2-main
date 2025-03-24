# BusinessSoftware.io CRM

A modern, TypeScript-based CRM system built with Next.js, Supabase, and Tailwind CSS.

## Features

### Core CRM Functionality
- **Contact Management**: Track and manage customer information
- **Deal Pipeline**: Kanban-style deal tracking with customizable stages
- **Task Management**: Organize and track team activities
- **Accounting & Invoicing**: Handle financial transactions and tracking

### Advanced Features
- **Workflow Automation**
  - Custom IF-THEN rule creation
  - Multi-step follow-up sequences
  - Automated task creation
  - Trigger-based notifications

- **Revenue Management**
  - Subscription tracking
  - Commission calculations
  - Payment plan management
  - Revenue forecasting

- **Sales & Marketing**
  - Campaign attribution tracking
  - Social media lead integration
  - Website visitor tracking
  - Marketing performance analytics

- **Customer Retention**
  - Customer health scoring
  - Automated check-ins
  - Customer lifetime value tracking
  - Engagement monitoring

- **Team Collaboration**
  - Internal chat system
  - @mentions functionality
  - Sales leaderboards
  - Cross-department visibility

- **Support & Success**
  - Ticket management
  - Customer feedback collection
  - Automated onboarding sequences
  - Support performance tracking

## Technical Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Authentication)
- **State Management**: React Hooks + Context
- **Type Safety**: Strict TypeScript configuration

## Project Structure

```
├── app/                 # Next.js app directory
│   ├── customers/       # Customer management module
│   ├── reminders/       # Reminders module
│   ├── contracts/       # Contracts module
│   ├── expenses/        # Expenses module
│   ├── statistics/      # Statistics module
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Dashboard page
│   └── globals.css      # Global styles
├── components/          # Reusable UI components
│   ├── ui/              # UI component library
│   ├── sidebar.tsx      # Navigation sidebar
│   └── theme-provider.tsx # Theme context provider
├── lib/                 # Utility functions
│   ├── utils.ts         # Helper functions
│   └── supabaseClient.ts # Supabase client configuration
├── supabase/            # Supabase migration files
│   └── migrations/      # SQL migrations
├── hooks/               # Custom React hooks
├── public/              # Static assets
└── styles/              # Additional styles
```

## Data Storage

This CRM uses Supabase as its primary data storage solution with localStorage as a fallback mechanism for offline functionality.

### Supabase Schema

The database schema consists of the following tables:

- **customers**: Stores customer information
- **reminders**: Stores reminder and note information
- **contracts**: Stores contract and sales data
- **expenses**: Stores expense information

## Getting Started

1. Create a Supabase project at [supabase.io](https://supabase.io)
2. Clone this repository
3. Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

## Setting Up Authentication (Optional)

For adding user authentication:

1. Enable authentication in your Supabase project
2. Update RLS policies for each table to restrict access based on user ID
3. Add additional columns to tables to associate records with specific users

## Deployment Options

This CRM can be easily deployed on:

- Vercel
- Netlify
- Any hosting service that supports Next.js applications

## Customization

- **Themes**: Light and dark mode support
- **UI Components**: Extensible component system based on shadcn/ui patterns
- **Mobile Responsive**: Fully responsive design for all device sizes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).