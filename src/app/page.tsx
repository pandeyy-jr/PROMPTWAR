const principles = [
  {
    number: "01",
    title: "Know what you’ll earn",
    description:
      "Every shift should show its configured rate, currency, and expected pay before a worker commits.",
    tag: "WAGE CLARITY",
  },
  {
    number: "02",
    title: "Keep a clear shift record",
    description:
      "Check-in and check-out records help workers and managers resolve attendance questions.",
    tag: "SHIFT TRACKING",
  },
  {
    number: "03",
    title: "Make safety visible",
    description:
      "A straightforward reporting path helps hazards reach the people who can respond.",
    tag: "WORKPLACE SAFETY",
  },
];

const workflowSteps = [
  {
    number: "01",
    title: "See the shift and rate",
    description:
      "A worker opens an assigned shift with its configured hours, currency, and estimated pay.",
  },
  {
    number: "02",
    title: "Record attendance",
    description:
      "Check-in and check-out create one persisted record tied to the assigned shift and worker.",
  },
  {
    number: "03",
    title: "Report a hazard",
    description:
      "The worker submits a category, severity, and description, then follows the response status.",
  },
  {
    number: "04",
    title: "Review with context",
    description:
      "An authorized manager sees the record and an explainable Fairness Engine alert for human review.",
  },
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="topbar">
        <a className="brand" href="#home" aria-label="FairShift home">
          <span className="brand-mark" aria-hidden="true">f</span>
          <span>fairshift</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#workflow">How it works</a>
          <a href="#industries">Industries</a>
        </nav>
        <a className="top-link" href="/sign-in">Sign in <span aria-hidden="true">→</span></a>
      </header>

      <main id="main-content">
        <section className="hero" id="home" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span className="live-dot" aria-hidden="true" /> DECENT WORK, MADE VISIBLE</p>
            <h1 id="hero-title">Work should<br />work <em>for everyone.</em></h1>
            <p className="hero-intro">
              FairShift helps workers and workplace teams make shifts clearer,
              safer, and fairer, with transparent records and worker access.
            </p>
            <a className="primary-link" href="/sign-up">Create a worker account <span aria-hidden="true">→</span></a>
            <p className="hero-note">
              <span aria-hidden="true">*</span> Prompt Wars 2026 | UN SDG 8 | Supabase project connection pending
            </p>
          </div>

          <div
            className="hero-art"
            role="img"
            aria-label="Illustrative production shift card showing sample hours and estimated pay beside a worker figure."
          >
            <div className="sun-shape" aria-hidden="true" />
            <div className="orbit orbit-one" aria-hidden="true" /><div className="orbit orbit-two" aria-hidden="true" />
            <div className="schedule-card">
              <div className="schedule-top"><span className="mini-brand">f.</span><span>YOUR SHIFT, AT A GLANCE</span><span className="schedule-day">TUE 14</span></div>
              <div className="schedule-role">Production line</div>
              <div className="schedule-time"><span>08:00</span><span className="time-line" aria-hidden="true" /><span>16:00</span></div>
              <div className="schedule-bottom"><span>8 hours · Day shift</span><strong>₹ 1,200 <small>est.</small></strong></div>
            </div>
            <div className="person-shape" aria-hidden="true"><div className="person-head" /><div className="person-body" /><div className="person-arm" /></div>
            <div className="spark spark-a" aria-hidden="true">✳</div><div className="spark spark-b" aria-hidden="true">✳</div>
            <div className="art-caption">CLEAR TERMS. SAFER SHIFTS.</div>
          </div>
        </section>

        <div className="ticker" aria-hidden="true">
          FAIR PAY <span>✳</span> SAFE WORKPLACES <span>✳</span> CLEAR SHIFTS <span>✳</span> WORKER VOICE <span>✳</span> FAIR PAY <span>✳</span> SAFE WORKPLACES <span>✳</span>
        </div>

        <section className="workflow-section section-wrap" id="workflow" aria-labelledby="workflow-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE FAIRSHIFT WORKFLOW</p>
              <h2 id="workflow-title">One record, from<br />shift to <em>follow-up.</em></h2>
            </div>
            <p>
              Worker and management flows are implemented in the application.
              Connect Supabase and apply the migrations before using persistent data.
            </p>
          </div>
          <ol className="workflow-list">
            {workflowSteps.map((step) => (
              <li key={step.number}>
                <span className="workflow-number" aria-hidden="true">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="principles section-wrap" id="principles" aria-labelledby="principles-title">
          <div className="section-heading">
            <div><p className="eyebrow">THE FAIRSHIFT PROMISE</p><h2 id="principles-title">Good work starts<br />with <em>the basics.</em></h2></div>
            <p>FairShift focuses on practical details that matter to workers and the teams responsible for safe workplaces. Live data requires a configured Supabase project.</p>
          </div>
          <div className="principle-grid">
            {principles.map((item) => (
              <article className="principle-card" key={item.number}>
                <div className="card-number">{item.number}</div>
                <div><p className="card-tag">{item.tag}</p><h3>{item.title}</h3><p className="card-copy">{item.description}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="industry-section" id="industries" aria-labelledby="industry-title">
          <div className="industry-inner">
            <div><p className="eyebrow">BUILT FOR REAL WORKPLACES</p><h2 id="industry-title">Different shifts.<br /><em>Shared respect.</em></h2></div>
            <div className="industry-list">
              <article>
                <span className="industry-icon" aria-hidden="true">▦</span>
                <div>
                  <h3>Factories</h3>
                  <p>Production and maintenance shifts with clear rate terms and hazard follow-up for machine guarding, PPE, heat, and blocked exits.</p>
                </div>
                <span className="industry-index" aria-hidden="true">01</span>
              </article>
              <article>
                <span className="industry-icon" aria-hidden="true">⌂</span>
                <div>
                  <h3>Colleges</h3>
                  <p>Facilities, dining, security, and event shifts with clear schedules and reporting for wet floors, exposed wiring, blocked accessible routes, and equipment faults.</p>
                </div>
                <span className="industry-index" aria-hidden="true">02</span>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <a className="brand" href="#home" aria-label="FairShift home"><span className="brand-mark" aria-hidden="true">f</span><span>fairshift</span></a>
        <p>Decent work is a shared responsibility.</p>
        <span>DESIGNED FOR PEOPLE AT WORK · SDG 8</span>
      </footer>
    </>
  );
}
