// API 키를 직접 입력합니다. 실제 배포 시에는 이 키를 안전하게 관리해야 합니다.
import { OPENAI_API_KEY } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  
  const startScreen = document.getElementById('start-screen');
  const chatContainer = document.getElementById('chat-container');
  const startButton = document.getElementById('start-button');
  const helpButton = document.getElementById('help-button');
  const homeButton = document.getElementById('home-button');
  const settingsButton = document.getElementById('settings-button');
  const settingsModal = document.getElementById('settings-modal');
  const saveSettingsButton = document.getElementById('save-settings');
  const closeSettingsButton = document.getElementById('close-settings');
  const purposeInput = document.getElementById('purpose');
  const budgetInput = document.getElementById('budget');
  
  
  const chatMessages = document.getElementById('chat-messages');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');

  function showStartScreen() {
    startScreen.style.display = 'flex';
    chatContainer.style.display = 'none';
  }

  function showChatScreen() {
    startScreen.style.display = 'none';
    chatContainer.style.display = 'flex';
  }


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
          prompt: "Draw the character of 082, a computer purchase guide chatbot. Chat-082 is an custom-built computer purchase guide chatbot using llm.\
          It helps buyers select computer parts such as cpu and graphic cards from computer purchase sites. \
          Draw the features of my program well in the character with a simple design that is not complicated to use on the start screen.",
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
  
  function saveSettings() {
    const settings = {
      purpose: purposeInput.value,
      budget: budgetInput.value
    };
    localStorage.setItem('settings', JSON.stringify(settings));
  }

  function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    purposeInput.value = settings.purpose || '';
    budgetInput.value = settings.budget || '';
    return settings;
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

  // "홈" 버튼 클릭 시 시작 화면으로 돌아가기
  homeButton.addEventListener('click', () => {
    showStartScreen();
    chatMessages.innerHTML = ''; // 채팅 내용 초기화
  });

  // "설정" 버튼 클릭 시 설정 화면 표시 
  settingsButton.addEventListener('click', () => {
    loadSettings();
    settingsModal.style.display = 'block';
  });

  sendButton.addEventListener('click', sendMessage);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  saveSettingsButton.addEventListener('click', () => {
    saveSettings();
    settingsModal.style.display = 'none';
  });

  closeSettingsButton.addEventListener('click', () => {
    settingsModal.style.display = 'none';
  });

  applyButton.addEventListener('click', () => {
    chrome.storage.local.get(["selectedFilters", "filterDictionary"], (result) => {
      const selectedFilters = result.selectedFilters || [];
      const filterDictionary = result.filterDictionary;
  
      // Map labels to IDs based on filterDictionary
      const filterIdsToSelect = selectedFilters.map(filter => {
        const options = filterDictionary[filter.category] || [];
        const option = options.find(opt => opt.label === filter.label);
        return option ? option.id : null;
      }).filter(id => id !== null);
  
      // Send IDs to content script for automatic selection
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "applySelectedFilters", filterIds: filterIdsToSelect }, (response) => {
          if (response && response.status === "Filter applied") {
            console.log("Filter successfully applied.");

            // Trigger the LLM to select the best item right after filter application
            // Delay for 2 seconds before calling selectBestFilteredItem
            setTimeout(() => {
              selectBestFilteredItem();
            }, 2000);
          } else {
            console.log("Failed to apply filter.");
          }
        });
      });
    });
  });
  
  async function selectBestFilteredItem() {
    console.log("Requesting item extraction...");
  
    // Send a message to content.js to extract items
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "extractItems" }, async (items) => {
        if (!items || items.length === 0) {
          console.log("No items found after filtering.");
          return;
        }
  
        console.log("Extracted Items:", items);
  
        // Get the best item ID using the getBestItemId function
        const bestItemProductId = await getBestItemId(items);
        if (bestItemProductId) {
          console.log("Best Item Product ID selected:", bestItemProductId);
  
          // Request content script to click the "담기" button for the selected item
          chrome.tabs.sendMessage(tabs[0].id, { action: "addItemToCart", productId: bestItemProductId });
        }
      });
    });
  }
  
  // 필터링 후 아이템 선택을 위한 함수 
  async function getBestItemId(items) {
    const prompt = `
      다음은 컴퓨터 부품 목록입니다. 각 부품의 이름, 평점, 리뷰 수, 가격 정보가 포함되어 있습니다:
      ${items.map(item => `ID: ${item.productId}, 이름: ${item.productName}, 평점: ${item.rating}, 리뷰 수: ${item.reviews}, 가격: ${item.price}원`).join("\n")}
      위의 정보를 바탕으로 가장 적합한 항목을 선택해 주세요.
      오직 선택한 항목의 **제품 ID만** 반환해 주세요. 다른 설명이나 텍스트는 포함하지 말고, 제품 ID 숫자만 반환해 주세요.
    `;
  
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "system", content: prompt }],
          max_tokens: 100,
          temperature: 0,  // Lower temperature to ensure more deterministic output
        })
      });
  
      const data = await response.json();
      const aiResponse = data.choices[0].message.content.trim();
      
      console.log("LLM's Selected Product ID Response:", aiResponse);
  
      const productIdMatch = aiResponse.match(/^\d+$/);
      const bestItemProductId = productIdMatch ? productIdMatch[0] : null;

      // 상품 이름 출력하는 파트
      if (bestItemProductId) {
        // Find the product name using the product ID
        const bestItem = items.find(item => item.productId === bestItemProductId);
        const bestItemName = bestItem ? bestItem.productName : "알 수 없는 제품"; // "Unknown Product" in Korean

        // Display the product name instead of the raw ID in the message
        addMessage('system', `선택된 제품: ${bestItemName}`);
        return bestItemProductId;

      } else {
        console.log("Failed to parse a valid product ID from AI response.");
        addMessage('system', 'AI 응답에서 유효한 제품 ID를 찾을 수 없습니다.');
        return null;
      }
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  // applyButton.addEventListener('click', () => {
  //   chrome.storage.local.get(["filterDictionary", "mainCategory"], (result) => {
  //     const { filterDictionary, mainCategory } = result;
      
  //     if (filterDictionary && mainCategory) {
  //       let selectedFilters = [];

  //       // Adjust selected filters based on the main category
  //       if (mainCategory === "CPU") {
  //         selectedFilters = [
  //           { category: "INTEL 모델명", label: "코어 i5" }
  //         ];
  //       } else if (mainCategory === "메인보드") {
  //         selectedFilters = [
  //           { category: "제조사", label: "MSI" }
  //         ];
  //       } else if (mainCategory === "메모리") {
  //         selectedFilters = [
  //           { category: "제조사", label: "삼성전자" }
  //         ];
  //       } else if (mainCategory === "그래픽카드") {
  //         selectedFilters = [
  //           { category: "RTX시리즈", label: "RTX4070" }
  //         ];
  //       } else if (mainCategory === "케이스") {
  //         selectedFilters = [
  //           { category: "제조사", label: "3RSYS" }
  //         ];  
  //       } else if (mainCategory === "파워") {
  //         selectedFilters = [
  //           { category: "제조사", label: "FSP" }
  //         ];
  //       } else if (mainCategory === "SSD") {
  //         selectedFilters = [
  //           { category: "제조사", label: "SK hynix" }
  //         ];  
  //       } else if (mainCategory === "CPU 쿨러") {
  //         selectedFilters = [
  //           { category: "제조사", label: "DEEPCOOL" }
  //         ];  
  //       } 
        
  //       // Map labels to IDs based on filterDictionary
  //       const filterIdsToSelect = selectedFilters.map(filter => {
  //         const options = filterDictionary[filter.category] || [];
  //         const option = options.find(opt => opt.label === filter.label);
  //         return option ? option.id : null;
  //       }).filter(id => id !== null); // Remove any null entries
  
  //       // Send IDs to content script for automatic selection
  //       chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  //         chrome.tabs.sendMessage(tabs[0].id, { action: "applySelectedFilters", filterIds: filterIdsToSelect }, (response) => {
  //           if (response && response.status === "Filter applied") {
  //             console.log("Filter successfully applied.");
  //           } else {
  //             console.log("Failed to apply filter.");
  //           }
  //         });
  //       });
  //     } else {
  //       console.log("No filter options found.");
  //     }
  //   });
  // });
  loadSettings();
});
