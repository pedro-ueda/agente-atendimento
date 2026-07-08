// netlify/functions/chat.js

exports.handler = async (event, context) => {
    // 1. Libera chamadas de qualquer origem (CORS) caso teste localmente
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    };
  
    // Responde imediatamente a requisições de verificação (preflight) do navegador
    if (event.httpMethod === "OPTIONS") {
      return { statusCode: 200, headers, body: "" };
    }
  
    // Garante que só aceitamos requisições POST para o chat
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: "Método não permitido. Use POST." }),
      };
    }
  
    try {
      // 2. Recupera a chave de API das variáveis de ambiente do Netlify
      // Você vai configurar essa variável no painel do Netlify com o nome: OPENROUTER_API_KEY
      const apiKey = process.env.OPENROUTER_API_KEY;
  
      if (!apiKey) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: "Configuração ausente: Chave de API não encontrada no servidor." }),
        };
      }
  
      // 3. Pega o histórico de conversas enviado pelo seu frontend
      const { messages, model } = JSON.parse(event.body);
  
      // 4. Faz a chamada segura para o OpenRouter de dentro do servidor
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://netlify.com", // Obrigatório pelo OpenRouter
          "X-Title": "Francisco Consultor Automotivo",
        },
        body: JSON.stringify({
          model: model || "meta-llama/llama-3-8b-instruct:free",
          messages: messages,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.text();
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify({ error: `Erro no OpenRouter: ${errorData}` }),
        };
      }
  
      const data = await response.json();
  
      // 5. Devolve a resposta da IA limpa para o seu frontend
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data),
      };
  
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message }),
      };
    }
  };