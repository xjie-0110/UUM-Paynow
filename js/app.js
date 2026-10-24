// UUM PayNow - Core Application Logic (100% English Edition)
// Comprehensive implementation:
// 1. Fixed AI Assistant scrolling & container height
// 2. Clear voucher usage, redemption, and automated payment deduction
// 3. 100% pure English UI across all components
// 4. Two-perspective Analytics: Student Personal Spending vs Canteen Merchant BI
// 5. Digital stamp card that automatically resets to 0 upon reaching 10 stamps
// 6. Distinct visual mockups for QR, SMS phishing, and fake receipts
// 7. Dual-Engine Map: Option A (Leaflet + OpenStreetMap CartoDB) & Option B (Google Maps Embed)

(function () {
  'use strict';

  function cloneData(data) {
    return JSON.parse(JSON.stringify(data));
  }

  // Global State
  const state = {
    activeTab: 'home',
    user: Object.assign({}, window.UUM_DATA.user),
    savedFriends: cloneData(window.UUM_DATA.savedFriends),
    canteens: window.UUM_DATA.canteens.slice(),
    menus: window.UUM_DATA.menus,
    transactions: window.UUM_DATA.initialTransactions.slice(),
    rewards: window.UUM_DATA.rewards.slice(),
    activeVouchers: cloneData(window.UUM_DATA.activeVouchers),

    // Payment Form State
    payment: {
      canteenId: 1,
      customAmount: '',
      selectedDishId: null,
      selectedVoucherId: null, // voucher applied
      notes: '',
      method: 'duitnow', // duitnow, wallet
      statusMode: 'success' // success, failed, pending
    },

    // Scan & Split Hub State
    split: {
      activeReceiptIndex: 0,
      activeReceipt: null,
      mode: 'itemized', // 'itemized' or 'equal'
      equalSelectedFriends: ['user', 'f-1', 'f-2'],
      selectedFriendForQR: 'f-1',
      recordedBills: cloneData(window.UUM_DATA.initialRecordedBills)
    },

    // Analytics Perspective State
    analytics: {
      role: 'student', // 'student' or 'merchant'
      merchantCanteenId: 'all' // 'all' or specific canteen ID
    },

    // Scam Simulator State
    scam: {
      activeScenarioIndex: 0,
      quizAnswers: {},
      quizSubmitted: false,
      quizScore: 0
    },

    // AI Assistant State
    ai: {
      isOpen: false,
      activeTab: 'faq', // 'faq' or 'chat'
      expandedFaqId: 'faq-1',
      messages: [
        {
          sender: 'ai',
          time: 'Just now',
          text: "Hi Alex! 👋 I'm your **UUM PayNow Campus Assistant**. I can help you find affordable meals under RM 5, assign dishes to friends, explain voucher deductions, or check your cumulative friend debt. What would you like to explore?",
          actions: ['Meals under RM 5', 'Where is Kafe TNB?', 'Who owes me money?', 'How to use vouchers?']
        }
      ]
    },

    // Preferences State (Senior Mode & Dark Mode)
    preferences: {
      seniorMode: localStorage.getItem('uum_senior_mode') === 'true',
      darkMode: localStorage.getItem('uum_dark_mode') === 'true'
    },

    // Multi-Account Switcher State
    accounts: cloneData(window.UUM_DATA.accounts || []),

    // Mini-Games & Challenges State (Matches media_1792760633452_31d634c5.png)
    challenges: cloneData(window.UUM_DATA.challenges || []),

    // Receipt Scan State (Matches media_1792760856319_5fc49e22.png & media_1792760985693_3a2ce428.png)
    receiptScan: {
      isScanning: false,
      uploadedImageUrl: null,
      uploadedFileName: null
    },

    // AI Voice Chat State
    aiVoice: {
      isRecording: false,
      recognition: null
    },

    // Wallet Top-Up State (Requirement 1: Bank Transfer + TNG eWallet)
    topup: {
      selectedAmount: 50,
      selectedChannel: 'maybank',
      isProcessing: false
    },

    // Daily Lucky Wheel Limit State (Requirement 2: 1 spin per day)
    luckyWheel: {
      isSpinning: false,
      lastSpinDate: localStorage.getItem('uum_lucky_spin_date') || null
    },

    // Payment Security PIN & Biometric State (Requirement 3: PIN / Fingerprint)
    auth: {
      currentPin: '',
      authMode: 'pin', // 'pin' or 'biometric'
      pendingConfig: null
    },

    // P2P DuitNow Transfer State (Requirement 4: Transfer to Student / Bank Account)
    p2p: {
      payMode: 'merchant', // 'merchant' or 'p2p'
      transferMethod: 'student', // 'student', 'bank', 'duitnow'
      selectedFriendId: 'f-1',
      selectedBank: 'maybank',
      bankAccNumber: '1142 8932 7701',
      customStudentId: '297118',
      resolvedRecipient: {
        name: "Sarah Lim",
        identifier: "297118",
        detail: "College of Business (COB) • Maybank 1142 8932 7701",
        verified: true
      },
      amount: '15.00',
      note: 'Lunch reimbursement'
    },

    // Voice Pay State
    voice: {
      isListening: false,
      transcript: ''
    },

    // Map Engine State
    mapEngine: 'leaflet', // 'leaflet' or 'google' or 'svg'

    // Analytics Chart instances
    charts: {
      studentCategoryDonut: null,
      studentTrendBar: null,
      merchantTrafficBar: null,
      merchantCategoryDonut: null
    },

    // Leaflet map instance
    map: null
  };

  // Expose state for inspection
  window.appState = state;

  // DOM Elements cache
  let el = {};

  // Initialization
  document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    initCurrentReceipt();
    initEventListeners();
    renderAll();
    initLeafletMap();
    initCharts();
    if (window.checkDailyWheelStatus) checkDailyWheelStatus();
    if (window.initP2PRecipient) initP2PRecipient();
  });

  function cacheElements() {
    el = {
      navTabs: document.querySelectorAll('.nav-tab'),
      tabPanels: document.querySelectorAll('.tab-panel'),
      walletBalanceDisplay: document.querySelectorAll('.wallet-balance-val'),
      monthSpentDisplay: document.querySelectorAll('.month-spent-val'),
      pointsDisplay: document.querySelectorAll('.user-points-val'),
      streakDisplay: document.querySelectorAll('.user-streak-val'),
      weeklyPaymentsDisplay: document.querySelectorAll('.weekly-payments-val'),
      notificationBell: document.getElementById('notification-bell'),
      notificationDropdown: document.getElementById('notification-dropdown'),
      aiToggleBtn: document.getElementById('ai-assistant-toggle'),
      aiDrawer: document.getElementById('ai-chat-drawer'),
      aiCloseBtn: document.getElementById('ai-chat-close'),
      aiInput: document.getElementById('ai-chat-input'),
      aiSendBtn: document.getElementById('ai-chat-send'),
      aiMessagesList: document.getElementById('ai-messages-list')
    };
  }

  function initCurrentReceipt() {
    const raw = window.UUM_DATA.sampleReceipts[state.split.activeReceiptIndex] || window.UUM_DATA.sampleReceipts[0];
    state.split.activeReceipt = cloneData(raw);
  }

  function initEventListeners() {
    // Tab switching
    document.querySelectorAll('[data-switch-tab]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = btn.getAttribute('data-switch-tab');
        switchTab(targetTab);
      });
    });

    // Notification dropdown toggle
    if (el.notificationBell) {
      el.notificationBell.addEventListener('click', (e) => {
        e.stopPropagation();
        el.notificationDropdown.classList.toggle('hidden');
      });
      document.addEventListener('click', () => {
        if (el.notificationDropdown) el.notificationDropdown.classList.add('hidden');
      });
    }

    // AI Assistant Toggle
    if (el.aiToggleBtn) {
      el.aiToggleBtn.addEventListener('click', () => toggleAIChat());
    }
    if (el.aiCloseBtn) {
      el.aiCloseBtn.addEventListener('click', () => toggleAIChat(false));
    }
    if (el.aiSendBtn && el.aiInput) {
      el.aiSendBtn.addEventListener('click', sendAIMessage);
      el.aiInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendAIMessage();
      });
    }

    // Voice recognition button
    const voiceTrigger = document.getElementById('voice-pay-btn');
    if (voiceTrigger) {
      voiceTrigger.addEventListener('click', () => startVoiceRecognition());
    }

    // Canteen search & filter
    const merchantSearch = document.getElementById('merchant-search-input');
    if (merchantSearch) {
      merchantSearch.addEventListener('input', (e) => filterMerchants(e.target.value));
    }
    document.querySelectorAll('.merchant-filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.merchant-filter-pill').forEach(p => p.classList.remove('bg-blue-600', 'text-white'));
        document.querySelectorAll('.merchant-filter-pill').forEach(p => p.classList.add('bg-white', 'text-slate-600'));
        pill.classList.remove('bg-white', 'text-slate-600');
        pill.classList.add('bg-blue-600', 'text-white');
        filterMerchantsByCategory(pill.getAttribute('data-category'));
      });
    });

    // Split Hub Receipt Selector
    const receiptSelector = document.getElementById('split-receipt-select');
    if (receiptSelector) {
      receiptSelector.addEventListener('change', (e) => {
        state.split.activeReceiptIndex = parseInt(e.target.value, 10);
        initCurrentReceipt();
        triggerOCRScanAnimation();
      });
    }

    // Top-up simulation modal
    const topupBtn = document.getElementById('wallet-topup-btn');
    if (topupBtn) {
      topupBtn.addEventListener('click', () => openTopUpModal());
    }
  }

  // ==========================================
  // NAVIGATION & TAB SWITCHING
  // ==========================================
  function switchTab(tabId) {
    state.activeTab = tabId;

    document.querySelectorAll('.nav-tab').forEach(tab => {
      const match = tab.getAttribute('data-switch-tab') === tabId;
      if (match) {
        tab.classList.add('text-blue-600', 'bg-blue-50', 'font-semibold');
        tab.classList.remove('text-slate-600', 'hover:text-blue-600');
      } else {
        tab.classList.remove('text-blue-600', 'bg-blue-50', 'font-semibold');
        tab.classList.add('text-slate-600', 'hover:text-blue-600');
      }
    });

    document.querySelectorAll('.tab-panel').forEach(panel => {
      if (panel.id === `tab-${tabId}`) {
        panel.classList.remove('hidden');
      } else {
        panel.classList.add('hidden');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (tabId === 'analytics') {
      setTimeout(() => initCharts(), 120);
    } else if (tabId === 'rewards') {
      setTimeout(() => {
        if (state.map) state.map.invalidateSize();
      }, 150);
      renderActiveVouchersList();
      if (window.checkDailyWheelStatus) checkDailyWheelStatus();
    } else if (tabId === 'split') {
      renderSplitHub();
    } else if (tabId === 'pay') {
      renderPaymentForm();
    }
  }
  window.switchTab = switchTab;

  // ==========================================
  // RENDER MASTER UI
  // ==========================================
  function renderAll() {
    renderUserStats();
    renderPendingSplitsBanner();
    renderCanteenMerchants();
    renderPaymentForm();
    renderTransactionsTable();
    renderSplitHub();
    renderCumulativeFriendDebts();
    renderStampCard();
    renderActiveVouchersList();
      if (window.checkDailyWheelStatus) checkDailyWheelStatus();
    renderRewardsCatalog();
    renderChallenges();
    renderLeaderboard();
    renderScamSimulator();
    renderAIFaqs();
    initThemePreferences();
    checkDailyWheelStatus();
    initP2PRecipient();
  }

  function renderUserStats() {
    el.walletBalanceDisplay.forEach(elem => {
      elem.textContent = `RM ${state.user.walletBalance.toFixed(2)}`;
    });
    el.monthSpentDisplay.forEach(elem => {
      elem.textContent = `RM ${state.user.monthSpent.toFixed(2)}`;
    });
    el.pointsDisplay.forEach(elem => {
      elem.textContent = `${state.user.points} pts`;
    });
    el.streakDisplay.forEach(elem => {
      elem.textContent = `${state.user.streakDays} Days`;
    });
    el.weeklyPaymentsDisplay.forEach(elem => {
      elem.textContent = `${state.user.weeklyPayments}/${state.user.weeklyTarget}`;
    });

    const stampText = document.getElementById('stamp-counter-text');
    if (stampText) {
      stampText.textContent = `${state.user.stamps} / ${state.user.maxStamps} Stamps Collected`;
    }

    // Update navbar and dropdown profile elements dynamically
    const navName = document.getElementById('nav-user-name');
    const navBadge = document.getElementById('nav-user-badge');
    const navAvatar = document.getElementById('nav-user-avatar');
    if (navName) navName.textContent = state.user.name;
    if (navBadge) navBadge.textContent = `${state.user.badge || state.user.role} • ${state.user.matricNo}`;
    if (navAvatar && state.user.avatar) navAvatar.src = state.user.avatar;

    const ddName = document.getElementById('dropdown-user-name');
    const ddFaculty = document.getElementById('dropdown-user-faculty');
    const ddMatric = document.getElementById('dropdown-user-matric');
    const ddAvatar = document.getElementById('dropdown-user-avatar');
    const ddBalance = document.getElementById('dropdown-user-balance');
    const ddPoints = document.getElementById('dropdown-user-points');

    if (ddName) ddName.textContent = state.user.name;
    if (ddFaculty) ddFaculty.textContent = state.user.faculty || state.user.role;
    if (ddMatric) ddMatric.textContent = `ID: ${state.user.matricNo}`;
    if (ddAvatar && state.user.avatar) ddAvatar.src = state.user.avatar;
    if (ddBalance) ddBalance.textContent = `RM ${state.user.walletBalance.toFixed(2)}`;
    if (ddPoints) ddPoints.textContent = `${state.user.points} pts`;
  }

  // ==========================================
  // PENDING SPLITS BANNER (Exact Match to Image)
  // ==========================================
  function calculateCumulativeDebts() {
    const friendDebtMap = {};

    state.savedFriends.forEach(f => {
      friendDebtMap[f.id] = {
        friend: f,
        totalOwed: 0,
        unpaidBills: []
      };
    });

    state.split.recordedBills.forEach(bill => {
      bill.participants.forEach(p => {
        if (p.friendId !== 'user' && p.status === 'pending') {
          if (!friendDebtMap[p.friendId]) {
            friendDebtMap[p.friendId] = {
              friend: { id: p.friendId, name: p.friendName, phone: p.phone || '+60 12-345 6789', avatarInitial: p.friendName.substring(0,2).toUpperCase(), avatarBg: 'bg-blue-500' },
              totalOwed: 0,
              unpaidBills: []
            };
          }
          friendDebtMap[p.friendId].totalOwed += p.amount;
          friendDebtMap[p.friendId].unpaidBills.push({
            billId: bill.id,
            billTitle: bill.title,
            canteen: bill.canteen,
            date: bill.date,
            items: p.items || ['Shared meal'],
            amount: p.amount
          });
        }
      });
    });

    const activeDebtors = Object.values(friendDebtMap).filter(item => item.totalOwed > 0);
    const grandTotalOwed = activeDebtors.reduce((acc, curr) => acc + curr.totalOwed, 0);

    return {
      activeDebtors,
      grandTotalOwed,
      unpaidStudentsCount: activeDebtors.length
    };
  }

  function renderPendingSplitsBanner() {
    const debtData = calculateCumulativeDebts();

    const homeTitle = document.getElementById('home-total-owed-title');
    const homeSub = document.getElementById('home-total-owed-sub');
    const homeBadge = document.getElementById('home-unpaid-count-badge');

    if (homeTitle) homeTitle.textContent = `Friends owe you RM ${debtData.grandTotalOwed.toFixed(2)}`;
    if (homeSub) homeSub.textContent = `${debtData.unpaidStudentsCount} students haven't settled dinner at campus canteens yet.`;
    if (homeBadge) homeBadge.textContent = `${debtData.unpaidStudentsCount} Unpaid`;

    const splitTitle = document.getElementById('split-total-owed-title');
    const splitSub = document.getElementById('split-total-owed-sub');
    const splitBadge = document.getElementById('split-unpaid-count-badge');

    if (splitTitle) splitTitle.textContent = `Friends owe you RM ${debtData.grandTotalOwed.toFixed(2)}`;
    if (splitSub) splitSub.textContent = `${debtData.unpaidStudentsCount} students haven't settled shared canteen meals yet.`;
    if (splitBadge) splitBadge.textContent = `${debtData.unpaidStudentsCount} Unpaid`;
  }

  // ==========================================
  // 1. CAMPUS MERCHANTS MODULE
  // ==========================================
  function renderCanteenMerchants(list = state.canteens) {
    const container = document.getElementById('merchants-grid');
    if (!container) return;

    container.innerHTML = list.map(c => {
      const menuItems = state.menus[c.id] || [];
      const sampleDish = menuItems[0] ? `${menuItems[0].name} (RM ${menuItems[0].price.toFixed(2)})` : 'Local dishes';

      return `
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group">
          <div class="relative h-44 overflow-hidden bg-slate-100">
            <img src="${c.photo_url}" alt="${c.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='images/canteen_tnb.jpg'">
            <span class="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">
              ${c.category}
            </span>
            <span class="absolute top-3 right-3 bg-emerald-500 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-sm flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              DuitNow Verified
            </span>
          </div>

          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between gap-2 mb-1.5">
                <h3 class="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">${c.name}</h3>
                <span class="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md font-semibold shrink-0">
                  ★ ${c.rating}
                </span>
              </div>
              <p class="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">${c.description}</p>
              
              <div class="bg-blue-50/70 border border-blue-100 rounded-lg p-2.5 mb-3.5 flex items-center gap-2">
                <span class="text-sm">🎁</span>
                <span class="text-xs font-semibold text-blue-800">${c.promo}</span>
              </div>

              <div class="text-xs text-slate-600 mb-4 bg-slate-50 rounded-lg p-2 border border-slate-100">
                <span class="font-medium text-slate-500">Popular:</span>
                <span class="font-semibold text-slate-800 ml-1">${sampleDish}</span>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div class="text-xs text-slate-500 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span>${c.hours}</span>
              </div>
              <button onclick="selectMerchantForPayment(${c.id})" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-500/20">
                <span>Pay Stall</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function filterMerchants(searchTerm) {
    const q = searchTerm.toLowerCase().trim();
    const filtered = state.canteens.filter(c => {
      const matchName = c.name.toLowerCase().includes(q);
      const matchCategory = c.category.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const menus = state.menus[c.id] || [];
      const matchMenu = menus.some(m => m.name.toLowerCase().includes(q));
      return matchName || matchCategory || matchDesc || matchMenu;
    });
    renderCanteenMerchants(filtered);
  }

  function filterMerchantsByCategory(category) {
    if (!category || category === 'All') {
      renderCanteenMerchants(state.canteens);
      return;
    }
    const filtered = state.canteens.filter(c => c.category === category || (category === 'Food & Beverages'));
    renderCanteenMerchants(filtered);
  }

  // ==========================================
  // 2. SIMULATED PAYMENT & VOUCHER DEDUCTION
  // ==========================================
  function selectMerchantForPayment(canteenId, preappliedVoucherId = null) {
    state.payment.canteenId = canteenId;
    state.payment.selectedDishId = null;
    state.payment.customAmount = '';
    state.payment.selectedVoucherId = preappliedVoucherId;
    renderPaymentForm();
    switchTab('pay');
  }
  window.selectMerchantForPayment = selectMerchantForPayment;

  function renderPaymentForm() {
    const canteen = state.canteens.find(c => c.id === state.payment.canteenId) || state.canteens[0];
    const menuItems = state.menus[canteen.id] || [];

    const stallSelect = document.getElementById('pay-stall-select');
    if (stallSelect) {
      stallSelect.innerHTML = state.canteens.map(c => `
        <option value="${c.id}" ${c.id === canteen.id ? 'selected' : ''}>${c.name} (${c.category})</option>
      `).join('');
      stallSelect.onchange = (e) => {
        state.payment.canteenId = parseInt(e.target.value, 10);
        state.payment.selectedDishId = null;
        renderPaymentForm();
      };
    }

    const merchantPreview = document.getElementById('pay-merchant-preview');
    if (merchantPreview) {
      merchantPreview.innerHTML = `
        <div class="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200/70 rounded-2xl">
          <img src="${canteen.photo_url}" class="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm" onerror="this.src='images/canteen_tnb.jpg'">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h4 class="font-bold text-slate-900 text-base truncate">${canteen.name}</h4>
              <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                ✓ Verified
              </span>
            </div>
            <p class="text-xs text-slate-500">${canteen.category} • Trust Score: ${canteen.trustScore}%</p>
            <p class="text-xs font-semibold text-blue-600 mt-0.5">DuitNow ID: ${canteen.merchantCode}</p>
          </div>
        </div>
      `;
    }

    // Render Quick Dishes from seed menu
    const menuGrid = document.getElementById('pay-menu-dishes');
    if (menuGrid) {
      menuGrid.innerHTML = menuItems.map(dish => {
        const isSelected = state.payment.selectedDishId === dish.id;
        return `
          <button type="button" onclick="selectDishForPayment(${dish.id}, ${dish.price})" class="p-3 text-left rounded-xl border transition-all duration-200 flex items-center justify-between ${
            isSelected ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-600/20' : 'border-slate-200 bg-white hover:border-slate-300'
          }">
            <div>
              <div class="font-bold text-slate-800 text-xs">${dish.name}</div>
              <span class="text-[10px] text-slate-400 font-medium">${dish.tag}</span>
            </div>
            <span class="font-bold text-blue-600 text-sm">RM ${dish.price.toFixed(2)}</span>
          </button>
        `;
      }).join('');
    }

    // Render Voucher Selector Dropdown (Point 2 - explicit discount deduction)
    renderPaymentVoucherSelector(canteen.id);

    // Amount input field sync
    const amountInput = document.getElementById('pay-amount-input');
    if (amountInput) {
      if (state.payment.customAmount) {
        amountInput.value = state.payment.customAmount;
      }
      amountInput.oninput = (e) => {
        state.payment.customAmount = e.target.value;
        state.payment.selectedDishId = null;
        updateTotalAmountDisplay();
      };
    }

    updateTotalAmountDisplay();
  }

  function renderPaymentVoucherSelector(currentCanteenId) {
    const voucherContainer = document.getElementById('pay-voucher-selector-box');
    if (!voucherContainer) return;

    // Filter vouchers valid for this canteen or all canteens
    const eligibleVouchers = state.activeVouchers.filter(v => v.status === 'active' && (!v.canteenId || v.canteenId === currentCanteenId));

    voucherContainer.innerHTML = `
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            🎟️ Apply Campus Voucher / Discount
          </label>
          <button type="button" onclick="switchTab('rewards')" class="text-[11px] text-blue-600 hover:underline font-bold">
            Get Vouchers (+pts) →
          </button>
        </div>
        <select id="pay-voucher-select" onchange="onPaymentVoucherChanged(this.value)" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">No Voucher Applied</option>
          ${eligibleVouchers.map(v => `
            <option value="${v.id}" ${state.payment.selectedVoucherId === v.id ? 'selected' : ''}>
              ${v.name} (${v.discountType === 'percent' ? v.discountValue + '% off' : 'Save RM ' + v.discountValue.toFixed(2)}) — ${v.canteen}
            </option>
          `).join('')}
        </select>
        <p class="text-[10px] text-slate-400">
          ${eligibleVouchers.length} eligible voucher(s) available in your wallet for this canteen.
        </p>
      </div>
    `;
  }

  function onPaymentVoucherChanged(voucherId) {
    state.payment.selectedVoucherId = voucherId || null;
    updateTotalAmountDisplay();
    if (voucherId) {
      const v = state.activeVouchers.find(item => item.id === voucherId);
      if (v) showToast(`Applied voucher: ${v.name}`);
    }
  }
  window.onPaymentVoucherChanged = onPaymentVoucherChanged;

  function selectDishForPayment(dishId, price) {
    state.payment.selectedDishId = dishId;
    state.payment.customAmount = price.toFixed(2);
    renderPaymentForm();
  }
  window.selectDishForPayment = selectDishForPayment;

  function updateTotalAmountDisplay() {
    const rawAmt = parseFloat(state.payment.customAmount) || 0;
    let discount = 0;
    let voucherApplied = null;

    if (state.payment.selectedVoucherId && rawAmt > 0) {
      voucherApplied = state.activeVouchers.find(v => v.id === state.payment.selectedVoucherId);
      if (voucherApplied) {
        if (voucherApplied.discountType === 'fixed') {
          discount = Math.min(voucherApplied.discountValue, rawAmt);
        } else if (voucherApplied.discountType === 'percent') {
          discount = (rawAmt * voucherApplied.discountValue) / 100;
        }
      }
    }

    const finalAmt = Math.max(0, rawAmt - discount);

    const subtotalDisplay = document.getElementById('pay-subtotal-display');
    const discountDisplay = document.getElementById('pay-discount-display');
    const totalDisplay = document.getElementById('pay-total-display');
    const discountRow = document.getElementById('pay-discount-row');

    if (subtotalDisplay) subtotalDisplay.textContent = `RM ${rawAmt.toFixed(2)}`;
    if (discountDisplay) discountDisplay.textContent = `- RM ${discount.toFixed(2)}`;
    if (totalDisplay) totalDisplay.textContent = `RM ${finalAmt.toFixed(2)}`;

    if (discountRow) {
      if (discount > 0) {
        discountRow.classList.remove('hidden');
      } else {
        discountRow.classList.add('hidden');
      }
    }
  }

  // Pre-Payment Safety Check Trigger
  function openSecurityVerificationModal() {
    const rawAmt = parseFloat(state.payment.customAmount);
    const errorBanner = document.getElementById('pay-error-banner');

    if (isNaN(rawAmt) || rawAmt <= 0) {
      showPaymentError("Please enter a valid payment amount greater than RM 0.00");
      return;
    }

    let discount = 0;
    if (state.payment.selectedVoucherId) {
      const v = state.activeVouchers.find(item => item.id === state.payment.selectedVoucherId);
      if (v) {
        discount = v.discountType === 'fixed' ? Math.min(v.discountValue, rawAmt) : (rawAmt * v.discountValue) / 100;
      }
    }
    const finalAmt = Math.max(0, rawAmt - discount);

    if (finalAmt > state.user.walletBalance) {
      showPaymentError(`Insufficient balance! Your current wallet balance is RM ${state.user.walletBalance.toFixed(2)}`);
      return;
    }

    if (errorBanner) errorBanner.classList.add('hidden');

    const canteen = state.canteens.find(c => c.id === state.payment.canteenId) || state.canteens[0];
    const modal = document.getElementById('security-verify-modal');
    if (!modal) return;

    document.getElementById('verify-merchant-name').textContent = canteen.name;
    document.getElementById('verify-merchant-code').textContent = canteen.merchantCode;
    document.getElementById('verify-amount').textContent = `RM ${finalAmt.toFixed(2)}`;
    document.getElementById('verify-trust-score').textContent = `${canteen.trustScore}% Verified Safe`;
    document.getElementById('verify-new-balance').textContent = `RM ${(state.user.walletBalance - finalAmt).toFixed(2)}`;

    const verifyVoucherTag = document.getElementById('verify-voucher-tag');
    if (verifyVoucherTag) {
      if (discount > 0) {
        verifyVoucherTag.textContent = `Voucher discount applied: -RM ${discount.toFixed(2)}`;
        verifyVoucherTag.classList.remove('hidden');
      } else {
        verifyVoucherTag.classList.add('hidden');
      }
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
  window.openSecurityVerificationModal = openSecurityVerificationModal;

  function closeSecurityModal() {
    const modal = document.getElementById('security-verify-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }
  window.closeSecurityModal = closeSecurityModal;

  function showPaymentError(msg) {
    const errorBanner = document.getElementById('pay-error-banner');
    if (errorBanner) {
      errorBanner.innerHTML = `
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <span class="text-xs font-semibold text-red-800">${msg}</span>
        </div>
      `;
      errorBanner.classList.remove('hidden');
    }
  }

  // Execute Payment Simulation (Includes Point 5: Stamp Card 10-cycle reset)
  function confirmExecutePayment(forcedStatus = null) {
    closeSecurityModal();

    const rawAmt = parseFloat(state.payment.customAmount) || 0;
    let discount = 0;
    let usedVoucher = null;

    if (state.payment.selectedVoucherId) {
      usedVoucher = state.activeVouchers.find(v => v.id === state.payment.selectedVoucherId);
      if (usedVoucher) {
        discount = usedVoucher.discountType === 'fixed' ? Math.min(usedVoucher.discountValue, rawAmt) : (rawAmt * usedVoucher.discountValue) / 100;
      }
    }
    const finalAmt = Math.max(0, rawAmt - discount);
    const canteen = state.canteens.find(c => c.id === state.payment.canteenId) || state.canteens[0];
    const status = forcedStatus || state.payment.statusMode;
    const txId = `TXN-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTx = {
      id: txId,
      title: canteen.name,
      category: "Food",
      amount: finalAmt,
      type: "debit",
      status: status,
      timestamp: "Just now",
      notes: state.payment.selectedDishId ? `Menu Order (${canteen.name})` : "DuitNow QR Payment",
      pointsEarned: status === 'success' ? 10 : 0
    };

    if (status === 'success') {
      state.user.walletBalance -= finalAmt;
      state.user.monthSpent += finalAmt;
      state.user.points += 10;

      // Handle Voucher Consumption
      if (usedVoucher) {
        usedVoucher.status = 'used';
        state.payment.selectedVoucherId = null;
      }

      // Point 5: Digital Stamp 10-stamp auto-award and clear to 0!
      state.user.stamps += 1;
      let stampCompletedNotice = false;
      if (state.user.stamps >= state.user.maxStamps) {
        stampCompletedNotice = true;
        // Award reward
        state.activeVouchers.push({
          id: `v-reward-${Date.now()}`,
          name: "RM 5.00 Campus Meal Subsidy (Stamp Bonus)",
          canteen: "Valid at Any Canteen",
          canteenId: null,
          discountType: "fixed",
          discountValue: 5.00,
          minSpend: 6.00,
          code: `STAMP-${Math.floor(1000+Math.random()*9000)}`,
          howItWorks: "Earned from completing 10 digital payments! Deducts RM 5.00 automatically on your next meal.",
          validUntil: "31 Dec 2026",
          status: "active"
        });
        state.user.points += 50;
        // DIRECTLY RESET TO ZERO AS REQUESTED!
        state.user.stamps = 0;
      }

      state.transactions.unshift(newTx);

      if (window.confetti) {
        window.confetti({ particleCount: stampCompletedNotice ? 120 : 70, spread: 70, origin: { y: 0.6 } });
      }

      if (stampCompletedNotice) {
        setTimeout(() => {
          alert("🎉 STAMP CARD COMPLETED (10/10)!\n\nYou earned:\n• +RM 5.00 Campus Meal Subsidy Voucher\n• +50 Loyalty Bonus Points!\n\nYour stamp card has now reset to 0/10 for your next reward cycle!");
        }, 400);
      }
    } else {
      state.transactions.unshift(newTx);
    }

    renderUserStats();
    renderTransactionsTable();
    renderStampCard();
    renderActiveVouchersList();
      if (window.checkDailyWheelStatus) checkDailyWheelStatus();
    openReceiptModal(newTx);
  }
  window.confirmExecutePayment = confirmExecutePayment;

  function openReceiptModal(tx) {
    const receiptModal = document.getElementById('payment-receipt-modal');
    if (!receiptModal) return;

    const statusBadge = document.getElementById('receipt-status-badge');
    const statusIcon = document.getElementById('receipt-status-icon');
    const statusTitle = document.getElementById('receipt-status-title');

    if (tx.status === 'success') {
      statusIcon.innerHTML = `<div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg></div>`;
      statusTitle.textContent = "Payment Successful!";
      statusTitle.className = "text-xl font-black text-slate-900";
      statusBadge.innerHTML = `<span class="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold">Completed & Recorded</span>`;
    } else if (tx.status === 'pending') {
      statusIcon.innerHTML = `<div class="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>`;
      statusTitle.textContent = "Payment Pending Settlement";
      statusTitle.className = "text-xl font-black text-slate-900";
      statusBadge.innerHTML = `<span class="bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-bold">Awaiting Bank Clearance</span>`;
    } else {
      statusIcon.innerHTML = `<div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg></div>`;
      statusTitle.textContent = "Payment Failed / Intercepted";
      statusTitle.className = "text-xl font-black text-red-600";
      statusBadge.innerHTML = `<span class="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-bold">Transaction Terminated</span>`;
    }

    document.getElementById('receipt-ref-id').textContent = tx.id;
    document.getElementById('receipt-merchant').textContent = tx.title;
    document.getElementById('receipt-amount').textContent = `RM ${tx.amount.toFixed(2)}`;
    document.getElementById('receipt-time').textContent = tx.timestamp;
    document.getElementById('receipt-points').textContent = `+${tx.pointsEarned} pts`;
    document.getElementById('receipt-remaining-balance').textContent = `RM ${state.user.walletBalance.toFixed(2)}`;

    receiptModal.classList.remove('hidden');
    receiptModal.classList.add('flex');
  }
  window.openReceiptModal = openReceiptModal;

  function closeReceiptModal() {
    const receiptModal = document.getElementById('payment-receipt-modal');
    if (receiptModal) {
      receiptModal.classList.add('hidden');
      receiptModal.classList.remove('flex');
    }
  }
  window.closeReceiptModal = closeReceiptModal;

  // ==========================================
  // 3. VOICE INPUT TRANSFERS (Web Speech API)
  // ==========================================
  function startVoiceRecognition() {
    const voiceStatus = document.getElementById('voice-status-text');
    const voiceWave = document.getElementById('voice-wave-ring');

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      simulateVoicePrompt();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    if (voiceStatus) voiceStatus.textContent = "Listening... say: 'Pay 6 ringgit 50 cents to Inasis TNB'";
    if (voiceWave) voiceWave.classList.remove('hidden');

    recognition.onstart = () => {
      state.voice.isListening = true;
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (voiceStatus) voiceStatus.textContent = `Heard: "${transcript}"`;
      parseVoicePaymentCommand(transcript);
    };

    recognition.onerror = () => {
      simulateVoicePrompt();
    };

    recognition.onend = () => {
      state.voice.isListening = false;
      if (voiceWave) voiceWave.classList.add('hidden');
    };

    try {
      recognition.start();
    } catch (e) {
      simulateVoicePrompt();
    }
  }
  window.startVoiceRecognition = startVoiceRecognition;

  function simulateVoicePrompt() {
    const demoPhrases = [
      "Pay RM 6.50 to Inasis TNB",
      "Transfer 5 ringgit to Kafe TM",
      "Pay RM 4.50 to Kafe DKG6",
      "Pay 7 ringgit to Inasis Muamalat"
    ];
    const picked = demoPhrases[Math.floor(Math.random() * demoPhrases.length)];
    const voiceStatus = document.getElementById('voice-status-text');
    if (voiceStatus) {
      voiceStatus.textContent = `🎙️ Simulated Voice Detected: "${picked}"`;
    }
    setTimeout(() => {
      parseVoicePaymentCommand(picked);
    }, 700);
  }

  function parseVoicePaymentCommand(phrase) {
    const lower = phrase.toLowerCase();
    
    let detectedAmount = 6.50;
    const numMatch = lower.match(/(?:rm\s*|ringgit\s*)?(\d+(?:\.\d+)?)/);
    if (numMatch) {
      detectedAmount = parseFloat(numMatch[1]);
    }

    let targetCanteen = state.canteens[0];
    if (lower.includes('tm')) targetCanteen = state.canteens[1];
    else if (lower.includes('bsn')) targetCanteen = state.canteens[2];
    else if (lower.includes('sime') || lower.includes('jenang')) targetCanteen = state.canteens[3];
    else if (lower.includes('yab')) targetCanteen = state.canteens[4];
    else if (lower.includes('muamalat')) targetCanteen = state.canteens[5];
    else if (lower.includes('dkg')) targetCanteen = state.canteens[6];
    else if (lower.includes('alumni')) targetCanteen = state.canteens[7];

    state.payment.canteenId = targetCanteen.id;
    state.payment.customAmount = detectedAmount.toFixed(2);
    renderPaymentForm();
    switchTab('pay');

    setTimeout(() => {
      openSecurityVerificationModal();
    }, 400);
  }

  // ==========================================
  // 4. SCAN & SPLIT HUB: DISH ASSIGNMENT & DEBT LEDGER
  // ==========================================
  function renderSplitHub() {
    if (!state.split.activeReceipt) {
      initCurrentReceipt();
    }
    const receipt = state.split.activeReceipt;

    const merchantName = document.getElementById('ocr-merchant-name');
    const receiptTotal = document.getElementById('ocr-receipt-total');
    const receiptDate = document.getElementById('ocr-receipt-date');
    const itemsList = document.getElementById('ocr-items-breakdown');

    if (merchantName) merchantName.textContent = receipt.merchant;
    if (receiptTotal) receiptTotal.textContent = `RM ${receipt.total.toFixed(2)}`;
    if (receiptDate) receiptDate.textContent = receipt.date;

    if (itemsList) {
      itemsList.innerHTML = receipt.items.map((item, idx) => {
        return `
          <div class="p-3 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-xs space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-[10px]">${idx + 1}</span>
                <span class="font-bold text-slate-100">${item.name}</span>
              </div>
              <span class="font-black text-emerald-400 text-sm">RM ${item.price.toFixed(2)}</span>
            </div>

            <div class="flex items-center justify-between pt-1 border-t border-slate-700/60">
              <span class="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <span>👤 Assign to:</span>
              </span>
              <select onchange="assignDishToFriend('${item.id}', this.value)" class="bg-slate-900 border border-slate-600 text-slate-200 text-[11px] rounded-lg px-2 py-1 font-semibold focus:ring-1 focus:ring-blue-400 focus:outline-none">
                <option value="user" ${item.assignedTo === 'user' ? 'selected' : ''}>Alex Tan (You)</option>
                ${state.savedFriends.map(f => `
                  <option value="${f.id}" ${item.assignedTo === f.id ? 'selected' : ''}>${f.name}</option>
                `).join('')}
                <option value="shared" ${item.assignedTo === 'shared' ? 'selected' : ''}>👥 Split Equally</option>
              </select>
            </div>
          </div>
        `;
      }).join('');
    }

    renderSplitCalculations();
    renderCumulativeFriendDebts();
  }

  function assignDishToFriend(itemId, friendId) {
    const receipt = state.split.activeReceipt;
    const item = receipt.items.find(i => i.id === itemId);
    if (item) {
      item.assignedTo = friendId;
      renderSplitHub();
      const friendObj = state.savedFriends.find(f => f.id === friendId);
      const targetName = friendId === 'user' ? 'Alex Tan (You)' : friendId === 'shared' ? 'All (Shared)' : friendObj ? friendObj.name : 'friend';
      showToast(`Assigned ${item.name} to ${targetName}!`);
    }
  }
  window.assignDishToFriend = assignDishToFriend;

  function triggerOCRScanAnimation() {
    const beam = document.getElementById('ocr-beam');
    const badge = document.getElementById('ocr-status-tag');
    if (beam) beam.classList.remove('hidden');
    if (badge) badge.textContent = "Scanning Bill...";

    setTimeout(() => {
      if (beam) beam.classList.add('hidden');
      if (badge) badge.textContent = "OCR Verified ✓";
      renderSplitHub();
    }, 1000);
  }
  window.triggerOCRScanAnimation = triggerOCRScanAnimation;

  function setSplitMode(mode) {
    state.split.mode = mode;
    document.querySelectorAll('.split-mode-btn').forEach(btn => {
      if (btn.getAttribute('data-mode') === mode) {
        btn.classList.add('bg-blue-600', 'text-white', 'shadow-sm');
        btn.classList.remove('bg-white', 'text-slate-700');
      } else {
        btn.classList.remove('bg-blue-600', 'text-white', 'shadow-sm');
        btn.classList.add('bg-white', 'text-slate-700');
      }
    });

    const equalPicker = document.getElementById('equal-split-friend-picker');
    if (equalPicker) {
      if (mode === 'equal') {
        equalPicker.classList.remove('hidden');
      } else {
        equalPicker.classList.add('hidden');
      }
    }

    renderSplitCalculations();
  }
  window.setSplitMode = setSplitMode;

  function toggleEqualSplitFriend(friendId, isChecked) {
    if (isChecked) {
      if (!state.split.equalSelectedFriends.includes(friendId)) {
        state.split.equalSelectedFriends.push(friendId);
      }
    } else {
      state.split.equalSelectedFriends = state.split.equalSelectedFriends.filter(id => id !== friendId);
      if (state.split.equalSelectedFriends.length === 0) {
        state.split.equalSelectedFriends.push('user');
      }
    }
    renderSplitCalculations();
  }
  window.toggleEqualSplitFriend = toggleEqualSplitFriend;

  function addCustomDishItem() {
    const name = prompt("Enter dish / item name:", "Iced Milo Gao");
    if (!name) return;
    const priceStr = prompt("Enter price (RM):", "2.50");
    const price = parseFloat(priceStr);
    if (isNaN(price) || price <= 0) return;

    state.split.activeReceipt.items.push({
      id: `custom-${Date.now()}`,
      name: name,
      price: price,
      assignedTo: 'user'
    });
    state.split.activeReceipt.total = state.split.activeReceipt.items.reduce((acc, i) => acc + i.price, 0);
    renderSplitHub();
    showToast(`Added ${name} (RM ${price.toFixed(2)}) to bill!`);
  }
  window.addCustomDishItem = addCustomDishItem;

  function renderSplitCalculations() {
    const receipt = state.split.activeReceipt;
    const container = document.getElementById('split-friends-breakdown');
    if (!container) return;

    const breakdown = [];
    const allParticipants = [{ id: 'user', name: 'Alex Tan (You)', avatarInitial: 'AT', avatarBg: 'bg-blue-600', isPayer: true }].concat(state.savedFriends);

    if (state.split.mode === 'equal') {
      const activeCount = state.split.equalSelectedFriends.length || 1;
      const sharePerPerson = receipt.total / activeCount;

      allParticipants.forEach(p => {
        const isIncluded = state.split.equalSelectedFriends.includes(p.id);
        breakdown.push({
          participant: p,
          amount: isIncluded ? sharePerPerson : 0,
          items: isIncluded ? [`Equal AA share of ${receipt.merchant}`] : [],
          isIncluded: isIncluded
        });
      });
    } else {
      allParticipants.forEach(p => {
        let sum = 0;
        const assignedItems = [];
        receipt.items.forEach(item => {
          if (item.assignedTo === p.id) {
            sum += item.price;
            assignedItems.push(`${item.name} (RM ${item.price.toFixed(2)})`);
          } else if (item.assignedTo === 'shared') {
            const splitFraction = item.price / (allParticipants.length);
            sum += splitFraction;
            assignedItems.push(`${item.name} [Shared: RM ${splitFraction.toFixed(2)}]`);
          }
        });

        breakdown.push({
          participant: p,
          amount: sum,
          items: assignedItems,
          isIncluded: sum > 0
        });
      });
    }

    container.innerHTML = breakdown.map(b => {
      const p = b.participant;
      const isSelectedForQR = state.split.selectedFriendForQR === p.id;
      return `
        <div onclick="selectFriendForDuitNowQR('${p.id}')" class="p-4 rounded-2xl border transition-all cursor-pointer ${
          isSelectedForQR ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-600/20' : 'border-slate-200 bg-white hover:border-slate-300'
        }">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full ${p.avatarBg || 'bg-slate-700'} text-white font-bold text-xs flex items-center justify-center">
                ${p.avatarInitial || 'FR'}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h5 class="font-bold text-slate-800 text-xs">${p.name}</h5>
                  ${p.isPayer ? '<span class="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">Payer (You)</span>' : ''}
                </div>
                <div class="text-[10px] text-slate-400">
                  ${b.items.length > 0 ? b.items.join(', ') : 'No items assigned'}
                </div>
              </div>
            </div>

            <div class="text-right">
              <div class="font-black text-slate-900 text-sm">RM ${b.amount.toFixed(2)}</div>
              ${!p.isPayer && b.amount > 0 ? `
                <span class="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                  ⏳ Owed
                </span>
              ` : p.isPayer ? `
                <span class="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                  ✓ Paid
                </span>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    updateDuitNowQRDisplay(breakdown);
  }

  function selectFriendForDuitNowQR(friendId) {
    state.split.selectedFriendForQR = friendId;
    renderSplitCalculations();
  }
  window.selectFriendForDuitNowQR = selectFriendForDuitNowQR;

  function updateDuitNowQRDisplay(breakdown) {
    const qrAmt = document.getElementById('split-qr-amount');
    const qrFriendName = document.getElementById('split-qr-friend-name');
    const target = breakdown.find(b => b.participant.id === state.split.selectedFriendForQR) || breakdown[1] || breakdown[0];

    if (qrAmt) {
      qrAmt.textContent = `RM ${target.amount.toFixed(2)}`;
    }
    if (qrFriendName) {
      qrFriendName.textContent = `Scan to pay exact share: RM ${target.amount.toFixed(2)} (${target.participant.name})`;
    }
  }

  function recordActiveBillToLedger() {
    const receipt = state.split.activeReceipt;
    const participants = [];
    const allParticipants = [{ id: 'user', name: 'Alex Tan (You)', isPayer: true }].concat(state.savedFriends);

    if (state.split.mode === 'equal') {
      const activeCount = state.split.equalSelectedFriends.length || 1;
      const sharePerPerson = receipt.total / activeCount;
      allParticipants.forEach(p => {
        if (state.split.equalSelectedFriends.includes(p.id)) {
          participants.push({
            friendId: p.id,
            friendName: p.name,
            phone: p.phone,
            items: [`AA Share of ${receipt.title}`],
            amount: sharePerPerson,
            status: p.isPayer ? 'paid' : 'pending'
          });
        }
      });
    } else {
      allParticipants.forEach(p => {
        let sum = 0;
        const assignedItems = [];
        receipt.items.forEach(item => {
          if (item.assignedTo === p.id) {
            sum += item.price;
            assignedItems.push(`${item.name} (RM ${item.price.toFixed(2)})`);
          } else if (item.assignedTo === 'shared') {
            const splitFraction = item.price / allParticipants.length;
            sum += splitFraction;
            assignedItems.push(`${item.name} [Shared: RM ${splitFraction.toFixed(2)}]`);
          }
        });
        if (sum > 0) {
          participants.push({
            friendId: p.id,
            friendName: p.name,
            phone: p.phone,
            items: assignedItems,
            amount: sum,
            status: p.isPayer ? 'paid' : 'pending'
          });
        }
      });
    }

    const newBillRecord = {
      id: `BILL-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}${String(new Date().getDate()).padStart(2,'0')}-${Math.floor(100+Math.random()*900)}`,
      title: `${receipt.merchant} (${receipt.title})`,
      canteen: receipt.merchant,
      date: "Today, " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      total: receipt.total,
      payer: "Alex Tan (You)",
      participants: participants
    };

    state.split.recordedBills.unshift(newBillRecord);
    renderCumulativeFriendDebts();
    renderPendingSplitsBanner();
    showToast(`Saved to Debt Ledger! Cumulative debts updated across all friends.`);

    if (window.confetti) {
      window.confetti({ particleCount: 50, spread: 60 });
    }
  }
  window.recordActiveBillToLedger = recordActiveBillToLedger;

  // Cumulative Friend Debt Ledger
  function renderCumulativeFriendDebts() {
    const debtData = calculateCumulativeDebts();
    const container = document.getElementById('cumulative-debts-list');
    if (!container) return;

    if (debtData.activeDebtors.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-400">
          🎉 All campus shared bills are settled! No friends owe you money right now.
        </div>
      `;
      return;
    }

    container.innerHTML = debtData.activeDebtors.map(debtor => {
      const f = debtor.friend;
      return `
        <div class="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-full ${f.avatarBg || 'bg-blue-600'} text-white font-bold text-sm flex items-center justify-center shadow-xs">
                ${f.avatarInitial || 'FR'}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="font-extrabold text-slate-900 text-sm">${f.name}</h4>
                  <span class="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    ${debtor.unpaidBills.length} Unsettled ${debtor.unpaidBills.length > 1 ? 'Bills' : 'Bill'}
                  </span>
                </div>
                <p class="text-[11px] text-slate-400 font-medium">${f.phone || '+60 12-345 6789'} • ID: ${f.studentId || '298xxx'}</p>
              </div>
            </div>

            <div class="text-right">
              <span class="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Cumulative Debt</span>
              <div class="text-xl font-black text-slate-900">RM ${debtor.totalOwed.toFixed(2)}</div>
            </div>
          </div>

          <div class="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Accumulated Unpaid Bills (${debtor.unpaidBills.length}):
            </span>
            ${debtor.unpaidBills.map((b, bIdx) => `
              <div class="flex items-start justify-between text-xs p-2 rounded-lg bg-white border border-slate-200/60">
                <div>
                  <div class="font-bold text-slate-800 flex items-center gap-1.5">
                    <span class="w-4 h-4 rounded-full bg-slate-100 text-slate-600 font-bold text-[9px] flex items-center justify-center">${bIdx + 1}</span>
                    <span>${b.billTitle}</span>
                  </div>
                  <div class="text-[10px] text-slate-400 ml-5">${b.date} • ${b.items.join(', ')}</div>
                </div>
                <div class="text-right ml-2 shrink-0">
                  <span class="font-bold text-slate-900">RM ${b.amount.toFixed(2)}</span>
                  <button onclick="settleSingleBill('${b.billId}', '${f.id}', ${b.amount})" class="block text-[10px] text-emerald-600 hover:underline font-semibold mt-0.5">
                    Mark Paid ✓
                  </button>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="flex items-center gap-2 pt-1">
            <button onclick="openWhatsAppReminderModal('${f.id}')" class="flex-1 py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5">
              <span>✈️ 1-Click WhatsApp Remind</span>
            </button>
            <button onclick="settleAllFriendDebt('${f.id}', ${debtor.totalOwed})" class="py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-colors border border-emerald-200">
              Settle All (RM ${debtor.totalOwed.toFixed(2)}) ✓
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // WhatsApp 1-Click Reminder Modal
  function openWhatsAppReminderModal(friendId = null) {
    const debtData = calculateCumulativeDebts();
    let target = null;

    if (friendId) {
      target = debtData.activeDebtors.find(d => d.friend.id === friendId);
    } else {
      target = debtData.activeDebtors[0];
    }

    if (!target) {
      showToast("No pending debts to remind right now!");
      return;
    }

    const modal = document.getElementById('whatsapp-reminder-modal');
    if (!modal) return;

    const f = target.friend;
    document.getElementById('remind-friend-name').textContent = f.name;
    document.getElementById('remind-friend-phone').textContent = f.phone || '+60 12-345 6789';
    document.getElementById('remind-total-amount').textContent = `RM ${target.totalOwed.toFixed(2)}`;
    document.getElementById('remind-bills-count').textContent = `${target.unpaidBills.length} Unsettled Bills`;

    const billLines = target.unpaidBills.map((b, idx) => `${idx + 1}. ${b.billTitle} (${b.date}): RM ${b.amount.toFixed(2)} [${b.items.join(', ')}]`).join('\n');
    const fullMessage = `Hi ${f.name}! 👋 Friendly reminder from UUM PayNow:\nHere is the breakdown of your shared canteen bills:\n${billLines}\n━━━━━━━━━━━━━━━━━━\n💰 Total Cumulative Owed: RM ${target.totalOwed.toFixed(2)}\n\nPlease transfer to Alex Tan or scan my DuitNow QR. Thank you! 🙏`;

    const msgBox = document.getElementById('remind-message-preview');
    if (msgBox) {
      msgBox.value = fullMessage;
    }

    const cleanPhone = (f.phone || '+60123456789').replace(/[^0-9]/g, '');
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(fullMessage)}`;
    const waBtn = document.getElementById('remind-whatsapp-send-btn');
    if (waBtn) {
      waBtn.onclick = () => {
        window.open(waUrl, '_blank');
        showToast(`Opened WhatsApp chat with ${f.name}!`);
        closeWhatsAppModal();
      };
    }

    const settleBtn = document.getElementById('remind-settle-btn');
    if (settleBtn) {
      settleBtn.onclick = () => {
        settleAllFriendDebt(f.id, target.totalOwed);
        closeWhatsAppModal();
      };
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
  window.openWhatsAppReminderModal = openWhatsAppReminderModal;

  function closeWhatsAppModal() {
    const modal = document.getElementById('whatsapp-reminder-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }
  window.closeWhatsAppModal = closeWhatsAppModal;

  function copyReminderMessage() {
    const msgBox = document.getElementById('remind-message-preview');
    if (msgBox) {
      msgBox.select();
      navigator.clipboard.writeText(msgBox.value);
      showToast("Copied reminder text to clipboard!");
    }
  }
  window.copyReminderMessage = copyReminderMessage;

  function settleSingleBill(billId, friendId, amount) {
    const bill = state.split.recordedBills.find(b => b.id === billId);
    if (bill) {
      const participant = bill.participants.find(p => p.friendId === friendId);
      if (participant) {
        participant.status = 'paid';
        state.user.walletBalance += amount;
        renderUserStats();
        renderCumulativeFriendDebts();
        renderPendingSplitsBanner();
        showToast(`Settled RM ${amount.toFixed(2)} from ${participant.friendName}! Credited to wallet.`);
        if (window.confetti) window.confetti({ particleCount: 40, spread: 50 });
      }
    }
  }
  window.settleSingleBill = settleSingleBill;

  function settleAllFriendDebt(friendId, totalAmount) {
    state.split.recordedBills.forEach(bill => {
      bill.participants.forEach(p => {
        if (p.friendId === friendId && p.status === 'pending') {
          p.status = 'paid';
        }
      });
    });

    state.user.walletBalance += totalAmount;
    renderUserStats();
    renderCumulativeFriendDebts();
    renderPendingSplitsBanner();
    showToast(`All debts settled! Credited RM ${totalAmount.toFixed(2)} to your wallet.`);
    if (window.confetti) window.confetti({ particleCount: 70, spread: 70 });
  }
  window.settleAllFriendDebt = settleAllFriendDebt;

  function addNewFriendToContacts() {
    const name = prompt("Enter Friend's Name (e.g. Chong Kai):", "Chong Kai");
    if (!name) return;
    const phone = prompt("Enter Phone Number:", "+60 12-888 7766") || "+60 12-000 0000";
    const studentId = prompt("Enter Matric No:", "299100") || "299100";

    const newFriend = {
      id: `f-${Date.now()}`,
      name: name,
      phone: phone,
      studentId: studentId,
      faculty: "College of Business (COB)",
      avatarInitial: name.substring(0, 2).toUpperCase(),
      avatarBg: "bg-indigo-500"
    };

    state.savedFriends.push(newFriend);
    renderSplitHub();
    showToast(`Added ${name} to your campus contacts!`);
  }
  window.addNewFriendToContacts = addNewFriendToContacts;

  // ==========================================
  // 5. SPENDING ANALYTICS (Student vs Canteen Merchant BI)
  // ==========================================
  function switchAnalyticsRole(role) {
    state.analytics.role = role;
    const studentView = document.getElementById('analytics-student-view');
    const merchantView = document.getElementById('analytics-merchant-view');
    const studentBtn = document.getElementById('analytics-role-btn-student');
    const merchantBtn = document.getElementById('analytics-role-btn-merchant');

    if (role === 'student') {
      if (studentView) studentView.classList.remove('hidden');
      if (merchantView) merchantView.classList.add('hidden');
      if (studentBtn) studentBtn.className = "px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs transition-all";
      if (merchantBtn) merchantBtn.className = "px-4 py-2 bg-white text-slate-600 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold transition-all";
      initStudentCharts();
    } else {
      if (studentView) studentView.classList.add('hidden');
      if (merchantView) merchantView.classList.remove('hidden');
      if (studentBtn) studentBtn.className = "px-4 py-2 bg-white text-slate-600 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold transition-all";
      if (merchantBtn) merchantBtn.className = "px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs transition-all";
      initMerchantCharts();
    }
  }
  window.switchAnalyticsRole = switchAnalyticsRole;

  function initCharts() {
    initStudentCharts();
    initMerchantCharts();
  }

  function initStudentCharts() {
    // 1. Student Category Donut
    const ctxDonut = document.getElementById('category-donut-chart');
    if (ctxDonut) {
      if (state.charts.studentCategoryDonut) state.charts.studentCategoryDonut.destroy();
      state.charts.studentCategoryDonut = new Chart(ctxDonut, {
        type: 'doughnut',
        data: {
          labels: ['Food & Canteens', 'Mart & Convenience', 'Campus Shuttle Transit', 'Academic Printing'],
          datasets: [{
            data: [98.50, 26.50, 12.00, 8.20],
            backgroundColor: ['#0d5be1', '#10b981', '#f59e0b', '#8b5cf6'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
          },
          cutout: '72%'
        }
      });
    }

    // 2. Student Daily Trend Bar
    const ctxTrend = document.getElementById('daily-trend-chart');
    if (ctxTrend) {
      if (state.charts.studentTrendBar) state.charts.studentTrendBar.destroy();
      state.charts.studentTrendBar = new Chart(ctxTrend, {
        type: 'bar',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Daily Spent (RM)',
            data: [18.50, 22.00, 31.40, 26.50, 19.80, 15.00, 12.00],
            backgroundColor: '#0d5be1',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { callback: v => `RM ${v}` } } }
        }
      });
    }
  }

  function initMerchantCharts() {
    // 1. Merchant Rush Hours Foot Traffic
    const ctxTraffic = document.getElementById('merchant-traffic-chart');
    if (ctxTraffic) {
      if (state.charts.merchantTrafficBar) state.charts.merchantTrafficBar.destroy();
      state.charts.merchantTrafficBar = new Chart(ctxTraffic, {
        type: 'bar',
        data: {
          labels: ['7-9 AM (Breakfast)', '10-11:30 AM (Break)', '12-2 PM (Peak Lunch)', '3-5 PM (Teatime)', '6-8 PM (Peak Dinner)', '8:30-10:30 PM (Supper)'],
          datasets: [{
            label: 'Customer Payment Volume',
            data: [142, 65, 480, 110, 390, 210],
            backgroundColor: ['#93c5fd', '#bfdbfe', '#0d5be1', '#bfdbfe', '#2563eb', '#60a5fa'],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    // 2. Merchant Product Category Share Donut
    const ctxProdShare = document.getElementById('merchant-product-share-chart');
    if (ctxProdShare) {
      if (state.charts.merchantCategoryDonut) state.charts.merchantCategoryDonut.destroy();
      state.charts.merchantCategoryDonut = new Chart(ctxProdShare, {
        type: 'doughnut',
        data: {
          labels: ['Hot Meals & Rice Sets', 'Teh Tarik & Beverages', 'Fried Snacks & Pastries', 'Noodles & Sandwiches'],
          datasets: [{
            data: [52, 26, 14, 8],
            backgroundColor: ['#0d5be1', '#059669', '#d97706', '#8b5cf6'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
          },
          cutout: '70%'
        }
      });
    }
  }

  function renderTransactionsTable() {
    const container = document.getElementById('transactions-stream-body');
    if (!container) return;

    container.innerHTML = state.transactions.map(t => {
      let badge = '';
      if (t.status === 'success') {
        badge = `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Success</span>`;
      } else if (t.status === 'pending') {
        badge = `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Pending</span>`;
      } else if (t.status === 'flagged') {
        badge = `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">Blocked / Flagged</span>`;
      } else {
        badge = `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">Failed</span>`;
      }

      return `
        <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100 text-xs">
          <td class="py-3 px-4">
            <div class="font-bold text-slate-900">${t.title}</div>
            <span class="text-[10px] text-slate-400 font-mono">${t.id}</span>
          </td>
          <td class="py-3 px-4 text-slate-600">${t.category}</td>
          <td class="py-3 px-4 text-slate-500">${t.timestamp}</td>
          <td class="py-3 px-4">${badge}</td>
          <td class="py-3 px-4 text-right font-bold ${t.status === 'flagged' ? 'text-red-600 line-through' : 'text-slate-900'}">
            - RM ${t.amount.toFixed(2)}
          </td>
        </tr>
      `;
    }).join('');
  }

  // ==========================================
  // 6. REWARDS, MAP ENGINE & VOUCHERS (Point 2, 5, 7)
  // ==========================================
  // Render Active Vouchers with explicit deduction guide (Point 2)
  function renderActiveVouchersList() {
    const container = document.getElementById('active-vouchers-container');
    if (!container) return;

    const available = state.activeVouchers.filter(v => v.status === 'active');
    if (available.length === 0) {
      container.innerHTML = `
        <div class="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-400">
          No active vouchers right now. Redeem rewards using your loyalty points below!
        </div>
      `;
      return;
    }

    container.innerHTML = available.map(v => `
      <div class="p-4 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/70 to-indigo-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-xs bg-blue-600 text-white font-extrabold px-2 py-0.5 rounded-full">
              ${v.discountType === 'percent' ? v.discountValue + '% OFF' : 'RM ' + v.discountValue.toFixed(2) + ' OFF'}
            </span>
            <h5 class="font-bold text-slate-900 text-sm">${v.name}</h5>
          </div>
          <p class="text-xs text-slate-600 font-semibold">${v.canteen}</p>
          <p class="text-[11px] text-slate-500 leading-relaxed">${v.howItWorks}</p>
          <div class="flex items-center gap-2 text-[10px] text-slate-400 pt-1 font-mono">
            <span>Code: <strong>${v.code}</strong></span>
            <span>•</span>
            <span>Expires: ${v.validUntil}</span>
          </div>
        </div>

        <button onclick="selectMerchantForPayment(${v.canteenId || 1}, '${v.id}')" class="shrink-0 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5">
          <span>Apply to Pay Now</span>
          <span>➔</span>
        </button>
      </div>
    `).join('');
  }

  // Digital Stamp Card with Point 5: Auto-reset to 0 after 10 stamps!
  function renderStampCard() {
    const container = document.getElementById('digital-stamp-grid');
    if (!container) return;

    let slots = '';
    for (let i = 1; i <= state.user.maxStamps; i++) {
      const isStamped = i <= state.user.stamps;
      slots += `
        <div class="stamp-slot aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center border ${
          isStamped ? 'stamped border-emerald-400' : 'bg-slate-50 border-dashed border-slate-300 text-slate-400'
        }">
          <span class="text-lg">${isStamped ? '☕' : i}</span>
          <span class="text-[9px] font-bold mt-1">${isStamped ? 'Earned' : `Pay #${i}`}</span>
        </div>
      `;
    }
    container.innerHTML = slots;

    const stampText = document.getElementById('stamp-counter-text');
    if (stampText) {
      stampText.textContent = `${state.user.stamps} / ${state.user.maxStamps} Stamps Collected`;
    }

    // Update navbar and dropdown profile elements dynamically
    const navName = document.getElementById('nav-user-name');
    const navBadge = document.getElementById('nav-user-badge');
    const navAvatar = document.getElementById('nav-user-avatar');
    if (navName) navName.textContent = state.user.name;
    if (navBadge) navBadge.textContent = `${state.user.badge || state.user.role} • ${state.user.matricNo}`;
    if (navAvatar && state.user.avatar) navAvatar.src = state.user.avatar;

    const ddName = document.getElementById('dropdown-user-name');
    const ddFaculty = document.getElementById('dropdown-user-faculty');
    const ddMatric = document.getElementById('dropdown-user-matric');
    const ddAvatar = document.getElementById('dropdown-user-avatar');
    const ddBalance = document.getElementById('dropdown-user-balance');
    const ddPoints = document.getElementById('dropdown-user-points');

    if (ddName) ddName.textContent = state.user.name;
    if (ddFaculty) ddFaculty.textContent = state.user.faculty || state.user.role;
    if (ddMatric) ddMatric.textContent = `ID: ${state.user.matricNo}`;
    if (ddAvatar && state.user.avatar) ddAvatar.src = state.user.avatar;
    if (ddBalance) ddBalance.textContent = `RM ${state.user.walletBalance.toFixed(2)}`;
    if (ddPoints) ddPoints.textContent = `${state.user.points} pts`;
  }

  // Quick button to simulate test stamp
  function simulateAddStamp() {
    state.user.stamps += 1;
    if (state.user.stamps >= state.user.maxStamps) {
      // Award reward
      state.activeVouchers.push({
        id: `v-reward-${Date.now()}`,
        name: "RM 5.00 Campus Meal Subsidy (Stamp Bonus)",
        canteen: "Valid at Any Canteen",
        canteenId: null,
        discountType: "fixed",
        discountValue: 5.00,
        minSpend: 6.00,
        code: `STAMP-${Math.floor(1000+Math.random()*9000)}`,
        howItWorks: "Earned from completing 10 digital payments! Deducts RM 5.00 automatically on your next meal.",
        validUntil: "31 Dec 2026",
        status: "active"
      });
      state.user.points += 50;
      state.user.stamps = 0; // RESET TO ZERO!

      if (window.confetti) window.confetti({ particleCount: 120, spread: 80 });
      alert("🎉 STAMP CARD COMPLETED (10/10)!\n\nAwarded RM 5.00 Meal Subsidy Voucher & +50 Points!\nYour stamp card has reset to 0/10 for your next reward cycle.");
    } else {
      showToast(`Earned +1 Stamp! (${state.user.stamps}/10)`);
    }

    renderUserStats();
    renderStampCard();
    renderActiveVouchersList();
      if (window.checkDailyWheelStatus) checkDailyWheelStatus();
  }
  window.simulateAddStamp = simulateAddStamp;

  // Dual-Engine Map: Option A (Leaflet + OSM) vs Option B (Google Maps Embed)
  function switchMapEngine(engine) {
    state.mapEngine = engine;
    const leafletBox = document.getElementById('map-engine-leaflet');
    const googleBox = document.getElementById('map-engine-google');
    const btnLeaflet = document.getElementById('btn-map-leaflet');
    const btnGoogle = document.getElementById('btn-map-google');

    if (engine === 'leaflet') {
      if (leafletBox) leafletBox.classList.remove('hidden');
      if (googleBox) googleBox.classList.add('hidden');
      if (btnLeaflet) btnLeaflet.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-xs";
      if (btnGoogle) btnGoogle.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:text-slate-900";
      setTimeout(() => { if (state.map) state.map.invalidateSize(); }, 100);
    } else {
      if (leafletBox) leafletBox.classList.add('hidden');
      if (googleBox) googleBox.classList.remove('hidden');
      if (btnLeaflet) btnLeaflet.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:text-slate-900";
      if (btnGoogle) btnGoogle.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-xs";
    }
  }
  window.switchMapEngine = switchMapEngine;

  const mapState = {
    currentCategory: 'All',
    searchQuery: '',
    markers: {},
    currentTileLayer: null
  };

  function initLeafletMap() {
    const mapContainer = document.getElementById('campus-leaflet-map');
    if (!mapContainer || state.map) return;

    state.map = L.map('campus-leaflet-map', {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView([6.4638, 100.5015], 16);

    // Default to Esri World Street Map (100% Clean, Zero Watermark, No API Key Required)
    setMapTileStyle('streets');

    renderMapMarkers(state.canteens);
    renderMapSidebarDirectory(state.canteens);

    const searchInput = document.getElementById('map-canteen-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        mapState.searchQuery = e.target.value.toLowerCase().trim();
        applyMapFilters();
      });
    }

    document.querySelectorAll('.map-route-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.map-route-pill').forEach(p => {
          p.classList.remove('bg-blue-600', 'text-white', 'shadow-xs');
          p.classList.add('bg-white', 'text-slate-600');
        });
        pill.classList.remove('bg-white', 'text-slate-600');
        pill.classList.add('bg-blue-600', 'text-white', 'shadow-xs');
        mapState.currentCategory = pill.getAttribute('data-route');
        applyMapFilters();
      });
    });
  }

  function setMapTileStyle(styleKey) {
    if (!state.map) return;

    // 100% Free, Zero Watermark, Zero API Key Tile Providers
    const urls = {
      streets: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        subdomains: '',
        attribution: '&copy; Esri, HERE, Garmin, OpenStreetMap'
      },
      topo: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        subdomains: '',
        attribution: '&copy; Esri, USGS, OpenStreetMap'
      },
      osm: {
        url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
        subdomains: 'abc',
        attribution: '&copy; OpenStreetMap France contributors'
      }
    };

    const config = urls[styleKey] || urls.streets;

    if (mapState.currentTileLayer) {
      state.map.removeLayer(mapState.currentTileLayer);
    }

    mapState.currentTileLayer = L.tileLayer(config.url, {
      maxZoom: 19,
      subdomains: config.subdomains,
      attribution: config.attribution
    }).addTo(state.map);
  }
  window.setMapTileStyle = setMapTileStyle;

  function createCustomCanteenMarkerIcon(canteen) {
    let colorClass = 'bg-blue-600';
    let routeBadge = 'A';
    let emoji = '🍲';

    if (canteen.category === 'Laluan B') {
      colorClass = 'bg-emerald-600';
      routeBadge = 'B';
      emoji = '🍚';
    } else if (canteen.category === 'Laluan C') {
      colorClass = 'bg-amber-600';
      routeBadge = 'C';
      emoji = '🥞';
    } else if (canteen.category === 'Other') {
      colorClass = 'bg-purple-600';
      routeBadge = '📚';
      emoji = '☕';
    }

    return L.divIcon({
      className: 'custom-canteen-marker',
      html: `
        <div class="canteen-marker-pin relative cursor-pointer" style="transform: translate(-50%, -100%);">
          <div class="w-10 h-10 rounded-2xl ${colorClass} text-white flex items-center justify-center shadow-lg border-2 border-white">
            <span class="text-base">${emoji}</span>
          </div>
          <div class="w-2.5 h-2.5 ${colorClass} rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-white"></div>
          <span class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white text-slate-900 text-[9px] font-black flex items-center justify-center shadow-xs border border-slate-200">
            ${routeBadge}
          </span>
        </div>
      `,
      iconSize: [40, 48],
      iconAnchor: [20, 48],
      popupAnchor: [0, -46]
    });
  }

  function renderMapMarkers(list) {
    if (!state.map) return;

    Object.values(mapState.markers).forEach(m => state.map.removeLayer(m));
    mapState.markers = {};

    list.forEach(c => {
      const icon = createCustomCanteenMarkerIcon(c);
      const marker = L.marker([c.latitude, c.longitude], { icon: icon }).addTo(state.map);

      const menuItems = state.menus[c.id] || [];
      const popularPreview = menuItems.slice(0, 2).map(m => `${m.name} (RM ${m.price.toFixed(2)})`).join(', ');

      const popupHtml = `
        <div style="width: 250px; font-family: 'Plus Jakarta Sans', system-ui, sans-serif;">
          <div style="height: 110px; width: 100%; overflow: hidden; position: relative;">
            <img src="${c.photo_url}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='images/canteen_tnb.jpg'">
            <span style="position: absolute; top: 6px; left: 6px; background: rgba(15, 23, 42, 0.85); color: white; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 9999px;">
              ${c.category}
            </span>
            <span style="position: absolute; top: 6px; right: 6px; background: #10b981; color: white; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 9999px;">
              ✓ DuitNow Verified
            </span>
          </div>

          <div style="padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
              <h4 style="margin: 0; font-weight: 800; font-size: 14px; color: #0f172a;">${c.name}</h4>
              <span style="font-size: 11px; font-weight: bold; color: #d97706;">★ ${c.rating}</span>
            </div>

            <p style="margin: 0 0 8px; font-size: 11px; color: #64748b; line-height: 1.4;">
              ${c.hours} • ${c.distance} from Centre
            </p>

            <div style="background: #eff6ff; border: 1px solid #dbeafe; color: #1d4ed8; padding: 6px 8px; border-radius: 8px; font-size: 10px; font-weight: bold; margin-bottom: 8px; display: flex; align-items: center; gap: 4px;">
              <span>🎁</span> <span>${c.promo}</span>
            </div>

            <div style="font-size: 10px; color: #475569; margin-bottom: 10px; background: #f8fafc; padding: 6px; border-radius: 6px; border: 1px solid #f1f5f9;">
              <strong style="color: #0f172a;">Popular:</strong> ${popularPreview}
            </div>

            <button onclick="selectMerchantForPayment(${c.id})" style="width: 100%; background: #0d5be1; color: white; border: none; padding: 8px; border-radius: 10px; font-weight: 800; font-size: 11px; cursor: pointer; transition: background 0.2s; box-shadow: 0 2px 8px rgba(13, 91, 225, 0.25);">
              Pay at this Stall →
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      mapState.markers[c.id] = marker;
    });
  }

  function renderMapSidebarDirectory(list) {
    const container = document.getElementById('map-sidebar-canteen-list');
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div class="p-6 text-center text-xs text-slate-400">
          No canteens match your search.
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(c => `
      <div onclick="flyToCanteenOnMap(${c.id})" class="p-3 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/40 transition-all cursor-pointer group flex items-center justify-between gap-3 shadow-xs">
        <div class="flex items-center gap-2.5 min-w-0">
          <img src="${c.photo_url}" class="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200" onerror="this.src='images/canteen_tnb.jpg'">
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <h5 class="font-extrabold text-slate-800 text-xs truncate group-hover:text-blue-600 transition-colors">${c.name}</h5>
            </div>
            <p class="text-[10px] text-slate-400 truncate">${c.category} • ${c.hours}</p>
            <span class="inline-block text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded mt-0.5 truncate max-w-[150px]">
              🎁 ${c.promo}
            </span>
          </div>
        </div>
        <button class="shrink-0 w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-600 flex items-center justify-center transition-colors text-xs font-bold">
          →
        </button>
      </div>
    `).join('');
  }

  function applyMapFilters() {
    const q = mapState.searchQuery;
    const cat = mapState.currentCategory;

    const filtered = state.canteens.filter(c => {
      const matchCat = cat === 'All' || c.category === cat;
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || (state.menus[c.id] || []).some(m => m.name.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });

    renderMapMarkers(filtered);
    renderMapSidebarDirectory(filtered);

    if (filtered.length === 1) {
      flyToCanteenOnMap(filtered[0].id);
    }
  }

  function flyToCanteenOnMap(canteenId) {
    const c = state.canteens.find(item => item.id === canteenId);
    if (!c) return;

    if (state.mapEngine === 'google') {
      const iframe = document.getElementById('google-maps-iframe');
      if (iframe) {
        iframe.src = `https://maps.google.com/maps?q=${c.latitude},${c.longitude}(${encodeURIComponent(c.name)})&t=&z=17&ie=UTF8&iwloc=&output=embed`;
      }
    } else if (state.map) {
      state.map.flyTo([c.latitude, c.longitude], 17, { duration: 1.2 });
      const marker = mapState.markers[canteenId];
      if (marker) {
        setTimeout(() => { marker.openPopup(); }, 600);
      }
    }
  }
  window.flyToCanteenOnMap = flyToCanteenOnMap;

  function resetMapCampusView() {
    if (state.mapEngine === 'google') {
      const iframe = document.getElementById('google-maps-iframe');
      if (iframe) {
        iframe.src = 'https://maps.google.com/maps?q=Universiti+Utara+Malaysia+Sintok&t=&z=16&ie=UTF8&iwloc=&output=embed';
      }
    } else if (state.map) {
      state.map.flyTo([6.4638, 100.5015], 16, { duration: 1.0 });
    }

    mapState.currentCategory = 'All';
    mapState.searchQuery = '';
    const searchInput = document.getElementById('map-canteen-search');
    if (searchInput) searchInput.value = '';
    document.querySelectorAll('.map-route-pill').forEach(p => {
      const isAll = p.getAttribute('data-route') === 'All';
      if (isAll) {
        p.classList.add('bg-blue-600', 'text-white', 'shadow-xs');
        p.classList.remove('bg-white', 'text-slate-600');
      } else {
        p.classList.remove('bg-blue-600', 'text-white', 'shadow-xs');
        p.classList.add('bg-white', 'text-slate-600');
      }
    });
    applyMapFilters();
  }
  window.resetMapCampusView = resetMapCampusView;

  function checkDailyWheelStatus() {
    const today = new Date().toISOString().slice(0, 10);
    const spinBtn = document.getElementById('btn-spin-wheel');
    const noticeElem = document.getElementById('wheel-limit-notice');
    const resetBtn = document.getElementById('btn-spin-wheel-reset');

    const lastSpin = state.luckyWheel.lastSpinDate;
    const hasSpunToday = (lastSpin === today);

    if (spinBtn) {
      if (hasSpunToday) {
        spinBtn.disabled = true;
        spinBtn.className = "w-full py-2.5 bg-slate-200 text-slate-500 rounded-xl text-xs font-bold transition-all cursor-not-allowed";
        spinBtn.innerHTML = "Already Spun Today (Limit: 1/Day) ✓";
      } else {
        spinBtn.disabled = false;
        spinBtn.className = "w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer";
        spinBtn.innerHTML = "Spin Wheel 🎯";
      }
    }

    if (noticeElem) {
      if (hasSpunToday) {
        noticeElem.className = "text-[11px] text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded-xl text-center font-bold block";
        noticeElem.textContent = "⏰ Daily Limit Reached: 1 free spin per day. Reset at midnight!";
      } else {
        noticeElem.className = "text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-xl text-center font-bold block";
        noticeElem.textContent = "🎁 1 Free Daily Spin Available! Spin to earn bonus points.";
      }
    }
  }
  window.checkDailyWheelStatus = checkDailyWheelStatus;

  function resetDailySpinDemo() {
    state.luckyWheel.lastSpinDate = null;
    try { localStorage.removeItem('uum_lucky_spin_date'); } catch (e) {}
    checkDailyWheelStatus();
    showToast("↺ Demo Reset: Daily spin unlocked for testing!");
  }
  window.resetDailySpinDemo = resetDailySpinDemo;

  function spinLuckyWheel() {
    const today = new Date().toISOString().slice(0, 10);
    if (state.luckyWheel.lastSpinDate === today) {
      showToast("⏰ You have already used your 1 free spin today! Come back tomorrow.");
      return;
    }
    if (state.luckyWheel.isSpinning) return;

    const wheelCanvas = document.getElementById('lucky-wheel-canvas');
    const resultBox = document.getElementById('wheel-result-msg');
    const spinBtn = document.getElementById('btn-spin-wheel');
    if (!wheelCanvas) return;

    state.luckyWheel.isSpinning = true;
    if (spinBtn) {
      spinBtn.disabled = true;
      spinBtn.textContent = "Spinning Wheel...";
    }

    const prizes = [5, 10, 20, 50, 15, 25];
    const prizeWon = prizes[Math.floor(Math.random() * prizes.length)];

    let rotation = 0;
    const totalSpin = 1440 + Math.random() * 360;
    const duration = 2200;
    const start = performance.now();

    function animate(time) {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      rotation = ease * totalSpin;

      const ctx = wheelCanvas.getContext('2d');
      ctx.clearRect(0, 0, 200, 200);
      ctx.save();
      ctx.translate(100, 100);
      ctx.rotate((rotation * Math.PI) / 180);

      const colors = ['#0d5be1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 95, (i * 60 * Math.PI) / 180, ((i + 1) * 60 * Math.PI) / 180);
        ctx.fillStyle = colors[i];
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.rotate(((i * 60 + 30) * Math.PI) / 180);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`+${prizes[i]}p`, 45, 4);
        ctx.restore();
      }
      ctx.restore();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        state.luckyWheel.isSpinning = false;
        state.luckyWheel.lastSpinDate = today;
        try { localStorage.setItem('uum_lucky_spin_date', today); } catch (e) {}

        state.user.points += prizeWon;
        renderUserStats();

        if (resultBox) {
          resultBox.innerHTML = `🎉 Congratulations! You won <strong class="text-blue-600">+${prizeWon} Points</strong>!`;
          resultBox.classList.remove('hidden');
        }
        if (window.confetti) window.confetti({ particleCount: 60, spread: 60 });
        showToast(`🎉 Daily Spin Complete! Won +${prizeWon} Points.`);

        checkDailyWheelStatus();
      }
    }
    requestAnimationFrame(animate);
  }
  window.spinLuckyWheel = spinLuckyWheel;

  function renderRewardsCatalog() {
    const container = document.getElementById('rewards-items-grid');
    if (!container) return;

    container.innerHTML = state.rewards.map(r => `
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
        <div class="h-32 bg-slate-100 overflow-hidden relative">
          <img src="${r.image}" class="w-full h-full object-cover" onerror="this.src='images/drink_tea.jpg'">
          <span class="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
            ${r.value}
          </span>
        </div>
        <div class="p-4 flex-1 flex flex-col justify-between space-y-2">
          <div>
            <h5 class="font-bold text-slate-800 text-xs">${r.name}</h5>
            <p class="text-[11px] text-slate-400">${r.canteen}</p>
            <p class="text-[10px] text-slate-500 mt-1 line-clamp-2">${r.deductionGuide}</p>
          </div>
          <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span class="font-bold text-blue-600 text-xs">${r.pointsReq} Points</span>
            <button onclick="redeemReward('${r.id}')" class="px-3 py-1.5 ${
              state.user.points >= r.pointsReq ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            } text-[10px] font-bold rounded-xl transition-colors">
              Redeem
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function redeemReward(rewardId) {
    const r = state.rewards.find(item => item.id === rewardId);
    if (!r) return;

    if (state.user.points < r.pointsReq) {
      alert(`You need ${r.pointsReq} points to redeem this voucher (Current: ${state.user.points} pts).`);
      return;
    }

    state.user.points -= r.pointsReq;

    // Add to user active vouchers with explicit discount deduction details
    const newVoucher = {
      id: `v-${Date.now()}`,
      name: r.name,
      canteen: r.canteen,
      discountType: r.name.includes('%') ? 'percent' : 'fixed',
      discountValue: r.name.includes('10%') ? 10 : r.name.includes('Teh') ? 1.80 : 5.00,
      code: r.code,
      howItWorks: r.deductionGuide,
      validUntil: '31 Dec 2026',
      status: 'active'
    };

    state.activeVouchers.unshift(newVoucher);
    renderUserStats();
    renderRewardsCatalog();
    renderActiveVouchersList();
      if (window.checkDailyWheelStatus) checkDailyWheelStatus();
    showToast(`Redeemed ${r.name}! Added to your active vouchers.`);
    if (window.confetti) window.confetti({ particleCount: 50, spread: 60 });
  }
  window.redeemReward = redeemReward;

  function renderLeaderboard() {
    // 1. Campus-Wide Milestone Progress Bar (Handbook Direction B)
    const milestoneBox = document.getElementById('campus-milestone-box');
    if (milestoneBox && window.UUM_DATA.leaderboard.campusMilestone) {
      const ms = window.UUM_DATA.leaderboard.campusMilestone;
      milestoneBox.innerHTML = `
        <div class="p-5 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="text-2xl">🎓</span>
              <div>
                <span class="text-[10px] font-extrabold uppercase tracking-widest text-blue-300">Handbook Direction B • Collective Goal</span>
                <h4 class="text-base sm:text-lg font-black tracking-tight text-white">UUM Campus Cashless Milestone</h4>
              </div>
            </div>
            <span class="text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full self-start sm:self-auto">
              ⏱️ ${ms.daysLeft} Days Remaining
            </span>
          </div>

          <!-- Progress Bar & Count -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-xs font-bold">
              <span>Progress: <strong class="text-emerald-400">${ms.current.toLocaleString()}</strong> / ${ms.target.toLocaleString()} Meals</span>
              <span class="text-amber-300 font-extrabold">${ms.percent}% Achieved</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-3.5 p-0.5 overflow-hidden">
              <div class="bg-gradient-to-r from-emerald-400 to-teal-300 h-2.5 rounded-full transition-all duration-700 shadow-sm" style="width: ${ms.percent}%"></div>
            </div>
          </div>

          <!-- Unlocked Reward Banner -->
          <div class="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 flex items-center gap-3 text-xs">
            <span class="text-xl">🎁</span>
            <div>
              <strong class="text-amber-300">${ms.rewardTitle}:</strong>
              <p class="text-[11px] text-slate-200 mt-0.5 leading-relaxed">${ms.rewardDesc}</p>
            </div>
          </div>
        </div>
      `;
    }

    // 2. Inter-Faculty Cashless Quest (Handbook Direction B)
    const facultyContainer = document.getElementById('faculty-battle-list');
    if (facultyContainer && window.UUM_DATA.leaderboard.faculties) {
      facultyContainer.innerHTML = window.UUM_DATA.leaderboard.faculties.map(fac => `
        <div class="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-2.5 hover:border-blue-300 transition-all">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="text-lg">${fac.icon}</span>
              <div>
                <div class="flex items-center gap-1.5">
                  <h5 class="text-xs font-black text-slate-900">${fac.name}</h5>
                  <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    ${fac.badge}
                  </span>
                </div>
                <span class="text-[10px] text-slate-400">${fac.activeStudents} student contributors</span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-xs font-black text-slate-900">${fac.totalTransactions.toLocaleString()} txns</div>
              <span class="text-[10px] font-bold text-emerald-600">${fac.percentage}% share</span>
            </div>
          </div>

          <!-- Faculty Contribution Progress -->
          <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div class="${fac.color} h-2 rounded-full" style="width: ${fac.percentage}%"></div>
          </div>
        </div>
      `).join('');
    }

    // 3. Compact Home Ticker Sync
    const homeTicker = document.getElementById('home-milestone-ticker-text');
    if (homeTicker && window.UUM_DATA.leaderboard.campusMilestone) {
      const ms = window.UUM_DATA.leaderboard.campusMilestone;
      homeTicker.textContent = `🎓 UUM Collective Goal: ${ms.percent}% achieved (${ms.current.toLocaleString()}/${ms.target.toLocaleString()} digital meals). COB is leading!`;
    }

    // 4. Individual Champions Ranking
    const indContainer = document.getElementById('leaderboard-individuals-list');
    if (!indContainer) return;

    indContainer.innerHTML = window.UUM_DATA.leaderboard.individuals.map(user => `
      <div class="flex items-center justify-between p-3.5 rounded-xl ${
        user.isUser ? 'bg-blue-50/90 border-2 border-blue-600' : 'bg-white border border-slate-100'
      }">
        <div class="flex items-center gap-3">
          <span class="w-6 text-center font-black ${
            user.rank === 1 ? 'text-amber-500 text-base' : user.rank === 2 ? 'text-slate-400 text-sm' : user.rank === 3 ? 'text-amber-700 text-sm' : 'text-slate-600 text-xs'
          }">
            ${user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`}
          </span>
          <div class="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
            ${user.avatar}
          </div>
          <div>
            <div class="font-bold text-slate-800 text-xs">${user.name}</div>
            <div class="text-[10px] text-slate-500">${user.faculty}</div>
          </div>
        </div>
        <div class="text-right">
          <div class="font-black text-slate-900 text-xs">${user.points} pts</div>
          <div class="text-[10px] text-slate-400">${user.payments} payments</div>
        </div>
      </div>
    `).join('');
  }

  // ==========================================
  // 7. FRAUD GUARD: DISTINCT VISUALS (Point 6)
  // ==========================================
  function renderScamSimulator() {
    const scenario = window.UUM_DATA.scamScenarios[state.scam.activeScenarioIndex];
    const container = document.getElementById('scam-scenario-viewport');
    if (!container || !scenario) return;

    // Render distinct visual mockup based on scenario.type:
    // 'qr' -> QR Code comparison
    // 'sms' -> Smartphone Phishing Message bubble
    // 'receipt' -> Doctored Bank Transfer screenshot
    let visualComparisonHtml = '';

    if (scenario.type === 'qr') {
      visualComparisonHtml = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50">
            <div class="flex items-center gap-2 mb-2 text-emerald-800 font-bold text-xs">
              <span>✓</span> ${scenario.authenticLabel}
            </div>
            <img src="images/duitnow_sample_qr.svg" class="w-36 h-36 mx-auto mb-3 bg-white p-2 rounded-lg shadow-sm border border-slate-200">
            <p class="text-[11px] text-emerald-900 font-mono text-center font-semibold">${scenario.authenticDetail}</p>
          </div>

          <div class="p-4 rounded-xl border border-red-300 bg-red-50/50">
            <div class="flex items-center gap-2 mb-2 text-red-800 font-bold text-xs">
              <span>⚠️</span> ${scenario.scamLabel}
            </div>
            <img src="images/scam_fake_qr.svg" class="w-36 h-36 mx-auto mb-3 bg-white p-2 rounded-lg shadow-sm border border-red-200">
            <p class="text-[11px] text-red-900 font-mono text-center font-semibold">${scenario.scamDetail}</p>
          </div>
        </div>
      `;
    } else if (scenario.type === 'sms') {
      visualComparisonHtml = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <!-- Authentic Portal Notification -->
          <div class="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 mb-3 text-emerald-800 font-bold text-xs">
                <span>✓</span> ${scenario.authenticLabel}
              </div>
              <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span class="font-bold text-slate-800 text-xs">Official UUM Student Portal</span>
                </div>
                <p class="text-xs text-slate-600">
                  Dining subsidies are credited directly to your UUM PayNow in-app balance. Official updates appear on your verified dashboard.
                </p>
                <div class="text-[10px] text-emerald-700 font-mono font-bold">
                  URL: https://portal.uum.edu.my (SSL Encrypted)
                </div>
              </div>
            </div>
            <p class="text-[11px] text-emerald-900 font-semibold text-center mt-3">${scenario.authenticDetail}</p>
          </div>

          <!-- Phishing SMS Phone Mockup -->
          <div class="p-4 rounded-xl border border-red-300 bg-red-50/50 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 mb-3 text-red-800 font-bold text-xs">
                <span>⚠️</span> ${scenario.scamLabel}
              </div>
              <div class="p-4 bg-white rounded-2xl border border-red-200 shadow-xs space-y-3 font-sans">
                <div class="flex items-center justify-between text-[10px] text-slate-400 pb-1 border-b border-slate-100">
                  <span>📱 SMS • +60 19-332 9182</span>
                  <span class="text-red-500 font-bold">Suspicious Sender</span>
                </div>
                <div class="sms-bubble-scam p-3 text-xs text-slate-800 space-y-1.5">
                  <p class="font-semibold text-red-950">
                    [UUM BURSARY NOTICE] Urgent: Your 2026 Semester 1 Cashless Dining Subsidy of RM300.00 will expire at 23:59 tonight!
                  </p>
                  <p class="text-[11px] text-slate-600">
                    Claim immediately into your bank account:
                  </p>
                  <span class="text-blue-600 underline font-mono text-[11px] block break-all font-bold">
                    http://uum-paynow-grant-claim.xyz/login.php
                  </span>
                </div>
                <div class="flex items-center gap-1.5 text-[10px] text-red-600 font-bold bg-red-100/70 p-2 rounded-lg">
                  <span>⚠️ Danger:</span> <span>Requests student matric password & banking PIN!</span>
                </div>
              </div>
            </div>
            <p class="text-[11px] text-red-900 font-semibold text-center mt-3 font-mono">${scenario.scamDetail}</p>
          </div>
        </div>
      `;
    } else {
      // type: 'receipt' - Overpayment screenshot scam
      visualComparisonHtml = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <!-- Authentic Live In-App Ledger -->
          <div class="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 mb-3 text-emerald-800 font-bold text-xs">
                <span>✓</span> ${scenario.authenticLabel}
              </div>
              <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div class="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                  <span class="font-bold text-slate-800">Your Wallet Stream</span>
                  <span class="text-emerald-600 font-bold">Live Synchronized</span>
                </div>
                <div class="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                  No incoming transfer of RM 50.00 found.<br/>
                  <strong class="text-slate-700">Actual Wallet Received: RM 0.00</strong>
                </div>
                <p class="text-[10px] text-emerald-700">
                  Always rely solely on your own live app stream, never third-party screenshots.
                </p>
              </div>
            </div>
            <p class="text-[11px] text-emerald-900 font-semibold text-center mt-3">${scenario.authenticDetail}</p>
          </div>

          <!-- Fake Payment Screenshot Mockup -->
          <div class="p-4 rounded-xl border border-red-300 bg-red-50/50 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 mb-3 text-red-800 font-bold text-xs">
                <span>⚠️</span> ${scenario.scamLabel}
              </div>
              <div class="fake-receipt-slip p-4 space-y-2 font-mono text-xs">
                <div class="flex justify-between items-center pb-2 border-b border-red-200">
                  <span class="font-bold text-red-600">DOCTORED RECEIPT</span>
                  <span class="text-[10px] text-red-400">Photoshop / Generator</span>
                </div>
                <div class="text-center py-2">
                  <span class="text-[10px] text-slate-400">Instant DuitNow Transfer</span>
                  <div class="text-xl font-black text-slate-800">RM 50.00</div>
                  <span class="text-[10px] text-emerald-600 font-bold">Status: Successful</span>
                </div>
                <div class="text-[10px] text-slate-500 space-y-0.5 border-t border-slate-100 pt-2">
                  <div>Recipient: Alex Tan</div>
                  <div>Reference: 20261023-FAKEXXX</div>
                  <div class="text-red-600 font-bold">Scammer demands: "Refund me RM 45 in cash!"</div>
                </div>
              </div>
            </div>
            <p class="text-[11px] text-red-900 font-semibold text-center mt-3 font-mono">${scenario.scamDetail}</p>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="bg-white rounded-2xl border border-red-200/80 p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <span class="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">${scenario.badge}</span>
          <span class="text-xs text-slate-400 font-semibold">Location: ${scenario.canteen}</span>
        </div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">${scenario.title}</h3>
        <p class="text-xs text-slate-600 mb-6 leading-relaxed">${scenario.previewDesc}</p>

        ${visualComparisonHtml}

        <div class="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs mb-4">
          <strong class="text-slate-800 block mb-1">How the scam operates:</strong>
          <p class="text-slate-600 leading-relaxed mb-3">${scenario.explanation}</p>
          <strong class="text-blue-700 block mb-1">🛡️ How UUM PayNow Guards You:</strong>
          <p class="text-slate-700 leading-relaxed">${scenario.safetyFeature}</p>
        </div>

        <div class="flex justify-between items-center pt-2">
          <button onclick="changeScamScenario(-1)" class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors">
            ← Previous Scenario
          </button>
          <span class="text-xs text-slate-400 font-bold">${state.scam.activeScenarioIndex + 1} / ${window.UUM_DATA.scamScenarios.length}</span>
          <button onclick="changeScamScenario(1)" class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors">
            Next Scenario →
          </button>
        </div>
      </div>
    `;

    renderScamQuiz();
  }

  function changeScamScenario(delta) {
    const total = window.UUM_DATA.scamScenarios.length;
    state.scam.activeScenarioIndex = (state.scam.activeScenarioIndex + delta + total) % total;
    renderScamSimulator();
  }
  window.changeScamScenario = changeScamScenario;

  function renderScamQuiz() {
    const quizContainer = document.getElementById('scam-quiz-viewport');
    if (!quizContainer) return;

    quizContainer.innerHTML = window.UUM_DATA.quizQuestions.map((item, qIdx) => {
      const selected = state.scam.quizAnswers[qIdx];
      const isSubmitted = state.scam.quizSubmitted;

      return `
        <div class="p-5 rounded-2xl border border-slate-200 bg-white mb-4">
          <h5 class="font-bold text-slate-800 text-xs mb-3">Q${qIdx + 1}: ${item.q}</h5>
          <div class="space-y-2">
            ${item.options.map((opt, oIdx) => {
              let optStyle = 'border-slate-200 hover:border-slate-300 bg-white text-slate-700';
              if (selected === oIdx) {
                optStyle = 'border-blue-600 bg-blue-50 text-blue-900 font-semibold';
              }
              if (isSubmitted) {
                if (oIdx === item.correctIndex) {
                  optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                } else if (selected === oIdx && selected !== item.correctIndex) {
                  optStyle = 'border-red-500 bg-red-50 text-red-900 font-bold';
                }
              }

              return `
                <button type="button" onclick="selectQuizAnswer(${qIdx}, ${oIdx})" ${isSubmitted ? 'disabled' : ''} class="w-full text-left p-3 rounded-xl border text-xs transition-colors ${optStyle}">
                  ${opt}
                </button>
              `;
            }).join('')}
          </div>
          ${isSubmitted ? `
            <div class="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
              💡 ${item.reason}
            </div>
          ` : ''}
        </div>
      `;
    }).join('') + `
      <div class="text-right">
        <button onclick="submitScamQuiz()" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors">
          ${state.scam.quizSubmitted ? 'Retake Quiz' : 'Submit Answers (+20 Pts)'}
        </button>
      </div>
    `;
  }

  function selectQuizAnswer(qIdx, oIdx) {
    state.scam.quizAnswers[qIdx] = oIdx;
    renderScamQuiz();
  }
  window.selectQuizAnswer = selectQuizAnswer;

  function submitScamQuiz() {
    if (state.scam.quizSubmitted) {
      state.scam.quizSubmitted = false;
      state.scam.quizAnswers = {};
      renderScamQuiz();
      return;
    }

    let correct = 0;
    window.UUM_DATA.quizQuestions.forEach((q, idx) => {
      if (state.scam.quizAnswers[idx] === q.correctIndex) correct++;
    });

    state.scam.quizSubmitted = true;
    state.user.points += 20;
    renderUserStats();
    renderScamQuiz();
    showToast(`Quiz completed! You scored ${correct}/${window.UUM_DATA.quizQuestions.length}. Awarded +20 Points!`);
    if (window.confetti) window.confetti({ particleCount: 50, spread: 60 });
  }
  window.submitScamQuiz = submitScamQuiz;

  // ==========================================
  // 8. AI ASSISTANT & FAQ SCROLLING FIX (Point 1)
  // ==========================================
  function toggleAIChat(forceState) {
    state.ai.isOpen = typeof forceState === 'boolean' ? forceState : !state.ai.isOpen;
    if (el.aiDrawer) {
      if (state.ai.isOpen) {
        el.aiDrawer.classList.remove('hidden');
        renderAIFaqs();
        renderAIMessages();
        scrollAIToBottom();
      } else {
        el.aiDrawer.classList.add('hidden');
      }
    }
  }
  window.toggleAIChat = toggleAIChat;

  function switchAIAssistantTab(tab) {
    state.ai.activeTab = tab;
    const faqView = document.getElementById('ai-faq-view');
    const chatView = document.getElementById('ai-chat-view');
    const tabFaqBtn = document.getElementById('ai-tab-btn-faq');
    const tabChatBtn = document.getElementById('ai-tab-btn-chat');

    if (tab === 'faq') {
      if (faqView) faqView.classList.remove('hidden');
      if (chatView) chatView.classList.add('hidden');
      if (tabFaqBtn) tabFaqBtn.className = "flex-1 py-1.5 text-xs font-bold bg-white text-blue-600 rounded-lg shadow-xs";
      if (tabChatBtn) tabChatBtn.className = "flex-1 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900";
    } else {
      if (faqView) faqView.classList.add('hidden');
      if (chatView) chatView.classList.remove('hidden');
      if (tabFaqBtn) tabFaqBtn.className = "flex-1 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900";
      if (tabChatBtn) tabChatBtn.className = "flex-1 py-1.5 text-xs font-bold bg-white text-blue-600 rounded-lg shadow-xs";
      setTimeout(() => {
        if (el.aiInput) el.aiInput.focus();
        scrollAIToBottom();
      }, 100);
    }
  }
  window.switchAIAssistantTab = switchAIAssistantTab;

  function toggleFaqAccordion(faqId) {
    state.ai.expandedFaqId = state.ai.expandedFaqId === faqId ? null : faqId;
    renderAIFaqs();
  }
  window.toggleFaqAccordion = toggleFaqAccordion;

  function renderAIFaqs() {
    const container = document.getElementById('ai-faqs-accordion-list');
    if (!container) return;

    container.innerHTML = window.UUM_DATA.aiFaqs.map(faq => {
      const isExpanded = state.ai.expandedFaqId === faq.id;
      return `
        <div class="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs transition-all">
          <button onclick="toggleFaqAccordion('${faq.id}')" class="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
            <span class="font-bold text-xs text-slate-800 leading-snug">${faq.q}</span>
            <span class="text-xs text-slate-400 font-bold transition-transform ${isExpanded ? 'rotate-180' : ''}">▼</span>
          </button>
          ${isExpanded ? `
            <div class="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
              <p class="mb-3">${faq.answer}</p>
              <button onclick="switchTab('${faq.actionTarget}'); toggleAIChat(false);" class="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1">
                <span>${faq.actionText}</span>
                <span>→</span>
              </button>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  function renderAIMessages() {
    if (!el.aiMessagesList) return;

    el.aiMessagesList.innerHTML = state.ai.messages.map(m => {
      const isAI = m.sender === 'ai';
      return `
        <div class="flex items-start gap-2.5 ${isAI ? '' : 'flex-row-reverse'} mb-3">
          <div class="w-7 h-7 rounded-full shrink-0 flex items-center justify-center font-bold text-[11px] ${
            isAI ? 'bg-gradient-to-tr from-emerald-500 to-blue-600 text-white shadow-sm' : 'bg-slate-200 text-slate-700'
          }">
            ${isAI ? 'AI' : 'You'}
          </div>
          <div class="max-w-[82%]">
            <div class="p-3 rounded-2xl text-xs leading-relaxed ${
              isAI ? 'bg-slate-100 text-slate-800 rounded-tl-sm' : 'bg-blue-600 text-white rounded-tr-sm'
            }">
              ${formatMarkdownText(m.text)}
            </div>
            ${m.actions ? `
              <div class="flex flex-wrap gap-1.5 mt-2">
                ${m.actions.map(act => `
                  <button onclick="handleAIQuickAction('${act}')" class="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-2.5 py-1 rounded-full border border-blue-200 transition-colors">
                    ${act}
                  </button>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    scrollAIToBottom();
  }

  function scrollAIToBottom() {
    if (el.aiMessagesList) {
      setTimeout(() => {
        el.aiMessagesList.scrollTop = el.aiMessagesList.scrollHeight + 100;
      }, 50);
    }
  }

  function formatMarkdownText(txt) {
    return txt
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  }

  function sendAIMessage() {
    const text = el.aiInput.value.trim();
    if (!text) return;

    state.ai.messages.push({ sender: 'user', time: 'Just now', text: text });
    el.aiInput.value = '';
    renderAIMessages();

    setTimeout(() => {
      respondToAIUserQuery(text);
    }, 500);
  }

  function handleAIQuickAction(actionText) {
    state.ai.messages.push({ sender: 'user', time: 'Just now', text: actionText });
    renderAIMessages();
    setTimeout(() => {
      respondToAIUserQuery(actionText);
    }, 450);
  }
  window.handleAIQuickAction = handleAIQuickAction;

  function respondToAIUserQuery(rawQuery) {
    const q = rawQuery.toLowerCase();
    let reply = "";
    let actions = ['Where is Kafe TNB?', 'Meals under RM 5', 'Check balance'];

    if (q.includes('voucher') || q.includes('coupon') || q.includes('discount')) {
      reply = window.UUM_DATA.aiResponses.splitHelp || "You can use vouchers during checkout in the **Pay** tab! Under 'Apply Voucher', pick an eligible coupon (like RM 5.00 Meal Subsidy) and it will deduct automatically from your total.";
      actions = ['Open Rewards Store', 'Pay with Voucher'];
    } else if (q.includes('owe') || q.includes('debt') || q.includes('who owes')) {
      const debtData = calculateCumulativeDebts();
      reply = `**Friend Debt Ledger Summary:**\nFriends currently owe you **RM ${debtData.grandTotalOwed.toFixed(2)}** across **${debtData.unpaidStudentsCount} students**.\n\n• You can use **1-Click WhatsApp Remind** in the Split Hub to nudge them with their cumulative bills!`;
      actions = ['Open Split Hub', 'Send WhatsApp Reminders'];
    } else if (q.includes('cheap') || q.includes('under rm') || q.includes('budget') || q.includes('meal')) {
      reply = window.UUM_DATA.aiResponses.cheapestFood;
      actions = ['Order Nasi Lemak (RM4.50)', 'View Inasis TNB menu'];
    } else if (q.includes('tnb')) {
      reply = "**Kafe Inasis TNB** is situated at Kolej Inasis Tunku Najihah along **Laluan A**. Famous for fresh Nasi Lemak (RM 4.50) and Roti Canai (RM 1.50).";
      actions = ['Pay Kafe TNB', 'Show on Campus Map'];
    } else if (q.includes('tm')) {
      reply = "**Kafe Inasis TM** is at Kolej Tun Mahathir along **Laluan B**. Popular for economy rice dishes and Teh Tarik (RM 1.80).";
      actions = ['Pay Kafe TM', 'Show on Campus Map'];
    } else if (q.includes('split') || q.includes('assign') || q.includes('bill')) {
      reply = window.UUM_DATA.aiResponses.splitHelp;
      actions = ['Open Split Hub', 'Upload a Receipt'];
    } else if (q.includes('balance') || q.includes('wallet') || q.includes('spent') || q.includes('how much')) {
      reply = `Alex, your current **simulated wallet balance** is **RM ${state.user.walletBalance.toFixed(2)}**. You have spent **RM ${state.user.monthSpent.toFixed(2)}** this month across campus canteens.`;
      actions = ['Top Up Balance', 'View Spending Charts'];
    } else if (q.includes('safe') || q.includes('fake') || q.includes('scam') || q.includes('qr')) {
      reply = window.UUM_DATA.aiResponses.scamHelp;
      actions = ['Open Scam Simulator', 'Take Scam Quiz'];
    } else {
      reply = `I can help with campus dining, cashless payments, and vouchers! Try asking:\n• "How do I apply a voucher?"\n• "Who owes me money?"\n• "What are the best meals under RM 5?"\n• "Where is Kafe YAB located?"`;
    }

    state.ai.messages.push({ sender: 'ai', time: 'Just now', text: reply, actions: actions });
    renderAIMessages();
  }

  // ==========================================
  // TOP UP & TOAST UTILITIES
  // ==========================================
  function openTopUpModal() {
    const amount = prompt("Enter simulated top-up amount (RM):", "50.00");
    const num = parseFloat(amount);
    if (!isNaN(num) && num > 0) {
      state.user.walletBalance += num;
      renderUserStats();
      showToast(`Wallet topped up by RM ${num.toFixed(2)}!`);
      if (window.confetti) window.confetti({ particleCount: 40, spread: 50 });
    }
  }
  window.openTopUpModal = openTopUpModal;

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xl backdrop-blur-md z-50 transition-all duration-300';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }
  window.showToast = showToast;


  // ==========================================
  // SENIOR MODE & DARK MODE ACCESSIBILITY
  // ==========================================
  function toggleSeniorMode(forceState) {
    const isSenior = forceState !== undefined ? forceState : !document.body.classList.contains('senior-mode');
    if (isSenior) {
      document.body.classList.add('senior-mode');
    } else {
      document.body.classList.remove('senior-mode');
    }
    state.preferences.seniorMode = isSenior;
    try { localStorage.setItem('uum_senior_mode', isSenior ? 'true' : 'false'); } catch (e) {}

    const btnSenior = document.getElementById('btn-senior-mode');
    const chkSenior = document.getElementById('profile-toggle-senior');
    if (btnSenior) {
      if (isSenior) {
        btnSenior.className = 'senior-mode-btn px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md bg-purple-700 text-white cursor-pointer';
      } else {
        btnSenior.className = 'senior-mode-btn px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs bg-purple-100 text-purple-800 cursor-pointer';
      }
    }
    if (chkSenior) chkSenior.checked = isSenior;
    if (forceState === undefined) {
      showToast(isSenior ? '👓 Senior Mode Active: High contrast & enlarged text.' : 'Standard text view restored.');
    }
  }
  window.toggleSeniorMode = toggleSeniorMode;

  function toggleDarkMode(forceState) {
    const isDark = forceState !== undefined ? forceState : !document.body.classList.contains('dark');
    if (isDark) {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
    }
    state.preferences.darkMode = isDark;
    try { localStorage.setItem('uum_dark_mode', isDark ? 'true' : 'false'); } catch (e) {}

    const iconElem = document.getElementById('dark-mode-icon');
    const chkDark = document.getElementById('profile-toggle-dark');
    if (iconElem) iconElem.textContent = isDark ? '☀️' : '🌙';
    if (chkDark) chkDark.checked = isDark;
    if (forceState === undefined) {
      showToast(isDark ? '🌙 Dark Mode Enabled.' : '☀️ Light Mode Enabled.');
    }
  }
  window.toggleDarkMode = toggleDarkMode;

  function initThemePreferences() {
    if (state.preferences.seniorMode) toggleSeniorMode(true);
    if (state.preferences.darkMode) toggleDarkMode(true);
  }

  // ==========================================
  // USER PROFILE DROPDOWN & ACCOUNT SWITCHER
  // ==========================================
  function toggleProfileDropdown() {
    const dd = document.getElementById('user-profile-dropdown');
    if (!dd) return;
    const isHidden = dd.classList.contains('hidden');
    if (isHidden) {
      dd.classList.remove('hidden');
      renderAccountSwitcher();
    } else {
      dd.classList.add('hidden');
    }
  }
  window.toggleProfileDropdown = toggleProfileDropdown;

  function renderAccountSwitcher() {
    const list = document.getElementById('account-switcher-list');
    if (!list) return;

    list.innerHTML = state.accounts.map(acc => {
      const isActive = acc.matricNo === state.user.matricNo;
      return `
        <div onclick="switchAccount('${acc.id}')" class="p-2.5 rounded-2xl border ${isActive ? 'bg-blue-50/90 border-blue-400 ring-1 ring-blue-400' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'} flex items-center justify-between cursor-pointer transition-all">
          <div class="flex items-center gap-2.5 min-w-0">
            <img src="${acc.avatar}" class="w-8 h-8 rounded-full object-cover ring-1 ring-slate-300">
            <div class="truncate">
              <div class="text-xs font-bold text-slate-900 truncate">${acc.name}</div>
              <div class="text-[10px] text-slate-500 font-medium">${acc.role} • ${acc.badge}</div>
            </div>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-blue-600 text-white shadow-2xs' : 'bg-white text-slate-600 border border-slate-200'}">
            ${isActive ? 'Active ✓' : 'Switch'}
          </span>
        </div>
      `;
    }).join('');
  }

  function switchAccount(accountId) {
    const target = state.accounts.find(a => a.id === accountId);
    if (!target) return;

    state.user = Object.assign({}, target);
    showToast(`Switched account: ${target.name} (${target.role})`);

    const dd = document.getElementById('user-profile-dropdown');
    if (dd) dd.classList.add('hidden');

    if (target.role === 'Merchant') {
      switchTab('analytics');
      switchAnalyticsRole('merchant');
    }

    renderAll();
  }
  window.switchAccount = switchAccount;

  function performLogout() {
    const dd = document.getElementById('user-profile-dropdown');
    if (dd) dd.classList.add('hidden');

    const modal = document.getElementById('logout-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }
  window.performLogout = performLogout;

  function performLoginSSO(accountId) {
    const modal = document.getElementById('logout-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    if (accountId) {
      switchAccount(accountId);
    } else {
      switchAccount('acc-alex');
    }
    showToast('Authenticated via UUM Single Sign-On (SSO). Welcome back!');
  }
  window.performLoginSSO = performLoginSSO;

  // ==========================================
  // RECEIPT SCAN: LIVE UPLOAD & LASER SCANNER
  // Matches Images 3 & 4
  // ==========================================
  function handleReceiptFileUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const imgUrl = e.target.result;
      startReceiptScan(true, file.name, imgUrl);
    };
    reader.readAsDataURL(file);
  }
  window.handleReceiptFileUpload = handleReceiptFileUpload;

  function startReceiptScan(isUpload, customFileName, customImgUrl) {
    const initialCard = document.getElementById('receipt-scan-initial-card');
    const scanningCard = document.getElementById('receipt-scanning-card');
    const resultSection = document.getElementById('receipt-result-section');
    const progressBar = document.getElementById('receipt-scan-progress');
    const stepText = document.getElementById('receipt-scan-step-text');

    if (initialCard) initialCard.classList.add('hidden');
    if (resultSection) resultSection.classList.add('hidden');
    if (scanningCard) scanningCard.classList.remove('hidden');

    let pct = 15;
    if (progressBar) progressBar.style.width = '15%';
    if (stepText) stepText.textContent = isUpload ? `Analyzing image "${customFileName || 'upload.jpg'}"...` : 'Reading physical receipt pixels...';

    const interval = setInterval(() => {
      pct += 25;
      if (progressBar) progressBar.style.width = `${Math.min(100, pct)}%`;

      if (pct === 40 && stepText) {
        stepText.textContent = 'Detecting bounding boxes & line items...';
      } else if (pct === 65 && stepText) {
        stepText.textContent = 'Extracting dish prices & merchant ID...';
      } else if (pct === 90 && stepText) {
        stepText.textContent = 'Matching items to Sintok Canteen POS...';
      }

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          if (scanningCard) scanningCard.classList.add('hidden');
          if (resultSection) resultSection.classList.remove('hidden');

          if (isUpload && customImgUrl) {
            state.receiptScan.uploadedImageUrl = customImgUrl;
            state.receiptScan.uploadedFileName = customFileName;
            const thumb = document.getElementById('ocr-uploaded-thumbnail');
            if (thumb) {
              thumb.src = customImgUrl;
              thumb.classList.remove('hidden');
            }
          }

          renderSplitCalculations();
          showToast(isUpload ? '✓ Receipt parsed! 4 dish items extracted.' : '✓ Sample receipt loaded: Kafe Inasis TM (RM 13.30)');
          try { confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } }); } catch (e) {}
        }, 350);
      }
    }, 280);
  }
  window.startReceiptScan = startReceiptScan;

  function rescanReceipt() {
    const initialCard = document.getElementById('receipt-scan-initial-card');
    const scanningCard = document.getElementById('receipt-scanning-card');
    const resultSection = document.getElementById('receipt-result-section');

    if (scanningCard) scanningCard.classList.add('hidden');
    if (resultSection) resultSection.classList.add('hidden');
    if (initialCard) initialCard.classList.remove('hidden');
  }
  window.rescanReceipt = rescanReceipt;

  // ==========================================
  // MINI-GAMES & CHALLENGES (Matches Image 2)
  // ==========================================
  function renderChallenges() {
    const container = document.getElementById('challenges-grid-container');
    if (!container) return;

    container.innerHTML = state.challenges.map(ch => {
      const isDone = ch.status === 'done';
      return `
        <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-emerald-300">
          <div class="flex items-start gap-3.5">
            <div class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              isDone ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
            }">
              <span class="text-lg font-bold">${isDone ? '✓' : '⭐'}</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-extrabold text-sm text-slate-900">${ch.title}</h4>
                <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  isDone ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
                }">
                  ★ ${ch.rewardText}
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">${ch.desc}</p>
              <div class="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-mono">
                <span>${ch.progress || (isDone ? 'Completed this week' : 'Available')}</span>
              </div>
            </div>
          </div>

          <div class="shrink-0 self-end sm:self-auto">
            ${isDone ? `
              <span class="px-4 py-2 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl inline-flex items-center gap-1">
                <span>✓</span> Done
              </span>
            ` : `
              <button type="button" onclick="handleChallengeAction('${ch.id}')" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer">
                <span>${ch.btnText}</span>
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');
  }

  function handleChallengeAction(challengeId) {
    if (challengeId === 'ch-checkin') {
      performDailyCheckIn();
    } else if (challengeId === 'ch-billsplitter') {
      switchTab('split');
    } else if (challengeId === 'ch-invite') {
      openInviteModal();
    } else if (challengeId === 'ch-scamdetective') {
      switchTab('fraud');
      setTimeout(() => {
        const q = document.getElementById('scam-quiz-viewport');
        if (q) q.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  }
  window.handleChallengeAction = handleChallengeAction;

  function performDailyCheckIn() {
    const ch = state.challenges.find(c => c.id === 'ch-checkin');
    if (!ch || ch.status === 'done') {
      showToast('You have already claimed today\'s daily check-in!');
      return;
    }

    ch.status = 'done';
    ch.btnText = 'Done ✓';
    ch.progress = 'Day 4 of 7 completed';
    state.user.points += ch.reward;
    state.user.streakDays += 1;
    renderUserStats();
    renderChallenges();

    showToast(`🎉 Day ${state.user.streakDays} Check-in Complete! +50 Points added to your wallet.`);
    try { confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } }); } catch (e) {}
  }
  window.performDailyCheckIn = performDailyCheckIn;

  function openInviteModal() {
    const modal = document.getElementById('invite-friends-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }
  window.openInviteModal = openInviteModal;

  function closeInviteModal() {
    const modal = document.getElementById('invite-friends-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }
  window.closeInviteModal = closeInviteModal;

  function copyReferralCode() {
    const code = window.UUM_DATA.referral.code;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(() => {
        showToast(`Copied referral code: ${code}`);
      }).catch(() => {
        showToast(`Referral code: ${code}`);
      });
    } else {
      showToast(`Referral code: ${code}`);
    }
  }
  window.copyReferralCode = copyReferralCode;

  function shareReferralWhatsApp() {
    const msg = encodeURIComponent(`Hey! Join me on UUM PayNow for fast cashless campus meals and bill splitting. Use my referral code ${window.UUM_DATA.referral.code} to get +80 points on your first meal: https://paynow.uum.edu.my/join?ref=${window.UUM_DATA.referral.code}`);
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
  }
  window.shareReferralWhatsApp = shareReferralWhatsApp;

  function switchRewardsSubTab(tabName) {
    const mapSec = document.getElementById('campus-map-section');
    const storeSec = document.getElementById('rewards-store-section');
    const gamesSec = document.getElementById('games-challenges-section');
    const ranksSec = document.getElementById('ranks-leaderboard-section');

    const pills = document.querySelectorAll('.rewards-subnav-pill');
    pills.forEach(p => {
      if (p.getAttribute('data-subnav') === tabName) {
        p.className = 'rewards-subnav-pill px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-xs transition-all';
      } else {
        p.className = 'rewards-subnav-pill px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-600 border border-slate-200 hover:border-slate-300 transition-all';
      }
    });

    if (tabName === 'map' && mapSec) mapSec.scrollIntoView({ behavior: 'smooth' });
    if (tabName === 'rewards' && storeSec) storeSec.scrollIntoView({ behavior: 'smooth' });
    if (tabName === 'games' && gamesSec) gamesSec.scrollIntoView({ behavior: 'smooth' });
    if (tabName === 'ranks' && ranksSec) ranksSec.scrollIntoView({ behavior: 'smooth' });
  }
  window.switchRewardsSubTab = switchRewardsSubTab;

  // ==========================================
  // AI ASSISTANT: VOICE INPUT & AUDIO SPEECH
  // ==========================================
  function toggleAIVoiceInput() {
    if (state.aiVoice.isRecording) {
      stopAIVoiceInput();
    } else {
      startAIVoiceInput();
    }
  }
  window.toggleAIVoiceInput = toggleAIVoiceInput;

  function startAIVoiceInput() {
    const banner = document.getElementById('ai-voice-recording-banner');
    const micBtn = document.getElementById('ai-voice-record-btn');
    const micIcon = document.getElementById('ai-mic-icon');

    state.aiVoice.isRecording = true;
    if (banner) banner.classList.remove('hidden');
    if (micBtn) micBtn.className = "p-2.5 bg-red-100 text-red-700 border border-red-300 rounded-xl transition-all animate-pulse";
    if (micIcon) micIcon.textContent = '⏹️';

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = function(event) {
          const transcript = event.results[0][0].transcript;
          const input = document.getElementById('ai-chat-input');
          if (input) input.value = transcript;
          stopAIVoiceInput();
          sendAIMessage(transcript);
        };

        recognition.onerror = function() {
          simulateVoiceInput();
        };

        recognition.onend = function() {
          if (state.aiVoice.isRecording) stopAIVoiceInput();
        };

        state.aiVoice.recognition = recognition;
        recognition.start();
        return;
      } catch (err) {
        // Fallback to simulation
      }
    }

    simulateVoiceInput();
  }

  function simulateVoiceInput() {
    const sampleSpokenQueries = [
      "Who owes me money for canteen meals?",
      "What are the cheapest meals under RM 5?",
      "How do I use my RM 5 meal voucher?",
      "Where is Kafe Inasis TNB located?",
      "How do I recognize a fake QR code?"
    ];
    const chosen = sampleSpokenQueries[Math.floor(Math.random() * sampleSpokenQueries.length)];

    setTimeout(() => {
      const input = document.getElementById('ai-chat-input');
      if (input) input.value = chosen;
      stopAIVoiceInput();
      sendAIMessage(chosen);
      showToast(`🎙️ Voice captured: "${chosen}"`);
    }, 2200);
  }

  function stopAIVoiceInput() {
    state.aiVoice.isRecording = false;
    const banner = document.getElementById('ai-voice-recording-banner');
    const micBtn = document.getElementById('ai-voice-record-btn');
    const micIcon = document.getElementById('ai-mic-icon');

    if (banner) banner.classList.add('hidden');
    if (micBtn) micBtn.className = "p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl transition-all cursor-pointer";
    if (micIcon) micIcon.textContent = '🎙️';

    if (state.aiVoice.recognition) {
      try { state.aiVoice.recognition.stop(); } catch(e) {}
      state.aiVoice.recognition = null;
    }
  }
  window.stopAIVoiceInput = stopAIVoiceInput;

  function speakAIText(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*#_]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      showToast('🔊 Speaking assistant response...');
    } else {
      showToast('Text-to-Speech not supported on this browser.');
    }
  }
  window.speakAIText = speakAIText;


  // ==========================================
  // INTERACTIVE 3-STEP DUITNOW GUIDE
  // Handbook Direction D: Make it Approachable
  // ==========================================
  let currentTutorialStep = 1;

  function openDuitNowTutorialModal(startStep) {
    currentTutorialStep = startStep || 1;
    const modal = document.getElementById('duitnow-tutorial-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      renderTutorialStep(currentTutorialStep);
    }
  }
  window.openDuitNowTutorialModal = openDuitNowTutorialModal;

  function closeDuitNowTutorialModal() {
    const modal = document.getElementById('duitnow-tutorial-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }
  window.closeDuitNowTutorialModal = closeDuitNowTutorialModal;

  function setTutorialStep(stepNum) {
    currentTutorialStep = Math.max(1, Math.min(3, stepNum));
    renderTutorialStep(currentTutorialStep);
  }
  window.setTutorialStep = setTutorialStep;

  function nextTutorialStep() {
    if (currentTutorialStep < 3) {
      setTutorialStep(currentTutorialStep + 1);
    } else {
      launchSimulationFromTutorial();
    }
  }
  window.nextTutorialStep = nextTutorialStep;

  function prevTutorialStep() {
    if (currentTutorialStep > 1) {
      setTutorialStep(currentTutorialStep - 1);
    }
  }
  window.prevTutorialStep = prevTutorialStep;

  function launchSimulationFromTutorial() {
    closeDuitNowTutorialModal();
    switchTab('pay');
    showToast('🚀 Welcome to the Pay simulation! Test selecting a canteen and paying.');
  }
  window.launchSimulationFromTutorial = launchSimulationFromTutorial;

  function renderTutorialStep(stepNum) {
    const tutorialSteps = window.UUM_DATA.duitnowTutorial;
    const stepData = tutorialSteps.find(s => s.step === stepNum) || tutorialSteps[0];

    // Update pill tabs
    for (let i = 1; i <= 3; i++) {
      const pill = document.getElementById(`tut-step-pill-${i}`);
      if (pill) {
        if (i === stepNum) {
          pill.className = "tut-step-tab px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-xs cursor-pointer";
        } else if (i < stepNum) {
          pill.className = "tut-step-tab px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 cursor-pointer";
        } else {
          pill.className = "tut-step-tab px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer";
        }
      }
    }

    // Update content elements
    const tagElem = document.getElementById('tut-step-tag');
    const titleElem = document.getElementById('tut-step-title');
    const subtitleElem = document.getElementById('tut-step-subtitle');
    const bulletsElem = document.getElementById('tut-step-bullets');
    const tipElem = document.getElementById('tut-step-tip');
    const actionBtn = document.getElementById('tut-step-action-btn');
    const graphicContainer = document.getElementById('tut-step-graphic');

    if (tagElem) tagElem.textContent = stepData.tag;
    if (titleElem) titleElem.textContent = stepData.title;
    if (subtitleElem) subtitleElem.textContent = stepData.subtitle;
    if (tipElem) tipElem.textContent = stepData.tip;

    if (bulletsElem) {
      bulletsElem.innerHTML = stepData.bulletPoints.map(pt => `
        <li class="flex items-start gap-2.5 text-xs text-slate-600">
          <span class="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
          <span>${pt}</span>
        </li>
      `).join('');
    }

    if (actionBtn) {
      if (stepNum === 3) {
        actionBtn.innerHTML = `<span>🚀 Try Live Payment Simulation!</span>`;
      } else {
        actionBtn.innerHTML = `<span>${stepData.simulatedAction} ➔</span>`;
      }
    }

    // Render interactive visual mockup per step
    if (graphicContainer) {
      if (stepNum === 1) {
        graphicContainer.innerHTML = `
          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stall Counter Display Check</span>
            <div class="w-32 h-32 mx-auto bg-white p-2.5 rounded-2xl border-2 border-emerald-500 shadow-sm relative flex items-center justify-center">
              <img src="images/duitnow_sample_qr.svg" class="w-full h-full object-contain">
              <span class="absolute -top-2 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                Official Stand ✓
              </span>
            </div>
            <div class="text-xs font-bold text-slate-800">Kafe Inasis TNB • Laluan A</div>
            <span class="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Verified Merchant ID: UUM-D-TNB01
            </span>
          </div>
        `;
      } else if (stepNum === 2) {
        graphicContainer.innerHTML = `
          <div class="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-2.5">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500">Meal Subtotal (Nasi Lemak + Tea)</span>
              <span class="font-bold text-slate-800">RM 6.30</span>
            </div>
            <div class="p-2 rounded-xl bg-white border border-emerald-300 flex items-center justify-between text-xs">
              <span class="text-emerald-700 font-bold">🎟️ RM 5.00 Campus Subsidy</span>
              <span class="font-bold text-emerald-600">- RM 5.00</span>
            </div>
            <div class="pt-2 border-t border-blue-200 flex items-center justify-between">
              <div>
                <span class="text-[10px] text-slate-400 font-bold uppercase">Final Cashless Charge</span>
                <div class="text-xl font-black text-slate-900">RM 1.30</div>
              </div>
              <span class="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                Saved RM 5.00 vs Cash!
              </span>
            </div>
          </div>
        `;
      } else if (stepNum === 3) {
        graphicContainer.innerHTML = `
          <div class="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-center space-y-2.5">
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <span>🛡️</span> Pre-Payment Safety Check Passed
            </div>
            <div class="text-3xl font-black text-emerald-700">99.8% Trust Score</div>
            <p class="text-xs text-slate-600">Zero fraud reports • Verified UUM Canteen Operator</p>
            <div class="p-2.5 bg-white rounded-xl border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center justify-center gap-2">
              <span>🎁</span>
              <span>+1 Stamp Earned (7/10) • +10 Loyalty Points Added</span>
            </div>
          </div>
        `;
      }
    }
  }


  // ==========================================
  // WALLET TOP-UP LOGIC (FPX Bank Transfer & TNG)
  // Requirement 1
  // ==========================================
  function openTopUpModal(presetAmount) {
    const modal = document.getElementById('wallet-topup-modal');
    if (!modal) return;

    if (presetAmount) {
      state.topup.selectedAmount = presetAmount;
    }
    const amtInput = document.getElementById('topup-custom-amount');
    if (amtInput) amtInput.value = state.topup.selectedAmount;

    updateTopUpSummary();
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
  window.openTopUpModal = openTopUpModal;

  function closeTopUpModal() {
    const modal = document.getElementById('wallet-topup-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }
  window.closeTopUpModal = closeTopUpModal;

  function selectTopUpAmount(amt) {
    state.topup.selectedAmount = amt;
    const amtInput = document.getElementById('topup-custom-amount');
    if (amtInput) amtInput.value = amt;

    document.querySelectorAll('.topup-amt-chip').forEach(btn => {
      if (parseFloat(btn.getAttribute('data-amt')) === amt) {
        btn.className = "topup-amt-chip px-3.5 py-2 rounded-xl text-xs font-black bg-blue-600 text-white shadow-xs cursor-pointer";
      } else {
        btn.className = "topup-amt-chip px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer";
      }
    });

    updateTopUpSummary();
  }
  window.selectTopUpAmount = selectTopUpAmount;

  function onTopUpCustomAmountChanged(val) {
    const amt = parseFloat(val) || 0;
    state.topup.selectedAmount = amt;
    document.querySelectorAll('.topup-amt-chip').forEach(btn => {
      if (parseFloat(btn.getAttribute('data-amt')) === amt) {
        btn.className = "topup-amt-chip px-3.5 py-2 rounded-xl text-xs font-black bg-blue-600 text-white shadow-xs cursor-pointer";
      } else {
        btn.className = "topup-amt-chip px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer";
      }
    });
    updateTopUpSummary();
  }
  window.onTopUpCustomAmountChanged = onTopUpCustomAmountChanged;

  function selectTopUpChannel(channelId) {
    state.topup.selectedChannel = channelId;
    document.querySelectorAll('.topup-channel-card').forEach(card => {
      if (card.getAttribute('data-channel') === channelId) {
        card.className = "topup-channel-card p-3 rounded-2xl border-2 border-blue-600 bg-blue-50/70 shadow-2xs flex items-center justify-between cursor-pointer transition-all";
      } else {
        card.className = "topup-channel-card p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 shadow-2xs flex items-center justify-between cursor-pointer transition-all";
      }
    });
    updateTopUpSummary();
  }
  window.selectTopUpChannel = selectTopUpChannel;

  function updateTopUpSummary() {
    const amt = parseFloat(state.topup.selectedAmount) || 0;
    const projected = state.user.walletBalance + amt;

    const currElem = document.getElementById('topup-current-bal-display');
    const amtElem = document.getElementById('topup-amount-display');
    const newBalElem = document.getElementById('topup-new-bal-display');
    const btnElem = document.getElementById('btn-execute-topup');

    if (currElem) currElem.textContent = `RM ${state.user.walletBalance.toFixed(2)}`;
    if (amtElem) amtElem.textContent = `RM ${amt.toFixed(2)}`;
    if (newBalElem) newBalElem.textContent = `RM ${projected.toFixed(2)}`;
    if (btnElem) {
      const chName = state.topup.selectedChannel === 'tng' ? 'Touch \'n Go eWallet' : 'FPX Online Banking';
      btnElem.innerHTML = `<span>Proceed to Top Up RM ${amt.toFixed(2)} (${chName}) ➔</span>`;
    }
  }

  function executeWalletTopUp() {
    const amt = parseFloat(state.topup.selectedAmount) || 0;
    if (amt < 5) {
      showToast("Minimum top-up amount is RM 5.00");
      return;
    }

    const btn = document.getElementById('btn-execute-topup');
    const chName = state.topup.selectedChannel === 'tng' ? 'Touch \'n Go eWallet' : 'Maybank2u / FPX';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span>Connecting to ${chName}...</span>`;
    }

    setTimeout(() => {
      state.user.walletBalance += amt;

      const txId = `TXN-TOPUP-${Date.now().toString().slice(-6)}`;
      state.transactions.unshift({
        id: txId,
        title: `Top Up via ${chName}`,
        category: "Top Up",
        amount: amt,
        type: "credit",
        status: "success",
        timestamp: "Just now",
        notes: `Simulated ${chName} Top-Up`,
        pointsEarned: 0
      });

      renderUserStats();
      renderTransactionsTable();
      closeTopUpModal();

      if (btn) btn.disabled = false;
      if (window.confetti) window.confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      showToast(`✓ Top-up Successful: +RM ${amt.toFixed(2)} credited via ${chName}!`);
    }, 1100);
  }
  window.executeWalletTopUp = executeWalletTopUp;

  // ==========================================
  // PAYMENT SECURITY: 6-DIGIT PIN & BIOMETRIC
  // Requirement 3
  // ==========================================
  function openPaymentAuthModal(config) {
    state.auth.pendingConfig = config;
    state.auth.currentPin = '';
    state.auth.authMode = 'pin';

    const modal = document.getElementById('payment-auth-modal');
    if (!modal) return;

    const amtElem = document.getElementById('auth-modal-amount');
    const recName = document.getElementById('auth-modal-recipient-name');
    const recDetail = document.getElementById('auth-modal-recipient-detail');
    const hintElem = document.getElementById('auth-pin-hint');
    const statusText = document.getElementById('biometric-status-text');
    const sensor = document.getElementById('biometric-sensor-icon');

    if (amtElem) amtElem.textContent = `RM ${(config.amount || 0).toFixed(2)}`;
    if (recName) recName.textContent = config.recipientName || 'Authorized Recipient';
    if (recDetail) recDetail.textContent = config.recipientDetail || 'Verified Recipient';

    if (hintElem) hintElem.innerHTML = '<span class="text-slate-400 font-normal">(Demo PIN: <strong>123456</strong>)</span>';
    if (statusText) statusText.textContent = "Tap scanner to verify fingerprint";
    if (sensor) sensor.classList.remove('biometric-sensor-active');

    updatePinDots();
    switchAuthMode('pin');

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
  window.openPaymentAuthModal = openPaymentAuthModal;

  function closePaymentAuthModal() {
    const modal = document.getElementById('payment-auth-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    state.auth.currentPin = '';
    // Note: pendingConfig is cleared in executeApprovedPayment or on explicit cancel
  }
  window.closePaymentAuthModal = closePaymentAuthModal;

  function cancelPaymentAuth() {
    state.auth.pendingConfig = null;
    closePaymentAuthModal();
    showToast("Authorization cancelled");
  }
  window.cancelPaymentAuth = cancelPaymentAuth;

  function switchAuthMode(mode) {
    state.auth.authMode = mode;
    const pinView = document.getElementById('auth-pin-view');
    const bioView = document.getElementById('auth-biometric-view');
    const tabPin = document.getElementById('btn-auth-tab-pin');
    const tabBio = document.getElementById('btn-auth-tab-bio');

    if (mode === 'pin') {
      if (pinView) pinView.classList.remove('hidden');
      if (bioView) bioView.classList.add('hidden');
      if (tabPin) tabPin.className = "flex-1 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white shadow-xs cursor-pointer";
      if (tabBio) tabBio.className = "flex-1 py-2 text-xs font-bold rounded-xl text-slate-600 hover:text-slate-900 cursor-pointer";
    } else {
      if (pinView) pinView.classList.add('hidden');
      if (bioView) bioView.classList.remove('hidden');
      if (tabPin) tabPin.className = "flex-1 py-2 text-xs font-bold rounded-xl text-slate-600 hover:text-slate-900 cursor-pointer";
      if (tabBio) tabBio.className = "flex-1 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white shadow-xs cursor-pointer";
    }
  }
  window.switchAuthMode = switchAuthMode;

  function updatePinDots() {
    const len = state.auth.currentPin.length;
    for (let i = 1; i <= 6; i++) {
      const dot = document.getElementById(`pin-dot-${i}`);
      if (dot) {
        dot.classList.remove('success');
        if (i <= len) {
          dot.classList.add('filled');
        } else {
          dot.classList.remove('filled');
        }
      }
    }
    const dotsBox = document.getElementById('pin-dots-container');
    if (dotsBox && len === 0) {
      dotsBox.classList.remove('text-emerald-600', 'scale-105');
    }
  }

  function enterPinDigit(digit) {
    if (state.auth.currentPin.length >= 6) return;
    state.auth.currentPin += digit.toString();
    updatePinDots();

    if (state.auth.currentPin.length === 6) {
      verifyPinAndExecute();
    }
  }
  window.enterPinDigit = enterPinDigit;

  function backspacePin() {
    if (state.auth.currentPin.length > 0) {
      state.auth.currentPin = state.auth.currentPin.slice(0, -1);
      updatePinDots();
    }
  }
  window.backspacePin = backspacePin;

  function clearPin() {
    state.auth.currentPin = '';
    updatePinDots();
  }
  window.clearPin = clearPin;

  function verifyPinAndExecute() {
    const entered = state.auth.currentPin;
    const correctPin = (window.UUM_DATA.security && window.UUM_DATA.security.defaultPin) || '123456';

    if (entered === correctPin) {
      // Glow all dots emerald green on successful PIN verification
      for (let i = 1; i <= 6; i++) {
        const dot = document.getElementById(`pin-dot-${i}`);
        if (dot) dot.classList.add('success');
      }

      const hintElem = document.getElementById('auth-pin-hint');
      if (hintElem) {
        hintElem.innerHTML = '<span class="text-emerald-600 font-bold flex items-center justify-center gap-1">✓ PIN Verified! Authorizing Transfer...</span>';
      }

      // Smooth transition to execute payment and reveal success screen
      setTimeout(() => {
        executeApprovedPayment();
      }, 350);
    } else {
      // Error feedback
      const dotsBox = document.getElementById('pin-dots-container');
      if (dotsBox) {
        dotsBox.classList.add('shake-anim');
        setTimeout(() => dotsBox.classList.remove('shake-anim'), 400);
      }
      showToast("❌ Incorrect PIN. Enter demo PIN: 123456");
      clearPin();
    }
  }

  function authenticateBiometric() {
    const sensor = document.getElementById('biometric-sensor-icon');
    const statusText = document.getElementById('biometric-status-text');

    if (sensor) sensor.classList.add('biometric-sensor-active');
    if (statusText) statusText.textContent = "Scanning fingerprint biometric...";

    setTimeout(() => {
      if (statusText) {
        statusText.innerHTML = '<span class="text-emerald-600 font-bold flex items-center justify-center gap-1">✓ Biometric Verified: Alex Tan (298412)</span>';
      }
      setTimeout(() => {
        if (sensor) sensor.classList.remove('biometric-sensor-active');
        executeApprovedPayment();
      }, 350);
    }, 600);
  }
  window.authenticateBiometric = authenticateBiometric;

  function executeApprovedPayment() {
    const config = state.auth.pendingConfig;
    closePaymentAuthModal();
    state.auth.pendingConfig = null;

    if (config && typeof config.onApproved === 'function') {
      config.onApproved();
    }
  }

  function requestPaymentAuthFromSecurityModal() {
    closeSecurityModal();
    const rawAmt = parseFloat(state.payment.customAmount) || 0;
    let discount = 0;
    if (state.payment.selectedVoucherId) {
      const v = state.activeVouchers.find(item => item.id === state.payment.selectedVoucherId);
      if (v) discount = v.discountType === 'fixed' ? Math.min(v.discountValue, rawAmt) : (rawAmt * v.discountValue) / 100;
    }
    const finalAmt = Math.max(0, rawAmt - discount);
    const canteen = state.canteens.find(c => c.id === state.payment.canteenId) || state.canteens[0];

    openPaymentAuthModal({
      type: 'merchant',
      amount: finalAmt,
      recipientName: canteen.name,
      recipientDetail: `${canteen.merchantCode} • Verified Campus Canteen`,
      onApproved: () => {
        confirmExecutePayment();
      }
    });
  }
  window.requestPaymentAuthFromSecurityModal = requestPaymentAuthFromSecurityModal;

  // ==========================================
  // P2P DUITNOW TRANSFERS TO STUDENTS / ACCOUNTS
  // Requirement 4
  // ==========================================
  function switchPayMode(mode) {
    state.p2p.payMode = mode;
    const merchantView = document.getElementById('pay-merchant-view');
    const p2pView = document.getElementById('pay-p2p-view');
    const btnMerchant = document.getElementById('pay-mode-btn-merchant');
    const btnP2P = document.getElementById('pay-mode-btn-p2p');

    if (mode === 'merchant') {
      if (merchantView) merchantView.classList.remove('hidden');
      if (p2pView) p2pView.classList.add('hidden');
      if (btnMerchant) btnMerchant.className = "flex-1 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-xs cursor-pointer";
      if (btnP2P) btnP2P.className = "flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer";
    } else {
      if (merchantView) merchantView.classList.add('hidden');
      if (p2pView) p2pView.classList.remove('hidden');
      if (btnMerchant) btnMerchant.className = "flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer";
      if (btnP2P) btnP2P.className = "flex-1 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-xs cursor-pointer";
      initP2PRecipient();
    }
  }
  window.switchPayMode = switchPayMode;

  function initP2PRecipient() {
    selectP2PFriend('f-1');
  }

  function selectP2PFriend(friendId) {
    state.p2p.selectedFriendId = friendId;
    const friend = state.savedFriends.find(f => f.id === friendId) || state.savedFriends[0];

    state.p2p.resolvedRecipient = {
      name: friend.name,
      identifier: friend.studentId,
      detail: `${friend.faculty} • ${friend.bankName || 'Maybank'} ${friend.accountNo || '1142 8932 7701'}`,
      bankName: friend.bankName || 'Maybank',
      accountNo: friend.accountNo || '1142 8932 7701',
      avatarInitial: friend.avatarInitial || 'SL'
    };

    document.querySelectorAll('.p2p-friend-chip').forEach(chip => {
      if (chip.getAttribute('data-friend-id') === friendId) {
        chip.className = "p2p-friend-chip px-3 py-2 rounded-2xl border-2 border-blue-600 bg-blue-50/80 text-xs font-bold flex items-center gap-2 cursor-pointer";
      } else {
        chip.className = "p2p-friend-chip px-3 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold flex items-center gap-2 cursor-pointer";
      }
    });

    renderP2PResolvedCard();
  }
  window.selectP2PFriend = selectP2PFriend;

  function setP2PTransferMethod(method) {
    state.p2p.transferMethod = method;
    const studentBox = document.getElementById('p2p-method-student-box');
    const bankBox = document.getElementById('p2p-method-bank-box');
    const duitnowBox = document.getElementById('p2p-method-duitnow-box');

    const tabStudent = document.getElementById('btn-p2p-tab-student');
    const tabBank = document.getElementById('btn-p2p-tab-bank');
    const tabDuitNow = document.getElementById('btn-p2p-tab-duitnow');

    if (method === 'student') {
      if (studentBox) studentBox.classList.remove('hidden');
      if (bankBox) bankBox.classList.add('hidden');
      if (duitnowBox) duitnowBox.classList.add('hidden');
      if (tabStudent) tabStudent.className = "px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-xs cursor-pointer";
      if (tabBank) tabBank.className = "px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer";
      if (tabDuitNow) tabDuitNow.className = "px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer";
    } else if (method === 'bank') {
      if (studentBox) studentBox.classList.add('hidden');
      if (bankBox) bankBox.classList.remove('hidden');
      if (duitnowBox) duitnowBox.classList.add('hidden');
      if (tabStudent) tabStudent.className = "px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer";
      if (tabBank) tabBank.className = "px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-xs cursor-pointer";
      if (tabDuitNow) tabDuitNow.className = "px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer";
    } else {
      if (studentBox) studentBox.classList.add('hidden');
      if (bankBox) bankBox.classList.add('hidden');
      if (duitnowBox) duitnowBox.classList.remove('hidden');
      if (tabStudent) tabStudent.className = "px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer";
      if (tabBank) tabBank.className = "px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer";
      if (tabDuitNow) tabDuitNow.className = "px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-xs cursor-pointer";
    }
  }
  window.setP2PTransferMethod = setP2PTransferMethod;

  function renderP2PResolvedCard() {
    const card = document.getElementById('p2p-resolved-card');
    if (!card || !state.p2p.resolvedRecipient) return;

    const r = state.p2p.resolvedRecipient;
    card.innerHTML = `
      <div class="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center">
            ${r.avatarInitial || 'U'}
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <h5 class="text-xs font-black text-slate-900">${r.name}</h5>
              <span class="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Verified DuitNow ✓
              </span>
            </div>
            <p class="text-[11px] text-slate-600 mt-0.5">${r.detail}</p>
          </div>
        </div>
        <span class="text-[10px] text-slate-400 font-mono">Instant P2P</span>
      </div>
    `;
  }

  function selectP2PQuickAmount(amt) {
    state.p2p.amount = amt.toString();
    const input = document.getElementById('p2p-amount-input');
    if (input) input.value = amt.toFixed(2);
  }
  window.selectP2PQuickAmount = selectP2PQuickAmount;

  function onP2PAmountInputChanged(val) {
    state.p2p.amount = val;
  }
  window.onP2PAmountInputChanged = onP2PAmountInputChanged;

  function onP2PNoteInputChanged(val) {
    state.p2p.note = val;
  }
  window.onP2PNoteInputChanged = onP2PNoteInputChanged;

  function requestP2PTransferAuth() {
    const amt = parseFloat(state.p2p.amount);
    if (isNaN(amt) || amt <= 0) {
      showToast("Please enter a valid transfer amount greater than RM 0.00");
      return;
    }
    if (amt > state.user.walletBalance) {
      showToast(`Insufficient balance! Current wallet balance is RM ${state.user.walletBalance.toFixed(2)}`);
      return;
    }

    const r = state.p2p.resolvedRecipient;
    if (!r) {
      showToast("Please select a valid recipient");
      return;
    }

    openPaymentAuthModal({
      type: 'p2p',
      amount: amt,
      recipientName: r.name,
      recipientDetail: `${r.detail} • DuitNow P2P`,
      onApproved: () => {
        confirmExecuteP2PTransfer();
      }
    });
  }
  window.requestP2PTransferAuth = requestP2PTransferAuth;

  function confirmExecuteP2PTransfer() {
    const amt = parseFloat(state.p2p.amount);
    const r = state.p2p.resolvedRecipient;

    state.user.walletBalance -= amt;
    state.user.monthSpent += amt;

    const txId = `DUITNOW-P2P-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    state.transactions.unshift({
      id: txId,
      title: `Transfer to ${r.name}`,
      category: "Transfer",
      amount: amt,
      type: "debit",
      status: "success",
      timestamp: "Just now",
      notes: state.p2p.note || "DuitNow P2P Transfer",
      pointsEarned: 5
    });

    renderUserStats();
    renderTransactionsTable();

    // Show P2P Receipt Modal
    const modal = document.getElementById('p2p-receipt-modal');
    if (modal) {
      document.getElementById('p2p-receipt-amount').textContent = `RM ${amt.toFixed(2)}`;
      document.getElementById('p2p-receipt-recipient').textContent = r.name;
      document.getElementById('p2p-receipt-account').textContent = r.detail;
      document.getElementById('p2p-receipt-reference').textContent = state.p2p.note || 'DuitNow P2P Transfer';
      document.getElementById('p2p-receipt-id').textContent = txId;
      document.getElementById('p2p-receipt-date').textContent = new Date().toLocaleString();

      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    if (window.confetti) window.confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    showToast(`✓ Transferred RM ${amt.toFixed(2)} to ${r.name} successfully!`);
  }
  window.confirmExecuteP2PTransfer = confirmExecuteP2PTransfer;

  function closeP2PReceiptModal() {
    const modal = document.getElementById('p2p-receipt-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }
  window.closeP2PReceiptModal = closeP2PReceiptModal;

  function shareP2PReceiptWhatsApp() {
    const amt = parseFloat(state.p2p.amount) || 0;
    const r = state.p2p.resolvedRecipient;
    const note = state.p2p.note || 'DuitNow Transfer';
    const msg = encodeURIComponent(`Hi ${r.name}! I have transferred RM ${amt.toFixed(2)} to you via UUM PayNow DuitNow (${note}). Ref: ${document.getElementById('p2p-receipt-id').textContent}`);
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
  }
  window.shareP2PReceiptWhatsApp = shareP2PReceiptWhatsApp;


  function onP2PCustomStudentInput(val) {
    state.p2p.customStudentId = val;
    const match = state.savedFriends.find(f => f.studentId === val.trim());
    if (match) {
      selectP2PFriend(match.id);
    } else if (val.trim().length >= 4) {
      state.p2p.resolvedRecipient = {
        name: `UUM Student (${val.trim()})`,
        identifier: val.trim(),
        detail: `UUM Sintok Student • DuitNow ID ${val.trim()}`,
        bankName: 'Maybank',
        accountNo: '1142 8932 7701',
        avatarInitial: 'ST'
      };
      renderP2PResolvedCard();
    }
  }
  window.onP2PCustomStudentInput = onP2PCustomStudentInput;

  function onP2PBankAccInput(val) {
    state.p2p.bankAccNumber = val;
    const bankSelect = document.getElementById('p2p-bank-select');
    const bankName = bankSelect ? bankSelect.value : 'Maybank';
    if (val.trim().length >= 5) {
      state.p2p.resolvedRecipient = {
        name: `Account Holder (${bankName})`,
        identifier: val.trim(),
        detail: `${bankName} • Acc: ${val.trim()}`,
        bankName: bankName,
        accountNo: val.trim(),
        avatarInitial: bankName.slice(0, 2).toUpperCase()
      };
      renderP2PResolvedCard();
    }
  }
  window.onP2PBankAccInput = onP2PBankAccInput;

  function onP2PDuitNowInput(val) {
    if (val.trim().length >= 8) {
      state.p2p.resolvedRecipient = {
        name: `DuitNow Verified Contact`,
        identifier: val.trim(),
        detail: `DuitNow ID: ${val.trim()} • National Payment Switch`,
        bankName: 'DuitNow',
        accountNo: val.trim(),
        avatarInitial: 'DN'
      };
      renderP2PResolvedCard();
    }
  }
  window.onP2PDuitNowInput = onP2PDuitNowInput;

})();
