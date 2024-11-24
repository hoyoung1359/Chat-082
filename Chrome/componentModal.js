export function setupComponentModals() {
    // 버튼과 해당 모달 ID를 매핑한 객체
    const modalMap = {
        'cpu-button': 'cpu-modal',        // CPU 버튼과 CPU 모달 연결
        'mainboard-button': 'mainboard-modal', // 메인보드 버튼과 메인보드 모달 연결
        'memory-button': 'memory-modal', // 메모리 버튼과 메모리 모달 연결
        'gpu-button': 'gpu-modal',       // GPU 버튼과 GPU 모달 연결
        'power-button': 'power-modal',   // 파워 버튼과 파워 모달 연결
        'ssd-button': 'ssd-modal',       // SSD 버튼과 SSD 모달 연결
    };

    // 각 버튼에 대해 반복문을 실행
    Object.keys(modalMap).forEach((buttonId) => {
        const button = document.getElementById(buttonId); // 버튼 요소 가져오기
        const modal = document.getElementById(modalMap[buttonId]); // 해당 모달 요소 가져오기

        // 버튼과 모달 요소가 존재하는 경우에만 이벤트 설정
        if (button && modal) {
            // 버튼 클릭 이벤트 설정
            button.addEventListener('click', () => {
                const isModalVisible = modal.style.visibility === 'visible'; // 현재 모달의 보임 상태 확인

                if (isModalVisible) {
                    // 모달 숨김
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

                    // 현재 클릭된 모달 보이기
                    modal.style.visibility = 'visible';
                    modal.style.opacity = '1';
                }
            });

            // 모달 외부를 클릭하면 모달 숨김 처리
            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.style.visibility = 'hidden';
                    modal.style.opacity = '0';
                }
            });
        }
    });
}
