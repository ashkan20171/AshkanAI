import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ljrdoedspdkzwuxafbvo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqcmRvZWRzcGRrend1eGFmYnZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MzM5MzMsImV4cCI6MjA3ODAwOTkzM30.rGyQnPhWr0gavPiSVfNNIp9gFypehTU4a0mEkJBhxNQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elements
const workspaceList = document.getElementById("workspaceList");
const newWorkspaceBtn = document.getElementById("newWorkspaceBtn");
const messagesContainer = document.getElementById("messages");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

let currentWorkspace = null;

// Ensure logged in
supabase.auth.getUser().then(({ data }) => {
    if (!data.user) {
        window.location.href = "login.html";
    } else {
        loadWorkspaces();
    }
});

// Load Workspaces
async function loadWorkspaces() {
    const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .order("created_at", { ascending: true });

    workspaceList.innerHTML = "";

    data?.forEach(ws => {
        const div = document.createElement("div");
        div.textContent = ws.name;
        div.onclick = () => selectWorkspace(ws.id);
        workspaceList.appendChild(div);
    });

    // Auto-select first workspace if exists
    if (data?.length > 0) {
        selectWorkspace(data[0].id);
    }
}

// Create Workspace
newWorkspaceBtn.onclick = async () => {
    const name = prompt("Workspace Name:");
    if (!name) return;

    const { error } = await supabase.from("workspaces").insert([{ name }]);
    if (error) console.log(error);

    loadWorkspaces();
};

// Select Workspace
async function selectWorkspace(id) {
    currentWorkspace = id;
    messagesContainer.innerHTML = "";
    loadMessages();
}

// Load Messages
async function loadMessages() {
    const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("workspace_id", currentWorkspace)
        .order("created_at", { ascending: true });

    messagesContainer.innerHTML = "";
    data.forEach(m => addMessageToUI(m.sender, m.content));
    scrollToBottom();
}

// UI Helper
function addMessageToUI(sender, text) {
    const div = document.createElement("div");
    div.className = `message ${sender}`;
    div.textContent = text;
    messagesContainer.appendChild(div);
    scrollToBottom();
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send Message
sendBtn.onclick = async () => {
    const text = userInput.value.trim();
    if (text === "" || !currentWorkspace) return;

    // Save User Message
    await supabase.from("messages").insert([
        { workspace_id: currentWorkspace, sender: "user", content: text }
    ]);

    addMessageToUI("user", text);

    userInput.value = "";

    // Call AI
    generateAIResponse(text);
};

// AI Response System (Will connect to GPT API later)
async function generateAIResponse(userText) {

    // Temporary smart placeholder
    const aiText = `🤖 (در حال پردازش...) برای ورودی: "${userText}"`;

    addMessageToUI("ai", aiText);

    // Save AI message to DB
    await supabase.from("messages").insert([
        { workspace_id: currentWorkspace, sender: "ai", content: aiText }
    ]);

    scrollToBottom();
}
