// Starting Functions
carregarListas()
carregarTarefas()

// ContextMenu Tasks
function rightMenu_tarefa(id, event) {
    let div = document.getElementById('rightMenu_tarefa')

    if (!document.getElementById('tarefa_' + id).classList.contains('modoEditar') && !document.getElementById('tarefa_' + id).classList.contains('terminada')) {
        if (id) {
            div.setAttribute('data-id', id)
        }
    
        if (div) {
            div.style.display = "block";
            div.style.left = event.pageX + "px";
            div.style.top = event.pageY + "px";
        }
    }
}

// Change Task Color
async function alterarCor(cor, tarefa_id) {
    let tarefas = await getStorage("tarefas")
    let index = tarefas.findIndex(function(e) { return e.id === +tarefa_id; });
    
    if (index !== -1) {
        tarefas[index].cor = cor
    } else {
        console.error("Tarefa não encontrada, ID: " + tarefa_id)
    }

    store("tarefas", tarefas)
}

// Mark Task as Complete
async function terminarTarefa(tarefa_id) {
    if (document.getElementById('tarefa_' + tarefa_id).classList.contains('modoEditar')) {
        return
    }
    let tarefas = await getStorage("tarefas")
    let index = tarefas.findIndex(function(e) { return e.id === +tarefa_id; });
    
    if (index !== -1) {
        tarefas[index].terminada = !tarefas[index].terminada

        if (tarefas[index].terminada === true) {
            document.getElementById('tarefa_' + tarefa_id).classList.add("terminada")
        } else {
            document.getElementById('tarefa_' + tarefa_id).classList.remove("terminada")
        }
    } else {
        console.error("Tarefa não encontrada, ID: " + tarefa_id)
    }

    store("tarefas", tarefas)
}

// Remove Task
async function removerTarefa(tarefa_id) {
    let tarefas = await getStorage("tarefas")

    for (let i in tarefas) {
        if (tarefas[i].id === +tarefa_id) {
            tarefas.splice(i, 1)
        }
    }
    store("tarefas", tarefas)
    carregarTarefas()
}

// Edit Task
async function editarTarefa(tarefa_id) {
    let tarefas = await getStorage("tarefas");
    let index = tarefas.findIndex(function(e) { return e.id === +tarefa_id; });
    let div_tarefa = document.getElementById('tarefa_' + tarefa_id)
    let p_tarefa = div_tarefa.querySelector(".texto_tarefa")
    let cor_tarefa = div_tarefa.querySelector(".cor_tarefa")

    if (index !== -1) {
        let nomeAntigo = tarefas[index].texto;

        let input = document.createElement('input')
        input.setAttribute('class', 'input_editarTarefa')
        input.setAttribute('id', 'input_tarefa_' + tarefa_id)
        input.value = nomeAntigo

        let iconCancelar = document.createElement('i')
        iconCancelar.setAttribute('class', 'fa-solid fa-arrow-rotate-left')
        iconCancelar.setAttribute('id', 'icon_cancelarTarefa_' + tarefa_id)
        iconCancelar.setAttribute('onclick', `event.stopPropagation(); cancelarEditar_tarefa(${tarefa_id})`)
        iconCancelar.setAttribute('title', 'Cancelar')

        let iconConfirmar = document.createElement('i')
        iconConfirmar.setAttribute('class', 'fa-regular fa-floppy-disk')
        iconConfirmar.setAttribute('id', 'icon_confirmarTarefa_' + tarefa_id)
        iconConfirmar.setAttribute('onclick', `event.stopPropagation(); confirmarEditar_tarefa(${tarefa_id}, ${index})`)
        iconConfirmar.setAttribute('title', 'Guardar Alterações')

        p_tarefa.style.display = "none"
        cor_tarefa.style.display = "none"
        div_tarefa.appendChild(input)
        div_tarefa.appendChild(iconCancelar)
        div_tarefa.appendChild(iconConfirmar)
        div_tarefa.classList.add("modoEditar")
        input.select()
    } else {
        console.error("Tarefa não encontrada, ID:" + tarefa_id);
    }
}

// Cancel Nem Name - Task
function cancelarEditar_tarefa(tarefa_id) {
    let div_tarefa = document.getElementById('tarefa_' + tarefa_id)
    let p_tarefa = div_tarefa.querySelector(".texto_tarefa")
    let cor_tarefa = div_tarefa.querySelector(".cor_tarefa")
    let input_tarefa = document.getElementById('input_tarefa_' + tarefa_id)
    let icon1 = document.getElementById('icon_cancelarTarefa_' + tarefa_id)
    let icon2 = document.getElementById('icon_confirmarTarefa_' + tarefa_id)
    div_tarefa.removeChild(input_tarefa)
    div_tarefa.removeChild(icon1)
    div_tarefa.removeChild(icon2)
    div_tarefa.classList.remove("modoEditar")
    p_tarefa.style.display = "block"
    cor_tarefa.style.display = "block"
}

// Confirm New Name - Task
async function confirmarEditar_tarefa(tarefa_id, index) {
    let novoNome = document.getElementById('input_tarefa_' + tarefa_id).value
    let tarefas = await getStorage("tarefas")

    tarefas[index].texto = novoNome

    store("tarefas", tarefas)
    
    let div_tarefa = document.getElementById('tarefa_' + tarefa_id)
    let p_tarefa = div_tarefa.querySelector(".texto_tarefa")
    let cor_tarefa = div_tarefa.querySelector(".cor_tarefa")
    let input_tarefa = document.getElementById('input_tarefa_' + tarefa_id)
    let icon1 = document.getElementById('icon_cancelarTarefa_' + tarefa_id)
    let icon2 = document.getElementById('icon_confirmarTarefa_' + tarefa_id)
    div_tarefa.removeChild(input_tarefa)
    div_tarefa.removeChild(icon1)
    div_tarefa.removeChild(icon2)
    div_tarefa.classList.remove("modoEditar")
    p_tarefa.innerText = novoNome
    p_tarefa.style.display = "block"
    cor_tarefa.style.display = "block"
}

// Add New Task
async function criarTarefa(texto, cor) {
    let tarefasGuardadas = await getStorage("tarefas")
    const id = Math.floor(100000 + Math.random() * 900000)
    const novaTarefa = {
        "id": id,
        "lista_id": await getStorage("listaAtiva"),
        "texto": texto,
        "cor": cor,
        "estado": null,
        "terminada": false,
    }
    tarefasGuardadas.push(novaTarefa)
    store("tarefas", tarefasGuardadas)
    carregarTarefas()
}

// Load Tasks for the Current Active List
async function carregarTarefas() {
    let tarefas = await getStorage("tarefas")
    let container = document.getElementById('tarefas_container')
    let lista_ativa = await getStorage("listaAtiva")

    while (container.firstChild) {
        container.removeChild(container.firstChild)
    }

    for (let i in tarefas) {
        if (tarefas[i].lista_id === lista_ativa) {
            let novaTarefa = document.createElement('div')
            novaTarefa.setAttribute('class', 'tarefa')
            novaTarefa.setAttribute('id', 'tarefa_' + tarefas[i].id)
            novaTarefa.setAttribute('onclick', `terminarTarefa(${tarefas[i].id})`)
            novaTarefa.setAttribute('oncontextmenu', `event.preventDefault(), rightMenu_tarefa(${tarefas[i].id}, event)`)

            if (tarefas[i].terminada === true) {
                novaTarefa.classList.add('terminada')
            }

            let cor = document.createElement('input')
            cor.setAttribute('class', 'cor_tarefa')
            cor.setAttribute('type', 'color')
            cor.setAttribute('value', tarefas[i].cor)
            cor.setAttribute('oninput', `alterarCor(this.value, ${tarefas[i].id})`)
            cor.addEventListener('click', event => event.stopPropagation())

            let texto = document.createElement('div')
            texto.setAttribute('class', 'texto_tarefa')
            texto.innerText = tarefas[i].texto

            novaTarefa.appendChild(cor)
            novaTarefa.appendChild(texto)
            container.appendChild(novaTarefa)
        } else {
            continue
        }
    }
}

// Create New List
async function criarLista(nome) {
    if (nome.split(' ').length > 5 || nome.length > 30) {
        document.getElementById('msgErro_listas').style.display = "block"
        document.getElementById('msgErro_listas').innerText = "Máximo 5 palavras ou 30 caracteres!"
        setTimeout(() => {
        document.getElementById('msgErro_listas').style.display = "none"
        }, 5000);
        return
    } else {
        let listasGuardadas = await getStorage("listas")
        const id = Math.floor(100000 + Math.random() * 900000)
        const novoItem = {
            "id": id,
            "nome": nome,
            "ativa": false,
            "bloqueado": false,
            "codigoBloqueio": null
        }
        listasGuardadas.push(novoItem)
        store("listas", listasGuardadas)
        carregarListas()
    }
}

// Edit List
async function editarLista(lista_id) {
    let listas = await getStorage("listas");
    let index = listas.findIndex(function(e) { return e.id === +lista_id; });
    let div_lista = document.getElementById('lista_' + lista_id)
    let p_lista = div_lista.querySelector("p")

    if (index !== -1) {
        let nomeAntigo = listas[index].nome;

        let input = document.createElement('input')
        input.setAttribute('class', 'input_editarLista')
        input.setAttribute('id', 'input_lista_' + lista_id)
        input.value = nomeAntigo

        let iconCancelar = document.createElement('i')
        iconCancelar.setAttribute('class', 'fa-solid fa-arrow-rotate-left')
        iconCancelar.setAttribute('id', 'icon_cancelarLista_' + lista_id)
        iconCancelar.setAttribute('onclick', `event.stopPropagation(); cancelarEditar(${lista_id})`)
        iconCancelar.setAttribute('title', 'Cancelar')

        let iconConfirmar = document.createElement('i')
        iconConfirmar.setAttribute('class', 'fa-regular fa-floppy-disk')
        iconConfirmar.setAttribute('id', 'icon_confirmarLista_' + lista_id)
        iconConfirmar.setAttribute('onclick', `event.stopPropagation(); confirmarEditar(${lista_id}, ${index})`)
        iconConfirmar.setAttribute('title', 'Guardar Alterações')

        p_lista.style.display = "none"
        div_lista.appendChild(input)
        div_lista.appendChild(iconCancelar)
        div_lista.appendChild(iconConfirmar)
        div_lista.classList.add("modoEditar")
        input.select()
    } else {
        console.error("Lista not found for ID:" + lista_id);
    }
}

// Cancel New Name - List
function cancelarEditar(lista_id) {
    let div_lista = document.getElementById('lista_' + lista_id)
    let p_lista = div_lista.querySelector("p")
    let input_lista = document.getElementById('input_lista_' + lista_id)
    let icon1 = document.getElementById('icon_cancelarLista_' + lista_id)
    let icon2 = document.getElementById('icon_confirmarLista_' + lista_id)
    div_lista.removeChild(input_lista)
    div_lista.removeChild(icon1)
    div_lista.removeChild(icon2)
    div_lista.classList.remove("modoEditar")
    p_lista.style.display = "block"
}

// Confirm New Name - List
async function confirmarEditar(lista_id, index) {
    let novoNome = document.getElementById('input_lista_' + lista_id).value
    let listas = await getStorage("listas")

    listas[index].nome = novoNome

    store("listas", listas)
    
    let div_lista = document.getElementById('lista_' + lista_id)
    let p_lista = div_lista.querySelector("p")
    let input_lista = document.getElementById('input_lista_' + lista_id)
    let icon1 = document.getElementById('icon_cancelarLista_' + lista_id)
    let icon2 = document.getElementById('icon_confirmarLista_' + lista_id)
    div_lista.removeChild(input_lista)
    div_lista.removeChild(icon1)
    div_lista.removeChild(icon2)
    div_lista.classList.remove("modoEditar")
    p_lista.innerText = novoNome
    p_lista.style.display = "block"
}

// Remove List
async function removerLista(lista_id) {
    let listasGuardadas = await getStorage("listas")

    for (let i in listasGuardadas) {
        if (listasGuardadas[i].id === +lista_id) {
            listasGuardadas.splice(i, 1)
        }
    }
    store("listas", listasGuardadas)
    carregarListas()
}

// Load Lists
async function carregarListas() {
    let listas = await getStorage("listas")
    let tarefas = await getStorage("tarefas")
    let numero_listas = document.getElementById('num_listas')
    let display_listaAtiva = document.getElementById('nomeLista_display')
    let container = document.getElementById('listasContainer')

    while (container.firstChild) {
        container.removeChild(container.firstChild)
    }

    for (let i in listas) {

        let tarefas_lista = 0

        for (let j in tarefas) {
            if (tarefas[j].lista_id === listas[i].id) {
                tarefas_lista++
            }
        }

        let novaLista = document.createElement('div')
        novaLista.setAttribute('class', 'lista')
        novaLista.setAttribute('id', 'lista_' + listas[i].id)
        novaLista.setAttribute('onclick', `ativarLista(${listas[i].id})`)
        novaLista.setAttribute('oncontextmenu', `event.preventDefault(), rightMenu_lista(${listas[i].id}, event)`)
        if (listas[i].ativa === true) {
            novaLista.classList.add('ativa')
            display_listaAtiva.innerText = listas[i].nome
            store("listaAtiva", listas[i].id)
        }
        let p = document.createElement('p')
        p.innerText = `${listas[i].nome} (${tarefas_lista})`
        novaLista.appendChild(p)
        container.appendChild(novaLista)
    }
    numero_listas.innerText = listas.length
}

// Activate List
async function ativarLista(lista_id) {
    if (document.getElementById('lista_' + lista_id).classList.contains('modoEditar')) {
        return
    }
    let display_listaAtiva = document.getElementById('nomeLista_display')
    let listasAtivas = document.querySelectorAll(".lista.ativa")
    listasAtivas.forEach((lista) => {
        lista.classList.remove('ativa')
    })

    let listasGuardadas = await getStorage("listas")
    listasGuardadas.forEach((lista) => {
        if (lista.id === lista_id) {
            lista.ativa = true
            display_listaAtiva.innerText = lista.nome
        } else {
            lista.ativa = false
        }
    })

    let div = document.getElementById('lista_' + lista_id)
    if (div) {
        div.classList.add('ativa')
    }

    store("listas", listasGuardadas)
    store("listaAtiva", lista_id)
    carregarTarefas()
    modal("lista_manager")
}

// Open / Close Modals
async function modal(modal_id) {
    let modal = document.getElementById('modal_' + modal_id)
    let modalTarefas = document.getElementById('tarefas_display')
    if (window.getComputedStyle(modal).display === "none") {
        modal.style.display = "block"
        modalTarefas.style.display = "none"
        carregarListas()
    } else {
        modal.style.display = "none"
        modalTarefas.style.display = "block"
    }
}

// ContextMenu Lists
function rightMenu_lista(id, event) {
    let div = document.getElementById('rightMenu_lista')

    if (!document.getElementById('lista_' + id).classList.contains('modoEditar')) {
        if (id) {
            div.setAttribute('data-id', id)
        }
    
        if (div) {
            div.style.display = "block";
            div.style.left = event.pageX + "px";
            div.style.top = event.pageY + "px";
        }
    }
}

// Close ContextMenus
document.onclick = hideMenu

function hideMenu() {
    let rightMenus = document.querySelectorAll(".rightMenu")

    rightMenus.forEach(element => {
        element.style.display = "none"
    });
}

// Manage Local Storage - GET
function getStorage(storage_id) {
    try {
        const storageResults = localStorage.getItem(storage_id)
        return storageResults ? JSON.parse(storageResults) : []
    } catch (error) {
        console.error("[ERRO] Não foi possível recolher as informações do localStorage, ID: " + storage_id)
        console.error(error)
        return null
    }
}

// Manage Local Storage - STORE
function store(storage_id, storeItems) {
    try {
        const storeString = JSON.stringify(storeItems)
        localStorage.setItem(storage_id, storeString)
    } catch (error) {
        console.error("[ERRO] Não foi possível guardar as informações no localStorage, ID: " + storage_id)
        console.error(error)
    }
}

// Create List with Enter Key
let input = document.getElementById('input_criarLista')
input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        let nome = input.value.trim()
        if (nome) {
            criarLista(nome)
            input.value = ''
        }
    }
})

// Create Task with Enter Key
let input2 = document.getElementById('texto_criarTarefa')
input2.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        let nome = input2.value.trim()
        let cor = document.getElementById('cor_criarTarefa').value
        console.log(cor)
        if (nome) {
            criarTarefa(nome, cor)
            input2.value = ''
        }
    }
})