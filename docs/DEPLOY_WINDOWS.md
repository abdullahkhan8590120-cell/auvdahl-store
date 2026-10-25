# Deploying to your EXISTING site (Windows CMD + Git)

Nothing here creates a new repository, Netlify site or Supabase project, uses force-push, or deletes Git history. Open **Command Prompt** (not PowerShell). Commands assume Git 2.55 and your repo `https://github.com/abdullahkhan8590120-cell/auvdahl-store.git`. If your default branch is not `main`, replace `main` below (step 2 shows it).

## 0. Before you start
- Install Node.js LTS 22 from nodejs.org, then check: `node -v` (must be 20.19 or newer).
- Put the downloaded `auvdahl-store-final.zip` in your Downloads folder.

## 1. Unzip
```
mkdir C:\AUVDAHL
tar -xf "%USERPROFILE%\Downloads\auvdahl-store-final.zip" -C C:\AUVDAHL
dir C:\AUVDAHL\auvdahl-store-final
```
You should see `src`, `public`, `netlify`, `supabase`, `package.json` and so on.

## 2. Clone and BACK UP the current working site
```
cd /d C:\AUVDAHL
git clone https://github.com/abdullahkhan8590120-cell/auvdahl-store.git
cd /d C:\AUVDAHL\auvdahl-store
git branch --show-current
git log --oneline -5
git status
git archive --format=zip -o C:\AUVDAHL\auvdahl-store-BACKUP-main.zip HEAD
git tag backup-before-redesign
git push origin backup-before-redesign
```
You now have a ZIP backup, a permanent Git tag on GitHub, and Netlify still holds every earlier deploy.

## 3. Work on a separate branch (production is not touched)
```
git checkout -b redesign-royal-obsidian
```

## 4. Copy the finished project into the repository
`/MIR` makes the folder match the new project exactly (it removes the old image crops and other obsolete files from the working folder). `.git`, `node_modules` and any `.env` files are protected.
```
robocopy C:\AUVDAHL\auvdahl-store-final C:\AUVDAHL\auvdahl-store /MIR /XD .git node_modules dist .netlify /XF .env .env.local
```
Robocopy prints a summary; exit codes 0 to 7 mean success.

## 5. Check what changed
```
git status
git diff --stat
git status --short | findstr /i "\.env"
```
The last command must show nothing, or only `.env.example`. If it shows `.env` or `.env.local`, stop and do not commit.

## 6. Install, type-check, build and test on your laptop
```
npm ci
npm run build
npm test
```
`npm run build` runs `tsc --noEmit` first, so it is your TypeScript check. All three must finish without errors. If you see an error, copy the exact text to me. (If you see "esbuild" binary errors: `npm rebuild esbuild`.)

## 7. Commit and push the branch (not main)
```
git config user.name
git config user.email
```
If either is blank: `git config user.name "Your Name"` and `git config user.email "you@example.com"`.
```
git add -A
git status
git commit -m "Royal Obsidian redesign, new product images, SEO, admin and security improvements"
git push -u origin redesign-royal-obsidian
```
A browser sign-in window may open for GitHub the first time.

## 8. Safe preview BEFORE production
1. Netlify > your site > **Site configuration > Build & deploy > Branches and deploy contexts**: set Branch deploys to "Let me add individual branches" and add `redesign-royal-obsidian`. Netlify builds it at `https://redesign-royal-obsidian--auvdahl-store.netlify.app`.
2. Confirm the environment variables in `docs/ENV_CHECKLIST.md` exist (they are shared with production).
3. In Supabase, add `https://*--auvdahl-store.netlify.app/**` to Authentication > URL Configuration > Redirect URLs.
4. Run migration 004 as described in `docs/MIGRATIONS.md`, then open **Admin > Settings** and check or enter your bank details.
5. **The preview uses your real production database.** Any test order is a real row. Use one test order, then cancel it in the admin so its reserved stock is released.
6. Walk through the checklist in step 10 on the preview URL.

## 9. Go live (only after you approve the preview)
**Recommended: on GitHub.** Open the repo > Pull requests > "Compare & pull request" for `redesign-royal-obsidian` > Create > Merge pull request (a normal merge commit). Netlify then deploys `main` to https://auvdahl-store.netlify.app.

**Or in CMD:**
```
git checkout main
git pull --ff-only origin main
git merge --no-ff redesign-royal-obsidian -m "Merge Royal Obsidian redesign"
git push origin main
```
Netlify deploys automatically when `main` changes. Watch it under Netlify > Deploys (about 1 to 2 minutes). To trigger by hand: Deploys > Trigger deploy > Deploy site.

## 10. Verify the live website
- [ ] Home loads with the Zaffir hero; the logo text and fonts look right on phone and laptop.
- [ ] All six products open; each shows its own photo, correct name (ZAFFIR), price and notes (LYRANA top note: Peony).
- [ ] Add to cart, change quantity, remove; totals in SAR. Cart badge updates.
- [ ] Stock badges match your real inventory; a product with 0 stock shows "Sold out".
- [ ] Register, confirm email, sign in, sign out, "Forgot password" email arrives and the link works.
- [ ] Checkout validates fields; COD order is created, shows an order number, status "Payment pending".
- [ ] Bank transfer order shows YOUR bank details (not a placeholder), upload a receipt: status becomes "Awaiting verification", never "Paid".
- [ ] PayPal shows "(not available yet)" until configured, or works in sandbox.
- [ ] Admin: only your admin account can open /admin; a normal account sees "Access denied". Orders, receipt link, approve/reject, COD collected, status change, stock edit and On sale toggle work.
- [ ] A second customer cannot open another customer's `/order/...` link.
- [ ] Footer links, /shipping, /returns, /privacy, /terms, /about, /contact open; no "Content required" boxes remain (see `docs/CONTENT_NEEDED.md`).
- [ ] `https://auvdahl-store.netlify.app/sitemap.xml` and `/robots.txt` load.
- [ ] Check on a phone: no sideways scrolling.

## 11. Roll back if something goes wrong
**Fastest (about a minute, no Git):** Netlify > Deploys > open the last good Production deploy from before today > **Publish deploy**.

**Clean Git rollback (creates a new commit, keeps history):**
```
cd /d C:\AUVDAHL\auvdahl-store
git checkout main
git pull --ff-only origin main
git log --oneline -5
```
Find the merge commit (the top "Merge Royal Obsidian redesign") and copy its short hash, then:
```
git revert -m 1 PASTE_HASH_HERE
git push origin main
```
**Database:** only if you must go back to the old site, run `docs/ROLLBACK_004.sql` (it makes bank details and stock public again). Your orders, customers and inventory are never touched by 004 or by rollback.

**Reference copies:** your tag `backup-before-redesign` and `C:\AUVDAHL\auvdahl-store-BACKUP-main.zip` hold the exact pre-redesign code.

## Troubleshooting
- Build fails on Netlify with a Node error: confirm `netlify.toml` has `NODE_VERSION = "22"` and clear cache > deploy.
- Build fails with "secrets detected": add `SECRETS_SCAN_OMIT_KEYS = VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY` as a Netlify variable (these two are public by design).
- Orders fail with "server not configured": `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is missing in Netlify.
- Login emails or Google sign-in redirect to the wrong place: fix Supabase Site URL and Redirect URLs.
