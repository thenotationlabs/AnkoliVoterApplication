const API_URL = "https://ankolivoterlist.electrobizz.com/api/public/yadi/search?q=";

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const formMessage = document.getElementById("formMessage");
const resultsSummary = document.getElementById("resultsSummary");
const resultsList = document.getElementById("resultsList");
const voterModal = document.getElementById("voterModal");
const toast = document.getElementById("toast");
let selectedVoter = null;
let toastTimer = null;

function setMessage(text, type = "") {
  formMessage.textContent = text;
  formMessage.className = `form-message ${type}`.trim();
}
function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}
function safeText(value, fallback = "माहिती उपलब्ध नाही") {
  if (value === null || value === undefined || String(value).trim() === "") return fallback;
  return String(value);
}
function firstLetter(name) {
  return [...(name || "अ")][0] || "अ";
}
function clearResults() {
  resultsList.replaceChildren();
  resultsSummary.hidden = true;
  resultsSummary.textContent = "";
}
function renderResults(voters, total) {
  resultsList.replaceChildren();
  resultsSummary.hidden = false;
  resultsSummary.textContent = `एकूण ${total ?? voters.length} मतदार सापडले`;
  if (!voters.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = "<strong>मतदार सापडला नाही</strong><span>नाव तपासून पुन्हा शोधा.</span>";
    resultsList.appendChild(empty);
    return;
  }
  voters.forEach(voter => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "result-item";
    const avatar = document.createElement("span");
    avatar.className = "avatar";
    avatar.textContent = firstLetter(voter.fullName);
    const info = document.createElement("span");
    info.className = "result-info";
    const name = document.createElement("span");
    name.className = "result-name";
    name.textContent = safeText(voter.fullName);
    const meta = document.createElement("span");
    meta.className = "result-meta";
    const details = [voter.wardName, voter.voterSerialNumber ? `अनुक्रमांक ${voter.voterSerialNumber}` : ""].filter(Boolean);
    meta.textContent = details.join(" • ") || "तपशील पाहण्यासाठी निवडा";
    info.append(name, meta);
    const arrow = document.createElement("span");
    arrow.className = "result-arrow";
    arrow.textContent = "›";
    button.append(avatar, info, arrow);
    button.addEventListener("click", () => openVoter(voter));
    resultsList.appendChild(button);
  });
}
async function searchVoters(query) {
  searchButton.disabled = true;
  searchButton.querySelector(".button-label").textContent = "शोधत आहे…";
  setMessage("कृपया थोडा वेळ थांबा…");
  clearResults();
  try {
    const response = await fetch(API_URL + encodeURIComponent(query), {
      method: "GET",
      headers: { "Accept": "application/json" }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    if (payload.success === false) throw new Error(payload.message || "API error");
    const data = payload.data || {};
    const voters = Array.isArray(data.results) ? data.results : [];
    renderResults(voters, data.total ?? voters.length);
    setMessage(voters.length ? "मतदाराच्या नावावर टॅप करून कार्ड पाहा." : "या नावासाठी निकाल मिळाले नाहीत.", voters.length ? "success" : "");
  } catch (error) {
    console.error("Voter search failed:", error);
    setMessage("माहिती मिळवता आली नाही. इंटरनेट कनेक्शन किंवा API उपलब्धता तपासून पुन्हा प्रयत्न करा.", "error");
    resultsList.innerHTML = '<div class="empty-state"><strong>शोध अयशस्वी</strong><span>काही वेळाने पुन्हा प्रयत्न करा.</span></div>';
  } finally {
    searchButton.disabled = false;
    searchButton.querySelector(".button-label").textContent = "शोधा";
  }
}
searchForm.addEventListener("submit", event => {
  event.preventDefault();
  const query = searchInput.value.trim();
  // Count Unicode code points so Marathi text is handled correctly.
  if ([...query].length < 3) {
    clearResults();
    setMessage("कृपया शोधण्यासाठी किमान ३ अक्षरे टाका.", "error");
    searchInput.focus();
    return;
  }
  searchVoters(query);
});
searchInput.addEventListener("input", () => {
  if ([...searchInput.value.trim()].length < 3) {
    setMessage("शोधण्यासाठी किमान ३ अक्षरे टाका.");
  }
});

function fillField(id, value) {
  document.getElementById(id).textContent = safeText(value);
}
function openVoter(voter) {
  selectedVoter = voter;
  fillField("cardName", voter.fullName);
  fillField("cardParent", voter.parentOrHusbandName);
  fillField("cardEpic", voter.electionCardNumber);
  fillField("cardSerial", voter.voterSerialNumber);
  fillField("cardWard", voter.wardName || (voter.wardNumber ? `वॉर्ड ${voter.wardNumber}` : ""));
  fillField("cardPart", voter.partNumber);
  fillField("cardBooth", voter.boothSection);
  fillField("cardAddress", voter.address || "अंकोली");
  document.getElementById("modalMessage").textContent = "";
  voterModal.hidden = false;
  document.body.style.overflow = "hidden";
  document.getElementById("closeModal").focus();
}
function closeModal() {
  voterModal.hidden = true;
  document.body.style.overflow = "";
  selectedVoter = null;
}
document.getElementById("closeModal").addEventListener("click", closeModal);
voterModal.addEventListener("click", event => {
  if (event.target.dataset.close === "true") closeModal();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !voterModal.hidden) closeModal();
});

document.getElementById("shareButton").addEventListener("click", () => {
  if (!selectedVoter) return;
  const v = selectedVoter;
  const message = [
    "अंकोली ग्रामपंचायत निवडणूक २०२६ — मतदार माहिती",
    `नाव: ${safeText(v.fullName)}`,
    `वडील / पतीचे नाव: ${safeText(v.parentOrHusbandName)}`,
    `मतदार ओळखपत्र क्रमांक: ${safeText(v.electionCardNumber)}`,
    `मतदार अनुक्रमांक: ${safeText(v.voterSerialNumber)}`,
    `वॉर्ड: ${safeText(v.wardName || (v.wardNumber ? `वॉर्ड ${v.wardNumber}` : ""))}`,
    `भाग क्रमांक: ${safeText(v.partNumber)}`,
    `मतदान केंद्र / विभाग: ${safeText(v.boothSection)}`,
    `पत्ता: ${safeText(v.address || "अंकोली")}`,
    "",
    "टीप: ही माहिती डिजिटल सारांश आहे; अधिकृत मतदार ओळखपत्र नाही."
  ].join("\n");
  const url = "https://wa.me/?text=" + encodeURIComponent(message);
  window.open(url, "_blank", "noopener,noreferrer");
});
document.getElementById("downloadButton").addEventListener("click", async () => {
  if (!selectedVoter) return;
  const button = document.getElementById("downloadButton");
  const message = document.getElementById("modalMessage");
  if (typeof html2canvas !== "function") {
    message.textContent = "डाउनलोड लायब्ररी लोड झाली नाही. इंटरनेट कनेक्शन तपासा.";
    return;
  }
  button.disabled = true;
  button.textContent = "कार्ड तयार होत आहे…";
  message.textContent = "कार्ड तयार होत आहे, कृपया थांबा.";
  try {
    const card = document.getElementById("voterCard");
    const canvas = await html2canvas(card, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
    const link = document.createElement("a");
    const name = (selectedVoter.fullName || "voter").replace(/[^\p{L}\p{N}-]+/gu, "-");
    link.download = `Ankoli-Voter-${name}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    message.textContent = "कार्ड डाउनलोड सुरू झाले.";
  } catch (error) {
    console.error("Card download failed:", error);
    message.textContent = "डाउनलोड करता आले नाही. पुन्हा प्रयत्न करा.";
  } finally {
    button.disabled = false;
    button.innerHTML = '<span aria-hidden="true">↓</span> कार्ड डाउनलोड करा';
  }
});
