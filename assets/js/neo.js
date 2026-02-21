(function () {
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const sectionIds = ['top', 'about', 'certificates', 'extra-certs'];

  const activateNav = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activateNav(entry.target.id);
        }
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );

  sectionIds.forEach((id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });

  const lightbox = document.getElementById('lightbox');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxLogo = document.getElementById('lightbox-logo');
  const lightboxDetail = document.getElementById('lightbox-detail');
  const lightboxClose = document.querySelector('.lightbox-close');
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item, .extra-cert-item'));

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.src = '';
    if (lightboxLogo) lightboxLogo.src = '';
  };

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      lightboxTitle.textContent = item.dataset.title || 'Certificate';
      lightboxImage.src = item.dataset.img;
      lightboxImage.alt = item.dataset.title || 'Certificate';
      if (lightboxLogo) {
        lightboxLogo.src = item.dataset.logo || '';
        lightboxLogo.alt = `${item.dataset.title || 'Certificate'} provider logo`;
      }
      if (lightboxDetail) {
        lightboxDetail.textContent = item.dataset.detail || 'Credential details are available through the linked badge provider.';
      }
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeLightbox();
  });

  const extraCertGrid = document.getElementById('extra-cert-grid');
  const extraPrev = document.querySelector('.cert-nav.prev');
  const extraNext = document.querySelector('.cert-nav.next');
  let flowRaf = null;
  let flowVelocity = 0;

  const stopFlow = () => {
    flowVelocity = 0;
    if (flowRaf) {
      cancelAnimationFrame(flowRaf);
      flowRaf = null;
    }
  };

  const runFlow = () => {
    if (!extraCertGrid) return;
    extraCertGrid.scrollLeft += flowVelocity;
    flowRaf = requestAnimationFrame(runFlow);
  };

  const startFlow = (dir) => {
    if (!extraCertGrid) return;
    flowVelocity = dir * 3.6;
    if (!flowRaf) runFlow();
  };

  if (extraPrev && extraNext) {
    const bindFlowControls = (el, dir) => {
      el.addEventListener('mousedown', () => startFlow(dir));
      el.addEventListener('mouseup', stopFlow);
      el.addEventListener('mouseleave', stopFlow);
      el.addEventListener('touchstart', () => startFlow(dir), { passive: true });
      el.addEventListener('touchend', stopFlow);
      el.addEventListener('click', () => {
        if (!extraCertGrid) return;
        extraCertGrid.scrollBy({ left: dir * 220, behavior: 'smooth' });
      });
    };

    bindFlowControls(extraPrev, -1);
    bindFlowControls(extraNext, 1);
  }

  const initTechCluster = () => {
    const canvas = document.getElementById('tech-cluster-canvas');
    const wrap = document.querySelector('.tech-cluster-map');
    const tooltip = document.getElementById('tech-tooltip');
    if (!canvas || !wrap || !tooltip) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const techNodes = [
      { label: 'Golang', detail: 'Microservices & concurrency', x: 0.17, y: 0.2, vx: 15, vy: -12, r: 22, hue: 206 },
      { label: 'gRPC', detail: 'Service-to-service APIs', x: 0.36, y: 0.14, vx: -11, vy: 17, r: 19, hue: 198 },
      { label: 'Protocol Buffers', detail: 'Contract-first schemas', x: 0.58, y: 0.13, vx: 13, vy: 14, r: 23, hue: 212 },
      { label: 'Docker', detail: 'Containerized delivery', x: 0.81, y: 0.22, vx: -13, vy: 10, r: 20, hue: 192 },
      { label: 'Terraform', detail: 'Infrastructure automation', x: 0.84, y: 0.46, vx: 14, vy: -15, r: 22, hue: 222 },
      { label: 'AWS', detail: 'Cloud-native runtime', x: 0.73, y: 0.7, vx: -16, vy: -8, r: 18, hue: 189 },
      { label: 'GCP', detail: 'Multi-cloud capability', x: 0.54, y: 0.83, vx: 12, vy: -14, r: 18, hue: 201 },
      { label: 'Redis', detail: 'Low-latency data layer', x: 0.34, y: 0.84, vx: -10, vy: -16, r: 19, hue: 214 },
      { label: 'Jenkins', detail: 'CI/CD orchestration', x: 0.15, y: 0.68, vx: 12, vy: 15, r: 20, hue: 200 },
      { label: 'Python', detail: 'Automation & tooling', x: 0.12, y: 0.44, vx: -13, vy: 12, r: 18, hue: 208 }
    ];
    const links = [
      [0, 1], [1, 2], [2, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 0], [1, 5], [2, 7]
    ];

    let width = 0;
    let height = 0;
    let lastTs = 0;
    let hoverNode = null;
    let initialized = false;
    const core = { x: 0, y: 0, r: 60 };

    const resize = () => {
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      core.x = width / 2;
      core.y = height / 2;
      techNodes.forEach((n) => {
        n.px = n.x * width;
        n.py = n.y * height;
      });
    };

    const hideTooltip = () => {
      tooltip.classList.remove('show');
      tooltip.setAttribute('aria-hidden', 'true');
      hoverNode = null;
    };

    const placeTooltip = (node) => {
      tooltip.innerHTML = `<strong>${node.label}</strong>${node.detail}`;
      const x = node.px;
      const y = node.py;
      tooltip.style.left = `${Math.max(8, Math.min(width - 210, x + 12))}px`;
      tooltip.style.top = `${Math.max(8, y - 46)}px`;
      tooltip.classList.add('show');
      tooltip.setAttribute('aria-hidden', 'false');
    };

    const hitNode = (mx, my) => {
      for (let i = techNodes.length - 1; i >= 0; i -= 1) {
        const n = techNodes[i];
        if (Math.hypot(mx - n.px, my - n.py) <= n.r + 3) return n;
      }
      return null;
    };

    wrap.addEventListener('mousemove', (event) => {
      const rect = wrap.getBoundingClientRect();
      const mx = event.clientX - rect.left;
      const my = event.clientY - rect.top;
      const found = hitNode(mx, my);
      hoverNode = found;
      if (found) placeTooltip(found);
      else hideTooltip();
    });
    wrap.addEventListener('mouseleave', hideTooltip);

    const drawBackdrop = () => {
      ctx.clearRect(0, 0, width, height);
      for (let y = 16; y < height; y += 28) {
        const offset = Math.floor(y / 28) % 2 ? 10 : 0;
        for (let x = 14; x < width; x += 24) {
          ctx.beginPath();
          ctx.arc(x + offset, y, 1.15, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(122, 174, 255, 0.14)';
          ctx.fill();
        }
      }
    };

    const drawLinks = () => {
      links.forEach(([aIdx, bIdx]) => {
        const a = techNodes[aIdx];
        const b = techNodes[bIdx];
        const d = Math.hypot(a.px - b.px, a.py - b.py);
        const baseAlpha = Math.max(0.08, 1 - d / 220) * 0.3;
        const isHot = hoverNode && (hoverNode === a || hoverNode === b);
        ctx.beginPath();
        ctx.moveTo(a.px, a.py);
        ctx.lineTo(b.px, b.py);
        ctx.strokeStyle = isHot ? 'rgba(122, 206, 255, 0.72)' : `rgba(122, 206, 255, ${baseAlpha})`;
        ctx.lineWidth = isHot ? 1.8 : 1.05;
        ctx.stroke();
      });
    };

    const drawNode = (n, idx) => {
      const pulse = Math.sin((Date.now() / 540) + idx) * 1.2;
      const r = n.r + pulse;
      const active = hoverNode === n;
      const grad = ctx.createRadialGradient(n.px - r * 0.35, n.py - r * 0.35, r * 0.16, n.px, n.py, r);
      grad.addColorStop(0, `hsla(${n.hue}, 94%, 76%, 0.95)`);
      grad.addColorStop(1, `hsla(${n.hue}, 72%, 45%, 0.93)`);

      ctx.beginPath();
      ctx.arc(n.px, n.py, r + (active ? 4 : 1.4), 0, Math.PI * 2);
      ctx.fillStyle = active ? 'rgba(122, 206, 255, 0.22)' : 'rgba(122, 206, 255, 0.1)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(n.px, n.py, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(219, 241, 255, 0.45)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#edf8ff';
      ctx.font = `${active ? 11 : 10}px Outfit, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.label, n.px, n.py);
    };

    const tick = (ts) => {
      const dt = Math.min((ts - (lastTs || ts)) / 1000, 0.03);
      lastTs = ts;
      drawBackdrop();

      techNodes.forEach((n) => {
        n.px += n.vx * dt;
        n.py += n.vy * dt;
        n.vx *= 0.9986;
        n.vy *= 0.9986;

        const dx = n.px - core.x;
        const dy = n.py - core.y;
        const d = Math.hypot(dx, dy) || 0.001;
        const minCore = n.r + core.r + 6;
        if (d < minCore) {
          const nx = dx / d;
          const ny = dy / d;
          n.px = core.x + nx * minCore;
          n.py = core.y + ny * minCore;
          const dot = n.vx * nx + n.vy * ny;
          if (dot < 0) {
            n.vx -= 1.8 * dot * nx;
            n.vy -= 1.8 * dot * ny;
          }
        }

        if (n.px - n.r < 8) {
          n.px = n.r + 8;
          n.vx = Math.abs(n.vx);
        } else if (n.px + n.r > width - 8) {
          n.px = width - n.r - 8;
          n.vx = -Math.abs(n.vx);
        }

        if (n.py - n.r < 8) {
          n.py = n.r + 8;
          n.vy = Math.abs(n.vy);
        } else if (n.py + n.r > height - 8) {
          n.py = height - n.r - 8;
          n.vy = -Math.abs(n.vy);
        }
      });

      drawLinks();
      techNodes.forEach(drawNode);

      if (!initialized) {
        wrap.classList.add('tech-ready');
        initialized = true;
      }
      requestAnimationFrame(tick);
    };

    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(tick);
  };

  initTechCluster();

  const canvas = document.getElementById('bg-particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;
  const pointer = { x: 0, y: 0, active: false };

  const nodes = [];
  const flowLines = [];
  const hexes = [];
  const NODE_COUNT = 95;
  const FLOW_LINE_COUNT = 34;

  const makeHexGrid = () => {
    hexes.length = 0;
    const size = 38;
    const xStep = size * 1.6;
    const yStep = Math.sqrt(3) * size * 0.5;

    for (let y = -yStep; y < height + yStep; y += yStep) {
      const offset = Math.floor(y / yStep) % 2 === 0 ? 0 : xStep / 2;
      for (let x = -xStep; x < width + xStep; x += xStep) {
        hexes.push({ x: x + offset, y, size: size * 0.38 });
      }
    }
  };

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (!nodes.length) {
      for (let i = 0; i < NODE_COUNT; i += 1) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.8 + 0.7,
          type: Math.random() > 0.75 ? 'pod' : 'node'
        });
      }
    }

    if (!flowLines.length) {
      for (let i = 0; i < FLOW_LINE_COUNT; i += 1) {
        flowLines.push({
          x: Math.random() * width,
          y: Math.random() * height,
          len: Math.random() * 170 + 70,
          speed: Math.random() * 0.7 + 0.2,
          angle: Math.random() * Math.PI * 2,
          thickness: Math.random() * 0.9 + 0.7
        });
      }
    }

    makeHexGrid();
  };

  const drawHex = (x, y, size) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI / 3) * i;
      const px = x + size * Math.cos(angle);
      const py = y + size * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  };

  const tick = () => {
    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(80, 140, 220, 0.09)';
    ctx.lineWidth = 1;
    for (const h of hexes) drawHex(h.x, h.y, h.size);

    for (const line of flowLines) {
      const driftX = Math.cos(line.angle) * line.speed;
      const driftY = Math.sin(line.angle) * line.speed;
      line.x += driftX;
      line.y += driftY;

      if (line.x > width + 100) line.x = -100;
      if (line.x < -100) line.x = width + 100;
      if (line.y > height + 100) line.y = -100;
      if (line.y < -100) line.y = height + 100;

      const endX = line.x + Math.cos(line.angle) * line.len;
      const endY = line.y + Math.sin(line.angle) * line.len;
      const grad = ctx.createLinearGradient(line.x, line.y, endX, endY);
      grad.addColorStop(0, 'rgba(93, 227, 194, 0)');
      grad.addColorStop(0.5, 'rgba(93, 227, 194, 0.33)');
      grad.addColorStop(1, 'rgba(112, 184, 255, 0)');

      ctx.beginPath();
      ctx.moveTo(line.x, line.y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = line.thickness;
      ctx.stroke();
    }

    for (const n of nodes) {
      if (pointer.active) {
        const dx = pointer.x - n.x;
        const dy = pointer.y - n.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < 150) {
          n.vx -= (dx / dist) * 0.015;
          n.vy -= (dy / dist) * 0.015;
        }
      }

      n.x += n.vx;
      n.y += n.vy;
      n.vx *= 0.995;
      n.vy *= 0.995;

      if (n.x < -15) n.x = width + 15;
      if (n.x > width + 15) n.x = -15;
      if (n.y < -15) n.y = height + 15;
      if (n.y > height + 15) n.y = -15;

      if (n.type === 'pod') {
        ctx.beginPath();
        ctx.rect(n.x - 2.5, n.y - 2.5, 5, 5);
        ctx.fillStyle = 'rgba(93, 227, 194, 0.82)';
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(124, 182, 255, 0.72)';
        ctx.fill();
      }
    }

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.hypot(dx, dy);

        if (d < 145) {
          const alpha = (1 - d / 145) * 0.28;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(116, 199, 255, ${alpha})`;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(tick);
  };

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  });
  window.addEventListener('mouseleave', () => {
    pointer.active = false;
  });

  resize();
  tick();
})();
