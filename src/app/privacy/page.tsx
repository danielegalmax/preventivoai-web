import { LegalPageLayout, LegalSection } from '@/components/LegalPageLayout'

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy">
      <LegalSection title="1. Titolare del trattamento">
        <p>
          Il titolare del trattamento dei dati personali è l&apos;entità che gestisce il servizio
          PreviCloud. Estremi identificativi, sede e recapiti per le richieste in materia di privacy
          sono pubblicati sul sito web del servizio o comunicati agli utenti nelle informative ufficiali.
        </p>
        <p>
          Ove nominato, il responsabile della protezione dei dati può essere contattato tramite i
          canali indicati sul sito.
        </p>
      </LegalSection>

      <LegalSection title="2. Ambito di applicazione">
        <p>
          La presente informativa descrive come vengono trattati i dati personali degli utenti che
          accedono a PreviCloud tramite sito web, applicazione mobile e applicazione desktop,
          nonché i dati inseriti dagli utenti relativi ai propri clienti finali nell&apos;ambito
          dell&apos;utilizzo del servizio.
        </p>
      </LegalSection>

      <LegalSection title="3. Tipologie di dati raccolti">
        <p>
          Possono essere trattate, a seconda delle funzionalità utilizzate, le seguenti categorie di dati:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Dati di registrazione e account:</strong> indirizzo email, password (conservata in
            forma crittografata), nome azienda e altri dati di profilo inseriti dall&apos;utente.
          </li>
          <li>
            <strong>Dati relativi ai preventivi:</strong> titoli, importi, testi, stati, date e documenti
            PDF generati o caricati.
          </li>
          <li>
            <strong>Dati dei clienti inseriti dall&apos;utente:</strong> nome, recapiti, note e ogni
            altra informazione che l&apos;utente registra nella propria anagrafica clienti.
          </li>
          <li>
            <strong>Dati di utilizzo:</strong> log tecnici, eventi di utilizzo interni e, ove attivati,
            dati analitici finalizzati al miglioramento del servizio.
          </li>
          <li>
            <strong>Dati di pagamento:</strong> gestiti tramite Stripe; PreviCloud non conserva i dati
            completi delle carte di pagamento.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Finalità e base giuridica">
        <p>I dati sono trattati per le seguenti finalità:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>erogazione del servizio PreviCloud e gestione dell&apos;account utente;</li>
          <li>creazione, invio, firma e tracciamento dei preventivi;</li>
          <li>gestione di pagamenti, rate e abbonamenti collegati al servizio;</li>
          <li>assistenza tecnica e comunicazioni relative al servizio;</li>
          <li>miglioramento della piattaforma e sicurezza dei sistemi.</li>
        </ul>
        <p>
          Le basi giuridiche del trattamento sono l&apos;esecuzione del contratto o di misure precontrattuali
          richieste dall&apos;utente e il consenso dell&apos;interessato, ove richiesto dalla normativa applicabile.
        </p>
      </LegalSection>

      <LegalSection title="5. Modalità del trattamento">
        <p>
          I dati sono trattati con strumenti informatici e telematici, con logiche strettamente correlate
          alle finalità indicate e nel rispetto delle misure di sicurezza adeguate.
        </p>
        <p>
          L&apos;utente che inserisce dati dei propri clienti agisce, per tali dati, come titolare autonomo
          del trattamento o responsabile secondo la propria organizzazione; il titolare del servizio tratta
          tali dati quale fornitore della piattaforma, nei limiti previsti dal rapporto contrattuale e
          dalla normativa applicabile.
        </p>
      </LegalSection>

      <LegalSection title="6. Conservazione">
        <p>
          I dati dell&apos;account e i contenuti associati sono conservati per tutta la durata del rapporto
          contrattuale e, successivamente alla chiusura dell&apos;account, per un periodo massimo di 12 mesi,
          salvo obblighi di legge o esigenze di tutela in sede giudiziaria.
        </p>
        <p>
          L&apos;utente può richiedere l&apos;eliminazione dell&apos;account dalle impostazioni dell&apos;applicazione,
          fatto salvo quanto necessario per adempiere a obblighi di legge.
        </p>
      </LegalSection>

      <LegalSection title="7. Comunicazione e trasferimento a terzi">
        <p>
          I dati non sono venduti né ceduti a terzi per finalità di marketing autonomo. Possono essere
          comunicati a fornitori tecnologici strettamente necessari all&apos;erogazione del servizio:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Supabase</strong> — hosting del database e servizi di autenticazione (infrastruttura
            con data center nell&apos;Unione Europea ove configurato);
          </li>
          <li>
            <strong>Stripe</strong> — elaborazione dei pagamenti online;
          </li>
          <li>
            <strong>Anthropic</strong> — elaborazione dei testi dei preventivi tramite modelli di
            intelligenza artificiale, limitatamente ai contenuti inviati dall&apos;utente per la generazione
            o il miglioramento dei testi.
          </li>
        </ul>
        <p>
          Tali fornitori trattano i dati in qualità di responsabili del trattamento o sub-responsabili,
          secondo i rispettivi accordi contrattuali e informative privacy.
        </p>
      </LegalSection>

      <LegalSection title="8. Diritti dell&apos;interessato">
        <p>
          In qualità di interessato, l&apos;utente può esercitare in qualsiasi momento i diritti previsti
          dagli artt. 15–22 del Regolamento UE 2016/679 (GDPR), tra cui:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>accesso ai propri dati personali;</li>
          <li>rettifica dei dati inesatti o integrazione di quelli incompleti;</li>
          <li>cancellazione dei dati, ove applicabile;</li>
          <li>limitazione del trattamento;</li>
          <li>portabilità dei dati, nei casi previsti dalla legge;</li>
          <li>opposizione al trattamento, nei casi previsti dalla legge.</li>
        </ul>
        <p>
          Le richieste possono essere inviate tramite i recapiti pubblicati sul sito del servizio. È
          inoltre possibile eliminare l&apos;account direttamente dalle impostazioni dell&apos;applicazione.
        </p>
        <p>
          L&apos;interessato ha diritto di proporre reclamo all&apos;Autorità Garante per la protezione dei
          dati personali (www.garanteprivacy.it).
        </p>
      </LegalSection>

      <LegalSection title="9. Sicurezza">
        <p>
          Il titolare del servizio adotta misure tecniche e organizzative adeguate a proteggere i dati da
          accessi non autorizzati, perdita, distruzione o divulgazione. Nessun sistema è tuttavia
          completamente immune da rischi; si invita l&apos;utente a proteggere le proprie credenziali.
        </p>
      </LegalSection>

      <LegalSection title="10. Modifiche alla presente informativa">
        <p>
          La presente Privacy Policy può essere aggiornata periodicamente. La versione aggiornata sarà
          pubblicata su questa pagina.
        </p>
      </LegalSection>

      <LegalSection title="11. Contatti">
        <p>
          Per domande sulla privacy o per esercitare i propri diritti è possibile contattare il titolare
          del trattamento tramite i recapiti pubblicati sul sito web del servizio.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
