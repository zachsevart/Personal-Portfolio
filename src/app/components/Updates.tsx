export function Updates() {
  const updates = [
    {
      id: 1,
      date: "2025-01-10",
      category: "sourdough",
      title: "Scored a new pattern today",
      content: "Finally nailed the leaf pattern I've been practicing. 78% hydration, 24hr cold proof. Crumb was open and airy. Keeping this formula."
    },
    {
      id: 2,
      date: "2025-01-08",
      category: "programming",
      title: "Built a CLI tool for managing dev environments",
      content: "Finished a small Rust CLI that helps me quickly spin up Docker containers with my preferred dev stack. Might open source it once I clean up the code."
    },
    {
      id: 3,
      date: "2025-01-05",
      category: "sourdough",
      title: "Starter maintenance notes",
      content: "Switched to a 1:5:5 feeding ratio and it's much more predictable now. Peaks around 5-6 hours at room temp. Smell is much better too—less vinegary, more fruity."
    },
    {
      id: 4,
      date: "2025-01-03",
      category: "programming",
      title: "Data structures study log",
      content: "Spent the week reviewing tree algorithms. Implemented AVL trees from scratch without looking at docs. Balance factor logic finally clicked."
    },
    {
      id: 5,
      date: "2024-12-28",
      category: "sourdough",
      title: "Discard pancakes discovery",
      content: "Made pancakes with sourdough discard. Way better than regular pancakes. Slight tang, fluffy texture. Recipe: 1 cup discard, 1 egg, 2 tbsp sugar, pinch of salt, 1/2 tsp baking soda."
    },
    {
      id: 6,
      date: "2024-12-22",
      category: "programming",
      title: "Contributing to open source",
      content: "Submitted my first PR to a package I use regularly. Just documentation improvements, but it's a start. Maintainer was super helpful with feedback."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="mb-8">
        <p className="opacity-60">
          A running log of bread bakes and programming experiments
        </p>
      </div>

      <div className="space-y-8">
        {updates.map((update) => (
          <article key={update.id} className="border-b border-black pb-8">
            <div className="flex gap-4 items-baseline mb-2">
              <span className="text-sm opacity-60">{update.date}</span>
              <span className="text-xs px-2 py-1 border border-black">
                {update.category}
              </span>
            </div>
            <h2 className="text-xl mb-3">{update.title}</h2>
            <p className="leading-relaxed">{update.content}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
