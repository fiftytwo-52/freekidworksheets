PINTEREST LOCAL UPLOADER
=========================
Post pins to your Pinterest account from your own computer.
Works with Roo Code, Cline, Gemini CLI, or any terminal in Antigravity.

FILES
  auth_local.py  - one-time login (run once)
  pin_local.py   - post pins (use daily)

SETUP (5 minutes, one time)
  1. In your Pinterest app settings (developers.pinterest.com -> My apps ->
     freekidworksheets -> Manage -> Redirect URIs), make sure this is listed:
         http://localhost:8085/callback
  2. Open a terminal in the folder with these files and run:
         python3 auth_local.py
     - Enter your App ID (1616080) and App secret when asked.
       They are saved to ~/.pinterest/config.json on YOUR machine only.
     - Your browser opens Pinterest: approve access for your own account.
     - Done. Token is saved to ~/.pinterest/token.json (auto-refreshes).

USE
  python3 pin_local.py boards
      List your boards and their IDs.

  python3 pin_local.py post --image worksheets/butterfly.png \
      --board 1127096312935335073 \
      --title "Butterfly Worksheet (Free Printable)" \
      --description "Free printable butterfly worksheet for preschool kids..." \
      --link "https://freekidworksheets.com"
      Post one pin. --image accepts a local file or a public image URL.

  python3 pin_local.py batch --csv queue.csv
      Post many pins at once. CSV columns: image,title,description,link,board

  python3 pin_local.py me
      Verify the login still works.

WITH ROO CODE / CLINE / GEMINI CLI
  These agents can run terminal commands, so just tell them in plain words,
  for example:
    "Post butterfly.png as a pin to my Fun Worksheets board with this
     title and description, linking to freekidworksheets.com"
  They will run pin_local.py with the right arguments. They never see your
  App secret or token - those stay in ~/.pinterest on your machine.

IMPORTANT
  - While your app has Trial access, pins go to the SANDBOX: they are created
    but only visible to you. Reads (boards, me) work normally.
  - After Pinterest approves Standard access, add --prod to post/batch
    commands and pins go public on your real account.
  - If a command says the token stopped working, just run
    python3 auth_local.py again.
  - Never share ~/.pinterest/ or paste your App secret into a chat.
