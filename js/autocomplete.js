/* ==========================================
   Autocomplete Module
   대학명 / 모집단위 / 전형명 자동완성
========================================== */

const Autocomplete = {
    data: {
        대학명: [],
        모집단위: [],
        전형명: []
    },
    box: null,
    activeIndex: -1
};

// input id -> 어떤 필드 값으로 자동완성할지 매핑
const AUTOCOMPLETE_FIELD_MAP = {
    qUniversity: "대학명",
    qMajor: "모집단위",
    qAdmission: "전형명",
    cUniversity: "대학명",
    cMajor: "모집단위"
};

/* ==========================================
   1. 데이터 로드 완료 후 고유값 목록 구축
========================================== */
function buildAutocompleteData() {
    const uniSet = new Set();
    const majorSet = new Set();
    const typeSet = new Set();

    (Question.data || []).forEach(row => {
        if (row.대학명) uniSet.add(row.대학명.trim());
        if (row.모집단위) majorSet.add(row.모집단위.trim());
        if (row.전형명) typeSet.add(row.전형명.trim());
    });

    if (typeof Case !== "undefined" && Case.grouped) {
        Case.grouped.forEach(row => {
            if (row.대학명) uniSet.add(row.대학명.trim());
            if (row.모집단위) majorSet.add(row.모집단위.trim());
            if (row.전형명) typeSet.add(row.전형명.trim());
        });
    }

    Autocomplete.data.대학명 = Array.from(uniSet).filter(Boolean).sort();
    Autocomplete.data.모집단위 = Array.from(majorSet).filter(Boolean).sort();
    Autocomplete.data.전형명 = Array.from(typeSet).filter(Boolean).sort();

    console.log(
        "🔤 자동완성 데이터 구축 완료 - 대학명:", Autocomplete.data.대학명.length,
        "/ 모집단위:", Autocomplete.data.모집단위.length,
        "/ 전형명:", Autocomplete.data.전형명.length
    );
}

/* ==========================================
   2. 입력창에 이벤트 바인딩
========================================== */
window.initializeAutocomplete = function () {
    Object.keys(AUTOCOMPLETE_FIELD_MAP).forEach(id => {
        const input = document.getElementById(id);
        if (!input) return;
        if (input.dataset.acBound) return; // 중복 바인딩 방지

        input.dataset.acBound = "1";
        input.setAttribute("autocomplete", "off");

        input.addEventListener("input", handleAutocompleteInput);
        input.addEventListener("keydown", handleAutocompleteKeydown);
        input.addEventListener("blur", function () {
            // 목록 클릭(mousedown)이 blur보다 먼저 처리되도록 약간 지연
            setTimeout(closeAutocompleteBox, 150);
        });
    });
};

/* ==========================================
   3. 드롭다운 박스 생성/표시
========================================== */
function getOrCreateAutocompleteBox() {
    if (Autocomplete.box) return Autocomplete.box;

    const box = document.createElement("div");
    box.id = "autocompleteBox";
    box.style.position = "absolute";
    box.style.zIndex = "9999";
    box.style.background = "#fff";
    box.style.border = "1px solid #ccc";
    box.style.borderRadius = "4px";
    box.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
    box.style.maxHeight = "220px";
    box.style.overflowY = "auto";
    box.style.display = "none";
    document.body.appendChild(box);

    Autocomplete.box = box;
    return box;
}

function handleAutocompleteInput(e) {
    const input = e.target;
    const field = AUTOCOMPLETE_FIELD_MAP[input.id];
    if (!field) return;

    const keyword = input.value.trim();
    Autocomplete.activeIndex = -1;

    if (!keyword) {
        closeAutocompleteBox();
        return;
    }

    const list = (Autocomplete.data[field] || []).filter(item => contains(item, keyword));
    renderAutocompleteBox(input, list, keyword);
}

function renderAutocompleteBox(input, list, keyword) {
    const box = getOrCreateAutocompleteBox();

    if (list.length === 0) {
        closeAutocompleteBox();
        return;
    }

    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedKeyword})`, "gi");

    box.innerHTML = list.slice(0, 50).map((item, idx) => {
        const highlighted = escapeHTML(item).replace(regex, `<mark style="background:#fff3cd; padding:0 1px;">$1</mark>`);
        return `<div class="ac-item" data-value="${escapeHTML(item)}" data-idx="${idx}"
                    style="padding:8px 12px; cursor:pointer; font-size:14px;">${highlighted}</div>`;
    }).join("");

    const rect = input.getBoundingClientRect();
    box.style.left = (rect.left + window.scrollX) + "px";
    box.style.top = (rect.bottom + window.scrollY) + "px";
    box.style.width = rect.width + "px";
    box.style.display = "block";

    box.querySelectorAll(".ac-item").forEach(item => {
        // mousedown: blur보다 먼저 실행되어야 선택이 확실히 반영됨
        item.addEventListener("mousedown", function (e) {
            e.preventDefault();
            input.value = item.dataset.value;
            closeAutocompleteBox();
            input.focus();
        });
        item.addEventListener("mouseover", function () {
            highlightAutocompleteItem(Number(item.dataset.idx));
        });
    });
}

function highlightAutocompleteItem(idx) {
    const box = Autocomplete.box;
    if (!box) return;

    box.querySelectorAll(".ac-item").forEach(el => el.style.background = "");
    const target = box.querySelector(`.ac-item[data-idx="${idx}"]`);
    if (target) {
        target.style.background = "#eef5fc";
        target.scrollIntoView({ block: "nearest" });
    }
    Autocomplete.activeIndex = idx;
}

/* ==========================================
   4. 키보드 조작 (방향키 / Enter / Esc)
========================================== */
function handleAutocompleteKeydown(e) {
    const box = Autocomplete.box;
    if (!box || box.style.display === "none") return;

    const items = box.querySelectorAll(".ac-item");
    if (items.length === 0) return;

    if (e.key === "ArrowDown") {
        e.preventDefault();
        highlightAutocompleteItem(Math.min(Autocomplete.activeIndex + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        highlightAutocompleteItem(Math.max(Autocomplete.activeIndex - 1, 0));
    } else if (e.key === "Enter") {
        if (Autocomplete.activeIndex >= 0) {
            // 항목이 선택된 상태의 Enter는 "선택 확정"으로만 처리
            // (전역 검색 Enter가 같이 발동하지 않도록 전파 차단)
            e.preventDefault();
            e.stopPropagation();
            const target = items[Autocomplete.activeIndex];
            e.target.value = target.dataset.value;
            closeAutocompleteBox();
        }
        // activeIndex가 -1이면(하이라이트 없이 그냥 Enter) 전역 검색 Enter가 정상 동작하도록 둠
    } else if (e.key === "Escape") {
        closeAutocompleteBox();
    }
}

function closeAutocompleteBox() {
    if (Autocomplete.box) {
        Autocomplete.box.style.display = "none";
    }
    Autocomplete.activeIndex = -1;
}