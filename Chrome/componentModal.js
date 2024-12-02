export function setupComponentModals() {
    const modalMap = {
        'cpu-button': 'cpu-modal',
        'mainboard-button': 'mainboard-modal',
        'memory-button': 'memory-modal',
        'gpu-button': 'gpu-modal',
        'power-button': 'power-modal',
        'ssd-button': 'ssd-modal',
    };

    const quotationModal = document.getElementById('quotation-modal'); // Get the quotation modal

    Object.keys(modalMap).forEach((buttonId) => {
        const button = document.getElementById(buttonId); // 버튼 요소 가져오기
        const modal = document.getElementById(modalMap[buttonId]); // 해당 모달 요소 가져오기

        if (button && modal) {
            button.addEventListener('click', () => {
                const isModalVisible = modal.style.visibility === 'visible'; // 현재 모달의 보임 상태 확인

                if (isModalVisible) {
                    modal.style.visibility = 'hidden';
                    modal.style.opacity = '0';
                } else {
                    // 다른 모든 모달 숨김 처리
                    Object.values(modalMap).forEach((otherModalId) => {
                        const otherModal = document.getElementById(otherModalId);
                        if (otherModal) {
                            otherModal.style.visibility = 'hidden';
                            otherModal.style.opacity = '0';
                        }
                    });

                    // Hide quotation modal if visible
                    if (quotationModal && quotationModal.style.visibility === 'visible') {
                        quotationModal.style.visibility = 'hidden';
                        quotationModal.style.opacity = '0';
                    }

                    // 현재 클릭된 모달 보이기
                    modal.style.visibility = 'visible';
                    modal.style.opacity = '1';
                }
            });

            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.style.visibility = 'hidden';
                    modal.style.opacity = '0';
                }
            });
        }
    });

    setupModalsWithCloseButton();
}

export function setupModalsWithCloseButton() {
    const modals = document.querySelectorAll('.modal, .component-modal'); // Select all modals
    const closeButtons = document.querySelectorAll('.close-button'); // Select all close buttons
  
    closeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const modal = button.parentElement; // The parent modal of the close button
        modal.style.visibility = 'hidden'; // Hide the modal
        modal.style.opacity = '0'; // Optional fade-out effect
      });
    });
  }


// // 개별 모달의 내용을 업데이트하는 함수
// export function updateModalContent(modalId, details) {
//     const modal = document.getElementById(`${modalId}-modal`);
//     if (!modal) return; // 모달이 존재하지 않으면 함수 종료

//     // 부품 설명 업데이트
//     const description = modal.querySelector(`div:nth-child(3) > p`); // 두 번째 섹션의 <p> 태그 선택
//     if (description) {
//         description.textContent = details['부품 설명']; // 부품 설명 데이터를 업데이트
//     }
// }

// 개별 모달의 내용을 업데이트하는 함수
export function updateModalContent(modalId, details) {
    const modal = document.getElementById(`${modalId}-modal`);
    if (!modal) return; // 모달이 존재하지 않으면 함수 종료

    // 부품 설명 업데이트
    const description = modal.querySelector(`div:nth-child(3) > p`); // 두 번째 섹션의 <p> 태그 선택
    if (description) {
        if (details) {
            // 부품 설명으로 placeholder 대체
            description.textContent = details;
            description.classList.remove('placeholder'); 
        } else {
            // 부품 설명 없을 시 placeholder추가
            description.textContent = '정보를 불러오는 중...';
            description.classList.add('placeholder');
        }
    }
}

// 모든 모달을 업데이트하는 함수
export function updateAllModals(componentDetails) {
    console.log("모달 업데이트")
    const componentMapping = {
        "CPU": "cpu",           // CPU -> cpu-modal
        "메인보드": "mainboard", // 메인보드 -> mainboard-modal
        "메모리": "memory",      // 메모리 -> memory-modal
        "그래픽카드": "gpu",     // 그래픽카드 -> gpu-modal
        "파워": "power",         // 파워 -> power-modal
        "SSD": "ssd"            // SSD -> ssd-modal
    };

    // componentMapping의 각 키를 반복 처리
    for (const [key, modalId] of Object.entries(componentMapping)) {
        console.log(key)
        const details = componentDetails['response'][`${key}이유`]; // componentDetails에서 해당 부품 정보 가져오기
        if (details) {
            updateModalContent(modalId, details); // 모달 업데이트 함수 호출
        }
    }
    return;
}