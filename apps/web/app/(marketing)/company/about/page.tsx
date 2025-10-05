export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <div className="stack-4xl text-center">
          <MarketingSectionHeader
            eyebrow="Our Story"
            title="BUILT BY PEOPLE WHO ACTUALLY DO THIS"
            highlight="WHO ACTUALLY DO THIS"
            description="Born from 13+ years of wrangling chaos in live entertainment, GHXSTSHIP turns the beautiful madness of creative production into a system that actually works."
          />
          <MarketingStatGrid items={stats} className="max-w-4xl mx-auto" />
        </div>
      </MarketingSection>

      <MarketingSection>
        <div className="grid items-center gap-2xl lg:grid-cols-2">
          <div className="stack-xl text-left">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 uppercase text-heading-gradient`}>OUR MISSION</h2>
            <p className="marketing-microcopy max-w-xl text-left text-base text-foreground/80">
              To build production management tools that don't make you toss your laptop across the room. After managing everything from cruise ship entertainment to Formula 1 hospitality, we know what actually works when the pressure's high and the clock is merciless.
            </p>
            <div className="stack-lg">
              {missionPoints.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex items-start gap-md">
                  <div className="marketing-tag shrink-0">
                    <Icon className="h-icon-sm w-icon-sm" />
                  </div>
                  <div className="stack-xs">
                    <h3 className="text-heading-4 text-heading-foreground uppercase">{title}</h3>
                    <p className="marketing-microcopy text-left">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="marketing-card marketing-interactive p-xl text-left">
            <h3 className={`${anton.className} text-heading-3 uppercase text-heading-gradient mb-md`}>Our Vision</h3>
            <p className="marketing-microcopy mb-lg">
              A world where production management doesn't require a PhD in chaos theory. Where creative professionals can focus on creating instead of fighting with spreadsheets that break when you look at them wrong.
            </p>
            <blockquote className="border-l-2 border-accent/60 pl-md italic text-foreground">
              "We're building the tools I wish I had when managing 1,000+ crew members at 3am during Formula 1 weekend. Spoiler alert: it would've been nice."
            </blockquote>
            <cite className="marketing-microcopy mt-sm block">— Julian Clarkson, Founder & CXO</cite>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <div className="stack-3xl">
          <MarketingSectionHeader
            title="OUR VALUES"
            description="These core values guide every decision we make and every feature we ship."
          />
          <div className="grid gap-lg md:grid-cols-2">
            {values.map(({ icon: Icon, title, description }) => (
              <MarketingCard
                key={title}
                title={title}
                description={description}
                icon={<Icon className="h-icon-lg w-icon-lg" />}
                accent="primary"
                className="items-start text-left"
              />
            ))}
          </div>
        </div>
      </MarketingSection>

      <MarketingSection>
        <div className="stack-3xl">
          <MarketingSectionHeader
            title="OUR JOURNEY"
            description="From a scrappy startup to a global platform serving creative professionals worldwide."
            align="center"
          />
          <div className="relative">
            <div className="absolute left-1/2 hidden h-full w-px -translate-x-1/2 bg-border md:block" aria-hidden />
            <div className="stack-2xl">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.year}
                  className={`flex flex-col gap-xl md:flex-row ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className="flex-1">
                    <div className="marketing-card marketing-interactive p-xl text-left">
                      <div className="text-heading-4 text-heading-foreground mb-xs">{milestone.year}</div>
                      <h3 className={`${anton.className} text-heading-3 uppercase text-heading-gradient mb-sm`}>
                        {milestone.title}
                      </h3>
                      <p className="marketing-microcopy text-left">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="mx-auto flex h-full w-full max-w-[2rem] items-center justify-center md:mx-0">
                    <span className="h-3 w-3 rounded-full bg-accent" />
                  </div>
                  <div className="hidden flex-1 md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <div className="stack-3xl">
          <MarketingSectionHeader
            title="LEADERSHIP TEAM"
            description="Meet the experienced leaders driving GHXSTSHIP's vision and growth."
            align="center"
          />
          <div className="grid gap-lg md:grid-cols-2 lg:grid-cols-4">
            {leadership.map((leader) => (
              <MarketingCard
                key={leader.name}
                title={leader.name}
                description={leader.bio}
                icon={<Users className="h-icon-lg w-icon-lg" />}
                accent="primary"
                highlight={leader.role}
                className="items-center text-center"
                footer={<span className="marketing-microcopy">{leader.role}</span>}
              />
            ))}
          </div>
        </div>
      </MarketingSection>

      <MarketingSection>
        <div className="stack-3xl">
          <MarketingSectionHeader
            title="AWARDS & RECOGNITION"
            description="Real-world achievements from actually managing large-scale productions (not just talking about it)."
            align="center"
          />
          <div className="grid gap-lg md:grid-cols-2 lg:grid-cols-3">
            {awards.map((award) => (
              <MarketingCard
                key={award.title}
                title={award.title}
                description={award.description}
                icon={<Award className="h-icon-lg w-icon-lg" />}
                accent="primary"
                className="items-start text-left"
                footer={<span className="marketing-microcopy">{award.organization}</span>}
              />
            ))}
          </div>
        </div>
      </MarketingSection>

      <MarketingSection variant="gradient" padding="lg">
        <div className="stack-2xl text-center">
          <MarketingSectionHeader
            title="JOIN OUR MISSION"
            description="Ready to use production tools that don't suck? Join the growing number of professionals who are done fighting with brittle software."
            align="center"
          />
          <div className="cluster-lg flex-wrap justify-center">
            <Link href="/auth/signup">
              <Button className="marketing-interactive w-full sm:w-auto">
                Start Creating
                <ArrowRight className="ml-sm h-icon-xs w-icon-xs" />
              </Button>
            </Link>
            <Link href="/careers">
              <Button variant="outline" className="marketing-interactive w-full sm:w-auto">
                Join Our Team
              </Button>
            </Link>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection>
        <div className="stack-2xl">
          <MarketingSectionHeader title="LEARN MORE" align="center" />
          <div className="grid gap-lg md:grid-cols-3">
            {relatedLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="marketing-card marketing-interactive block p-xl text-left"
              >
                <h3 className={`${anton.className} text-heading-3 uppercase text-heading-gradient mb-sm`}>
                  {link.title}
                </h3>
                <p className="marketing-microcopy">{link.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </MarketingSection>
    </div>
  );
}
