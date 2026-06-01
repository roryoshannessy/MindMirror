# MindMirror Engine Spec

Last updated: June 1, 2026

Purpose: define what the MindMirror engine should do, based on competitor functionality, user pain, and the product wedge: **show people the thought patterns they keep repeating but are not changing.**

This is a product/engine map, not an implementation commitment. Use it to decide what to build next without getting lost.

Source notes checked June 1, 2026:

- [Rosebud pricing/help](https://help.rosebud.app/getting-started/pricing) and [Rosebud press kit](https://help.rosebud.app/about-us/press-kit) describe voice journaling, long-term memory, Ask Rosebud, entry reflection, auto-tagging, weekly reports, intelligent pattern recognition, guided journals, habit tracking, and smart notifications.
- [Mindsera](https://www.mindsera.com/) describes writing, speaking, scanning physical journals, emotion analysis, guided frameworks, and long-term insights.
- [Stoic features](https://www.getstoic.com/features) describe journaling, mood/progress tracking, smart reminders, goals, and daily reflection tools.
- [Day One features](https://dayoneapp.com/features/) describe text/photo/video/audio journaling, voice transcription, smart camera scanning, cross-device journaling, and privacy positioning.

## Core Product Principle

MindMirror should be the easiest way to:

1. Capture what is on your mind.
2. See the recurring loop.
3. Remember why you were taking action.
4. Take one next step without guilt.

Competitors often add many features: mood tracking, prompts, streaks, frameworks, calendars, community, coaching, reminders, photos, exports, and AI chat. MindMirror should not try to out-feature them first. It should win on **clarity per minute**.

## Competitor Functionality Map

### Rosebud

Observed functionality:

- Text and voice journaling.
- Interactive AI self-reflection.
- Guided experiences using frameworks such as CBT and gratitude.
- Long-term memory that connects entries.
- Pattern recognition across entries.
- Mood tracking and emotional patterns.
- Smart goal tracking, habits, intentions, reminders.
- Weekly AI personal growth insights.
- Personalized prompts, quotes, book recommendations, and vision board direction.
- Privacy positioning: encrypted in transit and at rest, biometric/PIN lock.

MindMirror takeaway:

- Rosebud is strong at AI companionship and guided reflection.
- Risk for us: they already claim pattern recognition and memory.
- Our wedge must be sharper and less broad: **not “AI self-care companion,” but “your repeated thought loop, named clearly.”**

### Mindsera

Observed functionality:

- Journal by writing, speaking, or scanning a physical journal photo.
- Entry analysis: summary, emotions, streak, artwork.
- Long-term insights: emotional analysis, recurring topics, personality, suggestions.
- “Ask Your Journal” chat across journal history.
- Guided frameworks and mentor-like AI.
- Physical journal OCR/import direction.

MindMirror takeaway:

- Mindsera already validates our “bring your past journals” idea.
- Scanning physical journals is a real competitor feature, not a random thought.
- MindMirror can differentiate by using imports to answer one simple question: **what loop keeps returning?**

### Stoic

Observed functionality:

- Morning preparation and evening reflection.
- Guided prompts and weekly themes.
- Mood tracking.
- Mental health exercises.
- Breathing exercises.
- Habit/progress/reminder systems.
- Broad mental wellbeing/philosophy positioning.

MindMirror takeaway:

- Stoic wins on habit structure and daily ritual.
- We should borrow the “morning/evening rhythm” carefully, but avoid guilt-based streak pressure.
- MindMirror should support return-to-self routines, not force daily perfection.

### Day One

Observed functionality:

- Beautiful cross-platform journaling.
- Text, photos, videos, audio, location, weather, step count, and metadata.
- Multiple journals.
- Calendar, streaks, reminders.
- “On This Day” memory resurfacing.
- Smart camera scanning and image text extraction.
- Integrations/import automations.
- Strong privacy and end-to-end encryption positioning.
- Export and ownership.

MindMirror takeaway:

- Day One is the trusted archive.
- We cannot beat it on archival breadth soon.
- MindMirror should become the insight layer: less “store your life,” more “show the pattern inside what you keep saying.”

### Apple Journal / Daylio / Reflectly Pattern

Observed functionality:

- Very simple capture flows.
- Mood/activity logging.
- Suggestions based on daily context.
- App-store native ease.
- Low friction.

MindMirror takeaway:

- Ease matters more than feature count.
- The first screen should be capture-first, not dashboard-first.
- The dashboard should appear after there is enough evidence.

## MindMirror Engine Layers

### Layer 1 — Capture Engine

Goal: make it effortless to get thoughts in.

Inputs:

- Text entry.
- Browser dictation / voice transcript.
- Later: audio upload.
- Later: photo of physical journal.
- Later: video/self-note transcript.
- Later: import from Founder Vault style archive.

Engine output:

- Clean transcript/text.
- Source type.
- Timestamp.
- Optional context: mood, location/time zone if explicitly allowed.

Product rule:

- Capture must feel safe and fast.
- Never over-explain before the user saves.
- The first screen should ask: **“What has been taking up space in your mind?”**

### Layer 2 — Entry Mirror Engine

Goal: respond immediately after one entry.

For a single reflection, return:

- Plain-language summary.
- Possible emotion.
- Possible pattern.
- Evidence words/phrases.
- Confidence level.
- One next reflection question.
- One grounding/action prompt if the entry shows spiraling.

Tone:

- Careful, humble, and specific.
- “Possible” and “early signal” language until enough history exists.
- No diagnosis.

Example:

```text
Possible loop: clarity seeking
Evidence: “not sure”, “wrong choice”, “keep thinking”
Mirror: You may be using more thinking to avoid the discomfort of choosing.
Next question: What would you do if certainty was not required?
```

### Layer 3 — Pattern Memory Engine

Goal: compare new entries with old ones.

Track over time:

- Repeated topics.
- Repeated phrases.
- Repeated emotional states.
- Repeated contexts.
- Repeated avoidance language.
- Repeated goal/action gaps.
- “Comeback” moments: what helped the user recover.

Useful outputs:

- “You have mentioned this decision 4 times in 12 days.”
- “This pattern appears most often around work.”
- “Your language shifts from action to planning when you feel behind.”
- “When you walk or sleep early, your next entry is clearer.”

Product rule:

- Pattern memory is the core moat.
- Do not show too much too early.
- At 1 entry: mirror.
- At 3 entries: first repeated hint.
- At 7 entries: pattern card.
- At 14+ entries: trend and action review.

### Layer 4 — Action Recovery Engine

Goal: help users return to why they were acting.

The user’s pain is not only negative thoughts. It is losing the thread:

- “Why was I building this?”
- “What mattered before I spiraled?”
- “What action was I taking before life got in the way?”

Engine should detect:

- Spiral/rumination.
- Avoidance.
- Drop in agency.
- Repeated self-blame.
- Loss of direction.

Then return:

- The loop.
- The last clear intention.
- The smallest next action.
- A reminder of what has previously helped.

Example:

```text
You may be in a pressure loop.
Last clear intention: build MindMirror daily and get 10 users before Australia.
Smallest next action: send the quiz to one person, not fix the whole app.
```

### Layer 5 — Ask Your Mirror

Goal: let users query their history.

Questions MindMirror should answer:

- “What do I keep worrying about?”
- “What am I avoiding?”
- “What helps me come back?”
- “What do I say before I lose momentum?”
- “What keeps showing up around work?”
- “What did I want last month?”
- “What patterns repeat before I drink/vape/scroll/spiral?”

Product rule:

- “Ask Your Mirror” should be grounded in entries and cite evidence.
- It should not hallucinate broad life advice.

### Layer 6 — Import History Engine

Goal: let users start with existing history instead of starting from zero.

Future onboarding prompt:

```text
Already have journals, voice notes, screenshots, or reflections?
Bring them in and MindMirror can start with your history.
```

Import sources:

- Physical journal photo.
- Voice memo.
- Video note.
- Notes app export.
- Day One/other journal export.
- Founder Vault style folder.

Strict requirements before building:

- App-level privacy controls.
- Clear consent.
- Deletion/export.
- Retention policy.
- Avoid logging raw content.
- No raw user content in analytics.

## Easiest-To-Use Product Shape

MindMirror should not open with a busy dashboard.

Recommended first screen:

```text
What is taking up space in your mind?

[ big voice/text capture ]

Dictate     Save reflection
```

After saving:

```text
Here is the early mirror:

Possible loop:
Evidence:
What this might be costing you:
One question:
One next action:
```

Dashboard appears below or behind a tab:

- Today
- Patterns
- Entries
- Ask

Default mobile flow:

1. Capture.
2. Mirror.
3. One next question/action.
4. Optional pattern history.

## MVP Engine Roadmap

### M1 — Better Single-Entry Mirror

Build next.

- Add next reflection question.
- Add “cost of loop” line.
- Add “smallest next action” line.
- Improve pattern labels and evidence.
- Keep deterministic fallback, but shape data for future AI.

### M2 — Real AI Analysis

Call an AI model server-side after saving.

Structured output:

- summary
- emotion
- pattern label
- evidence
- confidence
- next question
- smallest next action
- safety/medical disclaimer flag if needed

### M3 — Pattern Memory

Compare last 3/7/14 entries.

- repeated topics
- repeated phrases
- repeated patterns
- comeback signals
- action gaps

### M4 — Ask Your Mirror

Question-answering over user entries.

- Retrieval from journal history.
- Evidence citations.
- No unsupported claims.

### M5 — Import History

Only after privacy/export/deletion rails improve.

- Upload files.
- Transcribe/OCR.
- Classify private data.
- Summarize safely.
- Build first pattern history.

## What Not To Build Yet

- Broad mood tracker clone.
- Streak system.
- Too many generic prompts.
- Big settings area.
- Vision board.
- Social/community.
- Influencer/coach marketplace.
- Full Founder Vault import before privacy rails.
- Complex dashboard before capture feels excellent.

## Current Build Direction

For June 1 onward:

1. Make `/account` capture-first.
2. Make the single-entry mirror feel useful.
3. Add next question and smallest next action.
4. Keep dashboard secondary.
5. Use competitor research for feature prioritization, not feature bloat.

The product should feel like:

> “I can say what is on my mind, and MindMirror shows the loop without making me work.”

That is the bar.
