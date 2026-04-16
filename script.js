let usuarioActivo = null;
const URL_API = "https://v7ousc2553.onrender.com"; // Tu URL de Render

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
            document.getElementById('authContainer').classList.add('hidden');
            document.getElementById('appContainer').classList.remove('hidden');
            document.getElementById('welcomeMsg').innerText = `Conectado como: ${user}`;
            renderNotasCompartidas();
        } else {
            alert("Usuario o clave incorrecta");
        }
    } catch (error) {
        alert("Error al conectar con el servidor");
    }
}

async function addNote() {
    const input = document.getElementById('noteInput');
    if (!input.value.trim()) return;

    await fetch(`${URL_API}/notas`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
            autor: usuarioActivo, 
            contenido: input.value 
        })
    });

    input.value = "";
    renderNotasCompartidas();
}

async function renderNotasCompartidas() {
    const res = await fetch(`${URL_API}/notas`);
    const notas = await res.json();
    
    const container = document.getElementById('notesList');
    container.innerHTML = "";
    
    document.getElementById('noteCount').innerText = notas.length;

    notas.forEach(n => {
        const div = document.createElement('div');
        div.className = 'note-card fade-in';
        div.innerHTML = `
            <div>
                <span class="note-date"><b>${n.autor}</b> - ${n.fecha}</span>
                <p>${n.contenido}</p>
            </div>
        `;
        container.appendChild(div);
    });
}
