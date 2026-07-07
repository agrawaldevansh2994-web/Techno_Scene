# Community Features Plan

The "I'm Going" modal is a great start. It shifts the app from being just a directory into a true **community hub**. Since electronic music (especially techno) is so community-driven, letting people connect before an event is a massive value-add.

Here is a short plan on how we can fully execute this moving forward.

## 1. User Authentication (The Prerequisite)
To make "selective visibility" and persistent profiles work, we need a basic login system. 
- **Action**: Implement Supabase Auth (Email/Password or Google/Phone OTP).
- **Why**: Users shouldn't have to type their name/IG every time they click "I'm Going". We can store this in a user profile.

## 2. Database Design (Supabase)
We will need two new tables:

**`profiles` table:**
- `id` (references auth.users)
- `name`
- `instagram`
- `whatsapp`
- `default_visibility`

**`event_attendees` table:**
- `id`
- `event_id` (references events)
- `user_id` (references profiles)
- `visibility` (name-only | show-all | selective)
- `created_at`

## 3. UI: The "Who's Going" Section
On the Event Details page, underneath the main details, we add a new section: **Attendees**.
- **The View**: A horizontal scrolling list (or a grid) of people who clicked "I'm Going".
- **Interaction**: 
  - If a user selected `show-all`, you see their name and clickable icons for IG/WhatsApp.
  - If a user selected `name-only`, you just see their name and a generic avatar.
  - If a user selected `selective`, their contact info is hidden, but there is a "Request to Connect" button.

## 4. How "Selective Visibility" Works
"Selective" is the trickiest but most valuable part for privacy.
- When User A (selective) is viewed by User B, User B sees a "Request Instagram" button.
- User A gets a notification (in-app or email) saying "User B wants to connect for [Event Name]".
- If User A accepts, User B gets access to their Instagram/WhatsApp link.
- *Simpler alternative for MVP*: Just stick to `name-only` and `show-all` for V1, and add `selective` in V2 once auth is stable.

## 5. "Raver Status" / Vibe Tags
To make connecting even easier, we can let users tag how they are attending the event.
- **Solo**: Going alone, looking to vibe with others.
- **Group**: Going with a crew.
- **Open to Solo**: Going with a group, but happy to adopt a solo raver.
- **Implementation**: Add an optional tag selection to the RSVP modal and display it as a small badge next to their name in the "Who's Going" section. This instantly helps solo ravers find each other and reduces the friction of reaching out.
