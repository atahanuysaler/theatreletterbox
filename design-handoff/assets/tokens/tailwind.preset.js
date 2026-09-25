// Tiyatronot — Tailwind preset (proje Tailwind kullanıyorsa: presets: [require('./design-handoff/assets/tokens/tailwind.preset.js')])
// Değerler tokens.css ile birebir aynıdır. Tailwind kullanılmıyorsa bu dosyayı yok sayın.
module.exports = {
  theme: {
    extend: {
      colors: {
        tn: {
          red: '#BA1B23', ink: '#1C1A1B', page: '#E9E4DC', surface: '#F1EDE7', card: '#F6F3EE',
          ticket: '#FFFCF7', line: '#E2DCD4', 'line-strong': '#D8D2CA',
          blush: '#F4D3CE', sage: '#D6E0D3', sand: '#F1E3C4', 'sand-light': '#FAF1DD',
          lilac: '#D9CFF2', 'lilac-strong': '#CFC3F1', 'lilac-stripe': '#C0B2EA', ochre: '#E4B33A',
          'text-2': '#4A4541', 'text-3': '#5E5852', muted: '#6E6862', faint: '#9A928A', 'on-dark-muted': '#B8B0A8',
        },
      },
      fontFamily: { serif: ['Newsreader', 'Georgia', 'Times New Roman', 'serif'] },
      fontWeight: { regular: '400', semibold: '600', bold: '800' },
      spacing: { gutter: '6px' },
      borderRadius: { container: '22px', block: '16px', inner: '14px', control: '12px' },
      boxShadow: {
        seg: '0 1px 3px rgba(28,26,27,.14)',
        ticket: '0 1px 2px rgba(28,26,27,.06), 0 8px 22px rgba(28,26,27,.07)',
        float: '0 2px 8px rgba(28,26,27,.12)',
        bar: '0 4px 24px rgba(28,26,27,.16), 0 0 0 1px rgba(28,26,27,.05)',
        drawer: '0 20px 60px rgba(28,26,27,.25)',
      },
      minHeight: { touch: '44px' }, minWidth: { touch: '44px' },
    },
  },
};
