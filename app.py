from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import datetime

app = Flask(__name__)
CORS(app)

# Usuarios que pueden entrar al muro
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
    # Añadimos foto_url para que todos vean imágenes
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notas_compartidas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            autor TEXT NOT NULL,
            contenido TEXT NOT NULL,
            foto_url TEXT,
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
    return jsonify({"status": "error"}), 401

@app.route('/notas', methods=['GET'])
def obtener_notas():
    conn = conectar_db()
    cursor = conn.cursor()
    # Traemos todas las notas de la base de datos para que todos las vean
    cursor.execute("SELECT id, autor, contenido, foto_url, fecha FROM notas_compartidas ORDER BY id DESC")
    filas = cursor.fetchall()
    conn.close()
    return jsonify([{"id": f[0], "autor": f[1], "contenido": f[2], "foto_url": f[3], "fecha": f[4]} for f in filas])

@app.route('/notas', methods=['POST'])
def guardar_nota():
    datos = request.json
    conn = conectar_db()
    cursor = conn.cursor()
    fecha = datetime.datetime.now().strftime("%d/%m/%Y %H:%M")
    cursor.execute("INSERT INTO notas_compartidas (autor, contenido, foto_url, fecha) VALUES (?, ?, ?, ?)", 
                   (datos['autor'], datos['contenido'], datos.get('foto_url'), fecha))
    conn.commit()
    conn.close()
    return jsonify({"status": "creado"}), 201

@app.route('/notas/<int:id>', methods=['DELETE'])
def eliminar_nota(id):
    conn = conectar_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM notas_compartidas WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"status": "eliminado"}), 200

if __name__ == '__main__':
    iniciar_db()
    app.run(host='0.0.0.0', port=5000)
