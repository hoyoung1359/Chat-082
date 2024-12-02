import { setupQuotationModal } from './quotationModal.js';
import { setupComponentModals, setupModalsWithCloseButton, updateModalContent, updateAllModals} from './componentModal.js';

document.addEventListener('DOMContentLoaded', () => {
  setupQuotationModal();
  setupComponentModals();
  setupModalsWithCloseButton();
  

  const addr = "15.165.42.103:8000";

  const startScreen = document.getElementById('start-screen');
  const chatContainer = document.getElementById('chat-container');
  const resultScreen = document.getElementById('result-screen');
  const startButton = document.getElementById('start-button');
  const siteButton = document.getElementById('site-button');
  const homeButton = document.getElementById('home-button');
  const settingsButton = document.getElementById('settings-button');
  const settingsModal = document.getElementById('settings-modal');
  const saveSettingsButton = document.getElementById('save-settings');
  const closeSettingsButton = document.getElementById('close-settings');
  const purposeInput = document.getElementById('purpose');
  const budgetInput = document.getElementById('budget');
  const userID = document.getElementById('userID')
  const menus = ["CPU", "메인보드", "메모리", "그래픽카드", "파워", "SSD"]
  
  const chatMessages = document.getElementById('chat-messages');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');
  let isActive = false; // 초기 상태는 false (비활성화)
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
                const response = await fetch(`http://${addr}/chatbot/message`, {
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
                
                console.log("Chat082의 응답: ", data)
                // FastAPI로부터 받은 응답 메시지를 화면에 추가합니다
                addMessage('assistant', data.message);
                //addMessage('assistant', data.next_step);
                if (data.next_step) {
                  activateButton();
                } else {
                  deactivateButton();
                }

                //// 제품 수정. TODO. "temp"를 "data"로 교체 
                const temp = {
                  "message": "안녕하세요!",
                  "budget": "100만원",
                  "purpose": "롤",
                  "next_step": true,
                  "편집": {
                      "bool": true,
                      "CPU": "코어 i3",
                      "메모리": "8GB",
                  }
                }

                // 제품 수정 
                let editInput = {};
                if (temp.편집.bool == true){
                  console.log("편집 필요")
                  editInput = loadEditInput((temp.편집))
                  console.log("전천리된 Edit 정보: ", editInput)
                  let editmenus = Object.keys(editInput);
                  console.log("수정이 필요한 부품: ", editmenus);

                  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    const tabId = tabs[0].id;
              
                    editComponent(tabId, editInput, editmenus); // 입력 처리 시작
                  });
                }
    

              
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
  siteButton.addEventListener('click', () => {
    window.open('https://www.compuzone.co.kr/estimate/self.htm', '_blank'); // '_blank'는 새 탭에서 열기
    //loadChatHistoryFromLocalStorage(); // 채팅 기록 불러오기
    // startScreen.style.display = 'none';
    // chatContainer.style.display = 'flex';
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


  /////////////////////////////////////////////////////////// 견적서 3개 뽑기  ////////////////////////////////////////////////////////////////
    // FastAPI 서버에서 가져온 데이터 저장
  let quotationData = {}; // 전체 데이터 저장
  let selectedQuotation = {}; // 선택된 견적 데이터

  // 견적 데이터를 동적으로 로드하고 반환
  function loadQuotationInput(selectedData) {
    const input = { "선택된 견적": {} }; // 새로운 입력 데이터 초기화
    for (const [key, value] of Object.entries(selectedData)) {
      if (key !== "이유") { // 이유 제외
        let cpuType = "";
        if (key === "CPU" && value.includes("라이젠")) {
          cpuType = "AMD";
        } else if (key === "CPU" && value.includes("i")) {
          cpuType = "INTEL";
        }
        input["선택된 견적"][key] = {
          upperCategory: getUpperCategory(key, cpuType), // 필요한 상위 카테고리 제공
          value: value,
        };
      }
    }
    console.log("선택된 입력 데이터:", input);
    return input["선택된 견적"]; // 'series'와 호환되는 데이터 반환
  }

  // 견적 유형별 상위 카테고리 매핑 함수
  function getUpperCategory(part, cpuType) {
    const categoryMapping = {
      // "CPU": "AMD 모델명",
      "CPU": cpuType === "AMD" ? "AMD 모델명" : cpuType === "INTEL" ? "INTEL 모델명" : "",
      "메인보드": "칩셋종류",
      "메모리": "메모리용량",
      "그래픽카드": "RTX시리즈",
      "SSD": "용량",
      "파워": "테스트(정격)출력",
    };
    return categoryMapping[part] || "";
  }

  function updateButtonState() {
    resultButton.disabled = !isActive; // isActive가 false면 버튼 비활성화, true면 활성화
    // if (!isActive) {
    //   resultButton.classList.add('disabled');
    // } else {
    //   resultButton.classList.remove('disabled');
    // }
  }
  
  // 초기 상태 설정
  updateButtonState();
  
  // 상태를 변경하는 함수 (예: 어떤 조건이 충족되었을 때 호출)
  function activateButton() {
    isActive = true;
    updateButtonState();
  }
  
  // 버튼을 비활성화하는 함수
  function deactivateButton() {
    isActive = false;
    updateButtonState();
  }

  // result-button 클릭 시 데이터를 가져와서 화면에 표시
  document.getElementById('result-button').addEventListener('click', async () => {
    try {
        const user_id = userID.value;

        // Fetch quotation data from the server
        const response1 = await fetch(`http://${addr}/chatbot/generate-estimate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: user_id, // 사용자 ID
            }),
        });

        if (!response1.ok) {
            throw new Error(`HTTP error! status: ${response1.status}`);
        }

        const data = await response1.json();
        quotationData = data.response; // Save all data
        console.log("견적 3개 데이터: ", data)

        // Update modal content with all three quotations
        updateQuotationUI('가성비', 'bg', data.response["가성비"]);
        updateQuotationUI('밸런스', 'ba', data.response["밸런스"]);
        updateQuotationUI('고성능', 'hp', data.response["고성능"]);

        // Show the modal
        const quotationModal = document.getElementById('quotation-modal');
        quotationModal.style.visibility = 'visible';
        quotationModal.style.opacity = '1';
    } catch (error) {
        console.error('Error:', error);
    }
  });

  document.getElementById('result-button').addEventListener('click', async () => {
    try {
        const user_id = userID.value;

        // 모달 표시
        const quotationModal = document.getElementById('quotation-modal');
        quotationModal.style.visibility = 'visible';
        quotationModal.style.opacity = '1';

        // 로딩 스피너 표시 및 배경 어둡게 처리
        const loadingSpinner = document.getElementById('loading-spinner');
        loadingSpinner.style.display = 'block'; // 스피너 표시
        // quotationModal.classList.add('loading'); // 어두운 배경 활성화

        // 플레이스홀더 메시지 숨기기
        const placeholderMessage = document.getElementById('placeholder-message');
        if (placeholderMessage) placeholderMessage.style.display = 'none';

        // 서버에서 견적 데이터 가져오기
        const response1 = await fetch(`http://${addr}/chatbot/generate-estimate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: user_id, // 사용자 ID 전달
            }),
        });

        if (!response1.ok) {
            throw new Error(`HTTP error! status: ${response1.status}`);
        }

        const data = await response1.json();
        quotationData = data.response; // 서버에서 받은 데이터 저장

        // 로딩 스피너 숨기기 및 배경 복구
        loadingSpinner.style.display = 'none';
        // quotationModal.classList.remove('loading'); // 어두운 배경 제거

        // 견적 블록 표시
        const quotations = document.querySelectorAll('.quotation');
        quotations.forEach((quotation) => {
            quotation.style.display = 'block'; // 각 견적 블록 표시
        });

        // 모달 내용을 견적으로 업데이트
        updateQuotationUI('가성비', 'bg', data.response["가성비"]);
        updateQuotationUI('밸런스', 'ba', data.response["밸런스"]);
        updateQuotationUI('고성능', 'hp', data.response["고성능"]);
    } catch (error) {
        console.error('Error:', error);

        // 에러 발생 시 로딩 스피너 및 어두운 배경 숨기기
        const loadingSpinner = document.getElementById('loading-spinner');
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        const quotationModal = document.getElementById('quotation-modal');
        // quotationModal.classList.remove('loading'); // 어두운 배경 제거

        // 플레이스홀더 메시지 다시 표시
        const placeholderMessage = document.getElementById('placeholder-message');
        if (placeholderMessage) placeholderMessage.style.display = 'block';

        // 견적 블록 숨기기
        const quotations = document.querySelectorAll('.quotation');
        quotations.forEach((quotation) => {
            quotation.style.display = 'none'; // 견적 블록 숨김
        });

        // 에러 메시지 표시 (선택 사항)
        alert('견적 데이터를 불러오는 데 실패했습니다.');
    }
  });

  let series = {}; // 자동 클릭, 글로벌 변수

  ////////////////////////////////////////////////// 견적서 3개 중에 하나 선택하는 함수  //////////////////////////////////////////////////////////////////////
  const quotationContainer = document.getElementById('quotation-container');
  quotationContainer.addEventListener('click', (event) => {
    const target = event.target.closest('.quotation');
    if (target) {

      const allQuotations = quotationContainer.querySelectorAll('.quotation');
      allQuotations.forEach((quotation) => quotation.classList.remove('selected'));

      target.classList.add('selected');

      // 고성능, 밸런스, 가성비 중 하나 선택
      const quotationType = target.querySelector('h3').textContent.trim();
      if (quotationData[quotationType]) {
        selectedQuotation = quotationData[quotationType]; // 선택된 견적 데이터 설정
        console.log(`선택된 견적: ${quotationType}`, selectedQuotation);

        // 선택된 견적 데이터를 동적으로 로드
        series = loadQuotationInput(selectedQuotation);

        //  공백 제거
        for (const key in series) {
          if (series[key]?.value) {
            if (!series[key].value.includes("코어")) {
              series[key].value = series[key].value.replace(/\s+/g, ""); // Remove whitespace for non-INTEL values
            }
          }
        }

        console.log("동적으로 로드된 series:", series);
      }
    }
  });

  // 견적 데이터 HTML 업데이트 함수
  function updateQuotationUI(type, prefix, data) {
    document.getElementById(`${prefix}-cpu`).textContent = data["CPU"];
    document.getElementById(`${prefix}-memory`).textContent = data["메모리"];
    document.getElementById(`${prefix}-graphic`).textContent = data["그래픽카드"];
    document.getElementById(`${prefix}-ssd`).textContent = data["SSD"];
    document.getElementById(`${prefix}-power`).textContent = data["파워"];
    document.getElementById(`${prefix}-main`).textContent = data["메인보드"];
    // document.getElementById(`${prefix}-reason`).textContent = data["이유"]; #TODO
  }

  
  ////////////////////////////////////////////////// 자동 클릭 및 긁은 아이템 백으로 보내기  //////////////////////////////////////////////////////////////////////
  const tempButton = document.getElementById("temp-button");

  // Temp 버튼 클릭 이벤트
  tempButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;

      processInputs(tabId); // 입력 처리 시작
    });
  });

  let currentIndex = 0;
  let modalInput = {};
  const extractedData = {}; // 저장할 딕셔너리
  
  const processInputs = (tabId) => {
    if (currentIndex < menus.length) {
      const key = menus[currentIndex]; // 현재 메뉴
      const { upperCategory, value } = series[key];
  
      // 첫 번째 요청: 메뉴 클릭
      chrome.tabs.sendMessage(tabId, { action: "clickMenu", key }, (menuResponse) => {
        if (menuResponse && menuResponse.success) {
          setTimeout(() => {
            // 두 번째 요청: 상위 카테고리 클릭
            chrome.tabs.sendMessage(tabId, { action: "clickUpperCategory", upperCategory }, (upperResponse) => {
              if (upperResponse && upperResponse.success) {
                setTimeout(() => {
                  // 세 번째 요청: 값 클릭
                  chrome.tabs.sendMessage(tabId, { action: "clickValue", value }, (valueResponse) => {
                    if (valueResponse && valueResponse.success) {
                      setTimeout(() => {
                        // 네 번째 요청: 버튼 클릭
                        chrome.tabs.sendMessage(tabId, { action: "clickButton" }, (buttonResponse) => {
                          if (buttonResponse && buttonResponse.success) {
                            setTimeout(() => {
                              // 다섯 번째 요청: 아이템 추출
                              chrome.tabs.sendMessage(tabId, { action: "extractItems" }, (itemsResponse) => {
                                if (itemsResponse && itemsResponse.items) {
                                  // 필터링 된 데이터를 저장
                                  extractedData[key] = {};
                                  itemsResponse.items.forEach((item, index) => {
                                    extractedData[key][`${item.productId}-${index + 1}`] = {
                                      productName: item.productName,
                                      price: item.price,
                                    };
                                  });
  
                                  console.log(`Extracted items for ${key}:`, extractedData[key]);
                                }
  
                                currentIndex++; // 다음 입력 처리
                                setTimeout(() => processInputs(tabId), 2000); // 2초 대기 후 다음 처리
                              });
                            }, 2000); // 버튼 클릭 후 2초 대기
                          }
                        });
                      }, 2000); // 값 클릭 후 2초 대기
                    }
                  });
                }, 2000); // 상위 카테고리 클릭 후 2초 대기
              }
            });
          }, 2000); // 메뉴 클릭 후 2초 대기
        }
      });
    } else {
      console.log("탐색 작업이 완료되었습니다.");
      console.log("최종 추출된 데이터:", extractedData);
      currentIndex = 0; // 처리 완료 후 인덱스 초기화

      const user_id = userID.value

      // 추출된 데이터를 백엔드로 전송
      sendPartsData(user_id, extractedData)
        .then((response) => {
          if (response.error) {
            console.error("백엔드 에러:", response.error);
          } else {
            console.log("선택 결과:", response);
            currentIndex = 0; // 처리 완료 후 인덱스 초기화
            processSearch(tabId, response); // 검색 프로세스 시작
            modalInput = response
          }

        })
        .catch((err) => {
          console.error("예상치 못한 에러:", err);
        });
    }
  };


  ////////////////////////////////////////////////// 아이템 보내고 담을 아이템 받는 api //////////////////////////////////////////////////////////////////////
  // 백엔드로 데이터를 전송하는 함수
  async function sendPartsData(userId, partsData) {
    const backendUrl = `http://${addr}/chatbot/select-parts`;

    try {
      // POST 요청으로 데이터 전송
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId, // 사용자 ID
          parts_data: partsData, // 부품 데이터
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("백엔드 성공:", result);
        return result; // 성공적으로 응답 반환
      } else {
        console.error("백엔드 에러:", result);
        return { error: "백엔드에서 유효한 응답을 받지 못했습니다." };
      }
    } catch (error) {
      console.error("백엔드 호출 중 에러:", error);
      return { error: "백엔드와 통신 중 에러가 발생했습니다." };
    }
  }


  ////////////////////////////////////////////////// 자동 클릭 및 선택된 아이템 담기  //////////////////////////////////////////////////////////////////////

  const processSearch = (tabId, searchInput) => {
    // const responseEntries = Object.entries(searchInput).filter(([key]) => !key.endsWith("이유")); // '이유' 키 제외
    console.log("Precess Search, DATA: ", searchInput)
    updateAllModals(searchInput);
    const responseEntries = Object.keys(searchInput["response"]);
    console.log("ResponseEntries", responseEntries)
  
    let searchIndex = 0; // 현재 검색 중인 인덱스
  
    // 데피니션
    const processPartSearch = () => {
      if (searchIndex < responseEntries.length) {
        const key = menus[searchIndex]; // 현재 메뉴
        // const productName = searchInput.find(([entryKey]) => entryKey === key)?.[1]; // 제품명 찾기
        const productName = searchInput['response'][key]["제품명"]
        console.log(productName)
  
        // 첫 번째 요청: 메뉴 클릭
        chrome.tabs.sendMessage(tabId, { action: "clickMenu", key }, (menuResponse) => {
          if (menuResponse && menuResponse.success) {
            setTimeout(() => {
              // 두 번째 요청: 검색 박스에 제품 이름 입력 및 검색 버튼 클릭
              chrome.tabs.sendMessage(tabId, { action: "searchProduct", productName }, (searchResponse) => {
                if (searchResponse && searchResponse.success) {
                  setTimeout(() => {
                    // 세 번째 요청: 제품 목록에서 "담기" 버튼 클릭
                    chrome.tabs.sendMessage(tabId, { action: "clickAddButton", productName }, (addButtonResponse) => {
                      if (addButtonResponse && addButtonResponse.success) {
                        console.log(`${key}: '${productName}' 담기 성공`);
                        searchIndex++; // 다음 파트로 이동
                        setTimeout(processPartSearch, 3000); // 2초 대기 후 다음 처리
                      } else {
                        console.error(`${key}: '${productName}' 담기 실패`);
                        setTimeout(processPartSearch, 3000); // 2초 대기 후 다음 처리
                      }
                    });
                  }, 2000); // 검색 후 2초 대기
                } else {
                  console.error(`${key}: '${productName}' 검색 실패`);
                }
              });
            }, 2000); // 메뉴 클릭 후 2초 대기
          }
        });
      } else {
        console.log("모든 검색 작업 완료");
        searchIndex = 0; // 검색 인덱스 초기화
        updateAllModals(modalInput);
        return;
      }
    };

    console.log("담기 시작")
    processPartSearch(); // 첫 번째 검색 시작
  };


  // //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // 이걸로 "편집" 항목을 받아서 변환
  function loadEditInput(editData) {
    const input = { "편집": {} }; // 새로운 입력 데이터 초기화
    for (const [key, value] of Object.entries(editData)) {
      if (key !== "bool") { // 이유 제외
        let cpuType = "";
        if (key === "CPU" && value.includes("라이젠")) {
          cpuType = "AMD";
        } else if (key === "CPU" && value.includes("i")) {
          cpuType = "INTEL";
        }
        input["편집"][key] = {
          upperCategory: getUpperCategory(key, cpuType), // 필요한 상위 카테고리 제공
          value: value,
        };
      }
    }
    console.log("편집 데이터:", input);
    return input["편집"]; // 'series'와 호환되는 데이터 반환
  }

  
  let editIndex = 0;
  let extractedItems = {};
  const editComponent = (tabId, editdata, editmenus) => {
    if (editIndex < editmenus.length) {
      const key = editmenus[editIndex]; // 현재 메뉴
      const { upperCategory, value } = editdata[key];
  
      // 첫 번째 요청: 메뉴 클릭
      chrome.tabs.sendMessage(tabId, { action: "clickMenu", key }, (menuResponse) => {
        if (menuResponse && menuResponse.success) {
          setTimeout(() => {
            // 두 번째 요청: 상위 카테고리 클릭
            chrome.tabs.sendMessage(tabId, { action: "clickUpperCategory", upperCategory }, (upperResponse) => {
              if (upperResponse && upperResponse.success) {
                setTimeout(() => {
                  // 세 번째 요청: 값 클릭
                  chrome.tabs.sendMessage(tabId, { action: "clickValue", value }, (valueResponse) => {
                    if (valueResponse && valueResponse.success) {
                      setTimeout(() => {
                        // 네 번째 요청: 버튼 클릭
                        chrome.tabs.sendMessage(tabId, { action: "clickButton" }, (buttonResponse) => {
                          if (buttonResponse && buttonResponse.success) {
                            setTimeout(() => {
                              // 다섯 번째 요청: 아이템 추출
                              chrome.tabs.sendMessage(tabId, { action: "extractItems" }, (itemsResponse) => {
                                if (itemsResponse && itemsResponse.items) {
                                  // 필터링 된 데이터를 저장
                                  extractedItems[key] = {};
                                  itemsResponse.items.forEach((item, index) => {
                                    extractedItems[key][`${item.productId}-${index + 1}`] = {
                                      productName: item.productName,
                                      price: item.price,
                                    };
                                  });
  
                                  console.log(`Extracted items for ${key}:`, extractedItems[key]);
                                }

                                editIndex++; // 다음 입력 처리
                                setTimeout(() => editComponent(tabId, editdata, editmenus), 2000); // 2초 대기 후 다음 처리
                              });
                            }, 2000); // 버튼 클릭 후 2초 대기
                          }
                        });
                      }, 2000); // 값 클릭 후 2초 대기
                    }
                  });
                }, 2000); // 상위 카테고리 클릭 후 2초 대기
              }
            });
          }, 2000); // 메뉴 클릭 후 2초 대기
        }
      });
    } else{
      console.log("탐색 작업이 완료되었습니다.");
      console.log("최종 추출된 데이터:", extractedItems);
      editIndex = 0; // 처리 완료 후 인덱스 초기화

      const user_id = userID.value

      // 추출된 데이터를 백엔드로 전송
      sendPartsData(user_id, extractedItems)
        .then((response) => {
          if (response.error) {
            console.error("백엔드 에러:", response.error);
          } else {
            console.log("선택 결과:", response);
            processSearch(tabId, response); // 검색 프로세스 시작
            modalInput = response
          }

        })
        .catch((err) => {
          console.error("예상치 못한 에러:", err);
        });
    } 
  };

  loadSettings();
  // 페이지 로드 시 채팅 기록 불러오기
  // loadChatHistoryFromLocalStorage();
});




////////////////////////////////////////////////// 아이템 긁는 부분 ////////////////////////////////////////////////////////
// async function selectBestFilteredItem() {
//   console.log("Requesting item extraction...");

//   // Send a message to content.js to extract items
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     chrome.tabs.sendMessage(tabs[0].id, { action: "extractItems" }, async (items) => {
//       if (!items || items.length === 0) {
//         console.log("No items found after filtering.");
//         return;
//       }

//       console.log("Extracted Items:", items);

//       // Get the best item ID using the getBestItemId function
//       const bestItemProductId = await getBestItemId(items);
//       if (bestItemProductId) {
//         console.log("Best Item Product ID selected:", bestItemProductId);

//         // Request content script to click the "담기" button for the selected item
//         chrome.tabs.sendMessage(tabs[0].id, { action: "addItemToCart", productId: bestItemProductId });
//       }
//     });
//   });
// }

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


  // // ///////////////////////////////////// 견적서 관련 //////////////////////////////////////////
  // // "견적" 버튼 클릭 시 팝업 열기
  // document.getElementById('quotation-button').addEventListener('click', () => {
  //   // Open the quotation.html popup
  //   const quotationWindow = window.open(
  //     'quotation.html', // Path to your popup HTML
  //     'Quotation Popup', // Popup window name
  //     'width=800,height=600,resizable=no,scrollbars=yes'
  //   );
  // });


   // quotation.html 팝업 열기 및 데이터 전달
  // document.getElementById('result-button').addEventListener('click', async () => {
  //   try {
  //       const user_id = userID.value
  //       // FastAPI 서버에 POST 요청을 보내 견적 데이터를 가져옵니다.
  //       const response1 = await fetch(`http://${addr}/chatbot/generate-estimate`, {
  //           method: 'POST',
  //           headers: {
  //               'Content-Type': 'application/json',
  //           },
  //           body: JSON.stringify({
  //               user_id: user_id, // 사용자 ID (필요 시 동적으로 설정)
  //           })
  //       });

  //       if (!response1.ok) {
  //           throw new Error(`HTTP error! status: ${response1.status}`);
  //       }

  //       const data = await response1.json();
  //       addMessage('assistant', data["response"]["고성능"]["CPU"]);

  //       document.getElementById('bg-cpu').textContent = data["response"]["가성비"]["CPU"];
  //       document.getElementById('bg-memory').textContent = data["response"]["가성비"]["메모리"];
  //       document.getElementById('bg-graphic').textContent = data["response"]["가성비"]["그래픽카드"];
  //       document.getElementById('bg-ssd').textContent = data["response"]["가성비"]["SSD"];
  //       document.getElementById('bg-power').textContent = data["response"]["가성비"]["파워"];
  //       document.getElementById('bg-main').textContent = data["response"]["가성비"]["메인보드"];
  //       document.getElementById('bg-reason').textContent = data["response"]["가성비"]["이유"];

  //       document.getElementById('ba-cpu').textContent = data["response"]["밸런스"]["CPU"];
  //       document.getElementById('ba-memory').textContent = data["response"]["밸런스"]["메모리"];
  //       document.getElementById('ba-graphic').textContent = data["response"]["밸런스"]["그래픽카드"];
  //       document.getElementById('ba-ssd').textContent = data["response"]["밸런스"]["SSD"];
  //       document.getElementById('ba-power').textContent = data["response"]["밸런스"]["파워"];
  //       document.getElementById('ba-main').textContent = data["response"]["밸런스"]["메인보드"];
  //       document.getElementById('ba-reason').textContent = data["response"]["밸런스"]["이유"];

  //       document.getElementById('hp-cpu').textContent = data["response"]["고성능"]["CPU"];
  //       document.getElementById('hp-memory').textContent = data["response"]["고성능"]["메모리"];
  //       document.getElementById('hp-graphic').textContent = data["response"]["고성능"]["그래픽카드"];
  //       document.getElementById('hp-ssd').textContent = data["response"]["고성능"]["SSD"];
  //       document.getElementById('hp-power').textContent = data["response"]["고성능"]["파워"];
  //       document.getElementById('hp-main').textContent = data["response"]["고성능"]["메인보드"];
  //       document.getElementById('hp-reason').textContent = data["response"]["고성능"]["이유"];
        
  //       chatContainer.style.display = 'none';
  //       resultScreen.style.display = 'flex';


        
  //       // //document.getElementById('budget-memory').textContent = data["response"]["가성비"]["메모리"];
  //       // // quotation.html 팝업 창 열기
  //       // const popupWindow = window.open(
  //       //     'quotation.html', // Path to your popup HTML
  //       //     'Quotation Popup', // Popup window name
  //       //     'width=800,height=600,resizable=no,scrollbars=yes'
  //       // );

  //       // // 팝업 창이 로드되었을 때 데이터를 전달합니다.
  //       // popupWindow.onload = function() {
  //       //     popupWindow.postMessage(data.response, '*'); // FastAPI 응답 데이터를 전달
  //       // };
        
  //       //document.getElementById('hcpu').textContent = data["response"]["고성능"]["CPU"];
  //   } catch (error) {
  //       console.error('Error:', error);
  //   }
  // });

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

  // async function getImageResponse(userMessage) {
  //   const imagePrompt = "";

  //   try {
  //     const response = await fetch('https://api.openai.com/v1/images/generations', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${OPENAI_API_KEY}`
  //       },
  //       body: JSON.stringify({
  //         prompt: "Draw the character of 082, a computer purchase guide chatbot. Chat-082 is an custom-built computer purchase guide chatbot using llm.\
  //         It helps buyers select computer parts such as cpu and graphic cards from computer purchase sites. \
  //         Draw the features of my program well in the character with a simple design that is not complicated to use on the start screen.",
  //         n: 1,
  //         size: "256x256"
  //       })
  //     });

  //     if (!response.ok) {
  //       addMessage('system', `API Error: ${response.status} - ${response.statusText}`);
  //       return;
  //     }

  //     const data = await response.json();
  //     const imageUrl = data.data[0].url;
  //     addMessage('assistant', imageUrl, true);
  //   } catch (error) {
  //     console.error('Error:', error);
  //     addMessage('system', '이미지를 받아오는 중 오류가 발생했습니다.');
  //   }
  // }
  


  // async function getAIResponse(userMessage) {
  //   const prompt =  `당신은 컴퓨터 구매를 돕는 전문가입니다. 조립용 컴퓨터 부품을 고르고 있는 구매자의 질문에 친절하고 알기쉽게 간단히 답변해주세요. 비유를 사용해도 좋습니다. 한 질문에 대한 답변은 너무 길지 않게 간단히 해주세요.`;
  //   const filterDictionary = result.filterDictionary;

  //   try {
  //     const response = await fetch('https://api.openai.com/v1/chat/completions', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${OPENAI_API_KEY}`
  //       },
  //       body: JSON.stringify({
  //         model: "gpt-3.5-turbo", // 최신 모델로 변경
  //         messages: [
  //           { role: "system", content: prompt },
  //           { role: "user", content: userMessage }
  //         ],
  //         max_tokens: 300,
  //         temperature: 0.7,
  //       })
  //     });

  //     if (!response.ok) {
  //       addMessage('system', `API Error: ${response.status} - ${response.statusText}`);
  //       return;
  //     }

  //     const data = await response.json();
  //     if (data.choices && data.choices.length > 0 && data.choices[0].message) {
  //       const aiResponse = data.choices[0].message.content.trim();
  //       addMessage('assistant', aiResponse);
  //     } else {
  //       addMessage('system', 'AI 응답을 받아오는 데 실패했습니다.');
  //     }
  //   } catch (error) {
  //     console.error('Error:', error);
  //     addMessage('system', 'AI 응답을 받아오는 중 오류가 발생했습니다.');
  //   }
  // }

  // let componentDetails = {
  //   "CPU": {
  //       "제풒명": "Intel Core i9-13900K",
  //       "부품 설명": "고성능 데스크탑 프로세서",
  //       "상세 스펙": {
  //           "소켓": "LGA 1700",
  //           "공정": "Intel 7",
  //           "코어": "24코어 32스레드",
  //           "기본 클럭": "3.0GHz",
  //           "최대 클럭": "5.8GHz",
  //           "메모리 규격": "DDR5",
  //       },
  //   },
  //   "메인보드": {
  //       "제품명": "ASUS ROG Maximus Z790 Hero",
  //       "부품 설명": "고급형 게이밍 메인보드",
  //       "상세 스펙": {
  //           "소켓": "LGA 1700",
  //           "폼팩터": "ATX",
  //           "메모리 지원": "DDR5 최대 128GB",
  //           "확장 슬롯": "PCIe 5.0 x16, PCIe 4.0 x16",
  //           "네트워크": "2.5Gbps LAN, Wi-Fi 6E",
  //       },
  //   },
  //   "메모리": {
  //       "제품명": "G.Skill Trident Z5 Neo DDR5-6000 CL30",
  //       "부품 설명": "고성능 DDR5 메모리",
  //       "상세 스펙": {
  //           "타입": "DDR5",
  //           "용량": "32GB (16GB x 2)",
  //           "클럭 속도": "6000MHz",
  //           "레이턴시": "CL30",
  //       },
  //   },
  //   "그래픽카드": {
  //       "제품명": "NVIDIA GeForce RTX 4090",
  //       "부품 설명": "최상급 그래픽 카드",
  //       "상세 스펙": {
  //           "메모리": "24GB GDDR6X",
  //           "코어 클럭": "2520MHz",
  //           "전력 소모": "450W",
  //           "출력 포트": "DisplayPort 1.4a x 3, HDMI 2.1 x 1",
  //       },
  //   },
  //   "파워": {
  //       "제품명": "Corsair RMx Series RM1000x",
  //       "부품 설명": "고효율 파워 서플라이",
  //       "상세 스펙": {
  //           "출력 용량": "1000W",
  //           "효율 등급": "80 Plus Platinum",
  //           "케이블 타입": "풀 모듈러",
  //           "팬 크기": "135mm FDB 팬",
  //           "보증 기간": "10년",
  //       },
  //   },
  //   "SSD": {
  //       "제품명": "Samsung 990 PRO",
  //       "부품 설명": "고성능 NVMe SSD",
  //       "상세 스펙": {
  //           "용량": "2TB",
  //           "인터페이스": "PCIe Gen 4 x4",
  //           "읽기 속도": "최대 7450MB/s",
  //           "쓰기 속도": "최대 6900MB/s",
  //           "폼팩터": "M.2 2280",
  //       },
  //   },
  // }