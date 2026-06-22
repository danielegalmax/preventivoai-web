import { LegalPageLayout, LegalSection } from '@/components/LegalPageLayout'

export default function TerminiPage() {
  return (
    <LegalPageLayout title="Termini di servizio">
      <LegalSection title="1. Oggetto del servizio">
        <p>
          PreventivoAI è uno strumento software per la creazione e la gestione di preventivi digitali,
          la firma online dei documenti e il tracciamento degli incassi. Il servizio è erogato da{' '}
          [nome società / ragione sociale] con sede in [indirizzo completo].
        </p>
        <p>
          L&apos;utilizzo di PreventivoAI implica l&apos;accettazione integrale dei presenti Termini di servizio.
        </p>
      </LegalSection>

      <LegalSection title="2. Accesso in beta">
        <p>
          Durante la fase beta l&apos;accesso al servizio è riservato agli utenti invitati. L&apos;invito è
          personale e non trasferibile salvo diverso accordo scritto con [nome società].
        </p>
        <p>
          Il servizio è gratuito per tutta la durata della fase beta. [nome società] si riserva il diritto
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
          [nome società] non verifica l&apos;accuratezza, la liceità o la completezza dei contenuti inseriti
          dagli utenti e non risponde verso terzi per l&apos;uso che l&apos;utente fa del servizio.
        </p>
      </LegalSection>

      <LegalSection title="5. Beta: modifiche e interruzioni">
        <p>
          Durante la fase beta il servizio può essere modificato, sospeso o interrotto in qualsiasi
          momento, anche senza preavviso, per motivi tecnici, di sicurezza o di sviluppo del prodotto.
        </p>
        <p>
          [nome società] non garantisce la continuità del servizio né l&apos;assenza di errori, bug o
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
          Il software, il marchio PreventivoAI, l&apos;interfaccia e i materiali forniti da [nome società]
          restano di proprietà di [nome società] o dei rispettivi titolari. L&apos;utente conserva la
          titolarità dei contenuti che inserisce nel servizio.
        </p>
      </LegalSection>

      <LegalSection title="8. Limitazione di responsabilità">
        <p>
          Nei limiti consentiti dalla legge applicabile, [nome società] non è responsabile per danni
          indiretti, perdita di profitto, perdita di dati o mancati guadagni derivanti dall&apos;uso o
          dall&apos;impossibilità di usare il servizio durante la fase beta.
        </p>
      </LegalSection>

      <LegalSection title="9. Legge applicabile e foro competente">
        <p>
          I presenti Termini sono regolati dalla legge italiana. Per ogni controversia relativa
          all&apos;interpretazione o esecuzione dei presenti Termini è competente in via esclusiva il
          Foro di [città], salvo i casi inderogabili previsti dalla legge a tutela dei consumatori.
        </p>
      </LegalSection>

      <LegalSection title="10. Contatti">
        <p>
          Per informazioni sui presenti Termini è possibile scrivere a: [email contatto].
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
