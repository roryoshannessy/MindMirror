# MindMirror Engine Test Report

Last updated: June 1, 2026

Purpose: quick smoke test of what the current MindMirror engine does when given realistic voice-note style transcripts.

## Current Input Reality

The app currently uses browser dictation for voice capture. The saved input is still text by the time it reaches the engine, so these tests use transcript-style text samples rather than raw audio files.

## Smoke Samples

### Sample 1 — Founder pressure / overthinking

Input:

```text
I keep thinking about MindMirror and I feel behind. I know I should be posting and building but I keep overthinking the interface and then I lose momentum.
```

Output:

- Pattern: Possible pressure and expectation loop
- Emotion: reflective
- Confidence: medium
- Signals: should be, behind, should
- Cost: Pressure may be turning progress into proof that you are enough.
- Question: Whose standard are you trying to satisfy right now?
- Next: Name the one thing that would count as enough for today.

### Sample 2 — Exhaustion / avoidance

Input:

```text
I am exhausted from work meetings and I cannot focus. Everything feels urgent and I keep putting off the one task I know would move this forward.
```

Output:

- Pattern: Possible avoidance loop
- Emotion: heavy
- Confidence: medium
- Signals: keep putting, exhausted
- Cost: Delay can make the task feel heavier than the task itself.
- Question: What are you avoiding feeling by not starting?
- Next: Do the first two minutes, then stop if you still want to.

### Sample 3 — Positive clarity / routine

Input:

```text
I had a good morning and felt more clear after walking. I want to protect the routine because it helps me come back faster when I spiral.
```

Output:

- Pattern: Emerging pattern, not enough signal yet
- Emotion: motivated
- Confidence: medium
- Signals: more clear, clear
- Cost: There is not enough evidence yet to name a clear cost.
- Question: What is the one thought you would want MindMirror to remember from this?
- Next: Save one more honest reflection when the thought returns.

### Sample 4 — Decision loop

Input:

```text
I keep checking if I made the wrong choice. I am not sure what to do next and I keep thinking about every option instead of deciding.
```

Output:

- Pattern: Possible clarity-seeking loop
- Emotion: uncertain
- Confidence: medium
- Signals: keep thinking, not sure, sure
- Cost: More thinking may be replacing the discomfort of choosing.
- Question: What would you do next if certainty was not required?
- Next: Pick one decision and define the next visible step.

## What This Proves

- The current engine can already produce a simple single-entry mirror.
- It is useful enough for a prototype, but still deterministic and keyword-based.
- Positive entries need careful handling so the app does not force every reflection into a problem.
- The next real upgrade is server-side AI analysis with structured output and evidence citations.

## Immediate Fix From This Test

The first test run showed that a positive clarity entry could still inherit guidance from a non-matching clarity loop. This was fixed by only using pattern-specific guidance when a pattern actually scored.

