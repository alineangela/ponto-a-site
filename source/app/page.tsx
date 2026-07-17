"use client";

import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";

export default function Home() {

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { threshold: 0.16 },
    );
    document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <main>
      <PlannerHero />

      <section
        className="frosted-reveal grain"
        onPointerMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          event.currentTarget.style.setProperty("--cursor-x", `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
          event.currentTarget.style.setProperty("--cursor-y", `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
        }}
      >
        <SectionTag index="02" title="Frozen glass" light />
        <div className="frosted-content reveal">
          <p className="eyebrow">PREVIEW</p>
          <h2>Dá uma espiadinha no seu planner</h2>
          <p>É só um spoiler de tuuudo que você consegue fazer com ele.</p>
        </div>
      </section>

      <EmbossedSection />

      <RingsDivider />

      <EmbossedSection inset />

      <NotebookSection />

      <ChatSection />

      <LaptopHotspots />

      <FragmentRain />

      <section className="faq-section" aria-label="Dúvidas frequentes">
        <img className="faq-clip" src="/clip-clean.png" alt="" />
        <div className="faq-paper">
          <div className="faq-heading"><h2>Dúvidas<br /><strong>frequentes</strong></h2></div>
        </div>
      </section>

      <footer><span>LOREM STUDIO</span><span>© 2026</span></footer>
    </main>
  );
}

function SectionTag({ index, title, light = false }: { index: string; title: string; light?: boolean }) {
  return <p className={`section-tag ${light ? "section-tag--light" : ""}`}>{index} / {title}</p>;
}

function RingsDivider() {
  return <div className="rings-divider" aria-hidden="true"><img src="/rings-transparent.png" alt="" /></div>;
}

function PlannerHero() {
  return (
    <section className="planner-hero">
      <SectionTag index="03" title="Hero" light />
      <div className="planner-hero__media" role="img" aria-label="Espaco de trabalho criativo">
        <div className="planner-hero__content">
          <h1>O planner digital de quem vive com várias abas abertas na cabeça e no computador ao mesmo tempo</h1>
          <p>Todas as áreas da sua vida planejadas e organizadas em um espaço seguro que gerencia sua rotina sem julgamentos.</p>
        </div>
      </div>
    </section>
  );
}

function FeatureConversation() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setActive(true);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);
  return (
    <section ref={sectionRef} className={`feature-conversation ${active ? "chat-section--active" : ""}`}>
      <SectionTag index="04" title="Conversa no celular" light />
      <div className="chat-thread feature-messages" aria-label="Conversa de exemplo">
        <div className="chat-bubble"><p>Assim, máximo respeito e admiração por quem consegue lidar com cada área da vida sem apoio da tecnologia...</p><time>10:31</time></div>
        <div className="chat-bubble"><p>Mas a gente surtaria se não tivéssemos esse sistema pra gerenciar TUDO em um só lugar.</p><time>10:35</time></div>
      </div>
      <div className="phone-card feature-phone" aria-label="Mockup de celular"><div className="phone-notch" /></div>
    </section>
  );
}

function StackedPanels() {
  const cards = [
    { tab: "Stay", color: "#9AAFC0", heading: "Lorem ipsum dolor", copy: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed commodo mauris." },
    { tab: "Play", color: "#A7A77B", heading: "Consectetur adipiscing", copy: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam." },
    { tab: "Gather", color: "#F9E79F", heading: "Tempor incididunt", copy: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." },
    { tab: "Dine", color: "#77773C", heading: "Long lunches & late nights", copy: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." },
  ];
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const [assembled, setAssembled] = useState(false);
  const assembledRef = useRef(false);
  useEffect(() => {
    const update = () => {
      if (assembledRef.current) return;
      const section = sectionRef.current;
      if (!section) return;
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / distance));
      const nextVisibleCount = Math.min(cards.length, Math.max(1, Math.floor((progress / 0.72) * cards.length) + 1));
      setVisibleCount(nextVisibleCount);
      setActive(nextVisibleCount - 1);
      if (progress >= 0.78) {
        assembledRef.current = true;
        setAssembled(true);
        setVisibleCount(cards.length);
        setActive(cards.length - 1);
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [cards.length]);
  const selectCard = (index: number) => {
    assembledRef.current = true;
    setAssembled(true);
    setVisibleCount(cards.length);
    setActive(index);
  };
  return (
    <section ref={sectionRef} className={`stacked-section grain ${assembled ? "is-assembled" : "is-assembling"}`}>
      <SectionTag index="05" title="Painéis empilhados" />
      <div className="folder-sticky">
        <div className="folder-stack" aria-label="Arquivo de categorias">
          {cards.map((card, index) => {
            const isVisible = index < visibleCount;
            const isActive = active === index;
            const offset = assembled || visibleCount === cards.length ? (index - active) * 14 : (index - Math.max(0, visibleCount - 1)) * 18;
            return (
              <article
                key={card.tab}
                className={`folder-page ${isVisible ? "is-visible" : ""} ${isActive ? "is-active" : ""}`}
                style={{
                  "--folder-color": card.color,
                  "--tab-index": index,
                  "--page-offset": `${offset}px`,
                  zIndex: isActive ? 20 : 10 + index,
                } as React.CSSProperties}
              >
                <header>
                  <button type="button" onClick={() => selectCard(index)} aria-current={isActive ? "page" : undefined}>
                    {card.tab}
                  </button>
                </header>
                <div className="folder-content">
                  <h2>{card.heading}</h2>
                  <p>{card.copy}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function EmbossedSection({ inset = false }: { inset?: boolean }) {
  return (
    <section className={`embossed-section ${inset ? "embossed-section--inset" : "grain"}`}>
      <SectionTag index={inset ? "07" : "06"} title={inset ? "Embossed pressionado" : "Embossed elevado"} />
      <div className={`embossed-mark ${!inset ? "embossed-mark--life" : ""} reveal`} aria-label={inset ? "Lorem pressionado no papel" : "Planner de vida em relevo"}>{inset ? "LOREM" : "Planner de vida"}</div>
    </section>
  );
}

function NotebookSection() {
  return (
    <section className="notebook-section" aria-label="Teste de fichario como seção">
      <SectionTag index="08" title="Fichario em duas colunas" />
      <div className="notebook-page"><div className="binder-column" /><div className="binder-plain" /></div>
    </section>
  );
}

function ChatSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setActive(true);
        observer.disconnect();
      }
    }, { threshold: 0.35 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);
  return (
    <section ref={sectionRef} className={`chat-section grain ${active ? "chat-section--active" : ""}`}>
      <SectionTag index="09" title="Dialogo frozen glass" light />
      <div className="chat-thread" aria-label="Conversa de exemplo">
        <div className="chat-bubble chat-bubble--left"><small>Lorem</small><p>Assim, máximo respeito e admiração por quem consegue lidar com cada área da vida sem apoio da tecnologia...</p><time>10:31</time></div>
        <div className="chat-bubble chat-bubble--right"><small>Ipsum</small><p>Mas a gente surtaria se não tivéssemos esse sistema pra gerenciar TUDO em um só lugar</p><time>10:35</time></div>
        <div className="chat-bubble chat-bubble--left"><small>Lorem</small><p>Porque somos meio esquecidinhas, sabe? 😇</p><time>10:36</time></div>
      </div>
    </section>
  );
}

function DotTypeSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let points: Array<{ x: number; y: number; glow: number }> = [];
    let pointer = { x: -999, y: -999 };
    let frame = 0;
    const build = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const bounds = canvas.getBoundingClientRect();
      canvas.width = Math.round(bounds.width * ratio);
      canvas.height = Math.round(bounds.height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, bounds.width, bounds.height);
      const fontSize = Math.min(112, Math.max(38, bounds.width / 10.5));
      context.font = `400 ${fontSize}px Instrument Serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = "#000";
      const lines = bounds.width < 700 ? ["Voce nao precisa", "saber programar"] : ["Voce nao precisa saber", "programar"];
      lines.forEach((line, index) => context.fillText(line, bounds.width / 2, bounds.height / 2 + (index - .5) * fontSize * .92));
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      points = [];
      const step = Math.max(7, Math.round(9 * ratio));
      for (let y = 0; y < canvas.height; y += step) for (let x = 0; x < canvas.width; x += step) {
        if (pixels[(y * canvas.width + x) * 4 + 3] > 80) points.push({ x: x / ratio, y: y / ratio, glow: Math.random() });
      }
    };
    const draw = () => {
      const bounds = canvas.getBoundingClientRect();
      context.clearRect(0, 0, bounds.width, bounds.height);
      points.forEach((point) => {
        const near = Math.hypot(point.x - pointer.x, point.y - pointer.y) < 120;
        if (near && Math.random() > .82) point.glow = 1;
        point.glow *= .965;
        context.beginPath();
        context.fillStyle = `rgba(200,220,232,${.42 + point.glow * .58})`;
        context.shadowColor = "#eef7ff";
        context.shadowBlur = point.glow * 11;
        context.arc(point.x, point.y, 1.5 + point.glow * 1.3, 0, Math.PI * 2);
        context.fill();
      });
      context.shadowBlur = 0;
      frame = requestAnimationFrame(draw);
    };
    const onMove = (event: PointerEvent) => { const bounds = canvas.getBoundingClientRect(); pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }; };
    build();
    frame = requestAnimationFrame(draw);
    canvas.addEventListener("pointermove", onMove);
    window.addEventListener("resize", build);
    return () => { cancelAnimationFrame(frame); canvas.removeEventListener("pointermove", onMove); window.removeEventListener("resize", build); };
  }, []);
  return <section className="dot-type-section grain"><SectionTag index="10" title="Tipografia em pontos" light /><canvas ref={canvasRef} aria-label="Voce nao precisa saber programar" /></section>;
}

function GlassQuartetSection() {
  const glasses = [
    { name: "Drapeado", className: "glass-sample--draped" },
    { name: "Frozen", className: "glass-sample--frozen" },
    { name: "Fosco", className: "glass-sample--matte" },
    { name: "Irregular", className: "glass-sample--irregular" },
  ];
  return <section className="glass-quartet"><SectionTag index="11" title="Quatro texturas de vidro" light /><div className="glass-quartet__grid">{glasses.map((glass) => <article className={`glass-sample ${glass.className}`} key={glass.name}><span>{glass.name}</span><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p></article>)}</div></section>;
}

function LaptopHotspots() {
  const [active, setActive] = useState<number | null>(null);
  const points = [{ x: 24, y: 35, side: "left" }, { x: 67, y: 28, side: "right" }, { x: 43, y: 67, side: "left" }, { x: 79, y: 61, side: "right" }];
  return <section className="laptop-section grain"><SectionTag index="12" title="Hotspots no notebook" /><div className="laptop-scene"><img className="laptop-base" src="/laptop-transparent.png" alt="Notebook" /><div className="laptop-screen"><img src="/studio-woman.jpg" alt="Mulher em um estudio criativo" />{points.map((point, index) => <button onMouseEnter={() => setActive(index)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(index)} onBlur={() => setActive(null)} onClick={() => setActive(active === index ? null : index)} className={`laptop-hotspot laptop-hotspot--${point.side} ${active === index ? "is-active" : ""}`} style={{ left: `${point.x}%`, top: `${point.y}%` }} key={index} aria-label={`Ver projeto ${index + 1}`} aria-expanded={active === index}><span /></button>)}</div>{active !== null && <img className={`laptop-preview laptop-preview--${points[active].side}`} src="/studio-woman.jpg" alt="Previa ampliada do projeto" />}</div></section>;
}

function RachelFarleySection() {
  return <section className="rachel-section grain"><SectionTag index="17" title="Texto em relevo cromatico" light /><div className="rachel-title" aria-label="Rachel Farley"><span>RACHEL</span><span>FARLEY</span></div><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p></section>;
}

function ArchiveEffects() {
  useEffect(() => {
    const root = document.documentElement;
    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
    const buildDotIcons = () => {
      document.querySelectorAll<SVGSVGElement>(".lab-dot-icon").forEach((svg) => {
        const shape = svg.dataset.shape;
        const points: Array<[number, number]> = [];
        const grid = shape === "diamond" ? 11 : 9;
        const center = (grid - 1) / 2;
        const diamondPoints = new Set(["5,0", "4,1", "6,1", "3,2", "7,2", "2,3", "8,3", "1,4", "9,4", "0,5", "2,5", "3,5", "4,5", "5,5", "6,5", "7,5", "8,5", "10,5", "1,6", "3,6", "5,6", "7,6", "9,6", "2,7", "4,7", "5,7", "6,7", "8,7", "3,8", "5,8", "7,8", "4,9", "5,9", "6,9", "5,10"]);
        for (let y = 0; y < grid; y += 1) for (let x = 0; x < grid; x += 1) {
          const dx = x - center;
          const dy = y - center;
          const show = shape === "compass" ? Math.abs(dx) + Math.abs(dy) === 4 || (dx === 0 && Math.abs(dy) <= 4) || (dy === 0 && Math.abs(dx) <= 4)
            : shape === "loupe" ? (dx * dx + dy * dy > 7 && dx * dx + dy * dy < 16) || (dx === -dy && dx < -1 && dx > -5)
              : shape === "check" ? (x >= 1 && x <= 7 && (y === 1 || y === 7)) || (y >= 1 && y <= 7 && (x === 1 || x === 7)) || (x === 2 && y === 4) || (x === 3 && y === 5) || (x === 4 && y === 6) || (x === 5 && y === 5) || (x === 6 && y === 4) || (x === 7 && y === 3)
                : diamondPoints.has(`${x},${y}`);
          if (show) points.push([x, y]);
        }
        svg.innerHTML = points.map(([x, y], index) => `<circle cx="${8 + x * (shape === "diamond" ? 6.4 : 8)}" cy="${8 + y * (shape === "diamond" ? 6.4 : 8)}" r="${shape === "diamond" ? 2.55 : 3.1}" style="animation-delay:${(index % 9) * 35}ms"></circle>`).join("");
      });
    };
    const updateScrollEffects = () => {
      const values = document.querySelector<HTMLElement>(".lab-values");
      const gallery = document.querySelector<HTMLElement>(".lab-horizontal-section");
      const track = document.querySelector<HTMLElement>(".lab-gallery-track");
      const dark = document.querySelector<HTMLElement>("[data-lab-dark-section]");
      if (!values || !gallery || !track || !dark) return;
      const valuesRect = values.getBoundingClientRect();
      const valuesProgress = clamp(-valuesRect.top / (values.offsetHeight - window.innerHeight), 0, 1);
      root.style.setProperty("--lab-values-reveal-pct", `${clamp(valuesProgress / .34, 0, 1) * 100}%`);
      document.querySelectorAll<HTMLElement>(".lab-icon-item").forEach((item, index) => {
        const itemProgress = clamp((valuesProgress - .34 - index * .12) / .18, 0, 1);
        item.style.setProperty("--lab-icon-opacity", `${itemProgress}`);
        item.style.setProperty("--lab-icon-y", `${(1 - (1 - Math.pow(1 - itemProgress, 3))) * 120}vh`);
      });
      document.querySelectorAll<HTMLElement>(".lab-soul-scroll").forEach((soul) => {
        const rect = soul.getBoundingClientRect();
        const progress = clamp(-rect.top / (soul.offsetHeight - window.innerHeight), 0, 1);
        soul.style.setProperty("--lab-image-scale", `${.72 + progress * .48}`);
        soul.style.setProperty("--lab-shadow-y", `${100 - progress * 120}%`);
        soul.style.setProperty("--lab-shadow-opacity", `${clamp((progress - .18) / .45, 0, 1)}`);
        soul.style.setProperty("--lab-reveal-pct", `${clamp((progress - .42) / .48, 0, 1) * 100}%`);
      });
      const galleryRect = gallery.getBoundingClientRect();
      const galleryProgress = clamp(-galleryRect.top / (gallery.offsetHeight - window.innerHeight), 0, 1);
      root.style.setProperty("--lab-track-x", `${-Math.max(0, track.scrollWidth - window.innerWidth) * galleryProgress}px`);
      const darkRect = dark.getBoundingClientRect();
      const rawDarkProgress = clamp(-darkRect.top / (dark.offsetHeight - window.innerHeight), 0, 1);
      const imageProgress = clamp((rawDarkProgress - .42) / .48, 0, 1);
      root.style.setProperty("--lab-gif-width", `${34 + imageProgress * 58}vw`);
      root.style.setProperty("--lab-gif-opacity", `${imageProgress}`);
      document.body.classList.toggle("lab-dark-mode", rawDarkProgress > .34 && darkRect.bottom > window.innerHeight * .25);
    };
    buildDotIcons();
    updateScrollEffects();
    window.addEventListener("scroll", updateScrollEffects, { passive: true });
    window.addEventListener("resize", updateScrollEffects);
    return () => {
      window.removeEventListener("scroll", updateScrollEffects);
      window.removeEventListener("resize", updateScrollEffects);
      document.body.classList.remove("lab-dark-mode");
    };
  }, []);

  const hiddenLabel = <p className="lab-section-label" aria-hidden="true">Seção</p>;
  return <section className="effects-lab-import">
    <section className="lab-section lab-values" id="values"><div className="lab-values-row">{hiddenLabel}<div className="lab-values-copy"><h2><span className="lab-values-fill">It&apos;s like having an older sister<br />with cool-aunt taste.</span></h2></div><div className="lab-icon-row"><div className="lab-icon-item"><svg className="lab-dot-icon" viewBox="0 0 80 80" data-shape="compass" /><span className="lab-icon-tooltip">EXPLORADORA</span></div><div className="lab-icon-item"><svg className="lab-dot-icon" viewBox="0 0 80 80" data-shape="loupe" /><span className="lab-icon-tooltip">DETALHISTA</span></div><div className="lab-icon-item"><svg className="lab-dot-icon" viewBox="0 0 80 80" data-shape="check" /><span className="lab-icon-tooltip">CRITERIOSA</span></div><div className="lab-icon-item"><svg className="lab-dot-icon" viewBox="0 0 80 80" data-shape="diamond" /><span className="lab-icon-tooltip">&amp; COM BOM GOSTO</span></div></div></div></section>
    <section className="lab-section lab-embossed-section" id="embossed"><div className="lab-embossed-wrap">{hiddenLabel}<div className="lab-embossed-small">Paris, France<br />&amp; Destination</div><div className="lab-embossed-title">Artistry Preserved for Generations</div><div className="lab-embossed-soft">“Lorem ipsum dolor sit amet, consectetur adipiscing elit; treasured pieces that grow more meaningful with time.”</div></div></section>
    <section className="lab-soul-scroll" id="soul"><div className="lab-sticky-stage">{hiddenLabel}<div className="lab-growing-photo" /><div className="lab-rising-shadow" /><h2 className="lab-color-reveal-text"><span>Adorned online spaces for fictional brands</span></h2></div></section>
    <section className="lab-soul-scroll lab-soul-scroll-light"><div className="lab-sticky-stage">{hiddenLabel}<div className="lab-growing-photo" /><div className="lab-rising-shadow" /><h2 className="lab-color-reveal-text"><span>Adorned online spaces for fictional brands</span></h2></div></section>
    <section className="lab-horizontal-section" id="gallery"><div className="lab-horizontal-sticky">{hiddenLabel}<div className="lab-gallery-track">{Array.from({ length: 6 }, (_, index) => <div className="lab-canvas-shot" key={index} />)}</div></div></section>
    <section className="lab-dark-scroll" id="dark" data-lab-dark-section><div className="lab-dark-sticky"><div>{hiddenLabel}<h2 className="lab-section-title">Navigation turns dark while the center media grows.</h2><div className="lab-gif-grow" /></div></div></section>
  </section>;
}

function CutoutSection() {
  return (
    <section className="cutout-section grain">
      <SectionTag index="13" title="Fundos removidos" />
      <div className="cutout-copy reveal"><p className="eyebrow">Teste transparente</p><h2>Lorem ipsum<br />sem fundo.</h2></div>
      <div className="cutout-grid reveal">
        <img src="/clip-transparent.png" alt="Clipe metalico recortado sem fundo" />
        <img src="/pin-transparent.png" alt="Alfinete de perola recortado sem fundo" />
        <img src="/cream-clip-transparent.png" alt="Clipe creme recortado sem fundo" />
      </div>
    </section>
  );
}

function NoiseOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;
    const paintNoise = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.ceil(window.innerWidth * scale);
      canvas.height = Math.ceil(window.innerHeight * scale);
      const image = context.createImageData(canvas.width, canvas.height);
      for (let pixel = 0; pixel < image.data.length; pixel += 4) {
        const tone = Math.random() < 0.72 ? 0 : Math.random() * 110;
        image.data[pixel] = tone;
        image.data[pixel + 1] = tone;
        image.data[pixel + 2] = tone;
        image.data[pixel + 3] = 105;
      }
      context.putImageData(image, 0, 0);
    };
    paintNoise();
    const timer = window.setInterval(paintNoise, 85);
    return () => window.clearInterval(timer);
  }, []);

  return <canvas ref={canvasRef} className="noise-canvas" aria-hidden="true" />;
}

function FragmentRain() {
  const sourceStageRef = useRef<HTMLElement>(null);
  const sourceRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const landingRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sourceStage = sourceStageRef.current;
    const source = sourceRef.current;
    const copy = copyRef.current;
    const landing = landingRef.current;
    if (!sourceStage || !source || !landing) return;

    const { Bodies, Body, Composite, Engine, World } = Matter;
    const engine = Engine.create({ gravity: { x: 0, y: 1.35, scale: 0.0015 } });
    const pieces = new Map<number, { body: Matter.Body; element: HTMLDivElement; radius: number }>();
    const fragments: Array<{ radius: number; sourceX: number; sourceY: number; xRatio: number; cropSize: string; cropPosition: string }> = [];
    const fragmentTotal = 36;
    let floor: Matter.Body;
    let leftWall: Matter.Body;
    let rightWall: Matter.Body;
    let frame = 0;
    let releaseTimer = 0;
    let unlockTimer = 0;
    let releaseStarted = false;

    const setBounds = () => {
      const { width, height } = landing.getBoundingClientRect();
      if (floor) Composite.remove(engine.world, [floor, leftWall, rightWall]);
      floor = Bodies.rectangle(width / 2, height + 24, width + 96, 48, { isStatic: true, friction: 0.96 });
      leftWall = Bodies.rectangle(-24, height / 2, 48, height * 2, { isStatic: true });
      rightWall = Bodies.rectangle(width + 24, height / 2, 48, height * 2, { isStatic: true });
      World.add(engine.world, [floor, leftWall, rightWall]);
    };

    const overlapsProtectedCopy = (x: number, y: number, radius: number, sourceBounds: DOMRect) => {
      if (!copy) return false;
      const copyBounds = copy.getBoundingClientRect();
      const padding = 38;
      const left = copyBounds.left - sourceBounds.left - padding;
      const top = copyBounds.top - sourceBounds.top - padding;
      const right = copyBounds.right - sourceBounds.left + padding;
      const bottom = copyBounds.bottom - sourceBounds.top + padding;
      const closestX = Math.max(left, Math.min(x, right));
      const closestY = Math.max(top, Math.min(y, bottom));
      return Math.hypot(x - closestX, y - closestY) < radius;
    };

    const punch = () => {
      if (fragments.length >= fragmentTotal) return false;
      const bounds = source.getBoundingClientRect();
      const { width, height } = bounds;
      const radius = 13 + Math.random() * 17;
      let x = width / 2;
      let y = height / 2;
      let foundClearSpace = false;
      for (let attempt = 0; attempt < 120; attempt += 1) {
        const candidateX = radius + 20 + Math.random() * Math.max(1, width - radius * 2 - 40);
        const candidateY = radius + 28 + Math.random() * Math.max(1, height - radius * 2 - 56);
        const overlaps = fragments.some((fragment) => (
          Math.hypot(candidateX - fragment.sourceX, candidateY - fragment.sourceY) < radius + fragment.radius + 9
        ));
        if (!overlaps && !overlapsProtectedCopy(candidateX, candidateY, radius, bounds)) {
          x = candidateX;
          y = candidateY;
          foundClearSpace = true;
          break;
        }
      }
      if (!foundClearSpace) return false;
      const imageAspect = 1400 / 933;
      const renderedWidth = width / height > imageAspect ? width : height * imageAspect;
      const renderedHeight = width / height > imageAspect ? width / imageAspect : height;
      const offsetX = (width - renderedWidth) / 2;
      const offsetY = (height - renderedHeight) * 0.52;
      const hole = document.createElement("div");
      hole.className = "fragment-hole";
      hole.style.width = `${radius * 2}px`;
      hole.style.height = `${radius * 2}px`;
      hole.style.left = `${x - radius}px`;
      hole.style.top = `${y - radius}px`;
      source.append(hole);
      fragments.push({
        radius,
        sourceX: x,
        sourceY: y,
        xRatio: x / width,
        cropSize: `${renderedWidth}px ${renderedHeight}px`,
        cropPosition: `${-(x - radius - offsetX)}px ${-(y - radius - offsetY)}px`,
      });
      return true;
    };

    const punchTo = (count: number) => {
      while (fragments.length < Math.min(count, fragmentTotal)) {
        if (!punch()) break;
      }
    };

    const release = (fragment: (typeof fragments)[number]) => {
      const { width } = landing.getBoundingClientRect();
      const { radius } = fragment;
      const body = Bodies.circle(radius + fragment.xRatio * (width - radius * 2), -radius * 2, radius, {
        density: 0.0024,
        friction: 0.88,
        frictionAir: 0.012,
        restitution: 0.16,
      });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.16);
      const element = document.createElement("div");
      element.className = "fragment-piece";
      element.style.width = `${radius * 2}px`;
      element.style.height = `${radius * 2}px`;
      element.style.backgroundPosition = fragment.cropPosition;
      element.style.backgroundSize = fragment.cropSize;
      landing.append(element);
      World.add(engine.world, body);
      pieces.set(body.id, { body, element, radius });
    };

    const animate = () => {
      Engine.update(engine, 1000 / 60);
      pieces.forEach(({ body, element, radius }) => {
        element.style.transform = `translate3d(${body.position.x - radius}px, ${body.position.y - radius}px, 0) rotate(${body.angle}rad)`;
      });
      frame = requestAnimationFrame(animate);
    };

    const onScroll = () => {
      const bounds = sourceStage.getBoundingClientRect();
      const travel = Math.max(1, bounds.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -bounds.top / travel));
      punchTo(Math.floor(progress * fragmentTotal));
    };

    const landingObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || releaseStarted) return;
      releaseStarted = true;
      landing.classList.add("fragment-landing--falling");
      punchTo(fragmentTotal);
      let index = 0;
      releaseTimer = window.setInterval(() => {
        if (index >= fragments.length) {
          window.clearInterval(releaseTimer);
          unlockTimer = window.setTimeout(() => {
            landing.classList.add("fragment-landing--complete");
          }, 1300);
          return;
        }
        release(fragments[index]);
        index += 1;
      }, 12);
    }, { threshold: 0.16 });

    const onPointerMove = (event: PointerEvent) => {
      const bounds = landing.getBoundingClientRect();
      const pointerX = event.clientX - bounds.left;
      const pointerY = event.clientY - bounds.top;
      pieces.forEach(({ body }) => {
        const dx = body.position.x - pointerX;
        const dy = body.position.y - pointerY;
        const distance = Math.hypot(dx, dy);
        if (distance > 0 && distance < 145) {
          const force = (1 - distance / 145) * 0.0022 * body.mass;
          Body.applyForce(body, body.position, { x: (dx / distance) * force, y: (dy / distance) * force });
        }
      });
    };

    setBounds();
    onScroll();
    landingObserver.observe(landing);
    window.addEventListener("resize", setBounds);
    window.addEventListener("scroll", onScroll, { passive: true });
    landing.addEventListener("pointermove", onPointerMove);
    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(releaseTimer);
      window.clearTimeout(unlockTimer);
      landingObserver.disconnect();
      window.removeEventListener("resize", setBounds);
      window.removeEventListener("scroll", onScroll);
      landing.removeEventListener("pointermove", onPointerMove);
      pieces.forEach(({ element }) => element.remove());
      Engine.clear(engine);
    };
  }, []);

  return (
    <div className="fragment-sequence">
      <section ref={sourceStageRef} className="fragment-source-stage" aria-label="Imagem sendo recortada">
        <div ref={sourceRef} className="fragment-source">
          <SectionTag index="14" title="Picote da imagem" light />
          <div ref={copyRef} className="fragment-copy">
            <h2>Seus registros importantes acabam se perdendo, espalhados por aí</h2>
          </div>
        </div>
      </section>
      <section ref={landingRef} className="fragment-landing grain" aria-label="Recortes acumulados"><SectionTag index="15" title="Queda dos recortes" /><div className="fragment-emboss">E fica cada vez mais difícil de organizar ou conectar tudo</div></section>
    </div>
  );
}
