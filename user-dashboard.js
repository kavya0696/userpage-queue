/* ===============================
   CONFIGURATION
   =============================== */

// Change this to your backend URL
const BASE_URL = "http://localhost:5000/api";

let currentTokenId = null;
let currentShopId = null;
let statusInterval = null;

/* ===============================
   JOIN QUEUE
   =============================== */

async function joinQueue() {
  const shopId = document.getElementById("shopIdInput").value.trim();

  if (!shopId) {
    alert("Please enter a valid ID");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/join-queue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ shopId })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to join queue");
      return;
    }

    currentTokenId = data.tokenId;
    currentShopId = shopId;

    document.getElementById("joinSection").classList.add("hidden");
    document.getElementById("statusSection").classList.remove("hidden");

    updateUI(data);

    // Poll queue status every 5 seconds
    statusInterval = setInterval(fetchStatus, 5000);

  } catch (error) {
    alert("Server not reachable");
    console.error(error);
  }
}

/* ===============================
   FETCH STATUS
   =============================== */

async function fetchStatus() {
  try {
    const response = await fetch(`${BASE_URL}/queue-status/${currentShopId}/${currentTokenId}`);
    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Error fetching status");
      return;
    }

    updateUI(data);

  } catch (error) {
    console.error(error);
  }
}

/* ===============================
   UPDATE UI
   =============================== */

function updateUI(data) {
  document.getElementById("tokenNumber").innerText = data.tokenNumber;
  document.getElementById("peopleBefore").innerText = data.peopleBefore;
  document.getElementById("totalPeople").innerText = data.totalPeople;
}

/* ===============================
   CANCEL QUEUE
   =============================== */

async function cancelQueue() {
  if (!confirm("Are you sure you want to leave the queue?") ) return;

  try {
    const response = await fetch(`${BASE_URL}/cancel-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        shopId: currentShopId,
        tokenId: currentTokenId
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to cancel");
      return;
    }

    clearInterval(statusInterval);

    currentTokenId = null;
    currentShopId = null;

    document.getElementById("statusSection").classList.add("hidden");
    document.getElementById("joinSection").classList.remove("hidden");

    alert("You have left the queue");

  } catch (error) {
    alert("Server error");
    console.error(error);
  }
}
