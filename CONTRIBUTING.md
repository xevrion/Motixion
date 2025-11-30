# Contributing to Motixion

Thank you for considering contributing to Motixion! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Adding Features](#adding-features)
- [Reporting Bugs](#reporting-bugs)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Git for version control
- A Supabase account (free tier works)
- Basic knowledge of React, TypeScript, and Tailwind CSS

### Initial Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/Motixion.git
   cd Motixion
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL-OWNER/Motixion.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Set up environment variables**:
   - Copy `.env.example` to `.env` (if available)
   - Add your Supabase credentials
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

6. **Set up the database**:
   - Run the `supabase-schema.sql` file in your Supabase SQL Editor
   - Disable email confirmations in Supabase (Settings → Auth → Email Confirmations)

7. **Start development server**:
   ```bash
   npm run dev
   ```

## Development Workflow

1. **Create a new branch** for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes** following the coding standards

3. **Test your changes** thoroughly:
   - Test on both desktop and mobile viewports
   - Verify points calculation is correct
   - Check that animations work smoothly
   - Ensure no console errors

4. **Commit your changes** following commit guidelines

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** against the `main` branch


## Coding Standards

### TypeScript

- Use TypeScript for all new files
- Define proper interfaces in `types.ts`
- Avoid using `any` - use proper types
- Use functional components with hooks

### React

- Use functional components with React hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use proper prop typing with interfaces

### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use these breakpoints:
  - `sm:` - 640px
  - `md:` - 768px
  - `lg:` - 1024px
  - `xl:` - 1280px
- Maintain consistent spacing with Tailwind scale

### Animations

- Use Framer Motion for all animations
- Keep animations fast (0.2-0.3s duration)
- Use GPU-accelerated properties (`transform`, `opacity`)
- Test animations on mobile devices

### Code Organization

- Keep files under 300 lines when possible
- Group related functions together
- Add comments for complex logic only
- Use descriptive variable and function names

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Examples

```bash
feat: add weekly statistics chart
fix: streak not incrementing on first log
docs: update setup instructions in README
refactor: simplify point calculation logic
style: format Shop component with prettier
```

### Best Practices

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- Keep the first line under 72 characters
- Reference issues and PRs when applicable

## Pull Request Process

1. **Update documentation** if needed (README.md, CLAUDE.md, etc.)

2. **Ensure all tests pass** and there are no console errors

3. **Update CLAUDE.md** if you're changing:
   - Project architecture
   - Database schema
   - Point calculation logic
   - Common patterns

4. **Fill out the PR template** with:
   - Description of changes
   - Screenshots (for UI changes)
   - Testing steps
   - Related issues

5. **Request review** from maintainers

6. **Address feedback** promptly and professionally

7. **Squash commits** if requested before merging

## Adding Features

### Adding New Rewards

1. Open `services/mockData.ts`
2. Copy the reward template
3. Choose a unique ID (e.g., 'r7', 'r8')
4. Set name, cost, emoji icon, category
5. Add to the `REWARDS` array
6. Test in the Shop component

### Adding New Point Rules

**CRITICAL**: Points calculation exists in TWO places and must match:

1. **Client-side**: `services/pointLogic.ts`
2. **Server-side**: `calculate_daily_points()` function in `supabase-schema.sql`

Steps:
1. Update both files with identical logic
2. Test thoroughly with various inputs
3. Document the new rule in CLAUDE.md

### Adding New Components

1. Create component in `components/` directory
2. Use TypeScript with proper prop types
3. Import and use in `Layout.tsx` or parent component
4. Add Framer Motion animations
5. Ensure mobile responsiveness
6. Test on different screen sizes

### Adding Database Tables

1. Add table definition to `supabase-schema.sql`
2. Create RLS policies (users can CRUD own data)
3. Add TypeScript types to `services/supabase.ts`
4. Create service layer in `services/`
5. Update CLAUDE.md with the new pattern

## Reporting Bugs

### Before Submitting

- Check if the bug has already been reported
- Verify it's actually a bug and not a configuration issue
- Test on the latest version

### Bug Report Template

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What you expected to happen

**Actual Behavior**
What actually happened

**Screenshots**
If applicable, add screenshots

**Environment**
- Browser: [e.g., Chrome 120]
- OS: [e.g., macOS 14.0]
- Screen size: [e.g., mobile, desktop]

**Console Errors**
Paste any relevant console errors
```

## Suggesting Enhancements

### Enhancement Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
Clear description of what you want to happen

**Describe alternatives you've considered**
Other solutions you've thought about

**Additional context**
Mockups, examples, or other context
```

## Development Tips

### Daily Reset Testing

The app resets at 5:00 AM. To test this:
1. Check `services/dateUtils.ts` for the logic
2. Modify your system time to before/after 5 AM
3. Verify logs appear on correct dates

### Points Calculation Debugging

1. Add console logs in `services/pointLogic.ts`
2. Compare with SQL function output in Supabase
3. Test edge cases (0 hours, max hours, 100%+ tasks)

### Mobile Testing

1. Use Chrome DevTools device emulation
2. Test on actual mobile devices when possible
3. Verify bottom navigation doesn't overlap content
4. Check that touch targets are at least 44x44px

### Supabase RLS Testing

1. Test as different users (create multiple accounts)
2. Verify friends can see each other's data
3. Ensure users cannot edit others' data
4. Check that purchases are properly restricted

## Questions?

If you have questions about contributing:
- Open a GitHub Discussion
- Comment on relevant issues
- Reach out to maintainers

Thank you for contributing to Motixion!
