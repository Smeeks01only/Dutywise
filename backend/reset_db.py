import psycopg
import os

conn_str = "postgresql://postgres:Orange@localhost:5432/dutywise"

try:
    with psycopg.connect(conn_str) as conn:
        with conn.cursor() as cur:
            cur.execute("""
                DROP SCHEMA public CASCADE;
                CREATE SCHEMA public;
                GRANT ALL ON SCHEMA public TO postgres;
                GRANT ALL ON SCHEMA public TO public;
            """)
        conn.commit()
    print("Database schema reset successfully.")
except Exception as e:
    print(f"Error resetting database: {e}")
