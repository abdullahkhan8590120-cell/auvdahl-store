# Supabase setup (reuse your existing `auvdahl-store` project)
1. Dashboard → SQL Editor → paste `supabase/migrations/001_core_accounts_catalog.sql` → Run. Then run `supabase/seed/seed.sql`. If you see an error, send me the exact text. These scripts have NOT been tested against a real database.
2. Project Settings → API: copy the Project URL and the anon/publishable key into `.env.local` as VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (copy `.env.example`). Never put the service-role key in a VITE_ variable.
3. Authentication → URL Configuration: Site URL `https://auvdahl.netlify.app`. Redirect URLs: `https://auvdahl.netlify.app/**` and `http://localhost:5173/**`.
4. Google sign-in: Google Cloud Console → APIs & Services → Credentials → OAuth client (Web). Authorized redirect URI = the callback URL shown in Supabase → Authentication → Providers → Google (https://<project-ref>.supabase.co/auth/v1/callback). Paste the client ID and secret into that Supabase page and enable it.
5. First admin: register on the site, then in SQL Editor run
   `update public.profiles set role='admin' where id=(select id from auth.users where email='YOUR_EMAIL');`
   Customers cannot do this themselves: the `role` column has no update permission for them.
