 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a//dev/null b/adventure.md
index 0000000000000000000000000000000000000000..2b89ee5aad971fc60bbc2c7c1df485a493110ecd 100644
--- a//dev/null
+++ b/adventure.md
@@ -0,0 +1,40 @@
+# Library of Whispers
+
+## [start] The Echoing Atrium
+Moonlight pools across ancient tiles as you stand in the grand atrium of a forgotten library. Whispered voices slide between the shelves, promising answers to questions you never knew you had.
+
+- [Examine the glowing book on the pedestal](book)
+- [Follow the whispers into the archives](whispers)
+
+## [book] The Grimoire's Secret
+A leather-bound tome pulses with silver light. As you open it, swirling script rearranges itself to greet you. The book offers power—but at a cost.
+
+- [Speak the luminous phrase aloud](portal)
+- [Close the book and step away](start)
+
+## [whispers] Trail of Echoes
+The whispers guide you past leaning ladders and ink-stained tables. A hidden door creaks open, revealing pathways branching toward light and shadow.
+
+- [Descend the hidden staircase into darkness](shadow)
+- [Climb the spiral stairs toward the observatory](observatory)
+
+## [portal] Between Worlds
+Silver glyphs ignite around you. A doorway of light yawns wide and pulls you through shimmering constellations. You glimpse endless libraries spread across the stars. At last, the pull fades and you awake at your desk, the memory lingering like a dream fulfilled.
+
+## [shadow] Shadowed Guardian
+You enter a hall where darkness moves like water. A towering shadow unfurls, revealing eyes like smoldering coals. It waits, patient and unreadable.
+
+- [Offer the ribbon bookmark you carry](alliance)
+- [Retreat carefully back to the atrium](start)
+
+## [observatory] Moonlit Observatory
+At the top of the tower, you find a glass-domed observatory bathed in moonlight. Dusty instruments line the room, and a signal lantern rests near an open window.
+
+- [Signal across the city with the lantern](rescue)
+- [Return quietly to the atrium](start)
+
+## [alliance] Keeper of Secrets
+The shadow accepts the ribbon and weaves it into its form. In return, it grants you safe passage and a secret word that will open any locked door in the library. The whispers now answer when you call. Your nights are no longer lonely.
+
+## [rescue] Beacon of Dawn
+You swing the lantern, sending a beam sweeping across the skyline. Moments later, a flock of luminous owls appears, each carrying a rolled scroll. The archivists have seen your signal—they welcome you as the new guardian of the library's stories.
 
EOF
)
