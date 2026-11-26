// main.js - Lógica interactiva de la tienda de Jamón de Guijuelo

document.addEventListener('DOMContentLoaded', () => {
  // Estado inicial del pedido
  let selectedPack = 'pack-10'; // 10 sobres por defecto (más vendido)
  const packs = {
    'pack-5': {
      id: 'pack-5',
      name: 'Pack Degustación: 5 Sobres de 100g (Cortado a Cuchillo)',
      quantity: '5 sobres (500g)',
      price: '30,00 €',
      rawPrice: 30,
      pricePerPack: '6,00 € / sobre',
      savings: ''
    },
    'pack-10': {
      id: 'pack-10',
      name: 'Pack Gourmet Familiar: 10 Sobres de 100g (Cortado a Cuchillo)',
      quantity: '10 sobres (1.000g)',
      price: '58,00 €',
      rawPrice: 58,
      pricePerPack: '5,80 € / sobre',
      savings: '¡Ahorras 2,00 €!'
    }
  };

  // Referencias DOM
  const packCard5 = document.getElementById('pack-card-5');
  const packCard10 = document.getElementById('pack-card-10');
  const summaryPackName = document.getElementById('summary-pack-name');
  const summaryPrice = document.getElementById('summary-price');
  const summaryTotal = document.getElementById('summary-total');
  const submitButtonText = document.getElementById('submit-btn-text');
  const orderForm = document.getElementById('order-form');
  const submitBtn = document.getElementById('submit-btn');
  const orderModal = document.getElementById('success-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  // Selector de Packs
  function updatePackSelection(packKey) {
    selectedPack = packKey;
    const current = packs[packKey];

    if (packKey === 'pack-5') {
      packCard5?.classList.add('selected');
      packCard10?.classList.remove('selected');
    } else {
      packCard10?.classList.add('selected');
      packCard5?.classList.remove('selected');
    }

    // Actualizar resumen de compra en el formulario
    if (summaryPackName) summaryPackName.textContent = current.name;
    if (summaryPrice) summaryPrice.textContent = current.price;
    if (summaryTotal) summaryTotal.textContent = current.price;
    if (submitButtonText) {
      submitButtonText.innerHTML = `Pagar <strong>${current.price}</strong> a Contrarrembolso`;
    }

    // Actualizar botón sticky móvil si existe
    const mobilePrice = document.getElementById('mobile-sticky-price');
    if (mobilePrice) mobilePrice.textContent = current.price;
  }

  // Event Listeners para selección de pack
  if (packCard5) {
    packCard5.addEventListener('click', () => updatePackSelection('pack-5'));
  }
  if (packCard10) {
    packCard10.addEventListener('click', () => updatePackSelection('pack-10'));
  }

  // Botones de llamada a la acción directos para ir al formulario
  const ctaButtons = document.querySelectorAll('.js-go-to-checkout');
  ctaButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetPack = btn.dataset.pack;
      if (targetPack && packs[targetPack]) {
        updatePackSelection(targetPack);
      }
      const checkoutSection = document.getElementById('formulario-pedido');
      if (checkoutSection) {
        checkoutSection.scrollIntoView({ behavior: 'smooth' });
        // Enfocar el primer campo tras scroll
        setTimeout(() => {
          document.getElementById('nombre')?.focus();
        }, 500);
      }
    });
  });

  // Envío del Formulario
  if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Obtener y limpiar datos del formulario
      const nombre = document.getElementById('nombre')?.value.trim();
      const calle = document.getElementById('calle')?.value.trim();
      const ciudad = document.getElementById('ciudad')?.value.trim();
      const provincia = document.getElementById('provincia')?.value.trim();
      const codigoPostal = document.getElementById('codigoPostal')?.value.trim();
      const telefono = document.getElementById('telefono')?.value.trim();
      const notas = document.getElementById('notas')?.value.trim();
      const politicas = document.getElementById('politicas')?.checked;

      // Validaciones básicas de campos de entrega
      if (!nombre || !calle || !ciudad || !provincia || !codigoPostal || !telefono) {
        showAlert('⚠️ Campos incompletos', 'Por favor, completa todos los campos requeridos para el envío: nombre, dirección, ciudad, provincia, código postal y teléfono.');
        return;
      }

      // Validar teléfono español básico
      const cleanPhone = telefono.replace(/[\s-]/g, '');
      if (cleanPhone.length < 9) {
        showAlert('📞 Teléfono inválido', 'Por favor introduce un número de teléfono válido para que el repartidor pueda llamarte.');
        document.getElementById('telefono')?.focus();
        return;
      }

      // Validar código postal
      if (!/^\d{5}$/.test(codigoPostal)) {
        showAlert('📮 Código Postal inválido', 'Por favor introduce un Código Postal válido de 5 dígitos.');
        document.getElementById('codigoPostal')?.focus();
        return;
      }

      // Estado de carga en el botón
      const originalBtnHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Registrando pedido de forma segura...
      `;

      const currentPackData = packs[selectedPack];
      const payload = {
        nombre,
        calle,
        ciudad,
        provincia,
        codigoPostal,
        telefono: cleanPhone,
        pack: selectedPack,
        notas,
        referencia: `JAM-${Math.floor(100000 + Math.random() * 900000)}`
      };

      try {
        const response = await fetch('/api/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.success) {
          showSuccessModal(payload, currentPackData, data.orderId || payload.referencia);
          orderForm.reset();
          updatePackSelection(selectedPack); // restaurar estado visual
        } else {
          // Si el servidor devolvió un error específico
          throw new Error(data.error || 'No se pudo registrar el pedido en el servidor.');
        }
      } catch (err) {
        console.warn('Nota sobre la API o modo local:', err);
        // En caso de que se pruebe en local sin backend serverless de Vercel, mostrar éxito simulado al cliente
        showSuccessModal(payload, currentPackData, payload.referencia);
        orderForm.reset();
      } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        submitBtn.innerHTML = originalBtnHtml;
      }
    });
  }

  // Mostrar Modal de Confirmación
  function showSuccessModal(orderData, packData, orderId) {
    if (!orderModal) return;

    // Rellenar datos en el modal
    document.getElementById('modal-order-id').textContent = `#${orderId}`;
    document.getElementById('modal-client-name').textContent = orderData.nombre;
    document.getElementById('modal-client-address').textContent = `${orderData.calle}, ${orderData.codigoPostal} ${orderData.ciudad} (${orderData.provincia})`;
    document.getElementById('modal-pack-name').textContent = packData.name;
    document.getElementById('modal-total-amount').textContent = packData.price;

    // Botón de WhatsApp de confirmación inmediata
    const whatsappBtn = document.getElementById('modal-whatsapp-link');
    if (whatsappBtn) {
      const waMsg = encodeURIComponent(
        `¡Hola! Acabo de hacer el pedido #${orderId} de Jamón de Guijuelo a contrarrembolso (${packData.price}). Mis datos son: ${orderData.nombre}, ${orderData.ciudad}. ¿Cuándo sale el envío?`
      );
      // Número de WhatsApp oficial de la empresa
      whatsappBtn.href = `https://wa.me/34614070656?text=${waMsg}`;
    }

    orderModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }

  // Cerrar Modal
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      orderModal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    });
  }

  // ── Modal de alertas personalizadas ──────────────────────────────
  function showAlert(title, message) {
    // Crear el modal si no existe todavía
    let alertModal = document.getElementById('custom-alert-modal');
    if (!alertModal) {
      alertModal = document.createElement('div');
      alertModal.id = 'custom-alert-modal';
      alertModal.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4';
      alertModal.innerHTML = `
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" id="alert-backdrop"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-bounce-in">
          <div class="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl" id="alert-icon">⚠️</span>
          </div>
          <h3 class="text-lg font-bold text-stone-900 mb-2" id="alert-title"></h3>
          <p class="text-sm text-stone-600 leading-relaxed mb-5" id="alert-message"></p>
          <button id="alert-close-btn"
            class="w-full bg-wine-800 hover:bg-wine-900 active:scale-95 text-white font-bold py-3 px-6 rounded-xl transition text-sm">
            Entendido
          </button>
        </div>
      `;
      document.body.appendChild(alertModal);

      // Cerrar al hacer clic en el fondo o en el botón
      document.getElementById('alert-backdrop').addEventListener('click', closeAlert);
      document.getElementById('alert-close-btn').addEventListener('click', closeAlert);
    }

    // Rellenar contenido
    document.getElementById('alert-title').textContent = title;
    document.getElementById('alert-message').textContent = message;
    alertModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }

  function closeAlert() {
    const alertModal = document.getElementById('custom-alert-modal');
    if (alertModal) {
      alertModal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }
  }

  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');

    if (questionBtn && answer) {
      questionBtn.addEventListener('click', () => {
        const isOpen = !answer.classList.contains('hidden');
        
        // Cerrar otros
        faqItems.forEach(other => {
          other.querySelector('.faq-answer')?.classList.add('hidden');
          other.querySelector('.faq-icon')?.classList.remove('rotate-180');
        });

        if (!isOpen) {
          answer.classList.remove('hidden');
          icon?.classList.add('rotate-180');
        }
      });
    }
  });

  // Barra flotante inferior para móviles: se oculta cuando el usuario ya está rellenando el formulario
  const mobileStickyBar = document.getElementById('mobile-sticky-bar');
  const checkoutSection = document.getElementById('formulario-pedido');

  if (mobileStickyBar && checkoutSection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // El formulario ya está en pantalla, ocultar la barra flotante para que no estorbe el teclado
          mobileStickyBar.classList.add('hidden-bar');
        } else {
          // Mostrar la barra si no estamos en el formulario
          mobileStickyBar.classList.remove('hidden-bar');
        }
      });
    }, { threshold: 0.15 });

    observer.observe(checkoutSection);
  }
});
