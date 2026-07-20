import sqlite3

conn = sqlite3.connect("ai_mentor.db")
cursor = conn.cursor()

# Add theme column
try:
    cursor.execute("""
        ALTER TABLE users
        ADD COLUMN theme TEXT DEFAULT 'Light'
    """)
    print("✅ theme column added.")
except Exception as e:
    print("theme:", e)

# Add notifications column
try:
    cursor.execute("""
        ALTER TABLE users
        ADD COLUMN notifications BOOLEAN DEFAULT 1
    """)
    print("✅ notifications column added.")
except Exception as e:
    print("notifications:", e)

conn.commit()
conn.close()

print("Database updated successfully.")