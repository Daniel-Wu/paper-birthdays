# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Paper Birthdays** is a Next.js web application that displays historically significant academic papers published on the current date in previous years. The app fetches papers from arXiv, retrieves citation counts from Semantic Scholar, and presents the most cited papers from each day.

**IMPORTANT**: Always read `project_info.md` first for complete technical specifications, database schema, API design, and implementation details.

## Technology Stack

- **Frontend**: Next.js 15.4.2 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS 4 with PostCSS
- **Database**: PostgreSQL
- **Deployment**: Railway
- **APIs**: arXiv API, Semantic Scholar API

## Development Commands

- `npm run dev` - Start development server with turbopack (opens at http://localhost:3000)
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint with Next.js configuration

## Architecture

**Framework**: Next.js 15 with App Router
- Entry point: `src/app/page.tsx`
- Layout: `src/app/layout.tsx`
- Font optimization: Uses Geist Sans and Geist Mono via `next/font/google`

**Project Structure**:
```
src/
├── app/                 # App Router pages and layouts
│   ├── page.tsx        # Home page
│   ├── layout.tsx      # Root layout with fonts
│   ├── globals.css     # Global styles
│   └── favicon.ico     # Site favicon
public/                  # Static assets (SVG icons)
```

**TypeScript Configuration**:
- Uses path aliases (`@/*` maps to `./src/*`)
- Strict mode enabled
- Target: ES2017

## Core Features to Implement

1. **Daily Paper Display**: Show one randomly selected paper from the top 10 most cited papers published on this day in history
2. **Category Filtering**: Browse papers by specific arXiv subcategories (e.g., cs.AI, math.GT)
3. **Historical View**: Access papers featured on previous days
4. **Paper Details**: Display comprehensive metadata including title, abstract, authors, submission date, and citation count
5. **External Links**: Direct links to PDF downloads and arXiv abstract pages
6. **Share Functionality**: Social sharing capabilities

## Database Schema

See `project_info.md` for complete schema including:
- `papers` table: Core paper metadata with arXiv and Semantic Scholar data
- `daily_featured_papers` table: Tracks featured papers by date and category
- `fetch_history` table: Logs data fetching operations

## API Integration

- **arXiv API**: Paper metadata, abstracts, and submission dates
- **Semantic Scholar API**: Citation counts and additional paper metrics
- Rate limiting: 3 seconds between arXiv requests, 1 request/second for Semantic Scholar

## Environment Variables

```env
DATABASE_URL=postgresql://...
SEMANTIC_SCHOLAR_API_KEY=...
NEXT_PUBLIC_SITE_URL=https://paperbirthdays.com
```

## Development Notes

- The project uses Turbopack for faster development builds
- Font variables are available as CSS custom properties: `--font-geist-sans`, `--font-geist-mono`
- Currently contains default Next.js starter content - needs to be replaced with Paper Birthdays functionality
- Implement daily paper selection algorithm that fetches papers from last 10 years on this date, enriches with citation data, and selects from top 10 by citations