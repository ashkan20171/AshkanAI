const SUPABASE_URL = "https://ljrdoedspdkzwuxafbvo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqcmRvZWRzcGRrend1eGFmYnZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MzM5MzMsImV4cCI6MjA3ODAwOTkzM30.rGyQnPhWr0gavPiSVfNNIp9gFypehTU4a0mEkJBhxNQ";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let mode = "login"; // or "register"
let currentLang = "en";

function loadLang() {
    const langData = JSON.parse(document.getElementById(`lang-${currentLang}`).textContent);

    document.getElementById("title").innerText = langData.title;
    document.getElementById("email").placeholder = langData.email;
    document.getElementById("password").placeholder = langData.password;
    document.getElementById("login-btn").innerText = langData[mode];
    document.getElementById("switch-text").innerText = mode === "login" ? langData.switch_to_register : langData.switch_to_login;
    document.getElementById("switch-link").innerText = mode === "login" ? langData.register : langData.login;
}

function setLang(lang) {
    currentLang = lang;
    document.documentElement.setAttribute("data-lang", lang);
    loadLang();
}

function toggleMode() {
    mode = mode === "login" ? "register" : "login";
    loadLang();
}

async function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error) location.href = "index.html";
        else alert(error.message);
    } 
    else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (!error) {
            // ساخت پروفایل کاربر با نقش free
            await supabase.from("users").insert([{ email, role: "free" }]);
            location.href = "index.html";
        } else alert(error.message);
    }
}

loadLang();
