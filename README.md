# ItsADate 📅

A full-stack calendar and scheduling app that helps NSFs, students, and working adults coordinate schedules and plan meetups.

🌐 **Live App:** [https://its-a-date-xi.vercel.app](https://its-a-date-xi.vercel.app)

## Features

- 🔐 User authentication (signup, login, JWT)
- 📅 Personal calendar with monthly view
- ✏️ Create, edit, and delete personal events
- 👥 Group calendars with shared events
- 🎨 Custom group colours
- 🔒 Privacy controls (public/private events and groups)
- 👤 Add members to groups by username

## Tech Stack

- **Frontend:** Next.js 16, React, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma v7
- **Auth:** JWT + bcryptjs
- **Deployment:** Vercel

## Getting Started

### Prerequisites
- Node.js
- Docker Desktop (for local development)

### Installation

1. Clone the repo:
```bash
git clone https://github.com/DarrennPoh/its-a-date.git
cd its-a-date
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables — create a `.env` file:
```
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_jwt_secret"
```

4. Start the database:
```bash
docker-compose up -d
```

5. Run migrations:
```bash
npx prisma migrate dev
```

6. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
  app/
    api/
      login/route.js          # POST /api/login
      signup/route.js         # POST /api/signup
      events/route.js         # POST + GET /api/events
      events/[id]/route.js    # GET + PUT + DELETE /api/events/[id]
      groups/route.js         # POST + GET /api/groups
      groups/[id]/route.js    # GET /api/groups/[id]
      groups/[id]/members/route.js   # POST + DELETE members
      groups/[id]/events/route.js    # POST + GET group events
      users/search/route.js   # GET /api/users/search
    dashboard/page.js         # Personal calendar + events
    groups/page.js            # Groups list
    groups/[id]/page.js       # Group detail + events
    login/page.js             # Login page
    signup/page.js            # Signup page
    components/Navbar.js      # Navigation bar
  lib/
    prisma.js                 # Prisma client
    authMiddleware.js         # JWT authentication
prisma/
  schema.prisma               # Database schema
```

## Database Schema

- **User** — id, username, email, password, birthday
- **Event** — id, title, startTime, endTime, privacy, groupId
- **UserEvent** — links users ↔ events (junction table)
- **Group** — id, name, privacy, color
- **GroupMember** — links users ↔ groups (junction table)

## Deployment

This app is deployed on [Vercel](https://vercel.com) with a [Supabase](https://supabase.com) PostgreSQL database.

Live URL: [https://its-a-date-xi.vercel.app](https://its-a-date-xi.vercel.app)

## License

MIT