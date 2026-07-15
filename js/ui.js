/* ==========================================
   대구고 대입 면접 아카이브
   Release 2.0.2
   UI Module
========================================== */

let currentMode = "question";
let isPanelOpened = true;

/* ==========================================
   Layout
========================================== */
window.createLayout = function() {
    const app = document.getElementById("app");
    if (!app) return;
    app.innerHTML = "";
    app.appendChild(createHeader());
    app.appendChild(createTabs());
    app.appendChild(createSearchPanel());
    app.appendChild(createResultArea());
    app.appendChild(createFooter());
};

/* ==========================================
   Header & Footer & Empty
========================================== */
function createHeader() {
    const header = document.createElement("header");
    header.id = "header";
    const today = new Date();
    const dateString = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

    header.innerHTML = `
        <div>
            <h1>${CONFIG.APP_NAME}</h1>
        </div>
        <div style="text-align:right; font-size:13px; color:#666;">
            Version ${CONFIG.VERSION}<br>${dateString}
        </div>
    `;
    return header;
}

function createFooter() {
    const footer = document.createElement("footer");
    footer.id = "footer";
    footer.innerHTML = `
        <div>${CONFIG.APP_NAME}</div>
        <div>Version ${CONFIG.VERSION}</div>
    `;
    return footer;
}

function createEmptyResult() {
    return `
        <div style="background:white; padding:60px; border-radius:12px; text-align:center; color:#888; box-shadow:var(--shadow-sm);">
            <div style="font-size:48px; margin-bottom:20px;">🔍</div>
            <div style="font-size:18px; margin-bottom:10px;">검색 결과가 없습니다.</div>
            <div>검색 조건을 입력한 후 검색 버튼을 눌러주세요.</div>
        </div>
    `;
}

/* ==========================================
   Tabs
========================================== */
function createTabs() {
    const tabs = document.createElement("div");
    tabs.id = "tabs";
    tabs.innerHTML = `
        <div id="questionTab" class="tab active">Question 검색</div>
        <div id="caseTab" class="tab">Case 검색</div>
        <div id="cartTab" class="tab">🛒 장바구니 <span id="cartCount">(0)</span></div>
    `;
    return tabs;
}

/* ==========================================
   Search Panel (상단 기능 버튼들을 템플릿 내포 구조로 통합)
========================================== */
function createSearchPanel() {
    const panel = document.createElement("section");
    panel.id = "searchPanel";
    panel.innerHTML = `
        <div id="searchHeader" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; margin-bottom:20px;">
            <h2 style="font-size:18px; color:var(--primary); margin:0;">▼ 검색조건</h2>
            <div style="display:inline-flex; gap:8px; align-items:center;">
                <!-- 💡 짱구 나던 동적 삽입 대신 처음부터 배치 -->
                <button id="qSelectAllBtn" style="background-color: #1e73be; color: white; border: none; padding: 6px 12px; font-size: 14px; font-weight: bold; border-radius: 4px; cursor: pointer;">전체선택</button>
                <button id="qClearAllBtn" style="background-color: #1e73be; color: white; border: none; padding: 6px 12px; font-size: 14px; font-weight: bold; border-radius: 4px; cursor: pointer;">전체해제</button>
                <button id="qPrintBtn" style="background-color: #1e73be; color: white; border: none; padding: 6px 12px; font-size: 14px; font-weight: bold; border-radius: 4px; cursor: pointer;">인쇄</button>
                <button id="qWordBtn" style="background-color: #1e73be; color: white; border: none; padding: 6px 12px; font-size: 14px; font-weight: bold; border-radius: 4px; cursor: pointer;">Word 저장</button>
                <button id="resetSearchBtn" style="padding: 6px 12px; font-size: 13px; border-radius: 6px; border: 1px solid #ccc; background: #fff; cursor: pointer; transition: all 0.2s;"
                    onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='#fff'">
                    🔄 조건 초기화
                </button>
            </div>
        </div>
        
        <div id="searchBody">
            <div id="questionSearchBody" style="display: block;">
                ${createQuestionSearch()}
            </div>
            <div id="caseSearchBody" style="display: none;">
                ${createCaseSearch()}
            </div>
        </div>
    `;
    return panel;
}


function createQuestionSearch() {
    return `
        <div class="search-grid">
            <div class="search-item">
                <label>대학명</label>
                <input id="qUniversity" autocomplete="off">
            </div>

            <div class="search-item">
                <label>모집단위</label>
                <input id="qMajor" autocomplete="off">
            </div>

            <div class="search-item">
                <label>전형종류</label>
                <select id="qAdmissionType"></select>
            </div>

            <div class="search-item">
                <label>키워드</label>
                <input id="qKeyword">
            </div>

            <div class="search-item">
                <label>시작연도</label>
                <select id="qStartYear"></select>
            </div>

            <div class="search-item">
                <label>종료연도</label>
                <select id="qEndYear"></select>
            </div>
        </div>

        <div class="search-button">
            <button id="questionSearchBtn">Question 검색</button>
        </div>
    `;
}


function createCaseSearch() {
    return `
        <div class="search-grid">
            <div class="search-item"><label>대학명</label><input id="cUniversity" autocomplete="off"></div>
            <div class="search-item"><label>모집단위</label><input id="cMajor" autocomplete="off"></div>
            <div class="search-item"><label>시작연도</label><select id="cStartYear"></select></div>
            <div class="search-item"><label>종료연도</label><select id="cEndYear"></select></div>
        </div>
        <div class="search-button"><button id="caseSearchBtn">Case 검색</button></div>
    `;
}

/* ==========================================
   Result Area
========================================== */
function createResultArea() {
    const area = document.createElement("main");
    area.id = "resultArea";
    area.innerHTML = `
        <div id="questionSection" style="display: block;">
            <div id="questionSummary" class="result-summary">검색을 시작하세요.</div>
            <div id="questionList">${createEmptyResult()}</div>
        </div>
        <div id="caseSection" style="display: none;">
            <div id="caseSummary" class="result-summary">검색을 시작하세요.</div>
            <div id="caseList">${createEmptyResult()}</div>
        </div>
        <div id="cartSection" style="display: none;">
            <div id="cartList"></div>
        </div>
    `;
    return area;
}

/* ==========================================
   Initialize & Event Management (중리난방이던 초기화 집약)
========================================== */
window.initializeUI = function() {
    initializeTabs();
    initializeSearchPanelEvents();
    initializeYearSelect();
    initializeGlobalEvents();
    initializeFocus();
 // 💡 추가
    if (typeof initializeAutocomplete === "function") {
        initializeAutocomplete();
    }
};

function initializeTabs() {
    const tabsMap = { "questionTab": "question", "caseTab": "case", "cartTab": "cart" };
    Object.keys(tabsMap).forEach(id => {
        document.getElementById(id)?.addEventListener("click", () => changeMode(tabsMap[id]));
    });
}




function initializeSearchPanelEvents() {
    const header = document.getElementById("searchHeader");
    const resetBtn = document.getElementById("resetSearchBtn");
    const selectAllBtn = document.getElementById("qSelectAllBtn");
    const clearAllBtn = document.getElementById("qClearAllBtn");
    const printBtn = document.getElementById("qPrintBtn");
    const wordBtn = document.getElementById("qWordBtn"); // 💡 추가

    header?.addEventListener("click", () => window.toggleSearchPanel(!isPanelOpened));

    resetBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        if (currentMode === "case") {
            if (typeof resetCaseConditions === "function") resetCaseConditions();
        } else {
            if (typeof resetSearchConditions === "function") resetSearchConditions();
        }
    });

    selectAllBtn?.addEventListener("click", (e) => { e.stopPropagation(); toggleAllCheckboxes(true); });
    clearAllBtn?.addEventListener("click", (e) => { e.stopPropagation(); toggleAllCheckboxes(false); });

    printBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        let items = [];
        if (currentMode === "question" && typeof getSelectedQuestionItems === "function") items = getSelectedQuestionItems();
        else if (currentMode === "case" && typeof window.getSelectedCaseItems === "function") items = window.getSelectedCaseItems();
        else if (currentMode === "cart" && typeof getSelectedCartItems === "function") items = getSelectedCartItems();

        if (typeof printItems === "function") {
            printItems(items);
        } else {
            alert("인쇄 모듈을 찾을 수 없습니다.");
        }
    });

    // 💡 추가: Word 저장 버튼
    wordBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        let items = [];
        if (currentMode === "question" && typeof getSelectedQuestionItems === "function") items = getSelectedQuestionItems();
        else if (currentMode === "case" && typeof window.getSelectedCaseItems === "function") items = window.getSelectedCaseItems();
        else if (currentMode === "cart" && typeof getSelectedCartItems === "function") items = getSelectedCartItems();

        if (typeof window.exportWordItems === "function") {
            window.exportWordItems(items);
        } else {
            alert("Word 저장 모듈을 찾을 수 없습니다.");
        }
    });
}






/* ==========================================
   Global Click & Key Events (엔터/검색 통합)
========================================== */
function initializeGlobalEvents() {
    document.removeEventListener("click", handleGlobalSearchClick);
    document.addEventListener("click", handleGlobalSearchClick);

    document.removeEventListener("keydown", handleGlobalEnterSearch);
    document.addEventListener("keydown", handleGlobalEnterSearch);
}

function handleGlobalSearchClick(e) {
    const isQuestion = e.target.id === "questionSearchBtn";
    const isCase = e.target.id === "caseSearchBtn";

    if (!isQuestion && !isCase) return;

    showLoading();

    if (isQuestion) {
        searchQuestion();
    } else {
        searchCase();
    }
}



function handleGlobalEnterSearch(e) {
    if (e.key !== "Enter") return;
    const targetBtnId = currentMode === "case" ? "caseSearchBtn" : "questionSearchBtn";
        if(currentMode==="question"){
            searchQuestion();
        }else{
            searchCase();
        }}

/* ==========================================
   UI Actions (Mode change, Panel toggle, Cart badge)
========================================== */
function changeMode(mode) {
    currentMode = mode;
    
    // 탭 활성화 토글
    ["questionTab", "caseTab", "cartTab"].forEach(id => {
        document.getElementById(id)?.classList.toggle("active", id === `${mode}Tab`);
    });

    // 섹션 디스플레이 토글
    document.getElementById("questionSection").style.display = mode === "question" ? "block" : "none";
    document.getElementById("caseSection").style.display = mode === "case" ? "block" : "none";
    document.getElementById("cartSection").style.display = mode === "cart" ? "block" : "none";

    // 검색 패널 내부 바디 토글
    const searchPanel = document.getElementById("searchPanel");
    if (searchPanel) searchPanel.style.display = mode === "cart" ? "none" : "block";
    
    document.getElementById("questionSearchBody").style.display = mode === "question" ? "block" : "none";
    document.getElementById("caseSearchBody").style.display = mode === "case" ? "block" : "none";

    window.toggleSearchPanel(true);
    initializeFocus();

    if (mode === "cart") {
        if (typeof window.renderCartPage === "function") window.renderCartPage();
        else if (typeof renderCart === "function") renderCart();
    }
}

window.toggleSearchPanel = function(open) {
    const header = document.getElementById("searchHeader");
    const body = document.getElementById("searchBody");
    if (!header || !body) return;

    isPanelOpened = open;
    body.style.display = isPanelOpened ? "block" : "none";
    
    const h2Element = header.querySelector("h2");
    if (h2Element) h2Element.innerText = isPanelOpened ? "▼ 검색조건" : "▶ 검색조건";
};

function updateCartCount(count) {
    const badge = document.getElementById("cartCount");
    if (badge) badge.innerText = `(${count})`;
}

function initializeFocus() {
    const targetId = currentMode === "case" ? "cUniversity" : "qUniversity";
    document.getElementById(targetId)?.focus();
}

/* ==========================================
   Data Mapping & Helpers
========================================== */
function showLoading() {
    const targetId = currentMode === "case" ? "caseList" : (currentMode === "cart" ? "cartList" : "questionList");
    const listArea = document.getElementById(targetId);
    if (listArea) {
        listArea.innerHTML = `
            <div class="loading-spinner" style="text-align: center; padding: 40px; color: #666; font-size: 14px;">
                <div style="margin-bottom: 10px; font-size: 24px;">⏳</div>
                데이터를 불러오는 중입니다. 잠시만 기다려 주세요...
            </div>
        `;
    }
}

function clearResult() {
    if (currentMode === "cart") {
        const list = document.getElementById("cartList");
        if (list) list.innerHTML = "";
        return;
    }
    const prefix = currentMode;
    const summary = document.getElementById(`${prefix}Summary`);
    const list = document.getElementById(`${prefix}List`);
    if (summary) summary.innerHTML = "검색을 시작하세요.";
    if (list) list.innerHTML = createEmptyResult();
}




function initializeAdmissionTypeSelect() {

    const select = document.getElementById("qAdmissionType");

    if (!select) return;

    select.innerHTML = "";

    select.add(new Option("전체", ""));

    (CONFIG.ADMISSION_TYPES || []).forEach(type => {
        select.add(new Option(type, type));
    });

}




/* ==========================================
   연도 선택창 초기화
========================================== */
function initializeYearSelect() {
    const selectIds = [
        "qStartYear",
        "qEndYear",
        "cStartYear",
        "cEndYear"
    ];

    selectIds.forEach(id => {
        const select = document.getElementById(id);

        // 현재 화면에 해당 요소가 없으면 건너뜀
        if (!select) return;

        select.innerHTML = `<option value="">전체</option>`;

        for (let year = CONFIG.END_YEAR; year >= CONFIG.START_YEAR; year--) {
            const option = document.createElement("option");
            option.value = String(year);
            option.textContent = `${year}년`;
            select.appendChild(option);
        }
    });
}

function toggleAllCheckboxes(boxChecked) {
    const targetListId = currentMode === "case" ? "caseList" : (currentMode === "cart" ? "cartList" : "questionList");
    const checkboxes = document.querySelectorAll(`#${targetListId} input[type='checkbox']`);
    
    checkboxes.forEach(chk => {
        if (chk.checked !== boxChecked) {
            chk.checked = boxChecked;
            // 💡 중요: 단순 체크 상태 변경이 아닌 'change' 이벤트를 강제 발생시켜 
            // question.js 등에 연동된 장바구니 리스트 동기화(toggleCart)가 정상적으로 흐르게 유도
            chk.dispatchEvent(new Event('change'));
        }
    });
}

// 폼 렌더링 스크립트 덤프 제거 후 래핑 정돈
window.initializeSearchForms = function() {
    document.getElementById("questionSearchBody").innerHTML = createQuestionSearch();
    document.getElementById("caseSearchBody").innerHTML = createCaseSearch();
    initializeYearSelect();
    initializeFocus();

    // 💡 추가
    if (typeof initializeAutocomplete === "function") {
        initializeAutocomplete();
    }
};



// // ui.js 맨 아래에 추가
// function initializeSearchButton() {
//     console.log("⚠️ 과거의 initializeSearchButton이 호출되었으나, 현재는 handleAfterPrint로 통합되어 실행을 패스합니다.");
// }

// // ui.js 맨 아래에 추가
// function initializeEnterSearch() {
//     console.log("⚠️ initializeEnterSearch도 handleAfterPrint로 통합되어 실행을 패스합니다.");
// }