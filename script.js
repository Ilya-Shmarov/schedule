(function () {
  const TYPE_COLOR = {
    "Лекция": "var(--lecture)",
    "Семинар": "var(--seminar)",
    "Лабораторная": "var(--lab)",
  };

  const WEEKS_LABEL = {
    every: "Каждую неделю",
    alt: "Через неделю",
  };

  const dayTabsEl = document.getElementById("dayTabs");
  const dayIndicator = document.getElementById("dayIndicator");
  const timelineEl = document.getElementById("timeline");
  const activeDayTitle = document.getElementById("activeDayTitle");
  const todayPill = document.getElementById("todayPill");
  const searchInput = document.getElementById("searchInput");
  const subgroupToggle = document.getElementById("subgroupToggle");
  const emptyState = document.getElementById("emptyState");
  const groupNameEl = document.getElementById("groupName");

  groupNameEl.textContent = GROUP_NAME;

  // JS: Sunday=0 ... Saturday=6. Our DAYS: Mon=0 ... Sat=5.
  const jsDayToOurDay = (jsDay) => (jsDay === 0 ? null : jsDay - 1);
  const todayIndex = jsDayToOurDay(new Date().getDay());

  let activeDay = todayIndex !== null ? todayIndex : 0;
  let activeSubgroup = "all";
  let searchQuery = "";

  function buildDayTabs() {
    DAYS.forEach((day, i) => {
      const count = SCHEDULE.filter((l) => l.day === i).length;
      const btn = document.createElement("button");
      btn.className = "day-tab";
      btn.type = "button";
      btn.dataset.day = i;
      btn.setAttribute("role", "tab");
      btn.innerHTML = `${day.slice(0, 3)}<span class="count">${count}</span>`;
      btn.addEventListener("click", () => {
        activeDay = i;
        render();
      });
      dayTabsEl.appendChild(btn);
    });
  }

  function moveIndicator() {
    const activeBtn = dayTabsEl.querySelector(`.day-tab[data-day="${activeDay}"]`);
    if (!activeBtn) return;
    dayIndicator.style.width = activeBtn.offsetWidth + "px";
    dayIndicator.style.transform = `translateX(${activeBtn.offsetLeft - 6}px)`;
  }

  function updateTabStates() {
    dayTabsEl.querySelectorAll(".day-tab").forEach((btn) => {
      btn.classList.toggle("active", Number(btn.dataset.day) === activeDay);
    });
  }

  function currentSlotInfo() {
    const now = new Date();
    if (todayIndex === null || activeDay !== todayIndex) return { nowSlot: -1 };
    const mins = now.getHours() * 60 + now.getMinutes();
    const slotRanges = [
      [510, 605], [615, 710], [740, 835], [845, 940],
      [950, 1045], [1080, 1170], [1180, 1270], [1280, 1370],
    ];
    let nowSlot = -1;
    slotRanges.forEach(([start, end], i) => {
      if (mins >= start && mins <= end) nowSlot = i;
    });
    return { nowSlot };
  }

  function lessonMatches(lesson) {
    if (activeSubgroup !== "all" && lesson.subgroup && lesson.subgroup !== activeSubgroup) {
      return false;
    }
    if (!searchQuery) return true;
    const haystack = `${lesson.subject} ${lesson.teacher} ${lesson.room} ${lesson.type}`.toLowerCase();
    return haystack.includes(searchQuery);
  }

  function renderCard(lesson) {
    const color = TYPE_COLOR[lesson.type] || "var(--accent)";
    const card = document.createElement("div");
    card.className = "lesson-card";
    card.style.setProperty("--type-color", color);

    const subgroupBadge = lesson.subgroup
      ? `<span class="badge subgroup">Подгр. ${lesson.subgroup}</span>`
      : "";

    card.innerHTML = `
      <div class="card-top">
        <div class="card-subject">${lesson.subject}</div>
        <div class="badges">
          ${subgroupBadge}
          <span class="badge">${lesson.type}</span>
        </div>
      </div>
      <div class="card-meta">
        <span>👤 ${lesson.teacher}</span>
        <span>🚪 ${lesson.room}</span>
        <span>🔁 ${WEEKS_LABEL[lesson.weeks]}</span>
      </div>
      <div class="card-dates">📅 ${lesson.dates}</div>
    `;
    return card;
  }

  function render() {
    updateTabStates();
    moveIndicator();
    activeDayTitle.textContent = DAYS[activeDay];
    todayPill.hidden = activeDay !== todayIndex;

    timelineEl.innerHTML = "";
    const { nowSlot } = currentSlotInfo();

    const lessonsForDay = SCHEDULE.filter((l) => l.day === activeDay).filter(lessonMatches);

    if (lessonsForDay.length === 0) {
      const allForDayIgnoringFilter = SCHEDULE.filter((l) => l.day === activeDay);
      emptyState.hidden = allForDayIgnoringFilter.length !== 0;
      if (allForDayIgnoringFilter.length === 0) {
        const free = document.createElement("div");
        free.className = "day-free";
        free.textContent = "В этот день пар нет 🎉";
        timelineEl.appendChild(free);
      }
      return;
    }
    emptyState.hidden = true;

    const bySlot = {};
    lessonsForDay.forEach((l) => {
      (bySlot[l.slot] = bySlot[l.slot] || []).push(l);
    });

    Object.keys(bySlot)
      .map(Number)
      .sort((a, b) => a - b)
      .forEach((slot, idx) => {
        const row = document.createElement("div");
        row.className = "slot-row" + (slot === nowSlot ? " is-now" : "");
        row.style.animationDelay = `${idx * 0.05}s`;

        const [start, end] = TIMES[slot].split(" – ");
        row.innerHTML = `
          <div class="slot-time">
            <span>${start}</span>
            <span>${end}</span>
          </div>
        `;

        const cardsWrap = document.createElement("div");
        cardsWrap.className = "slot-cards";
        bySlot[slot].forEach((lesson) => cardsWrap.appendChild(renderCard(lesson)));
        row.appendChild(cardsWrap);

        timelineEl.appendChild(row);
      });
  }

  function tickClock() {
    const now = new Date();
    document.getElementById("clockTime").textContent = now.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
    document.getElementById("clockDate").textContent = now.toLocaleDateString("ru-RU", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    render();
  }

  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    render();
  });

  subgroupToggle.querySelectorAll(".sg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      subgroupToggle.querySelectorAll(".sg-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeSubgroup = btn.dataset.sg;
      render();
    });
  });

  window.addEventListener("resize", moveIndicator);

  buildDayTabs();
  render();
  tickClock();
  setInterval(tickClock, 30000);
})();
