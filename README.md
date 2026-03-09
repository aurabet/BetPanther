# BookMaker Africa

A full-stack sports betting application built with React (Vite) and Node.js (Express).

## Project Structure

```
bookmaker-africa/
├── frontend/          # React application (Vite)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── index.tsx
│       ├── index.css
│       ├── App.css
│       ├── components/
│       │   └── Header.tsx
│       └── pages/
│           ├── Home.tsx
│           ├── Dashboard.tsx
│           └── Live.tsx
├── backend/           # Node.js API (Express)
│   ├── package.json
│   ├── server.js
│   └── routes/
│       ├── auth.js
│       ├── users.js
│       ├── matches.js
│       └── bets.js
├── package.json       # Root package.json
├── render.yaml        # Deployment configuration
└── README.md
```

## Features

### Frontend (React)
- Modern React application built with Vite
- TypeScript support
- React Router for navigation
- Tailwind CSS for styling
- Responsive design
- Pages:
  - Home: Landing page with quick stats and match overview
  - Dashboard: User account management and betting history
  - Live: Real-time betting interface

### Backend (Node.js)
- Express.js REST API
- JWT authentication
- User registration and login
- Match management
- Betting system
- Security middleware (Helmet, CORS)
- Input validation with Joi

## Installation

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Users
- `GET /api/users/profile` - Get user profile
- `POST /api/users/update-balance` - Update user balance

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/live` - Get live matches
- `GET /api/matches/upcoming` - Get upcoming matches
- `GET /api/matches/:id` - Get match by ID

### Bets
- `POST /api/bets/place` - Place a bet
- `GET /api/bets/user` - Get user bets
- `GET /api/bets/:id` - Get bet by ID

## Environment Variables

### Backend
Create a `.env` file in the backend directory:
```
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key
```

## Deployment

This project includes a `render.yaml` file for easy deployment to Render.com:

1. Push your code to a GitHub repository
2. Connect the repository to Render.com
3. Render will automatically deploy both frontend and backend services
4. The deployment includes a PostgreSQL database

## Technologies Used

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- React Hot Toast

### Backend
- Node.js
- Express.js
- JWT
- bcryptjs
- Joi
- Helmet
- CORS

## License

MIT License