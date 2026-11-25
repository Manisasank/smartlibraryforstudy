/**
 * Smart Library Management System - Client-side Utilities
 */

document.addEventListener('DOMContentLoaded', function () {
    // 1. Mobile Menu Drawer Toggle Handler
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const mobileDrawer = document.getElementById('mobileMenuDrawer');

    if (mobileToggle && mobileDrawer) {
        mobileToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            mobileDrawer.classList.toggle('show');
            mobileToggle.textContent = mobileDrawer.classList.contains('show') ? '✕' : '☰';
        });

        document.addEventListener('click', function (e) {
            if (!mobileDrawer.contains(e.target) && !mobileToggle.contains(e.target)) {
                mobileDrawer.classList.remove('show');
                mobileToggle.textContent = '☰';
            }
        });
    }

    // 2. Flash Alert Dismiss Handler
    const flashCloseButtons = document.querySelectorAll('.flash-close');
    flashCloseButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const flash = this.closest('.flash');
            if (flash) {
                flash.style.opacity = '0';
                flash.style.transition = 'opacity .3s ease';
                setTimeout(function () { flash.remove(); }, 300);
            }
        });
    });

    // Auto Dismiss Flash Alerts after 7 seconds
    const flashAlerts = document.querySelectorAll('.flash');
    flashAlerts.forEach(function (flash) {
        setTimeout(function () {
            if (flash && flash.parentNode) {
                flash.style.opacity = '0';
                flash.style.transition = 'opacity .3s ease';
                setTimeout(function () { if (flash.parentNode) flash.remove(); }, 300);
            }
        }, 7000);
    });

    // 3. Confirm Sensitive Actions
    const confirmButtons = document.querySelectorAll('[data-confirm]');
    confirmButtons.forEach(function (button) {
        button.addEventListener('click', function (e) {
            const message = this.getAttribute('data-confirm') || 'Are you sure you want to perform this action?';
            if (!confirm(message)) {
                e.preventDefault();
                return false;
            }
        });
    });

    // 4. Quick Table Filter Helper
    const quickSearchInput = document.getElementById('quickTableSearch');
    if (quickSearchInput) {
        quickSearchInput.addEventListener('keyup', function () {
            const term = this.value.toLowerCase();
            const targetTable = document.querySelector(this.getAttribute('data-target') || 'table tbody');
            if (targetTable) {
                const rows = targetTable.getElementsByTagName('tr');
                Array.from(rows).forEach(function (row) {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(term) ? '' : 'none';
                });
            }
        });
    }
});
