# Antigravity Operating Protocol: The 3-Skill Workflow

This workspace strictly adheres to the **3-Skill Essential Workflow**:
1. **PLAN: Get Shit Done (GSD)**
2. **BUILD: Ralph Loop**
3. **REVIEW: CodeRabbit**

---

## 1. PLAN: Get Shit Done (GSD)
- **Break Big Goals Down:** Always divide complex features or broad user requests into small, manageable, sequential phases before coding.
- **Outcome & Context First:** Define the goal, constraints, and explicit "Definition of Done" for each phase.
- **Workflow Pipeline:**
  `/new-project` ➔ `/discuss-phase` ➔ `/plan` ➔ `/execute` ➔ `/verify`
- **Phase Sizing:** Keep each phase small and focused so changes can be verified independently before moving forward.

---

## 2. BUILD: Ralph Loop
- **Autonomous Iterative Execution:** Treat tasks as continuous execution loops rather than one-off guesses.
- **Test-Driven Self-Healing:**
  1. Implement changes based on the active task.
  2. Immediately run the test suite, build script, or compiler.
  3. Detect errors and stack traces.
  4. Fix failures and re-test.
  5. Continue iterating until all checks are 100% green before asking the user.
- **State & Progress Tracking:** Maintain clear task lists and update progress between iterations so work can resume cleanly without losing context.

---

## 3. REVIEW: CodeRabbit
- **Pre-Commit Quality Audit:** Review every modified file and git diff with a senior code reviewer mindset before committing or concluding.
- **Checklist:**
  - [ ] **Bugs & Edge Cases:** Null/undefined checks, boundary conditions, unhandled exceptions.
  - [ ] **Security:** No secrets/API keys exposed, sanitized inputs, secure configurations.
  - [ ] **Performance:** Avoid unnecessary re-renders, unbounded loops, or memory leaks.
  - [ ] **Accessibility & UI:** WCAG compliant contrast, responsive styling, keyboard navigation.
  - [ ] **Code Cleanliness:** Preserve existing documentation, adhere to project conventions, eliminate unused code.

---

## Autonomous Pair Programming Contract
Whenever the user interacts in this workspace, the agent must automatically adopt these three principles: Plan with GSD clarity, Build with Ralph Loop persistence, and Review with CodeRabbit rigor.
