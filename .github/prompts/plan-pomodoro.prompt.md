## Pomodoro Focus Session Plan (VOID Learning Manager)

Objective: Add a robust Pomodoro-style focus session system to the Learning Manager for spaced focus blocks and break cycles.

### Data model additions
- `FocusSession` type:
  - id: string
  - mode: 'work' | 'shortBreak' | 'longBreak'
  - duration: number (minutes)
  - startedAt: string (ISO)
  - pausedAt?: string
  - remainingMs: number
  - cycle: number
  - completed: boolean

- Add property in app state:
  - `focusSessions: FocusSession[]`
  - `activeFocusSessionId?: string`
  - `focusPreferences` (work/minutes, shortBreak/minutes, longBreak/minutes, cyclesUntilLongBreak)

### Store / context methods (`DataContext.tsx`)
- `startFocusSession(options?)`
- `pauseFocusSession()`
- `resumeFocusSession()`
- `stopFocusSession()`
- `completeFocusSession()`
- `advanceFocusCycle()`
- `loadFocusState()` / `saveFocusState()` (localStorage)

### Hook (`useTimer.ts`)
- `useTimer` returns:
  - `isRunning`, `remainingMs`, `durationMs`, `mode`, `cycle`, `isCompleted`, `progress`
  - `start(durationMs, mode)`, `pause()`, `resume()`, `reset()`, `tick()`

- Behavior:
  - `setInterval` 1s while running
  - `remainingMs = target - Date.now()`
  - if `remainingMs <= 0`: complete block -> callback
  - handle `visibilitychange` to re-sync

### UI Implementation
- New screen: `FocusView.tsx` (or dashboard widget)
- Components:
  - Timer display (MM:SS)
  - Mode badge: Work/Short Break/Long Break
  - Cycle tracker: 1/4, 2/4, ...
  - Buttons: Start/Pause/Resume/Stop/Skip
  - Quick presets: 25/5, 50/10, custom
  - Progress ring (conic gradient) + color by mode
  - Completed sessions + total focus minutes
  - Toast/popups on session end

### UX Principles
- Auto-transition if user chooses (work->short break->..->long break)
- Ask before auto-start next segment (optional setting)
- support keyboard shortcuts (Space toggle)
- optional sound/vibration
- clear next action: "Start break" / "Start work"
- logging metrics for analytics/time spent

### Integration points
- Existing `AnalyticsView` add focus stats (focus minutes, completed sessions, avg efficiency)
- `DashboardView` card with todays focus + fast-start
- `NotesView` / `CoursePlayerView` offer "Start focus session for this note/course"

### Persistence
- Save current `FocusSession` and preferences in local storage and context state.
- recover state across reloads

### Optional features
- Task linking (session tied to a note or course module)
- Interruptions counter
- break extensions
- tree view history (calendar heatmap)

### Steps to implement now
1. add store types and methods
2. add `useTimer` hook
3. add `FocusView` UI with controls + style
4. add integration to dashboard and APIs
5. add analytics and persistence
6. run lint, manual test cycle, and commit

### Commit message
`feat(focus): add Pomodoro-style focus sessions with timer and analytics`
