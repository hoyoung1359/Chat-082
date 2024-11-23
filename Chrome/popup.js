// API 키를 직접 입력합니다. 실제 배포 시에는 이 키를 안전하게 관리해야 합니다.
import { OPENAI_API_KEY } from './config.js';

document.addEventListener('DOMContentLoaded', () => {

  const startScreen = document.getElementById('start-screen');
  const chatContainer = document.getElementById('chat-container');
  const resultScreen = document.getElementById('result-screen');
  const startButton = document.getElementById('start-button');
  const helpButton = document.getElementById('help-button');
  const homeButton = document.getElementById('home-button');
  const settingsButton = document.getElementById('settings-button');
  const settingsModal = document.getElementById('settings-modal');
  const saveSettingsButton = document.getElementById('save-settings');
  const closeSettingsButton = document.getElementById('close-settings');
  const purposeInput = document.getElementById('purpose');
  const budgetInput = document.getElementById('budget');
  const userID = document.getElementById('userID')
  
  
  const chatMessages = document.getElementById('chat-messages');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');
  const resultButton = document.getElementById('result-button'); // 필터 버튼

  const applyButton = document.getElementById('apply-button'); // 필터 버튼

  function showStartScreen() {
    startScreen.style.display = 'flex';
    chatContainer.style.display = 'none';
    resultScreen.style.display = 'none';
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

    // 메시지를 로컬 스토리지에 저장
    saveMessageToLocalStorage(sender, message, isImage);
  }

  async function sendMessage() {
    const message = userInput.value.trim();
    const user_id = userID.value

        if (message) {
            addMessage('user', message); // 사용자 메시지를 화면에 추가
            userInput.value = ''; // 입력 필드를 비웁니다

            try {
                // FastAPI 서버에 POST 요청을 보냅니다
                const response = await fetch('http://43.202.99.126:8000/chatbot/message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: user_id, // 사용자 ID (필요 시 동적으로 설정)
                        message: message
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                // FastAPI로부터 받은 응답 메시지를 화면에 추가합니다
                addMessage('assistant', data.message);

            } catch (error) {
                console.error('Error:', error);
                addMessage('system', '서버와 통신 중 오류가 발생했습니다.');
            }
        }
  }

  function saveMessageToLocalStorage(sender, message, isImage) {
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    chatHistory.push({ sender, message, isImage });
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }

  function loadChatHistoryFromLocalStorage() {
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    chatMessages.innerHTML = ''; // 기존 메시지 초기화
    chatHistory.forEach(msg => addMessage(msg.sender, msg.message, msg.isImage));
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
    const filterDictionary = result.filterDictionary;

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
          max_tokens: 300,
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        addMessage('system', `API Error: ${response.status} - ${response.statusText}`);
        return;
      }

      const data = await response.json();
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

  // async function getAIResponse(userMessage) {
  //   chrome.storage.local.get("filterDictionary", async (result) => {
  //     const filterDictionary = result.filterDictionary;
  
  //     if (!filterDictionary) {
  //       console.log("No filter options found.");
  //       return;
  //     }
  
  //     // Define the prompt with the desired format
  //     const prompt = `
  //     현재 컴퓨터 부품 선택을 위한 필터 목록이 아래와 같습니다: ${JSON.stringify(filterDictionary)}
  //     사용자의 질문에 맞는 적합한 필터를 선택하여 다음과 같은 형식으로 답변해 주세요:
  //     response: 자연어 응답 내용
  //     filter choice: { category: "카테고리 이름", label: "필터 라벨" }.
  //     필터는 가능한 선택지 중 하나만 선택해 주세요.`;
  
  //     // Call the AI API
  //     try {
  //       const response = await fetch('https://api.openai.com/v1/chat/completions', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': `Bearer ${OPENAI_API_KEY}`
  //         },
  //         body: JSON.stringify({
  //           model: "gpt-3.5-turbo",
  //           messages: [
  //             { role: "system", content: prompt },
  //             { role: "user", content: userMessage }
  //           ],
  //           max_tokens: 300,
  //           temperature: 0,
  //         })
  //       });
  
  //       const data = await response.json();
  
  //       // Check if we have a valid response
  //       if (data.choices && data.choices.length > 0 && data.choices[0].message) {
  //         const aiResponse = data.choices[0].message.content.trim();
  //         console.log("Raw AI Response:", aiResponse); // Log raw response
  
  
  //         // Extract natural language response and structured filter choice
  //         const responseMatch = aiResponse.match(/response:\s*(.*?)\s*filter choice:/s);
  //         const filterMatch = aiResponse.match(/\{ category: "(.*?)", label: "(.*?)" \}/);
  
  //         if (responseMatch && filterMatch && filterMatch[1] && filterMatch[2]) {
  //           const naturalResponse = responseMatch[1].trim();
  //           const selectedFilter = { category: filterMatch[1], label: filterMatch[2] };
  //           const selectedFilters = [selectedFilter]; // Wrap as array
  
  //           // Display the natural language response separately if desired
  //           addMessage('assistant', naturalResponse);
  //           addMessage('assistant', "필터 항목: " + `${selectedFilter.category} -> ${selectedFilter.label}`);
  //           console.log("Parsed Selected Filter:", selectedFilters);
  
  //           // Store selectedFilters in Chrome storage for use in the applyButton
  //           chrome.storage.local.set({ selectedFilters }, () => {
  //             console.log("Selected filters saved to Chrome storage:", selectedFilters);
  //           });
  //         } else {
  //           console.log("Failed to parse AI response. AI response:", aiResponse);
  //           addMessage('system', 'AI 응답에서 필터 정보를 찾을 수 없습니다.');
  //         }
  //       } else {
  //         console.log("Unexpected AI response format:", data);
  //         addMessage('system', 'AI 응답을 받아오는 중 오류가 발생했습니다.');
  //       }
  
  //     } catch (error) {
  //       console.error('Error:', error);
  //       addMessage('system', 'AI 응답을 받아오는 중 오류가 발생했습니다.');
  //     }
  //   });
  // }
  
  function saveSettings() {
    const settings = {
      user_id: userID.value,
      purpose: purposeInput.value,
      budget: budgetInput.value
    };
    localStorage.setItem('settings', JSON.stringify(settings));
  }

  function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    userID.value = settings.userID || '';
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

  // "이어하기" 버튼 클릭 시 
  helpButton.addEventListener('click', () => {
    loadChatHistoryFromLocalStorage(); // 채팅 기록 불러오기
    startScreen.style.display = 'none';
    chatContainer.style.display = 'flex';
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

  ///////////////////////////////////// 견적서 관련 //////////////////////////////////////////
  // "견적" 버튼 클릭 시 팝업 열기
  document.getElementById('quotation-button').addEventListener('click', () => {
    // Open the quotation.html popup
    const popupWindow = window.open(
      'quotation.html', // Path to your popup HTML
      'Quotation Popup', // Popup window name
      'width=800,height=600,resizable=no,scrollbars=yes'
    );
  });

  ///////////////////////////////////// 필터 관련 //////////////////////////////////////////
  // quotation.html 팝업 열기 및 데이터 전달
  document.getElementById('result-button').addEventListener('click', async () => {
    try {
        const user_id = userID.value
        // FastAPI 서버에 POST 요청을 보내 견적 데이터를 가져옵니다.
        const response1 = await fetch('http://43.202.99.126:8000/chatbot/generate-estimate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: user_id, // 사용자 ID (필요 시 동적으로 설정)
            })
        });

        if (!response1.ok) {
            throw new Error(`HTTP error! status: ${response1.status}`);
        }

        const data = await response1.json();
        addMessage('assistant', data["response"]["고성능"]["CPU"]);

        document.getElementById('bg-cpu').textContent = data["response"]["가성비"]["CPU"];
        document.getElementById('bg-memory').textContent = data["response"]["가성비"]["메모리"];
        document.getElementById('bg-graphic').textContent = data["response"]["가성비"]["그래픽카드"];
        document.getElementById('bg-ssd').textContent = data["response"]["가성비"]["SSD"];
        document.getElementById('bg-power').textContent = data["response"]["가성비"]["파워"];
        document.getElementById('bg-main').textContent = data["response"]["가성비"]["메인보드"];
        document.getElementById('bg-reason').textContent = data["response"]["가성비"]["이유"];

        document.getElementById('ba-cpu').textContent = data["response"]["밸런스"]["CPU"];
        document.getElementById('ba-memory').textContent = data["response"]["밸런스"]["메모리"];
        document.getElementById('ba-graphic').textContent = data["response"]["밸런스"]["그래픽카드"];
        document.getElementById('ba-ssd').textContent = data["response"]["밸런스"]["SSD"];
        document.getElementById('ba-power').textContent = data["response"]["밸런스"]["파워"];
        document.getElementById('ba-main').textContent = data["response"]["밸런스"]["메인보드"];
        document.getElementById('ba-reason').textContent = data["response"]["밸런스"]["이유"];

        document.getElementById('hp-cpu').textContent = data["response"]["고성능"]["CPU"];
        document.getElementById('hp-memory').textContent = data["response"]["고성능"]["메모리"];
        document.getElementById('hp-graphic').textContent = data["response"]["고성능"]["그래픽카드"];
        document.getElementById('hp-ssd').textContent = data["response"]["고성능"]["SSD"];
        document.getElementById('hp-power').textContent = data["response"]["고성능"]["파워"];
        document.getElementById('hp-main').textContent = data["response"]["고성능"]["메인보드"];
        document.getElementById('hp-reason').textContent = data["response"]["고성능"]["이유"];
        
        chatContainer.style.display = 'none';
        resultScreen.style.display = 'flex';


        
        // //document.getElementById('budget-memory').textContent = data["response"]["가성비"]["메모리"];
        // // quotation.html 팝업 창 열기
        // const popupWindow = window.open(
        //     'quotation.html', // Path to your popup HTML
        //     'Quotation Popup', // Popup window name
        //     'width=800,height=600,resizable=no,scrollbars=yes'
        // );

        // // 팝업 창이 로드되었을 때 데이터를 전달합니다.
        // popupWindow.onload = function() {
        //     popupWindow.postMessage(data.response, '*'); // FastAPI 응답 데이터를 전달
        // };
        
        //document.getElementById('hcpu').textContent = data["response"]["고성능"]["CPU"];
    } catch (error) {
        console.error('Error:', error);
    }
  });
    
  // document.getElementById('back-button').addEventListener('click', () => {
  //   // Switch back to chat screen
  //   resultScreen.style.display = 'none';
  //   chatContainer.style.display = 'flex';
  // });

  document.getElementById('back-button').addEventListener('click', () => {
    // Logic to go back to the chat screen
    if (resultScreen.style.display === 'flex') {
      resultScreen.style.display = 'none';
      chatContainer.style.display = 'flex';
    } else if (chatContainer.style.display === 'flex') {
      chatContainer.style.display = 'none';
      startScreen.style.display = 'flex';
    }
  });
  
    // 크폼 저장소에서 filterDictionary 가져오기
    chrome.storage.local.get("filterDictionary", (result) => {
      const filterDictionary = result.filterDictionary;

      if (filterDictionary) {
        console.log("Filter options retrieved:", filterDictionary);
        
        // You can pass the filterDictionary to other functions here if needed
      } else {
        console.log("No filter options found.");
      }
  });

  ////////////////////////////////////////////////// 자동 클릭  //////////////////////////////////////////////////////////////////////
  const tempButton = document.getElementById("temp-button");

  // 샘플 인풋, #TODO 사용자 선택 격적으로 추후 출력으로 교체
  const input = {
    "가성비": {
      "CPU": { upperCategory: "AMD 모델명", value: "라이젠5" },
      "메모리": { upperCategory: "메모리용량", value: "16GB" },
      "그래픽카드": { upperCategory: "RTX시리즈", value: "RTX3060" },
      "메인보드": { upperCategory: "칩셋종류", value: "AMD-B450" },
      "SSD": { upperCategory: "용량", value: "480~512GB" },
      "파워": { upperCategory: "테스트(정격)출력", value: "400~499W" },
    },
  };
  
  const menuItems = Object.entries(input["가성비"]); //  #TODO 사용자 선택으로 교체
  let currentIndex = 0;
  
  const processInputs = (tabId) => {
    if (currentIndex < menuItems.length) {
      const [key, { upperCategory, value }] = menuItems[currentIndex];
  
      // 첫 번째 요청: 메뉴 클릭
      chrome.tabs.sendMessage(tabId, { action: "clickMenu", key }, (menuResponse) => { // 부품 클릭
        if (menuResponse && menuResponse.success) {
          setTimeout(() => {
            // 두 번째 요청: 상위 카테고리 클릭
            chrome.tabs.sendMessage(tabId, { action: "clickUpperCategory", upperCategory }, (upperResponse) => { // 상위 필터 클릭 
              if (upperResponse && upperResponse.success) {
                setTimeout(() => {
                  // 세 번째 요청: 값 클릭
                  chrome.tabs.sendMessage(tabId, { action: "clickValue", value }, (valueResponse) => { // 세부 시리즈 클릭 
                    if (valueResponse && valueResponse.success) {
                      setTimeout(() => {
                        // 네 번째 요청: 버튼 클릭
                        chrome.tabs.sendMessage(
                          tabId,
                          { action: "clickButton"}, // 맞춤 추천 버튼 끄기
                          (buttonResponse) => {
                            if (buttonResponse && buttonResponse.success) {
                              currentIndex++; // 다음 입력 처리
                              setTimeout(() => processInputs(tabId), 2000); // 2초 대기 후 다음 처리
                            }
                          }
                        );
                      }, 2000); // 클릭 후 2초 대기
                    }
                  });
                }, 2000); // 클릭 후 2초 대기
              }
            });
          }, 2000); // 클릭 후 2초 대기
        }
      });
    } else {
      console.log("모든 작업이 완료되었습니다.");
      currentIndex = 0; // 모든 작업 완료 시 초기화
    }
  };
  
  // Temp 버튼 클릭 이벤트
  tempButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      processInputs(tabId); // 입력 처리 시작
    });
  });
  ////////////////////////////////////////////////// 자동 클릭  //////////////////////////////////////////////////////////////////////

  loadSettings();
//   // 페이지 로드 시 채팅 기록 불러오기
//   // loadChatHistoryFromLocalStorage();
});



////////////////////////////////////////////////// 아이템 긁는 부분 ////////////////////////////////////////////////////////
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

//   // 필터링 후 아이템 선택을 위한 함수 
//   async function getBestItemId(items) {
//     const prompt = `
//       다음은 컴퓨터 부품 목록입니다. 각 부품의 이름, 평점, 리뷰 수, 가격 정보가 포함되어 있습니다:
//       ${items.map(item => `ID: ${item.productId}, 이름: ${item.productName}, 평점: ${item.rating}, 리뷰 수: ${item.reviews}, 가격: ${item.price}원`).join("\n")}
//       위의 정보를 바탕으로 가장 적합한 항목을 선택해 주세요.
//       오직 선택한 항목의 **제품 ID만** 반환해 주세요. 다른 설명이나 텍스트는 포함하지 말고, 제품 ID 숫자만 반환해 주세요.
//     `;

//     try {
//       const response = await fetch('https://api.openai.com/v1/chat/completions', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${OPENAI_API_KEY}`
//         },
//         body: JSON.stringify({
//           model: "gpt-3.5-turbo",
//           messages: [{ role: "system", content: prompt }],
//           max_tokens: 100,
//           temperature: 0,  // Lower temperature to ensure more deterministic output
//         })
//       });

//       const data = await response.json();
//       const aiResponse = data.choices[0].message.content.trim();
    
//       console.log("LLM's Selected Product ID Response:", aiResponse);

//       const productIdMatch = aiResponse.match(/^\d+$/);
//       const bestItemProductId = productIdMatch ? productIdMatch[0] : null;

//       // 상품 이름 출력하는 파트
//       if (bestItemProductId) {
//         // Find the product name using the product ID
//         const bestItem = items.find(item => item.productId === bestItemProductId);
//         const bestItemName = bestItem ? bestItem.productName : "알 수 없는 제품"; // "Unknown Product" in Korean

//         // Display the product name instead of the raw ID in the message
//         addMessage('system', `선택된 제품: ${bestItemName}`);
//         return bestItemProductId;

//       } else {
//         console.log("Failed to parse a valid product ID from AI response.");
//         addMessage('system', 'AI 응답에서 유효한 제품 ID를 찾을 수 없습니다.');
//         return null;
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       return null;
//     }
//   }
