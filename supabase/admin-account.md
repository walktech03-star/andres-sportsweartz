# How To Switch On Saved Orders And The Admin Dashboard

Your database is already connected. Two things are still missing. This guide
turns both on, in order. It takes about ten minutes.

Read it once through before you start.


### STEP 0 - FIX THE MISSING COLUMNS\n\nBefore anything else, the products table needs two columns that were added to the code but not to the database.\n\n1. In Supabase, click **SQL Editor**.\n2. Click **New query**.\n3. Paste this and click **Run**:\n\n`sql\nalter table if exists public.products add column if not exists accent_color text not null default '#1769e0';\nalter table if exists public.products add column if not exists badge text;\n`\n\n4. You should see **Success**.\n\nThis fixes the column products.accent_color does not exist error that was breaking the homepage.\n\n---\n\n## PART 1 - ADD THE SECRET KEY (about 2 minutes)

The website currently cannot save orders, because it is missing one key.

1. Open your Supabase dashboard.
2. Click Project Settings (gear icon) at the bottom of the left menu.
3. Click API Keys.
4. Find the key labelled **service_role**. It is the long one that is not called
   anon.
5. Click the copy icon next to it.

Now put it into the website:

6. Open this file in Notepad:
   `C:\Users\isaya\OneDrive\Desktop\andres-sportsweartz\.env.local`
7. Find this empty line near the bottom:

   `SUPABASE_SERVICE_ROLE_KEY=`

8. Paste the key directly after the equals sign, with no spaces and no quotes:

   `SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...your-real-key-here`

9. Save the file.
10. Close the website terminal and start it again with `npm.cmd run dev`.

NEVER send this key to anyone, never put it on a form, and never put it in a
chat. It is the master key to your database. It is safe in this one file because
that file is already excluded from GitHub.

HOW TO TELL IT WORKED
Go to http://localhost:3000/admin
If you are still sent to the sign-in page, the key is in place. The dashboard
will show "Database not connected" only if the key is missing or wrong.


## PART 2 - CREATE YOUR STAFF LOGIN (about 5 minutes)

The website uses a two-part check for staff access:

1. You must be signed in with a Supabase account.
2. That account must also be on a staff allow list.

Both parts are required. Creating a Supabase account on its own grants nothing.

### 2a. Create the sign-in account

1. In Supabase, click Authentication in the left menu.
2. Click Users.
3. Click the button **Add user** and then **Create new user**.
4. Fill in:
   - Email: your business email
   - Password: a strong password you will remember
5. IMPORTANT: tick **Auto Confirm User**. Without this, sign-in will fail.
6. Click Create.

### 2b. Add that account to the staff allow list

1. Back in Supabase, click SQL Editor, then New query.
2. Paste this, replacing the email with YOUR email:

```sql
insert into public.admin_users (id, email, full_name, role)
select id, email, 'Business Owner', 'owner'
from auth.users
where email = 'YOUR-EMAIL-HERE@example.com'
on conflict (id) do nothing;
```

3. Click Run. You should see Success.

This one row is what makes the account a staff account. Delete it later and that
person immediately loses all access, even if they still have their password.


## PART 3 - SIGN IN AND TEST

1. Start the website: `npm.cmd run dev`
2. Open http://localhost:3000/admin
3. You are sent to the staff sign-in page.
4. Enter your email and password.
5. You should now see the dashboard.

If you see "This account is signed in, but it is not on the staff allow list",
then Part 2b did not work. Check the email spelling in the SQL.


## PART 4 - ADD YOUR REAL PRODUCTS

1. Sign in to the admin area.
2. Click Products, then Add product.
3. Fill in the name, price, sizes and stock.
4. Upload a photo. Square photos work best.
5. Press Create product.

Once you have added at least one product, the shop stops using the sample
products from the code file and shows your real products instead.

The same applies to the rest of the site:

- Products page: Add, edit, hide or delete products
- Orders page: See every order, contact the customer, change the status
- Settings page: Your business details


## PART 5 - ORDERS NOW SAVE THEMSELVES

As soon as the secret key from Part 1 is in place, new orders are written to
your database automatically. Nothing else needs changing.

You will be able to tell the difference on the confirmation page:

- Before: "Order ready to confirm" (going to WhatsApp only)
- After: "Order received" (saved in your database)

Check it worked:
1. Place a test order on the website.
2. Open Supabase, click Table Editor, then click the **orders** table.
3. Your order should be there with a reference like ASW-20260925-0001.
4. Open **order_items** to see the products in it.

Delete the test order afterwards by selecting its row and clicking Delete.


## PART 6 - BEFORE YOU GO LIVE

1. Add your real products and photos.
2. Change your WhatsApp number in the settings file to your real number.
3. Add the same settings to Vercel when you deploy, as described in README.md.
4. Place one real test order and confirm it arrives in your WhatsApp.
5. Place one test order and confirm it appears in the admin dashboard.
6. Test the admin area on your phone.


## IF SOMETHING GOES WRONG

**"Database not connected" on the dashboard**
The service role key is missing or pasted incorrectly. Check for a space after
the equals sign, and make sure you copied the service_role key and not the anon
one.

**"Wrong email and password"**
Either the password is wrong, or the account was not Auto Confirmed. Open
Authentication, Users, click your account, and confirm the email is confirmed.

**"Signed in, but not on the staff allow list"**
The SQL in Part 2b did not insert a row, usually because the email does not
match exactly. Run it again with the exact email from Authentication, Users.

**Orders still say "Order ready to confirm"**
The secret key is not being read. Confirm you saved the file and restarted the
website, because the website only reads it at start-up.

**The dashboard is empty even though I added products**
If the products table is empty, the shop uses the sample list. Add one product
and it will switch over.