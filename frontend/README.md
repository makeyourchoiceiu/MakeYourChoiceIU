## README & Architecture Document

### MakeYourChoiceIU – Frontend

#### Overview
The frontend is a single‑page application built with **React** and **TypeScript**, serving two primary user roles:

- **Admin** – manage electives (CRUD), configure programs/tracks/streams, and view semester data.
- **Student** – browse available electives, search, favourite, and submit priority‑based choices.

The application communicates with a Django REST API (backend) via Axios, and stores session data in `localStorage`.

---

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Language | TypeScript |
| Build Tool | Vite |
| Routing | React Router DOM 6 |
| HTTP Client | Axios |
| State (UI) | Zustand (filters) |
| State (Auth) | React Context + `localStorage` |
| Styling | Tailwind CSS 4 |
| Component Logic | React Hooks |
| Internationalisation | i18next (English/Russian) |
| Notifications | react‑hot‑toast |
| Markdown Rendering | react‑markdown + remark‑gfm |
| API Schema | openapi‑typescript (auto‑generated) |

---

### Project Structure

```
src/
├── app/               # i18n, routing, global setup
├── features/          # Feature-based modules (auth, electives, enrollment, profile)
├── hooks/             # Global custom hooks
├── pages/             # Route pages (Login, Electives, Admin)
├── shared/            # Cross-cutting code: API, components, contexts, layouts, types, utils
├── stores/            # Zustand stores (filters, profile)
├── App.tsx
├── index.css
└── main.tsx
```

---

### Core Flows

#### 1. Authentication
- User enters email on `/login`.
- Frontend calls `GET /api/auth/email?email=...`.
- Backend returns a payload containing `role` and either admin‑specific (`all_electives`) or student‑specific (`student_data`).
- The response is mapped to an `AuthSession` object and stored in `localStorage` (key `myc-auth-session`).
- `useAuth` hook exposes `session`, `isLoading`, `isAdminMode`, `isStudentMode`, and `login`/`logout` functions.
- On page reload, the session is restored from `localStorage`; if missing, the user is redirected to `/login`.

**Role handling:**
- `admin` – only admin pages (effectiveMode = `'admin'`).
- `student` – only student pages (effectiveMode = `'student'`).
- `admin‑student` – defaults to admin mode, but can toggle to student mode via the header button. The `effectiveMode` is stored in the session and used to decide which page to render.

---

#### 2. Student Elective Submission
1. **Sidebar** shows navigation buttons (`main_menu`, `tech`, `hum`, `math`). When a type is clicked:
    - The filter store’s `typeFilter` is updated.
    - The `Sidebar` clears its selected IDs (via `useEffect`).
    - The main electives list re‑renders, showing only electives of the chosen type (because `useFilteredElectives` respects `typeFilter`).
2. **Dropdowns** – five `<select>` elements display electives from the current `activeType` (filtered from `sidebarElectives`).
3. **Validation** on submit:
    - At least one elective selected.
    - No duplicate IDs.
    - All selected electives must have the same `backendType` (to ensure they belong to the same grouping, e.g. all `"Core"`).
4. **Submission** – the parent (`ElectivesPage`) receives `(selectedIds, backendType)` and calls `useElectiveSubmission`:
    - Converts `selectedIds` to `{ priority, elective_id }` objects.
    - Sends `POST /api/me/submissions` with `student_id`, `iteration_id`, `elective_type` (the `backendType`), and the list.
    - Displays a toast on success/error and clears the selections on success.

---

#### 3. Admin Electives Management
- **Full catalog** – fetched via `GET /api/electives/` (with filters for status).
- **CRUD operations** – create, edit, archive, restore, soft‑delete.
- **Markdown description** – rendered with `react‑markdown`.
- **Search and filters** – search by title, filter by status, type, language.
- **Excel export** – (not yet implemented on backend, but frontend button exists).

---

### State Management Strategy

- **Authentication** – React Context (`AuthContext`) + `localStorage`. This is the single source of truth for session data. All components that need user data use `useAuth`.
- **Filters** – Zustand store (`electiveFilterStore`). Includes `searchTerm`, `languageFilter`, `formatFilter`, `typeFilter`. Filters are persisted only in memory; they reset on page reload (except `typeFilter` which defaults to `'tech'`). URL sync is implemented via `useSyncElectiveFilters` (reads/writes query params).
- **Favorites** – stored in a separate Zustand store (`useFavorites`) that uses `localStorage` as persistence (key `myc-favorites`). This is per student (identified by email).
- **Submission loading state** – managed locally inside `useElectiveSubmission` to disable buttons and show a loading indicator.

---

### API Integration

All API calls use Axios. The base URL is configured via Vite proxy (in development) or Nginx (in production). CSRF token handling: the `getCsrfToken()` utility reads the token from the `csrftoken` cookie and adds it to the `X-CSRFToken` header for state‑changing requests.

#### DTO Mappers
- `dtoToElective` – maps backend `Elective` schema to frontend `Elective` model, converting fields like `elective_type` → `type` (shortened) and storing the original as `backendType`.
- `dtoToAuthSession` – maps the three possible auth response shapes into a unified `AuthSession`.
- `flattenAvailableElectives` – converts grouped available electives into a flat array and propagates `backendType`.
- `flattenChosenElectives` – converts chosen electives into a flat array for display.

#### Error Handling
- API calls throw exceptions; toasts are shown in the UI.
- Network errors or validation errors (e.g., `400`) display the error message from the backend or a generic message.
- Unauthorised (401) – not currently handled, as the backend does not use session cookies; authentication is stateless (email‑only).

---

### Internationalisation (i18n)

- `i18next` with `react-i18next`.
- Supported languages: English (default) and Russian.
- Translation files are located in `src/app/i18n/locales/`.
- Language detection: by default, the browser language is used. A toggle in the header allows manual switching (stored in `localStorage`).
- All user‑facing text is wrapped with `t('key')`. Keys are organised by component or feature (e.g., `sidebar.toast.success`).

---

### Development & Deployment

#### Local Development
1. Copy `.env.example` to `.env`: `cp .env.example .env`.
2. Install dependencies: `npm install`.
3. Run the development server: `npm run dev` (Vite will proxy API requests to `http://localhost:8000`).
4. For backend integration, ensure the Django server is running (`docker-compose up`).

#### Production Build
- `npm run build` produces a static build in `dist/`.
- The Dockerfile uses a multi‑stage build:
    - `node` stage – builds the app.
    - `nginx` stage – serves the built files with a custom configuration (SPA routing support).

#### Environment Variables
- `VITE_API_BASE` – (optional) base URL for API requests. Defaults to `/api` (proxied).

#### Available Scripts
- `npm run dev` – start dev server.
- `npm run build` – build for production.
- `npm run preview` – preview production build locally.
- `npm run gen:api` – regenerate OpenAPI types from the backend’s OpenAPI schema (`http://localhost:8000/openapi.json`).

---

### Future Improvements
- Add proper 401 handling (auto‑redirect to login if session expired).
- Implement real pagination for the electives list.
- Complete admin pages for `ProgramSettings`, `Exceptions`, and `SemesterManagement` (currently partially implemented with mocks).
- Add support for uploading Excel files for electives import.
- Improve responsive design for mobile devices.

---

### Contributing
- Follow the existing folder structure and naming conventions.
- Use TypeScript for all new code.
- Keep components small and focused; reuse existing hooks.
- Update translation files when adding new UI text.
- Write self‑contained PR descriptions and include testing steps.

---

This document provides a comprehensive guide to the frontend architecture. For any questions, please refer to the code comments or reach out to the development team.