# NutriCoach Pro - AI-Powered Nutrition & Fitness Assistant

A comprehensive nutrition and fitness application that provides personalized meal planning, recipe generation, and fitness tracking with AI coaching.

## Features

- **Personalized Meal Planning**: AI-powered meal recommendations based on your dietary preferences and goals
- **Recipe Generation**: Create custom recipes tailored to your nutritional needs
- **Fitness Tracking**: Monitor your progress and get personalized fitness guidance
- **Smart Coaching**: AI-powered insights and recommendations for your health journey

## Technologies Used

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React hooks and context
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd food-fitness-guru-main
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Dashboard.tsx   # Main dashboard component
│   ├── Hero.tsx        # Landing page hero section
│   └── ...
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── integrations/       # External service integrations
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
