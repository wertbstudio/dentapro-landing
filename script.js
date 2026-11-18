'use strict';

// Light is always the initial theme; the visitor can switch without reloading.
const darkTheme = document.querySelector('#dark-theme');
const themeToggles = [...document.querySelectorAll('[data-theme-toggle]')];
let isDarkTheme = false;
themeToggles.forEach((toggle) => toggle.addEventListener('click', () => {
  isDarkTheme = !isDarkTheme;
  darkTheme.media = isDarkTheme ? 'all' : 'not all';
  document.documentElement.dataset.theme = isDarkTheme ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]').content = isDarkTheme ? '#171b1b' : '#FFFFFF';
  themeToggles.forEach((button) => button.setAttribute('aria-checked', String(isDarkTheme)));
}));

// This cookie stores only notice dismissal, never contacts or credentials.
const cookieNotice = document.querySelector('#cookie-notice');
const noticeCookieName = 'dentapro_notice_seen';
let noticeDismissed = false;
try {
  noticeDismissed = document.cookie.split(';').some((cookie) => cookie.trim() === `${noticeCookieName}=v1`);
} catch {
  // The notice remains usable when browser storage is blocked.
}
cookieNotice.hidden = noticeDismissed;
document.querySelector('#cookie-notice-dismiss').addEventListener('click', () => {
  cookieNotice.hidden = true;
  try {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${noticeCookieName}=v1; Max-Age=15552000; Path=/; SameSite=Lax${secure}`;
  } catch {
    // Closing still works for this page when cookies are unavailable.
  }
});

// Prices are illustrative and must be approved by the clinic before launch.
const catalog = {
  therapy: [
    ['Лечение кариеса под микроскопом', 'С сохранением живых тканей зуба', '6 500'],
    ['Лечение пульпита', 'Бережная обработка и пломбирование корневых каналов', '12 000'],
    ['Эстетическая реставрация зуба', 'Восстанавливаем естественную форму и оттенок', '9 000'],
    ['Лечение периодонтита', 'Точная работа с каналами под увеличением', '15 000'],
    ['Первичная консультация стоматолога', 'Осмотр, ответы на вопросы и индивидуальный план', '1 500']
  ],
  implants: [
    ['Установка импланта Osstem', 'Восстановление утраченного зуба на корейской системе', '35 000'],
    ['Установка импланта Straumann', 'Швейцарская имплантационная система', '65 000'],
    ['Костная пластика', 'Подготовка костной ткани к установке импланта', '25 000'],
    ['Синус-лифтинг', 'Восстановление объёма кости в области верхней челюсти', '30 000'],
    ['Консультация имплантолога', 'Оценка клинической ситуации и планирование', '2 000']
  ],
  prosthetics: [
    ['Керамический винир E.max', 'Естественная эстетика и индивидуальный оттенок', '32 000'],
    ['Коронка из диоксида циркония', 'Прочная конструкция с точным прилеганием', '28 000'],
    ['Керамическая коронка E.max', 'Восстановление формы и прозрачности зуба', '30 000'],
    ['Коронка на импланте', 'Завершающий этап восстановления зуба', '35 000'],
    ['Керамическая вкладка', 'Бережное восстановление жевательной поверхности', '18 000']
  ],
  hygiene: [
    ['Комплексная профессиональная гигиена', 'Ультразвук, Air Flow и полировка зубов', '7 500'],
    ['Отбеливание Zoom 4', 'Профессиональная процедура после осмотра врача', '29 000'],
    ['Реминерализующая терапия', 'Уход за эмалью и снижение чувствительности', '3 000'],
    ['Индивидуальные капы для отбеливания', 'Капы по вашим слепкам для домашнего ухода', '8 000'],
    ['Обучение домашней гигиене', 'Подбираем средства и технику ухода за зубами', '1 500']
  ]
};

const panels = document.querySelector('#service-panels');
Object.entries(catalog).forEach(([category, services], index) => {
  const panel = document.createElement('div');
  panel.className = 'service-panel';
  panel.id = `panel-${category}`;
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', `tab-${category}`);
  panel.tabIndex = 0;
  panel.hidden = index !== 0;
  services.forEach(([title, description, price], serviceIndex) => {
    const row = document.createElement('article');
    row.className = 'service-row';
    // All catalog values are static, authored content; user data is never injected as HTML.
    row.innerHTML = `<span class="service-number">${String(serviceIndex + 1).padStart(2, '0')}</span><div class="service-info"><h3>${title}</h3><p>${description}</p></div><p class="service-price"><small>от</small> ${price} ₽</p><button class="button" type="button">Записаться <svg class="icon" aria-hidden="true"><use href="#arrow"/></svg></button>`;
    row.querySelector('button').dataset.book = title;
    row.querySelector('button').setAttribute('aria-label', `Записаться: ${title}`);
    panel.append(row);
  });
  panels.append(panel);
});

const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab, focus = false) {
  tabs.forEach((item) => {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
  });
  if (focus) tab.focus({ preventScroll: true });
  tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (event) => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      selectTab(tabs[next], true);
    }
  });
});

const menu = document.querySelector('#mobile-menu');
const menuToggle = document.querySelector('.menu-toggle');
const booking = document.querySelector('#booking-modal');
const privacy = document.querySelector('#privacy-modal');
const form = document.querySelector('#booking-form');
const nameInput = form.elements.name;
const phoneInput = form.elements.phone;
const serviceInput = form.elements.service;
const consentInput = form.elements.consent;
const submitButton = form.querySelector('[type="submit"]');
const formError = document.querySelector('#form-error');
const bookingContent = document.querySelector('#booking-content');
const bookingSuccess = document.querySelector('#booking-success');
let sending = false;
let bookingTrigger;
let privacyTrigger;
let requestVersion = 0;

function syncScrollLock() {
  document.body.classList.toggle('scroll-locked', [menu, booking, privacy].some((dialog) => dialog.open));
}

// Native <dialog> provides a focus trap, inert background and Escape dismissal.
[menu, booking, privacy].forEach((dialog) => {
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    if (outside) dialog.close();
  });
  dialog.addEventListener('close', syncScrollLock);
});
menuToggle.addEventListener('click', () => {
  menu.showModal();
  menuToggle.setAttribute('aria-expanded', 'true');
  syncScrollLock();
});
document.querySelector('[data-close-menu]').addEventListener('click', () => menu.close());
menu.addEventListener('close', () => {
  menuToggle.setAttribute('aria-expanded', 'false');
});
menu.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener('click', () => menu.close()));
window.matchMedia('(min-width: 900px)').addEventListener('change', (event) => {
  if (event.matches && menu.open) menu.close();
});

function clearErrors() {
  formError.textContent = '';
  [nameInput, phoneInput].forEach((input) => {
    input.removeAttribute('aria-invalid');
    document.getElementById(`${input.id}-error`).textContent = '';
  });
  consentInput.removeAttribute('aria-invalid');
}

function openBooking(service, trigger) {
  if (menu.open) menu.close();
  bookingTrigger = trigger;
  form.reset();
  clearErrors();
  serviceInput.value = service;
  bookingContent.hidden = false;
  bookingSuccess.hidden = true;
  booking.setAttribute('aria-labelledby', 'modal-title');
  submitButton.disabled = false;
  submitButton.innerHTML = 'Подтвердить запись <svg class="icon" aria-hidden="true"><use href="#arrow"/></svg>';
  sending = false;
  requestVersion += 1;
  booking.showModal();
  syncScrollLock();
  nameInput.focus({ preventScroll: true });
}

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-book]');
  if (trigger) openBooking(trigger.dataset.book, trigger);
  if (event.target.closest('[data-close-booking]')) booking.close();
  const privacyButton = event.target.closest('[data-privacy]');
  if (privacyButton) {
    privacyTrigger = privacyButton;
    privacy.showModal();
    syncScrollLock();
  }
  if (event.target.closest('[data-close-privacy]')) privacy.close();
});
booking.addEventListener('close', () => {
  if (bookingTrigger?.isConnected) bookingTrigger.focus({ preventScroll: true });
});
privacy.addEventListener('close', () => {
  if (privacyTrigger?.isConnected) privacyTrigger.focus({ preventScroll: true });
});

function nationalDigits(value) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('7') || digits.startsWith('8')) digits = digits.slice(1);
  return digits.slice(0, 10);
}
function maskPhone(digits) {
  if (!digits) return '';
  let result = `+7 (${digits.slice(0, 3)}`;
  if (digits.length >= 3) result += ') ';
  if (digits.length > 3) result += digits.slice(3, 6);
  if (digits.length > 6) result += `-${digits.slice(6, 8)}`;
  if (digits.length > 8) result += `-${digits.slice(8, 10)}`;
  return result;
}
function attachPhoneMask(phoneInput) {
  phoneInput.addEventListener('input', () => {
    const raw = phoneInput.value;
    const caret = phoneInput.selectionStart ?? raw.length;
    const digitsBefore = raw.slice(0, caret).replace(/\D/g, '').length;
    const formatted = maskPhone(nationalDigits(raw));
    phoneInput.value = formatted;
    // Preserve editing position when a user changes the middle of the number.
    let position = formatted.length;
    if (caret < raw.length) {
      let count = 0;
      for (let index = 0; index < formatted.length; index += 1) {
        if (/\d/.test(formatted[index])) count += 1;
        if (count === digitsBefore) { position = index + 1; break; }
      }
    }
    phoneInput.setSelectionRange(position, position);
  });
  phoneInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Backspace' || phoneInput.selectionStart !== phoneInput.selectionEnd) return;
    const caret = phoneInput.selectionStart;
    if (caret > 4 && /[()\s-]/.test(phoneInput.value[caret - 1])) {
      event.preventDefault();
      const before = phoneInput.value.slice(0, caret);
      const after = phoneInput.value.slice(caret);
      const shortened = before.replace(/\d[^\d]*$/, '');
      phoneInput.value = maskPhone(nationalDigits(shortened + after));
      const position = Math.max(4, shortened.length);
      phoneInput.setSelectionRange(position, position);
    }
  });
}
attachPhoneMask(phoneInput);
attachPhoneMask(document.querySelector('#quiz-phone'));

[nameInput, phoneInput].forEach((input) => input.addEventListener('input', () => {
  input.removeAttribute('aria-invalid');
  document.getElementById(`${input.id}-error`).textContent = '';
  formError.textContent = '';
}));
consentInput.addEventListener('change', () => {
  consentInput.removeAttribute('aria-invalid');
  formError.textContent = '';
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (sending) return;
  clearErrors();
  const name = nameInput.value.trim().replace(/\s+/g, ' ');
  const digits = phoneInput.value.replace(/\D/g, '');
  let firstInvalid;
  function invalid(input, message) {
    input.setAttribute('aria-invalid', 'true');
    document.getElementById(`${input.id}-error`).textContent = message;
    firstInvalid ||= input;
  }
  if (!/^[\p{L}\p{M} .’'\-]{2,70}$/u.test(name) || !/\p{L}/u.test(name)) invalid(nameInput, 'Введите имя: от 2 до 70 символов, без цифр.');
  if (!/^7[3489]\d{9}$/.test(digits) || /^(\d)\1{9}$/.test(digits.slice(1))) invalid(phoneInput, 'Укажите корректный номер: +7 (___) ___-__-__.');
  if (!consentInput.checked) {
    consentInput.setAttribute('aria-invalid', 'true');
    formError.textContent = 'Подтвердите согласие на обработку персональных данных.';
    firstInvalid ||= consentInput;
  }
  if (firstInvalid) { firstInvalid.focus(); return; }

  sending = true;
  submitButton.disabled = true;
  submitButton.textContent = 'Отправка…';
  const version = requestVersion;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone: `+${digits}`, service: serviceInput.value, website: form.elements.website.value, consent: true }),
      signal: controller.signal
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.ok !== true) throw new Error('Request failed');
    if (version !== requestVersion) return;
    bookingContent.hidden = true;
    bookingSuccess.hidden = false;
    booking.setAttribute('aria-labelledby', 'success-title');
    if (booking.open) bookingSuccess.focus({ preventScroll: true });
    form.reset();
  } catch {
    if (version !== requestVersion) return;
    formError.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните: +7 (999) 123-45-67.';
  } finally {
    window.clearTimeout(timeout);
    if (version === requestVersion) {
      sending = false;
      submitButton.disabled = false;
      submitButton.innerHTML = 'Подтвердить запись <svg class="icon" aria-hidden="true"><use href="#arrow"/></svg>';
    }
  }
});

document.querySelector('#year').textContent = new Date().getFullYear();

// Quiz answers are held in memory only, and validated again by /api/send.
const quizQuestions = [
  { key: 'task', title: 'Какая задача для вас сейчас актуальна?', options: ['Вылечить зуб / кариес', 'Восстановить зуб / имплантация', 'Красивая улыбка / виниры', 'Профгигиена и отбеливание', 'Просто консультация и осмотр'] },
  { key: 'pain', title: 'Есть ли сейчас острая боль или дискомфорт?', options: ['Да, беспокоит сейчас', 'Иногда реагирует на холодное/горячее', 'Ничего не болит, плановый визит'] },
  { key: 'payment', title: 'Как планируете оплачивать лечение?', options: ['Полная оплата сразу', 'Интересует беспроцентная рассрочка 0%', 'Пока хочу только узнать стоимость'] }
];
const quizForm = document.querySelector('#quiz-form');
const quizOptions = document.querySelector('#quiz-options');
const quizQuestion = document.querySelector('#quiz-question');
const quizBack = document.querySelector('#quiz-back');
const quizNext = document.querySelector('#quiz-next');
const quizError = document.querySelector('#quiz-error');
const quizAnswers = {};
let quizStep = 0;
let quizSending = false;
let quizAdvanceTimer;

function renderQuiz(focus = false) {
  window.clearTimeout(quizAdvanceTimer);
  const final = quizStep === 3;
  document.querySelector('#quiz-step-label').textContent = `Шаг ${quizStep + 1} из 4`;
  document.querySelector('.quiz-progress').setAttribute('aria-valuenow', String(quizStep + 1));
  document.querySelector('#quiz-progress-fill').style.width = `${(quizStep + 1) * 25}%`;
  document.querySelector('#quiz-question-area').hidden = final;
  document.querySelector('#quiz-final').hidden = !final;
  quizBack.disabled = quizStep === 0;
  quizNext.hidden = final;
  document.querySelector('#quiz-navigation-note').hidden = final;
  if (final) {
    if (focus) document.querySelector('#quiz-final-title').focus({ preventScroll: true });
    return;
  }
  const question = quizQuestions[quizStep];
  quizQuestion.textContent = question.title;
  quizOptions.replaceChildren();
  quizOptions.setAttribute('aria-labelledby', 'quiz-question');
  question.options.forEach((option, index) => {
    const label = document.createElement('label');
    label.className = 'quiz-option';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = question.key;
    input.value = option;
    input.checked = quizAnswers[question.key] === option;
    const number = document.createElement('span');
    number.className = 'option-number';
    number.setAttribute('aria-hidden', 'true');
    number.textContent = String(index + 1).padStart(2, '0');
    const text = document.createElement('span');
    text.textContent = option;
    const marker = document.createElement('span');
    marker.className = 'option-marker';
    marker.setAttribute('aria-hidden', 'true');
    label.append(input, number, text, marker);
    quizOptions.append(label);
  });
  quizNext.disabled = !quizAnswers[question.key];
  if (focus) quizQuestion.focus({ preventScroll: true });
}

function advanceQuiz() {
  if (quizStep < 3 && quizAnswers[quizQuestions[quizStep].key]) {
    quizStep += 1;
    renderQuiz(true);
  }
}
quizOptions.addEventListener('change', (event) => {
  const input = event.target;
  if (!input.matches('input[type="radio"]')) return;
  quizAnswers[quizQuestions[quizStep].key] = input.value;
  quizNext.disabled = false;
});
quizOptions.addEventListener('click', (event) => {
  if (!event.target.matches('input[type="radio"]') || event.detail === 0) return;
  // Short delay makes selection visible; keyboard users can choose and press Next.
  window.clearTimeout(quizAdvanceTimer);
  quizAdvanceTimer = window.setTimeout(advanceQuiz, 180);
});
quizNext.addEventListener('click', advanceQuiz);
quizBack.addEventListener('click', () => {
  if (quizStep > 0 && !quizSending) { quizStep -= 1; renderQuiz(true); }
});

const quizInputs = [quizForm.elements.name, quizForm.elements.phone];
quizInputs.forEach((input) => input.addEventListener('input', () => {
  input.removeAttribute('aria-invalid');
  document.getElementById(`${input.id}-error`).textContent = '';
  quizError.textContent = '';
}));
quizForm.elements.consent.addEventListener('change', () => {
  quizForm.elements.consent.removeAttribute('aria-invalid');
  quizError.textContent = '';
});

quizForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (quizSending || quizStep !== 3) return;
  if (!quizQuestions.every((question) => question.options.includes(quizAnswers[question.key]))) {
    quizStep = 0;
    renderQuiz(true);
    return;
  }
  quizError.textContent = '';
  quizInputs.forEach((input) => {
    input.removeAttribute('aria-invalid');
    document.getElementById(`${input.id}-error`).textContent = '';
  });
  quizForm.elements.consent.removeAttribute('aria-invalid');
  const name = quizForm.elements.name.value.trim().replace(/\s+/g, ' ');
  const digits = quizForm.elements.phone.value.replace(/\D/g, '');
  let firstInvalid;
  function markInvalid(input, message) {
    input.setAttribute('aria-invalid', 'true');
    document.getElementById(`${input.id}-error`).textContent = message;
    firstInvalid ||= input;
  }
  if (!/^[\p{L}\p{M} .’'\-]{2,70}$/u.test(name) || !/\p{L}/u.test(name)) markInvalid(quizForm.elements.name, 'Введите имя: от 2 до 70 символов, без цифр.');
  if (!/^7[3489]\d{9}$/.test(digits) || /^(\d)\1{9}$/.test(digits.slice(1))) markInvalid(quizForm.elements.phone, 'Введите корректный номер телефона.');
  if (!quizForm.elements.consent.checked) {
    quizForm.elements.consent.setAttribute('aria-invalid', 'true');
    quizError.textContent = 'Подтвердите согласие на обработку контактов и ответов квиза.';
    firstInvalid ||= quizForm.elements.consent;
  }
  if (firstInvalid) { firstInvalid.focus(); return; }

  const payload = { type: 'quiz', name, phone: `+${digits}`, service: 'Расчёт стоимости и подарок: КТ и план лечения', answers: { ...quizAnswers }, website: quizForm.elements.website.value, consent: true };
  const button = quizForm.querySelector('[type="submit"]');
  const buttonMarkup = button.innerHTML;
  quizSending = true;
  quizBack.disabled = true;
  button.disabled = true;
  button.textContent = 'Отправка…';
  quizForm.setAttribute('aria-busy', 'true');
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch('/api/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: controller.signal });
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.ok !== true) throw new Error('Request failed');
    document.querySelector('#quiz-flow').hidden = true;
    const success = document.querySelector('#quiz-success');
    success.hidden = false;
    success.focus({ preventScroll: true });
    quizForm.reset();
    Object.keys(quizAnswers).forEach((key) => delete quizAnswers[key]);
  } catch {
    quizError.textContent = 'Не удалось отправить расчёт. Ваши ответы сохранены на этой странице. Попробуйте ещё раз или позвоните: +7 (999) 123-45-67.';
  } finally {
    window.clearTimeout(timeout);
    quizSending = false;
    quizBack.disabled = false;
    button.disabled = false;
    button.innerHTML = buttonMarkup;
    quizForm.removeAttribute('aria-busy');
  }
});
document.querySelector('#quiz-restart').addEventListener('click', () => {
  quizStep = 0;
  document.querySelector('#quiz-flow').hidden = false;
  document.querySelector('#quiz-success').hidden = true;
  renderQuiz(true);
});
renderQuiz();

// A native range control supports touch dragging and keyboard arrows/Home/End.
document.querySelectorAll('.comparison-range').forEach((range) => {
  function updateComparison() {
    range.closest('.comparison').style.setProperty('--position', `${range.value}%`);
    range.setAttribute('aria-valuetext', `До ${range.value}%, после ${100 - range.value}%`);
  }
  range.addEventListener('input', updateComparison);
  updateComparison();
});

// Grid track animation also handles answers whose height changes on narrow screens.
document.querySelectorAll('.faq-trigger').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const opening = trigger.getAttribute('aria-expanded') !== 'true';
    document.querySelectorAll('.faq-trigger').forEach((other) => {
      const expanded = other === trigger && opening;
      other.setAttribute('aria-expanded', String(expanded));
      const answer = document.getElementById(other.getAttribute('aria-controls'));
      answer.inert = !expanded;
      answer.setAttribute('aria-hidden', String(!expanded));
    });
  });
});
