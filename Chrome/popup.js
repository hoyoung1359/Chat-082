// API 키를 직접 입력합니다. 실제 배포 시에는 이 키를 안전하게 관리해야 합니다.
import { OPENAI_API_KEY } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  
  const startScreen = document.getElementById('start-screen');
  const chatContainer = document.getElementById('chat-container');
  const startButton = document.getElementById('start-button');
  const helpButton = document.getElementById('help-button');
  
  const chatMessages = document.getElementById('chat-messages');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');


  function addMessage(sender, message, isImage = false) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    
    if (isImage) {
      const image = document.createElement('img');
      image.src = message;
      image.alt = "AI generated image";
      image.style.maxWidth = "100%";
      messageElement.appendChild(image);
    } else {
      messageElement.textContent = message;
    }
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
      addMessage('user', message);
      userInput.value = '';

      if (message.includes("이미지") || message.includes("사진")) {
        await getImageResponse(message);
      } else {
        await getAIResponse(message);
      }
    }
  }

  async function getImageResponse(userMessage) {
    const imagePrompt = "";

    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          prompt: "산타할아버지",
          n: 1,
          size: "256x256"
        })
      });

      if (!response.ok) {
        addMessage('system', `API Error: ${response.status} - ${response.statusText}`);
        return;
      }

      const data = await response.json();
      const imageUrl = data.data[0].url;
      addMessage('assistant', imageUrl, true);
    } catch (error) {
      console.error('Error:', error);
      addMessage('system', '이미지를 받아오는 중 오류가 발생했습니다.');
    }
  }


  async function getAIResponse(userMessage) {
    const prompt =  `당신은 컴퓨터 구매를 돕는 전문가입니다. 조립용 컴퓨터 부품을 고르고 있는 구매자의 질문에 친절하고 알기쉽게 간단히 답변해주세요. 비유를 사용해도 좋습니다. 한 질문에 대한 답변은 너무 길지 않게 간단히 해주세요.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4", // 최신 모델로 변경
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: userMessage }
          ],
          max_tokens: 300,
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        addMessage('system', `API Error: ${response.status} - ${response.statusText}`);
        return;
      }

      const data = await response.json();
      // 응답 데이터 구조 확인 후 메시지 추가
      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        const aiResponse = data.choices[0].message.content.trim();
        addMessage('assistant', aiResponse);
      } else {
        addMessage('system', 'AI 응답을 받아오는 데 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      addMessage('system', 'AI 응답을 받아오는 중 오류가 발생했습니다.');
    }
  }

   // "시작하기" 버튼 클릭 시, 시작 화면을 숨기고 채팅 화면을 표시
  startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    chatContainer.style.display = 'flex';
    addMessage('assistant', '안녕하세요! 컴퓨터 구매에 관해 어떤 도움이 필요하신가요? (예: “CPU 추천 좀 해주세요”, “4K 영상 편집과 고사양 게임이 가능한 PC를 추천해 주세요”)');
  });

  // "도움말" 버튼 클릭 시 알림창 표시
  helpButton.addEventListener('click', () => {
    alert("이 프로그램은 컴퓨터 구매에 대한 도움을 제공합니다. 질문을 입력하여 도움을 받아보세요!");
  });



  sendButton.addEventListener('click', sendMessage);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

});