/**
 * Vymetrix Digital Engine - Client Interactivity Script
 */

document.addEventListener("DOMContentLoaded", () => {
  // Core System Setup
  initializeHeroCanvas();
  initializePulseEngine();
  initializeBlueprintEstimator();
  initializeContactForm();
  initializeScrollAnimationFallback();
  initialize3DTilt();
  initializeSubdomainModals();
});

/* ==========================================================================
   1. HERO CANVAS GENERATIVE GRAPHIC
   ========================================================================== */
function initializeHeroCanvas() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = (canvas.width = canvas.offsetWidth);
  let height = (canvas.height = canvas.offsetHeight);

  // Resize listener
  window.addEventListener("resize", () => {
    width = (canvas.width = canvas.offsetWidth);
    height = (canvas.height = canvas.offsetHeight);
  });

  // Particle Node parameters
  const nodes = [];
  const totalNodes = 25;
  let mouse = { x: null, y: null, active: false };

  // Initialize nodes
  for (let i = 0; i < totalNodes; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
    });
  }

  // Mouse interactivity track
  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });

  canvas.addEventListener("mouseleave", () => {
    mouse.active = false;
  });

  // Render loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw grid background
    ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Update and draw nodes
    nodes.forEach((node) => {
      node.x += node.vx;
      node.y += node.vy;

      // Wall bounce
      if (node.x < 0 || node.x > width) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;

      // Mouse pull
      if (mouse.active) {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          node.x += (dx / dist) * 0.5;
          node.y += (dy / dist) * 0.5;
        }
      }

      // Draw particle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 245, 212, 0.6)";
      ctx.fill();
    });

    // Draw connections (lines between close nodes)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 80) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          // Opacity based on proximity
          const opacity = (1 - dist / 80) * 0.15;
          ctx.strokeStyle = `rgba(114, 9, 183, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      
      // Connection to mouse
      if (mouse.active) {
        const dx = mouse.x - nodes[i].x;
        const dy = mouse.y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(nodes[i].x, nodes[i].y);
          const opacity = (1 - dist / 90) * 0.25;
          ctx.strokeStyle = `rgba(0, 245, 212, ${opacity})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   2. INTERACTIVE PULSE ENGINE SIMULATION
   ========================================================================== */
function initializePulseEngine() {
  const ttfbSlider = document.getElementById("slider-ttfb");
  const semanticSlider = document.getElementById("slider-semantic");
  const inpSlider = document.getElementById("slider-inp");

  const valTtfb = document.getElementById("val-ttfb");
  const valSemantic = document.getElementById("val-semantic");
  const valInp = document.getElementById("val-inp");

  const valScore = document.getElementById("val-score");
  const valRetained = document.getElementById("val-retained");
  const valCitations = document.getElementById("val-citations");
  const valLh = document.getElementById("val-lh");

  const btnChartAi = document.getElementById("btn-chart-ai");
  const btnChartSpeed = document.getElementById("btn-chart-speed");

  if (!ttfbSlider) return;

  let activeChartMode = "ai"; // "ai" or "speed"

  // Live calculator
  function recalculateMetrics() {
    const ttfb = parseInt(ttfbSlider.value);
    const semantic = parseInt(semanticSlider.value);
    const inp = parseInt(inpSlider.value);

    // Update slider label readings
    valTtfb.textContent = `${ttfb}ms`;
    valSemantic.textContent = `${semantic}%`;
    valInp.textContent = `${inp}ms`;

    // 1. Lighthouse Score (Heavy dependency on TTFB and INP)
    const ttfbScore = Math.max(0, 100 - (ttfb - 50) / 10); // 50ms = 100, 1050ms = 0
    const inpScore = Math.max(0, 100 - (inp - 10) / 4);    // 10ms = 100, 410ms = 0
    const lhScore = Math.round(ttfbScore * 0.6 + inpScore * 0.4);
    valLh.textContent = lhScore;

    // 2. AI Citation Rate (Strongly driven by Semantic Density, slightly affected by TTFB speed)
    const citationRate = ((semantic / 100) * 1.5 + (ttfbScore / 100) * 0.5).toFixed(1);
    valCitations.textContent = `${citationRate}x`;

    // 3. Retained Traffic (Driven by speed and low INP delays)
    const speedPenalty = Math.max(0, (ttfb - 100) / 30); // scale bounce
    const delayPenalty = Math.max(0, (inp - 100) / 10);
    const retentionRate = Math.round(Math.min(99, Math.max(12, 98 - speedPenalty - delayPenalty)));
    valRetained.textContent = `${retentionRate}%`;

    // 4. Cumulative Pulse Engine Score
    const pulseScore = Math.round((lhScore * 0.4) + (semantic * 0.3) + (retentionRate * 0.3));
    valScore.textContent = pulseScore;

    // Update color styles depending on score tier
    if (pulseScore >= 90) {
      valScore.className = "c-green";
    } else if (pulseScore >= 60) {
      valScore.className = "c-orange";
    } else {
      valScore.className = "c-purple"; // Represents warning/fail in this system
    }

    // Redraw SVG Chart based on current score
    updateDashboardChart(pulseScore, activeChartMode);
  }

  // Event Listeners for sliders
  [ttfbSlider, semanticSlider, inpSlider].forEach((slider) => {
    slider.addEventListener("input", recalculateMetrics);
  });

  // Chart Mode Toggles
  btnChartAi.addEventListener("click", () => {
    activeChartMode = "ai";
    btnChartAi.classList.add("active");
    btnChartAi.setAttribute("aria-pressed", "true");
    btnChartSpeed.classList.remove("active");
    btnChartSpeed.setAttribute("aria-pressed", "false");
    recalculateMetrics();
  });

  btnChartSpeed.addEventListener("click", () => {
    activeChartMode = "speed";
    btnChartSpeed.classList.add("active");
    btnChartSpeed.setAttribute("aria-pressed", "true");
    btnChartAi.classList.remove("active");
    btnChartAi.setAttribute("aria-pressed", "false");
    recalculateMetrics();
  });

  // SVG Chart path update logic
  function updateDashboardChart(score, mode) {
    const path = document.getElementById("chart-path");
    const area = document.getElementById("chart-area");
    const node = document.getElementById("chart-pulse-node");
    const ring = document.getElementById("chart-pulse-ring");

    if (!path || !area) return;

    // Normalize coordinates based on score scale
    // SVG height goes from 0 (top) to 200 (bottom). Active range is 20 to 170.
    const scorePct = score / 100;
    
    // We adjust the final coordinates based on current score percentage
    let endY, midY1, midY2;

    if (mode === "ai") {
      // AI Visibility goes upwards from 170 (zero) to top value (score-dependent)
      endY = 170 - (130 * scorePct); // maps 0%-100% to Y=170-40
      midY1 = 170 - (40 * scorePct);
      midY2 = 170 - (90 * scorePct);

      // SVG path construction
      const pathD = `M 40,170 C 120,${midY1} 280,${midY2} 480,${endY}`;
      const areaD = `${pathD} L 480,170 L 40,170 Z`;
      
      path.setAttribute("d", pathD);
      area.setAttribute("d", areaD);
      path.setAttribute("stroke", "var(--color-primary)");
      area.setAttribute("fill", "url(#chart-glow)");
      node.setAttribute("fill", "var(--color-primary)");
      ring.setAttribute("stroke", "var(--color-primary)");
    } else {
      // Speed Index curve (representing latency decrease)
      // High score means lower latency, which is a curve dropping closer to 170
      endY = 40 + (110 * scorePct); // maps 0%-100% to Y=40-150 (lower curve means faster load)
      midY1 = 80 + (50 * scorePct);
      midY2 = 60 + (80 * scorePct);

      const pathD = `M 40,30 C 150,${midY1} 300,${midY2} 480,${endY}`;
      const areaD = `${pathD} L 480,170 L 40,170 Z`;

      path.setAttribute("d", pathD);
      area.setAttribute("d", areaD);
      path.setAttribute("stroke", "var(--color-secondary)");
      area.setAttribute("fill", "url(#chart-glow-alt)");
      node.setAttribute("fill", "var(--color-secondary)");
      ring.setAttribute("stroke", "var(--color-secondary)");
    }

    // Position node and ring on the end coordinate
    node.setAttribute("cx", 480);
    node.setAttribute("cy", endY);
    ring.setAttribute("cx", 480);
    ring.setAttribute("cy", endY);
  }

  // Initial calculation
  recalculateMetrics();
}

/* ==========================================================================
   3. BLUEPRINT PROJECT COST ESTIMATOR
   ========================================================================== */
function initializeBlueprintEstimator() {
  const pagesSlider = document.getElementById("slider-pages");
  const valPages = document.getElementById("val-pages");

  const optAi = document.getElementById("opt-ai");
  const optAnimation = document.getElementById("opt-animation");
  const optSpeed = document.getElementById("opt-speed");
  const selectMainDomain = document.getElementById("select-main-domain");
  const valDomainFee = document.getElementById("val-domain-fee");

  const estSpeed = document.getElementById("est-speed");
  const estBounce = document.getElementById("est-bounce");
  const estPrice = document.getElementById("est-price");

  if (!pagesSlider) return;

  function calculateEstimate() {
    const pages = parseInt(pagesSlider.value);
    valPages.textContent = `${pages} ${pages === 1 ? 'Page' : 'Pages'}`;

    // Domain charges selection
    const domainCost = parseInt(selectMainDomain.value);
    valDomainFee.textContent = `₹${domainCost.toLocaleString('en-IN')}`;

    // Base pricing parameters: ₹2,000 / page + domain charges
    let basePrice = (pages * 2000) + domainCost;
    let totalPrice = basePrice;

    // Feature addon costs and speed simulations
    let lcpTarget = 450; // ms
    let bounceDecrease = 12; // %

    if (optAi.checked) {
      totalPrice += 25000; // App Development Integration
      lcpTarget += 20; 
      bounceDecrease += 8;
    }

    if (optAnimation.checked) {
      totalPrice += 15000; // Custom Water Bottles branding module
      lcpTarget += 30; 
      bounceDecrease += 6;
    }

    if (optSpeed.checked) {
      totalPrice += 30000; // AquaGo routing API optimization
      lcpTarget -= 120; 
      bounceDecrease += 5;
    }

    // Format output targets
    estSpeed.textContent = `< ${lcpTarget}ms`;
    estBounce.textContent = `-${bounceDecrease}%`;
    estPrice.innerHTML = `₹${totalPrice.toLocaleString('en-IN')} <span class="pricing-frequency">/ project</span>`;
  }

  // Bind change events
  pagesSlider.addEventListener("input", calculateEstimate);
  selectMainDomain.addEventListener("change", calculateEstimate);
  [optAi, optAnimation, optSpeed].forEach((checkbox) => {
    checkbox.addEventListener("change", calculateEstimate);
  });

  // Run initial estimate
  calculateEstimate();
}

/* ==========================================================================
   4. CONTACT FORM TRANSMISSION LOGIC
   ========================================================================== */
function initializeContactForm() {
  const form = document.getElementById("contact-form");
  const successScreen = document.getElementById("form-success");
  const submitBtn = document.getElementById("form-submit-btn");
  const resetBtn = document.getElementById("btn-form-reset");

  if (!form) return;

  // Manual elements for validation
  const nameInput = document.getElementById("contact-name");
  const emailInput = document.getElementById("contact-email");
  const msgInput = document.getElementById("contact-msg");

  const errName = document.getElementById("err-name");
  const errEmail = document.getElementById("err-email");
  const errMsg = document.getElementById("err-msg");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Reset error visuals
    let isValid = true;
    [nameInput, emailInput, msgInput].forEach(inp => {
      inp.classList.remove("invalid");
    });

    // Manual validation checks
    if (!nameInput.value.trim()) {
      nameInput.classList.add("invalid");
      isValid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailInput.value.trim())) {
      emailInput.classList.add("invalid");
      isValid = false;
    }

    if (!msgInput.value.trim()) {
      msgInput.classList.add("invalid");
      isValid = false;
    }

    if (!isValid) return;

    // Simulate API Payload dispatch
    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span>Transmitting Node...</span>`;

    setTimeout(() => {
      // Hide form, show Success animation
      form.style.display = "none";
      successScreen.style.display = "block";
      
      // Clean inputs
      nameInput.value = "";
      emailInput.value = "";
      msgInput.value = "";
      
      // Reset button
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }, 1800);
  });

  // Reset success screen to form
  resetBtn.addEventListener("click", () => {
    successScreen.style.display = "none";
    form.style.display = "block";
  });
}

/* ==========================================================================
   5. CROSS-BROWSER SCROLL ANIMATION FALLBACK
   ========================================================================== */
function initializeScrollAnimationFallback() {
  // Test if native CSS view() timeline is supported
  const supportsCSSScrollTimeline = CSS.supports('(animation-timeline: view()) and (animation-range: entry)');
  
  if (!supportsCSSScrollTimeline) {
    const scrollRevealElements = document.querySelectorAll(".scroll-reveal");
    
    // Set fallback initial states
    scrollRevealElements.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(30px)";
      el.style.transition = "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)";
    });

    // Setup IntersectionObserver
    const observerOptions = {
      root: null, // Viewport
      rootMargin: "0px 0px -10% 0px", // Trigger when 10% from bottom
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, self) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          // Stop observing once visible
          self.unobserve(entry.target);
        }
      });
    }, observerOptions);

    scrollRevealElements.forEach((el) => {
      observer.observe(el);
    });
  }
}

/* ==========================================================================
   6. DYNAMIC 3D TILT EFFECT FOR CARDS
   ========================================================================== */
function initialize3DTilt() {
  const tiltCards = document.querySelectorAll(".tilt-card-3d");
  
  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // Mouse X inside element
      const y = e.clientY - rect.top;  // Mouse Y inside element
      
      const width = rect.width;
      const height = rect.height;
      
      // Calculate cursor position relative to element center (-0.5 to 0.5)
      const relativeX = (x / width) - 0.5;
      const relativeY = (y / height) - 0.5;
      
      // Maximum tilt rotation degrees (X is rotated by vertical movement, Y by horizontal)
      const maxTilt = 10;
      const rotateX = (-relativeY * maxTilt).toFixed(2);
      const rotateY = (relativeX * maxTilt).toFixed(2);
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    card.addEventListener("mouseleave", () => {
      // Smooth reset to origin
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    });
  });
}

/* ==========================================================================
   7. SUBDOMAIN OVERLAYS & SIMULATION LOGIC
   ========================================================================== */
function initializeSubdomainModals() {
  // Modal toggle mappings
  const triggers = [
    { btnClass: ".btn-open-subdomain-app", modalId: "modal-subdomain-app" },
    { btnClass: ".btn-open-subdomain-bottles", modalId: "modal-subdomain-bottles" },
    { btnClass: ".btn-open-subdomain-aquago", modalId: "modal-subdomain-aquago" }
  ];

  triggers.forEach((trigger) => {
    const btns = document.querySelectorAll(trigger.btnClass);
    const modal = document.getElementById(trigger.modalId);
    if (!modal) return;

    btns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
      });
    });

    // Close on red dot or outside click
    const closeBtn = modal.querySelector(".btn-close-modal");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        closeModal(modal);
      });
    }

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  function closeModal(modal) {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  }

  // --- A. APP DEVELOPMENT MODAL CALCULATION ---
  const subAppType = document.getElementById("sub-app-type");
  const subAppPages = document.getElementById("sub-app-pages");
  const subAppPagesVal = document.getElementById("sub-app-pages-val");
  const subAppDomain = document.getElementById("sub-app-domain");
  const subAppRateLabel = document.getElementById("sub-app-rate-label");
  const subAppPricePages = document.getElementById("sub-app-price-pages");
  const subAppPriceDomain = document.getElementById("sub-app-price-domain");
  const subAppPriceTotal = document.getElementById("sub-app-price-total");
  const subAppSubmit = document.getElementById("sub-app-submit-btn");

  if (subAppPages) {
    function calculateAppModalPrice() {
      const pages = parseInt(subAppPages.value);
      const domainVal = parseInt(subAppDomain.value);
      const type = subAppType ? subAppType.value : "web";
      
      let perPageRate = 2000;
      if (type === "mobile") {
        perPageRate = 3500;
      } else if (type === "hybrid") {
        perPageRate = 5000;
      }
      
      subAppPagesVal.textContent = `${pages} ${pages === 1 ? 'Page' : 'Pages'}`;
      if (subAppRateLabel) {
        subAppRateLabel.textContent = `₹${perPageRate.toLocaleString('en-IN')}`;
      }
      
      const pageCost = pages * perPageRate;
      subAppPricePages.textContent = `₹${pageCost.toLocaleString('en-IN')}`;
      subAppPriceDomain.textContent = `₹${domainVal.toLocaleString('en-IN')}`;
      
      const total = pageCost + domainVal;
      subAppPriceTotal.textContent = `₹${total.toLocaleString('en-IN')}`;
    }

    if (subAppType) {
      subAppType.addEventListener("change", calculateAppModalPrice);
    }
    subAppPages.addEventListener("input", calculateAppModalPrice);
    subAppDomain.addEventListener("change", calculateAppModalPrice);
    calculateAppModalPrice();

    subAppSubmit.addEventListener("click", () => {
      subAppSubmit.disabled = true;
      subAppSubmit.textContent = "Transmitting Brief...";
      setTimeout(() => {
        alert("Project requirements submitted successfully to Aditya (Product Desk)!");
        subAppSubmit.disabled = false;
        subAppSubmit.textContent = "Submit Project Brief";
        closeModal(document.getElementById("modal-subdomain-app"));
      }, 1500);
    });
  }

  // --- B. CUSTOMISED BOTTLES MODAL CALCULATION ---
  const bottleMaterial = document.getElementById("sub-bottle-material");
  const bottlePrinting = document.getElementById("sub-bottle-printing");
  const bottleQty = document.getElementById("sub-bottle-qty");
  
  const priceBase = document.getElementById("sub-bottle-price-base");
  const priceBrand = document.getElementById("sub-bottle-price-brand");
  const priceDiscount = document.getElementById("sub-bottle-price-discount");
  const unitFinal = document.getElementById("sub-bottle-unit-final");
  const priceTotal = document.getElementById("sub-bottle-price-total");
  const bottleSubmit = document.getElementById("sub-bottle-submit-btn");

  if (bottleMaterial) {
    function calculateBottleModalPrice() {
      const base = parseInt(bottleMaterial.value);
      const brand = parseInt(bottlePrinting.value);
      let qty = parseInt(bottleQty.value);

      if (isNaN(qty) || qty < 50) {
        qty = 50;
      }

      // Discount tier: 100+ units (10%), 500+ units (20%)
      let discountPct = 0;
      let discountText = "0%";
      if (qty >= 500) {
        discountPct = 0.2;
        discountText = "20% (Volume)";
      } else if (qty >= 100) {
        discountPct = 0.1;
        discountText = "10% (Volume)";
      }

      const unitPrice = (base + brand) * (1 - discountPct);
      const total = unitPrice * qty;

      priceBase.textContent = `₹${base}`;
      priceBrand.textContent = `₹${brand}`;
      priceDiscount.textContent = discountText;
      unitFinal.textContent = `₹${unitPrice.toFixed(2)}`;
      priceTotal.textContent = `₹${Math.round(total).toLocaleString('en-IN')}`;
    }

    [bottleMaterial, bottlePrinting].forEach(elem => elem.addEventListener("change", calculateBottleModalPrice));
    bottleQty.addEventListener("input", calculateBottleModalPrice);
    calculateBottleModalPrice();

    bottleSubmit.addEventListener("click", () => {
      bottleSubmit.disabled = true;
      bottleSubmit.textContent = "Processing Order...";
      setTimeout(() => {
        alert("Wholesale order payload compiled and forwarded to Pruthviraj (Operations Desk)!");
        bottleSubmit.disabled = false;
        bottleSubmit.textContent = "Place Bulk Order";
        closeModal(document.getElementById("modal-subdomain-bottles"));
      }, 1500);
    });
  }

  // --- C. AQUAGO REGISTRATION MODAL ---
  const aquagoSubmit = document.getElementById("sub-aquago-submit-btn");
  const aquagoForm = document.getElementById("sub-aquago-reg-form");
  const aquagoSuccess = document.getElementById("sub-aquago-success-panel");
  const aquagoRegId = document.getElementById("aquago-reg-id");
  const aquagoReset = document.getElementById("btn-aquago-reg-reset");

  if (aquagoSubmit) {
    aquagoSubmit.addEventListener("click", () => {
      const role = document.getElementById("aquago-role").value;
      const name = document.getElementById("aquago-name").value.trim();
      const phone = document.getElementById("aquago-phone").value.trim();
      const address = document.getElementById("aquago-address").value.trim();

      if (!name || !phone || !address) {
        alert("Please complete all registration parameters.");
        return;
      }

      // Generate random registration ID
      const randomId = "REG-AQ-" + Math.floor(1000 + Math.random() * 9000);
      aquagoRegId.textContent = randomId;

      // Update success text depending on role
      const descElements = aquagoSuccess.querySelectorAll(".success-desc");
      if (descElements.length > 1) {
        if (role === "supplier") {
          descElements[1].textContent = "We will verify your Kolhapur supply fleet parameters and activate your vendor portal registration shortly.";
        } else {
          descElements[1].textContent = "We will verify your Kolhapur delivery route and dispatch your first smart water can delivery batch shortly.";
        }
      }

      aquagoForm.style.display = "none";
      aquagoSuccess.style.display = "block";
    });

    aquagoReset.addEventListener("click", () => {
      document.getElementById("aquago-name").value = "";
      document.getElementById("aquago-phone").value = "";
      document.getElementById("aquago-address").value = "";
      
      aquagoSuccess.style.display = "none";
      aquagoForm.style.display = "block";
    });
  }
}


