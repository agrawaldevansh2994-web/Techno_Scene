# Task Checklist: Community Features

- [x] **1. Database Schema**
  - [x] Create `profiles` table (id, name, instagram, whatsapp, default_visibility)
  - [x] Create `event_attendees` table (id, event_id, user_id, visibility, created_at)
  - [x] Set up Row Level Security (RLS) for the new tables

- [x] **2. Authentication UI**
  - [x] Create a Login / Signup modal or page
  - [x] Integrate Supabase Auth (Email/Password)
  - [x] Update `Header` to show Login button or User Profile avatar

- [ ] **3. Hooking up the "I'm Going" Modal**
  - [ ] Ensure user is logged in before they can RSVP (if not, show login)
  - [ ] On submit, save the attendee data to `event_attendees`
  - [ ] Save/update the user's contact info in `profiles`

- [ ] **4. "Who's Going" UI**
  - [ ] Add an Attendees section on `EventDetailsView`
  - [ ] Fetch attendees for the event from Supabase
  - [ ] Render attendees based on their visibility preference (show icons for `show-all`, just name for `name-only`, request connect for `selective`)
