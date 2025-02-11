document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
        document.getElementById("loadingScreen").classList.add("hidden");
        document.getElementById("mainContent").classList.remove("hidden");
        document.getElementById("Footer").style.display = "block";
        showRoom('bedroom'); // Load default room
    }, 2000);
    const historyButton = document.getElementById("historyLogBtn");
        if (historyButton) {
            historyButton.addEventListener("click", showHistoryLog);} // ✅ Ensures function is called
});

let appliancesData = JSON.parse(localStorage.getItem("appliancesData")) || {
    livingRoom: [
        { name: "TV", icon: "TV.png" },
        { name: "Speaker", icon: "Speaker.png" },
        { name: "Light", icon: "Light.png" }
    ],
    bedroom: [
        { name: "Light", icon: "Light.png" },
        { name: "Air Conditioner", icon: "AC.png" },
        { name: "Computer", icon: "PC.png" }
    ],
    kitchen: [
        { name: "Fridge", icon: "Fridge.png" },
        { name: "Microwave", icon: "Microwave.png" },
        { name: "Light", icon: "Light.png" }
    ]
};

function showRoom(room) {
    const title = document.getElementById("roomTitle");
    const controls = document.getElementById("roomControls");
    const removeSelect = document.getElementById("removeApplianceSelect");

    const formattedRoom = room === "living" || room === "livingroom" ? "livingRoom" : room;
    title.innerText = formattedRoom.charAt(0).toUpperCase() + formattedRoom.slice(1) + " Controls";

    controls.innerHTML = ''; // Clear controls
    removeSelect.innerHTML = ''; // Clear remove dropdown

    let savedData = JSON.parse(localStorage.getItem("appliancesData")) || {};

    if (!savedData[formattedRoom]) {
        savedData[formattedRoom] = [];
    }

    savedData[formattedRoom].forEach(appliance => {
        controls.appendChild(createApplianceButton(formattedRoom, appliance.name, appliance.icon));

        const option = document.createElement("option");
        option.value = appliance.name;
        option.textContent = appliance.name;
        removeSelect.appendChild(option);
    });

    localStorage.setItem("appliancesData", JSON.stringify(savedData)); // Save latest data
}

function toggleAppliance(id) {
    const button = document.querySelector(`[data-id='${id}']`);
    const applianceName = button.nextElementSibling.innerText;
    const room = id.split("_")[0]; // Extract room from ID
    
    let savedData = JSON.parse(localStorage.getItem("appliancesData")) || {};

    if (!savedData[room]) return;

    let appliance = savedData[room].find(a => a.name === applianceName);
    if (!appliance) return;

    if (button.classList.contains("off")) {
        button.classList.remove("off");
        button.classList.add("on");
        logHistoryEntry(applianceName, "ON");
    } else {
        button.classList.remove("on");
        button.classList.add("off");
        logHistoryEntry(applianceName, "OFF");
    }

    localStorage.setItem("appliancesData", JSON.stringify(savedData)); // Save state
}

function createApplianceButton(room, name, icon) {
    const wrapper = document.createElement("div");

    const button = document.createElement("button");
    button.classList.add("appliance-btn", "off");
    button.setAttribute("data-id", `${room}_${name}`);
    button.onclick = () => toggleAppliance(`${room}_${name}`);

    const img = document.createElement("img");
    img.src = `Images/${icon}`;
    img.alt = name;

    button.appendChild(img);

    const label = document.createElement("div");
    label.classList.add("appliance-label");
    label.innerText = name;

    wrapper.appendChild(button);
    wrapper.appendChild(label);

    return wrapper;
}

function showPopup(message) {
    document.getElementById("popupMessage").innerHTML = message;

    const buttonContainer = document.getElementById("popupButtons");
    buttonContainer.innerHTML = ""; // ✅ Clears previous buttons

    const okButton = document.createElement("button");
    okButton.innerText = "OK";
    okButton.onclick = closePopup;
    
    buttonContainer.appendChild(okButton);

    document.getElementById("popupScreen").classList.remove("hidden");
}

// 🔹 Close pop-up
function closePopup() {
    document.getElementById("popupScreen").classList.add("hidden");
}

// 🔹 Add new appliance with pop-up alerts
function addAppliance() {
    const room = document.getElementById("roomTitle").innerText.split(" ")[0].toLowerCase();
    const applianceName = document.getElementById("applianceName").value.trim();
    const applianceIcon = document.getElementById("applianceIcon").value;

    if (!applianceName) {
        showPopup("Enter an appliance name!");
        return;
    }

    const formattedRoom = room === "living" || room === "livingroom" ? "livingRoom" : room;
    const savedData = JSON.parse(localStorage.getItem("appliancesData")) || {};

    if (!savedData[formattedRoom]) {
        savedData[formattedRoom] = [];
    }

    const exists = savedData[formattedRoom].some(appliance => appliance.name.toLowerCase() === applianceName.toLowerCase());
    if (exists) {
        showPopup("Appliance already exists in this room!");
        return;
    }

    savedData[formattedRoom].push({ name: applianceName, icon: applianceIcon });

    localStorage.setItem("appliancesData", JSON.stringify(savedData));

    const controls = document.getElementById("roomControls");
    controls.appendChild(createApplianceButton(formattedRoom, applianceName, applianceIcon));

    const removeSelect = document.getElementById("removeApplianceSelect");
    const option = document.createElement("option");
    option.value = applianceName;
    option.textContent = applianceName;
    removeSelect.appendChild(option);

    document.getElementById("applianceName").value = "";
}

// 🔹 Remove appliance with UI update
function removeAppliance() {
    const room = document.getElementById("roomTitle").innerText.split(" ")[0].toLowerCase();
    const selectedAppliance = document.getElementById("removeApplianceSelect").value;

    if (!selectedAppliance) return showPopup("No appliance selected!");

    const formattedRoom = room === "living" || room === "livingroom" ? "livingRoom" : room;
    const savedData = JSON.parse(localStorage.getItem("appliancesData")) || {};

    if (!savedData[formattedRoom]) return;

    savedData[formattedRoom] = savedData[formattedRoom].filter(appliance => appliance.name !== selectedAppliance);

    localStorage.setItem("appliancesData", JSON.stringify(savedData));

    showRoom(formattedRoom);
}

function logHistoryEntry(applianceName, status) {
    const historyData = JSON.parse(localStorage.getItem("historyLog")) || [];
    const timestamp = new Date().toLocaleString(); // Get real-time timestamp

    historyData.push({ appliance: applianceName, status: status, time: timestamp });

    // Keep log size manageable (last 50 entries)
    if (historyData.length > 50) historyData.shift();

    localStorage.setItem("historyLog", JSON.stringify(historyData));
}

function showHistoryLog() {
    const historyData = JSON.parse(localStorage.getItem("historyLog")) || [];

    if (historyData.length === 0) {
        showPopup("No history logs available.");
        return;
    }

    let historyHtml = "<b>Appliance History Log:</b><br><ul>";
    historyData.forEach(entry => {
        historyHtml += `<li>${entry.appliance} was turned <b>${entry.status}</b> at ${entry.time}</li>`;
    });
    historyHtml += "</ul>";

    // Show pop-up with message only
    showPopup(historyHtml);

    // Add "Clear History" button inside the popup dynamically
    const buttonContainer = document.getElementById("popupButtons");

    const clearButton = document.createElement("button");
    clearButton.innerText = "Clear History";
    clearButton.onclick = clearHistoryLog;

    buttonContainer.appendChild(clearButton); // ✅ Adds "Clear History" button
}


function clearHistoryLog() {
    localStorage.removeItem("historyLog");
    showPopup("History log has been cleared.");
}
