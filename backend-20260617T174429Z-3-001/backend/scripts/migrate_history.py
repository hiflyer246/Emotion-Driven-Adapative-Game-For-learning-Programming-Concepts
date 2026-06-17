import json
import os

def migrate_sessions():
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
    sessions_path = os.path.join(data_dir, "interview_sessions.json")
    users_path = os.path.join(data_dir, "users.json")
    
    if not os.path.exists(sessions_path) or not os.path.exists(users_path):
        print("Data files not found.")
        return

    with open(users_path, 'r', encoding='utf-8') as f:
        users = json.load(f)
        
    if not users:
        print("No users found.")
        return
        
    # Assume single user mode or take the first one
    real_user_id = users[0]["_id"]
    print(f"Target User ID: {real_user_id}")

    with open(sessions_path, 'r', encoding='utf-8') as f:
        sessions = json.load(f)
        
    migrated_count = 0
    for session in sessions:
        if session.get("user_id") == "user_123":
            session["user_id"] = real_user_id
            migrated_count += 1
            
    if migrated_count > 0:
        with open(sessions_path, 'w', encoding='utf-8') as f:
            json.dump(sessions, f, indent=2, default=str)
        print(f"✅ Migrated {migrated_count} sessions to user {users[0]['email']}")
    else:
        print("No sessions needed migration.")

if __name__ == "__main__":
    migrate_sessions()
