import psycopg2
from psycopg2 import OperationalError

# Substitua pelos seus dados reais
HOST = "db.txcjwctmkrnulnunpgyq.supabase.co"
PORT = 5432
USER = "postgres"
PASSWORD = "SUA_SENHA_AQUI"
DBNAME = "postgres"

try:
    print("Testando conexão com o banco...")
    conn = psycopg2.connect(
        host=HOST,
        port=PORT,
        user=USER,
        password=PASSWORD,
        dbname=DBNAME,
        connect_timeout=10
    )
    cur = conn.cursor()
    cur.execute("SELECT version();")
    version = cur.fetchone()
    print("✅ Conexão bem-sucedida! Versão do PostgreSQL:", version[0])
    cur.close()
    conn.close()
except OperationalError as e:
    print("❌ Falha na conexão:", e)
