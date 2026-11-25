# University Smart Library — Rules and Regulations

This document sets forth the official operational policies, circulation regulations, student obligations, and administrative guidelines governing the **Smart Library Management System** across all university academic departments.

---

## 1. General Principles & Library Objectives

1. **Mission**: The Smart Library is established to support academic study, research, and collaborative learning for all registered university students, faculty, and administrative staff.
2. **Eligibility**: Access to borrowing privileges, digital passes, and physical library resources is granted solely to active students and staff holding valid institutional credentials.
3. **Equitable Access**: Library materials are institutional property maintained for the collective benefit of the entire student body; hoarding or monopolizing resources is strictly prohibited.

---

## 2. Membership & Account Identification

1. **Account Registration**:
   - Every student must register with their official university email and full legal name.
   - Upon registration, an automatic unique identifier (e.g., `STU-YYMMDD...`) is assigned to the student's profile.
2. **Credential Responsibility**:
   - Accounts are strictly personal and non-transferable.
   - Students must not disclose their login credentials or allow third parties to borrow books under their identity.
   - Any transaction logged under a student's account remains the legal and financial responsibility of that account holder.
3. **Profile Accuracy**:
   - Students and staff must keep their department, contact phone number, and physical address current via the **Profile** portal.

---

## 3. Circulation & Borrowing Regulations

### 3.1. Borrowing Quota (`max_books_per_student`)
- **Undergraduate & Postgraduate Students**: Maximum of **3 books** concurrently borrowed or held under active loan.
- Requests placed beyond the quota will be blocked automatically by the system until previous books are formally returned.

### 3.2. Standard Loan Period (`loan_duration_days`)
- Standard loan duration is **14 calendar days** from the date of physical collection and system checkout.
- The exact due date is recorded on the student's **Digital Borrowing Pass / Receipt** (`/student/receipt/<issue_id>`).

### 3.3. Check-out & Circulation Verification
- Books requested online must be physically picked up at the library circulation desk.
- The duty librarian or staff member scans or enters the book barcode/ISBN and issues the digital circulation code (`ISS-...`).
- The student must ensure the book status transitions to `issued` before leaving the premises.

---

## 4. Book Request & Reservation Policy

1. **Online Reservation**: Students may place borrow requests for available books through the online catalog.
2. **Processing Priority**: Requests are processed on a First-In, First-Out (FIFO) basis by circulation staff.
3. **Approval Validity**: Once a request is approved, the book is temporarily reserved. The student has **48 hours** to collect the item from the circulation desk; uncollected reservations are cancelled and returned to the general shelf.
4. **Duplicate Safeguard**: Students cannot submit multiple requests or simultaneous loans for the exact same book title.

---

## 5. Overdue Policies, Fines, and Penalties

### 5.1. Overdue Calculation
- Overdue status activates automatically at 00:00 hours on the day following the scheduled `due_date`.
- The system automatically transitions book status to `overdue`.

### 5.2. Daily Fine Rate (`daily_fine_rate`)
- A penalty fee of **₹2.00 per day** (or institutional default) is levied for every calendar day a book remains past due.
- Formula:
  $$\text{Fine Amount} = (\text{Return Date} - \text{Due Date}) \times \text{Daily Fine Rate}$$

### 5.3. Settlement & Return
- When an overdue book is returned at the circulation desk, the total accrued fine is computed immediately.
- Fines may be marked as:
  - **Paid**: Recorded with staff identification and timestamp upon receipt of payment.
  - **Unpaid**: Outstanding balance attached to the student's profile.
  - **Waived**: Authorized exclusively by the Head Librarian / Administrator in verified cases of medical emergency or institutional closure.

### 5.4. Suspension of Privileges
- Students with outstanding unpaid fines or overdue books are restricted from requesting additional books or renewing loans until accounts are cleared.

---

## 6. Care of Library Materials & Damage Liability

1. **Inspection on Checkout**: Students must inspect each book before checking it out. Existing tears, marks, or defects must be reported to the issuing desk so they can be noted in the transaction record.
2. **Prohibited Markings**: Highlighting, writing, folding pages (dog-earing), or removing pages/barcodes is strictly forbidden.
3. **Damaged Material Penalty**:
   - If a book is returned in damaged condition (water damage, torn pages, broken binding), the student is assessed a repair charge or replacement cost as determined by the library administration.
4. **Lost Book Policy**:
   - In the event of a lost book, the student must notify library staff immediately.
   - The student must either:
     1. Supply a replacement copy of the same edition or newer (in brand-new condition), or
     2. Pay the current market price of the book plus a 15% administrative cataloging fee.

---

## 7. Digital Platform Rules & Acceptable Use

1. **System Integrity**:
   - Users must not attempt SQL injection, Cross-Site Scripting (XSS), CSRF tampering, or automated scraping against the library portal.
   - Any attempt to manipulate borrowing quotas, issue codes, or fine balances will result in immediate suspension and referral to the University Disciplinary Committee.
2. **Digital Pass Authenticity**:
   - The digital borrowing pass (`/student/receipt/<id>`) contains a unique cryptographic issue code. Presenting forged or modified passes is treated as academic misconduct.
3. **Session Security**:
   - Users must sign out of the system when using shared university lab computers.

---

## 8. University Clearance & "No Dues" Policy

1. **Semester End & Graduation**:
   - Prior to semester examinations, transfer, or university graduation, every student must obtain a digital **Library Clearance Certificate ("No Dues")**.
2. **Conditions for Clearance**:
   - All issued books returned in good condition.
   - Zero pending unpaid fines.
   - Cancellation of pending book requests.
3. Non-clearance will lead to the withholding of official transcripts, degree certificates, and re-enrollment permits.

---

## 9. Appeals and Inquiries

Students seeking clarification on loan records, disputed return dates, or fine waiver requests should submit an appeal through:
- **Circulation Desk**: Ground Floor, Central University Library
- **Admin Portal**: Accessible to Library Staff & System Administrator
- **Email**: `admin@smartlib.com` or `staff@smartlib.com`
