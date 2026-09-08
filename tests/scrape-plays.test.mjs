import assert from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';
import { parsePlayHtml } from '../scripts/scrape-plays.mjs';

console.log('🧪 Testing parsePlayHtml with real and synthetic samples...');

// 1. Synthetic test sample
const sampleHtml = `
  <html>
    <body>
      <h2 id="ad-name">Hamlet</h2>
      <figure class="widget only-img">
        <a href="https://tiyatrolar.com.tr/files/activity/h/hamlet/gallery/hamlet.jpg">
          <img class="first-image" src="https://tiyatrolar.com.tr/files/activity/h/hamlet/gallery/hamlet.jpg" />
        </a>
      </figure>
      <ul class="details">
        <li><i class="ico-location"></i> <a class="tg_name">Şehir Tiyatroları</a></li>
        <li><i class="ico-pin"></i> <a>Harbiye Muhsin Ertuğrul</a></li>
        <li><i class="ico-tur"></i> <a>Klasik</a>, <a>Trajedi</a></li>
        <li><i class="ico-tag"></i> <a>Shakespeare</a></li>
        <li><i class="ico-sure"></i> 2 Perde / 150 dak</li>
        <li><i class="ico-tarih"></i> 15.11.2023</li>
      </ul>
      <figure class="rating">8.8</figure>
      <span id="counter_num_of_voter">420</span>
      <div class="expand"><p>Danimarka Prensi Hamlet'in intikam trajedisi.</p></div>
      <a class="activity_detail_performer_box oyuncu">
        <figcaption><h5 class="wrp">Ahmet Rıfat Şungar</h5></figcaption>
      </a>
      <a class="activity_detail_performer_box oyuncu">
        <figcaption><h5 class="wrp">Damla Sönmez</h5></figcaption>
      </a>
      <h2>Sahne Arkası</h2>
      <div class="col-xs-3">
        <figcaption><h5 class="wrp">William Shakespeare</h5><span title="Yazar">Yazar</span></figcaption>
      </div>
      <div class="col-xs-3">
        <figcaption><h5 class="wrp">Engin Alkan</h5><span title="Yönetmen">Yönetmen</span></figcaption>
      </div>
    </body>
  </html>
`;

const play = parsePlayHtml(sampleHtml, 'hamlet');

assert.strictEqual(play.id, 'hamlet');
assert.strictEqual(play.title, 'Hamlet');
assert.strictEqual(play.playwright, 'William Shakespeare');
assert.strictEqual(play.director, 'Engin Alkan');
assert.deepStrictEqual(play.cast, ['Ahmet Rıfat Şungar', 'Damla Sönmez']);
assert.strictEqual(play.company, 'Şehir Tiyatroları');
assert.strictEqual(play.venue, 'Harbiye Muhsin Ertuğrul');
assert.strictEqual(play.duration, 150);
assert.strictEqual(play.hasIntermission, true);
assert.strictEqual(play.year, 2023);
assert.strictEqual(play.rating, 4.4); // 8.8 / 2
assert.strictEqual(play.reviewCount, 420);
assert.strictEqual(play.synopsis, "Danimarka Prensi Hamlet'in intikam trajedisi.");
assert.ok(play.tags.includes('Klasik'));
assert.ok(play.tags.includes('Trajedi'));
assert.ok(play.tags.includes('Shakespeare'));
assert.ok(play.tags.includes('Şehir Tiyatroları'));

console.log('  ✅ Synthetic sample parsed with 100% assertion matches.');

// 2. Real HTML sample if available in /tmp
if (existsSync('/tmp/sample_kel_diva.html')) {
  const kelDivaHtml = readFileSync('/tmp/sample_kel_diva.html', 'utf-8');
  const kd = parsePlayHtml(kelDivaHtml, 'kel-diva');
  assert.strictEqual(kd.title, 'Kel Diva');
  assert.strictEqual(kd.playwright, 'Eugène Ionesco');
  assert.strictEqual(kd.director, 'Muharrem Özcan');
  assert.ok(kd.cast.includes('Haluk Bilginer'));
  assert.strictEqual(kd.company, 'Oyun Atölyesi');
  assert.strictEqual(kd.hasIntermission, false);
  console.log('  ✅ Real Kel Diva sample parsed and verified.');
}

console.log('🎉 All parser tests passed successfully!\n');
