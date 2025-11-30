# Motixion

A minimal, fast, responsive web app that gamifies daily life for accountability partners. Track tasks, hours, points, streaks, and rewards with a shared system.

## Features

- **Authentication** - Secure email/password login with Supabase Auth
- **Daily Logging** - Track wake time, study hours, break hours, wasted time, and tasks
- **Points System** - Automatic calculation based on performance with extra credit
- **Streaks** - Track daily consistency and best streaks
- **Leaderboard** - Compete with multiple friends on daily rankings
- **Friend System** - Search, add friends, and view their detailed progress
- **Reward Shop** - Redeem points for real-world treats
- **Dashboard** - Beautiful charts and analytics
- **Profile** - Lifetime stats and purchase history
- **5AM Daily Reset** - Work late without penalty (YPT-style cutoff)

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS + Lucide Icons
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Charts**: Recharts

## Setup Instructions for Development

### 1. Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)

### 2. Clone the Repository

```bash
git clone <your-repo-url>
cd Motixion
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is ready, go to **Settings** → **API**
3. Copy your **Project URL** and **anon public** key

### 5. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 6. Set Up the Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase-schema.sql` and run it

This will create:
- All necessary tables (users, daily_logs, friendships, tasks, purchases, streaks)
- Row Level Security (RLS) policies
- Database functions for point calculation
- Triggers for auto-creating user profiles

### 7. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 8. Create Your First Account

1. Click "Sign Up" on the login screen
2. Enter your email, password, and username
3. You'll be automatically logged in!

## Usage Guide

### Daily Logging

1. Click **"Log Activity"** button
2. Fill in your daily data:
   - Wake-up time
   - Study hours (0-16h)
   - Break hours (0-8h)
   - Wasted time (0-10h)
   - Tasks assigned & completed
   - Optional notes
3. Click **"Save & Calculate Points"**

### Points Breakdown

- **Study Hours**: 5 points per hour
- **Tasks Completion** (with extra credit for over-achievement):
  - ≤80%: -10 points
  - 81-90%: 0 points
  - 91-100%: +10 points
  - 100-120%: +15 points
  - 120-150%: +20 points
  - 150-180%: +25 points
  - 180-200%: +30 points
- **Wake Time Bonus**:
  - Before 6:00 AM: +15 points
  - 6:00-7:00 AM: +10 points
  - 7:00-8:00 AM: +5 points
  - After 8:00 AM: 0 points
- **Wasted Time Penalty**: -5 points per hour

### Adding Friends

1. Go to the **Friends** tab (Leaderboard)
2. Search for users by username
3. Click "Add Friend"
4. Once they accept, they'll appear on the leaderboard
5. Click any friend to view their detailed performance

### Reward Shop

1. Go to the **Shop** tab
2. Browse available rewards
3. Click on a reward to purchase it (if you have enough points)
4. View your purchases in the Profile tab

## Database Schema

### Tables

- `users` - User profiles with balance and streaks
- `daily_logs` - Daily activity logs with calculated points
- `friendships` - Friend connections (pending/accepted/rejected)
- `tasks` - Individual task tracking
- `purchases` - Reward redemption history
- `streaks` - Detailed streak tracking per user

### Security

All tables have Row Level Security (RLS) enabled:
- Users can only edit their own data
- Friends can view each other's logs and stats
- Purchases are only visible to the user and their friends

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Make sure to add your environment variables in the Vercel dashboard.

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

## Troubleshooting

### Black Screen on Load

- Make sure your `.env` file has the correct Supabase credentials
- Check browser console for errors
- Verify the database schema was set up correctly
- Ensure all required tables exist in Supabase Table Editor

### Authentication Issues

- Clear browser cache and cookies
- Check Supabase Auth settings in your project dashboard
- Ensure email confirmations are disabled for development (Settings → Auth → Email Confirmations)
- Verify the `handle_new_user()` trigger is properly set up

### Points Not Calculating

- Verify the `calculate_daily_points` function exists in your database
- Check the SQL Editor for any errors when running the schema
- Ensure both `services/pointLogic.ts` and SQL function match exactly

### Leaderboard Not Showing Friends

- Verify friends have accepted the friend request (status = 'accepted')
- Check RLS policies are enabled on the `friendships` table
- Ensure friends have logged activity for today

### Rewards Not Appearing

- Check that `services/mockData.ts` exports the `REWARDS` array
- Verify `Shop.tsx` imports REWARDS correctly
- Ensure each reward has a unique ID

## Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### Quick Start for Contributors

1. **Fork the repository** and clone your fork
2. **Create a new branch** for your feature: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'feat: add amazing feature'`
5. **Push to your fork**: `git push origin feature/amazing-feature`
6. **Open a Pull Request** with a clear description

### What Can You Contribute?

- **Bug fixes**: Found a bug? Submit a fix!
- **New features**: Ideas for improvements? We'd love to see them
- **Documentation**: Help improve our docs
- **Rewards**: Add new reward ideas to `services/mockData.ts`
- **UI/UX**: Enhance the user experience
- **Performance**: Optimize code and animations

### Contribution Guidelines

Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on:
- Code standards and project structure
- Commit message conventions
- Pull request process
- Adding new features and rewards
- Testing requirements

### Development Notes

- Follow the existing code style (TypeScript + Tailwind CSS)
- Test on both desktop and mobile viewports
- Ensure points calculation matches both client and SQL functions
- Keep animations smooth (0.2-0.3s, GPU-accelerated)
- Maintain the 5:00 AM daily reset logic

### Need Help?

- Open an issue for questions or discussions
- Review existing issues and PRs for context

## Future Enhancements

- [ ] Push notifications for daily reminders
- [x] Global leaderboard across all users
- [ ] Weekly/monthly reports and analytics
- [ ] Group accountability mode for teams
- [ ] Mobile app (React Native)
- [ ] AI-powered insights and coaching
- [ ] Personalized Shop (Custom rewards)
- [ ] Dark/light theme toggle
- [ ] Export data functionality

## License

MIT License - feel free to use this for your own productivity journey!

---

Built with ❤️ using React + Supabase
