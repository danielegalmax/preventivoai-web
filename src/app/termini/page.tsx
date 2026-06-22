import { LegalPageLayout, LegalSection } from '@/components/LegalPageLayout'

export default function TerminiPage() {
  return (
    <LegalPageLayout title="Termini di servizio">
      <LegalSection title="1. Oggetto del servizio">
        <p>
          PreventivoAI è uno strumento software per la creazione e la gestione di preventivi digitali,
          la firma online dei documenti e il tracciamento degli incassi. Il servizio è erogato dal
          titolare della piattaforma (di seguito, il «Titolare»), i cui estremi identificativi e
          recapiti sono disponibili sul sito web del servizio.
        </p>
        <p>
          L&apos;utilizzo di PreventivoAI implica l&apos;accettazione integrale dei presenti Termini di servizio.
        </p>
      </LegalSection>

      <LegalSection title="2. Accesso in beta">
        <p>
          Durante la fase beta l&apos;accesso al servizio è riservato agli utenti invitati. L&apos;invito è
          personale e non trasferibile salvo diverso accordo scritto con il Titolare.
        </p>
        <p>
          Il servizio è gratuito per tutta la durata della fase beta. Il Titolare si riserva il diritto
          di introdurre piani a pagamento in una fase successiva, con preavviso ragionevole agli utenti
          registrati.
        </p>
      </LegalSection>

      <LegalSection title="3. Registrazione e account">
        <p>
          Per utilizzare il servizio l&apos;utente deve fornire dati veritieri e mantenerli aggiornati.
          L&apos;utente è responsabile della riservatezza delle proprie credenziali di accesso e di ogni
          attività svolta tramite il proprio account.
        </p>
        <p>
          È vietato condividere l&apos;account con terzi non autorizzati o utilizzare credenziali altrui.
        </p>
      </LegalSection>

      <LegalSection title="4. Responsabilità sui contenuti">
        <p>
          L&apos;utente è l&apos;unico responsabile dei dati e dei contenuti inseriti nella piattaforma,
          inclusi dati anagrafici dei clienti, testi dei preventivi, importi, allegati e ogni altra
          informazione caricata o generata tramite il servizio.
        </p>
        <p>
          L&apos;utente garantisce di avere titolo legittimo al trattamento e alla comunicazione di tali dati
          e di rispettare la normativa applicabile, inclusa la privacy dei propri clienti.
        </p>
        <p>
          Il Titolare non verifica l&apos;accuratezza, la liceità o la completezza dei contenuti inseriti
          dagli utenti e non risponde verso terzi per l&apos;uso che l&apos;utente fa del servizio.
        </p>
      </LegalSection>

      <LegalSection title="5. Beta: modifiche e interruzioni">
        <p>
          Durante la fase beta il servizio può essere modificato, sospeso o interrotto in qualsiasi
          momento, anche senza preavviso, per motivi tecnici, di sicurezza o di sviluppo del prodotto.
        </p>
        <p>
          Il Titolare non garantisce la continuità del servizio né l&apos;assenza di errori, bug o
          perdite di dati. Si raccomanda di conservare copie dei documenti rilevanti anche al di fuori
          della piattaforma.
        </p>
      </LegalSection>

      <LegalSection title="6. Uso consentito">
        <p>
          È consentito utilizzare PreventivoAI esclusivamente per finalità professionali legittime
          connesse alla gestione di preventivi e rapporti con i propri clienti.
        </p>
        <p>
          È vietato, tra l&apos;altro:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>utilizzare il servizio per scopi illeciti o fraudolenti;</li>
          <li>rivendere, sublicenziare o rendere disponibile il servizio a terzi senza autorizzazione;</li>
          <li>tentare di accedere in modo non autorizzato a sistemi, dati o account altrui;</li>
          <li>compromettere la sicurezza, la stabilità o le prestazioni della piattaforma.</li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Proprietà intellettuale">
        <p>
          Il software, l&apos;interfaccia, la documentazione, i testi, le grafiche e gli altri elementi
          del servizio — inclusa, ove applicabile, la denominazione «PreventivoAI» — sono protetti dalle
          norme vigenti in materia di proprietà intellettuale e restano di titolarità del Titolare o di
          terzi che ne abbiano concesso l&apos;utilizzo.
        </p>
        <p>
          Nulla nei presenti Termini attribuisce all&apos;utente diritti sul marchio, sul nome commerciale,
          sul dominio o su altri segni distintivi oltre all&apos;uso strettamente necessario per fruire del
          servizio secondo quanto previsto qui.
        </p>
        <p>
          L&apos;utente conserva la titolarità dei contenuti che inserisce autonomamente nel servizio e
          concede al Titolare una licenza limitata a trattarli per l&apos;erogazione della piattaforma.
        </p>
      </LegalSection>

      <LegalSection title="8. Limitazione di responsabilità">
        <p>
          Nei limiti consentiti dalla legge applicabile, il Titolare non è responsabile per danni
          indiretti, perdita di profitto, perdita di dati o mancati guadagni derivanti dall&apos;uso o
          dall&apos;impossibilità di usare il servizio durante la fase beta.
        </p>
      </LegalSection>

      <LegalSection title="9. Legge applicabile e foro competente">
        <p>
          I presenti Termini sono regolati dalla legge italiana. Per ogni controversia relativa
          all&apos;interpretazione o esecuzione dei presenti Termini è competente il foro del luogo di
          residenza o domicilio del consumatore, se applicabile, ovvero il foro territorialmente
          competente secondo la legge, salvo i casi inderogabili previsti dalla normativa vigente.
        </p>
      </LegalSection>

      <LegalSection title="10. Contatti">
        <p>
          Per informazioni sui presenti Termini è possibile contattare il Titolare tramite i recapiti
          pubblicati sul sito web del servizio.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
