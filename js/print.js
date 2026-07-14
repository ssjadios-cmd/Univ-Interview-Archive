/* ==========================================
   Print Module (IME 및 입력 프리징 방지 수정본)
========================================== */

/* ==========================================
   Cart Print
========================================== */
function printCart() {
    if (!Cart.items || Cart.items.length === 0) {
        alert("장바구니가 비어 있습니다.");
        return;
    }

    let checkboxes;

    if (currentMode === "cart") {
        checkboxes = document.querySelectorAll(".cartCheck");
    } else {
        checkboxes = document.querySelectorAll("#questionList input[type='checkbox']");
    }

    const selectedItems = [];

    if (checkboxes.length > 0) {
        checkboxes.forEach((chk, index) => {
            if (chk.checked && Cart.items[index]) {
                selectedItems.push(Cart.items[index]);
            }
        });
    }

    if (selectedItems.length === 0) {
        alert("인쇄할 질문을 선택(체크)해 주세요.");
        return;
    }

    const html = buildCartPrintHTML(selectedItems);
    openPrintWindow(html);
}


/* ==========================================
   Print Items (Question / Case unified)
========================================== */
function printItems(items) {
    if (!items || items.length === 0) {
        alert("인쇄할 자료가 없습니다.");
        return;
    }

    const html = buildUnifiedPrintHTML(items);
    openPrintWindow(html);
}



function openPrintWindow(html) {

    // 기존에 쓰던 print용 iframe이 있다면 제거
    const oldFrame = document.getElementById("__printFrame");
    if (oldFrame) oldFrame.remove();

    // 화면에 보이지 않는 iframe 생성
    const iframe = document.createElement("iframe");
    iframe.id = "__printFrame";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    // 콘텐츠가 완전히 렌더링된 후 인쇄 (이미지/폰트 로딩 대비)
    iframe.onload = function () {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
    };

    // 인쇄 다이얼로그가 닫히면 iframe 제거 + 메인 창 포커스 복구
    iframe.contentWindow.addEventListener("afterprint", function () {
        iframe.remove();
        if (typeof initializeFocus === "function") {
            initializeFocus();
        }
    });
}

// function openPrintWindow(html) {

//     const win = window.open("about:blank","_blank");

//     if(!win){
//         alert("팝업 차단");
//         return;
//     }

//     win.document.open();
//     win.document.write(html);
//     win.document.close();

//     win.focus();
//     win.print();

//     // 중복 실행 방지 플래그
//     let focusRestored = false;

//     function restoreMainFocus() {
//         if (focusRestored) return;
//         focusRestored = true;

//         setTimeout(function () {
//             window.focus();
//             if (typeof initializeFocus === "function") {
//                 initializeFocus();
//             }
//         }, 100);
//     }

//     // 1) 정상적으로 인쇄/취소된 경우
//     win.addEventListener("afterprint", function () {
//         restoreMainFocus();
//         try { win.close(); } catch(e) {}
//     });

//     // 2) 인쇄창이 강제로 닫혀버린 경우 (X버튼 등) - afterprint가 못 뜨는 케이스 대비
//     win.addEventListener("unload", function () {
//         restoreMainFocus();
//     });
// }





/* ==========================================
   Unified Print HTML (Question + Case)
========================================== */
function buildUnifiedPrintHTML(items) {
    let html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title> Daegu Highschool Univ_Interview Archive </title>
<style>
    @page { margin: 12mm 15mm; }
    body { font-family: "맑은 고딕", sans-serif; font-size: 10.5pt; line-height: 1.5; margin: 0; padding: 0; }
    h2 { text-align:center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
    .item { margin-bottom: 25px; }
    .info { width:100%; border-collapse:collapse; margin-bottom:10px; }
    .info td { border:1px solid #ccc; padding:6px; font-size:10pt; background:#f9f9f9; }
    .content { border:1px solid #555; padding:12px; background:#fafafa; white-space:pre-wrap; }
    .page-break { page-break-before: always; }
</style>
</head>
<body>
<h2>대구고등학교 대입 면접 아카이브</h2>
`;

    items.forEach((row, index) => {
        const isCase = row.type === "case" || row.lines;

        const uni = row.대학명 || row.rawData?.대학명 || "";
        const major = row.모집단위 || row.rawData?.모집단위 || "";
        const year = row.대입연도 || row.rawData?.대입연도 || "";
        const type = row.전형명 || row.rawData?.전형명 || "";

        let content = "";

        if (isCase && row.lines) {
            const sorted = [...row.lines].sort((a,b)=>(a.줄번호||0)-(b.줄번호||0));
            content = sorted.map(l => l.내용 || "").join("\n");
        } else {
            content = row.내용 || "";
        }

        html += `
        <div class="item ${isCase && index>0 ? 'page-break' : ''}">
            <table class="info">
                <tr>
                    <td><b>${index+1}</b> ${uni}</td>
                    <td>${year}학년도</td>
                </tr>
                <tr>
                    <td>${major}</td>
                    <td>${type}</td>
                </tr>
            </table>
            <div class="content">${content}</div>
        </div>
        `;
    });

    html += `
    <div class="print-footer">
        공교육을 위한 자료이며 무단 사용 및 복제를 금합니다.
    </div>
    </body>
    </html>`;
    return html;
}