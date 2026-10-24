# UUM PayNow - Campus Cashless Quest & Security Hub

A comprehensive, interactive web application designed for **Universiti Utara Malaysia (UUM)** students and campus merchants in Sintok, Kedah. It blends seamless digital dining payments with a proactive **Trust & Safety Fraud Guard**, **OCR Bill Splitting**, **Spending Analytics**, **Loyalty Rewards**, and an embedded **AI Campus Assistant**.

---

## 🌟 Key Features & Modules

### 1. 🏠 Home Dashboard
- **Glassmorphism Wallet Card**: Live simulated wallet balance (`RM 186.40`), top-up simulation, and quick "Scan & Pay" primary CTA.
- **Monthly Overview**: This Month's Spend (`RM 145.20`), Loyalty Points (`640 pts`), Weekly Payments Progress (`5/5`), and Daily Streak (`3 Days / 6 Stamps`).
- **Quick Actions**: One-click pills for Voice Pay, Receipt OCR Split, Campus Map, and Fraud Guard.
- **🚨 Suspicious Transaction Alert Banner**: Intercept notification for unverified merchant requests with instant education links.
- **🤖 Embedded AI Campus Assistant**: Floating copilot supporting natural language inquiries (e.g., cheap meals under RM 5, canteen locations, scam verification, and automated checkout triggers).

### 2. 🏪 Campus Merchants (8 UUM Canteens)
Complete database and photos for all 8 official UUM canteens:
1. **Kafe Inasis TNB** (Laluan A) — Local breakfast & lunch, Nasi Lemak, Roti Canai, Mee Goreng.
2. **Kafe Inasis TM** (Laluan B) — Economy rice, Ayam Goreng, Teh Tarik.
3. **Kafe BSN** (Laluan B) — Noodle dishes, Mee Bandung, Kuetiau Goreng, Air Milo.
4. **Kafe Sri Jenang (Sime Darby)** (Laluan B) — Nasi Ayam, Sup Tulang, Cendol.
5. **Kafe YAB** (Laluan C) — Famous Apam Balik Boker, Burger Special, Roti John.
6. **Kafe Inasis Muamalat** (Laluan C) — Western Set, Nasi Briyani, Fried Rice.
7. **Kafe DKG6** (Other) — Grab & Go Sandwiches, Maggi Goreng, Iced Coffee.
8. **Alumni Junction Cafe** (Other) — Specialty Coffee, Croissant, Spaghetti.

### 3. 💳 Simulated Payment & Safety Loop
- **Pre-Payment Safety Check Modal**: Verifies merchant commercial registration, stall ID (e.g. `UUM-D-TNB01`), trust score (`99.8%`), and fraud registry checks before PIN authorization.
- **🎙️ Voice Pay**: Hands-free speech recognition (e.g., *"Pay RM 6.50 to Inasis TNB"*), bypassing manual typing directly to the safety check.
- **Input Validation**: Prevents zero, negative, or amounts exceeding wallet balance.
- **Clear Transaction Statuses**: Distinct receipts and styling for **Success**, **Pending Settlement**, and **Failed/Blocked** transactions with reference numbers (`TXN-YYYYMMDD-XXXX`).

### 4. 🧾 Scan & Split Hub (Direction B - Social)
- **Simulated OCR Scanner**: Scans food bills with animated laser beam, auto-extracting merchant name, date, itemized dishes, and prices.
- **Split Modes**:
  - *Equal Split (AA)*: Divides total bill evenly among friends.
  - *Itemized Split*: Assigns specific dishes to individual roommates.
- **Dynamic DuitNow Collection QR**: Generates personalized DuitNow QR with payer's exact share.
- **Repayment Tracker**: Live status of who has paid vs who is pending, with "One-Click Nudge" (WhatsApp/Ping) and "Mark as Paid" balance credits.

### 5. 📊 Spending Analytics & Merchant Insights
- **Category Donut Chart**: Breakdown of Food & Beverages (68%), Mart/Convenience (18%), Campus Bus (8%), and Academic Printing (6%).
- **Weekly Trend Bar Chart**: Daily spending from Monday to Sunday.
- **Merchant Traffic Analytics**: Simulated hourly campus dining rush hours (Breakfast, Lunch Peak 12-2 PM, Dinner Peak 6-8 PM).
- **Top 5 Campus Favorites**: Ranking of highest selling dishes across canteens.
- **Full Transaction Ledger**: Searchable, filterable transaction table with live status badges.

### 6. 🎁 Rewards, Campus Map & Leaderboard
- **Interactive Leaflet Map**: Centered at UUM Sintok with route pins for all 8 canteens and instant "Order & Pay" popups.
- **Digital Stamp Card**: Collect 10 stamps across payments to earn a RM 5.00 campus meal voucher.
- **🎡 Lucky Spin-the-Wheel**: Daily canvas mini-game to win bonus points.
- **Voucher Store**: Redeem points for free drinks, cafe discounts, and official UUM merchandise.
- **Leaderboards**: Top individual students and College rankings (COB, CAS, COLGIS).

### 7. 🛡️ Fraud Guard & Scam Academy
- **3 Interactive Scenario Simulators**:
  - *Scenario 1: Malicious QR Sticker Overlay Attack*.
  - *Scenario 2: Impersonator "UUM Bursary Aid" Phishing Portal*.
  - *Scenario 3: Overpayment Refund Trap via Fake SMS*.
- **"Spot the Fake" Awareness Quiz**: 4-question interactive test awarding **+20 bonus points** upon completion.

---

## 🚀 How to Run the Website

Use https://uumpaynow.vercel.app/


---

## 📁 Directory Structure
```
uum-paynow/
├── index.html                 # Main single-page web app
├── css/
│   └── custom.css             # Glassmorphism, animations, custom scrollbars
├── js/
│   ├── data.js                # UUM canteens, seed menus, mock state, AI knowledge
│   └── app.js                 # Reactive state, Chart.js, Leaflet, OCR, Voice, AI
├── images/
│   ├── uum_paynow_logo.svg    # Official brand logo
│   ├── duitnow_sample_qr.svg  # Verified DuitNow QR
│   ├── scam_fake_qr.svg       # Malicious sticker simulator QR
│   ├── canteen_tnb.jpg        # Kafe Inasis TNB photo
│   ├── canteen_tm.jpg         # Kafe Inasis TM photo
│   ├── canteen_bsn.jpg        # Kafe BSN photo
│   ├── canteen_simedarby.jpg  # Kafe Sri Jenang photo
│   ├── canteen_yab.jpg        # Kafe YAB photo
│   ├── canteen_muamalat.jpg   # Kafe Inasis Muamalat photo
│   ├── canteen_dkg6.jpg       # Kafe DKG6 photo
│   ├── canteen_alumni.jpg     # Alumni Junction Cafe photo
│   └── ...                    # Food & dish photography
├── vendor/
│   ├── chart.umd.min.js       # Chart.js library
│   ├── leaflet.js             # Leaflet interactive map JS
│   ├── leaflet.css            # Leaflet map CSS
│   └── canvas-confetti.js     # Confetti celebration JS
└── README.md                  # Project documentation
```
