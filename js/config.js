/* ==========================================
   대구고 대입 면접 아카이브
   Configuration
========================================== */

const CONFIG = {

    /* ===========================
       Program
    =========================== */

    APP_NAME : "대구고 대입 면접 아카이브",

    VERSION : "2.0.1",

      /* ===========================
         Access Period
      =========================== */

      // 마지막으로 사용할 수 있는 날짜
      EXPIRE_DATE : "2026-12-31",

      // 만료 후 표시할 안내 문구
      EXPIRE_MESSAGE :
         "이 웹앱의 사용 기간이 종료되었습니다. 관리자에게 문의해 주세요.",

    SCHOOL_NAME : "대구고",

    COPYRIGHT :

        "공교육 목적을 위한 자료이며 무단 복제 및 재배포 금지.",

    /* ===========================
       Search
    =========================== */

    START_YEAR : 2009,

    END_YEAR : 2025,  


    MAX_SEARCH_RESULT : 1000,

    CART_LIMIT : 3000,

    RESULT_PER_PAGE : 10,

    PAGE_BLOCK_SIZE : 10,

    /* ===========================
       Print
    =========================== */

    PRINT_FOOTER_LEFT :

        "대구고 대입 면접 아카이브",

    PRINT_FOOTER_RIGHT :

        "공교육 목적을 위한 자료이며 무단 복제 및 재배포 금지",

    /* ===========================
       Data Folder
    =========================== */

DATA_PATH : "./data/",

QUESTION_PATH : "./data/Question/",

CASE_PATH : "./data/Case/",

// LIST_PATH : "./data/List/",

    /* ===========================
       Question CSV
    =========================== */

    QUESTION_FILES : [

        "preguntas.csv",

    ],

    /* ===========================
       Case CSV
    =========================== */

    CASE_FILE :  [

        "casos.csv",

    ],
    /* ===========================
       Master Lists
    =========================== */

   //  UNIVERSITY_FILE :

   //      "University.csv",

   //  MAJOR_FILE :

   //      "Major.csv"

};