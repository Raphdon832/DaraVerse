import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, "dist");
const distIndexPath = path.join(distDir, "index.html");
const pwaDir = path.join(distDir, "pwa");
const manifestPath = path.join(distDir, "manifest.webmanifest");
const serviceWorkerPath = path.join(distDir, "service-worker.js");

function assertExists(targetPath, label) {
  if (!fs.existsSync(targetPath)) {
    throw new Error(`${label} not found at: ${targetPath}`);
  }
}

function pickFirstExisting(paths) {
  for (const candidate of paths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function readPngSize(filePath) {
  const file = fs.readFileSync(filePath);
  if (file.length < 24) {
    throw new Error(`Invalid PNG (too small): ${filePath}`);
  }
  const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < pngSignature.length; i += 1) {
    if (file[i] !== pngSignature[i]) {
      throw new Error(`Invalid PNG signature: ${filePath}`);
    }
  }
  const width = file.readUInt32BE(16);
  const height = file.readUInt32BE(20);
  return `${width}x${height}`;
}

function injectIntoHead(html, snippet, marker) {
  if (html.includes(marker)) {
    return html;
  }
  return html.replace("</head>", `  ${snippet}\n</head>`);
}

function injectIntoBody(html, snippet, marker) {
  if (html.includes(marker)) {
    return html;
  }
  return html.replace("</body>", `  ${snippet}\n</body>`);
}

function writeManifest({ appName, shortName, description, iconMeta, maskableMeta }) {
  const manifest = {
    name: appName,
    short_name: shortName,
    description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#E6F4FE",
    lang: "en-US",
    icons: [
      {
        src: "/pwa/icon.png",
        sizes: iconMeta.sizes,
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa/icon-maskable.png",
        sizes: maskableMeta.sizes,
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };

  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

function writeServiceWorker() {
  const workerSource = `const CACHE_NAME = "daraverse-pwa-v1";
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/pwa/icon.png",
  "/pwa/icon-maskable.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match("/index.html")) || cache.match("/");
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(request).then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return response;
      });
    })
  );
});
`;

  fs.writeFileSync(serviceWorkerPath, workerSource, "utf8");
}

function main() {
  assertExists(distDir, "dist directory");
  assertExists(distIndexPath, "dist/index.html");

  const appName = "Daraverse";
  const shortName = "Daraverse";
  const description = "Interactive STEM, missions, mentorship, and projects for learners.";

  const iconSource = pickFirstExisting([
    path.join(projectRoot, "assets", "icon.png"),
    path.join(projectRoot, "assets", "favicon.png"),
  ]);
  const maskableSource = pickFirstExisting([
    path.join(projectRoot, "assets", "android-icon-foreground.png"),
    path.join(projectRoot, "assets", "icon.png"),
  ]);

  if (!iconSource || !maskableSource) {
    throw new Error("Unable to find required icon assets for PWA generation.");
  }

  fs.mkdirSync(pwaDir, { recursive: true });

  const iconOutput = path.join(pwaDir, "icon.png");
  const maskableOutput = path.join(pwaDir, "icon-maskable.png");
  fs.copyFileSync(iconSource, iconOutput);
  fs.copyFileSync(maskableSource, maskableOutput);

  const iconMeta = { sizes: readPngSize(iconOutput) };
  const maskableMeta = { sizes: readPngSize(maskableOutput) };

  writeManifest({ appName, shortName, description, iconMeta, maskableMeta });
  writeServiceWorker();

  let html = fs.readFileSync(distIndexPath, "utf8");

  html = injectIntoHead(
    html,
    '<meta name="theme-color" content="#E6F4FE" />',
    'name="theme-color"'
  );
  html = injectIntoHead(
    html,
    '<meta name="mobile-web-app-capable" content="yes" />',
    'name="mobile-web-app-capable"'
  );
  html = injectIntoHead(
    html,
    '<meta name="apple-mobile-web-app-capable" content="yes" />',
    'name="apple-mobile-web-app-capable"'
  );
  html = injectIntoHead(
    html,
    `<meta name="apple-mobile-web-app-title" content="${appName}" />`,
    'name="apple-mobile-web-app-title"'
  );
  html = injectIntoHead(
    html,
    '<meta name="apple-mobile-web-app-status-bar-style" content="default" />',
    'name="apple-mobile-web-app-status-bar-style"'
  );
  html = injectIntoHead(
    html,
    '<link rel="manifest" href="/manifest.webmanifest" />',
    'rel="manifest"'
  );
  html = injectIntoHead(
    html,
    '<link rel="apple-touch-icon" href="/pwa/icon.png" />',
    'rel="apple-touch-icon"'
  );

  html = injectIntoBody(
    html,
    `<script>
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", function () {
          navigator.serviceWorker.register("/service-worker.js").catch(function () {});
        });
      }
    </script>`,
    "service-worker.js"
  );

  fs.writeFileSync(distIndexPath, html, "utf8");
  console.log("PWA post-processing complete.");
}

main();
