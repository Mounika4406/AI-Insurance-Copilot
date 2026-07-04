import psycopg2

def create_database():
    try:
        # Connect to default postgres DB
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            user="postgres"
        )
        conn.autocommit = True
        cur = conn.cursor()
        
        # Check if database exists
        cur.execute("SELECT 1 FROM pg_database WHERE datname = 'insurance_copilot'")
        exists = cur.fetchone()
        
        if not exists:
            cur.execute("CREATE DATABASE insurance_copilot")
            print("Database 'insurance_copilot' created successfully!")
        else:
            print("Database 'insurance_copilot' already exists.")
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error creating database: {e}")

if __name__ == "__main__":
    create_database()
