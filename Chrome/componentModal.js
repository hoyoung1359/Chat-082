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