function escapeHtmlText(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

// ---------------------------------------------------------
// 1. SIDEBAR MENU SWITCHING & SLIDING PILL ANIMATION
// ---------------------------------------------------------
const menuTitles = {
  dashboard: 'Dashboard',
  schedule: 'Schedule',
  yoga: 'Yoga Studio',
  meals: 'Meal & Nutrition',
  chat: 'Trainer Chat',
  profile: 'User Profile'
};

function switchMenu(menuKey, index) {
  // 1. Move the white active indicator pill smoothly along the left sidebar
  const indicator = document.getElementById('nav-indicator');
  // Each button has height 46px + margin-bottom 12px = 58px vertical step
  const stepY = index * 58;
  if (indicator) {
    indicator.style.transform = `translateY(${stepY}px)`;
  }

  // 2. Update active button text/icon state
  document.querySelectorAll('.nav-btn').forEach(btn => {
    const active = btn.dataset.menu === menuKey;
    btn.classList.toggle('active', active);
    if (active) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  });

  // 3. Update Header Title & Badge
  const titleEl = document.getElementById('main-header-title');
  const badgeEl = document.getElementById('menu-badge-pill');
  if (titleEl) titleEl.textContent = menuTitles[menuKey] || 'Dashboard';
  if (badgeEl) {
    if (menuKey === 'dashboard') {
      badgeEl.classList.add('hidden');
    } else {
      badgeEl.classList.remove('hidden');
      badgeEl.textContent = 'Scrollable Submenu';
    }
  }

  // Clear unread badge when opening Chat
  if (menuKey === 'chat') {
    const unreadPill = document.getElementById('chat-unread-pill');
    if (unreadPill) unreadPill.classList.add('hidden');
  }

  // 4. Switch active section inside the fixed-height center viewport & scroll to top
  const viewport = document.getElementById('center-viewport');
  if (viewport) viewport.scrollTop = 0;
  window.scrollTo(0, 0);

  document.querySelectorAll('.menu-section').forEach(sec => {
    sec.classList.remove('active-section');
  });

  const targetSection = document.getElementById(`section-${menuKey}`);
  if (targetSection) {
    // Trigger reflow so staggered animations replay cleanly every time
    void targetSection.offsetWidth;
    targetSection.classList.add('active-section');
  }

  // Re-animate dashboard bars if returning to dashboard
  if (menuKey === 'dashboard') {
    const periodSelect = document.getElementById('activity-period-select');
    updateYogaActivityBars(periodSelect ? periodSelect.value : 'last_week');
  }
}

// ---------------------------------------------------------
// 2. DASHBOARD: YOGA ACTIVITY BARS (EXACT REFERENCE PROPORTIONS)
// ---------------------------------------------------------
const yogaActivityData = {
  last_week: [
    { day: 'Mon', yoga: 44, rest: 28, restBottom: 52, hrs: '1.8h Yoga • 1.1h Rest' },
    { day: 'Tue', yoga: 55, rest: 25, restBottom: 63, hrs: '2.2h Yoga • 1.0h Rest' },
    { day: 'Wed', yoga: 25, rest: 36, restBottom: 33, hrs: '1.0h Yoga • 1.5h Rest' },
    { day: 'Thu', yoga: 40, rest: 28, restBottom: 48, hrs: '1.6h Yoga • 1.1h Rest' },
    { day: 'Fri', yoga: 29, rest: 35, restBottom: 37, hrs: '1.2h Yoga • 1.4h Rest' },
    { day: 'Sat', yoga: 62, rest: 17, restBottom: 70, hrs: '2.5h Yoga • 0.7h Rest' },
    { day: 'Sun', yoga: 25, rest: 22, restBottom: 33, hrs: '1.0h Yoga • 0.9h Rest' }
  ],
  this_week: [
    { day: 'Mon', yoga: 58, rest: 22, restBottom: 65, hrs: '2.3h Yoga • 0.9h Rest' },
    { day: 'Tue', yoga: 42, rest: 30, restBottom: 50, hrs: '1.7h Yoga • 1.2h Rest' },
    { day: 'Wed', yoga: 64, rest: 18, restBottom: 71, hrs: '2.6h Yoga • 0.8h Rest' },
    { day: 'Thu', yoga: 34, rest: 32, restBottom: 42, hrs: '1.4h Yoga • 1.3h Rest' },
    { day: 'Fri', yoga: 50, rest: 24, restBottom: 58, hrs: '2.0h Yoga • 1.0h Rest' },
    { day: 'Sat', yoga: 70, rest: 16, restBottom: 77, hrs: '2.8h Yoga • 0.6h Rest' },
    { day: 'Sun', yoga: 38, rest: 25, restBottom: 46, hrs: '1.5h Yoga • 1.0h Rest' }
  ],
  last_month: [
    { day: 'Mon', yoga: 36, rest: 32, restBottom: 44, hrs: '1.5h Yoga • 1.3h Rest' },
    { day: 'Tue', yoga: 48, rest: 28, restBottom: 56, hrs: '1.9h Yoga • 1.1h Rest' },
    { day: 'Wed', yoga: 39, rest: 30, restBottom: 47, hrs: '1.6h Yoga • 1.2h Rest' },
    { day: 'Thu', yoga: 56, rest: 24, restBottom: 64, hrs: '2.2h Yoga • 1.0h Rest' },
    { day: 'Fri', yoga: 44, rest: 26, restBottom: 52, hrs: '1.8h Yoga • 1.0h Rest' },
    { day: 'Sat', yoga: 52, rest: 22, restBottom: 60, hrs: '2.1h Yoga • 0.9h Rest' },
    { day: 'Sun', yoga: 30, rest: 28, restBottom: 38, hrs: '1.2h Yoga • 1.1h Rest' }
  ]
};

function updateYogaActivityBars(periodKey) {
  const container = document.getElementById('yoga-bars-container');
  if (!container) return;
  const data = yogaActivityData[periodKey] || yogaActivityData.last_week;

  container.innerHTML = data.map((item, idx) => `
    <div class="activity-col flex flex-col items-center group relative cursor-pointer" onclick="showToast('${item.day}: ${item.hrs}')">
      <span class="text-[11.5px] text-slate-400 font-normal mb-3 group-hover:text-brand-navy transition">${item.day}</span>

      <!-- Vertical Pill Track (Daily Goal = Light Grey) -->
      <div class="relative w-[6px] h-[142px] bg-[#eaedf2] rounded-full flex flex-col justify-end">
        <!-- Rest Segment (Dark Navy Floating Pill) -->
        <div
          id="rest-bar-${idx}"
          class="bar-segment bar-segment-rest absolute left-0 w-full bg-brand-navy rounded-full"
          style="height: 0%; bottom: ${item.restBottom}%;"
        ></div>

        <!-- Yoga Segment (Emerald Green Bottom Pill) -->
        <div
          id="yoga-bar-${idx}"
          class="bar-segment bar-segment-yoga absolute left-0 bottom-0 w-full bg-brand-sidebar rounded-full"
          style="height: 0%;"
        ></div>
      </div>

      <!-- Hover Tooltip -->
      <div class="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -top-7 bg-brand-navy text-white text-[10px] py-1 px-2 rounded-lg whitespace-nowrap shadow-md z-30">
        ${item.hrs}
      </div>
    </div>
  `).join('');

  // Animate bars from 0 to target height
  requestAnimationFrame(() => {
    setTimeout(() => {
      data.forEach((item, idx) => {
        const yogaEl = document.getElementById(`yoga-bar-${idx}`);
        const restEl = document.getElementById(`rest-bar-${idx}`);
        if (yogaEl) yogaEl.style.height = `${item.yoga}%`;
        if (restEl) restEl.style.height = `${item.rest}%`;
      });
    }, 40);
  });
}

function highlightActivitySeries(series) {
  const labelMap = {
    yoga: 'Menampilkan fokus bar: Yoga (Hijau)',
    rest: 'Menampilkan fokus bar: Rest (Navy)',
    goal: 'Target Harian: 3.5 Jam Total Aktivitas & Istirahat'
  };
  showToast(labelMap[series]);
}

// ---------------------------------------------------------
// 3. DASHBOARD: MEAL STATISTIC WAVE CHART INTERACTION
// ---------------------------------------------------------
function selectMealCategory(category, kcal, cx, cy) {
  // Animate number counter
  animateNumber('meal-kcal-value', kcal);
  const dateVal = document.getElementById('meal-date-select')?.value || '15/11';
  const labelEl = document.getElementById('meal-active-label');
  if (labelEl) labelEl.textContent = `Selected: ${category} (${dateVal})`;

  // Move active dot & vertical guide line along the SVG curve
  const dotMain = document.getElementById('meal-dot-main');
  const dotPulse = document.getElementById('meal-dot-pulse');
  const guideLine = document.getElementById('meal-guide-line');
  if (dotMain && dotPulse && guideLine) {
    dotMain.setAttribute('cx', cx);
    dotMain.setAttribute('cy', cy);
    dotPulse.setAttribute('cx', cx);
    dotPulse.setAttribute('cy', cy);
    guideLine.setAttribute('x1', cx);
    guideLine.setAttribute('x2', cx);
    guideLine.setAttribute('y1', cy);
  }

  // Highlight selected category label
  document.querySelectorAll('.meal-cat-btn').forEach(btn => {
    btn.className = 'meal-cat-btn text-white/65 hover:text-white transition px-1.5 py-0.5 rounded';
  });
  const activeBtn = document.getElementById(`meal-tab-${category}`);
  if (activeBtn) {
    activeBtn.className = 'meal-cat-btn text-white font-semibold underline decoration-emerald-300 underline-offset-4 transition px-1.5 py-0.5 rounded';
  }
}

function updateMealDate(dateStr) {
  const presets = {
    '15/11': { cat: 'Food', kcal: 230, cx: 177, cy: 46 },
    '14/11': { cat: 'Salad', kcal: 185, cx: 38, cy: 38 },
    '13/11': { cat: 'Juice', kcal: 115, cx: 110, cy: 58 }
  };
  const p = presets[dateStr] || presets['15/11'];
  selectMealCategory(p.cat, p.kcal, p.cx, p.cy);
  showToast(`Statistik makanan diperbarui untuk tanggal ${dateStr}`);
}

function animateNumber(elementId, targetValue) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const startValue = parseInt(el.textContent.replace(/,/g, ''), 10) || 0;
  const duration = 420;
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const current = Math.round(startValue + (targetValue - startValue) * progress);
    el.textContent = current;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function pulseMetricCard(cardEl, type) {
  if (type === 'heart') {
    const bpmEl = document.getElementById('metric-bpm');
    const nextBpm = bpmEl.textContent === '75' ? 78 : 75;
    animateNumber('metric-bpm', nextBpm);
    showToast(`Heart Rate Sensor: ${nextBpm} BPM (+12% optimal zone)`);
  } else if (type === 'energy') {
    const kcalEl = document.getElementById('metric-kcal');
    const nextKcal = kcalEl.textContent === '120' ? 145 : 120;
    animateNumber('metric-kcal', nextKcal);
    showToast(`Energy Burn: ${nextKcal} kcal terbakar sesi pagi ini`);
  } else {
    showToast('Swimming Session: 01 hrs (1,200m Freestyle selesai)');
  }
}

// ---------------------------------------------------------
// 4. SUBMENU 2: SCHEDULE DATA & INTERACTIONS
// ---------------------------------------------------------
const scheduleDays = [
  { day: 'Mon', date: '11', count: 2 },
  { day: 'Tue', date: '12', count: 3 },
  { day: 'Wed', date: '13', count: 2 },
  { day: 'Thu', date: '14', count: 3 },
  { day: 'Fri', date: '15', count: 9, active: true },
  { day: 'Sat', date: '16', count: 4 },
  { day: 'Sun', date: '17', count: 2 }
];

let scheduleItems = [
  { id: 1, time: '06:30 AM', title: 'Morning Sun Salutation (Surya Namaskar)', category: 'Yoga', trainer: 'Janee Mortensen', duration: '45 mins', kcal: '160 kcal', room: 'Lotus Studio A', joined: true },
  { id: 2, time: '08:00 AM', title: 'Aqua Mobility & Lap Swimming', category: 'Swimming', trainer: 'Coach Marcus', duration: '60 mins', kcal: '320 kcal', room: 'Heated Indoor Pool', joined: true },
  { id: 3, time: '10:30 AM', title: 'Deep Hip Opener & Yin Stretching', category: 'Yoga', trainer: 'Janee Mortensen', duration: '50 mins', kcal: '140 kcal', room: 'Bamboo Hall', joined: false },
  { id: 4, time: '01:00 PM', title: 'Mindful Pranayama & Breathwork', category: 'Meditation', trainer: 'Ayu Pratiwi', duration: '30 mins', kcal: '65 kcal', room: 'Zen Garden', joined: true },
  { id: 5, time: '03:30 PM', title: 'Power Core & Balance Flow', category: 'Strength', trainer: 'Janee Mortensen', duration: '45 mins', kcal: '240 kcal', room: 'Lotus Studio A', joined: false },
  { id: 6, time: '05:00 PM', title: 'Hydro Recovery & Backstroke', category: 'Swimming', trainer: 'Coach Marcus', duration: '45 mins', kcal: '260 kcal', room: 'Heated Indoor Pool', joined: false },
  { id: 7, time: '06:30 PM', title: 'Sunset Vinyasa Flow', category: 'Yoga', trainer: 'Janee Mortensen', duration: '60 mins', kcal: '210 kcal', room: 'Rooftop Deck', joined: true },
  { id: 8, time: '08:00 PM', title: 'Restorative Sound Bath & Nidra', category: 'Meditation', trainer: 'Ayu Pratiwi', duration: '40 mins', kcal: '55 kcal', room: 'Zen Garden', joined: false },
  { id: 9, time: '09:00 PM', title: 'Pre-Sleep Spine Decompression', category: 'Yoga', trainer: 'Janee Mortensen', duration: '20 mins', kcal: '45 kcal', room: 'Home Guided', joined: true }
];

let currentScheduleFilter = 'All';

function renderScheduleDays() {
  const strip = document.getElementById('schedule-days-strip');
  if (!strip) return;
  strip.innerHTML = scheduleDays.map((d, i) => `
    <button
      onclick="selectScheduleDay(${i})"
      class="p-2.5 rounded-2xl max-[480px]:p-1 max-[480px]:rounded-lg text-center transition border ${
        d.active
          ? 'bg-brand-sidebar text-white border-brand-sidebar shadow-md scale-[1.03]'
          : 'bg-slate-50 hover:bg-emerald-50 text-brand-navy border-slate-100'
      }"
    >
      <div class="text-[11px] ${d.active ? 'text-emerald-100' : 'text-slate-400'}">${d.day}</div>
      <div class="text-[15px] font-bold mt-0.5">${d.date}</div>
      <div class="text-[9.5px] mt-1 ${d.active ? 'bg-white/20 text-white' : 'bg-emerald-100 text-brand-sidebar'} rounded-full px-1.5 py-0.2 inline-block max-[480px]:hidden">${d.count} sesi</div>
    </button>
  `).join('');
}

function selectScheduleDay(index) {
  scheduleDays.forEach((d, idx) => d.active = idx === index);
  renderScheduleDays();
  showToast(`Menampilkan jadwal untuk ${scheduleDays[index].day}, ${scheduleDays[index].date} Nov 2019`);
}

function renderScheduleTimeline() {
  const listEl = document.getElementById('schedule-timeline-list');
  if (!listEl) return;

  const filtered = currentScheduleFilter === 'All'
    ? scheduleItems
    : scheduleItems.filter(item => item.category === currentScheduleFilter);

  listEl.innerHTML = filtered.map(item => `
    <div class="hover-lift bg-white rounded-[18px] p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-start sm:items-center gap-4">
        <div class="px-3 py-2 rounded-xl bg-[#e7f7ee] text-brand-sidebar font-bold text-xs text-center min-w-[82px]">
          ${escapeHtmlText(item.time)}
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h4 class="text-[13.5px] font-bold text-brand-navy">${escapeHtmlText(item.title)}</h4>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">${item.category}</span>
          </div>
          <p class="text-[11.5px] text-slate-400 mt-0.5">
            Trainer: <strong class="text-brand-navy font-medium">${item.trainer}</strong> • ${item.duration} • ${item.kcal} • ${item.room}
          </p>
        </div>
      </div>

      <button
        onclick="toggleJoinSchedule(${item.id})"
        class="shrink-0 text-xs font-semibold px-4 py-2 rounded-xl transition ${
          item.joined
            ? 'bg-[#dff5e8] text-brand-darkGreen hover:bg-emerald-200'
            : 'bg-brand-navy text-white hover:opacity-90'
        }"
      >
        ${item.joined ? '✓ Terdaftar' : '+ Ikuti Kelas'}
      </button>
    </div>
  `).join('');
}

function filterScheduleList(category) {
  currentScheduleFilter = category;
  document.querySelectorAll('.sched-filter-btn').forEach(btn => {
    if (btn.dataset.cat === category) {
      btn.className = 'sched-filter-btn bg-brand-sidebar text-white text-xs font-medium px-4 py-1.5 rounded-full transition';
    } else {
      btn.className = 'sched-filter-btn bg-white text-slate-500 hover:text-brand-navy text-xs font-medium px-4 py-1.5 rounded-full transition';
    }
  });
  renderScheduleTimeline();
}

function toggleJoinSchedule(id) {
  const target = scheduleItems.find(i => i.id === id);
  if (target) {
    target.joined = !target.joined;
    renderScheduleTimeline();
    showToast(target.joined ? `Berhasil mendaftar ke "${target.title}"` : `Pendaftaran "${target.title}" dibatalkan`);
  }
}

function toggleScheduleForm() {
  const form = document.getElementById('new-schedule-form');
  if (form) form.classList.toggle('hidden');
}

function addNewScheduleItem() {
  const title = document.getElementById('sched-title-input')?.value.trim();
  const time = document.getElementById('sched-time-input')?.value.trim() || '04:30 PM';
  const cat = document.getElementById('sched-cat-input')?.value || 'Yoga';

  if (!title) {
    showToast('Mohon isi nama sesi jadwal terlebih dahulu');
    return;
  }

  scheduleItems.unshift({
    id: Date.now(),
    time,
    title,
    category: cat,
    trainer: 'Janee Mortensen',
    duration: '45 mins',
    kcal: '175 kcal',
    room: 'Main Studio',
    joined: true
  });

  document.getElementById('sched-title-input').value = '';
  document.getElementById('sched-time-input').value = '';
  toggleScheduleForm();
  renderScheduleTimeline();
  showToast(`Jadwal "${title}" berhasil ditambahkan!`);
}

// ---------------------------------------------------------
// 5. SUBMENU 3: YOGA POSES & LIVE BREATHING TIMER
// ---------------------------------------------------------
const yogaPoses = [
  { id: 1, name: 'Warrior II Side Reach (Utthita Parshvakonasana)', level: 'Beginner', mins: 15, kcal: 85, focus: 'Obliques, Hips & Stamina', desc: 'Pose ikonik dari banner utama untuk membuka pinggul dan meregangkan sisi tubuh secara menyeluruh.' },
  { id: 2, name: 'Tree Pose Balance (Vrksasana)', level: 'Beginner', mins: 10, kcal: 55, focus: 'Ankle Stability & Focus', desc: 'Melatih keseimbangan satu kaki dan menenangkan pikiran dengan fokus pernapasan dalam.' },
  { id: 3, name: 'Downward Facing Dog (Adho Mukha Svanasana)', level: 'Beginner', mins: 12, kcal: 70, focus: 'Hamstrings, Shoulders & Spine', desc: 'Meregangkan tulang belakang dan memperkuat bahu sekaligus melancarkan sirkulasi darah.' },
  { id: 4, name: 'Cobra Spine Extension (Bhujangasana)', level: 'Beginner', mins: 10, kcal: 60, focus: 'Lower Back & Chest Opener', desc: 'Membuka dada dan paru-paru serta mengurangi kekakuan punggung bawah akibat duduk lama.' },
  { id: 5, name: 'Half Moon Balance (Ardha Chandrasana)', level: 'Intermediate', mins: 15, kcal: 110, focus: 'Core, Glutes & Coordination', desc: 'Mengaktifkan otot inti dan keseimbangan lateral untuk stabilitas tubuh bagian bawah.' },
  { id: 6, name: 'Seated Forward Bend (Paschimottanasana)', level: 'Beginner', mins: 10, kcal: 50, focus: 'Calm Nervous System & Back', desc: 'Menenangkan sistem saraf dan memberikan peregangan lembut pada hamstring.' },
  { id: 7, name: 'Crow Arm Balance (Bakasana)', level: 'Advanced', mins: 15, kcal: 135, focus: 'Wrists, Arms & Deep Core', desc: 'Tantangan keseimbangan lengan yang meningkatkan kekuatan pergelangan tangan dan otot perut.' },
  { id: 8, name: 'Bridge Hip Lift (Setu Bandhasana)', level: 'Intermediate', mins: 12, kcal: 80, focus: 'Glutes, Thyroid & Spine', desc: 'Memperkuat punggung dan bokong sekaligus meredakan stres ringan.' },
  { id: 9, name: 'Pigeon Hip Release (Eka Pada Rajakapotasana)', level: 'Intermediate', mins: 15, kcal: 75, focus: 'Deep Hip Flexors & Sciatica', desc: 'Pose favorit untuk melepaskan ketegangan mendalam pada area panggul.' },
  { id: 10, name: 'King Dancer Pose (Natarajasana)', level: 'Advanced', mins: 18, kcal: 140, focus: 'Full-Body Flexibility & Poise', desc: 'Kombinasi anggun antara backbend dan keseimbangan satu kaki.' }
];

let currentYogaLevel = 'All';
let yogaTimerInterval = null;
let yogaRemainingSeconds = 15 * 60;
let isYogaTimerRunning = false;

function renderYogaPoses() {
  const grid = document.getElementById('yoga-poses-grid');
  if (!grid) return;

  const filtered = currentYogaLevel === 'All'
    ? yogaPoses
    : yogaPoses.filter(p => p.level === currentYogaLevel);

  grid.innerHTML = filtered.map((pose, idx) => `
    <div class="hover-lift bg-white rounded-[20px] p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-3">
          <span class="text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full ${
            pose.level === 'Beginner' ? 'bg-emerald-100 text-brand-darkGreen' :
            pose.level === 'Intermediate' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-brand-navy'
          }">${pose.level}</span>
          <span class="text-[11px] text-slate-400 font-medium">${pose.mins} mins • ${pose.kcal} kcal</span>
        </div>

        <div class="flex items-start gap-3.5">
          <!-- Mini Vector Pose Emblem -->
          <div class="w-12 h-12 rounded-2xl bg-[#e6f7ed] text-brand-sidebar flex items-center justify-center shrink-0 font-bold text-xs">
            #${idx + 1}
          </div>
          <div>
            <h4 class="text-[13.5px] font-bold text-brand-navy leading-snug">${pose.name}</h4>
            <p class="text-[11px] text-brand-sidebar font-medium mt-0.5">Target: ${pose.focus}</p>
          </div>
        </div>

        <p class="text-[11.5px] text-slate-500 mt-3 leading-relaxed">${pose.desc}</p>
      </div>

      <div class="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
        <span class="text-[11px] text-slate-400">Guided Audio Ready</span>
        <button
          onclick="startQuickWorkout('${pose.name}', ${pose.mins})"
          class="bg-brand-sidebar hover:bg-brand-darkGreen text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm"
        >
          Latih Pose Ini
        </button>
      </div>
    </div>
  `).join('');
}

function filterYogaPoses(level) {
  currentYogaLevel = level;
  document.querySelectorAll('.yoga-filter-btn').forEach(btn => {
    if (btn.dataset.level === level) {
      btn.className = 'yoga-filter-btn bg-brand-navy text-white text-xs font-medium px-4 py-1.5 rounded-full transition';
    } else {
      btn.className = 'yoga-filter-btn bg-white text-slate-500 hover:text-brand-navy text-xs font-medium px-4 py-1.5 rounded-full transition';
    }
  });
  renderYogaPoses();
}

function startQuickWorkout(title, mins) {
  switchMenu('yoga', 2);
  const titleEl = document.getElementById('active-yoga-title');
  if (titleEl) titleEl.textContent = title;
  yogaRemainingSeconds = mins * 60;
  updateYogaTimerDisplay();
  if (!isYogaTimerRunning) {
    toggleYogaSessionTimer();
  }
  showToast(`Memulai sesi "${title}" (${mins} menit)`);
}

function toggleYogaSessionTimer() {
  const btnText = document.getElementById('yoga-timer-btn-text');
  const statusEl = document.getElementById('active-yoga-status');

  if (isYogaTimerRunning) {
    clearInterval(yogaTimerInterval);
    isYogaTimerRunning = false;
    if (btnText) btnText.textContent = 'Lanjutkan Timer';
    if (statusEl) statusEl.textContent = 'Session Paused';
  } else {
    isYogaTimerRunning = true;
    if (btnText) btnText.textContent = 'Jeda Sesi';
    if (statusEl) statusEl.textContent = 'Live Guided Breathing Active';

    yogaTimerInterval = setInterval(() => {
      if (yogaRemainingSeconds > 0) {
        yogaRemainingSeconds--;
        updateYogaTimerDisplay();
      } else {
        clearInterval(yogaTimerInterval);
        isYogaTimerRunning = false;
        showToast('Selamat! Sesi latihan yoga selesai 🎉');
      }
    }, 1000);
  }
}

function resetYogaSessionTimer() {
  clearInterval(yogaTimerInterval);
  isYogaTimerRunning = false;
  yogaRemainingSeconds = 15 * 60;
  updateYogaTimerDisplay();
  const btnText = document.getElementById('yoga-timer-btn-text');
  if (btnText) btnText.textContent = 'Mulai Timer Latihan';
}

function updateYogaTimerDisplay() {
  const disp = document.getElementById('yoga-timer-display');
  const cue = document.getElementById('yoga-breath-cue');
  if (!disp) return;
  const mins = String(Math.floor(yogaRemainingSeconds / 60)).padStart(2, '0');
  const secs = String(yogaRemainingSeconds % 60).padStart(2, '0');
  disp.textContent = `${mins}:${secs}`;

  if (cue) {
    const cycle = yogaRemainingSeconds % 8;
    cue.textContent = cycle >= 4 ? 'Inhale' : 'Exhale';
  }
}

// ---------------------------------------------------------
// 6. SUBMENU 4: MEALS & NUTRITION TRACKER
// ---------------------------------------------------------
let mealsList = [
  { id: 1, mealTime: 'Breakfast • 07:30 AM', name: 'Avocado Poached Egg & Quinoa Bowl', category: 'Food', kcal: 340, protein: '18g', carbs: '32g', logged: true },
  { id: 2, mealTime: 'Morning Drink • 09:45 AM', name: 'Cold-Pressed Kale, Cucumber & Ginger Juice', category: 'Juice', kcal: 95, protein: '3g', carbs: '19g', logged: true },
  { id: 3, mealTime: 'Lunch • 12:30 PM', name: 'Mediterranean Chickpea & Edamame Salad', category: 'Salad', kcal: 290, protein: '16g', carbs: '28g', logged: true },
  { id: 4, mealTime: 'Pre-Yoga Snack • 03:30 PM', name: 'Chia Seed Berry Almond Pudding', category: 'Food', kcal: 230, protein: '9g', carbs: '24g', logged: true },
  { id: 5, mealTime: 'Post-Workout • 05:15 PM', name: 'Alkaline Mineral Water + Lemon', category: 'Water', kcal: 0, protein: '0g', carbs: '0g', logged: true },
  { id: 6, mealTime: 'Dinner • 07:15 PM', name: 'Grilled Wild Salmon with Steamed Asparagus', category: 'Food', kcal: 465, protein: '38g', carbs: '14g', logged: true },
  { id: 7, mealTime: 'Optional • Evening', name: 'Warm Chamomile & Manuka Honey Infusion', category: 'Juice', kcal: 35, protein: '0g', carbs: '8g', logged: false },
  { id: 8, mealTime: 'Recipe Idea', name: 'Tofu Sesame Sobanoodle Greens', category: 'Salad', kcal: 310, protein: '21g', carbs: '36g', logged: false }
];

let totalLoggedKcal = 1420;
let waterGlasses = 6;

function renderMealsList() {
  const container = document.getElementById('meals-list-container');
  if (!container) return;

  container.innerHTML = mealsList.map(m => `
    <div class="hover-lift bg-white rounded-[18px] p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-2xl ${m.logged ? 'bg-[#dff5e8] text-brand-sidebar' : 'bg-slate-100 text-slate-500'} flex items-center justify-center font-bold text-xs shrink-0">
          ${m.kcal}
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-[10.5px] font-semibold text-brand-sidebar">${m.mealTime}</span>
            <span class="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 text-slate-600">${m.category}</span>
          </div>
          <h4 class="text-[13.5px] font-bold text-brand-navy mt-0.5">${escapeHtmlText(m.name)}</h4>
          <p class="text-[11px] text-slate-400">Kalori: <strong class="text-brand-navy">${m.kcal} kcal</strong> • Protein: ${m.protein} • Carbs: ${m.carbs}</p>
        </div>
      </div>

      <button
        onclick="toggleMealLogged(${m.id})"
        class="shrink-0 text-xs font-semibold px-4 py-2 rounded-xl transition ${
          m.logged
            ? 'bg-[#e5f7ed] text-brand-darkGreen hover:bg-emerald-200'
            : 'bg-brand-sidebar text-white hover:bg-brand-darkGreen'
        }"
      >
        ${m.logged ? '✓ Tercatat' : '+ Catat Kalori'}
      </button>
    </div>
  `).join('');
}

function toggleMealLogged(id) {
  const item = mealsList.find(m => m.id === id);
  if (!item) return;
  item.logged = !item.logged;
  totalLoggedKcal += item.logged ? item.kcal : -item.kcal;
  updateMealsSummaryUI();
  renderMealsList();
  showToast(item.logged ? `"${item.name}" (+${item.kcal} kcal) dicatat!` : `"${item.name}" dihapus dari log harian`);
}

function logQuickCustomMeal() {
  const nameInput = document.getElementById('quick-meal-name');
  const kcalInput = document.getElementById('quick-meal-kcal');
  const name = nameInput?.value.trim();
  const kcal = parseInt(kcalInput?.value, 10) || 150;

  if (!name) {
    showToast('Masukkan nama makanan atau minuman terlebih dahulu');
    return;
  }

  mealsList.unshift({
    id: Date.now(),
    mealTime: 'Baru Saja',
    name,
    category: 'Food',
    kcal,
    protein: '12g',
    carbs: '18g',
    logged: true
  });

  totalLoggedKcal += kcal;
  nameInput.value = '';
  kcalInput.value = '';
  updateMealsSummaryUI();
  renderMealsList();
  animateNumber('meal-kcal-value', kcal);
  showToast(`Menu "${name}" (${kcal} kcal) berhasil ditambahkan!`);
}

function updateMealsSummaryUI() {
  const kcalEl = document.getElementById('meals-total-kcal');
  const barEl = document.getElementById('meals-kcal-bar');
  if (kcalEl) kcalEl.textContent = totalLoggedKcal.toLocaleString();
  if (barEl) {
    const pct = Math.min(100, Math.round((totalLoggedKcal / 1850) * 100));
    barEl.style.width = `${pct}%`;
  }
}

function addWaterGlass() {
  waterGlasses = Math.min(12, waterGlasses + 1);
  const el = document.getElementById('meals-water-glasses');
  if (el) el.textContent = waterGlasses;
  incrementMonthlyGoal('water');
}

// ---------------------------------------------------------
// 7. SUBMENU 5: CHAT WITH TRAINER & COMMUNITY
// ---------------------------------------------------------
const chatThreads = {
  janee: {
    name: 'Janee Mortensen',
    role: 'Personal Yoga Trainer • Online',
    avatar: 'JM',
    messages: [
      { sender: 'them', time: '09:15 AM', text: 'Halo Jane! Selamat pagi 🌿 Bagaimana kondisi tubuhmu setelah sesi yoga kemarin?' },
      { sender: 'me', time: '09:18 AM', text: 'Pagi Coach Janee! Punggung bawah terasa jauh lebih rileks, hari ini saya siap untuk sesi Warrior II.' },
      { sender: 'them', time: '09:20 AM', text: 'Bagus sekali! Pastikan saat melakukan pose Side Lunge Reach seperti di kartu Dashboard, bahu depan tetap rileks dan tarik napas panjang ya.' },
      { sender: 'them', time: '04:45 PM', text: 'Pengingat sore: Jangan lupa selesaikan tugas "Drinking Water" pukul 5:00 PM di panel sebelah kanan!' }
    ]
  },
  club: {
    name: 'Mindful Yoga Club (24 Online)',
    role: 'Community Group • Active Now',
    avatar: 'YC',
    messages: [
      { sender: 'them', time: '11:00 AM', text: 'Rina: Siapa yang ikut kelas Sunset Vinyasa jam 6:30 sore ini di Rooftop Deck?' },
      { sender: 'me', time: '11:04 AM', text: 'Saya sudah terdaftar! Sampai ketemu di sana ya.' },
      { sender: 'them', time: '11:10 AM', text: 'Coach Marcus: Kolam renang air hangat juga sudah siap untuk sesi Hydro Recovery jam 5 sore.' }
    ]
  },
  sarah: {
    name: 'Dr. Sarah',
    role: 'Sports Nutritionist • Online',
    avatar: 'DS',
    messages: [
      { sender: 'them', time: '01:15 PM', text: 'Halo Jane, saya melihat grafik Meal Statistic kamu hari ini sangat seimbang (230 kcal pada snack sore).' },
      { sender: 'me', time: '01:22 PM', text: 'Terima kasih Dok! Apakah porsi protein 84g hari ini sudah cukup?' },
      { sender: 'them', time: '01:25 PM', text: 'Sudah sangat baik! Tambahkan salmon atau tahu panggang saat makan malam untuk pemulihan otot.' }
    ]
  }
};

let activeChatKey = 'janee';

function switchChatContact(key) {
  activeChatKey = key;
  const thread = chatThreads[key];
  if (!thread) return;

  document.getElementById('chat-active-name').textContent = thread.name;
  document.getElementById('chat-active-role').textContent = thread.role;
  document.getElementById('chat-active-avatar').textContent = thread.avatar;

  document.querySelectorAll('.chat-contact-tab').forEach(btn => {
    btn.className = 'chat-contact-tab flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium text-xs transition';
  });
  const activeTab = document.getElementById(`chat-tab-${key}`);
  if (activeTab) {
    activeTab.className = 'chat-contact-tab flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#dff5e8] text-brand-navy font-semibold text-xs transition';
  }

  renderChatMessages();
}

function renderChatMessages() {
  const stream = document.getElementById('chat-messages-stream');
  if (!stream) return;
  const messages = chatThreads[activeChatKey].messages;

  stream.innerHTML = messages.map(msg => `
    <div class="flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}">
      <div class="max-w-[78%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
        msg.sender === 'me'
          ? 'bg-brand-sidebar text-white rounded-br-none'
          : 'bg-[#f1f6f3] text-brand-navy rounded-bl-none'
      }">
        <div class="break-words">${escapeHtmlText(msg.text)}</div>
        <div class="text-[9.5px] mt-1 ${msg.sender === 'me' ? 'text-emerald-100 text-right' : 'text-slate-400'}">${msg.time}</div>
      </div>
    </div>
  `).join('');

  stream.scrollTop = stream.scrollHeight;
}

function handleChatSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('chat-input-field');
  const text = input?.value.trim();
  if (!text) return;
  input.value = '';
  appendUserChatMessage(text);
}

function sendQuickChat(text) {
  appendUserChatMessage(text);
}

function appendUserChatMessage(text) {
  const thread = chatThreads[activeChatKey];
  thread.messages.push({
    sender: 'me',
    time: 'Just now',
    text
  });
  renderChatMessages();

  // Simulated Trainer Auto-Reply
  setTimeout(() => {
    const replies = [
      'Luar biasa Jane! Pertahankan konsistensi latihan dan hidrasi hari ini ya 🧘‍♀️✨',
      'Postur dan grafik aktivitasmu minggu ini meningkat +18%, teruskan semangatnya!',
      'Siap! Saya sudah memperbarui catatan progres kamu di jadwal latihan.'
    ];
    const replyText = replies[Math.floor(Math.random() * replies.length)];
    thread.messages.push({
      sender: 'them',
      time: 'Just now',
      text: replyText
    });
    renderChatMessages();
  }, 650);
}

// ---------------------------------------------------------
// 8. RIGHT SIDEBAR & PROFILE INTERACTIONS
// ---------------------------------------------------------
const monthlyGoalsState = {
  sleep: { current: 92, max: 240, step: 8, valId: 'goal-sleep-val', barId: 'goal-sleep-bar' },
  water: { current: 50, max: 160, step: 5, valId: 'goal-water-val', barId: 'goal-water-bar' },
  weight: { current: 4.5, max: 5, step: 0.1, valId: 'goal-weight-val', barId: 'goal-weight-bar' }
};

function incrementMonthlyGoal(key) {
  const g = monthlyGoalsState[key];
  if (!g) return;
  g.current = Math.min(g.max, Number((g.current + g.step).toFixed(1)));
  const valEl = document.getElementById(g.valId);
  const barEl = document.getElementById(g.barId);
  if (valEl) valEl.textContent = g.current;
  if (barEl) {
    const pct = Math.min(100, Math.round((g.current / g.max) * 100));
    barEl.style.width = `${pct}%`;
  }
  showToast(`Progres bulanan diperbarui: ${g.current} / ${g.max}`);
}

function toggleSidebarTask(taskRow) {
  const checkEl = taskRow.querySelector('.task-check');
  const titleEl = taskRow.querySelector('.task-title');
  if (!checkEl) return;

  const isChecked = checkEl.classList.contains('bg-[#41b873]');
  if (isChecked) {
    checkEl.className = 'task-check w-[18px] h-[18px] rounded-[5px] bg-white border border-emerald-300 text-transparent flex items-center justify-center transition';
    if (titleEl) titleEl.classList.remove('line-through', 'opacity-60');
  } else {
    checkEl.className = 'task-check w-[18px] h-[18px] rounded-[5px] bg-[#41b873] text-white flex items-center justify-center transition shadow-sm';
    if (titleEl) titleEl.classList.add('line-through', 'opacity-60');
    showToast('Tugas harian selesai! ✓');
  }
}

function addQuickSidebarTask() {
  const list = document.getElementById('sidebar-tasks-list');
  if (!list) return;
  const sampleTasks = ['15m Foam Rolling', 'Drink Matcha Green Tea', 'Prepare Yoga Mat', 'Log Evening Weight'];
  const pick = sampleTasks[Math.floor(Math.random() * sampleTasks.length)];

  const div = document.createElement('div');
  div.className = 'flex items-center justify-between cursor-pointer group pt-2 border-t border-emerald-600/10';
  div.onclick = function() { toggleSidebarTask(this); };
  div.innerHTML = `
    <div>
      <div class="text-[12px] font-medium text-brand-navy group-hover:text-brand-sidebar transition task-title">${pick}</div>
      <div class="text-[10.5px] text-[#55b97f] mt-0.5">15/11/ 2019 | 7:30 pm</div>
    </div>
    <div class="task-check w-[18px] h-[18px] rounded-[5px] bg-white border border-emerald-300 text-transparent flex items-center justify-center transition">
      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
  `;
  list.appendChild(div);
  showToast(`Task "${pick}" ditambahkan ke daftar!`);
}

function saveProfileChanges() {
  const name = document.getElementById('input-prof-name')?.value || 'Janee Mortensen';
  const height = document.getElementById('input-prof-height')?.value || '5.3 F';
  const weight = document.getElementById('input-prof-weight')?.value || '75 K';
  const age = document.getElementById('input-prof-age')?.value || '25 Y';

  document.getElementById('profile-display-name').textContent = name;
  document.getElementById('sidebar-prof-name').textContent = name;
  document.getElementById('sidebar-prof-height').textContent = height;
  document.getElementById('sidebar-prof-weight').textContent = weight;
  document.getElementById('sidebar-prof-age').textContent = age;

  showToast('Data profil berhasil diperbarui dan disinkronkan ke Sidebar!');
}

// ---------------------------------------------------------
// 9. SEARCH BAR, NOTIFICATIONS & TOAST HELPER
// ---------------------------------------------------------
let searchOpen = false;
function toggleSearchBox() {
  const wrap = document.getElementById('search-box-wrap');
  const input = document.getElementById('global-search-input');
  if (!wrap || !input) return;

  searchOpen = !searchOpen;
  document.getElementById('search-toggle').setAttribute('aria-expanded', String(searchOpen));
  input.disabled = !searchOpen;
  if (searchOpen) {
    wrap.classList.remove('w-9');
    wrap.classList.add('w-52');
    input.classList.remove('w-0', 'opacity-0');
    input.classList.add('w-full', 'opacity-100');
    input.focus();
  } else {
    wrap.classList.remove('w-52');
    wrap.classList.add('w-9');
    input.classList.remove('w-full', 'opacity-100');
    input.classList.add('w-0', 'opacity-0');
    input.value = '';
  }
}

function handleGlobalSearch(query) {
  const q = query.toLowerCase().trim();
  if (!q) return;
  if (q.includes('jadwal') || q.includes('swim') || q.includes('schedule')) {
    switchMenu('schedule', 1);
  } else if (q.includes('pose') || q.includes('warrior') || q.includes('yoga')) {
    switchMenu('yoga', 2);
  } else if (q.includes('meal') || q.includes('salad') || q.includes('makan') || q.includes('juice')) {
    switchMenu('meals', 3);
  } else if (q.includes('chat') || q.includes('trainer')) {
    switchMenu('chat', 4);
  }
}

function toggleNotifPopover() {
  const pop = document.getElementById('notif-popover');
  if (pop) pop.classList.toggle('hidden');
}

let toastTimeout = null;
function showToast(message) {
  const box = document.getElementById('toast-box');
  const text = document.getElementById('toast-text');
  if (!box || !text) return;

  text.textContent = message;
  box.classList.remove('opacity-0', 'translate-y-3');
  box.classList.add('opacity-100', 'translate-y-0');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    box.classList.remove('opacity-100', 'translate-y-0');
    box.classList.add('opacity-0', 'translate-y-3');
  }, 2600);
}

// ---------------------------------------------------------
// INITIALIZE APP ON LOAD
// ---------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  updateYogaActivityBars('last_week');
  renderScheduleDays();
  renderScheduleTimeline();
  renderYogaPoses();
  renderMealsList();
  renderChatMessages();
});
