/* ==========================================
   Case Search Module (최종 디버깅 내장 버전)
========================================== */

const Case = {
    allData: [],      // CSV에서 불러온 원본 데이터 (A~G열)
    grouped: [],      // 사례번호 기준으로 묶인 케이스 데이터
    filtered: []      // 검색 조건에 의해 필터링된 결과
};

// 💡 Papa.parse를 활용해 CONFIG에 지정된 파일들을 로드
async function loadCaseData() {
    Case.allData = [];
    
    const files = CONFIG.CASE_FILE;
    if (!files || files.length === 0) {
        console.error("❌ [디버그 오류] CONFIG.CASE_FILE 배열이 비어있거나 정의되지 않았습니다.");
        return;
    }
    
    // 경로 끝에 슬래시가 중복되거나 누락되는 문제를 방지하는 정형화 코드
    let basePath = CONFIG.CASE_PATH || "data/Case/";
    if (!basePath.endsWith("/")) basePath += "/";

    for (const fileName of files) {
        const finalUrl = `${basePath}${fileName}`;
        
        try {
            const response = await fetch(finalUrl);
            
            if (!response.ok) {
                console.warn(`⚠️ [디버그 경고] 파일을 찾을 수 없습니다: ${finalUrl}`);
                continue; 
            }
            
            const csvText = await response.text();
            
            const parsed = Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true
            });

            if (parsed.data && parsed.data.length > 0) {
                // 💡 [매우 중요] 첫 번째 행의 데이터 구조가 어떻게 생겼는지 콘솔에 출력합니다.
                // '대입연도', '대학명', '사례번호' 글자가 한글로 정확히 매칭되는지 확인하기 위함입니다.
                if (Case.allData.length === 0) {
                }

                Case.allData = Case.allData.concat(parsed.data);
            } else {
                console.warn(`⚠️ [디버그 경고] ${fileName} 파일에 데이터 알맹이가 없습니다.`);
            }
        } catch (e) {
            console.error(`💥 [디버그 예외] ${fileName} 처리 중 에러 발생:`, e);
        }
    }
    
    console.log(`🎯 총 합산 원본 데이터(Case.allData) 개수: ${Case.allData.length}건`);
    groupCaseData(Case.allData);
}

/* ==========================================
   1. 데이터 그룹화 (사례 묶기 및 정렬)
========================================== */
function groupCaseData(rawData) {
    const dataToProcess = rawData || Case.allData;
    if (!dataToProcess || dataToProcess.length === 0) {
        console.warn("⚠️ [디버그] groupCaseData를 실행하려 했으나 처리할 데이터가 0개입니다.");
        return;
    }

    const maps = {};

    dataToProcess.forEach((row, idx) => {
        // 💡 만약 CSV 헤더 이름에 공백이 있거나 글자가 틀리면 여기서 걸러질 수 있습니다.
        if (!row.대입연도 || !row.대학명 || !row.사례번호) {
            if (idx === 0) {
                console.error("❌ [디버그 오류] CSV 행에서 '대입연도', '대학명', '사례번호' 중 일부를 찾지 못했습니다. 실제 필드명을 확인하세요:", row);
            }
            return;
        }

        const key = `${row.대입연도}_${row.대학명}_${row.사례번호}`;

        if (!maps[key]) {
            maps[key] = {
                사례번호: row.사례번호,
                대입연도: row.대입연도,
                대학명: row.대학명,
                모집단위: row.모집단위 || "",
                전형명: row.전형명 || "",
                lines: []
            };
        }
        
        maps[key].lines.push({
            줄번호: Number(row.줄번호) || 0,
            내용: row.내용 || ""
        });
    });

    Case.grouped = Object.values(maps).map(item => {
        item.lines.sort((a, b) => a.줄번호 - b.줄번호);
        return item;
    });
    
    console.log(`📦 최종 그룹화 완료 (Case.grouped): ${Case.grouped.length}개의 사례 묶음 생성 완료`);
}





/* ==========================================
   2. 케이스 검색 실행 및 리스트 렌더링은 기존과 동일
========================================== */
window.searchCase = function() {
    const uni = document.getElementById("cUniversity")?.value.trim().toLowerCase() || "";
    const major = document.getElementById("cMajor")?.value.trim().toLowerCase() || "";
    const startYear = Number(document.getElementById("cStartYear")?.value) || 0;
    const endYear = Number(document.getElementById("cEndYear")?.value) || 9999;

    Case.filtered = Case.grouped.filter(item => {
        const matchUni = !uni || item.대학명.toLowerCase().includes(uni);
        const matchMajor = !major || (item.모집단위 && item.모집단위.toLowerCase().includes(major));
        const year = Number(item.대입연도);
        const matchYear = year >= startYear && year <= endYear;
        return matchUni && matchMajor && matchYear;
    });

        if (typeof window.toggleSearchPanel === "function") {
            window.toggleSearchPanel(false);
        }
            renderCaseSummary(uni, major, startYear, endYear);
            renderCasePage();
    };  

function renderCaseSummary(uni, major, startYear, endYear) {
    const summary = document.getElementById("resultSummary");
    if (!summary) return;
    let condTexts = [];
    if (uni) condTexts.push(`대학: ${uni}`);
    if (major) condTexts.push(`모집단위: ${major}`);
    if (startYear !== 0 && endYear !== 9999) condTexts.push(`연도: ${startYear}~${endYear}`);
    const condString = condTexts.length > 0 ? condTexts.join(" / ") : "전체 검색";

    summary.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; font-size: 14px;">
            <span style="color: #555;">🔍 <strong>검색조건:</strong> ${condString}</span>
            <span style="color: #1e73be; font-weight: bold; font-size: 15px;">총 ${Case.filtered.length.toLocaleString()}건의 사례</span>
        </div>`;
}




// 💡 페이징 처리를 위한 전역 변수 추가
Case.currentPage = 1;

window.renderCasePage = function(page = 1) {
    const result = document.getElementById("caseList");
    const summary = document.getElementById("caseSummary");
    if (!result) return;

    Case.currentPage = page;
    const perPage = CONFIG.RESULT_PER_PAGE || 10;
    
    if (Case.filtered.length === 0) {
        result.innerHTML = `<div class="result-card" style="padding: 20px; text-align: center; color: #666;">검색된 면접 사례가 없습니다.</div>`;
        return;
    }

    const startIndex = (Case.currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    const pageData = Case.filtered.slice(startIndex, endIndex);

    // ✅ 🔥 여기 추가 (Case 검색 요약 표시 핵심)
if (summary) {
    const conditionText = (() => {
        const uni = document.getElementById("cUniversity")?.value.trim();
        const major = document.getElementById("cMajor")?.value.trim();
        const startYear = document.getElementById("cStartYear")?.value;
        const endYear = document.getElementById("cEndYear")?.value;

        let arr = [];

        if (uni) arr.push(`대학: ${uni}`);
        if (major) arr.push(`모집단위: ${major}`);

        if (startYear && endYear) {
            arr.push(startYear === endYear
                ? `연도: ${startYear}년`
                : `연도: ${startYear}~${endYear}년`
            );
        } else if (startYear) {
            arr.push(`연도: ${startYear}년~`);
        } else if (endYear) {
            arr.push(`연도: ~${endYear}년`);
        }

        return arr.length ? arr.join(" / ") : "전체 검색";
    })();

    summary.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; width:100%; font-size:14px;">
            <span style="color:#555;">
                🔍 <strong>검색조건:</strong> ${conditionText}
            </span>
            <span style="color:#1e73be; font-weight:bold; font-size:15px;">
                총 ${Case.filtered.length.toLocaleString()}건 검색됨
            </span>
        </div>
    `;
}


    let html = "";
    // 💡 여기서 index는 0부터 9까지만 돕니다.
    pageData.forEach((item, index) => {
        const globalIndex = startIndex + index + 1; 
        
        const itemKey = `${item.대입연도}_${item.대학명}_${item.사례번호}`;
        const isChecked = typeof Cart !== "undefined" && Cart.items && Cart.items.some(c => c.type === "case" && c.key === itemKey);

        // 💡 [수정] 줄번호 정렬 후 첫 줄 대제목 및 질문 가독성 업그레이드
        const sortedLines = [...item.lines].sort((a, b) => a.줄번호 - b.줄번호);

        const bookContent = sortedLines.map((line, idx) => {
            const text = (line.내용 || "").trim();
            if (!text) return "";
            
            // 1) 📌 첫 번째 줄: 면접 사례의 대제목 배너형 강조
            if (idx === 0) {
                return `
                <div class="case-main-title" style="
                    font-size: 15.5px; 
                    font-weight: bold; 
                    color: #2c3e50; 
                    background-color: #f1f3f5; 
                    padding: 10px 14px; 
                    border-left: 5px solid #2ecc71; 
                    margin-top: 5px;
                    margin-bottom: 15px; 
                    border-radius: 0 4px 4px 0;
                    line-height: 1.45;
                    word-break: break-all;
                ">
                    📄 ${text}
                </div>`;
            }
            
            // 2) 💡 면접관의 질문 (Q: 또는 질문:) 강조
            if (text.startsWith("Q:") || text.startsWith("질문:")) {
                return `<div style="margin-top: 18px; margin-bottom: 6px; font-weight: bold; color: #1e73be; font-size: 14.5px; border-bottom: 1px dashed #e9ecef; padding-bottom: 4px;">📢 ${text}</div>`;
            } 
            
            // 3) 📋 단락 구분용 항목 강조 (기존 조건 유지)
            else if (text.startsWith("로") || (text.startsWith("[") && text.includes("]"))) {
                return `<div style="margin-top: 15px; margin-bottom: 8px; font-weight: bold; font-size: 15px; border-left: 3px solid #333; padding-left: 8px; color: #111;">${text}</div>`;
            } 
            
            // 4) ✏️ 일반 학생 답변 및 서술 본문
            else {
                return `<div style="margin-bottom: 8px; line-height: 1.65; color: #444; text-align: justify; font-size: 14px; padding-left: 4px; word-break: break-all;">${text}</div>`;
            }
        }).join("");


        html += `
        <div class="case-card" style="border: 1px solid #ccc; border-radius: 6px; margin-bottom: 12px; background: #fff; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div class="case-header" style="padding: 12px 15px; background: #f8f9fa; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid transparent; transition: background 0.2s; user-select: none;">
                <div style="display: flex; align-items: center; gap: 10px; flex: 1; cursor: pointer;" onclick="toggleCaseAccordion(this.parentElement)">
                    
                    <input type="checkbox" class="case-checkbox" data-key="${itemKey}" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation();" onchange="toggleCaseCart(this);" style="width: 16px; height: 16px; cursor: pointer;">                    
                    <span style="font-weight: bold; color: #111; font-size: 14px; margin-right: 8px;">📄 사례 ${globalIndex}</span>
                    <span style="font-weight: bold; color: #333; font-size: 14px;">${item.대학명}</span>
                    <span style="color: #666; font-size: 13px;"> (${item.모집단위 || '전체'})</span>
                </div>
                <div style="font-size: 13px; color: #666; display: flex; align-items: center; cursor: pointer;" onclick="toggleCaseAccordion(this)">
                    ${item.대입연도}학년도 / ${item.전형명}
                    <span class="arrow-icon" style="margin-left: 10px; font-size: 12px; transition: transform 0.2s;">▼</span>
                </div>
            </div>
            <div class="case-body" style="display: none; padding: 20px; background: #fff; border-top: 1px solid #eee;">
                <div class="book-page" style="padding: 0 5px;">${bookContent}</div>
            </div>
        </div>`;
    });

    html += createCasePagination(Case.filtered.length, perPage, Case.currentPage);
    result.innerHTML = html;
};




// ⭕ [추가] 체크박스 선택 시 전역 Cart 객체에 케이스 단락 전체를 밀어넣는 핵심 함수
window.toggleCaseCart = function(checkbox) {
    if (typeof Cart === "undefined" || typeof addToCart !== "function") {
        console.error("❌ 장바구니 시스템 인터페이스를 호출할 수 없습니다.");
        return;
    }
    
    const itemKey = checkbox.getAttribute("data-key");
    const isChecked = checkbox.checked;
    
    if (isChecked) {
        const itemData = Case.filtered.find(item => `${item.대입연도}_${item.대학명}_${item.사례번호}` === itemKey);
        if (!itemData) {
            checkbox.checked = false;
            return;
        }

        // ⭕ 업그레이드된 통합 카트 형식으로 객체 포장
        const cartItem = {
            id: `case_${itemKey}`,
            key: itemKey,
            type: "case", 
            대학명: itemData.대학명,
            모집단위: itemData.모집단위 || "전체",
            대입연도: itemData.대입연도,
            전형명: itemData.전형명,
            rawData: itemData // 원본 데이터 lines 내장
        };

        // ⭕ 카트 내장 정식 수신 함수 호출! (여기서 중복 및 한도 자동 필터링)
        addToCart(cartItem);
    } else {
        // 체크 해제 시 제거
        Cart.items = Cart.items.filter(item => item.id !== `case_${itemKey}`);
        if (typeof updateCartCount === "function") updateCartCount(Cart.items.length);
    }
};



    
    // 페이지 이동 후 스크롤을 맨 위로 부드럽게 올려주는 센스
    window.scrollTo({ top: 0, behavior: 'smooth' });


/* ==========================================
   3. 케이스 전용 하단 페이지네이션 바 생성 함수
========================================== */
function createCasePagination(totalItems, perPage, currentPage) {
    const totalPages = Math.ceil(totalItems / perPage);
    if (totalPages <= 1) return ""; // 1페이지 이하면 네비게이션 숨김

    const blockSize = CONFIG.PAGE_BLOCK_SIZE || 10; // 한번에 보여줄 페이지 묶음 (10개씩)
    const currentBlock = Math.ceil(currentPage / blockSize);
    const startPage = (currentBlock - 1) * blockSize + 1;
    const endPage = Math.min(startPage + blockSize - 1, totalPages);

    let html = `<div class="pagination" style="display: flex; justify-content: center; align-items: center; margin-top: 25px; gap: 5px; user-select: none;">`;

    // [처음] [이전] 버튼
    if (currentBlock > 1) {
        html += `<button onclick="renderCasePage(1)" style="padding: 5px 10px; border: 1px solid #ccc; background: #fff; cursor: pointer; border-radius: 4px;">&lt;&lt;</button>`;
        html += `<button onclick="renderCasePage(${startPage - 1})" style="padding: 5px 10px; border: 1px solid #ccc; background: #fff; cursor: pointer; border-radius: 4px;">이전</button>`;
    }

    // 숫자 페이지 버튼들
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage;
        html += `
            <button onclick="renderCasePage(${i})" style="
                padding: 6px 12px; 
                border: 1px solid ${isActive ? '#1e73be' : '#ccc'}; 
                background: ${isActive ? '#1e73be' : '#fff'}; 
                color: ${isActive ? '#fff' : '#333'}; 
                font-weight: ${isActive ? 'bold' : 'normal'};
                cursor: pointer; 
                border-radius: 4px;
            ">${i}</button>`;
    }

    // [다음] [끝] 버튼
    if (endPage < totalPages) {
        html += `<button onclick="renderCasePage(${endPage + 1})" style="padding: 5px 10px; border: 1px solid #ccc; background: #fff; cursor: pointer; border-radius: 4px;">다음</button>`;
        html += `<button onclick="renderCasePage(${totalPages})" style="padding: 5px 10px; border: 1px solid #ccc; background: #fff; cursor: pointer; border-radius: 4px;">&gt;&gt;</button>`;
    }

    html += `</div>`;
    return html;
}




window.toggleCaseAccordion = function(header) {
    const body = header.nextElementSibling;
    const arrow = header.querySelector(".arrow-icon");
    if (body.style.display === "none") {
        body.style.display = "block";
        header.style.backgroundColor = "#eef5fc"; 
        header.style.borderBottomColor = "#ddd";
        if (arrow) arrow.style.transform = "rotate(180deg)";
    } else {
        body.style.display = "none";
        header.style.backgroundColor = "#f8f9fa";
        header.style.borderBottomColor = "transparent";
        if (arrow) arrow.style.transform = "rotate(0deg)";
    }
};



function resetCaseConditions() {
    console.log("resetCaseConditions()");

    ["cUniversity", "cMajor"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });

    if (typeof initializeYearSelect === "function") initializeYearSelect();

    Case.filtered = [];
    Case.currentPage = 1;

    if (typeof clearResult === "function") clearResult();
    if (typeof initializeFocus === "function") initializeFocus();
    if (typeof window.toggleSearchPanel === "function") window.toggleSearchPanel(true);
}



// ⭕ [추가] 초기화, 전체선택, 선택해제 버튼 이벤트 바인딩 호출 구조 구현
window.initializeCaseButtons = function() {
    // 1. [초기화] 버튼 연동
    const btnReset = document.getElementById("btnCaseReset");
    if (btnReset) {
        btnReset.onclick = function() {
            document.getElementById("cUniversity").value = "";
            document.getElementById("cMajor").value = "";
            initializeYearSelect(); // 연도 셀렉트박스 원위치
            window.searchCase(); // 검색 리셋 반영
        };
    }

    // 2. [전체 선택] 버튼 연동 (현재 필터링된 검색 결과 전체를 장바구니에 담기)
    const btnSelectAll = document.getElementById("btnCaseSelectAll");
    if (btnSelectAll) {
        btnSelectAll.onclick = function() {
            Case.filtered.forEach(item => {
                const itemKey = `${item.대입연도}_${item.대학명}_${item.사례번호}`;
                const exists = Cart.items.some(c => c.type === "case" && c.key === itemKey);
                if (!exists) {
                    Cart.items.push({
                        id: `case_${itemKey}`,
                        key: itemKey,
                        type: "case",
                        title: `[케이스] ${item.대입연도}년 ${item.대학명} (${item.모집단위})`,
                        rawData: item
                    });
                }
            });
            if (typeof updateCartCount === "function") updateCartCount();
            window.renderCasePage(Case.currentPage); // 체크박스 상태 UI 동기화
            alert(`현재 검색결과 ${Case.filtered.length}건이 장바구니에 추가되었습니다.`);
        };
    }

    // 3. [선택 해제] 버튼 연동 (현재 화면 검색 결과만 장바구니에서 걷어내기)
    const btnDeselectAll = document.getElementById("btnCaseDeselectAll");
    if (btnDeselectAll) {
        btnDeselectAll.onclick = function() {
            const filteredKeys = Case.filtered.map(item => `${item.대입연도}_${item.대학명}_${item.사례번호}`);
            Cart.items = Cart.items.filter(c => !(c.type === "case" && filteredKeys.includes(c.key)));
            if (typeof updateCartCount === "function") updateCartCount();
            window.renderCasePage(Case.currentPage);
        };
    }
};

// ui.js의 createCaseSearch 완료 시점이나 app.js의 최하단 ready 블록에 실행 명령을 심어줍니다.




/* ==========================================
   Case 인쇄 인터페이스 및 데이터 수집 모듈 (전역 바인딩)
========================================== */

// 1. ui.js 공용 인쇄 버튼과 다른 모듈에서 호출할 수 있도록 window에 전역 바인딩
window.printCase = function() {
    const items = window.getSelectedCaseItems();
    
    if (!items || items.length === 0) {
        alert("선택된 면접 사례가 없습니다. 인쇄할 항목에 체크해 주세요.");
        return;
    }

    if (typeof printItems === "function") {
        printItems(items);
    } else {
        alert("인쇄 시스템(printItems)을 찾을 수 없습니다.");
    }
};

// 2. 현재 화면에서 체크된 케이스 데이터를 정제하여 수집하는 함수
window.getSelectedCaseItems = function() {
    const items = [];
    
    // #caseList 내부에 체크된 모든 체크박스를 안전하게 탐색
    const checkedBoxes = document.querySelectorAll("#caseList .case-checkbox:checked, #caseList input[type='checkbox']:checked");
    
    checkedBoxes.forEach(chk => {
        const key = chk.getAttribute("data-key");
        if (!key) return;

        // Case.filtered 검색 결과 배열에서 일치하는 key 인덱스 추출
        const item = Case.filtered.find(c => 
            `${c.대입연도}_${c.대학명}_${c.사례번호}` === key
        );

        if (item) {
            // 중복 방지 검증 후 배열 삽입
            const isDuplicate = items.some(inserted => inserted.key === key);
            if (!isDuplicate) {
                items.push({
                    type: "case",
                    key: key,
                    id: `case_${key}`,
                    대학명: item.대학명,
                    모집단위: item.모집단위 || "전체",
                    대입연도: item.대입연도,
                    전형명: item.전형명,
                    lines: item.lines, // 💡 print.js가 헤매지 않도록 1계층 루트에 바로 주입
                    rawData: item       // 장바구니 호환용 원본 백업 데이터 유지
                });
            }
        }
    });

    return items;
};

// 3. 기존의 단순 구형 HTML 빌더 제거 및 통합 규격 인터페이스 매핑
function buildCaseHTML(row, index) {
    // 이 함수는 print.js 통합 인쇄기로 대체되므로 하위 호환성 유지용으로만 둡니다.
    let body = "";
    const targetLines = row.lines || (row.rawData ? row.rawData.lines : []);
    targetLines.forEach(function(line) {
        body += (line.내용 || "") + "<br>";
    });
    return `
    <div class="question case">
        <table class="info">
            <tr>
                <td><b>${index + 1}. ${row.대학명 || ''}</b></td>
                <td align="right">${row.대입연도 || ''}학년도</td>
            </tr>
            <tr>
                <td>${row.모집단위 || ''}</td>
                <td align="right">${row.전형명 || ''}</td>
            </tr>
        </table>
        <div class="content">${body}</div>
    </div>`;
}