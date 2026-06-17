STORY_CHAPTERS = {
    1: {
        "title": "The Digital Collapse",
        "intro": """
        Welcome to NeoCity, a once-thriving digital metropolis now in ruins. 
        A catastrophic bug has corrupted the city's core systems. 
        Buildings flicker with broken code, and citizens need your help.
        
        Your mission: Restore the city by solving coding challenges. 
        Each problem you solve will repair a part of the city and bring hope back to its people.
        """,
        "buildings": ["data_center", "library", "power_grid"],
        "required_xp": 0,
        "questions_to_complete": 3
    },
    2: {
        "title": "The Network District",
        "intro": """
        You've restored the Data Center! Power flows through the city once again.
        
        But the Network District remains offline. Communication towers are down,
        and citizens are isolated. The city needs connection.
        
        Solve more complex challenges to rebuild the network infrastructure.
        """,
        "buildings": ["comm_tower", "router_hub", "fiber_node"],
        "required_xp": 100,
        "questions_to_complete": 5
    },
    3: {
        "title": "The Algorithm Gardens",
        "intro": """
        Networks restored! People can communicate again. 
        
        But the Algorithm Gardens—where the city's AI learns and grows—lie dormant.
        These gardens once optimized everything, making NeoCity efficient and beautiful.
        
        Master advanced algorithms to revive the gardens and restore the city's intelligence.
        """,
        "buildings": ["learning_center", "optimization_hub", "ai_core"],
        "required_xp": 250,
        "questions_to_complete": 7
    },
    4: {
        "title": "The Final Debug",
        "intro": """
        The city hums with life again! But something lurks in the shadows...
        
        The Master Bug—source of all corruption—hides in the Core System.
        Only the most skilled programmer can face this ultimate challenge.
        
        This is it. The final battle to save NeoCity.
        """,
        "buildings": ["core_system", "city_hall", "victory_monument"],
        "required_xp": 500,
        "questions_to_complete": 10
    }
}

BUILDINGS = {
    "data_center": {
        "name": "Data Center",
        "icon": "🏢",
        "description": "The heart of NeoCity's information infrastructure",
        "restoration_text": "Data flows freely once more!"
    },
    "library": {
        "name": "Digital Library",
        "icon": "📚",
        "description": "Repository of all coding knowledge",
        "restoration_text": "Knowledge is accessible to all!"
    },
    "power_grid": {
        "name": "Power Grid",
        "icon": "⚡",
        "description": "Energy source for the entire city",
        "restoration_text": "The lights are back on!"
    },
    "comm_tower": {
        "name": "Communication Tower",
        "icon": "📡",
        "description": "Enables city-wide communication",
        "restoration_text": "Signals transmitted across the city!"
    },
    "router_hub": {
        "name": "Router Hub",
        "icon": "🔗",
        "description": "Routes data throughout the network",
        "restoration_text": "Network pathways restored!"
    },
    "fiber_node": {
        "name": "Fiber Node",
        "icon": "💫",
        "description": "High-speed data connections",
        "restoration_text": "Lightning-fast connections achieved!"
    },
    "learning_center": {
        "name": "Learning Center",
        "icon": "🧠",
        "description": "Where AI models are trained",
        "restoration_text": "The city learns once more!"
    },
    "optimization_hub": {
        "name": "Optimization Hub",
        "icon": "⚙️",
        "description": "Makes everything run efficiently",
        "restoration_text": "Efficiency maximized!"
    },
    "ai_core": {
        "name": "AI Core",
        "icon": "🤖",
        "description": "Central artificial intelligence",
        "restoration_text": "AI consciousness awakened!"
    },
    "core_system": {
        "name": "Core System",
        "icon": "💎",
        "description": "The city's central operating system",
        "restoration_text": "System fully operational!"
    },
    "city_hall": {
        "name": "City Hall",
        "icon": "🏛️",
        "description": "Government and administration center",
        "restoration_text": "Order restored!"
    },
    "victory_monument": {
        "name": "Victory Monument",
        "icon": "🏆",
        "description": "A testament to your achievement",
        "restoration_text": "You are the hero of NeoCity!"
    }
}

EMOTION_STORY_RESPONSES = {
    "frustrated": [
        "Take a deep breath. Every bug you face makes you stronger.",
        "Even the greatest programmers struggled. You've got this!",
        "The city believes in you. Don't give up now!"
    ],
    "confused": [
        "Sometimes the answer requires a different perspective.",
        "Break the problem into smaller pieces.",
        "The solution is closer than you think."
    ],
    "sad": [
        "You're making real progress, even if it doesn't feel like it.",
        "The citizens of NeoCity are cheering for you!",
        "Every attempt brings you closer to success."
    ],
    "bored": [
        "Ready for a greater challenge?",
        "Your skills are growing. Time to test them!",
        "The city needs your expertise on harder problems."
    ],
    "happy": [
        "Your positivity radiates through the city!",
        "Excellent work! The city grows brighter!",
        "You're restoring hope to NeoCity!"
    ],
    "focused": [
        "Your concentration is impressive!",
        "The code flows through you naturally.",
        "Perfect focus. Keep going!"
    ]
}

ACHIEVEMENTS = {
    "first_solve": {
        "name": "First Victory",
        "description": "Solved your first challenge",
        "icon": "🎯",
        "xp_reward": 10
    },
    "speed_demon": {
        "name": "Speed Demon",
        "description": "Solved a challenge in under 60 seconds",
        "icon": "⚡",
        "xp_reward": 25
    },
    "no_hints": {
        "name": "Pure Skill",
        "description": "Solved 5 challenges without hints",
        "icon": "🧠",
        "xp_reward": 50
    },
    "persistent": {
        "name": "Never Give Up",
        "description": "Attempted a challenge 5 times before succeeding",
        "icon": "💪",
        "xp_reward": 30
    },
    "level_2": {
        "name": "Network Master",
        "description": "Reached Level 2",
        "icon": "📡",
        "xp_reward": 50
    },
    "level_3": {
        "name": "Algorithm Sage",
        "description": "Reached Level 3",
        "icon": "⚙️",
        "xp_reward": 75
    },
    "level_4": {
        "name": "NeoCity Hero",
        "description": "Reached Level 4 and saved the city",
        "icon": "🏆",
        "xp_reward": 100
    },
    "emotion_master": {
        "name": "Emotion Master",
        "description": "Maintained focus for 10 consecutive checks",
        "icon": "🎭",
        "xp_reward": 40
    },
    "building_restorer": {
        "name": "Master Builder",
        "description": "Restored 5 buildings",
        "icon": "🏗️",
        "xp_reward": 60
    }
}