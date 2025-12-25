function InteractiveRight() {
  const slides = [
    { id: 1, img: dashboardImg, title: 'Overview dashboard' },
    { id: 2, img: dashboardImg2, title: 'Products & Inventory' },
  ];

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      {/* slide */}
      <div className="relative">
        <div className="h-64 bg-white/10 rounded-lg overflow-hidden flex items-center justify-center shadow-2xl">
          <img src={slides[idx].img} alt={slides[idx].title} className="max-h-full max-w-full object-cover" />
        </div>

        <div className="mt-4">
          <h3 className="text-2xl font-semibold">Bevarges</h3>
          <p className="text-sm opacity-90 mt-2">Manage beverages, inventory and sales with confidence.</p>

          <div className="mt-4 flex gap-3">
            <button className="bg-white text-indigo-700 px-4 py-2 rounded-md font-medium hover:shadow-lg">Learn more</button>
            <button className="bg-white/10 border border-white/20 px-4 py-2 rounded-md hover:bg-white/20">Request demo</button>
          </div>
        </div>

        {/* small features */}
        <div className="mt-6 grid gap-3">
          <Feature text="Category-wise product management" />
          <Feature text="Fast product upload with images" />
          <Feature text="Sales reports & analytics" />
        </div>

        {/* carousel indicators */}
        <div className="mt-4 flex gap-2">
          {slides.map((s, i) => (
            <button key={s.id} onClick={() => setIdx(i)} className={`w-2 h-2 rounded-full ${i === idx ? 'bg-white' : 'bg-white/50'}`}></button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Feature({ text }) {
  return (
    <div className="flex items-start gap-3">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/90 mt-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
      </svg>
      <div className="text-sm opacity-95">{text}</div>
    </div>
  );
}
