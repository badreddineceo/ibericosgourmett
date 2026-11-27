// server.js - Servidor de Aplicación en Node.js
// Compatible con Express.js y con Node.js nativo (HTTP/FS)

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import orderHandler from './api/order.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// Cargar variables de entorno de .env si existe
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...values] = trimmed.split('=');
      if (key && values.length > 0) {
        let val = values.join('=').trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key.trim()] = val;
      }
    }
  });
}

// Intentar arrancar con Express.js si está instalado en node_modules
async function startServer() {
  let useExpress = false;
  let app = null;

  try {
    const expressModule = await import('express');
    const express = expressModule.default;
    const corsModule = await import('cors');
    const cors = corsModule.default;

    app = express();
    useExpress = true;

    // Middlewares en Node / Express
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Servir archivos estáticos
    app.use('/css', express.static(path.join(__dirname, 'css')));
    app.use('/js', express.static(path.join(__dirname, 'js')));
    app.use('/images', express.static(path.join(__dirname, 'public/images')));
    app.use('/images', express.static(path.join(__dirname, 'images')));
    app.use('/public', express.static(path.join(__dirname, 'public')));

    // Rutas SEO raíz
    app.get('/sitemap.xml', (req, res) => {
      res.type('application/xml').sendFile(path.join(__dirname, 'sitemap.xml'));
    });
    app.get('/robots.txt', (req, res) => {
      res.type('text/plain').sendFile(path.join(__dirname, 'robots.txt'));
    });

    // Rutas de páginas web
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'index.html'));
    });

    app.get('/blog', (req, res) => {
      res.sendFile(path.join(__dirname, 'blog', 'index.html'));
    });

    app.get('/blog/:slug', (req, res) => {
      const slug = req.params.slug.replace(/\.html$/, '');
      const articlePath = path.join(__dirname, 'blog', `${slug}.html`);
      if (fs.existsSync(articlePath)) {
        return res.sendFile(articlePath);
      }
      return res.status(404).sendFile(path.join(__dirname, 'blog', 'index.html'));
    });

    app.get('/privacidad', (req, res) => {
      res.sendFile(path.join(__dirname, 'privacidad.html'));
    });

    app.get('/aviso-legal', (req, res) => {
      res.sendFile(path.join(__dirname, 'aviso-legal.html'));
    });

    app.get('/terminos', (req, res) => {
      res.sendFile(path.join(__dirname, 'terminos.html'));
    });

    app.get('/cookies', (req, res) => {
      res.sendFile(path.join(__dirname, 'cookies.html'));
    });

    // Endpoint de comprobación de salud en Node.js
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'online',
        server: 'Node.js con Express',
        nodeVersion: process.version,
        time: new Date().toISOString()
      });
    });

    // Endpoint de procesamiento de pedidos (API en Node.js)
    app.post('/api/order', async (req, res) => {
      await orderHandler(req, res);
    });

    // Manejo de 404
    app.use((req, res) => {
      res.status(404).sendFile(path.join(__dirname, 'index.html'));
    });

    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🥓 Servidor Node.js (Express) activo en: http://localhost:${PORT}`);
      console.log(`⚡ Entorno: Node ${process.version}`);
      console.log(`📦 Listo para recibir pedidos a contrarrembolso`);
      console.log(`======================================================\n`);
    });

  } catch (err) {
    // Si express aún no está instalado localmente, arrancar con el servidor Node.js nativo (Zero-Dependencies)
    const MIME_TYPES = {
      '.html': 'text/html; charset=UTF-8',
      '.css': 'text/css; charset=UTF-8',
      '.js': 'text/javascript; charset=UTF-8',
      '.json': 'application/json',
      '.xml': 'application/xml; charset=UTF-8',
      '.txt': 'text/plain; charset=UTF-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };

    const nativeServer = http.createServer((req, res) => {
      const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
      let pathname = parsedUrl.pathname;

      // API Health check en Node nativo
      if (pathname === '/api/health' && req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          status: 'online',
          server: 'Node.js HTTP Nativo',
          nodeVersion: process.version,
          time: new Date().toISOString()
        }));
        return;
      }

      // Endpoint API de pedidos
      if (pathname === '/api/order') {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', async () => {
            try {
              req.body = body ? JSON.parse(body) : {};
            } catch (e) {
              req.body = {};
            }

            // Helpers compatibles con Vercel / Express
            res.status = (statusCode) => {
              res.statusCode = statusCode;
              return res;
            };
            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return res;
            };

            await orderHandler(req, res);
          });
          return;
        } else if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.statusCode = 200;
          res.end();
          return;
        }
      }

      // Mapear rutas limpias a archivos HTML (archivos .html o directorios con index.html)
      if (pathname === '/' || pathname === '') {
        pathname = '/index.html';
      } else {
        const cleanPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
        if (!path.extname(cleanPath)) {
          if (fs.existsSync(path.join(__dirname, `${cleanPath}.html`))) {
            pathname = `${cleanPath}.html`;
          } else if (fs.existsSync(path.join(__dirname, cleanPath, 'index.html'))) {
            pathname = path.join(cleanPath, 'index.html');
          }
        }
      }

      // Resolver /images/... desde public/images si no existe en ./images
      let filePath = path.join(__dirname, pathname);
      if (pathname.startsWith('/images/') && !fs.existsSync(filePath)) {
        const publicImgPath = path.join(__dirname, 'public', pathname);
        if (fs.existsSync(publicImgPath)) {
          filePath = publicImgPath;
        }
      }
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(filePath, (error, content) => {
        if (error) {
          if (error.code === 'ENOENT') {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/html; charset=UTF-8');
            res.end(`<h1>404 - No Encontrado</h1><p><a href="/">Volver a la portada</a></p>`);
          } else {
            res.statusCode = 500;
            res.end(`Error: ${error.code}`);
          }
        } else {
          res.statusCode = 200;
          res.setHeader('Content-Type', contentType);
          res.end(content);
        }
      });
    });

    nativeServer.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🥓 Servidor Node.js activo en: http://localhost:${PORT}`);
      console.log(`⚡ Entorno: Node ${process.version} (Módulos nativos HTTP/FS)`);
      console.log(`💡 Nota: Puedes ejecutar 'npm install' para habilitar Express.`);
      console.log(`📦 Listo para recibir pedidos a contrarrembolso`);
      console.log(`======================================================\n`);
    });
  }
}

startServer();
