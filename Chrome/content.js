// content.js

////////////////////////////////////////////////// 자동 클릭  /////////////////////////////////////////////////////////////////////////////////////////////////////////
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const menuSelector = "#wrap > div.compatibility_list.compatibility_list2 > div.page.page1500 > div.top_list > ul";
    const filterSelector = "#wrap > div.compatibility_list.compatibility_list2 > div.page.page1500 > div.cont_table.flex > div.lt_menu > ul";
    const buttonSelector = "#wrap > div.compatibility_list.compatibility_list2 > div.page.page1500 > div.cont_table.flex > div.rt_table > div.mid_table.flex.btwn > div:nth-child(2) > div";
  
    if (message.action === "clickMenu") {
      // 메뉴 클릭 처리
      const menuElement = document.querySelector(menuSelector);
  
      if (menuElement) {
        const items = menuElement.querySelectorAll("li a");
  
        for (const item of items) {
          if (item.textContent.trim() === message.key) {
            item.click(); // 메뉴 클릭
            sendResponse({ success: true });
            return true; // 비동기 sendResponse 지원
          }
        }
      }
  
      sendResponse({ success: false });
      return true; // 비동기 sendResponse 지원
    }
  
    if (message.action === "clickUpperCategory") {
      // 상위 카테고리 클릭 처리
      const filterElement = document.querySelector(filterSelector);
  
      if (filterElement) {
        const filterGroups = filterElement.querySelectorAll("ul.depth1 > li");
  
        for (const group of filterGroups) {
          const upperCategoryLink = group.querySelector("a");
  
          if (upperCategoryLink && upperCategoryLink.textContent.trim() === message.upperCategory) {
            upperCategoryLink.click(); // 상위 카테고리 클릭
            sendResponse({ success: true });
            return true; // 비동기 sendResponse 지원
          }
        }
      }
  
      sendResponse({ success: false });
      return true; // 비동기 sendResponse 지원
    }
  
    if (message.action === "clickValue") {
      // 필터 값 클릭 처리
      const filterElement = document.querySelector(filterSelector);
  
      if (filterElement) {
        const filterGroups = filterElement.querySelectorAll("ul.depth1 > li");
  
        for (const group of filterGroups) {
          const checkboxes = group.querySelectorAll("div.depth2 ul li span.checkbox label");
  
          for (const checkbox of checkboxes) {
            if (checkbox.textContent.trim() === message.value) {
              const inputElement = checkbox.previousElementSibling; // Input 요소 선택
              if (inputElement && inputElement.type === "checkbox") {
                inputElement.click(); // 체크박스 클릭
                sendResponse({ success: true });
                return true; // 비동기 sendResponse 지원
              }
            }
          }
        }
      }
  
      sendResponse({ success: false });
      return true; // 비동기 sendResponse 지원
    }
  
    // 맞춤 추천 끄는 코드
    if (message.action === "clickButton") {
        // 버튼 클릭 처리
        const buttonElement = document.querySelector(buttonSelector);
    
        if (buttonElement && buttonElement.classList.contains("on")) {
          // "on" 상태 확인 후 클릭
          buttonElement.click();
          sendResponse({ success: true });
        } else {
          sendResponse({ success: true }); // 바로 success 리턴
        }
    
        return true; // 비동기 sendResponse 지원
      }
  });

////////////////////////////////////////////////// 자동 클릭  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  