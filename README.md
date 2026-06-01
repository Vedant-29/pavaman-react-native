# pavaman-react-native

The employee-side mobile app for Pavaman — a field-workforce
management product. A field employee signs in, sees the tasks
assigned to them for any date, navigates to each task's location on
the map, marks tasks done, and pings their current GPS coordinates
back so their admin can see where they are. Companion to the
[pavaman-web](https://github.com/Vedant-29/pavaman-web) admin
console.

Built on Expo SDK 51 + expo-router + React Native 0.74 + Supabase.

## Table of contents

1. [What this builds](#what-this-builds)
2. [Architecture](#architecture)
3. [Supabase schema](#supabase-schema)
4. [Routes](#routes)
5. [Setup](#setup)
6. [Running on device](#running-on-device)
7. [Repository tour](#repository-tour)

---

## What this builds

A single Expo app that does five things from the field employee's
perspective:

- **Auth-gated shell.** The root layout subscribes to
  `supabase.auth.onAuthStateChange`. While signed out it renders the
  `Auth` screen (email signup / signin); while signed in it switches
  to the tabbed expo-router stack. Sign-up writes a fresh row into
  `employee_users` keyed on the auth user id.
- **Today's tasks (Home tab).** A `react-native-maps` `MapView` fills
  the top of the screen, a Gorhom bottom-sheet rides over it with the
  task list at four snap points (25 / 50 / 75 / 90 %). The list is
  status-filtered ("To complete" / "Completed") and date-filtered via
  a `@react-native-community/datetimepicker` calendar. Tapping a task
  flies the map to its `latitude` / `longitude` and snaps the sheet
  to its compact size.
- **Task actions.** Tap the map icon on a row to deep-link out to
  Google Maps via the task's `location_map_link`. Tap the edit icon
  to open a status-change modal that updates `employee_tasks.status`
  in Supabase — the same row the admin sees in the web console.
- **GPS ping.** A "Send Location" action requests foreground location
  permission via `expo-location`, reads the current `coords`, and
  writes `latitude` + `longitude` to the signed-in user's
  `employee_users` row. That's what powers the admin's cluster map.
- **Profile tab.** Reads the signed-in employee's
  `employee_users` row (by `employee_id = session.user.id`) and shows
  name, email, phone, bio.

## Architecture

```
                  ┌──────────────────────────────────┐
                  │         RootLayout               │
                  │  ┌────────────────────────────┐  │
                  │  │  supabase.auth.            │  │
                  │  │  onAuthStateChange         │  │
                  │  └──────────┬─────────────────┘  │
                  │             │                    │
                  │       session?  ── no ──► <Auth/>│ (components/Auth.tsx)
                  │             │                    │
                  │             ▼  yes               │
                  │   GestureHandlerRootView         │
                  │   ┌────────────────────────┐    │
                  │   │ expo-router Stack       │    │
                  │   │   (tabs)/_layout        │    │
                  │   │     ├── index  Home     │    │
                  │   │     └── explore Profile │    │
                  │   └─────────────────────────┘    │
                  └──────────────────────────────────┘

   Home tab (app/(tabs)/index.jsx):
       MapView ──┐
                 │  task pins from employee_tasks
       BottomSheet (Gorhom)
            ├── date picker  (DateTimePicker)
            ├── status tabs  ("To complete" / "Completed")
            ├── task list    (renderItem with map/edit icons)
            └── status-change modal (writes employee_tasks.status)

       "Send Location" button
            └── expo-location → writes employee_users.latitude/longitude

   Profile tab (app/(tabs)/explore.jsx):
       UserProfile from employee_users (where employee_id = session.user.id)
```

**Module responsibilities:**

| Module | Responsibility |
|---|---|
| `lib/supabase.ts` | Single `createClient` instance reading `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` from env, with `AsyncStorage` as the auth store. Wires `AppState` so `startAutoRefresh` / `stopAutoRefresh` follow foreground / background. |
| `app/_layout.tsx` | Splash + font loading, auth subscription, gates the entire UI on `session?.user`. |
| `app/(tabs)/_layout.tsx` | Tab bar with Home and Profile icons + colorscheme-aware tint. |
| `app/(tabs)/index.jsx` | Home: map + bottom sheet + date picker + task list + status modal + GPS-ping. |
| `app/(tabs)/explore.jsx` | Profile: reads the current employee's `employee_users` row. |
| `components/Auth.tsx` | Email signup / signin. On signup, inserts an `employee_users` row keyed to the new `auth.users` id. |
| `components/Accounts.tsx` | Profile-edit form (username, phone). Hits Supabase directly. |
| `components/renderItem.jsx` | Single-task card rendered inside the bottom sheet. |
| `components/ThemedView.tsx`, `ThemedText.tsx`, `Collapsible.tsx`, `HelloWave.tsx`, `ParallaxScrollView.tsx`, `ExternalLink.tsx`, `navigation/TabBarIcon.tsx` | UI primitives carried over from the Expo template. |
| `hooks/useColorScheme.*` | Platform-aware colorscheme hook. |
| `constants/Colors.ts` | Light/dark tint values used by the tab bar. |
| `app-example/` | Original `create-expo-app` template, parked so `npm run reset-project` can restore it. |

## Supabase schema

Tables the mobile app reads or writes (Postgres on Supabase, gated by
RLS). Shared with [pavaman-web](https://github.com/Vedant-29/pavaman-web).

| Table | Purpose | Read by | Written by |
|---|---|---|---|
| `employee_users` | One row per field employee. `employee_id` is the FK to `auth.users.id`. Carries `name`, `email`, `phoneNo`, `bio`, `latitude`, `longitude`. | Profile tab, GPS-ping | signup, GPS-ping, Accounts |
| `employee_tasks` | Tasks assigned to this employee. Carries `assigned_to_id`, `status`, `completion_date`, `latitude`, `longitude`, `location_name`, `location_poc_name`, `location_poc_email`, `location_poc_phoneNo`, `location_map_link`, `description`. | Home tab (filtered by `assigned_to_id` + day range on `completion_date`) | status-change modal (`UPDATE … SET status`) |

## Routes

The app uses expo-router's file-based routing under `app/`.

| Path | Screen | When |
|---|---|---|
| (root) | `RootLayout` | Always mounted; swaps in `<Auth />` if no session. |
| `(tabs)/` | tab bar shell | After sign-in. |
| `(tabs)/index` | Home (today's tasks + map) | Default tab. |
| `(tabs)/explore` | Profile | Second tab. |
| `+not-found` | 404 | Unknown deep links. |

## Setup

### Prerequisites

- **Node.js 18+**
- **Expo CLI** via `npx expo` (no global install required)
- **Supabase project** with the two tables above and RLS policies
- **Google Maps API key** with Android Maps SDK + iOS Maps SDK
  enabled (required by `react-native-maps`)
- For iOS device builds: Xcode + a Mac
- For Android device builds: Android Studio + the platform tools

### 1. Install

```bash
git clone https://github.com/Vedant-29/pavaman-react-native.git
cd pavaman-react-native
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

| Variable | Where to get it |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase dashboard → your project → Settings → API |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Same page. RLS-gated, but still treat as a credential. |
| `GOOGLE_MAPS_ANDROID_API_KEY` | Google Cloud console → APIs & Services → Credentials. Read by `app.json` at build time. |

`EXPO_PUBLIC_*` variables are inlined into the JS bundle by Expo, so
they are visible to anyone who downloads the app — treat the Supabase
anon key as a public identifier and rely on RLS for actual access
control:

- Enforce RLS on `employee_users` and `employee_tasks` so an
  authenticated user can only read / write their own rows.
- Restrict the Google Maps key by Android package name + SHA-1
  fingerprint (and by iOS bundle id) in Google Cloud console before
  going live.

### 3. Permissions

The app requests **foreground location** at runtime via
`expo-location`. Android additionally declares
`ACCESS_BACKGROUND_LOCATION` in `app.json`; if you don't intend to
use background location, remove it before submitting to Play.

## Running on device

```bash
npx expo start              # Metro bundler + QR code
npx expo start --ios        # iOS simulator
npx expo start --android    # Android emulator
npx expo start --web        # web bundler (limited; maps work via Expo Go)
```

Other scripts:

```bash
npm test                    # jest --watchAll via jest-expo preset
npm run lint                # expo lint
npm run reset-project       # moves current app/ to app-example/ and starts blank
```

## Repository tour

```
pavaman-react-native/
├── app.json                            # expo config (name, icons, permissions, GMaps key)
├── babel.config.js
├── tsconfig.json
├── expo-env.d.ts
├── app/                                # expo-router file-based routes
│   ├── _layout.tsx                     # auth gate + splash + fonts
│   ├── +html.tsx                       # web shell
│   ├── +not-found.tsx
│   └── (tabs)/
│       ├── _layout.tsx                 # tab bar
│       ├── index.jsx                   # Home: map + sheet + tasks + GPS
│       └── explore.jsx                 # Profile
├── components/
│   ├── Auth.tsx                        # email signup/signin
│   ├── Accounts.tsx                    # profile edit
│   ├── renderItem.jsx                  # task list row
│   ├── ThemedView.tsx
│   ├── ThemedText.tsx
│   ├── Collapsible.tsx
│   ├── HelloWave.tsx
│   ├── ParallaxScrollView.tsx
│   ├── ExternalLink.tsx
│   └── navigation/
│       └── TabBarIcon.tsx
├── hooks/
│   ├── useColorScheme.ts
│   ├── useColorScheme.web.ts
│   └── useThemeColor.ts
├── constants/
│   └── Colors.ts
├── lib/
│   └── supabase.ts                     # Supabase client + AppState autorefresh
├── assets/
│   ├── images/                         # icon, splash, adaptive-icon, favicon
│   └── fonts/                          # SpaceMono
├── scripts/
│   └── reset-project.js                # parks current app/ as app-example/
└── app-example/                        # original create-expo-app template
```

## License

This project is unlicensed. All rights reserved.
