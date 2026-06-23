"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./LandingPage.module.css";

const BETA_URL = "https://earnest-nougat-b08159.netlify.app/";

function cx(...keys: (keyof typeof styles | false | undefined)[]) {
  return keys.filter(Boolean).map((k) => styles[k as keyof typeof styles]).join(" ");
}

function revealClass(id: string, revealed: ReadonlySet<string>, ...keys: (keyof typeof styles)[]) {
  return cx(...keys, revealed.has(id) && "visible");
}

const STEPS = [
  {
    id: "step-1",
    num: "01",
    title: "Descrivi il lavoro",
    desc: "Scrivi in chat, detta a voce o usa il builder. L'AI struttura voci e prezzi dal tuo listino servizi.",
  },
  {
    id: "step-2",
    num: "02",
    title: "Invia e fai firmare",
    desc: "Generi il PDF con il tuo brand e lo mandi via WhatsApp, email o link. Il cliente firma online.",
  },
  {
    id: "step-3",
    num: "03",
    title: "Incassa e tieni tutto sotto controllo",
    desc: "Stripe Connect, rate e abbonamenti. Notifiche immediate su firme, pagamenti e scadenze.",
  },
] as const;

const GRID_FEATURES = [
  {
    id: "grid-1",
    title: "Analisi fiscale",
    desc: "Stima del forfettario: fatturato, contributi, imposte e netto in tempo reale.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M4 19V5M4 19h16M8 15v-4M12 15V9M16 15V7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "grid-2",
    title: "Rate e abbonamenti",
    desc: "Dividi l'importo in rate o offri piani ricorrenti. Reminder automatici in scadenza.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "grid-3",
    title: "Stripe Connect",
    desc: "Incassa online collegando il tuo account Stripe. Pagamenti sicuri, direttamente a te.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <rect x="2" y="6" width="20" height="14" rx="2" />
        <path d="M2 10h20M6 15h2M10 15h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "grid-4",
    title: "PDF con il tuo brand",
    desc: "Logo, colori e template personalizzati. PDF professionale pronto in circa 10 secondi.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "grid-5",
    title: "Listino servizi",
    desc: "Catalogo prezzi sempre a portata di mano. L'AI lo usa per preventivi coerenti e veloci.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "grid-6",
    title: "Gestione clienti",
    desc: "Storico preventivi, stato firme e pagamenti per ogni cliente, da mobile o desktop.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="10" r="2.5" />
        <path d="M3 20c0-3 2.7-5 6-5s6 2 6 5M14 20c0-2 1.5-3.5 3.5-3.5" strokeLinecap="round" />
      </svg>
    ),
  },
] as const;

const STATS = [
  { id: "stat-1", value: "10 sec", label: "per generare un PDF" },
  { id: "stat-2", value: "0", label: "app aggiuntive" },
  { id: "stat-3", value: "100%", label: "gratis in beta" },
] as const;

export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = (entry.target as HTMLElement).dataset.revealId;
          if (!id) return;
          setRevealed((prev) => {
            if (prev.has(id)) return prev;
            const next = new Set(prev);
            next.add(id);
            return next;
          });
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    root.querySelectorAll<HTMLElement>("[data-reveal-id]").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className={styles.page}>
      <header className={styles.navbar}>
        <div className={styles.logo}>
          <span className={styles.logoMark} aria-hidden>
            <svg viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="6" fill="currentColor" opacity="0.15" />
              <path
                d="M7 8h10M7 12h7M7 16h10"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </span>
          Preventivo<span>AI</span>
        </div>
        <a className={styles.navCta} href={BETA_URL} target="_blank" rel="noopener noreferrer">
          Accesso beta
        </a>
      </header>

      <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden>
          <div className={styles.heroGrid} />
          <div className={cx("glow", "glowA")} />
          <div className={cx("glow", "glowB")} />
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <div className={styles.betaBadge}>
              <span className={styles.liveDot} />
              Beta aperta — accesso gratuito
            </div>
            <h1 className={styles.heroTitle}>
              Preventivi, firme e pagamenti{" "}
              <span className={styles.heroHighlight}>senza uscire dall&apos;app</span>
            </h1>
            <p className={styles.heroLead}>
              PreventivoAI è il SaaS italiano per artigiani: crei il preventivo con l&apos;AI,
              lo fai firmare online e incassi con Stripe. Tutto da telefono, tablet o browser.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.btnPrimary} href={BETA_URL} target="_blank" rel="noopener noreferrer">
                Richiedi accesso gratuito
                <svg viewBox="0 0 20 20" fill="none" aria-hidden>
                  <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <p className={styles.heroFinePrint}>Nessun costo in beta · accesso su invito</p>
            </div>
          </div>

          <div className={styles.heroMock} aria-hidden>
            <div className={styles.mockWindow}>
              <div className={styles.mockBar}>
                <span /><span /><span />
              </div>
              <div className={styles.mockBody}>
                <div className={styles.mockPipeline}>
                  <div className={cx("pipeStep", "pipeStepActive")}>
                    <span className={styles.pipeIcon}>1</span>
                    <div>
                      <strong>Preventivo</strong>
                      <em>PRV-2026-0184</em>
                    </div>
                  </div>
                  <div className={styles.pipeLine} />
                  <div className={cx("pipeStep", "pipeStepActive")}>
                    <span className={styles.pipeIcon}>2</span>
                    <div>
                      <strong>Firmato</strong>
                      <em>Luca Bianchi</em>
                    </div>
                  </div>
                  <div className={styles.pipeLine} />
                  <div className={cx("pipeStep", "pipeStepPending")}>
                    <span className={styles.pipeIcon}>3</span>
                    <div>
                      <strong>Incassato</strong>
                      <em>€850 via Stripe</em>
                    </div>
                  </div>
                </div>
                <div className={styles.mockCards}>
                  <div className={cx("mockToast", "mockToast1")}>
                    <span className={styles.toastIcon}>✓</span>
                    Preventivo firmato · ora
                  </div>
                  <div className={cx("mockToast", "mockToast2")}>
                    <span className={styles.toastIconPay}>€</span>
                    Pagamento ricevuto · €850
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} id="come-funziona">
        <div className={styles.container}>
          <header className={styles.sectionHeader}>
            <span
              data-reveal-id="steps-eyebrow"
              className={revealClass("steps-eyebrow", revealed, "eyebrow", "reveal")}
            >
              Come funziona
            </span>
            <h2
              data-reveal-id="steps-title"
              className={revealClass("steps-title", revealed, "reveal", "delay1")}
            >
              Dal cantiere all&apos;incasso in tre passi
            </h2>
            <p
              data-reveal-id="steps-sub"
              className={revealClass("steps-sub", revealed, "reveal", "delay2", "sectionLead")}
            >
              Niente più Word, PDF sparsi e messaggi persi su WhatsApp.
            </p>
          </header>

          <div className={styles.stepsRow}>
            {STEPS.map((step, i) => (
              <article
                key={step.id}
                data-reveal-id={step.id}
                className={revealClass(
                  step.id,
                  revealed,
                  "reveal",
                  i === 0 ? "delay1" : i === 1 ? "delay2" : "delay3",
                  "stepCard"
                )}
              >
                <span className={styles.stepNum}>{step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={cx("section", "sectionAlt")}>
        <div className={styles.container}>
          <div className={styles.split}>
            <div
              data-reveal-id="ai-copy"
              className={revealClass("ai-copy", revealed, "reveal", "splitCopy")}
            >
              <span className={styles.eyebrow}>Preventivi con AI</span>
              <h2>Parla del lavoro, il preventivo si scrive da solo</h2>
              <p>
                Descrivi l&apos;intervento come faresti con un collega: l&apos;AI capisce il
                contesto, attinge al tuo listino servizi e propone voci e prezzi coerenti.
                Modifichi tutto prima di inviare.
              </p>
              <ul className={styles.featureList}>
                <li>Chat testuale e dettatura vocale</li>
                <li>Builder manuale per il controllo totale</li>
                <li>PDF professionale generato in pochi secondi</li>
              </ul>
            </div>

            <div
              data-reveal-id="ai-visual"
              className={revealClass("ai-visual", revealed, "reveal", "delay2", "chatPanel")}
            >
              <div className={styles.chatHeader}>
                <span className={styles.chatDot} />
                Assistente PreventivoAI
              </div>
              <div className={cx("chatMsg", "chatUser")}>
                Preventivo per rifacimento bagno: demolizione, nuove tubazioni, sanitari. Budget
                cliente circa €3.500.
              </div>
              <div className={cx("chatMsg", "chatAi")}>
                <strong>Preventivo creato</strong>
                <ul>
                  <li>Demolizione e smaltimento · €420</li>
                  <li>Impianto idraulico · €1.180</li>
                  <li>Sanitari e rubinetteria · €890</li>
                  <li>Manodopera posa · €760</li>
                </ul>
                <span className={styles.chatTotal}>Totale: €3.250</span>
              </div>
              <div className={styles.chatTyping}>
                <span /><span /><span />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={cx("split", "splitReverse")}>
            <div
              data-reveal-id="sign-visual"
              className={revealClass("sign-visual", revealed, "reveal", "delay1", "signPanel")}
            >
              <div className={styles.signPhone}>
                <div className={styles.signScreen}>
                  <div className={styles.signBrand}>
                    Preventivo<span>AI</span>
                    <em>PRV-2026-0184</em>
                  </div>
                  <h4>Rifacimento bagno — Mario Rossi</h4>
                  <div className={styles.signRows}>
                    <div><span>Demolizione</span><span>€420</span></div>
                    <div><span>Impianto idraulico</span><span>€1.180</span></div>
                    <div><span>Sanitari</span><span>€890</span></div>
                  </div>
                  <div className={styles.signGrandTotal}>
                    <span>Totale</span>
                    <span>€3.250</span>
                  </div>
                  <div className={styles.signArea}>
                    <p>Firma qui per accettare</p>
                    <svg viewBox="0 0 180 36" className={styles.signStroke} aria-hidden>
                      <path
                        d="M8,24 Q28,8 52,20 Q76,32 98,14 Q120,0 142,18 Q158,26 172,20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        pathLength="200"
                      />
                    </svg>
                    <div className={styles.signDone}>✓ Firmato</div>
                  </div>
                </div>
              </div>
            </div>

            <div
              data-reveal-id="sign-copy"
              className={revealClass("sign-copy", revealed, "reveal", "splitCopy")}
            >
              <span className={styles.eyebrow}>Firma digitale</span>
              <h2>Il cliente firma dal link, tu ricevi la conferma</h2>
              <p>
                Invii un link sicuro via WhatsApp, email o copia-incolla. Il cliente legge ogni
                voce, firma con il dito o il mouse e scarica il PDF firmato. Tu ricevi una
                notifica immediata in app.
              </p>
              <ul className={styles.featureList}>
                <li>Firma canvas con prova e audit trail</li>
                <li>Reminder automatici se non risponde</li>
                <li>Pagamento Stripe sulla stessa pagina</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={cx("section", "sectionMuted")}>
        <div className={styles.container}>
          <header className={styles.sectionHeader}>
            <span
              data-reveal-id="grid-eyebrow"
              className={revealClass("grid-eyebrow", revealed, "eyebrow", "reveal")}
            >
              Funzionalità
            </span>
            <h2
              data-reveal-id="grid-title"
              className={revealClass("grid-title", revealed, "reveal", "delay1")}
            >
              Tutto quello che ti serve sul campo
            </h2>
            <p
              data-reveal-id="grid-sub"
              className={revealClass("grid-sub", revealed, "reveal", "delay2", "sectionLead")}
            >
              Pensato per idraulici, elettricisti, videomaker, consulenti e chiunque lavori con i clienti.
            </p>
          </header>

          <div className={styles.featureGrid}>
            {GRID_FEATURES.map((item, i) => (
              <article
                key={item.id}
                data-reveal-id={item.id}
                className={revealClass(
                  item.id,
                  revealed,
                  "reveal",
                  i % 3 === 0 ? "delay1" : i % 3 === 1 ? "delay2" : "delay3",
                  "gridCard"
                )}
              >
                <div className={styles.gridIconWrap}>{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.statsSection}>
        <div className={styles.container}>
          <div
            data-reveal-id="stats-row"
            className={revealClass("stats-row", revealed, "reveal", "statsGrid")}
          >
            {STATS.map((stat, i) => (
              <div
                key={stat.id}
                className={cx(
                  "statItem",
                  i === 1 ? "delay1" : i === 2 ? "delay2" : undefined
                )}
              >
                <span className={styles.statNumber}>{stat.value}</span>
                <span className={styles.statDesc}>{stat.label}</span>
              </div>
            ))}
          </div>
          <h2
            data-reveal-id="stats-title"
            className={revealClass("stats-title", revealed, "reveal", "delay1", "statsHeading")}
          >
            Fatto per artigiani italiani
          </h2>
          <p
            data-reveal-id="stats-text"
            className={revealClass("stats-text", revealed, "reveal", "delay2", "statsCopy")}
          >
            Un unico strumento al posto di Word, email, firme cartacee e bonifici da rincorrere.
            Mobile, desktop e web sempre sincronizzati.
          </p>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div
          data-reveal-id="cta-box"
          className={revealClass("cta-box", revealed, "reveal", "ctaCard")}
        >
          <h2>Vuoi provarla durante la beta?</h2>
          <p>
            Sto aprendo l&apos;accesso a un gruppo ristretto di artigiani. In cambio mi serve il
            tuo feedback sincero su cosa funziona e cosa migliorare.
          </p>
          <a className={styles.btnPrimary} href={BETA_URL} target="_blank" rel="noopener noreferrer">
            Richiedi accesso gratuito
            <svg viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <p className={styles.ctaNote}>Nessun costo durante la beta · accesso su invito</p>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLogo}>
            Preventivo<span>AI</span>
          </div>
          <nav className={styles.footerNav} aria-label="Link legali">
            <Link href="/termini">Termini</Link>
            <Link href="/privacy">Privacy</Link>
          </nav>
          <p className={styles.footerCopy}>© {new Date().getFullYear()} PreventivoAI</p>
        </div>
      </footer>
      </main>
    </div>
  );
}
