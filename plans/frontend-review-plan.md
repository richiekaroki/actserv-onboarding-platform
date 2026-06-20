# Frontend Review Plan – ActServ On‑boarding Platform

**Scope**: Review the `frontend` Next.js application located at `F:/dev/react/actserv-onboarding-platform/frontend`.

---
### 1️⃣ Static analysis – lint, typings, and test coverage

| Step | Command (run in `frontend`) | Goal / What to look for |
|------|-----------------------------|------------------------|
| 1.1 | `npm run lint` | Ensure ESLint (Next.js config) passes without warnings. Pay particular attention to:
- `no-unused-vars` (unused imports or state)
- `react-hooks/exhaustive-deps` (missing dependency arrays)
- `react/jsx-no-comment-textnodes` (comments inside JSX) |
| 1.2 | `npm run build` (or `next build`) | Runs the TypeScript compiler and Next.js bundler. Verify there are **no type errors** and that the production build succeeds. |
| 1.3 | `npm run test:coverage` | Run the Jest test suite with coverage. Verify that **overall coverage ≥ 80 %** and that critical files (`FormRenderer`, `api.ts`, `FormBuilder`) have **branch coverage ≥ 70 %**. |
| 1.4 | Review failing or flaky tests (if any) and add missing cases. Typical gaps to fill:
- Validation of `conditional_required` with non‑numeric values (string comparison)
- File‑size validation edge case (exactly 5 MB)
- Error handling for API failure paths (`submitForm` network error) |

---
### 2️⃣ Code quality – patterns, typings, and security

| Area | Files to inspect | Checklist |
|------|------------------|-----------|
| **Type safety** | `src/lib/api.ts`, `src/components/**/*.tsx` | • All exported functions use explicit return types. \n• No `any` or implicit `unknown` in public signatures. \n• `FormRenderer`’s generic `Record<string, unknown>` is appropriate – consider narrowing to `Record<string, string \| number \| boolean>` if the backend guarantees it. |
| **Conditional validation logic** | `src/components/FormRenderer.tsx` (lines 49‑76) | • Logic is pure – could be extracted to `utils/validation.ts` for re‑use and unit testing. \n• Add JSDoc comments describing supported operators. |
| **Cookie handling** | `src/lib/api.ts` (functions `getCookie`, `setCookie`, `deleteCookie`) | • `SameSite=Strict` is set, but consider adding `Secure` flag for HTTPS environments. \n• Document that these helpers are client‑only (SSR guard already present). |
| **Axios interceptors** | `src/lib/api.ts` (lines 28‑52) | • Ensure the interceptor returns the config unmodified on success. \n• Verify the error interceptor correctly redirects only when `window` exists. |
| **Inline styling** | All component files (`Navbar.tsx`, `FormRenderer.tsx`, `FormBuilder.tsx`) | • Inline `style` objects are numerous. Prefer Tailwind utility classes (already in use) or a CSS module to keep JSX clean. \n• Ensure no duplicated style objects across components. |
| **Key props & list rendering** | `FormRenderer` (field list), `Navbar` (navLinks) | • `key={field.id}` and `key={link.href}` are correct. Verify that `field.id` is **stable** (comes from backend). |
| **Error messages** | `FormRenderer` (error rendering) | • All user‑visible strings are hard‑coded; consider moving to a `messages.ts` file for localisation. |
| **Security** | `src/lib/api.ts` (cookie handling, token injection) | • Tokens are stored in cookies rather than `localStorage`, which mitigates XSS. \n• Ensure cookies are marked `HttpOnly` on the server side (outside of this repo). |

---
### 3️⃣ Runtime verification – UI, accessibility, and responsiveness

| Step | Action | Expected outcome |
|------|--------|--------------------|
| 3.1 | **Start dev server**: `npm run dev` and open `http://localhost:3000` | All pages (`/login`, `/register`, `/forms`, `/admin/*`) load without console errors. |
| 3.2 | **Responsive check** – Resize browser or use Chrome DevTools device toolbar (mobile, tablet, desktop). Verify:
- Navigation bar collapses gracefully (no overflow).
- Form fields stretch to container width on small screens. |
| 3.3 | **Accessibility audit** – Run `npm exec axe` (or `npx playwright test --project=chromium --headed` with axe‑core) on each page. Look for:
- Missing `<label>` `htmlFor` on non‑checkbox inputs.
- Color contrast ≥ 4.5:1 for text vs. background (e.g., error red on white).
- Role attributes for buttons and form fields. |
| 3.4 | **Keyboard navigation** – Tab through each page. Ensure focus order follows visual order, and that interactive elements (links, buttons) receive a visible focus ring. |
| 3.5 | **Form submission flow** – Use the UI to:
1. Create a new form via `/admin/forms/create`. \n2. Fill out the rendered form (including conditional required fields). \n3. Submit and verify the success banner appears. \n4. Simulate an API failure by disabling network (Chrome DevTools) and ensure the error banner displays. |
| 3.6 | **File upload validation** – Attempt to upload a file > 5 MB and a disallowed MIME type. Confirm the inline validation messages appear. |
| 3.7 | **Cross‑browser check** – At least test in Chrome and Edge (Windows) to catch any CSS‑specific issues. |

---
### 4️⃣ Documentation & maintainability

| Item | Recommendation |
|------|----------------|
| **README / onboarding** | Verify the top‑level `README.md` in `frontend` lists required environment variables (e.g., `NEXT_PUBLIC_API_URL`). |
| **Component docs** | Add brief JSDoc comment blocks to exported components (`Navbar`, `FormRenderer`, `FormBuilder`) describing props and side‑effects. |
| **Testing guide** | Include a `CONTRIBUTING.md` section that explains how to run the test suite (`npm test`, `npm test:watch`) and how to generate coverage reports. |
| **Changelog** | Ensure each commit that touches UI/validation updates the changelog with a concise entry. |

---
### 5️⃣ Optional enhancements (post‑review)

1. **Extract validation utils** – Move `evaluateConditional` and the file‑size/type checks into `src/utils/validation.ts`. Add unit tests for those utilities.
2. **Theme consistency** – Replace inline color values (`var(--color-gold)`, `var(--color-ink-400)`) with Tailwind design tokens to enforce a single source of truth.
3. **Error boundary** – Wrap the main `<App>` component with an error boundary to catch unexpected render errors.
4. **SSR cookie handling** – Consider using Next.js middleware to set auth cookies server‑side (adds extra protection).

---
### How to proceed
1. Follow the **Static analysis** steps first; fix any lint/type/test failures before moving on.
2. Run the **Runtime verification** checklist manually; capture screenshots of any failures.
3. Address any **code‑quality** items that surface (inline styles, missing ARIA, security flags).
4. Update documentation as needed and commit incremental fixes (one logical change per PR).

If you encounter blockers (e.g., failing tests you cannot reproduce) or have specific concerns you’d like to prioritize, let me know and we can adjust the plan accordingly.
