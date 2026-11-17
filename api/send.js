'use strict';

// Vercel Node.js Function. No external dependencies or client-side credentials.
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Допускается только POST-запрос.' });
  }

  const contentType = req.headers['content-type'] || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return res.status(415).json({ ok: false, error: 'Ожидается JSON.' });
  }

  let body = req.body;
  try {
    if (typeof body === 'string' || Buffer.isBuffer(body)) {
      if (Buffer.byteLength(body) > 4096) return res.status(413).json({ ok: false, error: 'Запрос слишком большой.' });
      body = JSON.parse(body.toString());
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid body');
    if (Buffer.byteLength(JSON.stringify(body)) > 4096) return res.status(413).json({ ok: false, error: 'Запрос слишком большой.' });
  } catch {
    return res.status(400).json({ ok: false, error: 'Некорректный запрос.' });
  }

  // Give spam bots the same response as a real successful request.
  if (body.website) return res.status(200).json({ ok: true });

  const { name, phone, service, consent } = body;
  const cleanName = typeof name === 'string' ? name.trim().replace(/\s+/g, ' ') : '';
  const cleanService = typeof service === 'string' ? service.trim() : '';
  const digits = typeof phone === 'string' ? phone.replace(/\D/g, '') : '';
  if (!/^[\p{L}\p{M} .’'\-]{2,70}$/u.test(cleanName) || !/\p{L}/u.test(cleanName) ||
      typeof phone !== 'string' || phone.length > 30 || !/^[+\d\s()\-]+$/.test(phone) ||
      !/^7[3489]\d{9}$/.test(digits) || /^([0-9])\1{9}$/.test(digits.slice(1)) ||
      !cleanService || cleanService.length > 160 || /[\r\n\x00-\x1F]/.test(cleanService) || consent !== true) {
    return res.status(400).json({ ok: false, error: 'Проверьте имя, телефон и согласие на обработку данных.' });
  }

  // Only predefined quiz answers are accepted; free-form medical details are not collected.
  const quizOptions = {
    task: ['Вылечить зуб / кариес', 'Восстановить зуб / имплантация', 'Красивая улыбка / виниры', 'Профгигиена и отбеливание', 'Просто консультация и осмотр'],
    pain: ['Да, беспокоит сейчас', 'Иногда реагирует на холодное/горячее', 'Ничего не болит, плановый визит'],
    payment: ['Полная оплата сразу', 'Интересует беспроцентная рассрочка 0%', 'Пока хочу только узнать стоимость']
  };
  const isQuiz = body.type === 'quiz';
  if ((body.type !== undefined && !['booking', 'quiz'].includes(body.type)) ||
      (isQuiz && (!body.answers || typeof body.answers !== 'object' || Array.isArray(body.answers) ||
        Object.keys(body.answers).length !== 3 ||
        !Object.entries(quizOptions).every(([key, options]) => options.includes(body.answers[key])))) ||
      (!isQuiz && body.answers !== undefined)) {
    return res.status(400).json({ ok: false, error: 'Пожалуйста, ответьте на все вопросы расчёта.' });
  }

  const token = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;
  if (!token || !chatId) {
    return res.status(503).json({ ok: false, error: 'Запись временно недоступна. Пожалуйста, позвоните в клинику.' });
  }

  // Telegram HTML escaping prevents markup injection from form fields.
  const escape = (value) => value.replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char]));
  const text = [
    '🦷 <b>Новая заявка · ДентаПро</b>', '',
    `<b>Имя:</b> ${escape(cleanName)}`,
    `<b>Телефон:</b> +${digits}`,
    `<b>Услуга:</b> ${escape(cleanService)}`, '',
    ...(isQuiz ? [
      '<b>📝 Ответы квиза</b>',
      `<b>Задача:</b> ${escape(body.answers.task)}`,
      `<b>Дискомфорт:</b> ${escape(body.answers.pain)}`,
      `<b>Оплата:</b> ${escape(body.answers.payment)}`,
      '<b>Подарок:</b> 3D-снимок КТ и план лечения бесплатно', ''
    ] : []),
    '<i>Согласие на обработку персональных данных получено.</i>'
  ].join('\n');

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      signal: AbortSignal.timeout(10000)
    });
    const result = await response.json();
    if (!response.ok || result.ok !== true) throw new Error('Telegram rejected request');
    return res.status(200).json({ ok: true });
  } catch {
    // Never expose upstream responses, credentials or patient data in logs/errors.
    return res.status(502).json({ ok: false, error: 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.' });
  }
};
