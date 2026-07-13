/* ==========================================
   대구고 대입 면접 아카이브
   Data Manager
========================================== */

const DataManager = {

    loaded : false,

    questions : [],

    cases : [],

    universities : [],

    majors : [],

    async initialize(){

        console.log("=================================");
        console.log("DataManager Start");
        console.log("=================================");

        await this.loadQuestions();

        await this.loadCases();

        await this.loadMaster();

        this.loaded = true;

        console.log("=================================");
        console.log("Data Ready");
        console.log("Question :", this.questions.length);
        console.log("Case :", this.cases.length);
        console.log("University :", this.universities.length);
        console.log("Major :", this.majors.length);
        console.log("=================================");

    },

    async loadQuestions(){

        console.log("Loading Question CSV...");

        this.questions = [];

        for(const file of CONFIG.QUESTION_FILES){

            try{

                const rows = await loadCSV(

                    CONFIG.QUESTION_PATH + file

                );

                this.questions.push(...rows);

            }

            catch(error){

                console.warn(file + " not found.");

            }

        }

    },

    async loadCases(){

        console.log("Loading Case CSV...");

        try{

            this.cases = await loadCSV(

                CONFIG.CASE_PATH +

                CONFIG.CASE_FILE

            );

        }

        catch(error){

            console.warn("Case.csv not found.");

        }

    },

    async loadMaster(){

        console.log("Loading Master CSV...");

        try{

            this.universities = await loadCSV(

                CONFIG.LIST_PATH +

                CONFIG.UNIVERSITY_FILE

            );

        }

        catch(error){

            console.warn("University.csv not found.");

        }

        try{

            this.majors = await loadCSV(

                CONFIG.LIST_PATH +

                CONFIG.MAJOR_FILE

            );

        }

        catch(error){

            console.warn("Major.csv not found.");

        }

    }

};