"""Reset a user's password in the hopeworks-english-assignment database."""
import sys

import bcrypt
import psycopg2

# ── Config ─────────────────────────────────────────────────────────────
EMAIL = "pawarsamruddhi1227@gmail.com"
NEW_PASSWORD = "Mauli@123"

# Docker DB credentials (from docker-compose.yml)
DB_HOST = "localhost"
DB_PORT = 6666
DB_NAME = "reading"
DB_USER = "app"
DB_PASS = "app"

# ── Hash the new password ──────────────────────────────────────────────
new_hash = bcrypt.hashpw(NEW_PASSWORD.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

# ── Connect and update ─────────────────────────────────────────────────
try:
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
    )
    conn.autocommit = True
    cur = conn.cursor()

    # Check user exists
    cur.execute("SELECT id, email, name FROM users WHERE email = %s", (EMAIL,))
    row = cur.fetchone()
    if row is None:
        print(f"ERROR: No user found with email '{EMAIL}'")
        sys.exit(1)

    user_id, email, name = row
    print(f"Found user: {name} ({email}) [id={user_id}]")

    # Update password
    cur.execute("UPDATE users SET password_hash = %s WHERE id = %s", (new_hash, user_id))
    print(f"Password updated to '{NEW_PASSWORD}' — {cur.rowcount} row(s) affected")

    # Verify
    cur.execute("SELECT password_hash FROM users WHERE id = %s", (user_id,))
    row2 = cur.fetchone()
    if row2 is None:
        print("ERROR: User vanished after update — something is wrong")
        sys.exit(1)
    stored_hash = row2[0]
    if bcrypt.checkpw(NEW_PASSWORD.encode("utf-8"), stored_hash.encode("utf-8")):
        print("SUCCESS: Password verified — hash matches.")
    else:
        print("WARNING: Hash verification failed — something went wrong.")

    cur.close()
    conn.close()

except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)
