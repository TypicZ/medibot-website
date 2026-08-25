// ================================
// MEDIBOT RESEARCH DASHBOARD
// Demo / Simulation Interface
// ================================

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const state = {
  schedules: [
    {
      time: "10:30",
      medicine: "Liquid A",
      dose: "5.0",
      unit: "mL",
      type: "Liquid",
      status: "Pending"
    },
    {
      time: "14:00",
      medicine: "Pill A",
      dose: "1",
      unit: "tablet",
      type: "Pill",
      status: "Pending"
    },
    {
      time: "18:00",
      medicine: "Liquid B",
      dose: "15.0",
      unit: "mL",
      type: "Liquid",
      status: "Pending"
    }
  ],

  history: [
    {
      time: "09:00",
      medicine: "Pill A",
      target: "1 tablet",
      actual: "1 tablet",
      status: "Collected",
      error: "0"
    },
    {
      time: "08:30",
      medicine: "Liquid A",
      target: "5.0 mL",
      actual: "5.1 mL",
      status: "Collected",
      error: "+0.1 mL"
    }
  ],

  currentType: "Liquid",
  demoIndex: 0
};


// ================================
// TOAST
// ================================

function showToast(message) {

  const toast = $("#toast");

  if (!toast) return;

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}


// ================================
// PAGE NAVIGATION
// ================================

function setPage(pageId) {

  $$(".page").forEach(page => {

    page.classList.toggle(
      "active-page",
      page.id === pageId
    );

  });


  $$(".nav-item").forEach(item => {

    item.classList.toggle(
      "active",
      item.dataset.page === pageId
    );

  });


  const titles = {

    dashboard:
      "Good evening, Caregiver.",

    patient:
      "Test Patient Profile",

    schedule:
      "Add Medicine Schedule",

    history:
      "Dose History",

    results:
      "Research Test Results"

  };


  const title = $("#pageTitle");

  if (title) {

    title.textContent =
      titles[pageId] ||
      "MEDIBOT Dashboard";

  }

}


// ================================
// RENDER TODAY'S SCHEDULE
// ================================

function renderSchedule() {

  const container =
    $("#todaySchedule");

  if (!container) return;

  container.innerHTML = "";


  if (state.schedules.length === 0) {

    container.innerHTML =
      `<p class="muted">
        No schedules configured.
      </p>`;

    return;

  }


  state.schedules
    .slice()
    .sort((a, b) =>
      a.time.localeCompare(b.time)
    )
    .forEach(item => {

      const row =
        document.createElement("div");

      row.className =
        "timeline-row";


      const statusClass =
        item.status
          .toLowerCase()
          .includes("collected")
          ? "collected"
          : "pending";


      row.innerHTML = `

        <div class="timeline-time">
          ${escapeHtml(
            formatTime(item.time)
          )}
        </div>

        <div class="timeline-name">

          <strong>
            ${escapeHtml(
              item.medicine
            )}
          </strong>

          <small>
            ${escapeHtml(item.dose)}
            ${escapeHtml(item.unit)}
            •
            ${escapeHtml(item.type)}
          </small>

        </div>

        <div
          class="timeline-status ${statusClass}"
        >
          ${escapeHtml(item.status)}
        </div>

      `;


      container.appendChild(row);

    });


  updateNextDose();

}


// ================================
// UPDATE NEXT DOSE
// ================================

function updateNextDose() {

  const next =
    state.schedules
      .slice()
      .sort((a, b) =>
        a.time.localeCompare(b.time)
      )[0];


  if (!next) return;


  const medicine =
    $("#nextMedicine");

  const dose =
    $("#nextDose");

  const time =
    $("#nextTime");

  const unit =
    document.querySelector(
      ".dose-value span"
    );


  if (medicine)
    medicine.textContent =
      next.medicine;


  if (dose)
    dose.textContent =
      next.dose;


  if (time) {

    time.textContent =
      formatTime(next.time)
        .replace(
          /\s(AM|PM)$/,
          ""
        );

  }


  if (unit)
    unit.textContent =
      next.unit;

}


// ================================
// RENDER HISTORY
// ================================

function renderHistory() {

  const body =
    $("#historyBody");

  if (!body) return;

  body.innerHTML = "";


  state.history.forEach(
    (event, index) => {

      const row =
        document.createElement("tr");


      row.innerHTML = `

        <td>
          ${escapeHtml(event.time)}
        </td>

        <td>
          <strong>
            ${escapeHtml(
              event.medicine
            )}
          </strong>
        </td>

        <td>
          ${escapeHtml(event.target)}
        </td>

        <td>
          ${escapeHtml(event.actual)}
        </td>

        <td>
          ${escapeHtml(event.status)}
        </td>

        <td>
          ${escapeHtml(event.error)}
        </td>

      `;


      row.style.cursor =
        "pointer";


      row.addEventListener(
        "click",
        () => showEventDetail(index)
      );


      body.appendChild(row);

    }
  );

}


// ================================
// EVENT DETAILS
// ================================

function showEventDetail(index) {

  const event =
    state.history[index];

  const detail =
    $("#eventDetail");


  if (!event || !detail)
    return;


  detail.classList.remove(
    "hidden"
  );


  detail.innerHTML = `

    <h3>
      Event Details
    </h3>

    <div class="event-grid">

      <div>
        <small>Time</small>
        <strong>
          ${escapeHtml(event.time)}
        </strong>
      </div>

      <div>
        <small>Medicine</small>
        <strong>
          ${escapeHtml(event.medicine)}
        </strong>
      </div>

      <div>
        <small>Target</small>
        <strong>
          ${escapeHtml(event.target)}
        </strong>
      </div>

      <div>
        <small>Actual</small>
        <strong>
          ${escapeHtml(event.actual)}
        </strong>
      </div>

    </div>

  `;

}


// ================================
// LIQUID / PILL SWITCH
// ================================

function setType(type) {

  state.currentType =
    type;


  $$(".type-btn")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.type === type
      );

    });


  const channelField =
    $("#channelField");

  const compartmentField =
    $("#compartmentField");

  const unit =
    $("#unit");

  const dose =
    $("#formDose");


  if (type === "Liquid") {

    if (channelField)
      channelField.classList.remove(
        "hidden"
      );


    if (compartmentField)
      compartmentField.classList.add(
        "hidden"
      );


    if (unit)
      unit.textContent =
        "mL";


    if (dose) {

      dose.step = "0.1";

      dose.value = "5.0";

    }

  }

  else {

    if (channelField)
      channelField.classList.add(
        "hidden"
      );


    if (compartmentField)
      compartmentField.classList.remove(
        "hidden"
      );


    if (unit)
      unit.textContent =
        "tablet";


    if (dose) {

      dose.step = "1";

      dose.value = "1";

    }

  }

}


// ================================
// SAVE SCHEDULE
// ================================

function saveSchedule() {

  const medicine =
    $("#formMedicine")
      ?.value.trim() ||
    "Test Medicine";


  const dose =
    $("#formDose")
      ?.value ||
    "0";


  const date =
    $("#formDate")
      ?.value ||
    "";


  const time =
    $("#formTime")
      ?.value ||
    "10:30";


  const unit =
    state.currentType === "Liquid"
      ? "mL"
      : "tablet";


  state.schedules.push({

    time: time,

    medicine: medicine,

    dose: dose,

    unit: unit,

    type: state.currentType,

    status: "Pending",

    date: date

  });


  renderSchedule();


  showToast(
    "Schedule saved successfully."
  );


  setPage("dashboard");

}


// ================================
// CLEAR FORM
// ================================

function clearForm() {

  const medicine =
    $("#formMedicine");

  const dose =
    $("#formDose");

  const date =
    $("#formDate");

  const time =
    $("#formTime");


  if (medicine) {

    medicine.value =
      state.currentType === "Liquid"
        ? "Liquid A"
        : "Pill A";

  }


  if (dose) {

    dose.value =
      state.currentType === "Liquid"
        ? "5.0"
        : "1";

  }


  if (date)
    date.value = "";


  if (time)
    time.value =
      "10:30";


  showToast(
    "Form cleared."
  );

}


// ================================
// SAVE PATIENT
// ================================

function savePatient() {

  showToast(
    "Test patient profile saved."
  );

}


// ================================
// RUN DEMO EVENT
// ================================

function runDemoEvent() {

  if (
    state.schedules.length === 0
  ) {

    showToast(
      "No schedule available for demo."
    );

    return;

  }


  const index =
    state.demoIndex %
    state.schedules.length;


  const item =
    state.schedules[index];


  item.status =
    "Collected";


  state.history.unshift({

    time: item.time,

    medicine: item.medicine,

    target:
      `${item.dose} ${item.unit}`,

    actual:
      `${item.dose} ${item.unit}`,

    status:
      "Collected",

    error:
      "0"

  });


  state.demoIndex++;


  renderSchedule();

  renderHistory();


  const status =
    $("#nextStatus");


  if (status) {

    status.className =
      "status-pill ready";

    status.textContent =
      "● READY";

  }


  showToast(
    `Demo event completed: ${item.medicine}`
  );

}


// ================================
// EXPORT CSV
// ================================

function exportCSV() {

  const headers = [

    "Time",
    "Medicine",
    "Target",
    "Actual",
    "Status",
    "Error"

  ];


  const rows =
    state.history.map(item => [

      item.time,

      item.medicine,

      item.target,

      item.actual,

      item.status,

      item.error

    ]);


  const csv = [

    headers,

    ...rows

  ]

    .map(row =>
      row
        .map(csvEscape)
        .join(",")
    )

    .join("\n");


  const blob =
    new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;"
      }
    );


  const url =
    URL.createObjectURL(blob);


  const link =
    document.createElement("a");


  link.href = url;

  link.download =
    "medibot_test_data.csv";


  document.body.appendChild(
    link
  );


  link.click();

  link.remove();


  URL.revokeObjectURL(url);


  showToast(
    "CSV test data exported."
  );

}


// ================================
// CSV ESCAPE
// ================================

function csvEscape(value) {

  const text =
    String(value ?? "");


  return `"${text.replace(
    /"/g,
    '""'
  )}"`;

}


// ================================
// TIME FORMAT
// ================================

function formatTime(time) {

  const [
    hourString,
    minute
  ] =
    String(time).split(":");


  let hour =
    Number(hourString);


  if (
    !Number.isFinite(hour)
  )
    return time;


  const suffix =
    hour >= 12
      ? "PM"
      : "AM";


  hour =
    hour % 12 || 12;


  return `${hour}:${
    minute || "00"
  } ${suffix}`;

}


// ================================
// SECURITY / HTML ESCAPE
// ================================

function escapeHtml(value) {

  return String(
    value ?? ""
  )

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


// ================================
// INITIALIZE
// ================================

function initialize() {


  // LOGIN

  $("#loginForm")
    ?.addEventListener(
      "submit",
      event => {

        event.preventDefault();


        const username =
          $("#username")
            ?.value.trim();


        const password =
          $("#password")
            ?.value;


        if (
          !username ||
          !password
        ) {

          showToast(
            "Enter the username and password."
          );

          return;

        }


        $("#loginScreen")
          ?.classList.add(
            "hidden"
          );


        $("#app")
          ?.classList.remove(
            "hidden"
          );


        showToast(
          "Welcome to MEDIBOT."
        );

      }
    );


  // LOGOUT

  $("#logoutBtn")
    ?.addEventListener(
      "click",
      () => {

        $("#app")
          ?.classList.add(
            "hidden"
          );


        $("#loginScreen")
          ?.classList.remove(
            "hidden"
          );


        showToast(
          "Logged out."
        );

      }
    );


  // SIDEBAR NAVIGATION

  $$(".nav-item")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          setPage(
            button.dataset.page
          );

        }
      );

    });


  // PAGE LINK BUTTONS

  $$("[data-page-link]")
    .forEach(element => {

      element.addEventListener(
        "click",
        () => {

          setPage(
            element.dataset.pageLink
          );

        }
      );

    });


  // LIQUID / PILL BUTTONS

  $$(".type-btn")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          setType(
            button.dataset.type
          );

        }
      );

    });


  // SAVE SCHEDULE

  $("#saveSchedule")
    ?.addEventListener(
      "click",
      saveSchedule
    );


  // CLEAR FORM

  $("#clearForm")
    ?.addEventListener(
      "click",
      clearForm
    );


  // SAVE PATIENT

  $("#savePatient")
    ?.addEventListener(
      "click",
      savePatient
    );


  // DEMO EVENT

  $("#demoAdvance")
    ?.addEventListener(
      "click",
      runDemoEvent
    );


  // EXPORT BUTTONS

  $("#exportBtn")
    ?.addEventListener(
      "click",
      exportCSV
    );


  $("#exportBtn2")
    ?.addEventListener(
      "click",
      exportCSV
    );


  // INITIAL RENDER

  renderSchedule();

  renderHistory();

  setType("Liquid");

}


// ================================
// START APP
// ================================

document.addEventListener(
  "DOMContentLoaded",
  initialize
);
