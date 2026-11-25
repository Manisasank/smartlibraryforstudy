/**
 * SMART LIBRARY MANAGEMENT SYSTEM
 * Main Client-Side JavaScript
 * Smart Library Interface
 */

document.addEventListener('DOMContentLoaded', function () {
  // Auto-dismiss alert boxes after 6 seconds
  const alerts = document.querySelectorAll('.alert-dismissible');
  alerts.forEach(function (alert) {
    setTimeout(function () {
      try {
        const bsAlert = new bootstrap.Alert(alert);
        bsAlert.close();
      } catch (e) {
        alert.remove();
      }
    }, 6000);
  });

  // Toggle Password Visibility
  const togglePassBtns = document.querySelectorAll('.toggle-password-btn');
  togglePassBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const targetId = this.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input) {
        const isPass = input.getAttribute('type') === 'password';
        input.setAttribute('type', isPass ? 'text' : 'password');
        const icon = this.querySelector('i');
        if (icon) {
          icon.classList.toggle('fa-eye');
          icon.classList.toggle('fa-eye-slash');
        }
      }
    });
  });

  // Client-side quick filter for tables
  const tableSearchInputs = document.querySelectorAll('.table-search-input');
  tableSearchInputs.forEach(function (input) {
    input.addEventListener('keyup', function () {
      const tableId = this.getAttribute('data-table');
      const filterValue = this.value.toLowerCase().trim();
      const targetTable = document.getElementById(tableId);
      if (!targetTable) return;

      const rows = targetTable.querySelectorAll('tbody tr');
      rows.forEach(function (row) {
        const rowText = row.innerText.toLowerCase();
        if (rowText.includes(filterValue)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  });

  // Bootstrap Form Validation initialization
  const forms = document.querySelectorAll('.needs-validation');
  Array.from(forms).forEach(function (form) {
    form.addEventListener(
      'submit',
      function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      },
      false
    );
  });

  // AI Research Assistant Interactive Client
  const assistantInput = document.getElementById('assistantInput');
  const assistantBtn = document.getElementById('assistantBtn');
  const chatWindow = document.querySelector('.chat-window');

  function sendAssistantMessage() {
    if (!assistantInput || !assistantBtn || !chatWindow) return;
    const q = assistantInput.value.trim();
    if (!q) return;

    // Append user bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble user';
    userBubble.textContent = q;
    chatWindow.appendChild(userBubble);

    assistantInput.value = '';
    assistantInput.disabled = true;
    assistantBtn.disabled = true;

    // Append temporary loading bubble
    const loadingBubble = document.createElement('div');
    loadingBubble.className = 'chat-bubble';
    loadingBubble.textContent = 'Searching catalog and knowledge records...';
    chatWindow.appendChild(loadingBubble);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    fetch('/api/assistant?q=' + encodeURIComponent(q))
      .then(function (res) { return res.json(); })
      .then(function (data) {
        loadingBubble.remove();
        const replyBubble = document.createElement('div');
        replyBubble.className = 'chat-bubble';

        if (data.books && data.books.length > 0) {
          let html = '<p style="margin:0 0 6px">Found <strong>' + data.books.length + '</strong> matching book(s):</p><ul style="margin:0;padding-left:18px;line-height:1.7">';
          data.books.forEach(function (b) {
            const avail = b.available > 0 ? ('<span style="color:#55dfb1">(' + b.available + ' available)</span>') : '<span style="color:#ff5f67">(out)</span>';
            html += '<li><a href="/book_details?id=' + b.id + '" style="font-weight:600">' + escapeHtml(b.title) + '</a> by ' + escapeHtml(b.author) + ' ' + avail + '</li>';
          });
          html += '</ul>';
          replyBubble.innerHTML = html;
        } else {
          replyBubble.textContent = data.reply || 'No direct matches found.';
        }

        chatWindow.appendChild(replyBubble);
        chatWindow.scrollTop = chatWindow.scrollHeight;
      })
      .catch(function () {
        loadingBubble.textContent = 'Could not connect to the library catalog service.';
      })
      .finally(function () {
        assistantInput.disabled = false;
        assistantBtn.disabled = false;
        assistantInput.focus();
      });
  }

  if (assistantInput && assistantBtn && chatWindow) {
    assistantBtn.addEventListener('click', sendAssistantMessage);
    assistantInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendAssistantMessage();
      }
    });
  }

  // AI Prompt Chips Handler
  const promptChips = document.querySelectorAll('.prompt-chip');
  promptChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      const promptText = this.getAttribute('data-prompt') || this.innerText.trim();
      if (assistantInput) {
        assistantInput.value = promptText;
        sendAssistantMessage();
      }
    });
  });

  // Home Catalog Category Filter Chips
  const catChips = document.querySelectorAll('.cat-chip');
  const catalogRows = document.querySelectorAll('.catalog-row');
  catChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      catChips.forEach(function (c) { c.classList.remove('active'); });
      this.classList.add('active');
      const cat = (this.getAttribute('data-cat') || 'all').toLowerCase();

      catalogRows.forEach(function (row) {
        const rowCat = (row.getAttribute('data-category') || '').toLowerCase();
        if (cat === 'all' || rowCat === cat) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  });

  // Global Spotlight Search (Ctrl+K / Cmd+K)
  const spotlightModal = document.getElementById('spotlightModal');
  const spotlightInput = document.getElementById('spotlightSearchInput');
  const spotlightResults = document.getElementById('spotlightResults');

  window.openSpotlight = function () {
    if (!spotlightModal) return;
    spotlightModal.classList.add('open');
    if (spotlightInput) {
      spotlightInput.value = '';
      renderDefaultSpotlight();
      setTimeout(function () { spotlightInput.focus(); }, 50);
    }
  };

  window.closeSpotlight = function () {
    if (!spotlightModal) return;
    spotlightModal.classList.remove('open');
  };

  if (spotlightModal) {
    spotlightModal.addEventListener('click', function (e) {
      if (e.target === spotlightModal) {
        window.closeSpotlight();
      }
    });

    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (spotlightModal.classList.contains('open')) {
          window.closeSpotlight();
        } else {
          window.openSpotlight();
        }
      } else if (e.key === 'Escape' && spotlightModal.classList.contains('open')) {
        window.closeSpotlight();
      }
    });
  }

  function renderDefaultSpotlight() {
    if (!spotlightResults) return;
    spotlightResults.innerHTML = `
      <div class="spotlight-group-title">Quick Navigation</div>
      <a class="spotlight-item active" href="/books">
        <span>📚 Browse Complete Catalog</span>
        <span class="spotlight-item-badge">Catalog</span>
      </a>
      <a class="spotlight-item" href="/#assistant">
        <span>✨ AI Research Assistant</span>
        <span class="spotlight-item-badge">Assistant</span>
      </a>
      <a class="spotlight-item" href="/profile">
        <span>👤 Member Profile &amp; Pass</span>
        <span class="spotlight-item-badge">Profile</span>
      </a>
      <a class="spotlight-item" href="/terms">
        <span>⚖️ Borrowing Rules &amp; Terms</span>
        <span class="spotlight-item-badge">Policy</span>
      </a>
    `;
    setupItemHover();
  }

  let spotlightTimer = null;
  if (spotlightInput) {
    spotlightInput.addEventListener('input', function () {
      clearTimeout(spotlightTimer);
      const query = this.value.trim();
      if (!query) {
        renderDefaultSpotlight();
        return;
      }

      spotlightTimer = setTimeout(function () {
        fetch('/api/spotlight?q=' + encodeURIComponent(query))
          .then(function (res) { return res.json(); })
          .then(function (data) {
            let html = '';
            if (data.books && data.books.length > 0) {
              html += '<div class="spotlight-group-title">Books Found (' + data.books.length + ')</div>';
              data.books.forEach(function (b) {
                const availBadge = b.available > 0 
                  ? '<span class="spotlight-item-badge" style="color:#5eead4;background:rgba(35,215,207,.15)">' + b.available + ' Available</span>'
                  : '<span class="spotlight-item-badge" style="color:#f87171;background:rgba(239,68,68,.15)">Checked Out</span>';
                html += `
                  <a class="spotlight-item" href="/book_details?id=${b.id}">
                    <div>
                      <strong style="display:block;color:#fff">${escapeHtml(b.title)}</strong>
                      <span class="spotlight-item-meta">by ${escapeHtml(b.author)} &bull; ${escapeHtml(b.category)} &bull; Rack ${escapeHtml(b.rack || 'A-1')}</span>
                    </div>
                    ${availBadge}
                  </a>
                `;
              });
            }

            if (data.links && data.links.length > 0) {
              html += '<div class="spotlight-group-title" style="margin-top:8px">Quick Navigation</div>';
              data.links.forEach(function (l) {
                html += `
                  <a class="spotlight-item" href="${l.url}">
                    <span>${escapeHtml(l.title)}</span>
                    <span class="spotlight-item-badge">${escapeHtml(l.badge || 'Portal')}</span>
                  </a>
                `;
              });
            }

            if (!html) {
              html = '<div style="padding:28px 16px;text-align:center;color:#8fa7bd;font-size:13px">No matches found for "' + escapeHtml(query) + '"</div>';
            }

            spotlightResults.innerHTML = html;
            setupItemHover();
          })
          .catch(function () {
            spotlightResults.innerHTML = '<div style="padding:16px;color:#f87171;font-size:13px">Could not query library spotlight service.</div>';
          });
      }, 150);
    });

    spotlightInput.addEventListener('keydown', function (e) {
      const items = spotlightResults.querySelectorAll('.spotlight-item');
      if (!items.length) return;
      let currentIndex = -1;
      items.forEach(function (it, idx) {
        if (it.classList.contains('active')) currentIndex = idx;
      });

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        setActiveSpotlightItem(items, nextIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        setActiveSpotlightItem(items, prevIndex);
      } else if (e.key === 'Enter') {
        if (currentIndex >= 0 && items[currentIndex]) {
          e.preventDefault();
          items[currentIndex].click();
        } else if (items.length > 0) {
          e.preventDefault();
          items[0].click();
        }
      }
    });
  }

  function setActiveSpotlightItem(items, idx) {
    items.forEach(function (it) { it.classList.remove('active'); });
    if (items[idx]) {
      items[idx].classList.add('active');
      items[idx].scrollIntoView({ block: 'nearest' });
    }
  }

  function setupItemHover() {
    if (!spotlightResults) return;
    const items = spotlightResults.querySelectorAll('.spotlight-item');
    items.forEach(function (it) {
      it.addEventListener('mouseenter', function () {
        items.forEach(function (i) { i.classList.remove('active'); });
        it.classList.add('active');
      });
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
});

