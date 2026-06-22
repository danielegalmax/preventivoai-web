"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import styles from "./LandingPage.module.css";

const BETA_REQUEST_URL = "https://earnest-nougat-b08159.netlify.app/";

function cls(...keys: (keyof typeof styles)[]) {
  return keys.map((key) => styles[key]).join(" ");
}

function animCounter(el: HTMLElement) {
  const target = parseInt(el.dataset.target ?? "0", 10);
  const suffix = el.dataset.suffix ?? "";
  const duration = 1400;
  const start = performance.now();

  function update(now: number) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = `${Math.round(eased * target)}${suffix}`;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

export function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.15 }
    );

    root.querySelectorAll(`.${styles.reveal}`).forEach((el) => {
      revealObserver.observe(el);
    });

    const statObservers: IntersectionObserver[] = [];

    root.querySelectorAll<HTMLElement>(`[data-target]`).forEach((el) => {
      const statObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animCounter(entry.target as HTMLElement);
              statObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      statObserver.observe(el);
      statObservers.push(statObserver);
    });

    return () => {
      revealObserver.disconnect();
      statObservers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <div ref={pageRef} className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          Preventivo<span>AI</span>
        </div>
        <div className={styles.betaPill}>Beta aperta</div>
      </nav>

      <section className={styles.hero}>
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={styles.heroContent}>
          <div className={styles.eyebrow}>
            <span className={styles.dot} />
            Accesso gratuito durante la beta
          </div>
          <h1 className={styles.heroTitle}>
            Dal preventivo
            <br />
            alla firma,
            <br />
            <em>tutto in un posto</em>
          </h1>
          <p className={styles.heroSubtitle}>
            Crei il preventivo con l'AI in pochi minuti, lo invii per la firma online, incassi.
            Senza saltare tra app diverse.
          </p>
          <div className={styles.ctaWrap}>
            <a
              className={styles.ctaPrimary}
              href={BETA_REQUEST_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Richiedi accesso gratuito
            </a>
            <div className={styles.ctaNote}>Nessun costo durante la beta · accesso su invito</div>
          </div>
        </div>
        <div className={styles.phoneWrap}>
          <div className={styles.phone}>
            <div className={styles.phoneNotch} />
            <div className={styles.phoneInner}>
              <div className={styles.miniHeader}>
                <div className={styles.miniLogo}>
                  Preventivo<span>AI</span>
                </div>
                <div className={styles.miniBell}>
                  🔔
                  <div className={styles.badgeDot} />
                </div>
              </div>
              <div className={styles.miniBody}>
                <div className={styles.miniGreeting}>Ciao Marco 👋</div>
                <div className={styles.miniSub}>Cosa vuoi fare oggi?</div>
                <div className={styles.miniBtn}>
                  <div className={styles.miniPlus}>+</div>
                  <div className={styles.miniBtnText}>Genera nuovo preventivo</div>
                </div>
                <div className={styles.miniStats}>
                  <div className={styles.miniStat}>
                    <div className={styles.miniStatN}>12</div>
                    <div className={styles.miniStatL}>Preventivi</div>
                  </div>
                  <div className={styles.miniStat}>
                    <div className={`${styles.miniStatN} ${styles.miniStatNT}`}>4.2k</div>
                    <div className={styles.miniStatL}>Incassato</div>
                  </div>
                  <div className={styles.miniStat}>
                    <div className={styles.miniStatN}>276</div>
                    <div className={styles.miniStatL}>Min.</div>
                  </div>
                </div>
                <div className={styles.miniListHeader}>
                  <span>Ultimi preventivi</span>
                  <span className={styles.seeAll}>Vedi tutti</span>
                </div>
                <div className={styles.miniRow}>
                  <div>
                    <div className={styles.miniName}>Luca Bianchi</div>
                    <div className={styles.miniDate}>oggi</div>
                  </div>
                  <div className={styles.miniRowRight}>
                    <div className={styles.miniAmount}>850</div>
                    <div className={styles.miniStatoOk}>firmato</div>
                  </div>
                </div>
                <div className={styles.miniRow}>
                  <div>
                    <div className={styles.miniName}>Sara Greco</div>
                    <div className={styles.miniDate}>ieri</div>
                  </div>
                  <div className={styles.miniRowRight}>
                    <div className={styles.miniAmount}>1.200</div>
                    <div className={styles.miniStatoWait}>in attesa</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.steps}>
        <div className={cls("reveal", "stepTtl")}>Come funziona</div>
        <div className={cls("reveal", "d1", "stepSub")}>Tre passi dal preventivo all'incasso</div>
        <div className={styles.stepsList}>
          <div className={cls("reveal", "d1", "step")}>
            <div className={styles.stepN}>1</div>
            <div className={styles.stepC}>
              <h3>Crei il preventivo in chat o con il builder</h3>
              <p>
                Scrivi in chat, detta a voce, o usa il builder manuale. L'AI struttura voci,
                prezzi e PDF in pochi minuti.
              </p>
            </div>
          </div>
          <div className={cls("reveal", "d2", "step")}>
            <div className={styles.stepN}>2</div>
            <div className={styles.stepC}>
              <h3>Il cliente firma (e paga) online</h3>
              <p>
                Invii un link. Il cliente apre, legge, firma digitalmente. Se hai Stripe collegato,
                paga direttamente dalla stessa pagina.
              </p>
            </div>
          </div>
          <div className={cls("reveal", "d3", "step")}>
            <div className={styles.stepN}>3</div>
            <div className={styles.stepC}>
              <h3>Ricevi la notifica e tieni traccia</h3>
              <p>
                Notifica immediata quando firma o paga. Reminder automatici se non risponde. Storico
                completo per ogni cliente.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.featInner}>
          <div className={cls("reveal", "featTtl")}>Ogni funzione, in azione</div>
          <div className={cls("reveal", "d1", "featSub")}>
            Vedi come funziona prima ancora di provarla
          </div>

          <div className={cls("reveal", "featBlock")}>
            <div className={styles.featText}>
              <div className={styles.featTag}>Firma digitale</div>
              <h3 className={styles.featTitleSpaced}>
                Il cliente firma dal link, tu ricevi la conferma
              </h3>
              <p>
                Invii un link WhatsApp. Il cliente apre il preventivo, legge ogni voce e firma
                digitalmente. Se hai Stripe collegato, paga nella stessa pagina. Tu ricevi una
                notifica immediata.
              </p>
            </div>
            <div className={styles.mockupWrap}>
              <div className={styles.firmaDoc}>
                <div className={styles.firmaDocHeader}>
                  <div className={styles.firmaLogoMini}>
                    Preventivo<span>AI</span>
                  </div>
                  <div className={styles.firmaDocId}>PRV-2026-0180</div>
                </div>
                <div className={styles.firmaTitle}>Preventivo — Daniele</div>
                <div className={styles.firmaRow}>
                  <span>Riprese video sul posto</span>
                  <span>114</span>
                </div>
                <div className={styles.firmaRow}>
                  <span>Montaggio 3 minuti</span>
                  <span>200</span>
                </div>
                <div className={styles.firmaRow}>
                  <span>Color grading</span>
                  <span>150</span>
                </div>
                <div className={styles.firmaTotale}>
                  <span>TOTALE</span>
                  <span className={styles.firmaTotaleAmount}>464</span>
                </div>
                <div className={styles.firmaBox}>
                  <div className={styles.firmaLabel}>Firma qui per accettare</div>
                  <svg className={styles.firmaSvg} viewBox="0 0 160 30">
                    <path
                      d="M10,20 Q30,5 50,18 Q70,30 90,12 Q110,0 130,15 Q145,22 150,18"
                      fill="none"
                      stroke="#0E9F8E"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="200"
                      className={styles.firmaCursor}
                    />
                  </svg>
                  <div className={styles.firmaCheck}>✓</div>
                </div>
              </div>
            </div>
          </div>

          <div className={cls("reveal", "featBlock", "featBlockReverse")}>
            <div className={styles.featText}>
              <div className={styles.featTag}>Notifiche e reminder</div>
              <h3 className={styles.featTitleSpaced}>
                Sai sempre cosa succede, senza controllare
              </h3>
              <p>
                L'app ti avvisa in tempo reale quando il cliente firma, paga o quando una rata
                è in scadenza. Toast immediati e reminder automatici — puoi mandare un WhatsApp con
                un tap.
              </p>
            </div>
            <div className={styles.mockupWrap}>
              <div className={styles.notifScreen}>
                <div className={styles.notifHeader2}>
                  <div className={styles.notifTitle}>Notifiche</div>
                  <div className={styles.notifBadge2}>3</div>
                </div>
                <div className={styles.notifItem}>
                  <div className={styles.notifItemTitle}>Luca Bianchi ha firmato</div>
                  <div className={styles.notifItemBody}>Preventivo PRV-2026-0180 · 850</div>
                  <div className={styles.notifItemTime}>adesso</div>
                </div>
                <div className={styles.notifItem}>
                  <div className={styles.notifItemTitle}>Pagamento ricevuto</div>
                  <div className={styles.notifItemBody}>Sara Greco · 1.200 via Stripe</div>
                  <div className={styles.notifItemTime}>2 min fa</div>
                </div>
                <div className={styles.notifItem}>
                  <div className={styles.notifItemTitle}>Rata in scadenza</div>
                  <div className={styles.notifItemBody}>Marco Verdi · 300 · 25 giu</div>
                  <div className={styles.notifItemTime}>oggi</div>
                </div>
                <div className={styles.toastNotif}>
                  <div className={styles.toastIcon}>✓</div>
                  <div className={styles.toastText}>Nuovo preventivo firmato — Luca Bianchi</div>
                </div>
              </div>
            </div>
          </div>

          <div className={cls("reveal", "featBlock")}>
            <div className={styles.featText}>
              <div className={styles.featTag}>AI in chat o voce</div>
              <h3 className={styles.featTitleSpaced}>
                Scrivi come a un collega, il preventivo si crea da solo
              </h3>
              <p>
                Descrivi il lavoro in chat o registra un vocale. L'AI struttura voci, prezzi e
                testo professionale in pochi secondi. Puoi modificare tutto prima di generare il PDF.
              </p>
            </div>
            <div className={styles.mockupWrap}>
              <div className={styles.chatScreen}>
                <div className={`${styles.chatMsg} ${styles.chatUser}`}>
                  Devo fare un preventivo per riprese video aziendali, 2 giorni, montaggio incluso,
                  budget cliente 3000
                </div>
                <div className={`${styles.chatMsg} ${styles.chatAi} ${styles.chatAiDelay1}`}>
                  Ho creato il preventivo! Ecco le voci:
                </div>
                <div className={styles.chatTyping}>
                  <div className={styles.typingDot} />
                  <div className={styles.typingDot} />
                  <div className={styles.typingDot} />
                </div>
                <div className={`${styles.chatMsg} ${styles.chatAi} ${styles.chatAiDelay2}`}>
                  Riprese video (2 gg) · 1.400 — Montaggio e color grading · 900 — Consegna file 4K
                  · 200 — Totale: 2.500
                </div>
                <div className={styles.chatInput}>
                  <div className={styles.chatInputText}>Aggiungi una voce...</div>
                  <div className={styles.chatSend}>→</div>
                </div>
              </div>
            </div>
          </div>

          <div className={cls("reveal", "featBlock", "featBlockReverse")}>
            <div className={styles.featText}>
              <div className={styles.featTag}>PDF professionali</div>
              <h3 className={styles.featTitleSpaced}>
                Template con il tuo brand, pronti in 10 secondi
              </h3>
              <p>
                Scegli tra più template, aggiungi il tuo logo e colori. Il PDF viene generato
                istantaneamente con anteprima paginata. Condivisione con un tap — via WhatsApp,
                email o link.
              </p>
            </div>
            <div className={styles.mockupWrap}>
              <div className={styles.pdfScreen}>
                <div className={styles.pdfHeader2}>
                  <div className={styles.pdfAzienda}>Daniele Galmazzi</div>
                  <div className={styles.pdfSub2}>Video Production</div>
                </div>
                <div className={styles.pdfSection}>
                  <div className={styles.pdfSectionTitle}>Servizi</div>
                  <div className={styles.pdfLine} />
                  <div className={styles.pdfLine} />
                  <div className={styles.pdfLine} />
                  <div className={styles.pdfLine} />
                </div>
                <div className={styles.pdfTotalBox}>
                  <div className={styles.pdfTotalLabel}>TOTALE</div>
                  <div className={styles.pdfTotalAmount}>2.500</div>
                </div>
                <div className={styles.pdfActions}>
                  <div className={styles.pdfBtn}>Condividi</div>
                  <div className={styles.pdfBtn2}>Anteprima</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.proof}>
        <div className={styles.proofInner}>
          <div className={cls("reveal", "proofStats")}>
            <div>
              <span className={styles.statN} data-target="10" data-suffix="sec">
                0sec
              </span>
              <div className={styles.statL}>per generare un PDF</div>
            </div>
            <div>
              <span className={styles.statN} data-target="0">
                0
              </span>
              <div className={styles.statL}>app aggiuntive</div>
            </div>
            <div>
              <span className={styles.statN} data-target="100" data-suffix="%">
                0%
              </span>
              <div className={styles.statL}>gratis in beta</div>
            </div>
          </div>
          <h2 className={cls("reveal", "d1", "proofTitle")}>
            Fatto per artigiani e professionisti italiani
          </h2>
          <p className={cls("reveal", "d2", "proofText")}>
            Idraulici, elettricisti, fotografi, videomaker, consulenti. Se lavori con i clienti e
            hai bisogno di preventivi veloci, PreventivoAI è per te.
          </p>
        </div>
      </section>

      <section className={styles.ctaBottom}>
        <h2 className={cls("reveal", "ctaBottomTitle")}>Vuoi provarla durante la beta?</h2>
        <p className={cls("reveal", "d1", "ctaBottomText")}>
          Sto aprendo l'accesso a un gruppo ristretto. In cambio ho bisogno del tuo feedback
          sincero su cosa funziona e cosa migliorare.
        </p>
        <a
          className={cls("reveal", "d2", "ctaDark")}
          href={BETA_REQUEST_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Richiedi accesso gratuito
        </a>
        <p className={cls("reveal", "d3", "ctaNote2")}>
          Nessun costo durante la beta · accesso su invito
        </p>
      </section>

      <footer className={styles.footer}>
        <div className={styles.logo2}>
          Preventivo<span>AI</span>
        </div>
        <nav className={styles.footerNav}>
          <Link href="/termini" className={styles.footerLink}>
            Termini
          </Link>
          <Link href="/privacy" className={styles.footerLink}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
