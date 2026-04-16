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
            
            // Cargar notas al entrar
            renderNotas();
            
            // ESTO HACE QUE TODOS VEAN TODO EN TIEMPO REAL:
            // Revisa el servidor cada 5 segundos buscando notas nuevas de otros
            setInterval(renderNotas, 5000);
        } else { 
            alert("Credenciales incorrectas"); 
        }
    } catch (e) { 
        alert("El servidor está despertando... espera 15 segundos y reintenta."); 
    }
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
    
    text.value = ""; 
    photo.value = "";
    renderNotas(); // Actualizar inmediatamente para mí
}

async function borrar(id) {
    if(confirm("¿Quieres eliminar esta nota del muro de todos?")) {
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
            
            // Imagen si existe
            const img = n.foto_url ? `<img src="${n.foto_url}" class="note-img">` : '';
            
            // Botón borrar: visible para el dueño de la nota o para Axel (admin)
            const btnBorrar = (n.autor === usuarioActivo || usuarioActivo === 'ajbohorquez') 
                ? `<button onclick="borrar(${n.id})" class="del-btn"><i class="fas fa-trash"></i> Eliminar</button>` 
                : '';

            div.innerHTML = `
                <div class="note-header">
                    <b><i class="fas fa-user-circle"></i> ${n.autor}</b>
                    <small>${n.fecha}</small>
                </div>
                <p>${n.contenido}</p>
                ${img}
                ${btnBorrar}
            `;
            list.appendChild(div);
        });
    } catch (e) {
        console.log("Buscando nuevas notas...");
    }
}
