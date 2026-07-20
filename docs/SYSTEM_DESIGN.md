# AURA Learn — AI Classroom Teaching Engine
### System Design Document

---

## 1. AI Teacher System Design

### 1.1 Design Philosophy
AURA Learn is not a Q&A chatbot. Every response is treated as a **lesson delivered by a teacher standing at a smart board**, not a text reply. The system separates *what to teach* (pedagogy) from *how to render it* (board) and *how to speak it* (voice), so the same lesson content can drive three different outputs from a single generation pass.

### 1.2 Core Teaching Loop
```
Student Input
     ↓
[1] Level Detection      → infer grade/skill level from phrasing, history, prior quiz results
     ↓
[2] Teaching Strategy     → pick analogy style, pacing, difficulty ramp
     ↓
[3] Lesson Generation     → structured lesson object (see §2 schema)
     ↓
[4] Board Rendering       → lesson object → smart board layout
     ↓
[5] Voice Script          → lesson object → spoken teaching script with pause markers
     ↓
[6] Delivery              → board renders + voice plays in sync
     ↓
[7] Checkpoint Question   → student responds
     ↓
[8] Adapt                 → re-enter loop at [2] with updated level estimate
```

### 1.3 Level Detection Signals
- Vocabulary and phrasing complexity in the student's question
- Explicit self-reported level ("I'm in 10th grade" / "I know Python basics")
- Performance on previous Quiz Agent checkpoints (stored per student)
- Time taken / hint requests during practice questions

### 1.4 Teaching Style Rules
- Always start with the simplest correct explanation, then layer complexity ("scaffold, don't dump").
- One new concept per board screen — never stack multiple unexplained ideas.
- Every abstract concept gets a real-world analogy before the technical definition.
- End every lesson segment with a checkpoint question, never just a summary.

---

## 2. Smart Board Response Format

The Teacher Agent doesn't output prose — it outputs a **structured lesson object**. The Visual Board Agent renders this object into the UI; the Voice Teacher Agent renders it into speech. Keeping one canonical schema avoids drift between what's shown and what's spoken.

```json
{
  "boardTitle": "Python Loops",
  "learningObjective": "Understand how loops repeat instructions automatically.",
  "level": "beginner",
  "sections": [
    {
      "type": "explanation",
      "heading": "What is a loop?",
      "body": "A loop lets a computer repeat an action without you writing it out again and again.",
      "analogy": "Like a teacher checking attendance for every student, one by one, using the same action each time."
    },
    {
      "type": "diagram",
      "format": "flowchart",
      "nodes": ["Start", "Check Condition", "Execute Code", "Repeat", "End"],
      "edges": [["Start","Check Condition"], ["Check Condition","Execute Code"], ["Execute Code","Check Condition"], ["Check Condition","End"]]
    },
    {
      "type": "code",
      "language": "python",
      "code": "for i in range(5):\n    print(i)",
      "explanation": "This repeats the print statement 5 times, with i taking values 0 through 4."
    },
    {
      "type": "realWorldExample",
      "body": "A teacher checking attendance every day follows the same steps — that repetition is a loop."
    },
    {
      "type": "note",
      "importance": "high",
      "body": "range(5) produces 5 numbers starting at 0, not 1."
    },
    {
      "type": "practiceQuestion",
      "prompt": "Write a loop that prints numbers 1 to 10.",
      "difficulty": "easy",
      "hint": "Try range(1, 11)."
    }
  ],
  "summary": "Loops let you repeat instructions automatically instead of writing them multiple times.",
  "voiceScript": [
    { "text": "Let's talk about loops in Python.", "pauseAfterMs": 500 },
    { "text": "Imagine you had to print attendance for 100 students, one by one — that would be tedious to write out by hand.", "pauseAfterMs": 800 },
    { "text": "A loop lets the computer do that repetition for you.", "pauseAfterMs": 600 },
    { "text": "Take a look at this code on the board.", "pauseAfterMs": 400 },
    { "text": "Now, try the practice question — write a loop that prints 1 to 10. Take your time.", "pauseAfterMs": 1000 }
  ]
}
```

**Why this schema matters:** the `type` field per section maps directly to a board-rendering component (`ExplanationBlock`, `DiagramBlock`, `CodeBlock`, `NoteBlock`, `PracticeBlock`), and `voiceScript` is generated in parallel from the same underlying lesson, with `pauseAfterMs` giving the Voice Agent natural teaching cadence instead of a flat read-through.

---

## 3. Agent Architecture

### 3.1 Agent Roles

| Agent | Responsibility | Input | Output |
|---|---|---|---|
| **Teacher Agent** | Core pedagogy — decides *what* to teach and *how deep* | Student question + level profile | Raw lesson content (concepts, analogies, examples) |
| **Visual Board Agent** | Converts lesson content into board layout | Lesson content | Structured board JSON (§2 schema) |
| **Voice Teacher Agent** | Converts lesson content into spoken delivery | Lesson content | `voiceScript` with pacing/pause markers |
| **Quiz Agent** | Generates checkpoint & practice questions, grades responses | Lesson topic + level | Question set + feedback on answers |
| **Personalization Agent** | Tracks student profile across sessions | Interaction history, quiz results | Updated student level/weakness profile |

### 3.2 Orchestration Pattern
A single **Orchestrator** (implemented as a Google ADK root agent) coordinates the five agents as sub-agents/tools rather than letting them call each other directly:

```
Orchestrator
 ├── calls Personalization Agent  → get student profile
 ├── calls Teacher Agent          → generate lesson (using profile)
 ├── calls Visual Board Agent     → render board JSON (parallel)
 ├── calls Voice Teacher Agent    → render voice script (parallel)
 ├── calls Quiz Agent             → generate checkpoint question
 └── on student response:
       calls Quiz Agent           → grade + feedback
       calls Personalization Agent → update profile
```

Board and Voice generation run **in parallel** (both derive from the same Teacher Agent output), not sequentially — this keeps latency down since the student sees the board and hears the voice start together.

### 3.3 State Ownership
- **Firebase (Firestore)**: student profile, level history, weak-topic list, session transcripts.
- **RAG store**: curriculum knowledge base (verified textbook-level content), retrieved by the Teacher Agent to ground explanations and reduce hallucination on factual subjects.
- **Session memory (in-request)**: current lesson object, passed between agents without re-fetching.

---

## 4. Teaching Workflow

```
┌─────────────────────────────┐
│ Student: "Teach me ML"      │
└──────────────┬───────────────┘
               ↓
   ① Personalization Agent
      → loads/estimates student level
               ↓
   ② Teacher Agent
      → decides scope: "start with what a model is,
         not math, since level = beginner"
               ↓
   ③ Lesson object generated
               ↓
        ┌──────┴──────┐
        ↓             ↓
④ Visual Board    ⑤ Voice Teacher
   Agent              Agent
   → board JSON       → voice script
        └──────┬──────┘
               ↓
   ⑥ Delivery: board renders, voice speaks in sync
               ↓
   ⑦ Quiz Agent asks a checkpoint question
               ↓
   ⑧ Student answers
               ↓
   ⑨ Quiz Agent grades → Personalization Agent updates profile
               ↓
   ⑩ Loop back to ② with adjusted difficulty
```

---

## 5. Example Classroom Interactions

**Example A — Beginner, concept-first**
> **Student:** "What is a neural network?"
> **AI (voice + board):** "Think of a neural network like a group of students passing notes in class. Each student only knows a small rule — like 'if the number is big, pass it forward.' But when thousands of students pass notes following their own small rules, the whole classroom can solve something complex together. That's roughly what a neural network's layers do — lots of simple units, combined, doing something smart."
> **Board:** shows a 3-layer node diagram, one labeled input/hidden/output, no math yet.
> **Checkpoint:** "Can you tell me, in your own words, why one student's rule alone wouldn't be very smart, but many together can be?"

**Example B — Intermediate, code-first**
> **Student:** "How does backpropagation work?"
> **AI:** Detects prior sessions covered forward pass and loss functions, so skips the basics and goes straight to the chain rule with a 2-layer worked numeric example on the board, code block showing gradient computation in NumPy, then a practice question asking the student to compute one gradient step by hand.

**Example C — Adaptive correction**
> **Student answers a checkpoint incorrectly.**
> **AI:** Does not just show the right answer. Re-explains the specific failed sub-concept with a new analogy, then re-asks a simpler variant of the same question before moving on. Personalization Agent logs this topic as a "weak area" for future review.

---

## 6. Gemini API Implementation Approach

### 6.1 Stack
- **Gemini API** — Teacher Agent reasoning + lesson generation (structured JSON output mode)
- **Google ADK (Agent Development Kit)** — orchestrator + sub-agent wiring described in §3
- **Gemini Live API** — real-time voice teaching, streaming audio in/out for natural back-and-forth
- **Firebase** — Firestore for student memory, Firebase Hosting for the web classroom client
- **RAG layer** — vector store (e.g. Vertex AI Search or a simple embeddings index) over curriculum documents, queried by the Teacher Agent before generation

### 6.2 Teacher Agent — structured lesson generation
```python
from google import genai
from google.genai import types

client = genai.Client()

LESSON_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "boardTitle": {"type": "STRING"},
        "learningObjective": {"type": "STRING"},
        "level": {"type": "STRING"},
        "sections": {"type": "ARRAY", "items": {"type": "OBJECT"}},
        "summary": {"type": "STRING"},
        "voiceScript": {"type": "ARRAY", "items": {"type": "OBJECT"}}
    },
    "required": ["boardTitle", "learningObjective", "sections", "summary", "voiceScript"]
}

def generate_lesson(topic: str, student_level: str, rag_context: str) -> dict:
    response = client.models.generate_content(
        model="gemini-2.5-pro",
        contents=f"""You are an expert classroom teacher. Teach the topic below to a
student at level: {student_level}.

Reference material (grounding, do not copy verbatim):
{rag_context}

Topic: {topic}

Follow AURA Learn teaching rules: simple language first, one new idea per section,
real-world analogy before technical definition, end with a practice question.
""",
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=LESSON_SCHEMA,
        ),
    )
    return response.parsed
```

### 6.3 ADK Orchestrator sketch
```python
from google.adk.agents import Agent, SequentialAgent, ParallelAgent

teacher_agent = Agent(
    name="teacher_agent",
    model="gemini-2.5-pro",
    instruction="Generate lesson content per AURA Learn pedagogy rules.",
    tools=[rag_lookup_tool],
)

board_agent = Agent(
    name="visual_board_agent",
    model="gemini-2.5-flash",
    instruction="Convert lesson content into board JSON per the AURA schema.",
)

voice_agent = Agent(
    name="voice_teacher_agent",
    model="gemini-2.5-flash",
    instruction="Convert lesson content into a paced voiceScript with pause markers.",
)

quiz_agent = Agent(
    name="quiz_agent",
    model="gemini-2.5-flash",
    instruction="Generate and grade checkpoint questions for the given lesson.",
)

rendering_stage = ParallelAgent(
    name="rendering_stage",
    sub_agents=[board_agent, voice_agent],
)

classroom_pipeline = SequentialAgent(
    name="aura_classroom",
    sub_agents=[teacher_agent, rendering_stage, quiz_agent],
)
```

### 6.4 Gemini Live API — voice teaching session
```python
async def run_voice_lesson(voice_script: list[dict]):
    async with client.aio.live.connect(
        model="gemini-2.5-flash-native-audio",
        config={"response_modalities": ["AUDIO"]},
    ) as session:
        for line in voice_script:
            await session.send_client_content(
                turns={"parts": [{"text": line["text"]}]}
            )
            async for chunk in session.receive():
                if chunk.data:
                    play_audio_chunk(chunk.data)  # stream to board UI
            await asyncio.sleep(line["pauseAfterMs"] / 1000)
```

### 6.5 Firebase student memory
```javascript
// Firestore structure
students/{studentId}
  ├── level: "beginner" | "intermediate" | "advanced"
  ├── weakTopics: ["backpropagation", "recursion"]
  ├── sessions/{sessionId}
  │     ├── topic: "Python Loops"
  │     ├── timestamp
  │     └── checkpointResults: [{ question, correct, attempts }]
```

### 6.6 Multi-language support
Pass a `language` field through the lesson schema and prompt; Gemini generates both `sections` text and `voiceScript` in the target language in the same structured call, and the Live API's native-audio model handles pronunciation for supported languages without a separate TTS step.
