// UUM PayNow - Master Data & Seed Knowledge Base (100% English Edition)
window.UUM_DATA = {
  // Multi-Account Switcher Profiles (Student vs Merchant)
  accounts: [
    {
      id: "acc-alex",
      name: "Alex Tan",
      role: "Student",
      badge: "COB • Sintok",
      faculty: "College of Business (COB)",
      matricNo: "298412",
      walletBalance: 186.40,
      monthSpent: 145.20,
      points: 640,
      weeklyPayments: 5,
      weeklyTarget: 5,
      streakDays: 3,
      stamps: 6,
      maxStamps: 10,
      avatar: "images/avatar_alex.jpg",
      isCurrent: true
    },
    {
      id: "acc-nurul",
      name: "Nurul Izzah",
      role: "Student",
      badge: "CAS • Sintok",
      faculty: "College of Arts & Sciences (CAS)",
      matricNo: "297554",
      walletBalance: 94.20,
      monthSpent: 180.50,
      points: 420,
      weeklyPayments: 3,
      weeklyTarget: 5,
      streakDays: 5,
      stamps: 2,
      maxStamps: 10,
      avatar: "images/avatar_nurul.jpg",
      isCurrent: false
    },
    {
      id: "acc-ali",
      name: "Pakcik Ali (Kafe TNB)",
      role: "Merchant",
      badge: "Laluan A Vendor",
      faculty: "Campus Food Services / Vendor",
      matricNo: "MERCH-TNB-01",
      walletBalance: 1485.50,
      monthSpent: 380.00,
      points: 1250,
      weeklyPayments: 142,
      weeklyTarget: 100,
      streakDays: 30,
      stamps: 10,
      maxStamps: 10,
      avatar: "images/canteen_tnb.jpg",
      isCurrent: false
    }
  ],

  // Current Active User Profile (Defaults to Alex Tan)
  user: {
    name: "Alex Tan",
    role: "Student",
    badge: "COB • Sintok",
    faculty: "College of Business (COB)",
    matricNo: "298412",
    walletBalance: 186.40,
    monthSpent: 145.20,
    points: 640,
    weeklyPayments: 5,
    weeklyTarget: 5,
    streakDays: 3,
    stamps: 6,
    maxStamps: 10,
    avatar: "images/avatar_alex.jpg"
  },

  // Mini-Games & Challenges (Matches user uploaded image media_1792760633452_31d634c5.png)
  challenges: [
    {
      id: "ch-checkin",
      title: "Daily Check-In",
      desc: "Log in every day for 7 days",
      reward: 50,
      rewardText: "+50 pts",
      status: "available",
      streakHistory: [true, true, true, false, false, false, false],
      currentDay: 4,
      btnText: "Check In Today",
      iconType: "checkin"
    },
    {
      id: "ch-scanpro",
      title: "Scan & Pay Pro",
      desc: "Complete 5 QR payments this week",
      reward: 100,
      rewardText: "+100 pts",
      status: "done",
      progress: "5 / 5 payments completed",
      btnText: "Done",
      iconType: "scanpro"
    },
    {
      id: "ch-billsplitter",
      title: "Bill Splitter",
      desc: "Split a bill with 3+ friends",
      reward: 75,
      rewardText: "+75 pts",
      status: "available",
      progress: "0 / 1 split completed",
      btnText: "Start",
      iconType: "billsplitter"
    },
    {
      id: "ch-invite",
      title: "Invite Coursemates",
      desc: "Invite campus coursemates to join PayNow",
      reward: 80,
      rewardText: "+80 pts",
      status: "available",
      progress: "2 friends joined so far",
      btnText: "Invite",
      iconType: "invite"
    },
    {
      id: "ch-scamdetective",
      title: "Scam Detective",
      desc: "Complete weekly fraud awareness quiz",
      reward: 50,
      rewardText: "+50 pts",
      status: "available",
      progress: "New questions ready",
      btnText: "Start",
      iconType: "scamdetective"
    }
  ],

  // Referral details
  referral: {
    code: "UUM-ALEX2984",
    link: "https://paynow.uum.edu.my/join?ref=UUM-ALEX2984",
    totalInvited: 2,
    earnedPoints: 160
  },

  // Saved Campus Friends for Bill Splitting & P2P DuitNow Transfers
  savedFriends: [
    {
      id: "f-1",
      name: "Sarah Lim",
      studentId: "297118",
      phone: "+60 12-345 6789",
      faculty: "College of Business (COB)",
      bankName: "Maybank",
      accountNo: "1142 8932 7701",
      duitNowId: "+60123456789",
      avatarInitial: "SL",
      avatarBg: "bg-pink-500"
    },
    {
      id: "f-2",
      name: "Amirul Hakim",
      studentId: "295402",
      phone: "+60 17-889 1234",
      faculty: "College of Arts & Sciences (CAS)",
      bankName: "Bank Islam",
      accountNo: "0201 1200 4892",
      duitNowId: "+60178891234",
      avatarInitial: "AH",
      avatarBg: "bg-blue-500"
    },
    {
      id: "f-3",
      name: "Daniel Wong",
      studentId: "298011",
      phone: "+60 11-234 5678",
      faculty: "COLGIS Law & Gov",
      bankName: "CIMB Bank",
      accountNo: "7058 9123 4450",
      duitNowId: "+60112345678",
      avatarInitial: "DW",
      avatarBg: "bg-emerald-500"
    },
    {
      id: "f-4",
      name: "Siti Nurhaliza",
      studentId: "296334",
      phone: "+60 19-876 5432",
      faculty: "College of Arts & Sciences (CAS)",
      bankName: "Touch 'n Go eWallet",
      accountNo: "TNG-60198765432",
      duitNowId: "+60198765432",
      avatarInitial: "SN",
      avatarBg: "bg-purple-500"
    }
  ],

  // Supported Banks & Channels for Top-Up and P2P Transfers
  banks: [
    { id: "maybank", name: "Maybank2u", code: "MBB", color: "bg-amber-400 text-slate-900", icon: "🦁" },
    { id: "cimb", name: "CIMB Clicks", code: "CIMB", color: "bg-red-600 text-white", icon: "🔴" },
    { id: "bankislam", name: "Bank Islam", code: "BIMB", color: "bg-red-800 text-white", icon: "🌙" },
    { id: "rhb", name: "RHB Now", code: "RHB", color: "bg-blue-600 text-white", icon: "🔵" },
    { id: "publicbank", name: "Public Bank", code: "PBB", color: "bg-red-700 text-white", icon: "⭐" },
    { id: "tng", name: "Touch 'n Go eWallet", code: "TNG", color: "bg-blue-500 text-white", icon: "📱" }
  ],

  // Security Configuration (PIN & Biometric Fingerprint)
  security: {
    defaultPin: "123456",
    biometricSupported: true
  },

  // Active User Vouchers with explicit deduction rules and applicable stalls
  activeVouchers: [
    {
      id: "v-sub5",
      name: "RM 5.00 Campus Meal Subsidy",
      canteen: "Valid at Any Canteen",
      canteenId: null, // null means all
      discountType: "fixed",
      discountValue: 5.00,
      minSpend: 6.00,
      code: "UUM-MEAL-SUB5",
      howItWorks: "Select this voucher during checkout in the Pay tab to automatically deduct RM 5.00 from your order total.",
      validUntil: "31 Dec 2026",
      status: "active"
    },
    {
      id: "v-tea100",
      name: "Free Iced Teh Tarik Voucher",
      canteen: "Kafe Inasis TM",
      canteenId: 2,
      discountType: "fixed",
      discountValue: 1.80,
      minSpend: 2.00,
      code: "UUM-TEH-FREE",
      howItWorks: "Valid exclusively at Kafe Inasis TM. Deducts RM 1.80 (full price of Teh Tarik) upon payment.",
      validUntil: "15 Dec 2026",
      status: "active"
    },
    {
      id: "v-alumni10",
      name: "10% Off Alumni Junction Cafe",
      canteen: "Alumni Junction Cafe",
      canteenId: 8,
      discountType: "percent",
      discountValue: 10,
      minSpend: 5.00,
      code: "ALUMNI-10OFF",
      howItWorks: "Valid at Alumni Junction Cafe. Automatically reduces total bill by 10% during digital payment.",
      validUntil: "30 Nov 2026",
      status: "active"
    }
  ],

  // Pre-loaded recorded bills showing multi-bill cumulative debt
  initialRecordedBills: [
    {
      id: "BILL-20261023-01",
      title: "Kafe Inasis TM Lunch",
      canteen: "Kafe Inasis TM",
      canteenId: 2,
      date: "23 Oct 2026, 12:45 PM",
      total: 19.30,
      payer: "Alex Tan (You)",
      participants: [
        {
          friendId: "f-1",
          friendName: "Sarah Lim",
          phone: "+60 12-345 6789",
          items: ["Ayam Goreng (RM 5.50)", "Teh Tarik (RM 1.80)", "Side Rice (RM 1.20)"],
          amount: 8.50,
          status: "pending"
        },
        {
          friendId: "f-2",
          friendName: "Amirul Hakim",
          phone: "+60 17-889 1234",
          items: ["Mee Goreng Basah (RM 4.80)"],
          amount: 4.80,
          status: "pending"
        },
        {
          friendId: "user",
          friendName: "Alex Tan (You)",
          phone: "+60 14-888 9999",
          items: ["Nasi Campur (RM 6.00)"],
          amount: 6.00,
          status: "paid"
        }
      ]
    },
    {
      id: "BILL-20261022-02",
      title: "Alumni Junction Cafe Study Session",
      canteen: "Alumni Junction Cafe",
      canteenId: 8,
      date: "22 Oct 2026, 04:15 PM",
      total: 21.50,
      payer: "Alex Tan (You)",
      participants: [
        {
          friendId: "f-1",
          friendName: "Sarah Lim",
          phone: "+60 12-345 6789",
          items: ["Spaghetti Bolognese (RM 7.50)", "Butter Croissant (RM 4.00)"],
          amount: 11.50,
          status: "pending"
        },
        {
          friendId: "user",
          friendName: "Alex Tan (You)",
          phone: "+60 14-888 9999",
          items: ["Vanilla Latte (RM 5.00)", "Iced Americano (RM 5.00)"],
          amount: 10.00,
          status: "paid"
        }
      ]
    },
    {
      id: "BILL-20261021-03",
      title: "Kafe YAB Night Supper",
      canteen: "Kafe YAB",
      canteenId: 5,
      date: "21 Oct 2026, 09:30 PM",
      total: 18.50,
      payer: "Alex Tan (You)",
      participants: [
        {
          friendId: "f-2",
          friendName: "Amirul Hakim",
          phone: "+60 17-889 1234",
          items: ["Burger Special (Beef) (RM 6.00)"],
          amount: 6.00,
          status: "pending"
        },
        {
          friendId: "f-3",
          friendName: "Daniel Wong",
          phone: "+60 11-234 5678",
          items: ["Roti John Ayam (RM 5.50)", "Apam Balik Boker (RM 2.00)"],
          amount: 7.50,
          status: "pending"
        },
        {
          friendId: "user",
          friendName: "Alex Tan (You)",
          phone: "+60 14-888 9999",
          items: ["Apam Balik Boker (RM 2.00)", "Mineral Water (RM 3.00)"],
          amount: 5.00,
          status: "paid"
        }
      ]
    }
  ],

  // 8 UUM Canteens matching seed data exactly
  canteens: [
    {
      id: 1,
      name: "Kafe Inasis TNB",
      category: "Laluan A",
      latitude: 6.464300,
      longitude: 100.500200,
      photo_url: "images/canteen_tnb.jpg",
      description: "Located at Kolej Inasis Tunku Najihah (TNB), serves local breakfast and lunch dishes.",
      hours: "7:30 AM - 9:00 PM",
      rating: 4.8,
      distance: "120 m",
      promo: "10% off with digital payment",
      verified: true,
      merchantCode: "UUM-D-TNB01",
      trustScore: 99.8,
      tags: ["Breakfast", "Local", "Laluan A"]
    },
    {
      id: 2,
      name: "Kafe Inasis TM",
      category: "Laluan B",
      latitude: 6.463600,
      longitude: 100.501500,
      photo_url: "images/canteen_tm.jpg",
      description: "Located at Kolej Inasis Tun Mahathir (TM), popular for economy rice and beverages.",
      hours: "7:00 AM - 10:00 PM",
      rating: 4.9,
      distance: "180 m",
      promo: "Free drink with orders over RM 10",
      verified: true,
      merchantCode: "UUM-D-TM02",
      trustScore: 99.9,
      tags: ["Economy Rice", "Drinks", "Laluan B"]
    },
    {
      id: 3,
      name: "Kafe BSN",
      category: "Laluan B",
      latitude: 6.462900,
      longitude: 100.502100,
      photo_url: "images/canteen_bsn.jpg",
      description: "Cafe located near Kolej BSN, known for noodle dishes and snacks.",
      hours: "8:00 AM - 8:30 PM",
      rating: 4.6,
      distance: "250 m",
      promo: "+5 pts extra bonus on noodles",
      verified: true,
      merchantCode: "UUM-D-BSN03",
      trustScore: 99.5,
      tags: ["Noodles", "Snacks", "Laluan B"]
    },
    {
      id: 4,
      name: "Kafe Sri Jenang (Sime Darby)",
      category: "Laluan B",
      latitude: 6.462000,
      longitude: 100.501000,
      photo_url: "images/canteen_simedarby.jpg",
      description: "Located at Kolej Sime Darby (DPP), offers a variety of rice and side dishes.",
      hours: "7:30 AM - 9:30 PM",
      rating: 4.7,
      distance: "310 m",
      promo: "Free Cendol on orders above RM 12",
      verified: true,
      merchantCode: "UUM-D-SD04",
      trustScore: 99.7,
      tags: ["Nasi Ayam", "Sup Tulang", "Laluan B"]
    },
    {
      id: 5,
      name: "Kafe YAB",
      category: "Laluan C",
      latitude: 6.465800,
      longitude: 100.503400,
      photo_url: "images/canteen_yab.jpg",
      description: "Located at Kolej YAB, multiple stalls including Apam Balik Boker YAB.",
      hours: "8:00 AM - 10:30 PM",
      rating: 4.9,
      distance: "350 m",
      promo: "Buy 5 Apam Balik get 1 Free",
      verified: true,
      merchantCode: "UUM-D-YAB05",
      trustScore: 99.9,
      tags: ["Apam Balik", "Burgers", "Laluan C"]
    },
    {
      id: 6,
      name: "Kafe Inasis Muamalat",
      category: "Laluan C",
      latitude: 6.466500,
      longitude: 100.504100,
      photo_url: "images/canteen_muamalat.jpg",
      description: "Located at Kolej Muamalat, serves Western and local food options.",
      hours: "8:00 AM - 9:00 PM",
      rating: 4.7,
      distance: "420 m",
      promo: "Western Set combo with drink RM 9.00",
      verified: true,
      merchantCode: "UUM-D-MUAM06",
      trustScore: 99.6,
      tags: ["Western", "Briyani", "Laluan C"]
    },
    {
      id: 7,
      name: "Kafe DKG6",
      category: "Other",
      latitude: 6.461000,
      longitude: 100.498500,
      photo_url: "images/canteen_dkg6.jpg",
      description: "Located near Dewan Kuliah Gabungan 6 (DKG6), convenient for students between classes.",
      hours: "8:00 AM - 6:00 PM",
      rating: 4.5,
      distance: "90 m",
      promo: "Grab & Go Sandwich + Coffee RM 6.50",
      verified: true,
      merchantCode: "UUM-D-DKG07",
      trustScore: 99.4,
      tags: ["Quick Bites", "Lecture Hall", "Other"]
    },
    {
      id: 8,
      name: "Alumni Junction Cafe",
      category: "Other",
      latitude: 6.460200,
      longitude: 100.497800,
      photo_url: "images/canteen_alumni.jpg",
      description: "Located at the Alumni Junction, popular spot for coffee and light meals.",
      hours: "8:30 AM - 11:00 PM",
      rating: 4.9,
      distance: "500 m",
      promo: "15% off espresso drinks before 10 AM",
      verified: true,
      merchantCode: "UUM-D-ALUM08",
      trustScore: 100.0,
      tags: ["Specialty Coffee", "Pastries", "Pasta", "Other"]
    }
  ],

  // Canteen Menu seed items matching prompt SQL table
  menus: {
    1: [
      { id: 101, name: "Nasi Lemak", price: 4.50, tag: "Signature", image: "images/nasi_lemak.jpg" },
      { id: 102, name: "Roti Canai", price: 1.50, tag: "Popular", image: "images/roti_canai.jpg" },
      { id: 103, name: "Mee Goreng", price: 5.00, tag: "Cooked Fresh", image: "images/noodles.jpg" }
    ],
    2: [
      { id: 201, name: "Nasi Campur", price: 6.00, tag: "Budget Meal", image: "images/nasi_lemak.jpg" },
      { id: 202, name: "Ayam Goreng", price: 5.50, tag: "Crispy", image: "images/canteen_tm.jpg" },
      { id: 203, name: "Teh Tarik", price: 1.80, tag: "Hot / Iced", image: "images/drink_tea.jpg" }
    ],
    3: [
      { id: 301, name: "Mee Bandung", price: 5.50, tag: "Spicy & Savory", image: "images/noodles.jpg" },
      { id: 302, name: "Kuetiau Goreng", price: 5.00, tag: "Wok Hei", image: "images/noodles.jpg" },
      { id: 303, name: "Air Milo", price: 2.00, tag: "Iced Milo Gao", image: "images/drink_tea.jpg" }
    ],
    4: [
      { id: 401, name: "Nasi Ayam", price: 6.50, tag: "Hainanese", image: "images/nasi_lemak.jpg" },
      { id: 402, name: "Sup Tulang", price: 7.00, tag: "Rich Broth", image: "images/canteen_simedarby.jpg" },
      { id: 403, name: "Cendol", price: 2.50, tag: "Dessert", image: "images/drink_tea.jpg" }
    ],
    5: [
      { id: 501, name: "Apam Balik Boker", price: 2.00, tag: "Campus Legend", image: "images/roti_canai.jpg" },
      { id: 502, name: "Burger Special", price: 6.00, tag: "Ramly Style", image: "images/burger.jpg" },
      { id: 503, name: "Roti John", price: 5.50, tag: "Cheesy", image: "images/burger.jpg" }
    ],
    6: [
      { id: 601, name: "Nasi Briyani", price: 7.00, tag: "Fragrant Spices", image: "images/nasi_lemak.jpg" },
      { id: 602, name: "Western Set", price: 8.00, tag: "Chicken Chop", image: "images/burger.jpg" },
      { id: 603, name: "Fried Rice", price: 5.00, tag: "Kampung Style", image: "images/noodles.jpg" }
    ],
    7: [
      { id: 701, name: "Sandwich", price: 4.00, tag: "Egg Mayo / Tuna", image: "images/canteen_dkg6.jpg" },
      { id: 702, name: "Maggi Goreng", price: 4.50, tag: "Comfort Food", image: "images/noodles.jpg" },
      { id: 703, name: "Iced Coffee", price: 3.00, tag: "Kaw Coffee", image: "images/coffee.jpg" }
    ],
    8: [
      { id: 801, name: "Latte", price: 5.00, tag: "Arabica Roast", image: "images/coffee.jpg" },
      { id: 802, name: "Croissant", price: 4.00, tag: "Butter Flaky", image: "images/canteen_alumni.jpg" },
      { id: 803, name: "Spaghetti", price: 7.50, tag: "Bolognese / Carbonara", image: "images/noodles.jpg" }
    ]
  },

  // Sample OCR receipts available for scanning
  sampleReceipts: [
    {
      id: "rec-01",
      title: "Inasis TM Lunch Combo",
      merchant: "Kafe Inasis TM",
      canteenId: 2,
      date: "23 Oct 2026, 12:45 PM",
      total: 13.30,
      items: [
        { id: "item-1", name: "Nasi Campur", price: 6.00, assignedTo: "user" },
        { id: "item-2", name: "Ayam Goreng", price: 5.50, assignedTo: "f-1" },
        { id: "item-3", name: "Teh Tarik", price: 1.80, assignedTo: "f-1" }
      ]
    },
    {
      id: "rec-02",
      title: "Alumni Cafe Study Session",
      merchant: "Alumni Junction Cafe",
      canteenId: 8,
      date: "22 Oct 2026, 04:15 PM",
      total: 16.50,
      items: [
        { id: "item-4", name: "Spaghetti Bolognese", price: 7.50, assignedTo: "f-1" },
        { id: "item-5", name: "Vanilla Latte", price: 5.00, assignedTo: "user" },
        { id: "item-6", name: "Butter Croissant", price: 4.00, assignedTo: "f-1" }
      ]
    },
    {
      id: "rec-03",
      title: "YAB Night Bites with Roommates",
      merchant: "Kafe YAB",
      canteenId: 5,
      date: "21 Oct 2026, 09:30 PM",
      total: 15.50,
      items: [
        { id: "item-7", name: "Burger Special (Beef)", price: 6.00, assignedTo: "f-2" },
        { id: "item-8", name: "Roti John Ayam", price: 5.50, assignedTo: "f-3" },
        { id: "item-9", name: "Apam Balik Boker (2x)", price: 4.00, assignedTo: "shared" }
      ]
    }
  ],

  // Recent Transactions stream with distinct status badges
  initialTransactions: [
    {
      id: "TXN-20261023-8941",
      title: "Kafe Inasis TNB",
      category: "Food",
      amount: 6.00,
      type: "debit",
      status: "success",
      timestamp: "Today, 1:15 PM",
      notes: "Nasi Lemak + Roti Canai",
      pointsEarned: 10
    },
    {
      id: "TXN-20261023-8812",
      title: "Inasis TM Mart",
      category: "Mart",
      amount: 14.50,
      type: "debit",
      status: "success",
      timestamp: "Today, 10:20 AM",
      notes: "Stationery & Mineral Water",
      pointsEarned: 15
    },
    {
      id: "TXN-20261022-7749",
      title: "Campus Shuttle Bus Card Top-up",
      category: "Transport",
      amount: 10.00,
      type: "debit",
      status: "success",
      timestamp: "Yesterday, 04:40 PM",
      notes: "Laluan B Transit Card",
      pointsEarned: 5
    },
    {
      id: "TXN-20261022-7620",
      title: "Alumni Junction Cafe",
      category: "Food",
      amount: 12.50,
      type: "debit",
      status: "pending",
      timestamp: "Yesterday, 02:15 PM",
      notes: "Latte + Spaghetti (Awaiting Bank Settlement)",
      pointsEarned: 0
    },
    {
      id: "TXN-20261021-6531",
      title: "Unverified Merchant: 'Cafe Vista Official'",
      category: "Food",
      amount: 120.00,
      type: "debit",
      status: "flagged",
      timestamp: "21 Oct, 11:15 PM",
      notes: "BLOCKED: Suspicious QR code overlay detected by Guard",
      pointsEarned: 0
    },
    {
      id: "TXN-20261020-5402",
      title: "DKG6 Printing & Copy Center",
      category: "Academic",
      amount: 8.20,
      type: "debit",
      status: "success",
      timestamp: "20 Oct, 03:00 PM",
      notes: "Management Assignment Printing",
      pointsEarned: 8
    }
  ],

  // Rewards catalog & vouchers to redeem
  rewards: [
    {
      id: "rew-1",
      name: "Free Iced Teh Tarik Voucher",
      canteen: "Kafe Inasis TM",
      pointsReq: 100,
      value: "RM 1.80 Value",
      image: "images/drink_tea.jpg",
      code: "UUM-TEH-FREE",
      deductionGuide: "Automatically deducts RM 1.80 from total at Kafe Inasis TM, or present voucher barcode at stall counter.",
      stock: 45
    },
    {
      id: "rew-2",
      name: "10% Off Entire Meal Voucher",
      canteen: "Alumni Junction Cafe",
      pointsReq: 150,
      value: "10% Off Bill",
      image: "images/coffee.jpg",
      code: "ALUMNI-10OFF",
      deductionGuide: "Applies 10% discount on coffee and pasta during digital payment at Alumni Junction Cafe.",
      stock: 30
    },
    {
      id: "rew-3",
      name: "UUM Official Lanyard",
      canteen: "UUM Co-op Bookstore",
      pointsReq: 120,
      value: "Campus Merch",
      image: "images/hero_uum.jpg",
      code: "UUM-LANYARD-GIFT",
      deductionGuide: "Redeem directly at UUM Student Centre Co-op counter by showing redemption code.",
      stock: 20
    },
    {
      id: "rew-4",
      name: "RM 5.00 Campus Meal Subsidy",
      canteen: "Valid at Any Canteen",
      pointsReq: 250,
      value: "RM 5.00 Off",
      image: "images/nasi_lemak.jpg",
      code: "UUM-MEAL-SUB5",
      deductionGuide: "Deducts RM 5.00 instantly from your order at any official UUM canteen stall.",
      stock: 15
    },
    {
      id: "rew-5",
      name: "Eco Tumbler (UUM Green Campus)",
      canteen: "Student Centre Hub",
      pointsReq: 400,
      value: "Official Merch",
      image: "images/boba.jpg",
      code: "UUM-ECO-TUMBLER",
      deductionGuide: "Collect physical tumbler at Student Affairs Building counter with voucher barcode.",
      stock: 8
    },
    {
      id: "rew-6",
      name: "UUM Varsity Hoodie",
      canteen: "UUM Brand Store",
      pointsReq: 600,
      value: "Limited Merch",
      image: "images/avatar_alex.jpg",
      code: "UUM-HOODIE-2026",
      deductionGuide: "Claim official UUM varsity hoodie at Chancellery Store using redemption code.",
      stock: 3
    }
  ],

  // Leaderboard data
  leaderboard: {
    individuals: [
      { rank: 1, name: "Aisyah Rahman", faculty: "College of Business (COB)", points: 1240, payments: 18, avatar: "AR" },
      { rank: 2, name: "Amirul Hakim", faculty: "College of Arts & Sciences (CAS)", points: 980, payments: 14, avatar: "AH" },
      { rank: 3, name: "Siti Nurhaliza", faculty: "College of Arts & Sciences (CAS)", points: 760, payments: 11, avatar: "SN" },
      { rank: 4, name: "Alex Tan (You)", faculty: "College of Business (COB)", points: 640, payments: 9, avatar: "AT", isUser: true },
      { rank: 5, name: "Daniel Wong", faculty: "COLGIS Law & Gov", points: 580, payments: 8, avatar: "DW" },
      { rank: 6, name: "Farah Lee", faculty: "College of Business (COB)", points: 510, payments: 7, avatar: "FL" }
    ],
    // Collective Campus Milestone (Handbook Direction B Example: Shared Digital Milestone)
    campusMilestone: {
      target: 10000,
      current: 7840,
      percent: 78.4,
      daysLeft: 12,
      rewardTitle: "PayNet RM 3.00 Meal Subsidy Day",
      rewardDesc: "When UUM reaches 10,000 digital transactions this semester, PayNet sponsors a campus-wide RM 3.00 meal discount for every student!"
    },

    // Inter-Faculty Cashless Battle (Handbook Direction B Example: Faculties Compete)
    faculties: [
      { rank: 1, name: "College of Business (COB)", shortName: "COB", totalPoints: 12450, totalTransactions: 3420, percentage: 43.6, activeStudents: 380, badge: "Leading 👑", color: "bg-blue-600", icon: "📊" },
      { rank: 2, name: "College of Arts & Sciences (CAS)", shortName: "CAS", totalPoints: 9840, totalTransactions: 2680, percentage: 34.2, activeStudents: 310, badge: "Challenger ⚡", color: "bg-emerald-600", icon: "🎨" },
      { rank: 3, name: "COLGIS (Law, Gov & Intl Studies)", shortName: "COLGIS", totalPoints: 7650, totalTransactions: 1740, percentage: 22.2, activeStudents: 245, badge: "Rising 🚀", color: "bg-amber-600", icon: "⚖️" }
    ]
  },

  // Interactive 3-Step DuitNow Guide (Handbook Direction D Example: Interactive Guide for Beginners)
  duitnowTutorial: [
    {
      step: 1,
      tag: "Step 1 of 3",
      title: "Inspect Counter Signage & Scan QR",
      subtitle: "Always verify the physical stall name before scanning",
      bulletPoints: [
        "Locate the official DuitNow acrylic stand at the canteen counter.",
        "Verify that the business name printed on the stand matches the stall (e.g., 'Kafe Inasis TNB').",
        "Watch out for counterfeit paper stickers pasted over original stands."
      ],
      tip: "Security Checkpoint: Official UUM stands carry a registered Merchant ID and hologram.",
      simulatedAction: "Verify Stall QR"
    },
    {
      step: 2,
      tag: "Step 2 of 3",
      title: "Enter Amount & Auto-Deduct Vouchers",
      subtitle: "Digital transactions unlock subsidies cash cannot provide",
      bulletPoints: [
        "Type your meal price or select dishes from the quick-order menu.",
        "Select your active meal voucher from the dropdown (e.g., RM 5.00 Campus Subsidy).",
        "Watch the discount automatically deduct from your subtotal in real time!"
      ],
      tip: "Money-Saving Advantage: Paying digitally earns 10 loyalty points and collects digital stamps.",
      simulatedAction: "Apply Discount & Review Total"
    },
    {
      step: 3,
      tag: "Step 3 of 3",
      title: "Pre-Payment Safety Check & Stamp Rewards",
      subtitle: "Two-factor confirmation protects you from scams",
      bulletPoints: [
        "Review the Pre-Payment Safety Check popup displaying the stall's Trust Score (99.8%).",
        "Never authorize if a personal name appears instead of the official canteen stall.",
        "Upon confirmation, earn +1 stamp on your 10-stamp card (10 stamps = RM 5 voucher reward!)."
      ],
      tip: "Instant Peace of Mind: A digital receipt is generated and synced to your spending analytics.",
      simulatedAction: "Ready to Pay"
    }
  ],

  // Interactive Scam Simulation Scenarios with DISTINCT visual mockup types!
  scamScenarios: [
    {
      id: "scam-qr",
      type: "qr", // Visual: QR Stand vs Tampered Overlay
      title: "1. The Counterfeit QR Sticker Overlay Attack",
      badge: "High Risk Danger",
      canteen: "Kafe Inasis TNB (Table 14)",
      previewDesc: "A scammer secretly sticks a personal QR code label over the merchant's authentic counter stand.",
      authenticLabel: "Official UUM Verified DuitNow QR",
      authenticDetail: "Kafe Inasis TNB (Merchant ID: UUM-D-TNB01)",
      scamLabel: "Tampered Counter Sticker (Theft)",
      scamDetail: "Personal Account: Lim K*** F*** (Maybank: 1642-xxxx-9821)",
      explanation: "Fraudsters print personal DuitNow stickers and paste them over hawker table stands. Unsuspecting students scan and transfer money into the thief's account while the hawker receives nothing.",
      safetyFeature: "UUM PayNow's pre-payment safety verification automatically matches the scanned recipient against the official UUM merchant registry. If the account is personal or unverified, it intercepts and halts the payment before PIN entry."
    },
    {
      id: "scam-phishing",
      type: "sms", // Visual: Smartphone SMS Phishing Message
      title: "2. The 'UUM Bursary Aid' Phishing SMS Link",
      badge: "Phishing Attack",
      canteen: "SMS / WhatsApp Broadcast (+60 19-332 9182)",
      previewDesc: "Student receives a spoofed SMS alleging an urgent RM 300 Cashless Campus grant expiring tonight.",
      authenticLabel: "Official UUM Student Announcement",
      authenticDetail: "https://portal.uum.edu.my (Official Secure HTTPS Portal)",
      scamLabel: "Spoofed SMS with Phishing Link",
      scamDetail: "http://uum-paynow-grant-claim.xyz/login.php (Credential Harvester)",
      explanation: "Scammers send deceptive texts claiming students won a dining subsidy or campus bursary. Clicking leads to a forged login page designed to harvest your student matric ID, bank credentials, and transfer PINs.",
      safetyFeature: "UUM will NEVER send SMS messages with external '.xyz' links or solicit PINs/OTPs. UUM PayNow verifies all grants directly inside your official app wallet without third-party web forms."
    },
    {
      id: "scam-refund",
      type: "receipt", // Visual: Doctored Bank Slip vs App Ledger
      title: "3. The 'Fake Payment Screenshot' Overpayment Trick",
      badge: "Social Engineering",
      canteen: "Student Market Stall / Canteen Counter",
      previewDesc: "A buyer presents a fabricated payment screenshot of RM 50 for a RM 5 snack, urgently demanding RM 45 in cash refund.",
      authenticLabel: "UUM PayNow Real-time Ledger",
      authenticDetail: "Live App Stream: RM 0.00 Received (No matching transaction)",
      scamLabel: "Fabricated Transfer Screenshot",
      scamDetail: "Doctored image with edited amount 'RM 50.00' and altered timestamp",
      explanation: "Scammers use receipt generator apps or graphic editors to fabricate convincing payment receipts on their phone screens, pressuring students or stall owners to refund 'accidental overpayments' before checking their actual balance.",
      safetyFeature: "Always check your own UUM PayNow live transaction ledger! Never release cash or merchandise based on screenshots displayed on another person's device."
    }
  ],

  // Interactive Scam Awareness Quiz
  quizQuestions: [
    {
      q: "You scan a QR stand at Kafe TM, but the pre-payment verification modal displays recipient 'Chong W** L** (Personal Account)' instead of 'Kafe Inasis TM'. What should you do?",
      options: [
        "Pay anyway and ask the stall uncle if he received it.",
        "Immediately STOP the transaction, do not enter your PIN, and report the sticker to stall staff.",
        "Split the amount in half to test if it goes through."
      ],
      correctIndex: 1,
      reason: "Correct! Authentic campus merchants always show their verified commercial stall name with the UUM Verified badge. Personal accounts on stall stands indicate a tampered QR sticker."
    },
    {
      q: "Which element confirms that a UUM PayNow merchant is genuine and safe to pay?",
      options: [
        "A photo of the food on the table.",
        "The red DuitNow frame with official UUM Verified Stall ID & Trust Score 99%+ displayed in the safety verification modal.",
        "The merchant promising you a 50% discount if you pay fast."
      ],
      correctIndex: 1,
      reason: "Correct! UUM PayNow's pre-payment safety modal verifies the merchant's business ID, trust rating, and scam registry."
    },
    {
      q: "A text message claims you received an accidental RM 50 overpayment and provides a link to refund it. How do you verify?",
      options: [
        "Click the link and enter your student PIN.",
        "Open your official UUM PayNow app and check your actual Transaction Stream — if no RM 50 arrived, it's a scam.",
        "Reply to the SMS asking for their student card."
      ],
      correctIndex: 1,
      reason: "Correct! Only transactions verified in your live app ledger are real. Never follow external refund links."
    }
  ],

  // AI Assistant FAQs in 100% English (Matches user image media_1792742768972_40817953.png)
  aiFaqs: [
    {
      id: "faq-1",
      q: "How do I spot a fake or tampered QR code?",
      answer: "Inspect the physical QR stand for overlaid stickers, curling borders, or mismatched print. When scanned, verify that the merchant name displayed in the Pre-Payment Safety Check matches the physical stall signboard (e.g. 'Kafe Inasis TNB') and carries the official 'UUM Verified Merchant' badge. Never pay if a personal bank account name appears.",
      actionText: "View Fraud Guard Simulator",
      actionTarget: "fraud"
    },
    {
      id: "faq-2",
      q: "What should I do if my payment shows 'Pending'?",
      answer: "During peak campus dining rush hours, automated banking clearance can take 30 to 60 seconds. Your funds are protected in escrow by UUM PayNow. Do not scan or pay twice. Check your live Transaction Ledger in the Analytics tab for real-time status updates.",
      actionText: "View Transaction Ledger",
      actionTarget: "analytics"
    },
    {
      id: "faq-3",
      q: "How do I assign dishes and split bills with friends?",
      answer: "Navigate to the Scan & Split Hub! Upload or select a receipt, and our OCR will extract each dish. Under every dish, use the dropdown to assign items to specific friends, or choose Equal Split (AA). The app automatically tracks cumulative debt across multiple meals and provides one-click WhatsApp reminders.",
      actionText: "Open Scan & Split Hub",
      actionTarget: "split"
    },
    {
      id: "faq-4",
      q: "How do vouchers work and where can I use them?",
      answer: "You can redeem loyalty points in the Rewards Store for meal discounts (e.g., Free Teh Tarik at Kafe TM, 10% Off Alumni Junction, or RM 5.00 Meal Subsidies). In the Pay tab checkout screen, select your active voucher from the 'Apply Voucher' selector, and the discount will be deducted automatically from your bill!",
      actionText: "Open Rewards Store",
      actionTarget: "rewards"
    },
    {
      id: "faq-5",
      q: "Who should I contact if I suspect a campus scam?",
      answer: "If you detect a counterfeit QR sticker, phishing SMS, or unverified merchant, tap 'Report Suspicious QR' in the Fraud Guard module, or contact the UUM Campus Security & Bursary hotline immediately at +60 4-928 4000.",
      actionText: "Report to Fraud Guard",
      actionTarget: "fraud"
    }
  ],

  // AI Assistant Natural Language Knowledge (Pure English)
  aiResponses: {
    cheapestFood: "Here are the top budget-friendly meals under RM 5 across UUM canteens:\n• **Roti Canai** (Kafe Inasis TNB) — RM 1.50\n• **Apam Balik Boker** (Kafe YAB) — RM 2.00\n• **Iced Teh Tarik** (Kafe Inasis TM) — RM 1.80\n• **Sandwich** (Kafe DKG6) — RM 4.00\n• **Nasi Lemak** (Kafe Inasis TNB) — RM 4.50\n• **Maggi Goreng** (Kafe DKG6) — RM 4.50",
    laluanRoutes: "Here are the canteen locations mapped by UUM bus routes:\n• **Laluan A**: Kafe Inasis TNB (near DPP Tunku Najihah)\n• **Laluan B**: Kafe Inasis TM, Kafe BSN, Kafe Sri Jenang (Sime Darby)\n• **Laluan C**: Kafe YAB, Kafe Inasis Muamalat\n• **Other**: Kafe DKG6 (between lecture halls) & Alumni Junction Cafe",
    splitHelp: "To assign dishes and split bills:\n1. Open the **Split Bills** tab.\n2. Choose or scan a receipt.\n3. Under each dish, select which friend ordered it using the dropdown.\n4. Click **Save & Record to Debt Ledger** to track cumulative debt across multiple meals!\n5. Tap **Send One-Click WhatsApp Reminders** to nudge them with their cumulative bills!",
    scamHelp: "UUM PayNow has an active Fraud Guard! Before you authorize any payment:\n1. Look at the **Pre-Payment Safety Modal**.\n2. Verify that the registered stall name matches the canteen you are standing in.\n3. If you see a personal recipient name or mismatched stall ID, cancel immediately and tap 'Report QR'!"
  }
};
