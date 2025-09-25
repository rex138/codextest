 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a//dev/null b/app.js
index 0000000000000000000000000000000000000000..fa029ed429f2fa51d3d0faa347e0cd4cbbe9ef63 100644
--- a//dev/null
+++ b/app.js
@@ -0,0 +1,318 @@
+const state = {
+  story: null,
+  currentSceneId: null,
+  history: [],
+};
+
+const elements = {};
+
+document.addEventListener('DOMContentLoaded', () => {
+  elements.storyTitle = document.getElementById('story-title');
+  elements.sceneTitle = document.getElementById('scene-title');
+  elements.sceneText = document.getElementById('scene-text');
+  elements.choices = document.getElementById('choices');
+  elements.endingBanner = document.getElementById('ending-banner');
+  elements.endingText = elements.endingBanner?.querySelector('.scene__ending-text');
+  elements.backButton = document.getElementById('back-button');
+  elements.restartButton = document.getElementById('restart-button');
+
+  if (elements.backButton) {
+    elements.backButton.addEventListener('click', handleBack);
+  }
+
+  if (elements.restartButton) {
+    elements.restartButton.addEventListener('click', restartStory);
+    elements.restartButton.disabled = true;
+  }
+
+  preloadAdventure();
+});
+
+async function preloadAdventure() {
+  updateScenePlaceholder('Loading adventure…');
+  try {
+    const response = await fetch('adventure.md');
+    if (!response.ok) {
+      throw new Error(`Unable to load adventure (status ${response.status}).`);
+    }
+
+    const markdown = await response.text();
+    const story = parseAdventure(markdown);
+    state.story = story;
+    elements.storyTitle.textContent = story.title;
+    restartStory();
+  } catch (error) {
+    displayError(error);
+  }
+}
+
+function parseAdventure(markdown) {
+  const lines = markdown.split(/\r?\n/);
+  let title = 'Interactive Adventure';
+  const scenes = {};
+  let currentScene = null;
+  let startSceneId = null;
+
+  for (const rawLine of lines) {
+    const line = rawLine.trimEnd();
+
+    if (!line.trim()) {
+      if (currentScene) {
+        currentScene.rawLines.push('');
+      }
+      continue;
+    }
+
+    if (line.startsWith('# ')) {
+      if (title === 'Interactive Adventure') {
+        title = line.slice(2).trim() || title;
+      }
+      continue;
+    }
+
+    if (line.startsWith('## ')) {
+      if (currentScene) {
+        finalizeScene(currentScene);
+      }
+      const header = line.slice(3).trim();
+      const match = header.match(/^\[(.+?)\]\s*(.*)$/);
+      if (!match) {
+        throw new Error(`Scene header is missing an [id]: "${line}"`);
+      }
+      const id = match[1].trim();
+      const sceneTitle = (match[2] && match[2].trim()) || id;
+      if (!id) {
+        throw new Error(`Scene header must include a non-empty id: "${line}"`);
+      }
+      if (scenes[id]) {
+        throw new Error(`Duplicate scene id detected: "${id}"`);
+      }
+      currentScene = {
+        id,
+        title: sceneTitle,
+        rawLines: [],
+        choices: [],
+      };
+      scenes[id] = currentScene;
+      if (!startSceneId) {
+        startSceneId = id;
+      }
+      continue;
+    }
+
+    if (!currentScene) {
+      continue;
+    }
+
+    const choiceMatch = line.trim().match(/^- \[(.+?)\]\((.+?)\)$/);
+    if (choiceMatch) {
+      const choiceText = choiceMatch[1].trim();
+      const targetId = choiceMatch[2].trim();
+      currentScene.choices.push({
+        label: choiceText,
+        target: targetId,
+      });
+    } else {
+      currentScene.rawLines.push(line.trim());
+    }
+  }
+
+  if (currentScene) {
+    finalizeScene(currentScene);
+  }
+
+  if (!startSceneId) {
+    throw new Error('No scenes were found in the adventure markdown.');
+  }
+
+  return {
+    title,
+    scenes,
+    startSceneId,
+  };
+}
+
+function finalizeScene(scene) {
+  const paragraphs = [];
+  let buffer = [];
+
+  for (const line of scene.rawLines) {
+    if (!line.trim()) {
+      if (buffer.length) {
+        paragraphs.push(buffer.join(' '));
+        buffer = [];
+      }
+      continue;
+    }
+    buffer.push(line.trim());
+  }
+
+  if (buffer.length) {
+    paragraphs.push(buffer.join(' '));
+  }
+
+  scene.body = paragraphs;
+  delete scene.rawLines;
+}
+
+function renderScene(sceneId) {
+  if (!state.story) {
+    return;
+  }
+
+  const scene = state.story.scenes[sceneId];
+  if (!scene) {
+    showMissingScene(sceneId);
+    return;
+  }
+
+  state.currentSceneId = sceneId;
+
+  elements.sceneTitle.textContent = scene.title;
+  elements.sceneText.innerHTML = scene.body
+    .map((paragraph) => `<p>${formatInline(paragraph)}</p>`)
+    .join('');
+
+  elements.choices.innerHTML = '';
+
+  if (scene.choices.length) {
+    elements.endingBanner.hidden = true;
+    for (const choice of scene.choices) {
+      const button = document.createElement('button');
+      button.type = 'button';
+      button.className = 'scene__choice-button';
+      button.textContent = choice.label;
+      button.addEventListener('click', () => moveToScene(choice.target));
+      elements.choices.appendChild(button);
+    }
+  } else {
+    elements.endingBanner.hidden = false;
+    if (elements.endingText) {
+      elements.endingText.innerHTML = `<strong>${escapeHtml(
+        scene.title
+      )}</strong> — this path reaches its conclusion.`;
+    }
+    const message = document.createElement('div');
+    message.className = 'scene__warning';
+    message.innerHTML =
+      'No further choices remain on this path. Use <strong>Restart</strong> to begin again or go back to explore another branch.';
+    elements.choices.appendChild(message);
+  }
+
+  updateNavigation();
+  requestAnimationFrame(() => {
+    if (scene.choices.length) {
+      const firstButton = elements.choices.querySelector('button');
+      if (firstButton) {
+        firstButton.focus();
+      }
+    } else if (elements.restartButton) {
+      elements.restartButton.focus();
+    }
+  });
+}
+
+function moveToScene(targetId) {
+  if (!state.story || !targetId) {
+    return;
+  }
+
+  if (!state.story.scenes[targetId]) {
+    showMissingScene(targetId);
+    return;
+  }
+
+  if (state.currentSceneId) {
+    state.history.push(state.currentSceneId);
+  }
+  renderScene(targetId);
+}
+
+function restartStory() {
+  if (!state.story) {
+    return;
+  }
+
+  state.history = [];
+  elements.backButton.disabled = true;
+  if (elements.restartButton) {
+    elements.restartButton.disabled = false;
+  }
+  renderScene(state.story.startSceneId);
+}
+
+function handleBack() {
+  if (!state.story || state.history.length === 0) {
+    return;
+  }
+  const previousScene = state.history.pop();
+  renderScene(previousScene);
+}
+
+function updateScenePlaceholder(message) {
+  elements.sceneTitle.textContent = '';
+  elements.sceneText.innerHTML = `<p>${escapeHtml(message)}</p>`;
+  elements.choices.innerHTML = '';
+  elements.endingBanner.hidden = true;
+  if (elements.restartButton) {
+    elements.restartButton.disabled = true;
+  }
+  if (elements.backButton) {
+    elements.backButton.disabled = true;
+  }
+}
+
+function displayError(error) {
+  console.error(error);
+  elements.storyTitle.textContent = 'Adventure unavailable';
+  elements.sceneTitle.textContent = 'Something went wrong';
+  elements.sceneText.innerHTML = `<p class="scene__warning">${escapeHtml(
+    error.message
+  )}</p>`;
+  elements.choices.innerHTML = '';
+  elements.endingBanner.hidden = true;
+  if (elements.restartButton) {
+    elements.restartButton.disabled = true;
+  }
+  if (elements.backButton) {
+    elements.backButton.disabled = true;
+  }
+}
+
+function updateNavigation() {
+  if (!elements.backButton) {
+    return;
+  }
+  elements.backButton.disabled = state.history.length === 0;
+}
+
+function showMissingScene(sceneId) {
+  const safeId = escapeHtml(sceneId);
+  elements.sceneTitle.textContent = 'Path unavailable';
+  elements.sceneText.innerHTML =
+    '<p>The selected path points to a scene that does not exist.</p>';
+  elements.choices.innerHTML = '';
+  const warning = document.createElement('div');
+  warning.className = 'scene__warning';
+  warning.innerHTML = `Scene <code>${safeId}</code> could not be found. Use Back or Restart to continue.`;
+  elements.choices.appendChild(warning);
+  elements.endingBanner.hidden = true;
+  updateNavigation();
+}
+
+function escapeHtml(value) {
+  return value
+    .replace(/&/g, '&amp;')
+    .replace(/</g, '&lt;')
+    .replace(/>/g, '&gt;')
+    .replace(/"/g, '&quot;')
+    .replace(/'/g, '&#39;');
+}
+
+function formatInline(text) {
+  const escaped = escapeHtml(text);
+  return escaped
+    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
+    .replace(/\*(.+?)\*/g, '<em>$1</em>')
+    .replace(/`(.+?)`/g, '<code>$1</code>');
+}
 
EOF
)
