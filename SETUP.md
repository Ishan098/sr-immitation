# SR Immitation: Setup Guide

Total cost: ₹0 (plus ₹500–1,200/year only if you buy your own domain).

You will set up three things: a **Google Form** (to add products), a **Google Sheet** (stores them), and the **website** (shows them).

---

## Part 1: Google Form (your "add product" screen)

1. Go to forms.google.com and create a **Blank form**. Name it "Add Product".
2. Add these questions. **The question titles must be exactly these, in lowercase:**

| Title | Type | Settings |
|---|---|---|
| `name` | Short answer | Required |
| `price` | Short answer | Required. Turn on Response validation → Number |
| `category` | Dropdown | Options: Earrings, Necklaces, Bangles, Sets, Rings, Other |
| `image` | File upload | Allow only Image, max 1 file, 10 MB. Required |
| `stock` | Dropdown | Options: yes, no |
| `description` | Short answer | Optional |

3. Google will ask you to sign in to upload files. That is normal. Only people who sign in can use this form, and that is good: only you should add products. **Do not share the form link with customers.**
4. Open the **Responses** tab → click the green **Link to Sheets** icon → **Create a new spreadsheet**.

## Part 2: Make photos visible to customers

1. Open Google Drive. Find the folder named **"Add Product (File responses)"**.
2. Right-click → Share → General access → **Anyone with the link** → Viewer → Done.

Without this step, photos show only for you.

## Part 3: Publish the sheet

1. Open the linked Google Sheet (the **Form responses 1** tab).
2. File → Share → **Publish to web**.
3. In the first dropdown pick **Form responses 1**, in the second pick **Comma-separated values (.csv)**.
4. Click **Publish** and copy the link.

## Part 4: Connect the website

1. Open `app.js` in Notepad (right-click → Open with).
2. Near the top of the script, find `sheetCsv: ""` and paste your link between the quotes:
   `sheetCsv: "https://docs.google.com/spreadsheets/d/e/....output=csv"`
3. Save the file.

**Test your link first.** Paste the published link into your browser address bar. You should see (or download) plain rows of text, and the first row should list your column names (`name`, `price`, ...). If you see a web page with a table instead, go back to Part 3 and publish again, choosing **Comma-separated values (.csv)**.

Then add one product through the form, wait 2 to 5 minutes (Google refreshes published sheets slowly), and refresh the website.

## Part 5: Put the website online (free)

1. Go to netlify.com and sign up (use Google login).
2. Open **Sites** → drag the **sr-immitation folder** (the one holding all the files) onto the page.
3. Your site is live at a link like `something.netlify.app`. In Site settings you can change the name to `sr-immitation`.
4. When you change any file later, drag the folder again: Deploys → drag and drop.

## Part 6: Your own domain (optional)

1. Buy a domain (GoDaddy, Namecheap, Hostinger, BigRock). A `.in` costs around ₹500–800/year.
2. Netlify → Domain management → **Add a domain** → enter it.
3. At your registrar, change the DNS as Netlify shows you. Easiest: point the nameservers to Netlify.
4. Wait a few minutes to a few hours. The free HTTPS lock is added automatically.

## Part 7: Add your own photos to the landing page

Open the `images` folder and read `README.txt`. Save your photos there with the exact file names listed (hero.jpg, story.jpg and so on), then upload the folder again to Netlify. Missing photos show a soft colour block.

---

## Daily use

- **New product:** open your form on your phone, take the photo, fill details, submit. It shows on the site shortly after (Google can take a few minutes to refresh the published sheet).
- **Mark sold out:** open the sheet (Google Sheets app), change `stock` to `no` in that row.
- **Fix a price or delete a product:** edit or delete the row in the sheet.
- The newest 6 products get a "New" badge automatically once you have more than 6.

## Changing details

Shop name, WhatsApp number and Instagram are at the top of `app.js`. The delivery and care text is in the "Delivery and care" section of `index.html`; edit it to match your real policy.

**Files:** `index.html` (landing page), `shop.html` (full collection), `style.css` (design), `app.js` (products and cart), and the `images` folder. Keep them together.

## If something looks wrong

- **The link goes in `app.js`, not `index.html`.** If you used an older version of this project, paste it again into `app.js`.
- The site now shows a message when it cannot read the sheet. "Columns found" tells you what the sheet contains. It needs one column for the product name.
- Make sure you published the **Form responses** tab and that the sheet has at least one row of data under the headings.
- Upload (deploy) the new files to Netlify after every change to `app.js`.
- **Products do not show:** check that you pasted the CSV link and published the correct tab.
- **Photos do not show:** repeat Part 2 (Drive folder sharing).
- **Old data still showing:** wait a few minutes and hard-refresh the page.
