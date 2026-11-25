/**
 * SMART LIBRARY MANAGEMENT SYSTEM
 * Dashboard Interactive Behaviors
 * Smart Library Interface
 */

document.addEventListener('DOMContentLoaded', function () {
  // Mobile Sidebar Toggle
  const toggleBtn = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.dashboard-sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');

  if (toggleBtn && sidebar && backdrop) {
    toggleBtn.addEventListener('click', function () {
      sidebar.classList.toggle('show');
      backdrop.classList.toggle('show');
    });

    backdrop.addEventListener('click', function () {
      sidebar.classList.remove('show');
      backdrop.classList.remove('show');
    });
  }

  // Live Fine Calculation on Return Book Desk
  const issueSelect = document.getElementById('issue_id') || document.getElementById('issueSelect');
  const returnDateInput = document.getElementById('return_date') || document.getElementById('returnDateInput');
  const finePreviewCard = document.getElementById('finePreviewCard');
  const overdueDaysBadge = document.getElementById('overdueDaysBadge');
  const fineAmountBadge = document.getElementById('fineAmountBadge');

  function updateReturnFinePreview() {
    if (!issueSelect || !returnDateInput) return;

    const selectedOption = issueSelect.options[issueSelect.selectedIndex];
    if (!selectedOption || !selectedOption.value) {
      if (finePreviewCard) finePreviewCard.style.display = 'none';
      return;
    }

    const dueDateStr = selectedOption.getAttribute('data-duedate');
    const fineRate = parseFloat(selectedOption.getAttribute('data-finerate') || 2.0);
    const returnDateStr = returnDateInput.value;

    if (!dueDateStr || !returnDateStr) return;

    const dueDate = new Date(dueDateStr);
    dueDate.setHours(23, 59, 59, 999);

    const returnDate = new Date(returnDateStr);
    returnDate.setHours(12, 0, 0, 0);

    let overdueDays = 0;
    if (returnDate > dueDate) {
      const diffTime = Math.abs(returnDate - dueDate);
      overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const fineAmount = (overdueDays * fineRate).toFixed(2);

    if (finePreviewCard) {
      finePreviewCard.style.display = 'block';
    }
    if (overdueDaysBadge) {
      overdueDaysBadge.textContent = overdueDays + ' days';
      if (overdueDays > 0) {
        overdueDaysBadge.className = 'badge bg-danger fs-6';
      } else {
        overdueDaysBadge.className = 'badge bg-success fs-6';
      }
    }
    if (fineAmountBadge) {
      fineAmountBadge.textContent = '₹' + fineAmount;
      if (overdueDays > 0) {
        fineAmountBadge.className = 'badge bg-danger fs-5';
      } else {
        fineAmountBadge.className = 'badge bg-success fs-5';
      }
    }
  }

  if (issueSelect) {
    issueSelect.addEventListener('change', updateReturnFinePreview);
  }
  if (returnDateInput) {
    returnDateInput.addEventListener('change', updateReturnFinePreview);
    // Initial call
    updateReturnFinePreview();
  }

  // Generic Confirm Delete Action Handler
  const deleteLinks = document.querySelectorAll('.confirm-action');
  deleteLinks.forEach(function (el) {
    el.addEventListener('click', function (e) {
      const message = this.getAttribute('data-confirm') || 'Are you sure you want to proceed with this action?';
      if (!confirm(message)) {
        e.preventDefault();
      }
    });
  });
});
