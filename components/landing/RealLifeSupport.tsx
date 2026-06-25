import ScrollReveal from "./ScrollReveal";

const categories = [
  {
    name: "School",
    items: [
      { title: "School Refusal", description: "Morning strategies, school communication, and calm re-entry plans." },
      { title: "Homework", description: "Reduce battles with demand-light approaches and sensory breaks." },
    ],
  },
  {
    name: "Home",
    items: [
      { title: "Haircuts", description: "Prepare, regulate, and recover — step by step." },
      { title: "Bedtime", description: "Wind-down routines that respect your child's nervous system." },
    ],
  },
  {
    name: "Outings",
    items: [
      { title: "Shopping", description: "Navigate sensory overload in busy environments." },
      { title: "Restaurants", description: "Menus, noise, waiting — practical guidance for eating out." },
    ],
  },
  {
    name: "Healthcare",
    items: [
      { title: "Dentist", description: "Preparation scripts and coping strategies for medical visits." },
      { title: "Doctors", description: "Advocate for your child with confidence and clarity." },
    ],
  },
  {
    name: "Social",
    items: [
      { title: "Birthday Parties", description: "Social demands, surprises, and recovery time built in." },
      { title: "Family Visits", description: "Manage expectations with relatives who don't understand." },
      { title: "Sleepovers", description: "Preparation and communication for overnight stays." },
    ],
  },
  {
    name: "Travel",
    items: [
      { title: "Flying", description: "Airport, boarding, and in-flight support plans." },
      { title: "Holiday Travel", description: "Disrupted routines, new places, and recovery planning." },
    ],
  },
] as const;

export default function RealLifeSupport() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-[#0F172A] lg:text-5xl">
              Real life support
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Guidance for the moments that matter most — not theory, but practical help when you
              need it.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 space-y-12">
          {categories.map((category) => (
            <ScrollReveal key={category.name}>
              <div>
                <h3 className="mb-5 text-sm font-bold uppercase tracking-widest text-[#14B8A6]">
                  {category.name}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {category.items.map((item) => (
                    <div
                      key={item.title}
                      className="group rounded-[24px] border border-slate-100 bg-[#FAF8F4] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#14B8A6]/25 hover:shadow-[0_20px_50px_rgba(15,23,42,0.07)]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14B8A6]/10 transition-colors group-hover:bg-[#14B8A6]/15">
                        <span className="text-sm font-bold text-[#14B8A6]">
                          {item.title.charAt(0)}
                        </span>
                      </div>
                      <h4 className="mt-4 text-base font-bold text-[#0F172A]">{item.title}</h4>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
