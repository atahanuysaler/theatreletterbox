const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '../theatre.db'));

const plays = [
  {
    title: "Notre Dame'ın Kamburu Müzikali",
    theatre: "Zorlu PSM",
    city: "Istanbul",
    description: "Victor Hugo'nun ölümsüz eseri Notre Dame'ın Kamburu, muhteşem bir müzikal uyarlamasıyla sahnede. Quasimodo'nun dramatik hikayesi, etkileyici müzik ve koreografilerle hayat buluyor.",
    start_date: "2024-01-20",
    end_date: "2024-03-31",
    poster_url: "https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg"
  },
  {
    title: "Amadeus",
    theatre: "Zorlu PSM",
    city: "Istanbul",
    description: "Peter Shaffer'ın ödüllü oyunu, Mozart ve Salieri arasındaki rekabeti ve müziğin büyülü dünyasını sahneye taşıyor. Deha ve kıskançlık temasını işleyen etkileyici bir prodüksiyon.",
    start_date: "2024-02-01",
    end_date: "2024-03-15",
    poster_url: "https://images.pexels.com/photos/462510/pexels-photo-462510.jpeg"
  },
  {
    title: "Bir Delinin Hatıra Defteri",
    theatre: "Zorlu PSM",
    city: "Istanbul",
    description: "Gogol'ün başyapıtı, modern bir yorumla seyirciyle buluşuyor. Bir memurun giderek artan deliliğini anlatan bu tek kişilik oyun, insanın iç dünyasına çarpıcı bir bakış sunuyor.",
    start_date: "2024-02-15",
    end_date: "2024-03-30",
    poster_url: "https://images.pexels.com/photos/3328058/pexels-photo-3328058.jpeg"
  },
  {
    title: "Westend",
    theatre: "Zorlu PSM",
    city: "Istanbul",
    description: "Modern dans ve tiyatronun muhteşem birleşimi. Londra'nın ünlü West End bölgesinden ilham alan bu gösteri, çağdaş koreografi ve etkileyici müzikleriyle büyülüyor.",
    start_date: "2024-02-10",
    end_date: "2024-03-20",
    poster_url: "https://images.pexels.com/photos/2188012/pexels-photo-2188012.jpeg"
  },
  {
    title: "Sevgili Arsız Ölüm",
    theatre: "Zorlu PSM",
    city: "Istanbul",
    description: "Latife Tekin'in çok sevilen romanı, büyülü gerçekçilik akımının tiyatro sahnesindeki yansıması olarak karşımıza çıkıyor. Dirmit'in hikayesi, geleneksel ve modern anlatım teknikleriyle harmanlanıyor.",
    start_date: "2024-02-20",
    end_date: "2024-04-01",
    poster_url: "https://images.pexels.com/photos/2372945/pexels-photo-2372945.jpeg"
  }
];

db.serialize(() => {
  const stmt = db.prepare(`
    INSERT INTO plays (title, theatre, city, description, start_date, end_date, poster_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  plays.forEach(play => {
    stmt.run(
      play.title,
      play.theatre,
      play.city,
      play.description,
      play.start_date,
      play.end_date,
      play.poster_url
    );
  });

  stmt.finalize();

  console.log('Plays have been added to the database.');
  db.close();
});