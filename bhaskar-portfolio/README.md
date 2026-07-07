# Bhaskar Kanderi — Marketing Portfolio Website

A full-stack marketing portfolio site built with **React + Vite**, **Tailwind CSS**, and **Supabase** (Auth, Database, Edge Functions).

## What's included

- Public landing page with services + "Join the Club" newsletter signup
- Supabase Auth (email/password) with two roles: `admin` and `customer`
- Customer Dashboard — shows each customer their own portfolio data (RLS-protected)
- Admin Dashboard — view all customer portfolios, view subscribers, and send an email broadcast to the whole list
- Global Light/Dark mode toggle
- Persistent bottom-corner background music player (defaults to paused)
- Row Level Security (RLS) policies enforced at the database level

## Folder structure

```
bhaskar-portfolio/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── src/
│   ├── main.jsx                 # App entry point
│   ├── App.jsx                  # Routes
│   ├── index.css                # Tailwind + global styles
│   ├── lib/
│   │   └── supabaseClient.js    # Shared Supabase client
│   ├── context/
│   │   └── AuthContext.jsx      # Auth/role state + login/signup/logout
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── ThemeToggle.jsx
│   │   ├── AudioPlayer.jsx
│   │   ├── NewsletterForm.jsx
│   │   └── ProtectedRoute.jsx
│   └── pages/
│       ├── LandingPage.jsx
│       ├── Login.jsx
│       ├── Signup.jsx
│       ├── CustomerDashboard.jsx
│       └── AdminDashboard.jsx
└── supabase/
    ├── schema.sql                       # Run this in Supabase SQL editor
    └── functions/send-broadcast/
        └── index.ts                     # Edge Function for email broadcast
```

Every file has a comment block at the top explaining what it does — open any file in VS Code and read the header comment first.

---

## 1. Prerequisites

- [Node.js](https://nodejs.org/) v18 or later (check with `node -v`)
- A free [Supabase](https://supabase.com) account
- (Optional, for email broadcast) A free [Resend](https://resend.com) account

---

## 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → **New Project**. Save the database password somewhere safe.
2. Once the project is ready, go to **Project Settings → API** and copy:
   - **Project URL**
   - **anon public** key
3. Go to **SQL Editor → New query**, paste the entire contents of `supabase/schema.sql`, and click **Run**. This creates the `profiles`, `portfolios`, and `subscribers` tables plus all RLS policies.
4. Go to **Authentication → Providers** and confirm **Email** is enabled (it is by default). For easier local testing, you can turn OFF "Confirm email" under **Authentication → Settings** so new signups don't need to click a confirmation email.

### Making yourself Admin

By default every new signup becomes a `customer`. To make your own account the Admin:

1. Sign up for an account normally through the website (`/signup`).
2. In Supabase, go to **Table Editor → profiles**, find your row, and change `role` from `customer` to `admin`.
3. Log out and log back in on the site — you'll now land on `/admin`.

### Adding sample portfolio data (optional, for testing the Customer Dashboard)

In **SQL Editor**, run something like:

```sql
insert into public.portfolios (customer_id, title, description, category)
values (
  'PASTE-A-CUSTOMER-USER-ID-HERE',
  'Lake Stevens Market Update — June',
  'Median home prices in the Lake Stevens area rose 4% this quarter...',
  'Real Estate News'
);
```

You can find a user's ID in **Authentication → Users**.

---

## 3. Run the site locally

1. Unzip this project and open the folder in VS Code.
2. Open a terminal in the project root and install dependencies:

   ```bash
   npm install
   ```

3. Create your environment file:

   ```bash
   cp .env.example .env
   ```

   Then open `.env` and paste in your Supabase **Project URL** and **anon public key** from step 2 above.

4. Start the local dev server:

   ```bash
   npm run dev
   ```

5. Open your browser to **http://localhost:5173** — the site should load automatically.

That's it — the landing page, signup/login, and dashboards will all work against your live Supabase project.

---

## 4. Set up the email broadcast (optional but recommended)

The "Send Broadcast" feature in the Admin Dashboard calls a **Supabase Edge Function** rather than sending email directly from the browser (this keeps your email API key private).

1. Install the Supabase CLI: https://supabase.com/docs/guides/cli
2. Log in and link your project:

   ```bash
   supabase login
   supabase link --project-ref YOUR-PROJECT-REF
   ```

3. Sign up at [resend.com](https://resend.com), verify a sending domain (or use their test domain while developing), and grab an API key.
4. Set the secret for your Edge Function:

   ```bash
   supabase secrets set RESEND_API_KEY=your_resend_api_key
   ```

5. In `supabase/functions/send-broadcast/index.ts`, update the `from:` address to a domain/email you've verified in Resend.
6. Deploy the function:

   ```bash
   supabase functions deploy send-broadcast
   ```

Once deployed, the "Send Broadcast" tab in the Admin Dashboard will email every row in the `subscribers` table.

> Until you complete this step, the newsletter signup form and subscriber list will still work fine — only the actual "send email" action requires the deployed function + Resend key.

---

## 5. Adding background music

Drop an MP3 file named `background-music.mp3` into the `public/` folder. The player (bottom-right corner) will pick it up automatically. It starts paused by default — the user must click play, which is required by browser autoplay policies anyway.

---

## 6. Building for production

```bash
npm run build
```

This outputs a static, deployable site into the `dist/` folder, which you can host on Vercel, Netlify, Cloudflare Pages, or any static host. Remember to set the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables on your hosting provider.

---

## Troubleshooting

- **"Missing VITE_SUPABASE_URL" warning in console** → you haven't created `.env` from `.env.example`, or forgot to restart `npm run dev` after editing it (Vite only reads env vars at startup).
- **Signup works but I can't log in** → check if "Confirm email" is enabled in Supabase Auth settings; if so, you must click the confirmation link sent to your inbox first.
- **Admin Dashboard shows nothing / redirects to home** → your account's `role` in the `profiles` table is still `customer`. See "Making yourself Admin" above.
- **Broadcast button fails** → the Edge Function isn't deployed yet, or `RESEND_API_KEY` secret isn't set. See section 4.
