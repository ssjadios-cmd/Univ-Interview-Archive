/* ==========================================
   대구고 대입 면접 아카이브
   Utility Library
========================================== */

/* ==========================================
   Global Data
========================================== */

const DATA = {

    questions : [],

    cases : [],

    universities : [],

    majors : []

};


/* ==========================================
   String
========================================== */

function safeString(value){

    if(value === null || value === undefined){

        return "";

    }

    return String(value);

}


function normalizeText(text){

    return safeString(text)

        .trim()

        .toLowerCase();

}


/* ==========================================
   HTML Escape
========================================== */

function escapeHTML(text){

    return safeString(text)

        .replace(/&/g,"&amp;")

        .replace(/</g,"&lt;")

        .replace(/>/g,"&gt;")

        .replace(/"/g,"&quot;")

        .replace(/'/g,"&#039;");

}


/* ==========================================
   Highlight
========================================== */

function highlight(text, keyword){

    if(!keyword){

        return escapeHTML(text);

    }

    const escaped = escapeHTML(text);

    const regex = new RegExp(

        keyword,

        "gi"

    );

    return escaped.replace(

        regex,

        match=>`<mark>${match}</mark>`

    );

}


/* ==========================================
   Empty
========================================== */

function isEmpty(value){

    return normalizeText(value) === "";

}


/* ==========================================
   Compare
========================================== */

function contains(text, keyword){

    return normalizeText(text)

        .includes(

            normalizeText(keyword)

        );

}


/* ==========================================
   Year
========================================== */

function makeYearArray(){

    const years = [];

    const current =

        new Date().getFullYear()+2;

    for(

        let y=current;

        y>=CONFIG.START_YEAR;

        y--

    ){

        years.push(y);

    }

    return years;

}


/* ==========================================
   Debounce
========================================== */

function debounce(func, delay){

    let timer;

    return function(){

        clearTimeout(timer);

        timer = setTimeout(

            ()=>{

                func.apply(

                    this,

                    arguments

                );

            },

            delay

        );

    };

}


/* ==========================================
   Date
========================================== */

function today(){

    const d = new Date();

    return

        d.getFullYear()+"-"+

        String(

            d.getMonth()+1

        ).padStart(2,"0")+"-"+

        String(

            d.getDate()

        ).padStart(2,"0");

}


/* ==========================================
   Sort
========================================== */

function sortByYearDesc(data){

    return data.sort(

        (a,b)=>

        Number(b.대입연도)

        -

        Number(a.대입연도)

    );

}


/* ==========================================
   CSV Loader
========================================== */

function loadCSV(path){

    return new Promise(

        function(resolve,reject){

            Papa.parse(

                path,

                {

                    download:true,

                    header:true,

                    skipEmptyLines:true,

                    complete:function(result){

                        resolve(result.data);

                    },

                    error:function(error){

                        reject(error);

                    }

                }

            );

        }

    );

}


/* ==========================================
   Logger
========================================== */

function log(title,data){

    console.log(

        "%c"+title,

        "color:#1565C0;font-weight:bold"

    );

    console.log(data);

}