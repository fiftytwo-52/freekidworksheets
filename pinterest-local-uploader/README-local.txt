PINTEREST LOCAL UPLOADER FOR FREEKIDWORKSHEETS
=================================================
Post pins to your Pinterest account directly from this repository.
Works in any terminal or with AI agents (Antigravity, Roo Code, Cline).

FILES
  auth_local.py        - one-time login (run only if token expires)
  pin_local.py         - post worksheets, plan uploads, check status
  pinned_history.json  - tracks uploaded worksheets (prevents duplicate pins)
  AGENT.md             - instructions and hard rules for AI agents

WORKFLOW 1: POST A SINGLE WORKSHEET BY CODE
  python3 pin_local.py worksheet --code 4070
    - Finds the worksheet and image in src/content/worksheets/
    - Auto-formats SEO title (<= 100 chars)
    - Auto-formats description with keywords, hashtags, and website credit
    - Auto-routes to correct board (e.g. Nepali Worksheets for Nepali sheets)
    - Sets destination link to https://freekidworksheets.com/worksheet/<slug>
    - Records upload in pinned_history.json

  Test first without posting:
    python3 pin_local.py worksheet --code 4070 --dry-run

WORKFLOW 2: PLAN & BATCH UPLOAD
  1. Preview what to upload:
       python3 pin_local.py plan --limit 5
       python3 pin_local.py plan --lang ne --limit 10 --csv queue.csv
       python3 pin_local.py plan --category "Alphabet & Tracing" --limit 5
  2. Review the plan.
  3. Post the batch:
       python3 pin_local.py batch --csv queue.csv

WORKFLOW 3: CHECK ACCOUNT & REPO STATUS
  python3 pin_local.py status
    - Shows Pinterest follower count, monthly views, pin count
    - Shows total worksheets in repo (481) vs pinned vs unpinned

WORKFLOW 4: LIST BOARDS
  python3 pin_local.py boards

BOARD ROUTING (AUTOMATIC)
  - Nepali sheets (language: ne)        -> Nepali Worksheets (1127096312935264006)
  - Tracing sheets (Alphabet & Tracing) -> Line Tracing Activities (1127096312935308490)
  - Coloring / Math / Writing / Other   -> Fun Worksheets For Kids (1127096312935335073)
  Override any board with: --board <BOARD_ID>

NOTE ON ACCESS
  Your account has Standard (Production) access. Production is enabled by default.
  If you ever need sandbox testing, add --sandbox.
