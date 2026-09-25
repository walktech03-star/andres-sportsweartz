# Database Setup - Andres Sportsweartz

This guide takes you from nothing to a working database.
Follow it in order. No programming knowledge is needed.

---

## What you are setting up

Supabase is the online database that stores your products, orders and customers.
It also stores your product photos and manages your admin login.

It has a free plan that is enough to start.

---

## Step 1 - Create your Supabase account

1. Open https://supabase.com in your browser.
2. Click **Start your project**.
3. Sign up with your email address, or with GitHub if you have an account.
4. Confirm your email if Supabase asks you to.

---

## Step 2 - Create the project

1. Click **New project**.
2. **Name**: type `andres-sportsweartz`
3. **Database Password**: click **Generate a password**, then copy it somewhere safe.
   You will not need it for this website, but keep it anyway.
4. **Region**: choose the region closest to Tanzania, for example
   `Europe (Frankfurt)` or `South Africa` if it is listed. Closer means faster.
5. Click **Create new project** and wait about two minutes.

---

## Step 3 - Create all the tables

1. In the left menu click **SQL Editor**.
2. Click **New query**.
3. Open the file `supabase/schema.sql` from this project.
4. Select everything in that file and copy it.
5. Paste it into the Supabase SQL editor.
6. Click **Run** (or press Ctrl + Enter).
7. You should see **Success. No rows returned**.

If you see a red error message, copy the message and send it to me.

The script is safe to run again. It will not erase your data.

---

## Step 4 - Check that it worked

1. In the left menu click **Table Editor**.
2. You should see these tables:
   - `admin_users`
   - `business_settings`
   - `categories`
   - `customers`
   - `order_items`
   - `orders`
   - `product_images`
   - `product_variants`
   - `products`
3. Open `categories`. You should see your four starter categories:
   Sports shoes, Training kits, Sportswear and Accessories.

---

## Step 5 - Copy your connection details

1. Click **Project Settings** (the gear icon at the bottom of the left menu).
2. Click **Data API**.
3. Copy the **Project URL**. It looks like `https://abcdefgh.supabase.co`.
4. Click **API Keys** in the same settings menu.
5. Copy the key labelled **service_role**.

   **IMPORTANT:** use the `service_role` key, NOT the `anon` key.
   The `service_role` key is a secret. Never share it, never put it on a
   website, and never post it in a chat.

---

## Step 6 - Put the details into the website

1. Open the project folder in File Explorer.
2. Find the file `.env.local.example`.
3. Copy and paste it in the same folder.
4. Rename the copy to exactly `.env.local`
   - If Windows hides file endings, turn on **View > File name extensions** first.
   - The final name must be `.env.local` and not `.env.local.txt`.
5. Open `.env.local` in Notepad and fill in:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=paste-your-service-role-key-here
```

6. Save the file.
7. Stop the website (press Ctrl + C in the terminal) and start it again.

---

## Step 7 - Confirm it works

1. Start the website and place a test order.
2. Open Supabase and click **Table Editor**.
3. Open the `orders` table.
4. Your test order should be listed, with a reference such as `ASW-20260925-0001`.
5. Open `order_items` to see the products in that order.

If the order appears, your database is working.

---

## Later: creating your admin login

Admin login is the next development stage. When it is ready, you will create your
staff account in Supabase under **Authentication > Users**, and then add a matching
row in the `admin_users` table. Until that row exists, nobody can reach the admin
area, which is the safe default.

---

## Security notes worth understanding

- Row Level Security is switched on for every table.
- The public website can only READ published products and categories.
- The public website cannot read orders, customers or business settings.
- Only an active admin account can change shop content.
- No visitor can write to the database from their browser.
- Orders are written only by your server, using the secret `service_role` key.
- Passwords are handled by Supabase Auth and are never stored in plain text.