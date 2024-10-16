// API 키를 직접 입력합니다. 실제 배포 시에는 이 키를 안전하게 관리해야 합니다.
const OPENAI_API_KEY = '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';

document.addEventListener('DOMContentLoaded', () => {
  const chatMessages = document.getElementById('chat-messages');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');

  function addMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
      addMessage('user', message);
      userInput.value = '';
      await getAIResponse(message);
    }
  }

  async function getAIResponse(userMessage) {
    const prompt = `당신은 컴퓨터 구매를 돕는 전문가입니다. 사용자의 질문에 친절하고 전문적으로 답변해주세요.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo", // 최신 모델로 변경
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: userMessage }
          ],
          max_tokens: 15,
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        addMessage('system', `API Error: ${response.status} - ${response.statusText}`);
        return;
      }

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        const aiResponse = data.choices[0].text.trim();
        addMessage('assistant', aiResponse);
      } else {
        addMessage('system', 'AI 응답을 받아오는 데 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      addMessage('system', 'AI 응답을 받아오는 중 오류가 발생했습니다.');
    }
  }

  sendButton.addEventListener('click', sendMessage);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // 초기 메시지
  addMessage('assistant', '안녕하세요! 컴퓨터 구매에 관해 어떤 도움이 필요하신가요?');
});