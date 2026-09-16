(function () {
  const TYPE_COLOR = {
    "Лекция": "var(--lecture)",
    "Семинар": "var(--seminar)",
    "Лабораторная": "var(--lab)",
  };

  const WEEKDAY_SHORT = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  const WEEKDAY_FULL = [
    "Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота",
  ];
  const MONTH_FULL = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
  ];

  const dateStripEl = document.getElementById("dateStrip");
  const weekIndicator = document.getElementById("weekIndicator");
  const prevDayBtn = document.getElementById("prevDay");
  const nextDayBtn = document.getElementById("nextDay");
  const todayBtn = document.getElementById("todayBtn");
  const datePicker = document.getElementById("datePicker");
  const timelineEl = document.getElementById("timeline");
  const activeDayTitle = document.getElementById("activeDayTitle");
  const todayPill = document.getElementById("todayPill");
  const searchInput = document.getElementById("searchInput");
  const subgroupToggle = document.getElementById("subgroupToggle");
  const emptyState = document.getElementById("emptyState");
  const groupNameEl = document.getElementById("groupName");

  groupNameEl.textContent = GROUP_NAME;

  function toISO(dt) {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function fromISO(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function addDays(iso, n) {
    const dt = fromISO(iso);
    dt.setDate(dt.getDate() + n);
    return toISO(dt);
  }

  const todayISO = toISO(new Date());

  const lessonDates = LESSONS.map((l) => l.date);
  const minDate = lessonDates.reduce((a, b) => (a < b ? a : b));
  const maxDate = lessonDates.reduce((a, b) => (a > b ? a : b));

  const lessonsByDate = {};
  LESSONS.forEach((l) => {
    (lessonsByDate[l.date] = lessonsByDate[l.date] || []).push(l);
  });

  function clamp(iso) {
    if (iso < minDate) return minDate;
    if (iso > maxDate) return maxDate;
    return iso;
  }

  let selectedDate = clamp(todayISO);
  let activeSubgroup = "all";
  let searchQuery = "";

  datePicker.min = minDate;
  datePicker.max = maxDate;

  // Считаем порядковый номер каждого занятия в его серии (например,
  // "Лекция 5 из 12"), группируя по предмету + типу + подгруппе + преподавателю.
  (function computeSeriesCounters() {
    const groups = {};
    LESSONS.forEach((l) => {
      const key = `${l.subject}|${l.type}|${l.subgroup || ""}|${l.teacher}`;
      (groups[key] = groups[key] || []).push(l);
    });
    Object.values(groups).forEach((group) => {
      group.sort((a, b) => (a.date === b.date ? a.slot - b.slot : a.date < b.date ? -1 : 1));
      group.forEach((l, i) => {
        l.seriesIndex = i + 1;
        l.seriesTotal = group.length;
      });
    });
  })();

  function mondayOf(iso) {
    const dt = fromISO(iso);
    const day = dt.getDay(); // 0=Вс .. 6=Сб
    const offset = day === 0 ? -6 : 1 - day;
    return addDays(iso, offset);
  }

  // Статичная строка Пн–Сб: сами колонки не "едут" при навигации,
  // меняется только неделя целиком (при переходе в другую неделю) —
  // единственный динамичный элемент — скользящий индикатор выбранного дня.
  function buildWeekRow() {
    dateStripEl.querySelectorAll(".date-chip").forEach((el) => el.remove());
    const monday = mondayOf(selectedDate);

    for (let i = 0; i < 6; i++) {
      const iso = addDays(monday, i);
      const dt = fromISO(iso);
      const hasLessons = Boolean(lessonsByDate[iso]);

      const btn = document.createElement("button");
      btn.className = "date-chip";
      btn.type = "button";
      btn.dataset.date = iso;
      btn.setAttribute("role", "tab");
      if (iso === selectedDate) btn.classList.add("active");
      if (iso === todayISO) btn.classList.add("is-today");
      if (iso < minDate || iso > maxDate) btn.classList.add("out-of-range");

      btn.innerHTML = `
        <span class="chip-weekday">${WEEKDAY_SHORT[dt.getDay()]}</span>
        <span class="chip-day">${dt.getDate()}</span>
        <span class="chip-dot" ${hasLessons ? "" : "hidden"}></span>
      `;
      btn.addEventListener("click", () => {
        selectedDate = iso;
        render();
      });
      dateStripEl.appendChild(btn);
    }

    moveWeekIndicator();
  }

  function moveWeekIndicator() {
    const activeBtn = dateStripEl.querySelector(".date-chip.active");
    if (!activeBtn) {
      weekIndicator.style.opacity = "0";
      return;
    }
    weekIndicator.style.opacity = "1";
    weekIndicator.style.width = activeBtn.offsetWidth + "px";
    weekIndicator.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
  }

  function currentSlotInfo() {
    if (selectedDate !== todayISO) return { nowSlot: -1 };
    const now = new Date();
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
        <span class="counter">📊 ${lesson.seriesIndex} из ${lesson.seriesTotal}</span>
      </div>
    `;
    return card;
  }

  function render() {
    buildWeekRow();
    datePicker.value = selectedDate;

    const dt = fromISO(selectedDate);
    activeDayTitle.textContent = `${WEEKDAY_FULL[dt.getDay()]}, ${dt.getDate()} ${MONTH_FULL[dt.getMonth()]}`;
    todayPill.hidden = selectedDate !== todayISO;

    timelineEl.innerHTML = "";
    const { nowSlot } = currentSlotInfo();

    const allForDate = lessonsByDate[selectedDate] || [];
    const lessonsForDate = allForDate.filter(lessonMatches);

    if (lessonsForDate.length === 0) {
      emptyState.hidden = allForDate.length === 0;
      if (allForDate.length === 0) {
        const free = document.createElement("div");
        free.className = "day-free";
        free.textContent = "В этот день пар нет 🎉";
        timelineEl.appendChild(free);
      }
      return;
    }
    emptyState.hidden = true;

    const bySlot = {};
    lessonsForDate.forEach((l) => {
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

  prevDayBtn.addEventListener("click", () => {
    selectedDate = addDays(selectedDate, -1);
    render();
  });

  nextDayBtn.addEventListener("click", () => {
    selectedDate = addDays(selectedDate, 1);
    render();
  });

  todayBtn.addEventListener("click", () => {
    selectedDate = clamp(todayISO);
    render();
  });

  datePicker.addEventListener("change", (e) => {
    if (e.target.value) {
      selectedDate = clamp(e.target.value);
      render();
    }
  });

  window.addEventListener("resize", moveWeekIndicator);

  render();
  tickClock();
  setInterval(tickClock, 30000);
})();
