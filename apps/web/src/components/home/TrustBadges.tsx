const stats = [
  { value: '500+', label: 'Carros vendidos' },
  { value: '4.9', label: 'Avaliação média' },
  { value: '100%', label: 'Verificados' },
  { value: '24h', label: 'Resposta média' },
];

export function TrustBadges() {
  return (
    <section className="py-12 border-t border-border bg-muted/30">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-4"
            >
              <span className="text-3xl md:text-4xl font-bold gradient-kairos-text">
                {stat.value}
              </span>
              <p className="text-sm text-muted-foreground mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
