# ANDRES SPORTSWEARTZ - WEBSITE GUIDE

A complete mobile-first e-commerce website for Andres Sportsweartz.

This guide is written for the business owner. No programming knowledge is needed.
Just follow the steps in order.


## WHAT THE WEBSITE DOES TODAY

- Customers browse products on any phone, tablet or computer.
- They search and filter by category.
- They pick a size and quantity and add products to a bag.
- They fill in their name, phone number and delivery details.
- They receive an order reference number.
- They send the finished order to you on WhatsApp with one tap.
- You confirm stock, delivery and payment in the WhatsApp chat.

All prices are calculated on the server, so a customer cannot change them.


## BEFORE YOU START: THREE THINGS TO CHECK

1. Node.js must be installed. To check, open PowerShell and run:

```
node --version
```

You should see something like `v24.15.0`. If you see an error, install Node.js
from nodejs.org first, choosing the LTS version.

2. Your WhatsApp number must be set. See STEP 2 below.

3. You must be able to open a terminal in the project folder.


## STEP 1 - START THE WEBSITE ON YOUR COMPUTER

1. Open File Explorer and go to the project folder.
2. Click the address bar, type `powershell`, and press Enter.
   This opens a terminal already pointing at the project folder.
3. Type this command and press Enter:

```
npm.cmd run dev
```

4. Wait a few seconds. You will see a message like `Local: http://localhost:3000`.
5. Open your browser and go to:  http://localhost:3000
6. To stop the website, click in the terminal and press Ctrl + C.

Tip: keep the terminal open while you look at the website. Closing it stops the site.


## STEP 2 - SET YOUR BUSINESS DETAILS

The file `.env.local` in the project folder holds your business settings.
It has already been created for you.

How to edit it:
1. In File Explorer, right-click `.env.local` and choose Open with, then Notepad.
2. Change the values after the `=` signs.
3. Save the file.
4. Stop the website (Ctrl + C) and start it again so the new values load.

### The most important setting: your WhatsApp number

Find this line:

```
NEXT_PUBLIC_WHATSAPP_NUMBER=255000000000
```

Replace `255000000000` with your real number.

Rules for the number:
- Start with the country code with no plus sign. Tanzania is 255.
- Remove the leading zero from your number.
- No spaces and no dashes.

Example: your number is 0712 345 678
Write it as: 255712345678

WHY THIS MATTERS: every WhatsApp button on the website uses this number.
If it stays as the placeholder, customer orders will not reach you.

### Other settings you can change

```
NEXT_PUBLIC_PHONE_NUMBER=      your number as customers should dial it
NEXT_PUBLIC_BUSINESS_NAME=     your business name
NEXT_PUBLIC_CURRENCY=          TZS
NEXT_PUBLIC_BUSINESS_ADDRESS=  shown on the contact area
NEXT_PUBLIC_BUSINESS_HOURS=    shown on the contact area
NEXT_PUBLIC_INSTAGRAM_URL=     your Instagram link
NEXT_PUBLIC_FACEBOOK_URL=      your Facebook link
NEXT_PUBLIC_TIKTOK_URL=        your TikTok link
```

Leave any of these blank if you do not have them yet. Blank settings are simply
hidden from the website.


## STEP 3 - ADD YOUR PRODUCTS

All products live in ONE file:

```
src/lib/products.ts
```

Open it with Notepad. The top of the file contains full instructions. Here is a
quick reminder:

1. Copy an existing product line, including the { and } at each end.
2. Paste it on a new line inside the square brackets [ ].
3. Change the values.
4. Add a comma at the end of the line.
5. Save the file. The website updates immediately.

A product looks like this:

```
{ slug: "red-football-boots", name: "Red Football Boots", category: "Sports shoes",
  price: 95000, description: "Lightweight boots for firm ground.",
  sizes: ["39", "40", "41"], accentColor: "#dc2626", imageUrl: null,
  badge: "New", isFeatured: true },
```

Important details:
- `price` is a plain number: 95000. No commas, no currency.
- `slug` must be unique. It becomes the product web address.
- `isFeatured: true` puts the product on the homepage.
- For no badge, write `badge: null`.


## STEP 4 - ADD PRODUCT PHOTOS

1. Put your photo files in this folder:

```
public/products
```

2. Use simple file names like `red-football-boots.jpg`.
   Lowercase, no spaces.

3. In `src/lib/products.ts`, set the imageUrl for that product:

```
imageUrl: "/products/red-football-boots.jpg"
```

Until you add a photo, the website shows a clean coloured panel with the letters
AS, so your shop never looks broken or unfinished.

More photo advice is in `public/products/README.txt`.


## STEP 5 - TEST BEFORE YOU LAUNCH

Run through this on your own phone, not just on the computer:

1. Homepage opens and looks right.
2. Shop page lists all products.
3. Search finds a product by name.
4. Category buttons filter correctly.
5. Opening a product shows its photo, price, sizes and description.
6. Choosing a size and quantity and pressing Add to bag increases the bag count.
7. The bag page shows the right products and total.
8. Changing quantity and removing items works.
9. Checkout form requires name, phone, location and address.
10. Submitting shows an order reference and the correct total.
11. The WhatsApp button opens WhatsApp with the full order message.
12. Pressing Send reaches YOUR WhatsApp number.

Open the website at these widths to check the layout (in Chrome press F12, then
the phone icon):

```
360px   390px   430px   768px   1024px   desktop
```


## HOW ORDERS WORK RIGHT NOW

The website does not store orders in a database yet. This is intentional for the
first launch.

What happens when a customer orders:
1. The website checks every product, size, quantity and price on the server.
2. It creates an order reference such as `ASW-20260925-4821`.
3. The customer sees a confirmation page with their reference and total.
4. The customer taps Send order on WhatsApp.
5. The order arrives in your WhatsApp chat.
6. You confirm stock and delivery, then arrange payment.

The confirmation page says "Order ready to confirm" rather than "Order received",
so the customer never believes a thing that is not true.


## WHAT IS NOT BUILT YET

- No online payments. Mobile money and card payments can be added later.
- No customer accounts (customers cannot manage their own orders).
- No customer-facing order history page (orders are visible to you in the admin dashboard).

Everything else is built and working, including an admin dashboard at /admin,
saved orders in Supabase, and full product management through the admin area.
## STEP 6 - PUT THE WEBSITE ON THE INTERNET

You will use two free services:
- GitHub: stores a safe copy of your website code.
- Vercel: builds and runs the website for visitors.

Both have free plans suitable for a small business.

### 6a. Create your GitHub account

1. Go to https://github.com and click Sign up.
2. Use your business email address.
3. Verify your email.

### 6b. Put your code on GitHub

1. Open a terminal in the project folder (see STEP 1 for how).
2. Run these commands one at a time, pressing Enter after each:

```
git init
git add .
git commit -m "Andres Sportsweartz website"
git branch -M main
```

3. Now create an empty repository on GitHub:
   - Click the + at the top right, then New repository.
   - Name it: andres-sportsweartz
   - Choose Private so only you can see the code.
   - Do NOT tick any of the boxes about README or .gitignore.
   - Click Create repository.

4. GitHub shows you a web address like
   https://github.com/yourname/andres-sportsweartz.git
   Run these two commands, replacing the address with yours:

```
git remote add origin https://github.com/YOUR-USERNAME/andres-sportsweartz.git
git push -u origin main
```

If Windows asks you to sign in to GitHub, follow the browser prompt.

IMPORTANT: your `.env.local` file is deliberately excluded from GitHub, so your
WhatsApp number and any future secret keys stay private.

### 6c. Deploy on Vercel

1. Go to https://vercel.com and click Sign Up, then Continue with GitHub.
2. Click Add New, then Project.
3. Find and select your andres-sportsweartz repository, then click Import.
4. Vercel detects Next.js automatically. Leave all build settings as they are.
5. BEFORE you click Deploy, open the Environment Variables section and add your
   business settings. Add each one with its value:

```
NEXT_PUBLIC_WHATSAPP_NUMBER    255712345678
NEXT_PUBLIC_BUSINESS_NAME      Andres Sportsweartz
NEXT_PUBLIC_CURRENCY           TZS
NEXT_PUBLIC_PHONE_NUMBER       +255 712 345 678
NEXT_PUBLIC_BUSINESS_ADDRESS   Your town or city
NEXT_PUBLIC_BUSINESS_HOURS     Monday to Saturday, 08:00 - 19:00
```

Add these three Supabase variables as well (they are server-only, so
they are safe and must NOT be prefixed with NEXT_PUBLIC_):

    SUPABASE_URL            https://boqisnsnsxsbnorxpdug.supabase.co
    SUPABASE_ANON_KEY       your anon key from Supabase API Keys
    SUPABASE_SERVICE_ROLE_KEY your service_role key from Supabase API Keys

Find the keys in Supabase: Project Settings, API Keys.
Copy the anon key and the service_role key. The service_role key is
the longer one and is your secret. Never share it, never add NEXT_PUBLIC_
to it, and never commit it to GitHub.

6. Click Deploy and wait about two minutes.
7. Vercel gives you a link like https://andres-sportsweartz.vercel.app
   Open it and test it on your phone.

### 6d. Connect your domain

1. Buy a domain. Good choices for Tanzania:
   - andressportsweartz.co.tz (local and trustworthy for Tanzanian customers)
   - andressportsweartz.com (good if you may sell internationally)
   Helpful: your hosting provider is separate from your domain registrar. You can
   buy the domain from any registrar and still host on Vercel.
2. In Vercel, open your project, then click Settings, then Domains.
3. Type your domain and click Add.
4. Vercel shows you nameserver addresses, looking like ns1.vercel-dns.com
5. Log in to your domain registrar and find the Nameservers setting. Replace their
   nameservers with the two Vercel ones.
6. Wait. This usually takes 15 minutes, sometimes up to 24 hours.
7. Vercel automatically issues your HTTPS certificate. You do not need to buy one.
8. When it says Valid Configuration, open your domain and test everything again.

### 6e. Final production test

1. Open your real domain on a mobile phone using mobile data, not WiFi.
2. Place a test order for a real product.
3. Confirm the order arrives on your WhatsApp.
4. Delete the test conversation when done.


## HOW TO CHANGE YOUR WEBSITE AFTER LAUNCH

There are two ways, depending on where you change things:

### Changing products or photos
### Changing products

1. Sign in to the admin area at /admin.
2. Go to Products.
3. Add, edit, hide, or remove products there.
4. Upload photos through the admin area - they are stored in Supabase Storage automatically.

1. Edit `src/lib/products.ts` or add a photo to `public/products`.
2. Open a terminal in the project folder and run:

```
git add .
git commit -m "Updated products"
git push
```

3. Vercel rebuilds automatically. Changes appear in about two minutes.

### Changing your WhatsApp number or business details

1. Change the value in `.env.local` for your local copy.
2. ALSO change it in Vercel: open your project, Settings, Environment Variables,
   edit the value, then click Save and redeploy.

If you change it in only one place, the live website keeps the old value.


## SECURITY - WHAT IS PROTECTED AND HOW

| Risk | How it is handled |
|---|---|
| Customer changes a price | The server ignores any price sent by the browser and looks up the real price itself |
| Fake order flooding | Rate limiting allows 5 orders per 10 minutes per visitor, plus a hidden bot trap field |
| Bad or harmful input | Every field is length checked and validated on the server |
| Broken text layout | Phone numbers are limited to digits and the + - ( ) characters |
| Secret keys leaked | No secret keys exist in the website code; the browser never sees any |
| Technical errors shown to customers | Real errors are logged privately and customers see a friendly message |
| Admin area exposed | The admin routes are hidden and unreachable while no database is configured |

There are no passwords stored in this project at all, which means there is nothing
for an attacker to steal from it.


## WHEN SOMETHING GOES WRONG

### "npm.cmd is not recognised"
Node.js is not installed, or the terminal is not in the project folder.
Install Node.js from nodejs.org (LTS version), then reopen the terminal.

### "running scripts is disabled on this system"
This is a Windows safety setting. Use `npm.cmd` instead of `npm`. The command in
this guide already does this for you.

### The page says "This site can not be reached"
The website is not running. Start it again with `npm.cmd run dev` and make sure
the terminal window stays open.

### WhatsApp buttons do not open your chat
Your WhatsApp number is still the placeholder. Set
`NEXT_PUBLIC_WHATSAPP_NUMBER` in `.env.local`, then restart the website.
Remember: no plus sign, no spaces, no leading zero.

### A product photo does not appear
- Check the file is inside `public/products`.
- Check the file name matches exactly, including capital letters.
- Check the imageUrl in `src/lib/products.ts` starts with `/products/`.
- Example: file `boots.jpg` must be written as `/products/boots.jpg`

### The website is slow on a phone
Your photos are probably too large. Reduce them to under 300 KB each.
Free tool: https://squoosh.app

### Everything looks broken after editing products.ts
You most likely missed a comma or a quote mark. Every product line must end with
`,` and every piece of text must be inside "double quotes". Compare your line with
the examples at the top of that file. If it still fails, undo your last change
(Ctrl + Z in Notepad) and save again.

### An error appears mentioning .next and EPERM
OneDrive or antivirus is holding a file lock. Close the terminal, wait a few
seconds, and start the website again. This does not affect your live website.


## WHAT TO DO NEXT, IN ORDER

1. Set your real WhatsApp number. This is essential.
2. Replace the sample products with your real products and prices.
3. Add your real product photos.
4. Complete the phone testing checklist in STEP 5.
5. Deploy to Vercel and connect your domain.
6. Run the final production test.
7. Later, when you are ready: add online payments and a saved order history with
   an admin dashboard.