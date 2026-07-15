
/* ==========================================
   사용 기한 확인
========================================== */
function checkAccessPeriod() {
    if (!CONFIG.EXPIRE_DATE) {
        return true;
    }

    const now = new Date();

            // 사용자의 한국 날짜를 YYYY-MM-DD 형식으로 변환
        const expire = new Date(CONFIG.EXPIRE_DATE + "T23:59:59");

        if (now > expire) {
            showExpiredScreen();
            return false;
        }

    return true;
}


/* ==========================================
   만료 화면 표시
========================================== */
function showExpiredScreen() {
    document.title = "사용 기간 종료";

    const app = document.getElementById("app");

    if (!app) {
        return;
    }

    app.innerHTML = `
        <div style="
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 24px;
            box-sizing: border-box;
            background: #f4f6f8;
            font-family: '맑은 고딕', sans-serif;
        ">
            <div style="
                width: 100%;
                max-width: 520px;
                padding: 40px 30px;
                box-sizing: border-box;
                text-align: center;
                background: white;
                border: 1px solid #d9dde3;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
            ">
                <div style="
                    font-size: 48px;
                    margin-bottom: 18px;
                ">
                    🔒
                </div>

                <h1 style="
                    margin: 0 0 18px;
                    font-size: 24px;
                    color: #222;
                ">
                    사용 기간 종료
                </h1>

                <p style="
                    margin: 0;
                    color: #555;
                    font-size: 15px;
                    line-height: 1.7;
                ">
                    ${CONFIG.EXPIRE_MESSAGE}
                </p>
            </div>
        </div>
    `;
}


document.addEventListener("DOMContentLoaded", function () {

    if (!checkAccessPeriod()) return;

    init();

});


async function init() {

    if (!checkAccessPeriod()) return;

    console.clear();

    console.log("=================================");
    console.log(CONFIG.APP_NAME);
    console.log("Version :", CONFIG.VERSION);
    console.log("=================================");

    // UI 생성 및 이벤트 바인딩 (즉시 완료됨)
    createLayout();
    initializeUI();
    initializeAdmissionTypeSelect();
    initializeYearSelect();
    
    if (CONFIG.USE_AUTOCOMPLETE) {
            initializeAutocomplete();
        }    
    
        // initializeSearchButton();
    // initializeEnterSearch();
    initializeFocus();

    // 초기 화면 청소
    clearResult();

    console.log("=================================");
    console.log("Program Ready (UI 부팅 완료)");
    console.log("=================================");

    // 💡 [핵심 변경] 데이터 로딩을 await 하지 않고 백그라운드 비동기로 실행합니다.
    // 이렇게 하면 데이터를 읽는 동안에도 사용자가 입력창을 치거나 탭을 바꿀 수 있습니다!
    loadAllDataInBackground();
}



// 백그라운드 데이터 로드 함수 분리
async function loadAllDataInBackground() {
    console.log("⏳ [백그라운드] 데이터 로딩 시작...");
    
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
    
        if (CONFIG.USE_AUTOCOMPLETE) {
            buildAutocompleteData();
}
    console.log("✅ [백그라운드] 모든 데이터 준비 완료. 이제 검색이 가능합니다.");

    

}