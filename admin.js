import { database, auth } from "./firebase.js";
import { ref, get, remove, onValue } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

const loginBox = document.getElementById("loginBox");
const adminContent = document.getElementById("adminContent");
const confirmedList = document.getElementById("confirmedList");
const statsDiv = document.getElementById("stats");
const toast = document.getElementById("toast");
const userEmailSpan = document.getElementById("userEmail");

// Verificar estado de autenticação
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Usuário está logado
    loginBox.style.display = "none";
    adminContent.style.display = "block";
    if (userEmailSpan) userEmailSpan.textContent = user.email;
    carregarConfirmados();
    
    // Atualização em tempo real
    const confirmacoesRef = ref(database, 'confirmacoes');
    onValue(confirmacoesRef, () => {
      carregarConfirmados();
    });
  } else {
    // Usuário não está logado
    loginBox.style.display = "block";
    adminContent.style.display = "none";
  }
});

window.login = async function() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  
  if (!email || !senha) {
    showToast("Preencha e-mail e senha!", true);
    return;
  }
  
  try {
    await signInWithEmailAndPassword(auth, email, senha);
    showToast("Login realizado com sucesso!");
    document.getElementById("email").value = "";
    document.getElementById("senha").value = "";
  } catch (error) {
    console.error("Erro no login:", error);
    let mensagem = "Erro ao fazer login. ";
    if (error.code === 'auth/invalid-credential') {
      mensagem = "E-mail ou senha incorretos!";
    } else if (error.code === 'auth/user-not-found') {
      mensagem = "Usuário não encontrado!";
    } else if (error.code === 'auth/wrong-password') {
      mensagem = "Senha incorreta!";
    } else if (error.code === 'auth/invalid-email') {
      mensagem = "E-mail inválido!";
    }
    showToast(mensagem, true);
  }
};

window.logout = async function() {
  try {
    await signOut(auth);
    showToast("Logout realizado com sucesso!");
  } catch (error) {
    console.error("Erro no logout:", error);
    showToast("Erro ao sair. Tente novamente.", true);
  }
};

function showToast(message, isError = false) {
  toast.textContent = message;
  toast.style.background = isError ? '#D4AF6A' : '#5C4B3A';
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

window.deleteConfirmation = async function(id) {
  if (confirm("Tem certeza que deseja excluir esta confirmação?")) {
    try {
      await remove(ref(database, `confirmacoes/${id}`));
      showToast("Confirmação removida com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir:", error);
      showToast("Erro ao excluir. Tente novamente.", true);
    }
  }
};

async function carregarConfirmados() {
  const snapshot = await get(ref(database, 'confirmacoes'));
  const data = snapshot.val();
  
  // Atualizar estatísticas
  if (data) {
    const confirmations = Object.values(data);
    const totalPessoas = confirmations.reduce((sum, conf) => sum + conf.names.length, 0);
    
    statsDiv.innerHTML = `
      <div class="stat-card">
        <h3>${confirmations.length}</h3>
        <p>Confirmações</p>
      </div>
      <div class="stat-card">
        <h3>${totalPessoas}</h3>
        <p>Total de Pessoas</p>
      </div>
      <div class="stat-card">
        <h3>${new Date().toLocaleDateString('pt-BR')}</h3>
        <p>Última atualização</p>
      </div>
    `;
  } else {
    statsDiv.innerHTML = '<div class="stat-card"><h3>0</h3><p>Confirmações</p></div>';
  }
  
  confirmedList.innerHTML = "";
  
  if (!data) {
    confirmedList.innerHTML = '<div class="empty-state">Nenhuma confirmação ainda</div>';
    return;
  }
  
  const entries = Object.entries(data).reverse();
  let index = 1;
  
  for (const [id, conf] of entries) {
    const div = document.createElement("div");
    div.className = "confirmation-item";
    
    const date = new Date(conf.timestamp).toLocaleString('pt-BR');
    const namesList = conf.names.map(name => `  👤 ${name}`).join('<br>');
    
    div.innerHTML = `
      <div class="confirmation-header">
        <span class="confirmation-date">#${index} - ${date}</span>
        <button class="btn-delete" onclick="deleteConfirmation('${id}')">🗑️ Excluir</button>
      </div>
      <div class="confirmation-group">Grupo original: ${conf.group}</div>
      <div class="confirmation-names">
        Confirmados:<br>
        ${namesList}
      </div>
    `;
    
    confirmedList.appendChild(div);
    index++;
  }
}

window.exportData = async function() {
  const snapshot = await get(ref(database, 'confirmacoes'));
  const data = snapshot.val();
  
  if (!data) {
    showToast("Nenhum dado para exportar!", true);
    return;
  }
  
  const confirmations = Object.values(data);
  let csv = "";
  
  confirmations.forEach(conf => {
    conf.names.forEach(name => {
      csv += `${name}\n`;
    });
  });
  
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `confirmados_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showToast("Lista exportada com sucesso!");
};