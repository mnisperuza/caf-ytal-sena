(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const year = $('#current-year');
  if (year) year.textContent = new Date().getFullYear();

  // The menu is a navigation disclosure, with native keyboard access to every link.
  const menuButton = $('.menu-toggle');
  const navigation = $('#navegacion');
  const closeMenu = (restoreFocus = false) => {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menú de navegación');
    navigation.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    if (restoreFocus) menuButton.focus();
  };
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    if (!open) return closeMenu();
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', 'Cerrar menú de navegación');
    navigation.classList.add('is-open');
    document.body.classList.add('menu-open');
    navigation.querySelector('a')?.focus();
  });
  navigation?.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-header') && menuButton?.getAttribute('aria-expanded') === 'true') closeMenu();
  });
  window.matchMedia('(min-width: 701px)').addEventListener('change', (event) => {
    if (event.matches) closeMenu();
  });

  // Prepare the request locally. Sending and confirming an order happens in WhatsApp.
  let quantity = 1;
  const maxQuantity = 99;
  const quantityOutput = $('#quantity');
  const less = $('#quantity-less');
  const more = $('#quantity-more');
  const orderLink = $('#order-link');
  const refreshOrder = () => {
    const presentation = $('input[name="presentacion"]:checked')?.value || 'en grano';
    if (quantityOutput) quantityOutput.value = String(quantity);
    if (less) less.disabled = quantity === 1;
    if (more) more.disabled = quantity === maxQuantity;
    const bags = quantity === 1 ? '1 bolsa' : `${quantity} bolsas`;
    const message = `Hola, Café y Tal. Quiero pedir ${bags} de café Castillo ${presentation}. ¿Me cuentan las presentaciones, el precio y el envío?`;
    if (orderLink) orderLink.href = `https://wa.me/573215052745?text=${encodeURIComponent(message)}`;
  };
  less?.addEventListener('click', () => { quantity = Math.max(1, quantity - 1); refreshOrder(); });
  more?.addEventListener('click', () => { quantity = Math.min(maxQuantity, quantity + 1); refreshOrder(); });
  $$('input[name="presentacion"]').forEach((input) => input.addEventListener('change', refreshOrder));
  $('#coffee-order')?.addEventListener('submit', (event) => event.preventDefault());
  refreshOrder();

  const methods = {
    filtrado: {
      tag: 'Para disfrutar sin afán',
      title: ['Baja el ritmo.', 'Sube el aroma.'],
      description: 'Un filtro, agua caliente y un momento para ti. Una forma de explorar los matices de tu café, taza a taza.',
      steps: ['Humedece el filtro y añade tu café molido.', 'Vierte el agua poco a poco, con movimientos suaves.', 'Deja filtrar, sirve y disfruta de los pequeños detalles.'],
      caption: 'Un poco de agua. Un poco de calma.',
      help: 'café filtrado',
      visual: 'ritual-photo'
    },
    espresso: {
      tag: 'Pequeño, intenso, tuyo',
      title: ['Un instante.', 'Mucho carácter.'],
      description: 'Una taza corta y un sabor que se queda. Un ritual para quienes disfrutan el café con intensidad.',
      steps: ['Usa una molienda adecuada para tu máquina de espresso.', 'Distribuye y compacta el café de manera uniforme.', 'Extrae según tu equipo y disfruta recién preparado.'],
      caption: 'Hay instantes que lo dicen todo.',
      help: 'espresso',
      visual: 'ritual-espresso'
    },
    coldbrew: {
      tag: 'Fresco, sin correr',
      title: ['Dale tiempo.', 'Tómalo con calma.'],
      description: 'Un café que se prepara en frío para acompañar otra forma de pausar. Déjalo listo con tiempo y disfrútalo a tu gusto.',
      steps: ['Mezcla café de molienda gruesa con agua fría.', 'Deja infusionar tapado y refrigerado, siguiendo tu receta.', 'Filtra y sirve. Puedes acompañarlo con hielo.'],
      caption: 'Una pausa fresca para cambiar el día.',
      help: 'cold brew',
      visual: 'ritual-coldbrew'
    }
  };
  const tabs = $$('.method-tabs [role="tab"]');
  const setMethod = (tab, moveFocus = false) => {
    const method = methods[tab.dataset.method];
    if (!method) return;
    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    $('#method-panel').setAttribute('aria-labelledby', tab.id);
    $('#method-tag').textContent = method.tag;
    $('#method-title').replaceChildren(document.createTextNode(method.title[0]), document.createElement('br'), document.createTextNode(method.title[1]));
    $('#method-description').textContent = method.description;
    $('#ritual-caption').textContent = method.caption;
    const steps = method.steps.map((copy, i) => {
      const li = document.createElement('li');
      const number = document.createElement('span');
      number.textContent = String(i + 1).padStart(2, '0');
      const p = document.createElement('p');
      p.textContent = copy;
      li.append(number, p);
      return li;
    });
    $('#method-steps').replaceChildren(...steps);
    ['ritual-photo', 'ritual-espresso', 'ritual-coldbrew'].forEach((id) => { $(`#${id}`).hidden = id !== method.visual; });
    $('#method-help').href = `https://wa.me/573215052745?text=${encodeURIComponent(`Hola, ¿me ayudan a elegir la molienda para ${method.help}?`)}`;
    if (moveFocus) tab.focus();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setMethod(tab));
    tab.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      setMethod(tabs[next], true);
    });
  });

  // Progressive enhancement: the content remains visible when scripting is unavailable.
  if ('IntersectionObserver' in window) {
    if (!reducedMotion.matches) {
      document.documentElement.classList.add('motion-ready');
      const reveal = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.07 });
      $$('[data-reveal]').forEach((item) => reveal.observe(item));
      reducedMotion.addEventListener('change', (event) => {
        if (event.matches) document.documentElement.classList.remove('motion-ready');
      });
    }
    const links = $$('.main-nav a');
    const sections = links.map((link) => $(link.getAttribute('href'))).filter(Boolean);
    const activeSection = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          if (link.getAttribute('href') === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });
    sections.forEach((section) => activeSection.observe(section));
  }

  let scrollPending = false;
  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollable)) : 0;
    document.documentElement.style.setProperty('--progress', String(progress));
    scrollPending = false;
  };
  window.addEventListener('scroll', () => {
    if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();
})();
