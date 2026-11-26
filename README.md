# 🥓 Web de Venta de Jamón Ibérico de Guijuelo (Sobres 100g)

Página web completa, moderna y optimizada para conversión, lista para subir a **Vercel**. Diseñada específicamente para la venta de **sobres de 100g de Jamón de Cebo de Campo 75% Ibérico de Guijuelo (Salamanca)** con modalidad de pago a **contrarrembolso** y notificación automática a tu Gmail mediante API.

---

## 📋 Características Principales

- **Producto Gourmet:** Jamón de Cebo de Campo 75% Ibérico de Guijuelo (Salamanca), **cortado a cuchillo de forma artesanal** por maestros jamoneros en sobres individuales de 100 gramos al vacío.
- **Estructura de Precios y Ofertas:**
  - **Pack 5 Sobres (500g):** 30,00 € (6,00 € / sobre)
  - **Pack 10 Sobres (1 Kg) [MÁS VENDIDO]:** 58,00 € (5,80 € / sobre - ¡Ahorro de 2€!)
- **Envío:** 100% GRATIS con entrega urgente en 24 a 72 horas en península.
- **Forma de Pago:** **Contrarrembolso** (el cliente paga en efectivo al cartero o repartidor al recibir el paquete en su domicilio).
- **Formulario Optimizado:** Solo solicita los campos necesarios para la entrega:
  1. Nombre y apellidos completos
  2. Calle completa, número, piso y puerta
  3. Ciudad o poblado
  4. Provincia
  5. Código postal
  6. Número de teléfono de contacto
  7. Notas adicionales para el repartidor (opcional)
- **Notificación a Gmail por API:** Mediante Vercel Serverless Function (`/api/order.js`) que envía un correo HTML con todos los datos del pedido y un botón directo para contactar al cliente por WhatsApp.
- **100% Legal y Conforme a Normativa Española y Europea:**
  - ✅ Política de Privacidad adaptada al **RGPD** (Reglamento UE 2016/679) y **LOPDGDD** 3/2018.
  - ✅ Aviso Legal conforme a la **LSSI-CE** (Ley 34/2002).
  - ✅ Términos y Condiciones Generales de Compra y condiciones de desistimiento para productos alimentarios perecederos (Art. 103 Ley de Consumidores).
  - ✅ Banner interactivo de Política de Cookies.

---

## 🚀 Cómo Probarlo en Local

El proyecto está diseñado con estándares modernos y **no requiere instalar dependencias pesadas** para probarlo en tu ordenador:

1. Abre una terminal en la carpeta del proyecto:
   ```bash
   npm start
   # o bien: node server.js
   ```
2. Abre tu navegador web en:
   ```
   http://localhost:3000
   ```
3. Podrás probar la web, seleccionar entre los packs de 5 o 10 sobres, y rellenar el formulario.

---

## ☁️ Cómo Desplegar en Vercel (En 2 Minutos)

### Opción 1: Desde la Web de Vercel (Recomendada)
1. Sube esta carpeta a tu cuenta de **GitHub** (o GitLab / Bitbucket).
2. Entra en [vercel.com](https://vercel.com) e inicia sesión.
3. Haz clic en **"Add New..." → "Project"**.
4. Selecciona tu repositorio de GitHub y haz clic en **Deploy**.
5. ¡Listo! Vercel detectará automáticamente la configuración y te proporcionará tu URL pública (ejemplo: `https://jamon-guijuelo.vercel.app`).

### Opción 2: Usando Vercel CLI
Si tienes la herramienta de Vercel instalada en tu terminal:
```bash
vercel
```
Sigue las preguntas en pantalla y el despliegue se completará en segundos.

---

## ✉️ Configurar la API para Recibir los Pedidos en tu Gmail

Para que los pedidos te lleguen al instante a tu correo de Gmail, recomendamos usar **Resend** (la plataforma de envío de emails oficial recomendada por Vercel, que ofrece **3.000 emails gratis al mes**, más que suficiente para miles de pedidos).

### Pasos rápidos con Resend (1 minuto):
1. Regístrate gratis en [resend.com](https://resend.com).
2. Ve al menú **"API Keys"** y pulsa en **"Create API Key"**. Copia la clave generada (empieza por `re_...`).
3. En el panel de tu proyecto en **Vercel**:
   - Ve a **Settings** → **Environment Variables**.
   - Añade las siguientes variables:
     - `RESEND_API_KEY`: tu clave generada en Resend (ej. `re_123456789...`)
     - `NOTIFICATION_EMAIL`: `badreddiinnakhil@gmail.com`
     - `FROM_EMAIL`: `onboarding@resend.dev`
4. Haz clic en **Redeploy** o realiza un nuevo despliegue.

> 💡 **Nota de respaldo:** Incluso si aún no has configurado la clave API, la función del servidor registra todos los pedidos en los logs de Vercel (**Vercel Logs**) con todos los datos del cliente, asegurando que **nunca se pierda ningún pedido**.

---

## 📁 Estructura del Proyecto

```text
├── api/
│   └── order.js            # Función Serverless para procesar pedidos y enviar emails
├── css/
│   └── styles.css          # Estilos gourmet, animaciones shimmer y tarjetas interactivas
├── js/
│   └── main.js             # Lógica interactiva, selector de packs, validación y modal
├── index.html              # Landing page principal con Tailwind CSS y diseño gourmet
├── privacidad.html         # Política de Privacidad (RGPD)
├── aviso-legal.html        # Aviso Legal (LSSI-CE)
├── terminos.html           # Condiciones de Contratación y Devoluciones
├── cookies.html            # Política de Cookies
├── package.json            # Metadatos del proyecto y scripts
├── vercel.json             # Configuración de cabeceras seguras en Vercel
├── server.js               # Servidor local Node.js sin dependencias para previsualización
├── .env.example            # Plantilla de variables de entorno
└── README.md               # Esta guía
```

---

## 🛡️ Aspectos Legales Incluidos

- **Protección de Datos (RGPD):** Formulario con casilla de consentimiento no premarcada y enlace a la política informativa completa.
- **Sin datos de pago sensibles:** Al ser exclusivamente contrarrembolso, no se almacenan tarjetas ni datos bancarios, minimizando la carga de cumplimiento PCI-DSS.
- **Derecho de desistimiento:** Redactado conforme al artículo 103 de la Ley General de Consumidores y Usuarios respecto a productos cárnicos perecederos y cadena de conservación.
# ibericosgourmet
