let usuarioActivo = null;
const URL_API = "https://v7ousc2553.onrender.com";

async function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    try {
        const res = await fetch(`${URL_API}/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ usuario: user, password: pass })
        });
        if (res.ok) {
            usuarioActivo = user;
            document.getElementById('authContainer').style.display = 'none';
            document.getElementById('appContainer').classList.remove('hidden');
            document.getElementById('welcomeMsg').innerText = `Hola, ${user}`;
            renderNotas();
            // ACTUALIZACIÓN EN TIEMPO REAL: Revisa cada 5 segundos
            setInterval(renderNotas, 5000);
        } else { alert("Usuario o clave incorrecta"); }
    } catch (e) { alert("Servidor despertando... reintenta en 10 segundos."); }
}

async function addNote() {
    const text = document.getElementById('noteInput');
    const photo = document.getElementById('photoInput');
    if (!text.value.trim()) return;

    await fetch(`${URL_API}/notas`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
            autor: usuarioActivo, 
            contenido: text.value, 
            foto_url: photo.value 
        })
    });
    text.value = ""; photo.value = "";
    renderNotas();
}

async function borrar(id) {
    if(confirm("¿Eliminar nota para todos?")) {
        await fetch(`${URL_API}/notas/${id}`, { method: 'DELETE' });
        renderNotas();
    }
}

async function renderNotas() {
    try {
        const res = await fetch(`${URL_API}/notas`);
        const notas = await res.json();
        const list = document.getElementById('notesList');
        list.innerHTML = "";

        notas.forEach(n => {
            const div = document.createElement('div');
            div.className = 'note-card';
            const img = n.foto_url ? `<img src="${n.foto_url}" class="note-img">` : '';
            // El admin (ajbohorquez) puede borrar cualquier nota
            const btnBorrar = (n.autor === usuarioActivo || usuarioActivo === 'ajbohorquez') 
                ? `<button onclick="borrar(${n.id})" class="del-btn">Eliminar</button>` : '';

            div.innerHTML = `
                <div class="note-header">
                    <b>${n.autor}</b> <small>${n.fecha}</small>
                </div>
                <p>${n.contenido}</p>
                ${img}
                ${btnBorrar}
            `;
            list.appendChild(div);
        });
    } catch (e) { console.log("Sincronizando..."); }
}
