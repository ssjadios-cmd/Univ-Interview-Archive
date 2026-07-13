window.addEventListener("DOMContentLoaded", init);

async function init() {
    console.clear();

    console.log("=================================");
    console.log(CONFIG.APP_NAME);
    console.log("Version :", CONFIG.VERSION);
    console.log("=================================");

    // UI 생성 및 이벤트 바인딩
    createLayout();
    initializeUI();
    initializeYearSelect();
    // initializeSearchButton();
    // initializeEnterSearch();
    initializeFocus();

    // 초기 화면 청소
    clearResult();

    console.log("=================================");
    console.log("Program Ready (UI 부팅 완료)");
    console.log("=================================");

    // 데이터 로딩을 백그라운드 비동기로 실행
    loadAllDataInBackground();
}

// 백그라운드 데이터 로드 함수 분리
async function loadAllDataInBackground() {
    
    // 1. Question 데이터 로드
    try {
        await loadQuestionData();
        console.log("◀ [질문지 로드 완료] 데이터 수:", Question.data.length);
    } catch (e) {
        console.error("💥 Question 로드 실패:", e);
    }
    
    // 2. Case 데이터 로드
    try {
        if (typeof loadCaseData === "function") {
            await loadCaseData();
            if (typeof Case !== "undefined" && Case.allData) {
                console.log("◀ [케이스 로드 완료] 데이터 수:", Case.allData.length);
            }
        } else {
            console.error("❌ [오류] loadCaseData 함수가 존재하지 않습니다.");
        }
    } catch (error) {
        console.error("💥 Case 로드 실패:", error);
    }
    if (typeof buildAutocompleteData === "function") {
    buildAutocompleteData();}
}


