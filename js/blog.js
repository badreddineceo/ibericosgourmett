// js/blog.js - Interactividad, barra de lectura, filtros y calculadoras del Blog Guijuelo Selección

document.addEventListener('DOMContentLoaded', () => {
  // 1. Barra de progreso de lectura (en artículos)
  const progressBar = document.getElementById('reading-progress');
  if (progressBar) {
    const updateProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      progressBar.style.width = `${pct}%`;
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // 2. Buscador y filtros de categoría en /blog
  const filterButtons = document.querySelectorAll('.blog-filter-btn');
  const searchInput = document.getElementById('blog-search');
  const blogCards = document.querySelectorAll('.blog-card');
  const emptyState = document.getElementById('blog-empty');
  const countLabel = document.getElementById('blog-count');

  if (blogCards.length > 0) {
    let activeCategory = 'all';

    const applyFilters = () => {
      const query = (searchInput?.value || '').trim().toLowerCase();
      let visibleCount = 0;

      blogCards.forEach((card) => {
        const cardCat = (card.dataset.category || '').toLowerCase();
        const cardText = (card.dataset.search || card.textContent || '').toLowerCase();
        const matchesCategory = activeCategory === 'all' || cardCat === activeCategory;
        const matchesQuery = !query || cardText.includes(query);

        if (matchesCategory && matchesQuery) {
          card.classList.remove('hidden');
          visibleCount += 1;
        } else {
          card.classList.add('hidden');
        }
      });

      if (countLabel) {
        countLabel.textContent = `${visibleCount} ${visibleCount === 1 ? 'guía disponible' : 'guías disponibles'}`;
      }
      if (emptyState) {
        emptyState.classList.toggle('hidden', visibleCount > 0);
      }
    };

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        activeCategory = btn.dataset.filter || 'all';
        filterButtons.forEach((b) => {
          b.classList.remove('bg-wine-800', 'text-white', 'border-wine-800');
          b.classList.add('bg-white', 'text-stone-700', 'border-stone-200');
        });
        btn.classList.remove('bg-white', 'text-stone-700', 'border-stone-200');
        btn.classList.add('bg-wine-800', 'text-white', 'border-wine-800');
        applyFilters();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }
  }

  // 3. Calculadora de Raciones y Sobres (Artículo 6)
  const guestsRange = document.getElementById('calc-guests');
  const occasionSelect = document.getElementById('calc-occasion');
  if (guestsRange && occasionSelect) {
    const guestsVal = document.getElementById('calc-guests-val');
    const totalGramsEl = document.getElementById('calc-grams');
    const totalSobresEl = document.getElementById('calc-sobres');
    const recPackEl = document.getElementById('calc-pack-rec');
    const recCtaEl = document.getElementById('calc-pack-cta');

    const calculateRations = () => {
      const guests = parseInt(guestsRange.value, 10) || 6;
      const gramsPerPerson = parseInt(occasionSelect.value, 10) || 65;
      const totalGrams = guests * gramsPerPerson;
      const sobres = Math.max(1, Math.ceil(totalGrams / 100));

      if (guestsVal) guestsVal.textContent = `${guests} personas`;
      if (totalGramsEl) totalGramsEl.textContent = `${totalGrams} g`;
      if (totalSobresEl) totalSobresEl.textContent = `${sobres} ${sobres === 1 ? 'sobre' : 'sobres'} de 100g`;

      if (sobres <= 5) {
        if (recPackEl) {
          recPackEl.innerHTML = 'Te recomendamos el <strong>Pack Degustación (5 Sobres · 30€)</strong>: cubres tu reunión y los sobres que sobren aguantan 6 meses en nevera.';
        }
        if (recCtaEl) {
          recCtaEl.href = '/?pack=pack-5#formulario-pedido';
          recCtaEl.textContent = 'Pedir Pack 5 Sobres (30€ Contrarrembolso) →';
        }
      } else {
        if (recPackEl) {
          recPackEl.innerHTML = 'Te recomendamos el <strong>Pack Gourmet Familiar (10 Sobres · 58€)</strong>: 1 Kg neto cortado a cuchillo, te ahorras 2€ y aseguras que nadie se quede sin repetir.';
        }
        if (recCtaEl) {
          recCtaEl.href = '/?pack=pack-10#formulario-pedido';
          recCtaEl.textContent = 'Pedir Pack 10 Sobres (58€ Contrarrembolso) →';
        }
      }
    };

    guestsRange.addEventListener('input', calculateRations);
    occasionSelect.addEventListener('change', calculateRations);
    calculateRations();
  }

  // 4. Calculadora Real de Pata Entera vs Sobres 100g (Artículo 4)
  const legPriceInput = document.getElementById('leg-price');
  const legWeightInput = document.getElementById('leg-weight');
  if (legPriceInput && legWeightInput) {
    const legCleanKgEl = document.getElementById('leg-clean-kg');
    const legRealPerKgEl = document.getElementById('leg-real-kg');
    const legWasteKgEl = document.getElementById('leg-waste-kg');

    const calcProfitability = () => {
      const price = Math.max(50, parseFloat(legPriceInput.value) || 190);
      const weight = Math.max(5, Math.min(11, parseFloat(legWeightInput.value) || 7.5));
      // Rendimiento medio real de una pata ibérica bien cortada: ~42% aprovechable (el 58% es hueso, pezuña, corteza y grasa sobrante)
      const cleanKg = weight * 0.42;
      const wasteKg = weight - cleanKg;
      const realPerKg = price / cleanKg;

      if (legCleanKgEl) legCleanKgEl.textContent = `${cleanKg.toFixed(2)} kg limpios`;
      if (legWasteKgEl) legWasteKgEl.textContent = `${wasteKg.toFixed(2)} kg de hueso y merma`;
      if (legRealPerKgEl) legRealPerKgEl.textContent = `${realPerKg.toFixed(2)} € / kg limpio`;
    };

    legPriceInput.addEventListener('input', calcProfitability);
    legWeightInput.addEventListener('input', calcProfitability);
    calcProfitability();
  }
});
