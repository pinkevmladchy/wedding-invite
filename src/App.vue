<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useInvite } from './composables/useInvite';
import { saveRsvp, fetchRsvp, fetchAllRsvp, type RsvpRow } from './lib/db';

const {
  screen,
  codeInput,
  errorMsg,
  checkCode,
  inputShaking,
  guestName,
  guestCode,
  guestKids,
  guestGreeting,
  guestTask,
} = useInvite();

// Питання про присутність — узгоджене за родом/числом (gender відомий за кодом)
const presentLabel = computed(() => {
  if (guestGreeting.value === 'Любий') return 'Я буду присутній на весіллі';
  if (guestGreeting.value === 'Люба') return 'Я буду присутня на весіллі';
  return 'Ми будемо присутні на весіллі';
});

const BASE = import.meta.env.BASE_URL;

// Scroll-reveal directive: fades + slides up as element enters viewport
const vReveal = {
  mounted(el: HTMLElement, binding: { value?: number }) {
    el.classList.add('reveal');
    if (typeof binding.value === 'number') {
      el.style.transitionDelay = `${binding.value}ms`;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        el.classList.add('is-visible');
        io.disconnect();
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
  },
};

const WEDDING = {
  brideName: "Ірина",
  groomName: "Дмитро",
  date: "23 серпня 2026",
  dateFmt: "23 · 08 · 2026",
  dateRoman: "23 · 08 · 2026",
  estTagline: "Весілля · 2026",
  heroPhotoUrl: `${BASE}couple-portrait.jpg`,
  footerPhotoUrl: `${BASE}couple-detail.jpg`,
  photoCaption: "Дмитро та Ірина",
  venue: {
    name: "Яхта",
    city: "Осещина · Київська область",
    address: "вул. Київська, 2Г · 07363",
    hall: "VIP панорама зал",
    ceremonyTime: "14:30",
    receptionTime: "15:30",
    mapUrl: "https://maps.app.goo.gl/e25qVvUq9Gbtzo1Q7",
  },
  // Повний денний розклад — ВНУТРІШНІЙ, гостям не показується.
  internalSchedule: [
    { time: "10:30–11:30", label: "Дорога на фотосесію" },
    { time: "11:30–13:00", label: "Фотосесія" },
    { time: "13:00", label: "Виїзд з фотосесії" },
    { time: "14:00–14:30", label: "Збір гостей" },
    { time: "14:30–15:00", label: "Церемонія" },
    { time: "15:00–15:30", label: "Привітання від гостей" },
    { time: "15:30–16:30", label: "Перший стіл" },
    { time: "16:30–17:00", label: "Перерва · перший танець" },
    { time: "17:00–18:30", label: "Другий стіл" },
    { time: "18:30–19:00", label: "Перерва · танці та спілкування" },
    { time: "19:00–20:00", label: "Третій стіл" },
    { time: "20:00–20:20", label: "Торт, букет, підв'язка" },
    { time: "20:20–21:40", label: "Танці" },
  ],
  // Гостьова програма вечора — показується на сторінці.
  schedule: [
    { time: "14:00", label: "Збір гостей" },
    { time: "14:30", label: "Церемонія" },
    { time: "15:00–22:00", label: "Свято кохання" },
  ],
  dressCode: {
    style: "Cocktail Attire",
    sub: "Святкова елегантність",
    swatches: [
      { hex: "#f4ecd8", label: "Крем" },
      { hex: "#d4c8ad", label: "Шампань" },
      { hex: "#9aab7b", label: "Шавлія" },
      { hex: "#5e6e35", label: "Олива" },
      { hex: "#7a5a46", label: "Мокко" },
      { hex: "#1a1b16", label: "Нуар" },
    ],
  },
};

type YesNo = 'yes' | 'no' | '';
const rsvpPresent = ref<YesNo>('');
const submitting = ref(false);
const submitted = ref(false);
const submitError = ref('');
const photoLoaded = ref(true);
const alreadyResponded = ref(false);

function onPhotoError() {
  photoLoaded.value = false;
}

// Підтягуємо попередню відповідь гостя й наперед заповнюємо перемикачі.
async function loadExisting() {
  if (!guestCode.value) return;
  try {
    const row = await fetchRsvp(guestCode.value);
    if (row) {
      rsvpPresent.value = row.present.startsWith('Так') ? 'yes' : 'no';
      alreadyResponded.value = true;
    }
  } catch (e) {
    console.error('loadExisting failed', e);
  }
}

async function submitRsvp() {
  if (!rsvpPresent.value) {
    submitError.value = 'Будь ласка, дайте відповідь';
    return;
  }
  submitError.value = '';
  submitting.value = true;

  const row: RsvpRow = {
    code: guestCode.value,
    guest_name: guestName.value,
    present: rsvpPresent.value === 'yes' ? 'Так, буду присутній(ня)' : 'На жаль, не зможу',
    updated_at: new Date().toISOString(),
  };

  try {
    await saveRsvp(row);
    submitted.value = true;
  } catch (e) {
    submitError.value = 'Не вдалося зберегти. Спробуйте, будь ласка, ще раз.';
    console.error('RSVP save failed', e, row);
  } finally {
    submitting.value = false;
  }
}

// ===== ЕКРАН АДМІНА (code: admin) =====
const adminRows = ref<RsvpRow[]>([]);
const adminLoading = ref(false);
const adminError = ref('');

async function loadAdmin() {
  adminLoading.value = true;
  adminError.value = '';
  try {
    adminRows.value = await fetchAllRsvp();
  } catch (e) {
    adminError.value = 'Не вдалося завантажити відповіді.';
    console.error('admin load failed', e);
  } finally {
    adminLoading.value = false;
  }
}

watch(screen, (s) => {
  if (s === 'admin') loadAdmin();
  if (s === 'invite') loadExisting();
});

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('uk-UA', { dateStyle: 'short', timeStyle: 'short' });
}
</script>

<template>
  <main class="app">
  <!-- ===== ЕКРАН ВВЕДЕННЯ КОДУ ===== -->
  <Transition name="fade">
    <div v-if="screen === 'code'" class="screen screen-fixed code-screen">
      <div class="code-top">
        <p class="eyebrow eyebrow--stone">{{ WEDDING.estTagline }}</p>
      </div>

      <div class="code-stage">
        <div class="namestack namestack--lg">
          <span class="namestack-line">{{ WEDDING.groomName }}</span>
          <span class="namestack-amp">&amp;</span>
          <span class="namestack-line">{{ WEDDING.brideName }}</span>
        </div>
        <p class="code-date">{{ WEDDING.dateRoman }}</p>

        <div class="code-prompt">
          <label class="code-label">Код запрошення</label>
          <input v-model="codeInput"
                 :class="['code-input', { shake: inputShaking }]"
                 maxlength="16"
                 placeholder="••••••"
                 autocomplete="off"
                 spellcheck="false"
                 @keyup.enter="checkCode" />
          <button class="ghost-btn ghost-btn--sage" @click="checkCode">Відкрити запрошення</button>
          <p class="error-msg">{{ errorMsg }}</p>
        </div>
      </div>

      <div class="code-bottom">
        <span>Osescheny</span>
        <span>·</span>
        <span>Ukraine</span>
      </div>
    </div>
  </Transition>

  <!-- ===== ЕКРАН ВІДКРИТТЯ ===== -->
  <Transition name="fade">
    <div v-if="screen === 'reveal'" class="screen screen-fixed reveal-screen">
      <p class="reveal-eyebrow">{{ guestGreeting }},</p>
      <h2 class="reveal-name">{{ guestName }}</h2>
      <div class="reveal-divider"></div>
      <p class="reveal-msg">Ми з радістю запрошуємо Вас на наше весілля</p>
    </div>
  </Transition>

  <!-- ===== ЕКРАН ЗАПРОШЕННЯ ===== -->
  <Transition name="pop">
    <div v-if="screen === 'invite'" class="screen invite-screen">
      <div class="invite-wrap">

        <!-- HERO -->
        <section class="hero">
          <p v-reveal class="eyebrow eyebrow--stone hero-eyebrow">Запрошення</p>
          <h1 v-reveal="120" class="namestack namestack--xl">
            <span class="namestack-line">{{ WEDDING.groomName }}</span>
            <span class="namestack-amp">&amp;</span>
            <span class="namestack-line">{{ WEDDING.brideName }}</span>
          </h1>
          <p v-reveal="240" class="hero-date">{{ WEDDING.dateRoman }} &nbsp;·&nbsp; {{ WEDDING.venue.city }}</p>

          <div v-reveal="360" class="hero-photo-wrap">
            <img v-if="photoLoaded"
                 :src="WEDDING.heroPhotoUrl"
                 :alt="WEDDING.photoCaption"
                 class="hero-photo"
                 @error="onPhotoError" />
            <div v-else class="hero-photo-placeholder">
              Додайте фото у public/couple-portrait.jpg
            </div>
            <p class="hero-photo-caption">{{ WEDDING.photoCaption }}</p>
          </div>
        </section>

        <!-- I · ЛОКАЦІЯ -->
        <section v-reveal class="section">
          <header class="section-head">
            <div class="section-chapter">
              <span class="section-chapter-num">01</span>
            </div>
            <h2 class="section-title">Місце</h2>
          </header>
          <div class="venue-card">
            <p class="venue-name">{{ WEDDING.venue.name }}</p>
            <p class="venue-city">{{ WEDDING.venue.city }}</p>
            <p class="venue-hall">Зустріч гостей та банкет — {{ WEDDING.venue.hall }}</p>

            <div class="venue-times">
              <div class="venue-time-block">
                <span class="venue-time-label">Церемонія</span>
                <p class="time-big">{{ WEDDING.venue.ceremonyTime }}</p>
              </div>
              <div class="venue-divider-vert"></div>
              <div class="venue-time-block">
                <span class="venue-time-label">У закладі</span>
                <p class="time-big">{{ WEDDING.venue.receptionTime }}</p>
              </div>
            </div>

            <a class="map-link" :href="WEDDING.venue.mapUrl" target="_blank" rel="noopener">Відкрити на мапі</a>

          </div>
        </section>

        <!-- БАСЕЙН (для всіх) -->
        <section v-reveal class="section">
          <div class="pool-card">
            <p class="eyebrow eyebrow--stone">Приємний бонус</p>
            <p class="pool-title">Басейн</p>
            <p class="pool-text">
              Прямо біля нашого банкетного залу розташований басейн. Тож
              увечері, після спекотного дня, можна буде охолодитись —
              хто матиме бажання, welcome.
            </p>
          </div>
        </section>

        <!-- ДИТЯЧА ЗОНА (лише для гостей з дітьми) -->
        <section v-if="guestKids" v-reveal class="section kids-section">
          <div class="kids-card">
            <p class="eyebrow eyebrow--stone">Для ваших дітей</p>
            <p class="kids-title">Окрема дитяча зона</p>
            <p class="kids-text">
              Спеціально для діток буде облаштована велика окрема зона, де вони
              зможуть гратися та відпочивати. Так і малеча буде зайнята, і дорослі
              зможуть спокійно святкувати.
            </p>
          </div>
        </section>

        <!-- ПЕРСОНАЛЬНЕ ПРОХАННЯ (лише для гостей із task) -->
        <section v-if="guestTask" v-reveal class="section task-section">
          <div class="task-card">
            <p class="eyebrow eyebrow--stone">Особисте прохання</p>
            <p class="task-text">{{ guestTask }}</p>
          </div>
        </section>

        <!-- II · РОЗКЛАД -->
        <section v-reveal class="section">
          <header class="section-head">
            <div class="section-chapter">
              <span class="section-chapter-num">02</span>
            </div>
            <h2 class="section-title">Програма вечора</h2>
          </header>
          <ol class="schedule">
            <li v-for="(item, i) in WEDDING.schedule" :key="item.time" class="schedule-item">
              <span class="schedule-num">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="schedule-label">{{ item.label }}</span>
              <span class="schedule-time">{{ item.time }}</span>
            </li>
          </ol>
        </section>

        <!-- III · ДРЕС-КОД -->
        <section v-reveal class="section">
          <header class="section-head">
            <div class="section-chapter">
              <span class="section-chapter-num">03</span>
            </div>
            <h2 class="section-title">Дрес-код</h2>
          </header>
          <div class="dress">
            <p class="dress-style-sub">{{ WEDDING.dressCode.sub }}</p>

            <div class="swatches-wrap">
              <div class="swatches">
                <div v-for="s in WEDDING.dressCode.swatches" :key="s.hex"
                     class="swatch"
                     :style="{ background: s.hex }">
                  <span class="swatch-label">{{ s.label }}</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        <!-- НАШЕ ПРОХАННЯ (для всіх) -->
        <section v-reveal class="section">
          <div class="wishes">
            <p class="eyebrow eyebrow--stone">Від молодят</p>
            <p class="wishes-text">
              Ми вирішили лишити гучні традиції в минулому: на нашому святі не буде
              криків «Гірко!», викрадення нареченої та інших подібних звичаїв.
              Натомість ми хочемо просто щиро розділити з вами радість народження
              нової сім'ї — у теплій, легкій та невимушеній атмосфері.
            </p>
          </div>
        </section>

        <!-- IV · RSVP -->
        <section v-reveal class="section">
          <header class="section-head">
            <div class="section-chapter">
              <span class="section-chapter-num">04</span>
            </div>
            <h2 class="section-title">Підтвердження</h2>
          </header>

          <div v-if="!submitted" class="rsvp-form">
            <p v-if="alreadyResponded" class="rsvp-already">
              Ви вже відповідали — нижче ваш вибір. Можете залишити як є або змінити та зберегти знову.
            </p>
            <div class="rsvp-question">
              <p class="rsvp-q-label">{{ presentLabel }}</p>
              <div class="toggle">
                <button type="button"
                        :class="['toggle-btn', { active: rsvpPresent === 'yes' }]"
                        @click="rsvpPresent = 'yes'">Так</button>
                <button type="button"
                        :class="['toggle-btn', { active: rsvpPresent === 'no' }]"
                        @click="rsvpPresent = 'no'">Ні</button>
              </div>
            </div>

            <button class="ghost-btn rsvp-submit"
                    :disabled="submitting"
                    @click="submitRsvp">
              {{ submitting ? 'Зберігаємо…' : (alreadyResponded ? 'Зберегти зміни' : 'Підтвердити') }}
            </button>
            <p v-if="submitError" class="error-msg">{{ submitError }}</p>
          </div>

          <div v-else class="rsvp-thanks">
            <div class="rsvp-thanks-mark">Merci</div>
            <p class="rsvp-thanks-text">Дякуємо! Ваша відповідь збережена. До зустрічі {{ WEDDING.date }}.</p>
          </div>
        </section>

        <!-- FOOTER -->
        <footer v-reveal class="invite-footer">
          <div class="footer-photo-wrap">
            <img :src="WEDDING.footerPhotoUrl"
                 alt="Дмитро та Ірина"
                 class="footer-photo" />
            <div class="footer-photo-overlay">
              <p class="footer-date-mark">{{ WEDDING.dateRoman }}</p>
              <div class="footer-rule"></div>
              <p class="footer-names">{{ WEDDING.groomName }} &nbsp;&amp;&nbsp; {{ WEDDING.brideName }}</p>
            </div>
          </div>
          <p class="footer-sign">З нетерпінням чекаємо на Вас</p>
        </footer>

      </div>
    </div>
  </Transition>

  <!-- ===== ЕКРАН АДМІНА ===== -->
  <Transition name="fade">
    <div v-if="screen === 'admin'" class="screen admin-screen">
      <div class="admin-wrap">
        <header class="admin-head">
          <p class="eyebrow eyebrow--stone">Адмін-панель</p>
          <h2 class="admin-title">Відповіді гостей</h2>
          <button class="ghost-btn ghost-btn--sage admin-refresh"
                  :disabled="adminLoading"
                  @click="loadAdmin">
            {{ adminLoading ? 'Завантаження…' : 'Оновити' }}
          </button>
        </header>

        <p v-if="adminError" class="error-msg">{{ adminError }}</p>

        <p v-else-if="!adminLoading && adminRows.length === 0" class="admin-empty">
          Поки що немає жодної відповіді.
        </p>

        <div v-else-if="adminRows.length" class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Гість</th>
                <th>Код</th>
                <th>Присутність</th>
                <th>Оновлено</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in adminRows" :key="r.code">
                <td>{{ r.guest_name }}</td>
                <td class="admin-code">{{ r.code }}</td>
                <td>{{ r.present }}</td>
                <td class="admin-when">{{ fmtDate(r.updated_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </Transition>
  </main>
</template>
