export function setupCartModal() {
    const modal = document.getElementById('temp-modal');
    const cartButton = document.getElementById('temp-button');
  
    // 버튼 클릭 시 모달 보이기/숨기기 토글
    cartButton.addEventListener('click', () => {
        const isModalVisible = modal.style.visibility === 'visible';
  
        // Hide other component modals when showing quotation modal
        if (!isModalVisible) {
            const componentModals = document.querySelectorAll('.component-modal');
            componentModals.forEach((compModal) => {
                compModal.style.visibility = 'hidden';
                compModal.style.opacity = '0';
            });
        }
  
        modal.style.visibility = isModalVisible ? 'hidden' : 'visible';
        modal.style.opacity = isModalVisible ? '0' : '1';
    });
  
    // const closeButton = modal.querySelector('.close-button');
    // closeButton.addEventListener('click', () => {
    //     modal.style.visibility = 'hidden';
    //     modal.style.opacity = '0';
    // });
  }
  
  