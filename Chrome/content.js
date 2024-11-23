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

    if (message.action === "extractItems") {
        const items = [];
        const rows = document.querySelectorAll("#wrap > div.compatibility_list.compatibility_list2 > div.page.page1500 > div.cont_table.flex > div.rt_table > div.pro_table > table > tbody > tr");

        rows.forEach(row => {
            const productNameElement = row.querySelector(".product_name p.ntMB14");
            const priceElement = row.querySelector(".price > p:nth-of-type(2)");
            const onclickAttr = productNameElement ? productNameElement.getAttribute("onclick") : "";
            const productIdMatch = onclickAttr.match(/ProductNo=(\d+)/);
            const productId = productIdMatch ? productIdMatch[1] : null;

            if (productId && productNameElement && priceElement) {
            const productName = productNameElement.textContent.trim();
            const price = priceElement.textContent.trim();
            items.push({ productId, productName, price });
            }
        });

        sendResponse({ items });
        return true; // 비동기 sendResponse 지원
    }
  });

// function extractItems() {
//     const items = [];
//     const rows = document.querySelectorAll("#wrap > div.compatibility_list.compatibility_list2 > div.page.page1500 > div.cont_table.flex > div.rt_table > div.pro_table > table > tbody > tr");
    
//     rows.forEach(row => {
//         const productNameElement = row.querySelector(".product_name p.ntMB14");
//         const ratingElement = row.querySelector(".star span");
//         const reviewsElement = row.querySelector(".flex .spRB14:last-of-type");
//         const priceElement = row.querySelector(".price > p:nth-of-type(2)");
    
//         // Extract ProductNo from onclick attribute
//         const onclickAttr = productNameElement ? productNameElement.getAttribute("onclick") : "";
//         const productIdMatch = onclickAttr.match(/ProductNo=(\d+)/);
//         const productId = productIdMatch ? productIdMatch[1] : null;
    
//         // Check if all necessary elements are found in each row
//         if (productId && productNameElement && ratingElement && reviewsElement && priceElement) {
//             const productName = productNameElement.textContent.trim();
//             // const rating = ratingElement.style.width; // Rating percentage width (e.g., "98%")
//             // const reviews = reviewsElement.textContent.trim();
//             const price = priceElement.textContent.trim();
            
//             const item = {
//                 productId,
//                 productName,
//                 // rating,
//                 // reviews,
//                 price
//             };
//             items.push(item)
//         }
//     });
    

//     return items;
// }

////////////////////////////////////////////////// 자동 클릭  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  