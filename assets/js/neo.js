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
    const roleColors = {
      Runtime: ['#3a86ff', '#63a8ff'],
      Protocol: ['#4f9cff', '#7cc4ff'],
      Schema: ['#4d8ef0', '#7fa2ff'],
      Container: ['#3d7ad8', '#5fb4ff'],
      IaC: ['#4f73d8', '#7c9aff'],
      Cloud: ['#3e6be0', '#6b8ef5'],
      Data: ['#2d88c9', '#57a8e8'],
      'CI/CD': ['#5f7fd8', '#8dc0ff'],
      Automation: ['#6072bf', '#8ba0e8'],
      Scaler: ['#4873d1', '#56a0df'],
      Packaging: ['#5f77cc', '#80a8ee'],
      default: ['#4a79da', '#6da7f3']
    };
    const techNodes = [
      { id: 'go', label: 'Golang', role: 'Runtime', detail: 'Microservices & concurrency', x: 0.16, y: 0.28, r: 15, shape: 'circle' },
      { id: 'grpc', label: 'gRPC', role: 'Protocol', detail: 'Service-to-service APIs', x: 0.31, y: 0.18, r: 14, shape: 'circle' },
      { id: 'proto', label: 'Protobuf', role: 'Schema', detail: 'Contract-first definitions', x: 0.51, y: 0.16, r: 15, shape: 'circle' },
      { id: 'docker', label: 'Docker', role: 'Container', detail: 'Build and ship images', x: 0.74, y: 0.24, r: 14, shape: 'circle' },
      { id: 'tf', label: 'Terraform', role: 'IaC', detail: 'Provisioning automation', x: 0.84, y: 0.46, r: 15, shape: 'circle' },
      { id: 'aws', label: 'AWS', role: 'Cloud', detail: 'Scalable cloud runtime', x: 0.72, y: 0.68, r: 14, shape: 'circle' },
      { id: 'gcp', label: 'GCP', role: 'Cloud', detail: 'Multi-cloud readiness', x: 0.53, y: 0.81, r: 14, shape: 'circle' },
      { id: 'redis', label: 'Redis', role: 'Data', detail: 'Low-latency caching', x: 0.33, y: 0.82, r: 14, shape: 'circle' },
      { id: 'jenkins', label: 'Jenkins', role: 'CI/CD', detail: 'Pipeline orchestration', x: 0.17, y: 0.68, r: 14, shape: 'circle' },
      { id: 'python', label: 'Python', role: 'Automation', detail: 'Ops tooling and scripts', x: 0.12, y: 0.46, r: 15, shape: 'circle' },
      { id: 'karp', label: 'Karpenter', role: 'Scaler', detail: 'Dynamic cluster autoscaling', x: 0.62, y: 0.57, r: 16, shape: 'circle' },
      { id: 'helm', label: 'Helm', role: 'Packaging', detail: 'Kubernetes release management', x: 0.43, y: 0.38, r: 14, shape: 'circle' }
    ];
    const links = [
      ['go', 'grpc'],
      ['grpc', 'proto'],
      ['proto', 'docker'],
      ['docker', 'tf'],
      ['tf', 'aws'],
      ['aws', 'gcp'],
      ['gcp', 'redis'],
      ['redis', 'jenkins'],
      ['jenkins', 'python'],
      ['python', 'go'],
      ['grpc', 'aws'],
      ['proto', 'redis'],
      ['karp', 'aws'],
      ['helm', 'proto'],
      ['helm', 'docker']
    ];

    let width = 0;
    let height = 0;
    let hoverNode = null;
    let initialized = false;
    let flow = [];
    const core = { x: 0, y: 0 };

    const resize = () => {
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      core.x = width / 2;
      core.y = height / 2;
      techNodes.forEach((n, idx) => {
        n.px = n.x * width;
        n.py = n.y * height;
        n.baseX = n.px;
        n.baseY = n.py;
        n.r = Math.max(20, Math.min(46, n.label.length * 1.58 + 13));
        n.floatA = 4 + (idx % 4) * 1.45;
        n.floatB = 3.4 + ((idx + 2) % 5) * 1.1;
        n.floatSpeed = 0.0025 + (idx % 5) * 0.00045;
        n.phase = (idx / techNodes.length) * Math.PI * 2;
      });
      if (!flow.length) {
        for (let i = 0; i < 20; i += 1) {
          flow.push({ lane: i % links.length, t: Math.random(), speed: 0.0032 + Math.random() * 0.0019 });
        }
      }
    };

    const hideTooltip = () => {
      tooltip.classList.remove('show');
      tooltip.setAttribute('aria-hidden', 'true');
      hoverNode = null;
    };

    const placeTooltip = (node) => {
      const deps = links
        .filter(([a, b]) => a === node.id || b === node.id)
        .map(([a, b]) => {
          const id = a === node.id ? b : a;
          return techNodes.find((n) => n.id === id)?.label || id;
        })
        .slice(0, 3)
        .join(', ');
      tooltip.innerHTML = `<strong>${node.label}</strong>${node.role}<br />${node.detail}<br />Deps: ${deps || 'None'}`;
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
      if (hoverNode !== found) hoverNode = found;
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
          ctx.fillStyle = 'rgba(116, 155, 227, 0.13)';
          ctx.fill();
        }
      }

      for (let i = 0; i < 3; i += 1) {
        const r = 50 + i * 28;
        ctx.beginPath();
        ctx.arc(core.x, core.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(95, 126, 194, ${0.17 - i * 0.04})`;
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }
    };

    const drawLinks = () => {
      links.forEach(([aId, bId]) => {
        const a = techNodes.find((n) => n.id === aId);
        const b = techNodes.find((n) => n.id === bId);
        if (!a || !b) return;
        const d = Math.hypot(a.px - b.px, a.py - b.py);
        const baseAlpha = Math.max(0.08, 1 - d / 220) * 0.3;
        const isHot = hoverNode && (hoverNode === a || hoverNode === b);
        ctx.beginPath();
        ctx.moveTo(a.px, a.py);
        ctx.lineTo(b.px, b.py);
        ctx.strokeStyle = isHot ? 'rgba(140, 206, 255, 0.58)' : `rgba(116, 176, 232, ${baseAlpha * 0.85})`;
        ctx.lineWidth = isHot ? 1.5 : 0.95;
        ctx.stroke();
      });

      flow.forEach((p) => {
        const [aId, bId] = links[p.lane];
        const a = techNodes.find((n) => n.id === aId);
        const b = techNodes.find((n) => n.id === bId);
        if (!a || !b) return;
        p.t += p.speed * 0.45;
        if (p.t > 1) p.t = 0;
        const x = a.px + (b.px - a.px) * p.t;
        const y = a.py + (b.py - a.py) * p.t;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(135, 196, 246, 0.64)';
        ctx.fill();
      });
    };

    const fitNodeLabel = (text, maxWidth, maxFont, minFont) => {
      let font = maxFont;
      while (font > minFont) {
        ctx.font = `600 ${font}px Outfit, sans-serif`;
        if (ctx.measureText(text).width <= maxWidth) return { text, font };
        font -= 0.35;
      }
      ctx.font = `600 ${minFont}px Outfit, sans-serif`;
      if (ctx.measureText(text).width <= maxWidth) return { text, font: minFont };
      let clipped = text;
      while (clipped.length > 3 && ctx.measureText(`${clipped}...`).width > maxWidth) {
        clipped = clipped.slice(0, -1);
      }
      return { text: `${clipped}...`, font: minFont };
    };

    const drawNode = (n, idx) => {
      const pulse = Math.sin((Date.now() / 1100) + idx * 0.63) * 0.8;
      const r = n.r + pulse;
      const active = hoverNode === n;
      const [c1, c2] = roleColors[n.role] || roleColors.default;

      ctx.beginPath();
      ctx.arc(n.px, n.py, r + (active ? 3.5 : 1.6), 0, Math.PI * 2);
      ctx.fillStyle = active ? 'rgba(145, 197, 245, 0.22)' : 'rgba(117, 157, 214, 0.13)';
      ctx.fill();

      const g = ctx.createRadialGradient(n.px - r * 0.3, n.py - r * 0.35, r * 0.3, n.px, n.py, r * 1.1);
      g.addColorStop(0, c2);
      g.addColorStop(1, c1);
      ctx.beginPath();
      ctx.arc(n.px, n.py, r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = active ? 'rgba(236, 247, 255, 0.74)' : 'rgba(214, 233, 255, 0.45)';
      ctx.lineWidth = active ? 1.2 : 0.9;
      ctx.stroke();

      ctx.fillStyle = '#edf8ff';
      const fzMax = Math.max(9.2, Math.min(12.2, r * 0.41));
      const { text: label, font } = fitNodeLabel(n.label, r * 1.62, fzMax, 8.8);
      ctx.font = `600 ${active ? font + 0.25 : font}px Outfit, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, n.px, n.py);
    };

    const tick = () => {
      drawBackdrop();
      const t = performance.now();
      techNodes.forEach((n) => {
        n.phase += n.floatSpeed;
        const driftX = Math.cos(n.phase + t * 0.000085) * n.floatA;
        const driftY = Math.sin(n.phase * 0.92 + t * 0.00007) * n.floatB;
        n.px = n.baseX + driftX;
        n.py = n.baseY + driftY;
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
