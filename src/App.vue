<script setup lang="ts">
import { ref } from 'vue';
import { useInvite } from './composables/useInvite';

const {
  screen,
  codeInput,
  errorMsg,
  checkCode,
  inputShaking,
  guestName,
  guestCode,
} = useInvite();

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/meedgyqd';
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
  date: "29 серпня 2026",
  dateFmt: "29 · 08 · 2026",
  dateRoman: "XXIX · VIII · MMXXVI",
  estTagline: "Established · MMXXVI",
  heroPhotoUrl: `${BASE}couple-portrait.jpg`,
  footerPhotoUrl: `${BASE}couple-detail.jpg`,
  photoCaption: "Дмитро та Ірина",
  venue: {
    name: "Cafe Gallerist",
    city: "Буча",
    ceremonyTime: "15:00",
    receptionTime: "17:00",
    mapUrl: "https://maps.google.com/?q=Cafe+Gallerist+Bucha",
  },
  schedule: [
    { time: "14:30", label: "Збір гостей" },
    { time: "15:00", label: "Церемонія" },
    { time: "16:00", label: "Фотосесія та коктейлі" },
    { time: "17:00", label: "Бенкет у закладі" },
    { time: "19:00", label: "Перший танець" },
    { time: "22:00", label: "Святковий торт" },
  ],
  dressCode: {
    style: "Cocktail Attire",
    sub: "Святкова елегантність",
    note: "Уникайте, будь ласка, білого кольору",
    swatches: [
      { hex: "#ffffff", label: "Білий" },
      { hex: "#faf8f2", label: "Айворі" },
      { hex: "#acbf69", label: "Шавлія" },
      { hex: "#b5ab94", label: "Камінь" },
      { hex: "#1a1b16", label: "Нуар" },
    ],
  },
};

type YesNo = 'yes' | 'no' | '';
const rsvpPresent = ref<YesNo>('');
const rsvpCeremony = ref<YesNo>('');
const submitting = ref(false);
const submitted = ref(false);
const submitError = ref('');
const photoLoaded = ref(true);

function onPhotoError() {
  photoLoaded.value = false;
}

async function submitRsvp() {
  if (!rsvpPresent.value || !rsvpCeremony.value) {
    submitError.value = 'Будь ласка, дайте відповідь на всі питання';
    return;
  }
  submitError.value = '';
  submitting.value = true;

  const payload = {
    guest: guestName.value,
    code: guestCode.value,
    present: rsvpPresent.value === 'yes' ? 'Так, буду присутній(ня)' : 'На жаль, не зможу',
    ceremony: rsvpCeremony.value === 'yes' ? 'Так' : 'Ні',
    _subject: `RSVP: ${guestName.value}`,
  };

  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    submitted.value = true;
  } catch (e) {
    submitError.value = 'Не вдалося відправити. Спробуйте, будь ласка, ще раз.';
    console.error('RSVP submit failed', e, payload);
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <!-- ===== ЕКРАН ВВЕДЕННЯ КОДУ ===== -->
  <Transition name="fade">
    <div v-if="screen === 'code'" class="screen screen-fixed code-screen">
      <div class="code-top">
        <p class="eyebrow eyebrow--stone">{{ WEDDING.estTagline }}</p>
      </div>

      <div class="code-stage">
        <div class="namestack namestack--lg">
          <span class="namestack-line">{{ WEDDING.groomName }}</span>
          <span class="namestack-amp">et</span>
          <span class="namestack-line">{{ WEDDING.brideName }}</span>
        </div>
        <p class="code-date">{{ WEDDING.dateRoman }}</p>

        <div class="code-prompt">
          <label class="code-label">Код запрошення</label>
          <input v-model="codeInput"
                 :class="['code-input', { shake: inputShaking }]"
                 maxlength="10"
                 placeholder="••••••"
                 autocomplete="off"
                 spellcheck="false"
                 @keyup.enter="checkCode" />
          <button class="ghost-btn" @click="checkCode">Відкрити запрошення</button>
          <p class="error-msg">{{ errorMsg }}</p>
        </div>
      </div>

      <div class="code-bottom">
        <span>Bucha</span>
        <span>·</span>
        <span>Ukraine</span>
      </div>
    </div>
  </Transition>

  <!-- ===== ЕКРАН ВІДКРИТТЯ ===== -->
  <Transition name="fade">
    <div v-if="screen === 'reveal'" class="screen screen-fixed reveal-screen">
      <p class="reveal-eyebrow">Любий гостю</p>
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
          <p v-reveal class="eyebrow eyebrow--stone hero-eyebrow">L'Invitation · MMXXVI</p>
          <h1 v-reveal="120" class="namestack namestack--xl">
            <span class="namestack-line">{{ WEDDING.groomName }}</span>
            <span class="namestack-amp">et</span>
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
              <span class="section-chapter-num">I</span>
            </div>
            <h2 class="section-title">Місце</h2>
          </header>
          <div class="venue-card">
            <p class="venue-name">{{ WEDDING.venue.name }}</p>
            <p class="venue-city">{{ WEDDING.venue.city }}</p>

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

        <!-- II · РОЗКЛАД -->
        <section v-reveal class="section">
          <header class="section-head">
            <div class="section-chapter">
              <span class="section-chapter-num">II</span>
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
              <span class="section-chapter-num">III</span>
            </div>
            <h2 class="section-title">Дрес-код</h2>
          </header>
          <div class="dress">
            <p class="dress-style">{{ WEDDING.dressCode.style }}</p>
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

            <p class="dress-note">{{ WEDDING.dressCode.note }}</p>
          </div>
        </section>

        <!-- IV · RSVP -->
        <section v-reveal class="section">
          <header class="section-head">
            <div class="section-chapter">
              <span class="section-chapter-num">IV</span>
            </div>
            <h2 class="section-title">Підтвердження</h2>
            <p class="section-sub">Будь ласка, дайте нам знати до 1 серпня</p>
          </header>

          <div v-if="!submitted" class="rsvp-form">
            <div class="rsvp-question">
              <p class="rsvp-q-label">Я буду присутній (присутня) на весіллі</p>
              <div class="toggle">
                <button type="button"
                        :class="['toggle-btn', { active: rsvpPresent === 'yes' }]"
                        @click="rsvpPresent = 'yes'">Так</button>
                <button type="button"
                        :class="['toggle-btn', { active: rsvpPresent === 'no' }]"
                        @click="rsvpPresent = 'no'">Ні</button>
              </div>
            </div>

            <div class="rsvp-question">
              <p class="rsvp-q-label">Чи будете на церемонії?</p>
              <div class="toggle">
                <button type="button"
                        :class="['toggle-btn', { active: rsvpCeremony === 'yes' }]"
                        @click="rsvpCeremony = 'yes'">Так</button>
                <button type="button"
                        :class="['toggle-btn', { active: rsvpCeremony === 'no' }]"
                        @click="rsvpCeremony = 'no'">Ні</button>
              </div>
            </div>

            <button class="ghost-btn rsvp-submit"
                    :disabled="submitting"
                    @click="submitRsvp">
              {{ submitting ? 'Відправляємо…' : 'Підтвердити' }}
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
          </div>
          <p class="footer-date-mark">{{ WEDDING.dateRoman }}</p>
          <div class="footer-rule"></div>
          <p class="footer-names">{{ WEDDING.groomName }} &nbsp;et&nbsp; {{ WEDDING.brideName }}</p>
          <p class="footer-sign">З нетерпінням чекаємо на Вас</p>
        </footer>

      </div>
    </div>
  </Transition>
</template>
