/* ==========================================
   대구고 대입 면접 아카이브 - 장바구니 모듈 (통합)
========================================== */



const Cart = {
    items: [],
    filterType: "all" // 기본값: 전체보기 ("all", "question", "case")
};

/* ==========================================
   1. 장바구니 담기 (Add)
========================================== */
function addToCart(row) {
    if (!row) return;

    // 💡 [수정] 질문과 케이스의 중복 체크 방식을 분기하여 처리
    const isDuplicate = Cart.items.some(item => {
        if (row.type === "case" || item.type === "case") {
            // 케이스는 고유 고유 ID(예: case_2015_경북대_136)로 비교
            return item.id === row.id;
        }
        // 기존 일반 질문 중복 체크
        return item.사례번호 === row.사례번호 && item.내용 === row.내용;
    });

    if (isDuplicate) return;

    // 장바구니 제한 수량 확인
    if (Cart.items.length >= (CONFIG.CART_LIMIT || 3000)) {
        alert(`장바구니는 최대 ${CONFIG.CART_LIMIT}개까지만 담을 수 있습니다.`);
        return;
    }

    Cart.items.push(row);
    
    if (typeof updateCartCount === "function") {
        updateCartCount(Cart.items.length);
    }
}

/* ==========================================
   2. 장바구니 개별 삭제
========================================== */
function removeCartItem(index) {
    // 필터링된 상태에서 인덱스가 꼬이는 것을 방지하기 위해 고유 ID 추출 후 삭제
    const displayItems = getFilteredCartItems();
    const targetItem = displayItems[index];
    
    if (targetItem) {
        Cart.items = Cart.items.filter(item => item.id !== targetItem.id);
    }

    if (typeof updateCartCount === "function") {
        updateCartCount(Cart.items.length);
    }
    
    window.renderCartPage(); // 최신 필터 탭 기준 갱신
}

/* ==========================================
   3. 현재 필터링 모드에 따른 아이템 추출 유틸
========================================== */
function getFilteredCartItems() {
    return Cart.items.filter(item => {
        if (Cart.filterType === "question") return item.type !== "case";
        if (Cart.filterType === "case") return item.type === "case";
        return true;
    });
}


/* ==========================================
   4. 장바구니 화면 렌더링 (Render)
========================================== */
/* ==========================================
   [수정] 4. 장바구니 화면 렌더링 (상단 우측 버튼 배치 버전)
========================================== */
window.renderCartPage = function() {
    const result = document.getElementById("cartList");
    const summary = document.getElementById("cartSummary"); // 사용 안 하더라도 에러 방지용
    if (!result) return;

    const displayItems = getFilteredCartItems();

    // 💡 1. 분류 필터 탭 바
    let html = `
    <div class="cart-filter-tabs" style="display: flex; gap: 8px; margin-bottom: 15px; border-bottom: 2px solid #ddd; padding-bottom: 10px; width: 100%;">
        <button onclick="setCartFilter('all')" style="padding: 6px 14px; border: 1px solid #ccc; background: ${Cart.filterType === 'all' ? '#333' : '#fff'}; color: ${Cart.filterType === 'all' ? '#fff' : '#333'}; border-radius: 4px; cursor: pointer; font-weight: bold;">전체 (${Cart.items.length})</button>
        <button onclick="setCartFilter('question')" style="padding: 6px 14px; border: 1px solid #ccc; background: ${Cart.filterType === 'question' ? '#1e73be' : '#fff'}; color: ${Cart.filterType === 'question' ? '#fff' : '#333'}; border-radius: 4px; cursor: pointer; font-weight: bold;">질문지 (${Cart.items.filter(c => c.type !== 'case').length})</button>
        <button onclick="setCartFilter('case')" style="padding: 6px 14px; border: 1px solid #ccc; background: ${Cart.filterType === 'case' ? '#2ecc71' : '#fff'}; color: ${Cart.filterType === 'case' ? '#fff' : '#333'}; border-radius: 4px; cursor: pointer; font-weight: bold;">면접사례 (${Cart.items.filter(c => c.type === 'case').length})</button>
    </div>
    `;

    // 💡 2. 상단 헤더 영역 (타이틀 왼쪽 + 버튼들 오른쪽 정렬)
    let topHeaderHtml = `
    <div class="cart-header-container" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; margin-bottom: 15px; gap: 10px;">
        <div style="font-size: 16px; font-weight: bold; color: #333;">
            🛒 장바구니 조회 : 총 <span style="color: #1e73be;">${displayItems.length}</span>건
        </div>
        <div class="cart-toolbar" style="display: flex; gap: 5px;">
            <button onclick="selectAllCart()" style="background-color: #555; color: white; border: none; padding: 5px 10px; font-size: 12px; font-weight: bold; border-radius: 4px; cursor: pointer;">전체선택</button>
            <button onclick="unselectAllCart()" style="background-color: #777; color: white; border: none; padding: 5px 10px; font-size: 12px; font-weight: bold; border-radius: 4px; cursor: pointer;">전체해제</button>
            <button onclick="deleteSelectedCart()" style="background-color: #d9534f; color: white; border: none; padding: 5px 10px; font-size: 12px; font-weight: bold; border-radius: 4px; cursor: pointer;">선택삭제</button>
            <button onclick="printCart()" style="background-color: #1e73be; color: white; border: none; padding: 5px 10px; font-size: 12px; font-weight: bold; border-radius: 4px; cursor: pointer;">🖨️ 인쇄하기</button>
            <button onclick="exportWord()" style="background-color: #2ecc71; color: white; border: none; padding: 5px 10px; font-size: 12px; font-weight: bold; border-radius: 4px; cursor: pointer;">💾 Word 저장</button>
        </div>
    </div>
    `;

    // 메인 레이아웃 결합
    html += topHeaderHtml;

    if (displayItems.length === 0) {
        result.innerHTML = html + `<div class="result-card" style="padding: 40px; text-align: center; color: #666; background: #fafafa; border: 1px dashed #ccc;">장바구니에 담긴 항목이 없습니다.</div>`;
        if (summary) summary.innerHTML = ""; // 중복 표시 방지용 비우기
        return;
    }

    // 기존 리드 데이터 렌더링 파트 루프 실행
    displayItems.forEach((row, index) => {
        // ... (어제 전송해 드린 카드 조립 루프문 코드 그대로 유지) ...
        let contentHtml = "";
        if (row.type === "case" && row.rawData) {
            const sortedLines = [...row.rawData.lines].sort((a, b) => a.줄번호 - b.줄번호);
            contentHtml = sortedLines.map((line, idx) => {
                const text = (line.내용 || "").trim();
                // 💡 [개선] 장바구니 내부에서도 첫 줄 제목을 눈에 띄게 처리
                if (idx === 0) {
                    return `<div style="font-size: 15px; font-weight: bold; color: #2c3e50; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #eee;">${text}</div>`;
                }
                if (text.startsWith("Q:") || text.startsWith("질문:")) {
                    return `<div style="margin-top: 10px; margin-bottom: 4px; font-weight: bold; color: #1e73be;">${text}</div>`;
                }
                return `<div style="margin-bottom: 4px; line-height: 1.5; text-align: justify; color: #333;">${text}</div>`;
            }).join("");
        } else {
            contentHtml = `<div class="result-question" style="margin-top: 8px; padding: 4px 0; line-height: 1.4; font-size: 14px;">${row.내용}</div>`;
        }

        const uniName = row.type === "case" ? row.rawData.대학명 : row.대학명;
        const majorName = row.type === "case" ? (row.rawData.모집단위 || "전체") : row.모집단위;
        const appYear = row.type === "case" ? row.rawData.대입연도 : row.대입연도;
        const typeName = row.type === "case" ? row.rawData.전형명 : row.전형명;
        const badgeColor = row.type === "case" ? "#2ecc71" : "#1e73be";
        const badgeText = row.type === "case" ? "면접사례" : "질문지";

        html += `
        <div class="result-card" style="padding: 12px 15px; margin-bottom: 10px; border-left: 5px solid ${badgeColor}; border-top: 1px solid #eee; border-right: 1px solid #eee; border-bottom: 1px solid #eee; background:#fff; border-radius: 0 4px 4px 0;">
            <div class="card-top" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                 <label class="cart-select" style="font-size: 14px; cursor: pointer; font-weight: bold;">
                    <input type="checkbox" class="cartCheck" data-index="${index}" style="width:15px; height:15px; cursor: pointer; vertical-align: middle;">
                    선택
                 </label>
                 <div>
                    <span style="background: ${badgeColor}; color:#fff; font-size:11px; padding:2px 6px; border-radius:3px; margin-right:5px; font-weight:bold;">${badgeText}</span>
                    <button class="deleteButton" onclick="removeCartItem(${index})" style="padding: 3px 8px; font-size: 12px; cursor: pointer; background:#f44336; color:#fff; border:none; border-radius:3px;">🗑 삭제</button>
                 </div>
            </div>
            <div class="result-info" style="margin: 2px 0; font-size:13.5px;">
                <span class="info-item">🏫 <strong>${uniName}</strong></span>
                <span class="info-item">📚 <strong>${majorName}</strong></span>
            </div>
            <div class="result-info" style="margin: 2px 0; font-size:12.5px; color:#555;">
                <span class="info-item">📅 ${appYear}학년도</span>
                <span class="info-item">📋 ${typeName}</span>
            </div>
            <div style="margin-top: 10px; border-top: 1px dashed #eee; padding-top: 8px;">
                ${contentHtml}
            </div>
        </div>`;
    });

    result.innerHTML = html;
    if (summary) summary.innerHTML = ""; // 상단 배치로 대체했으므로 하단 기본 요약 텍스트는 소거
};



// 필터 타입 지정 스위치
window.setCartFilter = function(type) {
    Cart.filterType = type;
    window.renderCartPage();
};




/* ==========================================
   5. 상단 유틸리티 제어 (선택/해제/삭제)
========================================== */
window.selectAllCart = function() {
    document.querySelectorAll(".cartCheck").forEach(chk => chk.checked = true);
};

window.unselectAllCart = function() {
    document.querySelectorAll(".cartCheck").forEach(chk => chk.checked = false);
};

window.deleteSelectedCart = function() {
    const checked = document.querySelectorAll(".cartCheck:checked");
    if (checked.length === 0) {
        alert("삭제할 항목을 선택하세요.");
        return;
    }

    if (!confirm("선택한 항목들을 장바구니에서 삭제하시겠습니까?")) return;

    const displayItems = getFilteredCartItems();
    const targetIds = [];

    checked.forEach(chk => {
        const idx = Number(chk.dataset.index);
        if (displayItems[idx]) {
            targetIds.push(displayItems[idx].id);
        }
    });

    // 전역 배열 원본 소거 필터링
    Cart.items = Cart.items.filter(item => !targetIds.includes(item.id));

    if (typeof updateCartCount === "function") updateCartCount(Cart.items.length);
    window.renderCartPage();
};





// 💡 공용 함수: 이미 준비된 items 배열로 Word 문서를 만듦 (탭 무관)
window.exportWordItems = function(items) {
    if (!items || items.length === 0) {
        alert("Word로 저장할 항목을 선택(체크)해 주세요.");
        return;
    }

    let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>면접 아카이브 추출 자료</title>
    <style>
        body{ font-family:"맑은 고딕", Arial; font-size:11pt; line-height:1.6; margin:20px; }
        h2{ font-size:18pt; text-align:center; margin-bottom:30px; border-bottom:3px double #333; padding-bottom:10px; }
        .item-page { margin-bottom: 30px; padding-bottom: 20px; }
        .page-break { page-break-before: always; break-before: page; }
        .title{ font-size:15pt; font-weight:bold; color:#1e73be; margin-bottom:6px; }
        .info{ color:#555; font-size:10.5pt; margin-bottom:12px; background:#f5f5f5; padding:6px 10px; border-radius:4px; }
        .content{ font-size:11pt; text-align:justify; }
        .q-text { font-weight:bold; color:#1e73be; margin-top:12px; }
    </style></head><body><h2>대구고 대입 면접 자료 목록</h2>`;

    items.forEach((row, index) => {
        const isCase = row.type === "case" || row.lines;
        const uni = row.대학명 || row.rawData?.대학명 || "";
        const major = row.모집단위 || row.rawData?.모집단위 || "전체";
        const year = row.대입연도 || row.rawData?.대입연도 || "";
        const typeName = row.전형명 || row.rawData?.전형명 || "";

        const breakClass = (index > 0 && isCase) ? "page-break" : "";
        const targetLines = row.lines || (row.rawData ? row.rawData.lines : null);

        let bodyText = "";
        if (isCase && targetLines) {
            bodyText = [...targetLines].sort((a,b)=>(a.줄번호||0)-(b.줄번호||0)).map(line => {
                const text = (line.내용 || "").trim();
                if (text.startsWith("Q:") || text.startsWith("질문:")) {
                    return `<div class="q-text">${text}</div>`;
                }
                return `<div style="margin-bottom:5px;">${text}</div>`;
            }).join("");
        } else {
            bodyText = `<div style="white-space:pre-wrap;">${row.내용 || ""}</div>`;
        }

        html += `
        <div class="item-page ${breakClass}">
            <div class="title">${index + 1}. ${uni} - ${major}</div>
            <div class="info">📌 구분: ${isCase ? '면접 후기 사례 보고서' : '단답형 질문지'} | 📅 연도: ${year}학년도 | 📋 전형: ${typeName}</div>
            <div class="content">${bodyText}</div>
        </div>`;
    });

    html += `</body></html>`;

    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `대구고_면접아카이브_추출자료.doc`;
    a.click();
    URL.revokeObjectURL(url);
};



// 💡 기존 exportWord()는 "장바구니 탭"에서 쓰던 진입점 그대로 유지 (하위 호환)
window.exportWord = function() {
    const checkboxes = document.querySelectorAll(".cartCheck:checked");
    const displayItems = getFilteredCartItems();

    let selectedItems = [];

    checkboxes.forEach(chk => {
        const idx = Number(chk.dataset.index);
        if (displayItems[idx]) selectedItems.push(displayItems[idx]);
    });

    // ✅ 🔥 100개 제한 추가 (핵심)
    if (selectedItems.length > 100) {
        alert(`워드 저장은 최대 100개까지만 가능합니다. (현재 ${selectedItems.length}개 선택됨)`);
        selectedItems = selectedItems.slice(0, 100);
    }

    window.exportWordItems(selectedItems);

    console.log("Word export count:", selectedItems.length);
};




function getSelectedCartItems(){

    const displayItems = getFilteredCartItems();

    const checkedBoxes = document.querySelectorAll(".cartCheck:checked");

    let items = [];

    checkedBoxes.forEach(chk=>{

        const idx = Number(chk.dataset.index);

        if(!isNaN(idx) && displayItems[idx]){

            items.push(displayItems[idx]);

        }

    });

    return items;

}




/* ==========================================
   Jin's comments : 이전 방식 인쇄 기능, 처음 방식이라 iframe이 아니고 새로운 탭을 띄우는 방식
   아래에 일부만 수정하였음
========================================== */
window.printCart = function() {
    const checkboxes = document.querySelectorAll(".cartCheck:checked");
    if (checkboxes.length === 0) {
        alert("인쇄할 항목을 선택(체크)해 주세요.");
        return;
    }

    const displayItems = getFilteredCartItems();
    let selectedItems = [];
    checkboxes.forEach(chk => {
        const idx = Number(chk.dataset.index);
        if (displayItems[idx]) selectedItems.push(displayItems[idx]);
    });

    let html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>면접 자료 인쇄 출력</title>
<style>
    @page { margin: 15mm 15mm; }
    body { font-family: "맑은 고딕", sans-serif; font-size: 11pt; line-height: 1.5; margin: 0; padding: 0; }
    .print-header { font-size: 16pt; text-align:center; font-weight:bold; margin-bottom:20px; padding-bottom:10px; border-bottom:2px solid #000; }
    .print-item { margin-bottom: 25px; }
    /* ⭕ 1케이스 1페이지 양식 강제 고정 지시어 */
    .case-page-break { page-break-before: always; break-before: page; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    .info-table td { padding: 5px; border: 1px solid #aaa; background:#f9f9f9; font-size:10pt; }
    .content-box { border: 1px solid #333; padding: 15px; min-height: 100px; white-space: pre-wrap; font-size: 11pt; text-align:justify; line-height:1.6; }
    .q-style { font-weight:bold; color:#1e73be; margin-top:10px; margin-bottom:5px; }
</style>
</head>
<body>
<div class="print-header">대구고등학교 대입 면접 기록물</div>
`;

    selectedItems.forEach((row, index) => {
        const isCase = row.type === "case";
        const uni = isCase ? row.rawData.대학명 : row.대학명;
        const major = isCase ? (row.rawData.모집단위 || "전체") : row.모집단위;
        const year = isCase ? row.rawData.대입연도 : row.대입연도;
        const typeName = isCase ? row.rawData.전형명 : row.전형명;

        // 💡 첫 항목이 아니면서 케이스 문서 유형이면 무조건 새로운 인쇄 용지 장으로 넘김
        const breakStyleClass = (index > 0 && isCase) ? "case-page-break" : "";

        let printableBody = "";
        if (isCase && row.rawData) {
            printableBody = row.rawData.lines.map(line => {
                const text = (line.내용 || "").trim();
                if (text.startsWith("Q:") || text.startsWith("질문:")) {
                    return `<div class="q-style">${text}</div>`;
                }
                return `<div style="margin-bottom:4px;">${text}</div>`;
            }).join("");
        } else {
            printableBody = row.내용;
        }

        html += `
        <div class="print-item ${breakStyleClass}">
            <table class="info-table">
                <tr>
                    <td style="font-weight:bold; width:15%;">항목 번호</td><td style="width:35%; font-weight:bold; color:#1e73be;">${index + 1}번 (${isCase ? '면접후기' : '질문지'})</td>
                    <td style="font-weight:bold; width:15%;">대입 학년도</td><td style="width:35%;">${year}학년도</td>
                </tr>
                <tr>
                    <td style="font-weight:bold;">지원 대학교</td><td style="font-weight:bold;">${uni}</td>
                    <td style="font-weight:bold;">모집 단위</td><td>${major}</td>
                </tr>
                <tr>
                    <td style="font-weight:bold;">세부 전형명</td><td colspan="3">${typeName}</td>
                </tr>
            </table>
            <div class="content-box">${printableBody}</div>
        </div>
        `;
    });

    html += `</body></html>`;


    

// 이곳에서부터 일부 수정 새로운 탭이 열리는 방식에서 iframe 방식으로 

//     const printWindow = window.open("", "_blank");
//     if (!printWindow) {
//         alert("팝업 차단을 해제해 주세요.");
//         return;
//     }
//     printWindow.document.write(html);
//     printWindow.document.close();
//     setTimeout(function() {
//         printWindow.print();
//         printWindow.close();
//     }, 250);
// };




openPrintWindow(html);
};


// 예전 구버전 함수 바인딩 호환성 매핑 우회 레이어 제공
window.renderCart = function() { window.renderCartPage(); };