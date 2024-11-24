export function setupQuotationModal() {
  // 'quotation-modal' ID를 가진 모달 요소 가져오기
  const modal = document.getElementById('quotation-modal');
  // 'quotation-button' ID를 가진 버튼 요소 가져오기
  const quotationButton = document.getElementById('quotation-button');

  // 버튼 클릭 시 모달 보이기/숨기기 토글
  quotationButton.addEventListener('click', () => {
      const isModalVisible = modal.style.visibility === 'visible'; // 모달의 현재 보임 상태 확인

      if (isModalVisible) {
          // 모달 숨기기
          modal.style.visibility = 'hidden'; // 모달의 가시성 숨김 처리
          modal.style.opacity = '0'; // 모달의 투명도 설정 (전환 효과 가능)
      } else {
          // 모달 보이기
          modal.style.visibility = 'visible'; // 모달의 가시성 보임 처리
          modal.style.opacity = '1'; // 모달의 투명도 설정 (전환 효과 가능)
      }
  });
}
