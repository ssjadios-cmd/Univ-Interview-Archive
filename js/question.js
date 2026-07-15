/* ==========================================
   Question Module
========================================== */
const Question = {
    data: [],
    filtered: [],
    currentPage: 1,
    resultsPerPage: CONFIG.RESULT_PER_PAGE,
    pageBlock: 10
};

/* ==========================================
   Load Question CSV
========================================== */
async function loadQuestionData() {
    Question.data = [];
    for (const file of CONFIG.QUESTION_FILES) {
        try {
            const rows = await loadCSV(CONFIG.QUESTION_PATH + file);

            // 내부 고유번호 부여 및 누적
            rows.forEach(row => {
                row.__id = Question.data.length + 1;
                Question.data.push(row);
            });

            // console.log(file + " Loaded"); // 중복 출력 제거
        } catch (error) {
            console.warn(file + " Missing");
        }
    }
    // console.log("Question Loaded :", Question.data.length);
}

/* ==========================================
   Get Search Condition
========================================== */
function getQuestionCondition() {
    return {
        university: document.getElementById("qUniversity")?.value.trim() || "",
        major: document.getElementById("qMajor")?.value.trim() || "",
        admission: document.getElementById("qAdmissionType")?.value.trim() || "",
        startYear: document.getElementById("qStartYear")?.value || "",
        endYear: document.getElementById("qEndYear")?.value || "",
        keyword: document.getElementById("qKeyword")?.value.trim() || ""
    };
}

/* ==========================================
   Search Question
========================================== */
function searchQuestion() {
    console.log("searchQuestion()");
    const condition = getQuestionCondition();

    Question.filtered = Question.data.filter(row => {
        if (condition.university && !contains(row.대학명, condition.university)) return false;
        if (condition.major && !contains(row.모집단위, condition.major)) return false;
        if (condition.admissionType &&
                row.전형종류 !== condition.admissionType
            )
                return false;

        const year = Number(row.대입연도);
        if (condition.startYear && year < Number(condition.startYear)) return false;
        if (condition.endYear && year > Number(condition.endYear)) return false;

        if (condition.keyword && !contains(row.내용, condition.keyword)) return false;
        
        return true;
    });

    sortByYearDesc(Question.filtered);
    Question.currentPage = 1;

    console.log("검색 결과 :", Question.filtered.length);

    if (typeof window.toggleSearchPanel === "function") {
        window.toggleSearchPanel(false); 
    }

    renderQuestionPage();
}

/* ==========================================
   Render Page
========================================== */
function renderQuestionPage() {
    const start = (Question.currentPage - 1) * Question.resultsPerPage;
    const end = start + Question.resultsPerPage;
    const rows = Question.filtered.slice(start, end);

    renderQuestionList(rows, start);
    renderPagination();
}

function getTotalPages() {
    return Math.ceil(Question.filtered.length / Question.resultsPerPage);
}

/* ==========================================
   Render Result
========================================== */
function renderQuestionList(rows, start) {
    const result = document.getElementById("questionList");
    const summary = document.getElementById("questionSummary");
    const condition = getQuestionCondition();

    // 1. 검색 조건 요약 텍스트 생성
    let condTexts = [];
    if (condition.university) condTexts.push(`대학: ${condition.university}`);
    if (condition.major) condTexts.push(`모집단위: ${condition.major}`);
    if (condition.admission) condTexts.push(`전형: ${condition.admission}`);
    if (condition.keyword) condTexts.push(`키워드: ${condition.keyword}`);
    
    if (condition.startYear && condition.endYear) {
        condTexts.push(condition.startYear === condition.endYear ? `연도: ${condition.startYear}년` : `연도: ${condition.startYear}~${condition.endYear}년`);
    } else if (condition.startYear) {
        condTexts.push(`연도: ${condition.startYear}년~`);
    } else if (condition.endYear) {
        condTexts.push(`연도: ~${condition.endYear}년`);
    }

    const condSummary = condTexts.length > 0 ? condTexts.join(" / ") : "전체 검색";

    summary.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; font-size: 14px;">
            <span style="color: #555;">🔍 <strong>검색조건:</strong> ${condSummary}</span>
            <span style="color: var(--primary); font-weight: bold; font-size: 15px;">
                총 ${Question.filtered.length.toLocaleString()}건 검색됨
            </span>
        </div>
    `;

    if (rows.length === 0) {
        result.innerHTML = createEmptyResult();
        return;
    }

    // 2. 카드 리스트 렌더링
    let html = "";
    rows.forEach((row, index) => {
        let contentHtml = row.내용;

        if (condition.keyword) {
            try {
                const escapedKeyword = condition.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`(${escapedKeyword})`, "gi");
                // 💡 인라인 스타일은 유지하되 가독성을 위해 정돈
                contentHtml = contentHtml.replace(regex, `<mark class="kw-highlight" style="background-color: #fff3cd; color: #856404; padding: 2px 4px; border-radius: 4px; font-weight: bold;">$1</mark>`);
            } catch (e) {
                console.error("Highlight error:", e);
            }
        }

        html += `
        <div class="result-card">
            <div class="card-top">
                <label class="select-box">
                    <input type="checkbox" data-index="${start + index}" onchange="toggleCart(this, ${start + index})">
                    선택
                </label>
            </div>
            <div class="result-info">
                <span class="info-item">🏫 <strong>${row.대학명}</strong></span>
                <span class="info-item">📚 <strong>${row.모집단위}</strong></span>
            </div>
            <div class="result-info">
                <span class="info-item">📅 ${row.대입연도}학년도</span>
                <span class="info-item">📋 ${row.전형명}</span>
            </div>
            <div class="result-question">${contentHtml}</div>
        </div>
        `;
    });

    result.innerHTML = html;
}

function renderPagination() {
    let result = document.getElementById("questionList") || document.getElementById("resultList");
    
    if (!result) {
        console.error("페이지네이션을 렌더링할 부모 HTML 상자가 화면에 없습니다.");
        return;
    }

    const totalPages = getTotalPages();
    if (totalPages <= 1) return;

    let html = '<div id="pagination" class="pagination">';
    const startPage = Math.floor((Question.currentPage - 1) / Question.pageBlock) * Question.pageBlock + 1;
    const endPage = Math.min(startPage + Question.pageBlock - 1, totalPages);

    // 네비게이션 버튼 생성 구조 단순화
    html += `<button class="pageButton nav-btn" onclick="goQuestionPage(1)" ${Question.currentPage === 1 ? "disabled" : ""}>≪</button>`;
    html += `<button class="pageButton nav-btn" onclick="goQuestionPage(${startPage - 1})" ${startPage === 1 ? "disabled" : ""}>＜</button>`;

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="pageButton ${i === Question.currentPage ? "active" : ""}" onclick="goQuestionPage(${i})">${i}</button>`;
    }

    html += `<button class="pageButton nav-btn" onclick="goQuestionPage(${endPage + 1})" ${endPage === totalPages ? "disabled" : ""}>＞</button>`;
    html += `<button class="pageButton nav-btn" onclick="goQuestionPage(${totalPages})" ${Question.currentPage === totalPages ? "disabled" : ""}>≫</button>`;
    html += "</div>";

    result.innerHTML += html;
}

function goQuestionPage(page) {
    Question.currentPage = page;
    renderQuestionPage();
}

/* ==========================================
   Reset Search Conditions
========================================== */
function resetSearchConditions() {
    console.log("resetSearchConditions()");

    // 💡 질문 탭에 해당하는 필드만 깔끔하게 초기화합니다.
    // (케이스 검색 관련 초기화 코드는 해당 케이스 js 파일이나 app.js로 이관하는 것을 권장합니다)
    const inputs = ["qUniversity", "qMajor", "qAdmissionType", "qKeyword"];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });

    if (typeof initializeYearSelect === "function") initializeYearSelect();

    Question.filtered = [];
    Question.currentPage = 1;
    if (typeof clearResult === "function") clearResult();
    if (typeof initializeFocus === "function") initializeFocus();

    if (typeof window.toggleSearchPanel === "function") {
        window.toggleSearchPanel(true);
    }
}

/* ==========================================
   Cart & Print Functions
========================================== */
function toggleCart(check, index) {
    const row = Question.filtered[index];
    if (!row) return;

    const cartItem = {
        ...row,
        id: `question_${row.대입연도}_${row.대학명}_${index}`,
        type: "question"
    };

    if (check.checked) {
        addToCart(cartItem);
    } else {
        Cart.items = Cart.items.filter(item => item.id !== cartItem.id);
        if (typeof updateCartCount === "function") updateCartCount(Cart.items.length);
    }
}

function printQuestion() {
    const items = getSelectedQuestionItems();
    if (typeof printItems === "function") printItems(items);
}

function getSelectedQuestionItems() {
    const items = [];
    document.querySelectorAll("#questionList input[type='checkbox']:checked").forEach(chk => {
        const idx = Number(chk.dataset.index);
        if (!isNaN(idx)) {
            items.push(Question.filtered[idx]);
        }
    });
    return items;
}