from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import datetime

app = Flask(__name__)
CORS(app)

# --- CONFIGURACIÓN DE USUARIOS PERMITIDOS ---
# Aquí puedes agregar todos los usuarios y contraseñas que quieras
USUARIOS_AUTORIZADOS = {
    "ajbohorquez": "Axel2026)",
    "profesor": "clase2026",
    "estudiante2": "tarea123"
}

def conectar_db():
    return sqlite3.connect('comunidad.db')

def iniciar_db():
    conn = conectar_db()
    cursor = conn.cursor()
    # Tabla única para que todos compartan las notas
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notas_compartidas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            autor TEXT NOT NULL,
            contenido TEXT NOT NULL,
            fecha TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/login', methods=['POST'])
def login():
    datos = request.json
    user = datos.get('usuario')
    password = datos.get('password')
    
    if user in USUARIOS_AUTORIZADOS and USUARIOS_AUTORIZADOS[user] == password:
        return jsonify({"status": "ok", "usuario": user})
    return jsonify({"status": "error", "mensaje": "Credenciales incorrectas"}), 401

@app.route('/notas', methods=['GET'])
def obtener_todas_las_notas():
    conn = conectar_db()
    cursor = conn.cursor()
    cursor.execute("SELECT autor, contenido, fecha FROM notas_compartidas ORDER BY id DESC")
    filas = cursor.fetchall()
    conn.close()
    
    notas = [{"autor": f[0], "contenido": f[1], "fecha": f[2]} for f in filas]
    return jsonify(notas)

@app.route('/notas', methods=['POST'])
def guardar_nota():
    datos = request.json
    conn = conectar_db()
    cursor = conn.cursor()
    fecha_actual = datetime.datetime.now().strftime("%d/%m/%Y %H:%M")
    cursor.execute("INSERT INTO notas_compartidas (autor, contenido, fecha) VALUES (?, ?, ?)", 
                   (datos['autor'], datos['contenido'], fecha_actual))
    conn.commit()
    conn.close()
    return jsonify({"mensaje": "Nota compartida"}), 201

if __name__ == '__main__':
    iniciar_db()
    app.run(debug=True, port=5000)