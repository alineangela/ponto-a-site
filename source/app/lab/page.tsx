const styles = new Proxy({} as Record<string, string>, { get: (_target, property) => String(property) });

const Label = ({ number, children }: { number: string; children: React.ReactNode }) => (
  <p className={styles.label}><span>{number}</span>{children}</p>
);

export default function GlassLab() {
  return (
    <main className={styles.lab}>
      <section className={`${styles.demo} ${styles.ribbed}`}>
        <Label number="01">Vidro canelado vertical</Label>
        <div className={styles.ribbedScene}>
          <div className={styles.ribbedCopy}>
            <p className={styles.kicker}>Lorem ipsum studio</p>
            <h1>Textura, luz<br />e movimento.</h1>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae justo sed arcu finibus aliquet.</p>
          </div>
          <div className={styles.ribbedGlass} aria-hidden="true" />
        </div>
      </section>

      <section className={`${styles.demo} ${styles.glossy}`}>
        <Label number="02">Painéis frosted / glossiness</Label>
        <div className={styles.glossyGrid}>
          <article className={`${styles.glossPanel} ${styles.glossLow}`}><span>01</span><h2>Quiet clarity</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque quis nibh.</p></article>
          <article className={`${styles.glossPanel} ${styles.glossMid}`}><span>02</span><h2>Soft focus</h2><p>Curabitur posuere, neque vitae dictum volutpat, nunc est tincidunt lectus.</p></article>
          <article className={`${styles.glossPanel} ${styles.glossHigh}`}><span>03</span><h2>Deep frost</h2><p>Donec sed justo eget nibh pretium tincidunt quis eu arcu.</p></article>
        </div>
      </section>

      <section className={`${styles.demo} ${styles.comparison}`}>
        <Label number="03">Frosted / Clear / Blur</Label>
        <header className={styles.sectionHeading}><p className={styles.kicker}>Uma base, três intensidades</p><h2>Compare o mesmo vidro.</h2></header>
        <div className={styles.compareGrid}>
          <article className={`${styles.compareCard} ${styles.clear}`}><span>Clear</span><h3>Lorem ipsum</h3><p>Baixa opacidade e imagem preservada.</p></article>
          <article className={`${styles.compareCard} ${styles.frosted}`}><span>Frosted</span><h3>Dolor sit</h3><p>Desfoque equilibrado e contraste editorial.</p></article>
          <article className={`${styles.compareCard} ${styles.blurred}`}><span>Blur</span><h3>Amet lorem</h3><p>Maior difusão, saturação e privacidade.</p></article>
        </div>
      </section>

      <section className={`${styles.demo} ${styles.editorial}`}>
        <Label number="04">Cards translúcidos editoriais</Label>
        <div className={styles.editorialLayout}>
          <header><p className={styles.kicker}>Hunthings direction</p><h2>Objetos que guardam histórias.</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus pretium velit a malesuada pellentesque.</p></header>
          <div className={styles.editorialCards}>
            <article><span>Collection 01</span><h3>Found forms</h3><p>Curabitur posuere neque vitae dictum volutpat.</p></article>
            <article><span>Collection 02</span><h3>Quiet rituals</h3><p>Nam tincidunt arcu sed elit accumsan sapien.</p></article>
          </div>
        </div>
      </section>

      <section className={`${styles.demo} ${styles.amber}`}>
        <Label number="05">Story mobile em vidro âmbar</Label>
        <div className={styles.storyPhone}>
          <div className={styles.storyTop}><span>05 / 10</span><span>Hunthings</span></div>
          <div className={styles.storyCopy}><p className={styles.kicker}>Lorem collection</p><h2>Calma também pode ser marcante.</h2></div>
          <div className={styles.storyGlass}><span>Nota 04</span><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse potenti, sed do eiusmod tempor.</p></div>
        </div>
      </section>

      <section className={`${styles.demo} ${styles.product}`}>
        <Label number="06">Produto com painel de vidro</Label>
        <div className={styles.productStage}>
          <div className={styles.productPanel}>
            <p className={styles.kicker}>Object / 006</p>
            <h2>Form follows feeling.</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Um objeto cotidiano visto com outra atenção.</p>
            <button type="button">Ver detalhes</button>
          </div>
        </div>
      </section>
    </main>
  );
}
