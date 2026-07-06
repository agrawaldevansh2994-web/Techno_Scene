# India Electronic Scene (IES) 🎵

🌍 **Live Demo:** [techno-scene.vercel.app](https://techno-scene.vercel.app/)

A premium, curated platform for discovering the best techno, house, and electronic music events across India. 
Currently launching in Mumbai, with Bangalore, Pune, and Goa coming soon.

## ✨ Features

- **Beautiful UI/UX:** A dark-mode, glassmorphism-inspired design with dynamic gradients and genre-specific color coding.
- **Dual Views:** Seamlessly toggle between a structured List View and an interactive Calendar Grid view.
- **Event Discovery:** Filter by genres like Techno, Melodic Techno, Afro House, Psy Trance, and more.
- **Community Features:** RSVP to events using the "I'm Going" feature with privacy controls (selective visibility) to connect with other ravers before the event.
- **Archive Integrations:** View past set archives natively via embedded YouTube links.

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript (built with Vite)
- **Styling:** Tailwind CSS + Vanilla CSS for animations
- **Icons:** Lucide React
- **Backend/Database:** Supabase (PostgreSQL + Auth)
- **Routing:** React Router

## 🚀 Running Locally

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.local.example` to `.env.local` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

Requires the following tables in Supabase:
- `events` (id, title, date, venue, genre, image, description, ticket_link, artist, youtube_id)
- `profiles` (id, name, instagram, whatsapp, default_visibility)
- `event_attendees` (id, event_id, user_id, visibility, created_at)

---
*No noise, just signal.*
