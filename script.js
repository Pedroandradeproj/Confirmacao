import { database } from "./firebase.js";
import { ref, push, set } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";

// Lista de famílias com identificação correta
const familias = [
  ["Ione", "José João"],
  ["Lauane", "Ramon"],
  ["Lívia", "Maxwell"],
  ["Washington", "Geny", "Ana", "Ana Gabriela (C)"],
  ["Ana Carolina", "Danilo"],
  ["Simone", "Ivan", "Jéssica", "Diego"],
  ["Luiz", "Ana Luiza"],
  ["Fabrício", "Isabella"],
  ["Igor", "Ana Helena"],
  ["Flávia"],
  ["Ana Maria", "Joilson", "Débora", "Luiza"],
  ["Gerônimo", "Milena", "Patrícia", "Melissa (C)"],
  ["Cibele", "Matheus"],
  ["Edvaldo", "Neusa", "Ana Júlia (C)"],
  ["José Hilton", "Maria da Conceição"],
  ["Brendou"],
  ["Marlene", "Alcedino"],
  ["Amanda", "William"],
  ["Gabriela", "Felipe"],
  ["Joicy", "Eugênio"],
  ["Danielle Martins"],
  ["Lucas Silva"],
  ["Victor Hugo Bento", "Maysa"],
  ["Sandra", "Sebastião", "Gabriel"],
  ["Nelson"],
  ["Silvania"],
  ["Cleiton", "Margareth", "Cleber", "Emilia"],
  ["Felipe", "Daniele", "Thiago (C)"],
  ["Leila", "Wanderson", "Ana Lara"],
  ["Aurinete", "Antônio"],
  ["Andrea", "Fabio"],
  ["Diane"],
  ["Cristina", "Victor"],
  ["Isabel", "Sidney"],
  ["Julio"],
  ["Maria da Penha", "Josenildo"],
  ["Ricardo"],
  ["Elisa", "Edmar"],
  ["Rafael", "Aline", "Julia (C)"],
  ["Roberto"],
  ["Paulo", "Andreia"],
  ["Rosilene", "Evandro"],
  ["Gustavo", "Carla", "Raquel", "Thiago"],
  ["Flávio", "Anita", "Filipe", "Victoria"],
  ["Ronaldo", "Cibele", "Ariadiny"],
  ["Atila", "Angelica", "Vitor Lucas", "Silvana", "Lorena (C)"],
  ["Julio Cezar", "Nieda", "Thainara", "Bricio", "Tatiele"],
  ["Vinicius", "Ana Lucia", "Bruno", "Thayanne"],
  ["Herika", "Bruno"],
  ["Nelson", "Jô", "Lorrana", "Lorrany", "Lorran"],
  ["Aloisio", "Carine", "Rafael (C)"],
  ["Arthur", "Lorrany"],
  ["Renato", "Sheila"],
  ["Marcos", "Adriana", "Vitor Gabriel"],
  ["Guilherme"],
  ["Daniel", "Gabriela"],
  ["Wendell", "Rose"],
  ["Isabelle"],
  ["Waleson"],
  ["Jean"],
  ["Ana Luiza", "Paulo"],
  ["Gustavo", "Tainá"],
  ["Natalia", "Tales"],
  ["Lucas"],
  ["Pedro"],
  ["Carol", "Patrick"],
  ["Aryel", "Jessica"],
  ["Ana Cristiane","André Moraes"],
  ["Arthur","Ana Carolina"],
  ["Edite"],
  ["Italo"],
  ["Eurides"]
];

let currentGroup = null;
let currentGroupNames = [];

const searchInput = document.getElementById('searchInput');
const suggestionsDiv = document.getElementById('suggestions');
const selectedGroupDiv = document.getElementById('selectedGroup');
const groupNamesSpan = document.getElementById('groupNames');
const openModalBtn = document.getElementById('openModalBtn');
const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('closeModalBtn');
const sendConfirmBtn = document.getElementById('sendConfirmBtn');
const dynamicInputs = document.getElementById('dynamicInputs');
const toast = document.getElementById('toast');

// Buscar por primeiro nome na estrutura de famílias
function searchByFirstName(query) {
  const lowerQuery = query.toLowerCase().trim();
  if (lowerQuery.length === 0) return [];
  
  const results = [];
  const seen = new Set();
  
  for (const familia of familias) {
    // Pega o primeiro nome de cada pessoa (antes do espaço ou completo)
    const firstNames = familia.map(nome => {
      // Se tiver espaço, pega só a primeira parte
      if (nome.includes(' ')) {
        return nome.split(' ')[0].toLowerCase();
      }
      return nome.toLowerCase();
    });
    
    // Verifica se algum primeiro nome começa com o texto digitado
    const match = firstNames.some(nome => nome.startsWith(lowerQuery));
    
    if (match && !seen.has(familia)) {
      seen.add(familia);
      results.push(familia);
    }
  }
  
  return results;
}

// Formatar membros da família para exibição nas sugestões
function formatFamilyMembersForSuggestion(familia) {
  const nomes = familia.slice(0, 3);
  const nomesFormatados = nomes.map(nome => {
    if (nome.includes(' (C)')) {
      return nome.replace(' (C)', '');
    }
    return nome;
  });
  
  if (familia.length <= 3) {
    return nomesFormatados.join(', ');
  }
  return `${nomesFormatados.join(', ')} +${familia.length - 3}`;
}

// Formatar família para exibição completa
function formatFamilyFull(familia) {
  return familia.map(nome => {
    if (nome.includes(' (C)')) {
      return nome.replace(' (C)', ' (Criança)');
    }
    return nome;
  }).join(' • ');
}

// Mostrar sugestões
function showSuggestions(matches) {
  suggestionsDiv.innerHTML = '';
  
  if (matches.length === 0) {
    suggestionsDiv.classList.remove('active');
    return;
  }
  
  matches.forEach(familia => {
    const div = document.createElement('div');
    div.className = 'suggestion-item';
    const primeiroNome = familia[0].includes(' ') ? familia[0].split(' ')[0] : familia[0];
    const members = formatFamilyMembersForSuggestion(familia);
    div.innerHTML = `
      <div class="family-name">${primeiroNome}</div>
      <div class="family-members">${members}</div>
    `;
    div.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      selectGroup(familia);
    };
    suggestionsDiv.appendChild(div);
  });
  
  suggestionsDiv.classList.add('active');
}

// Selecionar grupo
function selectGroup(familia) {
  currentGroup = familia;
  currentGroupNames = [...familia];
  groupNamesSpan.innerHTML = formatFamilyFull(familia);
  selectedGroupDiv.classList.add('active');
  suggestionsDiv.classList.remove('active');
  searchInput.value = '';
  searchInput.blur();
}

// Abrir modal
function openModal() {
  if (!currentGroup) return;
  
  dynamicInputs.innerHTML = '';
  
  currentGroupNames.forEach((name, index) => {
    // Remover a marcação (C) para o input
    let cleanName = name;
    if (name.includes(' (C)')) {
      cleanName = name.replace(' (C)', '');
    }
    
    const div = document.createElement('div');
    div.className = 'form-group';
    const label = index === 0 ? 'Nome completo (principal)' : `Nome completo (acompanhante ${index})`;
    div.innerHTML = `
      <label>${label}</label>
      <input 
        type="text" 
        id="name_${index}" 
        value="${cleanName}" 
        placeholder="Digite o nome completo"
        autocomplete="off"
      >
    `;
    dynamicInputs.appendChild(div);
  });
  
  modal.classList.add('active');
  setTimeout(() => {
    const firstInput = dynamicInputs.querySelector('input');
    if (firstInput) firstInput.focus();
  }, 100);
}

// Fechar modal
function closeModal() {
  modal.classList.remove('active');
}

// Mostrar toast
function showToast(message, isError = false) {
  toast.textContent = message;
  toast.style.background = isError ? '#D4AF6A' : '#5C4B3A';
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// Confirmar presença
async function confirmPresence() {
  const inputs = dynamicInputs.querySelectorAll('input');
  const names = Array.from(inputs).map(input => input.value.trim()).filter(v => v);
  
  if (names.length === 0) {
    showToast('Preencha pelo menos um nome!', true);
    return;
  }
  
  if (names.some(name => name === '')) {
    showToast('Preencha todos os nomes corretamente!', true);
    return;
  }
  
  sendConfirmBtn.disabled = true;
  sendConfirmBtn.style.opacity = '0.6';
  
  try {
    const confirmacaoRef = push(ref(database, 'confirmacoes'));
    // Salvar o grupo original com marcações para referência
    const grupoOriginal = currentGroup.map(nome => nome).join(' | ');
    
    await set(confirmacaoRef, {
      group: grupoOriginal,
      groupArray: currentGroup,
      names: names,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleString('pt-BR')
    });
    
    showToast('Presença confirmada com sucesso!');
    closeModal();
    
    currentGroup = null;
    selectedGroupDiv.classList.remove('active');
    groupNamesSpan.innerHTML = '';
    
  } catch (error) {
    console.error('Erro ao confirmar:', error);
    showToast('Erro ao confirmar. Tente novamente.', true);
  } finally {
    sendConfirmBtn.disabled = false;
    sendConfirmBtn.style.opacity = '1';
  }
}

// Debounce para busca
let debounceTimer;
searchInput.addEventListener('input', (e) => {
  clearTimeout(debounceTimer);
  const query = e.target.value;
  
  if (query.length === 0) {
    suggestionsDiv.classList.remove('active');
    return;
  }
  
  debounceTimer = setTimeout(() => {
    const matches = searchByFirstName(query);
    showSuggestions(matches);
  }, 200);
});

// Fechar sugestões ao clicar fora
document.addEventListener('click', (e) => {
  if (!searchInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
    suggestionsDiv.classList.remove('active');
  }
});

// Event Listeners
openModalBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
sendConfirmBtn.addEventListener('click', confirmPresence);

// Fechar modal com ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    closeModal();
  }
});

suggestionsDiv.addEventListener('click', (e) => {
  e.stopPropagation();
});
