 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/README.md b/README.md
index 1d9937de8d0dd685c57510804f81be8db022a40a..b0e2aabc2acb8f98b30893071ac0d94258330832 100644
--- a/README.md
+++ b/README.md
@@ -1,11 +1,26 @@
 # codextest
 
 This is a test repository for demonstrating GitHub functionality.
 
 ## Description
 
 A simple repository to test various GitHub features and workflows.
 
 ## Getting Started
 
-This repository serves as a basic example for learning Git and GitHub operations.
+This repository now includes a small interactive choose-your-own-adventure web
+app. The original markdown story is stored in `adventure.md`, and the
+`index.html`/`app.js` pair turns it into a button-driven experience you can play
+in the browser.
+
+## Playing the adventure
+
+1. Start a local web server from the project root (this avoids browser security
+   restrictions when loading the markdown file):
+
+   ```bash
+   python3 -m http.server 8000
+   ```
+
+2. Visit <http://localhost:8000> in your browser and open `index.html`.
+3. Click the buttons to explore every branch of **Library of Whispers**.
 
EOF
)
