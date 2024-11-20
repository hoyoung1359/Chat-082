// content.js

/**
 * Retrieves the filter options based on the current category, e.g. CPU, 메인보드, 메모리.
 * 
 * The `filterDictionary` includes only options that are required for the detected
 * They are manually adjusted, for example, CPU only requires 모델명
 * 
 * @returns {Object} filterDictionary - A dictionary containing the necessary filter options 
 *     for the selected main category, with each option having its unique `id` and `label`.
 */
function getFilterOptions() {
    const filterDictionary = {};
    let requiredOptions = {};

    // Define the filter options for each main category
    const mainCategory = document.querySelector('#wrap > div.compatibility_list.compatibility_list2 > div.page.page1500 > div.top_list > ul > li.on > a');
    
    if (mainCategory) {
        const categoryText = mainCategory.textContent.trim();

        // Adjust required options based on the detected main category
        if (categoryText === "CPU") {
            requiredOptions = {
                // "제조사": ["AMD", "INTEL"],
                // "AMD 세대명": ["라이젠 그래니트 릿지", "라이젠 라파엘"],
                "AMD 모델명": ["라이젠9", "라이젠7", "라이젠5", "라이젠3"],
                // "INTEL 세대명": ["14세대 랩터레이크R", "13세대 랩터레이크"],
                "INTEL 모델명": ["코어 i9", "코어 i7", "코어 i5", "코어 i3"]
            };
        } else if (categoryText === "메인보드") {
            requiredOptions = {
                "제조사": ["MSI", "ASUS", "GIGABYTE", "ASRock"]
            };
        } else if (categoryText === "메모리") {
            requiredOptions = {
                "제조사": ["삼성전자"], //"마이크론", "SK hynix"
                // "메모리용량": ["8GB", "16GB", "32GB", "64GB", "128GB"]
            };
        } else if (categoryText === "그래픽카드") {
            requiredOptions = {
                "RTX시리즈": ["RTX4090", "RTX4080 SUPER", "RTX4080", "RTX4070Ti SUPER", "RTX4070Ti", "RTX4070 SUPER", "RTX4070", "RTX4060Ti", "RTX4060",
                    "RTX3090", "RTX3080", "RTX3070Ti", "RTX3070", "RTX3060"] //Radeon은 일단 보류
            };
        } else if (categoryText === "케이스") {
            requiredOptions = {
                //TODO
                "제조사": ["3RSYS", "DarkFlash"]
            };
        } else if (categoryText === "파워") {
            requiredOptions = {
                "제조사": ["마이크로닉스", "FSP", "시소닉", "SuperFlower", "멕스엘리트", "Antec", "CORSAIR" ]
            };
        } else if (categoryText === "SSD") {
            requiredOptions = {
                "제조사": ["삼성전자","SK hynix"]
            };
        } else if (categoryText === "CPU 쿨러") {
            requiredOptions = {
                //TODO
                "제조사": ["DEEPCOOL", "3RSYS"]
            };
        }
    }

    // Select all primary filter categories in '.depth1' and loop through them
    const categories = document.querySelectorAll('.lt_menu .depth1 > li');

    categories.forEach(category => {
        const categoryName = category.querySelector('a').textContent.trim();

        // Only process if the category is in the required options
        if (requiredOptions[categoryName]) {

            // Initialize this category in the dictionary if it doesn't exist
            if (!filterDictionary[categoryName]) {
                filterDictionary[categoryName] = [];
            }

            // Find all checkboxes under the current category
            const checkboxes = category.querySelectorAll('.depth2 .checkbox input[type="checkbox"]');

            checkboxes.forEach(checkbox => {
                const label = checkbox.nextElementSibling ? checkbox.nextElementSibling.textContent.trim() : '';

                // Only add the checkbox if the label is in the specific options list
                if (requiredOptions[categoryName].includes(label)) {
                    filterDictionary[categoryName].push({ id: checkbox.id, label: label });
                }
            });
        }
    });

    return filterDictionary;
}



/**
 * Automatically run getFilterOptions when the page loads
 */
document.addEventListener("DOMContentLoaded", () => {
    getFilterOptions();
});


/**
 * Automatically retrieve,print filter options, and store when the page loads
 */
window.addEventListener('load', () => {
    const filters = getFilterOptions();
    const mainCategory = document.querySelector('#wrap > div.compatibility_list.compatibility_list2 > div.page.page1500 > div.top_list > ul > li.on > a')?.textContent.trim();

    // Save filter options and main category in Chrome storage
    chrome.storage.local.set({ filterDictionary: filters, mainCategory }, () => {
        console.log(JSON.stringify(filters, null, 2));
        console.log("Filter options and main category saved to Chrome storage.");
    });
});

/**
 * 자동 필터링 적용 함수, 필터적용 버튼 클릭했을 때 실행 됨
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "applySelectedFilters" && Array.isArray(request.filterIds)) {
      request.filterIds.forEach(filterId => {
        const checkbox = document.getElementById(filterId);
        if (checkbox && !checkbox.checked) {
          checkbox.click(); // Select the checkbox
        }
      });
      sendResponse({ status: "Filter applied" });
    }
  });

/**
 * 담기 함수
 */
// Function to extract items from the page
function extractItems() {
    const items = [];
    const rows = document.querySelectorAll("#wrap > div.compatibility_list.compatibility_list2 > div.page.page1500 > div.cont_table.flex > div.rt_table > div.pro_table > table > tbody > tr");
  
    rows.forEach(row => {
      const productNameElement = row.querySelector(".product_name p.ntMB14");
      const ratingElement = row.querySelector(".star span");
      const reviewsElement = row.querySelector(".flex .spRB14:last-of-type");
      const priceElement = row.querySelector(".price .spMB16");
  
      // Extract ProductNo from onclick attribute
      const onclickAttr = productNameElement ? productNameElement.getAttribute("onclick") : "";
      const productIdMatch = onclickAttr.match(/ProductNo=(\d+)/);
      const productId = productIdMatch ? productIdMatch[1] : null;
  
      // Check if all necessary elements are found in each row
      if (productId && productNameElement && ratingElement && reviewsElement && priceElement) {
        const productName = productNameElement.textContent.trim();
        const rating = ratingElement.style.width; // Rating percentage width (e.g., "98%")
        const reviews = reviewsElement.textContent.trim();
        const priceText = priceElement.textContent.trim();
        const price = parseInt(priceText.replace(/[^0-9]/g, "")); // Remove non-numeric characters
  
        items.push({
          productId,
          productName,
          rating,
          reviews,
          price
        });
      } else {
        console.log("Missing elements in row:", row);
      }
    });
  
    console.log("Items extracted:", items);  // Log extracted items for verification
    return items;
  }
  
  // Listen for messages from popup.js
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractItems") {
      console.log("Extracting items for LLM selection...");
      const items = extractItems();
      console.log("Sending extracted items to popup.js:", items);
      sendResponse(items);  // Return extracted items back to popup.js
    }
  
    if (request.action === "addItemToCart" && request.productId) {
      const button = document.querySelector(`button.bl_btn[onclick*='${request.productId}']`);
      if (button) {
        button.click();
        console.log("Added to cart for product ID:", request.productId);
        sendResponse({ status: "Item added to cart" });
      } else {
        console.log("Add to cart button not found for product ID:", request.productId);
        sendResponse({ status: "Item not found" });
      }
    }
  
    // Indicate that the response will be sent asynchronously
    return true;
  });
  