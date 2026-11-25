/**
 * SMART LIBRARY — STUDENT ACADEMIC ECOSYSTEM ENGINE
 * High-performance vanilla JavaScript (ES2022) with zero dependencies.
 */

// ==========================================
// 1. DATA STATE & ACADEMIC CATALOG
// ==========================================
const INITIAL_BOOKS = [
  {
    id: 13,
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    category: "Computer Science",
    isbn: "978-0132350884",
    copies: 6,
    available: 4,
    shelf: "FL-1 / AISLE-3 / RACK-C1",
    desc: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. Best practices for readable, maintainable code."
  },
  {
    id: 14,
    title: "Python Programming: An Introduction to Computer Science",
    author: "John Zelle",
    category: "Computer Science",
    isbn: "978-1590282755",
    copies: 5,
    available: 2,
    shelf: "FL-1 / AISLE-4 / RACK-D2",
    desc: "An introduction to computer science and programming in Python emphasizing core computer science principles and software engineering."
  },

  {
    id: 1,
    title: "Deep Learning & Neural Architectures",
    author: "Ian Goodfellow, Yoshua Bengio, Aaron Courville",
    category: "AI & ML",
    isbn: "978-0262035613",
    copies: 5,
    available: 3,
    shelf: "FL-2 / AISLE-4 / RACK-A1",
    desc: "The definitive textbook on deep mathematical foundations of neural networks, backpropagation, and representation learning."
  },
  {
    id: 2,
    title: "Introduction to Algorithms (CLRS 4th Ed)",
    author: "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest",
    category: "Algorithms",
    isbn: "978-0262046305",
    copies: 8,
    available: 4,
    shelf: "FL-1 / AISLE-2 / RACK-B3",
    desc: "Comprehensive handbook on data structures, algorithmic paradigms, dynamic programming, and computational complexity."
  },
  {
    id: 3,
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    category: "Systems",
    isbn: "978-1449373320",
    copies: 6,
    available: 2,
    shelf: "FL-3 / AISLE-1 / RACK-C2",
    desc: "The big ideas behind reliable, scalable, and maintainable distributed data systems, consensus algorithms, and replication."
  },
  {
    id: 4,
    title: "Pattern Recognition and Machine Learning",
    author: "Christopher M. Bishop",
    category: "AI & ML",
    isbn: "978-0387310732",
    copies: 4,
    available: 1,
    shelf: "FL-2 / AISLE-4 / RACK-A3",
    desc: "Bayesian perspective on machine learning, Gaussian processes, variational inference, and graphical models."
  },
  {
    id: 5,
    title: "Computer Systems: A Programmer's Perspective",
    author: "Randal E. Bryant, David R. O'Hallaron",
    category: "Systems",
    isbn: "978-0134092669",
    copies: 7,
    available: 5,
    shelf: "FL-3 / AISLE-2 / RACK-B1",
    desc: "Deep dive into hardware architecture, processor pipelines, virtual memory, linking, and system-level I/O."
  },
  {
    id: 6,
    title: "Linear Algebra Done Right",
    author: "Sheldon Axler",
    category: "Mathematics",
    isbn: "978-3319110790",
    copies: 5,
    available: 3,
    shelf: "FL-1 / AISLE-5 / RACK-D4",
    desc: "Determinant-free approach to finite-dimensional vector spaces, linear operators, and spectral theory."
  },
  {
    id: 7,
    title: "Quantum Computation and Quantum Information",
    author: "Michael A. Nielsen, Isaac L. Chuang",
    category: "Physics",
    isbn: "978-1107002173",
    copies: 3,
    available: 2,
    shelf: "FL-4 / AISLE-1 / RACK-A2",
    desc: "The standard academic reference for qubits, quantum circuits, Shor's algorithm, and quantum teleportation."
  },
  {
    id: 8,
    title: "Cryptography and Network Security",
    author: "William Stallings",
    category: "Security",
    isbn: "978-0134444284",
    copies: 6,
    available: 0,
    shelf: "FL-3 / AISLE-3 / RACK-E1",
    desc: "Modern cryptographic algorithms, public-key infrastructure, AES, RSA, zero-knowledge proofs, and secure protocols."
  },
  {
    id: 9,
    title: "Reinforcement Learning: An Introduction",
    author: "Richard S. Sutton, Andrew G. Barto",
    category: "AI & ML",
    isbn: "978-0262039246",
    copies: 4,
    available: 2,
    shelf: "FL-2 / AISLE-4 / RACK-A2",
    desc: "Foundations of Markov Decision Processes, dynamic programming, temporal-difference learning, and policy gradients."
  },
  {
    id: 10,
    title: "Probability and Statistics for Engineering",
    author: "Jay L. Devore",
    category: "Mathematics",
    isbn: "978-1305251809",
    copies: 8,
    available: 6,
    shelf: "FL-1 / AISLE-5 / RACK-D1",
    desc: "Rigorous statistical analysis, hypothesis testing, random variables, regression, and Bayesian methods."
  },
  {
    id: 11,
    title: "Site Reliability Engineering",
    author: "Betsy Beyer, Chris Jones, Jennifer Petoff",
    category: "Systems",
    isbn: "978-1491929124",
    copies: 5,
    available: 4,
    shelf: "FL-3 / AISLE-1 / RACK-C5",
    desc: "How production cloud software is built, monitored, and scaled with SLOs, automated incident response, and resilience."
  },
  {
    id: 12,
    title: "Artificial Intelligence: A Modern Approach (4th Ed)",
    author: "Stuart Russell, Peter Norvig",
    category: "AI & ML",
    isbn: "978-0134610993",
    copies: 9,
    available: 5,
    shelf: "FL-2 / AISLE-3 / RACK-B2",
    desc: "The universal reference text for rational agents, heuristic search, probabilistic reasoning, and ethical AI."
  }
];

// Student state
const DEFAULT_STUDENT = {
  name: "Y Mani Sasank Reddy",
  rollNo: "STU-2026-AI042",
  department: "Computer Science & AI",
  email: "manisasank@university.edu",
  quota: 3,
  loans: [
    {
      id: "LOAN-101",
      bookId: 1,
      title: "Deep Learning & Neural Architectures",
      issueDate: "2026-10-28",
      dueDate: "2026-11-11", // active loan
      status: "active"
    },
    {
      id: "LOAN-102",
      bookId: 3,
      title: "Designing Data-Intensive Applications",
      issueDate: "2026-10-20",
      dueDate: "2026-11-03", // overdue by 4 days
      status: "overdue"
    }
  ]
};

// ==========================================
// 2. STATE MANAGER
// ==========================================
class SmartLibState {
  static getBooks() {
    const saved = localStorage.getItem('smartlib_books');
    if (!saved) {
      localStorage.setItem('smartlib_books', JSON.stringify(INITIAL_BOOKS));
      return INITIAL_BOOKS;
    }
    return JSON.parse(saved);
  }

  static saveBooks(books) {
    localStorage.setItem('smartlib_books', JSON.stringify(books));
  }

  static getStudent() {
    const saved = localStorage.getItem('smartlib_student');
    if (!saved) {
      localStorage.setItem('smartlib_student', JSON.stringify(DEFAULT_STUDENT));
      return DEFAULT_STUDENT;
    }
    return JSON.parse(saved);
  }

  static saveStudent(student) {
    localStorage.setItem('smartlib_student', JSON.stringify(student));
  }

  static getReservedSeat() {
    return localStorage.getItem('smartlib_reserved_seat') || null;
  }

  static setReservedSeat(seatCode) {
    if (!seatCode) {
      localStorage.removeItem('smartlib_reserved_seat');
    } else {
      localStorage.setItem('smartlib_reserved_seat', seatCode);
    }
  }

  static getStudyMinutes() {
    return parseInt(localStorage.getItem('smartlib_focus_minutes') || '45', 10);
  }

  static addStudyMinutes(mins) {
    const current = this.getStudyMinutes() + mins;
    localStorage.setItem('smartlib_focus_minutes', current.toString());
    return current;
  }
}

// ==========================================
// 3. UI CONTROLLER & VIEW SWITCHING
// ==========================================
let currentCategory = "All";
let searchQuery = "";

function switchPage(pageId) {
  // Update nav buttons
  document.querySelectorAll('.nav-btn, .capsule-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.target === pageId);
  });

  // Update views
  document.querySelectorAll('.page-view').forEach(view => {
    view.classList.toggle('active', view.id === `view-${pageId}`);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Render Book Catalog
function renderCatalog() {
  const grid = document.getElementById('catalog-grid');
  if (!grid) return;

  const books = SmartLibState.getBooks();
  const filtered = books.filter(b => {
    const matchesCat = currentCategory === "All" || b.category === currentCategory;
    const matchesSearch = !searchQuery || 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.isbn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.shelf.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: var(--bg-surface); border-radius: var(--radius-md);">
        <div style="font-size: 2.5rem; margin-bottom: 12px;">🔍</div>
        <h3 style="font-family: var(--font-heading); margin-bottom: 8px;">No Academic Titles Found</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem;">Try adjusting your keyword or selecting a different subject filter.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(book => {
    let availClass = 'available';
    let availText = 'In Stock';
    if (book.available === 0) {
      availClass = 'borrowed';
      availText = 'All Borrowed';
    } else if (book.available <= 2) {
      availClass = 'low';
      availText = 'Low Stock';
    }

    return `
      <article class="book-card" aria-label="${book.title}" onclick="handleBookCardClick(event, ${book.id})" title="Click to inspect in 3D">
        <div class="book-card-glare"></div>
        <div class="book-card-top">
          <span class="category-tag">${book.category}</span>
          <span class="availability-tag ${availClass}">${availText}</span>
        </div>
        <h3 class="book-title">${book.title}</h3>
        <p class="book-author">By ${book.author}</p>
        
        <div class="shelf-locator-pill" title="Physical shelf coordinate in library">
          <span>📍 Location:</span>
          <strong>${book.shelf}</strong>
        </div>

        <div class="book-card-footer">
          <div class="copies-count">
            <strong>${book.available}</strong> / ${book.copies} available
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-inspect-3d" onclick="event.stopPropagation(); Library3D.inspectBook(${book.id})" title="Inspect 3D Hardcover Model">
              <span>📖</span> 3D Inspect
            </button>
            <button class="btn-borrow" onclick="event.stopPropagation(); handleBorrowBook(${book.id})" ${book.available === 0 ? 'disabled' : ''}>
              ${book.available === 0 ? 'Waitlist' : 'Borrow Book'}
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Update total counters
  const totalCounter = document.getElementById('stat-total-books');
  const availCounter = document.getElementById('stat-available-books');
  const issuedCounter = document.getElementById('stat-issued-today');
  if (totalCounter) totalCounter.textContent = books.reduce((acc, b) => acc + b.copies, 0);
  if (availCounter) availCounter.textContent = books.reduce((acc, b) => acc + b.available, 0);
  if (issuedCounter) {
    const total = books.reduce((acc, b) => acc + b.copies, 0);
    const avail = books.reduce((acc, b) => acc + b.available, 0);
    issuedCounter.textContent = Math.max(0, total - avail);
  }

  // Initialize CSS 3D Tilt on freshly rendered cards
  init3DTiltEffects();
}

// Catalog Card Click Helper (Top-Level Global Scope)
function handleBookCardClick(event, bookId) {
  if (event && event.target && (event.target.closest('button') || event.target.closest('a'))) return;
  if (window.Library3D && typeof window.Library3D.inspectBook === 'function') {
    window.Library3D.inspectBook(bookId);
  }
}
if (typeof window !== 'undefined') {
  window.handleBookCardClick = handleBookCardClick;
}

// Category filter click handler
function setCategoryFilter(cat, btnElement) {
  currentCategory = cat;
  document.querySelectorAll('.filter-pill').forEach(pill => {
    if (btnElement) {
      pill.classList.toggle('active', pill === btnElement);
    } else {
      const text = pill.textContent.toLowerCase();
      const catLower = (cat || '').toLowerCase();
      const isMatch = catLower === 'all' ? text.includes('all') : text.includes(catLower);
      pill.classList.toggle('active', isMatch);
    }
  });
  renderCatalog();
}

// Search input handler
function handleSearch(query) {
  searchQuery = query.trim();
  renderCatalog();
}

// ==========================================
// 4. STUDENT PORTAL & CIRCULATION ACTIONS
// ==========================================
function renderStudentPortal() {
  const student = SmartLibState.getStudent();
  
  // Update ID Card text
  const nameEl = document.getElementById('id-student-name');
  const rollEl = document.getElementById('id-student-roll');
  const deptEl = document.getElementById('id-student-dept');
  if (nameEl) nameEl.textContent = student.name;
  if (rollEl) rollEl.textContent = student.rollNo;
  if (deptEl) deptEl.textContent = student.department;

  // Calculate fines (rate: ₹2.00 per overdue day)
  const today = new Date("2026-11-07"); // Academic snapshot date
  let totalFine = 0;
  let overdueCount = 0;

  student.loans.forEach(loan => {
    const due = new Date(loan.dueDate);
    if (today > due) {
      const diffDays = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
      const fine = diffDays * 2.0;
      loan.overdueDays = diffDays;
      loan.fine = fine;
      loan.isOverdue = true;
      totalFine += fine;
      overdueCount++;
    } else {
      const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      loan.remainingDays = diffDays;
      loan.isOverdue = false;
      loan.fine = 0;
    }
  });

  // Update summary metrics
  const activeLoansEl = document.getElementById('metric-active-loans');
  const quotaRemainingEl = document.getElementById('metric-quota-left');
  const totalFineEl = document.getElementById('metric-total-fine');

  if (activeLoansEl) activeLoansEl.textContent = student.loans.length;
  if (quotaRemainingEl) quotaRemainingEl.textContent = `${student.quota - student.loans.length} / ${student.quota}`;
  if (totalFineEl) totalFineEl.textContent = `₹${totalFine.toFixed(2)}`;

  // Render loans list
  const loansList = document.getElementById('student-loans-list');
  if (loansList) {
    if (student.loans.length === 0) {
      loansList.innerHTML = `
        <li style="padding: 32px 20px; text-align: center; color: var(--text-muted);">
          No active book loans. Browse the catalog to borrow reading materials.
        </li>
      `;
    } else {
      loansList.innerHTML = student.loans.map(loan => {
        let badge = '';
        if (loan.isOverdue) {
          badge = `<span class="loan-countdown overdue">⚠️ Overdue by ${loan.overdueDays}d (Fine: ₹${loan.fine.toFixed(2)})</span>`;
        } else {
          badge = `<span class="loan-countdown safe">⏳ ${loan.remainingDays} days remaining</span>`;
        }

        return `
          <li class="loan-item">
            <div class="loan-info">
              <h5>${loan.title}</h5>
              <div class="loan-meta">
                <span>Issued: ${loan.issueDate}</span>
                <span>Due: ${loan.dueDate}</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              ${badge}
              <button class="btn-return-action" onclick="handleReturnBook('${loan.id}')">Return</button>
            </div>
          </li>
        `;
      }).join('');
    }
  }

  // Update focus minutes stat
  const focusMinEl = document.getElementById('stat-focus-minutes');
  if (focusMinEl) focusMinEl.textContent = SmartLibState.getStudyMinutes();
}

// Borrow book handler
function handleBorrowBook(bookId) {
  const student = SmartLibState.getStudent();
  const books = SmartLibState.getBooks();
  const book = books.find(b => b.id === bookId);

  if (!book) return;

  // Check 1: Quota rule (max 3 books)
  if (student.loans.length >= student.quota) {
    showToast(`Quota Limit Exceeded! Max ${student.quota} concurrent books permitted.`);
    return;
  }

  // Check 2: Available copies
  if (book.available <= 0) {
    showToast(`This title is currently out of stock.`);
    return;
  }

  // Check 3: Already borrowed
  if (student.loans.some(l => l.bookId === bookId)) {
    showToast(`You already hold an active loan for this book.`);
    return;
  }

  // Execute borrow
  book.available--;
  const issueDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14); // 14-day rule

  const issueStr = issueDate.toISOString().split('T')[0];
  const dueStr = dueDate.toISOString().split('T')[0];
  const loanId = `LOAN-${Date.now().toString().slice(-4)}`;

  student.loans.push({
    id: loanId,
    bookId: book.id,
    title: book.title,
    issueDate: issueStr,
    dueDate: dueStr,
    status: 'active'
  });

  SmartLibState.saveBooks(books);
  SmartLibState.saveStudent(student);

  renderCatalog();
  renderStudentPortal();
  showToast(`✅ Successfully Borrowed! Due in 14 days (${dueStr})`);
  SoundFX.playSuccess();
}

// Return book handler
function handleReturnBook(loanId) {
  const student = SmartLibState.getStudent();
  const loanIdx = student.loans.findIndex(l => l.id === loanId);
  if (loanIdx === -1) return;

  const loan = student.loans[loanIdx];
  const books = SmartLibState.getBooks();
  const book = books.find(b => b.id === loan.bookId);

  if (book) {
    book.available++;
    SmartLibState.saveBooks(books);
  }

  student.loans.splice(loanIdx, 1);
  SmartLibState.saveStudent(student);

  renderCatalog();
  renderStudentPortal();
  showToast(`📖 Book Returned & Shelf Inventory Restored!`);
  SoundFX.playSuccess();
}

// ==========================================
// 5. SMART DESK & SEAT RESERVATION SYSTEM
// ==========================================
const SEATS_DATA = [
  // Silent Focus Hall (Aisle S)
  { code: "S-01", zone: "Silent", occupied: false },
  { code: "S-02", zone: "Silent", occupied: true },
  { code: "S-03", zone: "Silent", occupied: false },
  { code: "S-04", zone: "Silent", occupied: false },
  { code: "S-05", zone: "Silent", occupied: true },
  { code: "S-06", zone: "Silent", occupied: false },
  { code: "S-07", zone: "Silent", occupied: false },
  { code: "S-08", zone: "Silent", occupied: false },

  // Collaborative Tech Pods (Aisle C)
  { code: "C-01", zone: "Collab", occupied: true },
  { code: "C-02", zone: "Collab", occupied: false },
  { code: "C-03", zone: "Collab", occupied: false },
  { code: "C-04", zone: "Collab", occupied: true },
  { code: "C-05", zone: "Collab", occupied: false },
  { code: "C-06", zone: "Collab", occupied: false },
  { code: "C-07", zone: "Collab", occupied: true },
  { code: "C-08", zone: "Collab", occupied: false },

  // Panoramic Window Lounge (Aisle W)
  { code: "W-01", zone: "Window", occupied: false },
  { code: "W-02", zone: "Window", occupied: true },
  { code: "W-03", zone: "Window", occupied: false },
  { code: "W-04", zone: "Window", occupied: false },
  { code: "W-05", zone: "Window", occupied: false },
  { code: "W-06", zone: "Window", occupied: true },
  { code: "W-07", zone: "Window", occupied: false },
  { code: "W-08", zone: "Window", occupied: false },
];

function renderSeatGrid() {
  const container = document.getElementById('seat-grid');
  if (!container) return;

  const mySeat = SmartLibState.getReservedSeat();

  container.innerHTML = SEATS_DATA.map(seat => {
    const isMySeat = (mySeat === seat.code);
    let stateClass = seat.occupied ? 'occupied' : 'available';
    if (isMySeat) stateClass = 'my-seat';

    return `
      <button class="seat-btn ${stateClass}" onclick="handleSeatClick('${seat.code}', ${seat.occupied})">
        <span class="seat-icon">${isMySeat ? '⭐' : (seat.occupied ? '👤' : '🪑')}</span>
        <span class="seat-code">${seat.code}</span>
        <span class="seat-zone-tag">${seat.zone}</span>
      </button>
    `;
  }).join('');

  // Update sidebar info
  const seatInfoBox = document.getElementById('my-seat-status-box');
  if (seatInfoBox) {
    if (mySeat) {
      seatInfoBox.innerHTML = `
        <div style="background: rgba(56, 189, 248, 0.12); border: 1px solid var(--accent-cyan); border-radius: var(--radius-md); padding: 18px;">
          <div style="font-size: 0.8rem; color: var(--accent-cyan); font-weight: 700; margin-bottom: 4px;">CURRENT RESERVATION</div>
          <div style="font-family: var(--font-heading); font-size: 1.6rem; font-weight: 800; margin-bottom: 6px;">Desk ${mySeat}</div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 14px;">Reserved for your 2-hour study session. Scan your ID pass upon arrival.</p>
          <button class="btn-return-action" style="width: 100%; border-color: var(--accent-rose); color: var(--accent-rose);" onclick="cancelSeatReservation()">
            Release Desk
          </button>
        </div>
      `;
    } else {
      seatInfoBox.innerHTML = `
        <div style="background: var(--bg-surface-elevated); border: 1px dashed var(--border-subtle); border-radius: var(--radius-md); padding: 22px; text-align: center;">
          <div style="font-size: 1.8rem; margin-bottom: 8px;">🪑</div>
          <div style="font-family: var(--font-heading); font-size: 1rem; font-weight: 700; margin-bottom: 4px;">No Desk Reserved</div>
          <p style="font-size: 0.82rem; color: var(--text-muted);">Click any available green seat on the floor plan to lock in your study spot.</p>
        </div>
      `;
    }
  }
}

function handleSeatClick(code, isOccupied) {
  const currentSeat = SmartLibState.getReservedSeat();
  if (currentSeat === code) {
    cancelSeatReservation();
    return;
  }
  if (isOccupied) {
    showToast(`Desk ${code} is currently occupied by another student.`);
    return;
  }

  SmartLibState.setReservedSeat(code);
  renderSeatGrid();
  if (window.Library3D && window.Library3D.isInitialized) window.Library3D.updateDeskStatuses();
  showToast(`🎯 Desk ${code} Reserved for you!`);
  SoundFX.playSuccess();
}

function cancelSeatReservation() {
  const seat = SmartLibState.getReservedSeat();
  SmartLibState.setReservedSeat(null);
  renderSeatGrid();
  if (window.Library3D && window.Library3D.isInitialized) window.Library3D.updateDeskStatuses();
  showToast(`Desk ${seat} released.`);
}

// ==========================================
// 6. POMODORO FOCUS DESK & PROCEDURAL SOUND SYNTH
// ==========================================
let timerInterval = null;
let timerSeconds = 25 * 60; // 25 minutes
let isTimerRunning = false;
let isBreak = false;

function updateTimerDisplay() {
  const display = document.getElementById('timer-time');
  const tag = document.getElementById('timer-phase-tag');
  if (!display) return;

  const mins = Math.floor(timerSeconds / 60);
  const secs = timerSeconds % 60;
  display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  if (tag) {
    tag.textContent = isBreak ? "5 MIN COGNITIVE BREAK" : "25 MIN FOCUS DEEP WORK";
    tag.style.color = isBreak ? "var(--accent-cyan)" : "var(--accent-emerald)";
  }
}

function toggleTimer() {
  const btn = document.getElementById('btn-timer-toggle');
  if (!isTimerRunning) {
    // Start
    isTimerRunning = true;
    if (btn) btn.textContent = "Pause Timer";
    timerInterval = setInterval(() => {
      if (timerSeconds > 0) {
        timerSeconds--;
        updateTimerDisplay();
      } else {
        // Complete cycle
        clearInterval(timerInterval);
        isTimerRunning = false;
        SoundFX.playBellChime();
        if (!isBreak) {
          SmartLibState.addStudyMinutes(25);
          renderStudentPortal();
          showToast(`🎉 25 Min Deep Study Completed! Time for a 5 min break.`);
          isBreak = true;
          timerSeconds = 5 * 60;
        } else {
          showToast(`🔔 Break finished! Ready for another focus session?`);
          isBreak = false;
          timerSeconds = 25 * 60;
        }
        if (btn) btn.textContent = "Start Session";
        updateTimerDisplay();
      }
    }, 1000);
  } else {
    // Pause
    clearInterval(timerInterval);
    isTimerRunning = false;
    if (btn) btn.textContent = "Resume Timer";
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  isTimerRunning = false;
  isBreak = false;
  timerSeconds = 25 * 60;
  const btn = document.getElementById('btn-timer-toggle');
  if (btn) btn.textContent = "Start Session";
  updateTimerDisplay();
}

// Procedural Web Audio API Sound Synthesizer (No external MP3 files needed)
class SoundFX {
  static audioCtx = null;
  static rainNode = null;
  static rainGain = null;

  static init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
  }

  static playSuccess() {
    this.init();
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12); // E5

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }

  static click() {
    this.init();
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(820, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  static pageFlip() {
    this.init();
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    // Synthesize realistic crisp paper rustle using buffer noise and bandpass sweep
    const bufferSize = Math.floor(ctx.sampleRate * 0.16);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.045));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.16);
    filter.Q.setValueAtTime(1.8, ctx.currentTime);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.28, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  }

  static playBellChime() {
    this.init();
    const ctx = this.audioCtx;
    // Harmonic bell chord
    [440, 880, 1320].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const duration = 2.5 + (idx * 0.5);
      gain.gain.setValueAtTime(0.12 / (idx + 1), ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    });
  }

  static toggleAmbientRain(enable) {
    this.init();
    const ctx = this.audioCtx;

    if (enable) {
      if (this.rainNode) return;
      // Synthesize pink/brown noise for rain
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }

      this.rainNode = ctx.createBufferSource();
      this.rainNode.buffer = buffer;
      this.rainNode.loop = true;

      // Filter to sound like soft indoor rain
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);

      this.rainGain = ctx.createGain();
      this.rainGain.gain.setValueAtTime(0.08, ctx.currentTime);

      this.rainNode.connect(filter);
      filter.connect(this.rainGain);
      this.rainGain.connect(ctx.destination);

      this.rainNode.start();
    } else {
      if (this.rainNode) {
        this.rainNode.stop();
        this.rainNode.disconnect();
        this.rainNode = null;
      }
    }
  }
}

// Toast notification helper
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>⚡</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Theme Switcher (Dark / Light)
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('smartlib_theme', next);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = (next === 'light' ? '☀️' : '🌙');
}

// Modal Helpers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

// ==========================================
// 7. INITIALIZATION & SHORTCUTS
// ==========================================

// 3D Mode Toggle

function toggleHero3DSpotlight(force) {
  const card = document.getElementById('hero-3d-card');
  const btnText = document.getElementById('hero-spotlight-text');
  if (!card) return;
  const isHidden = (card.style.display === 'none' || (typeof window !== 'undefined' && window.getComputedStyle && window.getComputedStyle(card).display === 'none'));
  const show = typeof force === 'boolean' ? force : isHidden;
  card.style.display = show ? 'flex' : 'none';
  if (btnText) btnText.textContent = show ? 'Hide Spotlight' : '3D Spotlight';
  if (show && window.Library3D && !window.Library3D.heroRenderer && typeof window.Library3D.initHeroShowcase === 'function') {
    window.Library3D.initHeroShowcase();
  }
}
if (typeof window !== 'undefined') {
  window.toggleHero3DSpotlight = toggleHero3DSpotlight;
}

function toggle3DMode(is3D, isInitial = false) {
  const wrapper = document.getElementById('webgl-library-section');
  const btn3D = document.getElementById('btn-mode-3d');
  const btn2D = document.getElementById('btn-mode-2d');

  if (btn3D) btn3D.classList.toggle('active', is3D);
  if (btn2D) btn2D.classList.toggle('active', !is3D);

  if (wrapper) {
    if (is3D) {
      wrapper.style.display = 'block';
      if (window.Library3D) {
        window.Library3D.isCampusVisible = true;
        if (!window.Library3D.isInitialized) {
          window.Library3D.init();
        } else {
          window.Library3D.onWindowResize();
        }
      }
      if (!isInitial) {
        wrapper.scrollIntoView({ behavior: 'smooth' });
        showToast('🌐 Switched to 3D Virtual Campus Mode', 'info');
      }
    } else {
      wrapper.style.display = 'none';
      if (window.Library3D) {
        window.Library3D.isCampusVisible = false;
      }
      if (!isInitial) {
        const catalogEl = document.getElementById('view-catalog');
        if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
        showToast('📑 Switched to Fast 2D Catalog Grid', 'info');
      }
    }
  }
}

// Hardware-accelerated CSS 3D Tilt & Parallax Layers
function init3DTiltEffects() {
  if (typeof document === 'undefined') return;

  // Virtual Student ID Card 3D tilt with depth layers
  const idCard = document.querySelector('.virtual-id-card');
  if (idCard && !idCard._hasTilt) {
    idCard._hasTilt = true;
    idCard.addEventListener('mousemove', (e) => {
      const rect = idCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;
      idCard.style.transition = 'transform 0.05s ease-out';
      idCard.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });

    idCard.addEventListener('mouseleave', () => {
      idCard.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      idCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  }

  // Catalog Cards 3D dynamic perspective tilt with floating depth layers and glare
  document.querySelectorAll('.book-card').forEach(card => {
    if (card._hasTilt) return;
    card._hasTilt = true;
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      const pctX = ((x / rect.width) * 100).toFixed(1);
      const pctY = ((y / rect.height) * 100).toFixed(1);
      card.style.setProperty('--glare-x', `${pctX}%`);
      card.style.setProperty('--glare-y', `${pctY}%`);
      card.style.transition = 'transform 0.05s ease-out, box-shadow 0.2s ease';
      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Default to Fast 2D Mode for instant load and zero GPU lag
  toggle3DMode(false, true);
  // Restore theme
  const savedTheme = localStorage.getItem('smartlib_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = (savedTheme === 'light' ? '☀️' : '🌙');

  // Initial render
  renderCatalog();
  renderStudentPortal();
  renderSeatGrid();
  updateTimerDisplay();
  init3DTiltEffects();

  // Global Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      const searchInput = document.getElementById('global-search-input');
      if (searchInput) searchInput.focus();
    }
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      if (window.Library3D && typeof window.Library3D.closeBookInspector === 'function') {
        window.Library3D.closeBookInspector();
      }
    }
    const bookModal = document.getElementById('modal-3d-book');
    if (bookModal && bookModal.classList.contains('active') && window.Library3D) {
      if (e.key === 'ArrowRight' && typeof window.Library3D.nextPage === 'function') {
        e.preventDefault();
        window.Library3D.nextPage();
      } else if (e.key === 'ArrowLeft' && typeof window.Library3D.prevPage === 'function') {
        e.preventDefault();
        window.Library3D.prevPage();
      }
    }
    if (e.altKey && e.key === '1') switchPage('catalog');
    if (e.altKey && e.key === '2') switchPage('student');
    if (e.altKey && e.key === '3') switchPage('desks');
    if (e.altKey && e.key === '4') switchPage('pomodoro');
  });

  // Modal backdrop click close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        if (overlay.id === 'modal-3d-book' && window.Library3D && typeof window.Library3D.closeBookInspector === 'function') {
          window.Library3D.closeBookInspector();
        }
      }
    });
  });

  // PWA Service Worker Registration
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});


// ==========================================================================
// AI RESEARCH ASSISTANT & SHOWCASE LOGIC (DESIGN REFERENCE BLUEPRINT)
// ==========================================================================
const AI_KNOWLEDGE_BASE = {
  'machine learning': 'Machine learning is a branch of artificial intelligence that allows computers to learn patterns from data and make decisions or predictions without being explicitly programmed. Recommended read: "Deep Learning" by Goodfellow (Shelf: FL-2 / AISLE-4 / RACK-A1).',
  'clean code': 'Clean Code by Robert C. Martin provides timeless principles on writing readable, testable, maintainable software with meaningful naming, small single-responsibility functions, and SOLID design patterns. Available on Shelf FL-1 / AISLE-3 / RACK-C1.',
  'ai': 'Artificial intelligence encompasses autonomous rational agents, machine learning, neural networks, computer vision, and NLP. Recommended catalog foundation: "Artificial Intelligence: A Modern Approach" by Russell & Norvig (Shelf FL-2 / AISLE-3 / RACK-B2).',
  'algorithms': 'Data structures and algorithms form the backbone of computing efficiency. The gold standard is "Introduction to Algorithms (CLRS)" by Cormen et al. (Shelf FL-1 / AISLE-2 / RACK-B3), covering divide-and-conquer, dynamic programming, and graph algorithms.',
  'python': 'Python is a high-level, general-purpose programming language. Recommended: "Python Programming" (Shelf: FL-1 / AISLE-4 / RACK-D2) covering data structures, object-oriented design, and algorithms.',
  'default': 'Based on university academic catalog holdings, I recommend exploring our primary textbooks on Computer Science, Mathematics, and Systems. You can search any keyword above or click "3D Spotlight" to examine books in virtual space.'
};

function sendAIMessage() {
  const input = document.getElementById('ai-chat-input');
  if (!input) return;
  const query = input.value.trim();
  if (!query) return;

  const chatContainer = document.getElementById('ai-chat-thread');
  if (!chatContainer) return;

  // Append user bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'ai-msg-bubble user';
  userBubble.textContent = query;
  chatContainer.appendChild(userBubble);
  input.value = '';

  // Append thinking bubble
  const thinkingBubble = document.createElement('div');
  thinkingBubble.className = 'ai-msg-bubble ai';
  thinkingBubble.textContent = 'Analyzing catalog and academic databases...';
  chatContainer.appendChild(thinkingBubble);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  setTimeout(() => {
    thinkingBubble.remove();
    let reply = AI_KNOWLEDGE_BASE['default'];
    const lower = query.toLowerCase();
    for (const [key, val] of Object.entries(AI_KNOWLEDGE_BASE)) {
      if (lower.includes(key)) {
        reply = val;
        break;
      }
    }
    const aiBubble = document.createElement('div');
    aiBubble.className = 'ai-msg-bubble ai';
    aiBubble.textContent = reply;
    chatContainer.appendChild(aiBubble);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 450);
}

function askAIChip(promptText) {
  const input = document.getElementById('ai-chat-input');
  if (input) {
    input.value = promptText;
    sendAIMessage();
  }
}

function newAIChat() {
  const chatContainer = document.getElementById('ai-chat-thread');
  if (!chatContainer) return;
  chatContainer.innerHTML = `
    <div class="ai-msg-bubble user">Explain machine learning in simple terms.</div>
    <div class="ai-msg-bubble ai">Machine learning is a branch of artificial intelligence that allows computers to learn patterns from data and make decisions or predictions without being explicitly programmed. Recommended read: "Deep Learning" (Shelf: FL-2 / AISLE-4 / RACK-A1).</div>
  `;
}

function viewFeaturedBook() {
  if (window.Library3D && typeof window.Library3D.inspectBook === 'function') {
    window.Library3D.inspectBook(13);
  } else {
    showToast('📖 Clean Code: Located on Shelf FL-1 / AISLE-3 / RACK-C1');
  }
}

function issueFeaturedBook() {
  handleBorrowBook(13);
}

window.sendAIMessage = sendAIMessage;
window.askAIChip = askAIChip;
window.newAIChat = newAIChat;
window.viewFeaturedBook = viewFeaturedBook;
window.issueFeaturedBook = issueFeaturedBook;
