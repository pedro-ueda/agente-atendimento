// Array para guardar o histórico da conversa e enviar para a IA ter memória
let conversationHistory = [
    { role: "system", content: FRANCISCO_SYSTEM_PROMPT }
];

const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// Função para adicionar mensagens na tela
function appendMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);

    const textDiv = document.createElement('div');
    textDiv.classList.add('message-text');
    // Substitui quebras de linha por <br> para manter a formatação do Francisco
    textDiv.innerHTML = text.replace(/\n/g, '<br>');

    messageDiv.appendChild(textDiv);
    chatMessages.appendChild(messageDiv);

    // Rola o chat para a última mensagem
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Função para enviar os dados para a API do OpenRouter
async function fetchFranciscoResponse() {
    try {
        // Altere apenas o bloco do 'fetch' dentro do seu script.js antigo para ficar assim:
        const response = await fetch(CONFIG.API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: CONFIG.MODEL,
                messages: conversationHistory // Envia o histórico com o prompt do Francisco
            })
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }

        const data = await response.json();
        const assistantReply = data.choices[0].message.content;

        // Remove a mensagem de "Digitando..." e coloca a resposta real
        document.getElementById('typingIndicator')?.remove();

        // Exibe a resposta do Francisco e salva no histórico
        appendMessage('assistant', assistantReply);
        conversationHistory.push({ role: "assistant", content: assistantReply });

    } catch (error) {
        console.error(error);
        document.getElementById('typingIndicator')?.remove();
        appendMessage('assistant', "Peço desculpas, mas tive um pequeno problema técnico de conexão agora. Poderia tentar me enviar a mensagem novamente?");
    } finally {
        // Reativa os campos para o usuário enviar novas perguntas
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
    }
}

// Evento de envio do formulário
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const text = userInput.value.trim();
    if (!text) return;

    // Desabilita a entrada temporariamente enquanto processa
    userInput.value = '';
    userInput.disabled = true;
    sendBtn.disabled = true;

    // Adiciona a mensagem do usuário na tela e no histórico
    appendMessage('user', text);
    conversationHistory.push({ role: "user", content: text });

    // Adiciona um indicador visual de que o Francisco está formulando a resposta
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'assistant');
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `<div class="message-text"><em>Francisco está digitando...</em></div>`;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Chama a API
    fetchFranciscoResponse();
});