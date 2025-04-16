### **AI Guards**  

---

#### 1. Purpose  
Standardize how teams **plan, review, execute, and verify** AI‑assisted code—without locking them into a single IDE or toolchain.

---

#### 2. Five‑Stage Workflow  

1. **Plan** – reasoning LLM  
   - Scope, functional / non‑functional reqs  
   - Dev guidelines + approved packages (license & security pre‑check)  
   - Threat‑model stub  
   - Numbered execution plan  

2. **Review** – developer ± reasoning LLM  
   - Close gaps, edge cases, compliance issues  
   - Sign‑off

3. **Delegate** – coding LLM  
   - Implement tasks sequentially  
   - One Git branch per task

4. **Commit** – automatic  
   - Checkpoint after each step, ties commit → plan ID  

5. **Validate** – CI pipeline  
   - Run unit + security tests, license scan  
   - Failures stop merge; low‑confidence LLM output escalates to senior dev

---

#### 3. Directory Layout  
```text
.ai-guards/
├── rules/              # Current version
│   ├── guidelines/     # Org‑wide coding style and guidelines
│   ├── security/       # Security rules
│   └── general/        # General rules
|── templates/          # Reusable prompt & rule snippets (.test.mdc, .component.mdc, etc)
└── plans/              # Prompt → result → human rating
```

---

#### 4. Rule Types

| Rule Type         | Description                                                                                   |
|-------------------|----------------------------------------------------------------------------------------------|
| **Always**        | Always included in the model context.                                                        |
| **Auto Attached** | Included when files matching a glob pattern are referenced.                                  |
| **Agent Requested** | Rule is available to the AI, which decides whether to include it. Must provide a description. |
| **Manual**        | Only included when explicitly mentioned using `@ruleName`.                                   |


Rule example

```mdc
---

description: RPC Service boilerplate
globs: 
alwaysApply: false
---

- Use our internal RPC pattern when defining services
- Always use snake_case for service names.

@service-template.ts
```

---


#### 5. Templates

Template example

```mdc
---

description: Reusable unit test template for components
type: auto
appliesTo: *.component.tsx
---

## 🧪 Unit Test Template

Write tests using the project's test framework (e.g., Jest, Vitest).

**Checklist:**
- Cover all public functions and edge cases  
- Use mocks for external calls  
- Ensure ≥85% test coverage  

```ts
describe('<ComponentName>', () => {
  it('should <expected behavior>', () => {
    // test logic here
  });
});
```

---


#### 6. Plans

Plan example

```mdc
---
id: plan-001
title: Add user authentication to API
createdAt: 2025-04-15
author: ai-guards
status: in-progress
---

## 🧩 Scope

Implement login, logout, and session validation endpoints using JWT.

## ✅ Functional Requirements

- POST /login: authenticate user, return JWT  
- POST /logout: invalidate client-side token  
- Middleware: validate token on protected routes  
- User validation from existing PostgreSQL DB

## ⚙️ Non-Functional Requirements

- API response time < 200ms  
- Log all auth attempts with timestamps and IP

## 📚 Guidelines & Packages

- Follow `@api-guidelines`  
- Use `jsonwebtoken` (MIT license)  
- No external auth providers

## 🔐 Threat Model (Stub)

- Credential stuffing  
- Token replay  
- Session fixation

## 🔢 Execution Plan

1. Create `auth/` module scaffold  
2. Implement POST /login with JWT issuance  
3. Implement POST /logout (client token discard)  
4. Add token validation middleware  
5. Write unit tests for all logic  
```


---

#### 7. CLI Wrapper (`ai-guards`)  

| Command            | Action |
|--------------------|--------|
| `plan`             | Generate a plan, store in `plans/` |

Install/boot‑strap in **< 30 s**:  
```bash
npx ai-guards-init         # scaffolds .ai-guards/
```

---

***Outcome:***
A modular, secure, and repeatable AI dev pipeline—plug-and-play for any repo, any language, any IDE.

Let me know if you'd like a visual version or one tailored for onboarding docs.

