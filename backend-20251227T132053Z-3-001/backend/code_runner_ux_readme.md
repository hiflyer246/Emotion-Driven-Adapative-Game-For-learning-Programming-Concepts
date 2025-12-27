# Code Runner: Emotion-Aware Programming Adventure

## 🎮 User Experience Guide

### Overview

Code Runner is an interactive educational game that adapts to your emotions while you solve coding challenges. Using real-time facial emotion recognition through your webcam, the game personalizes the learning experience by detecting when you're frustrated, confused, bored, or focused—and responds accordingly.

---

## 🚀 Getting Started

### Initial Setup

**Step 1: Launch the Game**
- Open Code Runner in your browser
- Click "Start Adventure"
- Grant webcam permission when prompted

**Step 2: First Impressions**
Once started, you'll see:
- Your current emotion indicator (updates every 2 seconds)
- The first coding challenge
- An input area for your solution
- Real-time feedback on your emotional state

```
┌─────────────────────────────────────┐
│  😊 Emotion: Focused                │
│                                     │
│  Question 1: Arrays - Easy          │
│  Find the largest number in:        │
│  [3, 7, 2, 9, 1]                   │
│                                     │
│  Your answer: [ input box ]         │
│  [Submit]                           │
└─────────────────────────────────────┘
```

---

## 🎭 Emotion-Based Scenarios

### Scenario 1: Happy & Focused (Smooth Sailing)

**Your State:**
- Smiling or neutral expression
- Looking at the screen
- Engaged with the problem

**What Happens:**
- Game detects `happy` or `focused` emotion
- No intervention needed
- Positive reinforcement: "Great focus! Keep going! 🌟"
- Normal progression continues

**Timeline:**
```
0s:  Question loads
2s:  Emotion check → Focused ✓
4s:  Emotion check → Happy ✓
30s: You submit correct answer
     → +10 XP, Next question
```

**Result:** Uninterrupted flow state maintained

---

### Scenario 2: Confused (Need Guidance)

**Your State:**
- Eyebrows raised
- Re-reading the question multiple times
- Uncertain facial expression
- 40+ seconds without progress

**What Happens:**
- System detects `confused` emotion
- Waits for 20+ seconds to confirm sustained confusion
- Offers Hint Level 1 (subtle guidance)

**Hint Progression:**

**At 40 seconds:**
```
┌─────────────────────────────────────┐
│  💡 Hint Available!                 │
│  "Here's something to think about   │
│   - what happens if you iterate     │
│   through the array?"               │
│                                     │
│  [Got it]                           │
└─────────────────────────────────────┘
```

**If still stuck at 70 seconds:**
- System offers Hint Level 2 (more detailed approach)
- Explains the methodology without giving away the answer

**Timeline:**
```
0s:   Question loads
10s:  Emotion → Confused (frown appears)
20s:  Emotion → Confused (sustained)
40s:  💡 Hint Level 1 appears
50s:  Still confused
70s:  💡 Hint Level 2 appears (detailed)
```

---

### Scenario 3: Frustrated (Getting Stuck)

**Your State:**
- Multiple wrong submissions
- Furrowed brow, tight lips
- Visible annoyance
- Angry or disgusted expression

**What Happens:**
- DeepFace detects `angry` or `disgust` emotions
- System maps to `frustrated` state
- After 10+ seconds of sustained frustration
- Provides Hint Level 2 with encouragement

**Support Message:**
```
┌─────────────────────────────────────┐
│  🤗 You seem stuck!                 │
│  Don't worry, here's how to         │
│  approach this:                     │
│                                     │
│  "You can solve this in one pass    │
│   by keeping track of the maximum   │
│   value as you iterate. Initialize  │
│   max = array[0], then compare..."  │
│                                     │
│  Common mistakes to avoid:          │
│  • Forgetting empty arrays          │
│  • Not handling negative numbers    │
│                                     │
│  [Try Again]                        │
└─────────────────────────────────────┘
```

**Recovery Flow:**
- You read the hint
- Expression softens → becomes focused
- System stops intervention
- You solve it successfully!

**Timeline:**
```
0s:   Question loads
30s:  Submit wrong answer
40s:  Emotion → Frustrated
50s:  Emotion → Frustrated (sustained)
65s:  💡 Hint Level 2 + encouragement
75s:  Emotion → Focused (calmed down)
90s:  Correct submission! 🎉
```

---

### Scenario 4: Bored (Too Easy)

**Your State:**
- Solving questions too quickly
- Looking away from screen
- Yawning or disengaged expression
- Neutral emotion + idle time

**What Happens:**
- System detects `bored` state
- Offers bonus challenge instead of hints
- Increases difficulty and rewards

**Bonus Challenge Popup:**
```
┌─────────────────────────────────────┐
│  🎯 BONUS CHALLENGE!                │
│  You're cruising through these!     │
│  Ready for something harder?        │
│                                     │
│  "Find the Kth largest element      │
│   in an unsorted array - optimize   │
│   for time complexity!"             │
│                                     │
│  Reward: +50 XP (instead of +10)    │
│  Unlock: Special achievement        │
│                                     │
│  [Accept Challenge] [Skip]          │
└─────────────────────────────────────┘
```

**Your Options:**
- **Accept:** Harder question loads, re-engagement achieved
- **Skip:** Continue normal progression

**Timeline:**
```
0s:   Question loads
10s:  Correct answer (fast solve)
15s:  Next question → too easy
25s:  Emotion → Bored
35s:  🎯 Bonus challenge offered
40s:  You accept → harder problem
```

---

### Scenario 5: Sad/Discouraged (Need Support)

**Your State:**
- Multiple failed attempts
- Head dropping down
- Sad facial expression
- Corners of mouth down
- Losing motivation

**What Happens:**
- System detects `sad` emotion
- Immediately offers encouragement
- Provides gentle hint without waiting
- Emotional support prioritized

**Supportive Message:**
```
┌─────────────────────────────────────┐
│  💙 Hey, don't give up!             │
│  Learning to code is challenging,   │
│  and you're doing great!            │
│                                     │
│  Small hint to get you started:     │
│  "Think about the problem one       │
│   step at a time..."                │
│                                     │
│  Remember: Every expert was once    │
│  a beginner. You've got this! 💪    │
│                                     │
│  [Continue]                         │
└─────────────────────────────────────┘
```

---

### Scenario 6: Dynamic Emotion Shifts

**Real-time Adaptation Example:**

Your emotional journey through a single question:

```
0-20s:   😊 Focused     → No intervention
20-40s:  😕 Confused    → Hint Level 1 offered
40-60s:  😤 Frustrated  → Hint Level 2 offered
60-90s:  😊 Happy       → Problem solved! 🎉
```

**What You Experience:**
The game continuously adapts as your emotions change:
1. **Observing** when you're focused
2. **Gentle nudge** when confused
3. **Stronger support** when frustrated
4. **Celebration** when successful

---

## 📊 Complete Session Example

### 30-Minute Coding Session

**Question 1 (Easy - Arrays):**
- Emotion: Focused
- Result: Solved quickly
- Reward: +10 XP

**Question 2 (Easy - Strings):**
- Emotion: Bored (too easy)
- Action: Bonus challenge offered
- Result: Accepted and solved
- Reward: +50 XP

**Question 3 (Medium - Sorting):**
- Emotion: Confused → Focused
- Action: Hint Level 1 given
- Result: Solved with help
- Reward: +15 XP

**Question 4 (Medium - Recursion):**
- Emotion: Frustrated → Calm
- Action: Hint Level 2 + encouragement
- Result: Eventually solved
- Reward: +15 XP

**Question 5 (Hard - Dynamic Programming):**
- Emotion: Confused → Frustrated → Sad → Happy
- Action: Multiple hints + emotional support
- Result: Breakthrough moment!
- Reward: +25 XP + Achievement unlocked!

**Session Summary:**
```
Total XP Earned:        115
Questions Completed:    5/5
Hints Used:             5
Bonus Challenges:       1
City Restoration:       40% complete 🏙️
Achievements:           "Persistent Learner" 🏆
```

---

## 🎯 Hint System Details

### Three-Level Progressive Hints

**Level 1: Subtle Guidance**
- Just a nudge in the right direction
- Asks guiding questions
- Doesn't reveal solution approach
- Example: "What happens if you iterate through the array?"

**Level 2: Approach Explanation**
- Explains methodology without code
- Breaks down the problem
- Suggests data structures or algorithms
- Example: "You can solve this in one pass by maintaining two variables..."

**Level 3: Detailed Walkthrough**
- Step-by-step breakdown
- Pseudo-code provided
- Common mistakes highlighted
- Example: "Initialize largest = -infinity, second = -infinity. Loop through..."

### Hint Timing

| Emotion | Time Before Hint | Hint Level |
|---------|------------------|------------|
| Confused | 40 seconds | Level 1 |
| Confused (sustained) | 70 seconds | Level 2 |
| Frustrated | 15 seconds | Level 2 |
| Frustrated (severe) | 30 seconds | Level 3 |
| Sad | Immediate | Level 1 + Support |
| Bored | 35 seconds | Bonus Challenge |
| Happy/Focused | No hints | Encouragement only |

---

## 🔄 Behind the Scenes (What You Don't See)

### Seamless Integration

**Every 2 Seconds:**
- Webcam captures your face (invisible to you)
- DeepFace analyzes facial expression (< 100ms)
- Emotion mapped to game state (instant)
- Database lookup for hints (< 100ms)

**You Only Notice:**
- Smooth emotion indicator updates
- Perfectly timed helpful hints
- Game feeling "smart" and responsive
- Never waiting for AI processing

### Privacy & Performance

- All emotion detection happens locally
- No facial images stored or transmitted
- Lightweight processing (works on any modern laptop)
- No internet required for emotion recognition

---

## 💡 Key Features

### What Makes Code Runner Different

| Traditional Platforms | Code Runner |
|----------------------|-------------|
| Fixed difficulty | Emotion-adaptive difficulty |
| Manual help requests | Proactive assistance |
| Generic hints | Context-aware support |
| One-size-fits-all | Personalized to YOUR state |
| Frustration = quit | Frustration = intervention |
| Static experience | Dynamic emotional journey |

### Educational Benefits

**Reduces Learning Friction:**
- Catches frustration before you quit
- Provides help at the perfect moment
- Prevents overwhelming or boring content

**Builds Confidence:**
- Emotional support when discouraged
- Celebrates small victories
- Progressive difficulty adjustment

**Maintains Engagement:**
- Bonus challenges prevent boredom
- Real-time adaptation keeps flow state
- Gamification with XP and achievements

---

## 🛠️ Technical Stack

**Emotion Recognition:**
- DeepFace for facial analysis
- OpenCV for webcam capture
- Real-time processing (5 FPS)

**Content Generation:**
- Google Gemini AI for questions
- Pre-generated hints (instant access)
- Progressive difficulty system

**Frontend:**
- React for interactive UI
- Real-time emotion indicators
- Smooth animations and transitions

**Backend:**
- FastAPI for API endpoints
- MongoDB for question storage
- Session management

---

## 🎓 Getting the Most Out of Code Runner

### Tips for Best Experience

**1. Good Lighting:**
- Sit facing a light source
- Avoid backlighting
- Ensure your face is clearly visible

**2. Camera Position:**
- Position webcam at eye level
- Face the camera directly
- Stay within frame

**3. Natural Expression:**
- Don't force emotions
- Express yourself naturally
- The game adapts to YOU

**4. Trust the Process:**
- Accept hints when offered
- Don't rush through problems
- Learning takes time

**5. Challenge Yourself:**
- Accept bonus challenges
- Try before asking for hints
- Embrace the struggle (it's learning!)

---

## 📈 Progress Tracking

### What Gets Tracked

- Questions attempted and solved
- Time spent per question
- Hints used and their effectiveness
- Emotional patterns during learning
- XP and achievement progress
- City restoration percentage

### Success Metrics

**Your Growth:**
- Solving harder problems over time
- Needing fewer hints
- Faster problem-solving
- More consistent positive emotions

---

## 🤝 Support

### If You're Struggling

**Remember:**
- Every coder faces challenges
- Asking for help (hints) is learning
- Emotional responses are normal
- Progress isn't always linear

**The Game Will:**
- Detect when you're stuck
- Offer appropriate assistance
- Provide emotional support
- Adapt to your learning pace

---

## 🎉 Achievements & Rewards

### Unlockable Achievements

- **Quick Learner:** Solve 5 questions without hints
- **Persistent Coder:** Continue after 3 failed attempts
- **Challenge Seeker:** Complete 5 bonus challenges
- **City Builder:** Restore 50% of the city
- **Emotion Master:** Maintain focus for 10 questions
- **Comeback Kid:** Recover from sad to happy state

### XP System

- Easy question: 10 XP
- Medium question: 15 XP
- Hard question: 25 XP
- Bonus challenge: 50 XP
- No hints used: +5 XP bonus
- Fast solve: +3 XP bonus

---

## 📝 Final Notes

Code Runner is more than a coding practice platform—it's an empathetic learning companion that understands the emotional rollercoaster of learning to code. By detecting and responding to your emotions in real-time, it creates a supportive, adaptive, and engaging learning experience.

**Remember:** The goal isn't just to solve problems, but to learn how to think like a programmer while enjoying the journey.

Happy coding! 🚀

---

*Version 1.0 | Last Updated: October 2025*