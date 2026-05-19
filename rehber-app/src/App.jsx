import { useState } from "react";

const SLIDES = [
  {
    id: 1,
    emoji: "🍽️",
    baslik: "Kapak Slaytı",
    altbaslik: "Akıllı Restoran Sipariş Sistemi",
    renk: "#38BDF8",
    anlatim: [
      "Hocam, bu proje adına **mikro_rest** — yani 'microservice restaurant' kelimelerinin birleşimi. Projenin ismini bile mimariyi yansıtacak şekilde seçtim.",
      "Proje bir restoranın temel operasyonlarını — menü yönetimi, sipariş alma ve mutfak takibini — **mikroservis mimarisi** kullanarak yeniden tasarlamaktadır.",
      "Teknoloji seçimlerinde kasıtlı kararlar aldım: Backend'de **Java 17 ve Spring Boot 3.2**, frontend'de **React 19 ve Vite 8**, veritabanında **PostgreSQL 16**, container yönetiminde **Docker Compose** kullandım.",
      "Tüm bu teknolojiler günümüzün **enterprise standartlarını** karşılamaktadır ve production ortamlarında aktif olarak kullanılmaktadır.",
    ],
    ipuclari: [
      "Projenin ismini açıklarken kendinize güvenli bir şekilde sunun — 'mikro + rest(aurant)' kombinasyonu bilinçli bir seçimdir.",
      "Teknoloji listesini okumak yerine 'neden bu teknolojileri seçtim' vurgusunu yapın.",
    ],
  },
  {
    id: 2,
    emoji: "📊",
    baslik: "Proje Özeti",
    altbaslik: "Sayılarla Sistem",
    renk: "#34D399",
    anlatim: [
      "Sistemi birkaç temel rakamla özetleyebilirim: **5 mikroservis** (Eureka, Gateway, Menu, Order, Kitchen), **3 bağımsız PostgreSQL veritabanı**, **9 Docker container** ve **21'den fazla REST endpoint**.",
      "Projenin temel amacı gerçek bir restoran senaryosunu simüle etmektir: Bir müşteri menüyü görür, sipariş verir; bu sipariş otomatik olarak mutfağa iletilir; mutfak siparişi hazırlar ve sistem her adımda güncellenir.",
      "**Database per Service** prensibi uyguladım — yani her mikroservisin kendi veritabanı var. Bu, servislerin birbirinden tamamen bağımsız olmasını sağlıyor.",
      "Tüm sistemi başlatmak için tek bir komut yeterli: `docker-compose up --build`. Bu, sistemi herhangi bir makinede tekrarlanabilir şekilde çalıştırabildiğimi gösterir.",
    ],
    ipuclari: [
      "Rakamları sıralarken 'neden 3 veritabanı?' sorusunu kendiniz sorup cevaplarsanız çok güçlü bir izlenim bırakırsınız.",
      "docker-compose komutunu bir demo olarak göstermek imkânınız varsa mutlaka gösterin.",
    ],
  },
  {
    id: 3,
    emoji: "⚙️",
    baslik: "Teknoloji Yığını",
    altbaslik: "Neden Bu Teknolojiler?",
    renk: "#F59E0B",
    anlatim: [
      "**Backend** tarafında Java 17 ve Spring Boot 3.2.5 kullandım. Spring Boot 3.x, Java 17'nin sanal thread desteği ve modern GraalVM native image özellikleriyle uyumludur.",
      "**Spring Cloud** ekosistemi bize hazır mikroservis altyapısı sunar: Eureka ile servis keşfi, Spring Cloud Gateway ile akıllı yönlendirme, Load Balancer ile yük dağıtımı.",
      "**Frontend**'de React 19 tercih ettim çünkü context API ve hooks ile global state yönetimi için harici kütüphane (Redux gibi) gerektirmiyor. Vite 8 ile geliştirme sunucusu milisaniyeler içinde ayağa kalkıyor.",
      "**PostgreSQL 16** seçimim, JSON desteği, ACID uyumluluğu ve production-grade güvenilirliği nedeniyle oldu. Alpine imajı kullanarak container boyutunu minimize ettim.",
      "**Docker Compose** ile tüm 9 container'ı tek bir YAML dosyasıyla tanımladım ve her servis için health check yapılandırdım — servisler sağlıklı olmadan bağımlı servisler başlamaz.",
    ],
    ipuclari: [
      "Her teknolojiyi 'ne işe yarar' değil 'neden bunu seçtim' perspektifinden anlatın — bu kritik düşünce yeteneğinizi gösterir.",
      "Zuul yerine Spring Cloud Gateway seçimini mutlaka vurgulayın — bu Boot 3.x uyumluluk bilginizi kanıtlar.",
    ],
  },
  {
    id: 4,
    emoji: "🏗️",
    baslik: "Sistem Mimarisi",
    altbaslik: "Servisler Arası İletişim",
    renk: "#A78BFA",
    anlatim: [
      "Mimariyi yukarıdan aşağıya açıklayayım: **React Frontend**, kullanıcı arayüzüdür. Tüm API isteklerini doğrudan servislere değil, **API Gateway**'e gönderir.",
      "**API Gateway** (port 8080), sisteme giriş noktasıdır. Gelen istekleri path'e göre ilgili servise yönlendirir: `/menu/**` → menu-service, `/order/**` → order-service, `/kitchen/**` → kitchen-service. **StripPrefix=1** ile prefix kaldırılır.",
      "**Eureka Server** (port 8761), tüm servislerin kayıt olduğu servis keşif sunucusudur. Gateway ve diğer servisler, birbirlerinin adresini Eureka'dan öğrenir — IP adresi hardcode edilmez.",
      "**Servisler arası iletişim** `@LoadBalanced RestTemplate` ile gerçekleşir. Order Service yeni sipariş alınca Kitchen Service'e bildirim gönderir. Kitchen Service durum değişince Order Service'i günceller.",
      "Bu mimari **loose coupling** sağlar: Eğer Kitchen Service çökerse, Order Service çalışmaya devam eder — sipariş kaydedilir, mutfak bildirimi loglanır ve retry mekanizmasıyla tekrar denenir.",
    ],
    ipuclari: [
      "Diyagramı gösterirken ok yönlerini takip edin — tek yönlü veri akışını netçe anlatın.",
      "'Eğer bir servis çökerse ne olur?' sorusunu kendiniz sorup cevaplamak hocanızı etkiler.",
    ],
  },
  {
    id: 5,
    emoji: "🔄",
    baslik: "Sipariş Yaşam Döngüsü",
    altbaslik: "Uçtan Uca Akış",
    renk: "#F472B6",
    anlatim: [
      "Bir siparişin hayatını başından sonuna anlatalım. Müşteri `POST /order/api/orders` endpoint'ine sipariş detaylarını gönderir.",
      "**Order Service** siparişi veritabanına kaydeder, status'ü **PLACED** olarak set eder. Ardından *aynı transaction içinde değil*, asenkron olarak Kitchen Service'e `POST /api/kitchen-orders` isteği gönderir.",
      "**Kitchen Service** bu siparişi alır ve kendi veritabanına **RECEIVED** status'üyle kaydeder. Şef hazırlamaya başlayınca status **PREPARING** olur — bu anda Kitchen Service, Order Service'e `PUT /api/orders/{id}/status?status=PREPARING` isteği gönderir.",
      "Sipariş tamamlanınca Kitchen **COMPLETED** olur ve yine Order Service güncellenir. Böylece her iki servis de tutarlı durumda olur.",
      "**Durum geçiş kuralları** katıdır: Kitchen sadece RECEIVED→PREPARING→COMPLETED yönünde gidebilir. Geri alamazsınız. Order tarafında ise PLACED veya PREPARING iken iptal edilebilir, ama COMPLETED sipariş iptal edilemez — bu `IllegalStateException` fırlatır.",
    ],
    ipuclari: [
      "Bu akışı anlatırken ellerinizi kullanın — 'buradan buraya gidiyor' gibi fiziksel bir akış hissi verin.",
      "IllegalStateException örneğini mutlaka vurgulayın — bu validasyon mantığınızı gösterir.",
    ],
  },
  {
    id: 6,
    emoji: "🔌",
    baslik: "REST API Endpoint'leri",
    altbaslik: "21+ Endpoint, 3 Servis",
    renk: "#34D399",
    anlatim: [
      "Sistem toplam 21'den fazla REST endpoint'e sahip, bunlar 3 servise dağıtılmış durumda. Her endpoint Gateway üzerinden `/servis-adı/api/...` formatında erişilebilir.",
      "**Menu Service** 9 endpoint'e sahip: CRUD işlemleri, kategori filtreleme, isim arama ve availability toggle. Toggle endpoint'i PATCH kullandım çünkü kaynağın sadece bir özelliğini değiştiriyoruz.",
      "**Order Service** 7 endpoint: Sipariş oluşturma, listeleme, durum/masa numarasına göre filtreleme ve iptal. Sipariş oluşturmak (POST) Kitchen Service'e otomatik bildirim tetikler.",
      "**Kitchen Service** 6 endpoint: Mutfak siparişlerini listeleme, durum güncelleme ve not ekleme. Bu servis normalde sadece mutfak ekranında kullanılır, müşteriye açık değildir.",
      "REST prensiplerini doğru uyguladım: Veri getirme için GET, oluşturma için POST, tam güncelleme için PUT, kısmi güncelleme için PATCH, silme için DELETE. HTTP metodlarını anlamlı şekilde kullandım.",
    ],
    ipuclari: [
      "Neden PATCH vs PUT ayrımı yaptığınızı açıklayabilirseniz çok güçlü bir teknik bilgi gösterirsiniz.",
      "Gateway'in StripPrefix=1 nasıl çalışır sorusuna hazırlıklı olun.",
    ],
  },
  {
    id: 7,
    emoji: "⚛️",
    baslik: "Frontend Mimarisi",
    altbaslik: "React 19 + Context API",
    renk: "#38BDF8",
    anlatim: [
      "Frontend **React 19** ve **React Router 7** ile geliştirildi. 5 sayfa var: Dashboard (genel özet), Menu Management (CRUD), Order Page (sipariş oluşturma), Orders List (sipariş takibi), Kitchen Board (mutfak paneli).",
      "State yönetimi için **Context API** kullandım, Redux gibi harici bir kütüphane seçmedim. İki temel context var: **CartContext** (sepet yönetimi) ve **ToastContext** (bildirim sistemi).",
      "**CartContext** şunları yönetir: addItem, removeItem, updateQuantity, clearCart fonksiyonları ve sepet toplamı ile ürün sayısı. Bu state tüm uygulama boyunca erişilebilir.",
      "**api.js** dosyası tüm HTTP isteklerini merkezi bir yerden yönetir: menuApi (8 fonksiyon), orderApi (7 fonksiyon), kitchenApi (6 fonksiyon). Bu, endpoint değişikliğinde sadece bir dosyayı güncellememizi sağlar.",
      "**Proxy yapısı** iki ortam için ayrı: Development'ta Vite proxy (`/menu`, `/order`, `/kitchen` → `localhost:8080`), Production'da Nginx reverse proxy (`api-gateway:8080`). Bu sayede frontend kodu hiç değişmeden her iki ortamda da çalışır.",
    ],
    ipuclari: [
      "'Neden Redux kullanmadın?' sorusuna hazır olun — Context API bu proje için yeterlidir, over-engineering yapmaktan kaçındım.",
      "Proxy yapısını anlatmak frontend ve backend arasındaki CORS sorunlarını nasıl çözdüğünüzü de gösterir.",
    ],
  },
  {
    id: 8,
    emoji: "🐳",
    baslik: "Docker & Deployment",
    altbaslik: "9 Container, 1 Komut",
    renk: "#A78BFA",
    anlatim: [
      "Sistemin tamamı `docker-compose up --build` komutuyla ayağa kalkar. 9 container var: 3 PostgreSQL veritabanı, Eureka Server, API Gateway, 3 iş servisi ve React frontend.",
      "**Multi-stage build** stratejisi uyguladım. Java servisleri için: Stage 1'de Maven ile proje derlenir (maven:3.9-eclipse-temurin-17), Stage 2'de sadece JRE ile çalıştırılır (eclipse-temurin:17-jre-alpine). Bu sayede final image çok daha küçük olur — JDK ve Maven araçları son image'a dahil edilmez.",
      "Frontend için: Stage 1'de Node.js ile Vite build alınır, Stage 2'de sadece statik dosyalar Nginx'e kopyalanır. Nginx hem dosyaları serve eder hem de API Gateway'e proxy yapar.",
      "**Health check** mekanizması kurdum: Veritabanları sağlıklı olmadan servisler başlamaz, Eureka sağlıklı olmadan Gateway ve diğer servisler başlamaz. `depends_on` + `condition: service_healthy` ile bunu sağladım.",
      "Veriler **persistent volume** ile saklanır: `menu-db-data`, `order-db-data`, `kitchen-db-data`. `docker-compose down` yapılsa bile veriler kaybolmaz, sadece `down -v` ile silinir.",
    ],
    ipuclari: [
      "Multi-stage build'in neden önemli olduğunu (image boyutu, güvenlik, best practice) açıklayabilirseniz çok iyi bir izlenim bırakırsınız.",
      "Health check mekanizmasını anlatmak production-ready düşündüğünüzü gösterir.",
    ],
  },
  {
    id: 9,
    emoji: "🎯",
    baslik: "Tasarım Kararları",
    altbaslik: "Neden Bu Kararları Aldım?",
    renk: "#F59E0B",
    anlatim: [
      "**Database per Service**: Her servisin kendi veritabanı var. Bu mikroservislerin temel prensibidir. Eğer tek bir veritabanı kullansaydım, servisler arasında schema coupling oluşurdu ve bir tablodaki değişiklik tüm sistemi etkilerdi.",
      "**Spring Cloud Gateway (Zuul yerine)**: Zuul, Spring Boot 2.x'in synchronous modeliyle çalışır ve Boot 3.x ile uyumsuz hale gelmiştir. Spring Cloud Gateway ise reactive (non-blocking) mimarisine sahip ve modern Spring Boot ile tam uyumludur.",
      "**Best-Effort İletişim**: Order Service, Kitchen Service'e bildirim gönderirken hata olursa sipariş yine de kaydedilir. Bu 'graceful degradation' prensibidir — kısmi hata tüm sistemi çökertmez.",
      "**JPA ddl-auto: update**: Flyway veya Liquibase gibi migration aracı kullanmadım. Bu proje için şema otomatik yönetimi yeterlidir. Production'da Flyway eklenmesi önerilir — bu bir trade-off kararıdır.",
      "**Durum Geçiş Validasyonu**: İş kurallarını servis katmanında uyguladım. Geçersiz bir durum geçişi `IllegalStateException` fırlatır. Bu, veri tutarlılığını database seviyesinde değil, uygulama seviyesinde korur.",
    ],
    ipuclari: [
      "Her kararı 'alternatifleri değerlendirdim ve şunu seçtim çünkü...' formatında sunun — bu mühendislik olgunluğunuzu gösterir.",
      "Trade-off'ları kabul edin: 'ddl-auto: update production için ideal değildir ama proje kapsamı için yeterlidir' demek, zayıflığı saklamaktan çok daha iyi bir izlenim bırakır.",
    ],
  },
  {
    id: 10,
    emoji: "🙌",
    baslik: "Kapanış",
    altbaslik: "Özet & Sorular",
    renk: "#34D399",
    anlatim: [
      "Bu proje, gerçek dünya yazılım geliştirme pratiklerini bir arada uygulayan kapsamlı bir full-stack çalışmadır.",
      "**Mikroservis mimarisi** ile bağımsız deploy, bağımsız ölçeklendirme ve teknoloji çeşitliliği sağlandı. **Docker** ile ortam bağımsızlığı ve tekrarlanabilir deployment elde edildi.",
      "**Spring Cloud** ekosistemi ile production-grade servis keşfi ve API yönetimi implement edildi. **React 19** ile modern, reaktif bir kullanıcı arayüzü geliştirildi.",
      "Proje boyunca RESTful prensipler, separation of concerns, fail-fast ve graceful degradation gibi yazılım mühendisliği ilkelerine bağlı kaldım.",
      "Geliştirilebilecek alanlar: Message queue (RabbitMQ/Kafka) ile asenkron iletişim, JWT tabanlı authentication, Circuit Breaker pattern (Resilience4j), ve production-grade monitoring (Prometheus + Grafana).",
    ],
    ipuclari: [
      "Kapanışta 'geliştirilebilecek alanlar' söylemek çok güçlüdür — sisteminizin sınırlarını ve nasıl evrilebileceğini bildiğinizi gösterir.",
      "Sorular bölümüne sakin ve hazırlıklı geçin — aşağıdaki soru-cevap bölümünü iyi çalışın!",
    ],
  },
];

const SORULAR = [
  {
    kategori: "Mimari",
    renk: "#38BDF8",
    sorular: [
      {
        soru: "Neden mikroservis mimarisi seçtiniz? Monolith daha basit olmaz mıydı?",
        cevap: `Haklı bir soru. Monolith başlangıçta daha hızlı geliştirme sağlar. Ama mikroservis mimarisini seçmemin üç temel nedeni var:

**1. Bağımsız Ölçeklendirme:** Yoğun sipariş dönemlerinde sadece Order Service'i scale edebiliriz. Monolith'te tüm sistemi büyütmek zorunda kalırdık.

**2. Hata İzolasyonu:** Kitchen Service çökse bile Order Service çalışmaya devam eder. Monolith'te tek bir hata tüm sistemi etkileyebilir.

**3. Teknoloji Bağımsızlığı:** İlerleyen süreçte Kitchen Service'i Go veya Python ile yeniden yazabilirim. Monolith'te bu mümkün olmaz.

Evet, bu proje ölçeği için monolith de çalışırdı — ama bu projenin amacı mikroservis pratiklerini öğrenmek ve uygulamaktı.`,
        seviye: "Orta",
      },
      {
        soru: "Eureka Server çökerse ne olur? Single point of failure değil mi?",
        cevap: `Çok iyi bir soru, bu gerçek bir zayıf nokta!

**Kısa vadeli etki:** Eureka çökerse yeni servis kayıtları ve keşifler durur. Ancak her client (Gateway, Order Service, Kitchen Service) **yerel önbellekte** (local cache) kayıtlı servis listesini tutar. Bu sayede kısa süreli Eureka kesintisinde servisler birbirini bulmaya devam edebilir.

**Uzun vadeli çözüm:** Production ortamında Eureka **cluster** olarak çalıştırılır — birden fazla Eureka instance birbirini peer olarak tanır. Bir instance çökse diğerleri devam eder.

Bu projede single instance kullandım çünkü eğitim amaçlı bir projedir. Production için \`eureka.client.serviceUrl.defaultZone\` birden fazla Eureka URL'i içerecek şekilde yapılandırılırdı.`,
        seviye: "İleri",
      },
      {
        soru: "Servisler arası iletişimde neden REST kullandınız? gRPC veya message queue daha iyi olmaz mıydı?",
        cevap: `Her yaklaşımın trade-off'ları var:

**REST (mevcut seçim):** Basit, debug kolay, herkes anlar. Dezavantajı: synchronous — Order Service Kitchen Service'i çağırdığında cevap beklenir.

**Message Queue (RabbitMQ/Kafka):** Asenkron iletişim sağlar. Order Service mesajı kuyruğa bırakır, işini bitirir. Kitchen Service hazır olduğunda mesajı alır. Bu daha dayanıklı ama daha karmaşık bir altyapı gerektirir.

**gRPC:** Binary protokol, çok hızlı. Tip güvenliği var. Ama debugging zorlaşır, browser'dan direkt erişilemez.

Bu proje için REST seçimim bilinçliydi: Konsept kanıtlamak için yeterliydi. Gerçek production sisteminde Order→Kitchen bildirimini Kafka üzerinden asenkron yapardım. Bu hem \`fire-and-forget\` semantiği verir hem de Kitchen Service yavaş olsa Order Service bloklanmaz.`,
        seviye: "İleri",
      },
    ],
  },
  {
    kategori: "Teknik Detaylar",
    renk: "#34D399",
    sorular: [
      {
        soru: "StripPrefix=1 ne anlama geliyor? Neden gerekli?",
        cevap: `Gateway'e gelen istek: \`GET /menu/api/menu-items\`

StripPrefix=1 olmadan Menu Service şunu alır: \`/menu/api/menu-items\`
Ama Menu Service'in controller'ı \`/api/menu-items\`'ı bekliyor.

StripPrefix=1 ile Gateway, path'teki ilk segmenti ('/menu') kaldırarak isteği gönderir:
Servis şunu alır: \`/api/menu-items\` ✓

Yani prefix, sadece Gateway'in yönlendirme için kullandığı bir etiket — servisin kendi API yoluna dahil değil. Bu sayede her servis kendi context'inde çalışıyor, Gateway prefix'inden habersiz.`,
        seviye: "Orta",
      },
      {
        soru: "@LoadBalanced RestTemplate ne iş yapıyor?",
        cevap: `Normal RestTemplate ile şöyle çağırırsınız:
\`http://192.168.1.5:8083/api/kitchen-orders\`

Bu IP adresi değişirse kod bozulur.

@LoadBalanced RestTemplate ile:
\`http://kitchen-service/api/kitchen-orders\`

Burada 'kitchen-service', Eureka'ya kayıtlı servis adıdır. Spring bu URL'i görünce Eureka'ya sorar: "kitchen-service hangi IP:port'ta?", Eureka cevaplar, Spring gerçek adrese istek gönderir.

Bonus: Eğer aynı isimle birden fazla instance kayıtlıysa, @LoadBalanced otomatik olarak Round Robin ile yük dağıtır. IP'yi hardcode etmeden load balancing!`,
        seviye: "Orta",
      },
      {
        soru: "Transaction yönetimini nasıl hallettiniz? Sipariş kaydedilip Kitchen bildirimi başarısız olursa ne olur?",
        cevap: `Bu distributed systems'ın klasik problemi: **distributed transaction**.

**Mevcut yaklaşım (Best-Effort):**
Order Service, siparişi veritabanına kaydeder (@Transactional ile). Bu başarılı olduktan SONRA Kitchen Service'e istek gönderir. Kitchen bildirimi başarısız olursa sipariş yine veritabanında kalır, hata loglanır.

**Sonuç:** Sipariş var ama mutfak bilmiyor. Bu bir tutarsızlık.

**Production çözümü — Saga Pattern:**
1. **Choreography:** Order Service event yayınlar (Kafka), Kitchen Service dinler. Başarısız olursa compensating transaction tetiklenir.
2. **Outbox Pattern:** Kitchen bildirimi, sipariş ile aynı DB transaction'ında "outbox" tablosuna yazılır. Ayrı bir process bu tabloyu okuyup Kitchen'a gönderir.

Bu projede best-effort seçtim çünkü eğitim bağlamında daha anlaşılır. Ama gerçek dünya uygulaması için Saga Pattern veya Outbox Pattern gerekir.`,
        seviye: "İleri",
      },
      {
        soru: "ddl-auto: update neden tehlikelidir?",
        cevap: `ddl-auto: update, Hibernate'in mevcut şemayı entity class'larına göre otomatik güncellemesi demektir.

**Neden tehlikeli:**
- Sütun eklemek → sorun yok
- Sütun adı değiştirmek → Hibernate ESKİ sütunu bırakır, YENİ sütun ekler. Veri kaybolur!
- Sütun silmek → Hibernate hiçbir şey yapmaz, sütun veritabanında kalır
- Tip değiştirmek → Hata veya sessiz veri kaybı

**Doğru yöntem — Flyway:**
\`\`\`sql
-- V1__init.sql
CREATE TABLE menu_items (...);

-- V2__add_column.sql  
ALTER TABLE menu_items ADD COLUMN rating DECIMAL;
\`\`\`
Her migration versiyonlanır, test edilir, rollback yapılabilir.

Bu projede update kullandım çünkü geliştirme hızına öncelik verdim. Production'a alacak olsam ilk iş \`ddl-auto: validate\` yapıp Flyway entegre ederdim.`,
        seviye: "Orta",
      },
    ],
  },
  {
    kategori: "Frontend & API",
    renk: "#F59E0B",
    sorular: [
      {
        soru: "Neden Redux yerine Context API kullandınız?",
        cevap: `Redux çok güçlü ama bu proje için aşırıya kaçmak (over-engineering) olurdu.

**Context API yeterli çünkü:**
- Sepet verisi küçük ve basit
- Component tree çok derin değil
- Time-travel debugging veya middleware ihtiyacı yok
- Ek dependency (redux, react-redux) gerektirmiyor

**Redux ne zaman gerekir:**
- 10+ geliştirici olan büyük ekipler
- Karmaşık state güncellemeleri ve yan etkiler
- Detaylı debug ve replay ihtiyacı

Context'in dezavantajı: Her state değişiminde o context'i kullanan tüm component'lar re-render olur. Bu projede performans sorunu yaratmadı. Büyük ölçekte useMemo ve useCallback ile optimize edilebilir.`,
        seviye: "Kolay",
      },
      {
        soru: "CORS sorununu nasıl çözdünüz?",
        cevap: `CORS (Cross-Origin Resource Sharing) browser'ın güvenlik kuralıdır: Farklı origin'den gelen istekleri engeller.

**Development'ta çözüm — Vite Proxy:**
Frontend :3000'den, Backend :8080'e doğrudan istek → Browser CORS hatası verir.

Vite proxy ile: Frontend → Vite (:3000) → Gateway (:8080)
Browser Vite'a istek yaptığını sanır, same-origin, sorun yok.

**Production'da çözüm — Nginx Proxy:**
Frontend ve Nginx aynı container'da → Nginx, /menu, /order, /kitchen isteklerini api-gateway:8080'e yönlendirir → Browser her şeyi aynı origin'den (Nginx) istiyor.

**Alternatif:** Spring'de @CrossOrigin veya CorsFilter ile CORS header eklemek. Ama bu approach daha az güvenli (whitelist yönetimi karmaşıklaşır) ve proxy yaklaşımı daha temizdir.`,
        seviye: "Orta",
      },
    ],
  },
  {
    kategori: "Güvenlik & Production",
    renk: "#F472B6",
    sorular: [
      {
        soru: "Sisteminizde authentication/authorization var mı? Güvenli mi?",
        cevap: `Dürüst olmak gerekirse — **authentication bu projede yok**. Bu bilinçli bir kapsam kararıydı.

**Eksik ne:**
- Kullanıcı girişi ve JWT token sistemi
- Role-based access: Müşteri sadece sipariş verebilmeli, admin menüyü yönetebilmeli
- Kitchen Board sadece mutfak personelinin erişmesi gereken bir ekran
- API Gateway'de token doğrulama filter'ı

**Nasıl eklenir:**
Spring Security + JWT ile:
1. Auth Service eklenir (login → JWT token döner)
2. API Gateway'de GlobalFilter ile her istek için token doğrulanır
3. Servislerde @PreAuthorize ile endpoint bazlı yetki kontrolü

Bu bir TODO — gerçek bir ürüne dönüştürmek için mutlaka eklenmesi gereken bir özellik.`,
        seviye: "Orta",
      },
      {
        soru: "Sisteminizi nasıl test ettiniz?",
        cevap: `Test stratejim birkaç katmanlıydı:

**Manuel Test:**
Postman ile tüm endpoint'leri test ettim. Her servis için request collection hazırladım.

**Integration Test:**
Docker Compose ortamında uçtan uca senaryoları test ettim: Sipariş oluştur → Kitchen'da göründüğünü kontrol et → Durum değiştir → Order'da güncellendiğini doğrula.

**Eksik olan (production'da olması gereken):**
- Unit Test: JUnit 5 + Mockito ile servis katmanı testleri
- Integration Test: @SpringBootTest + TestContainers ile gerçek DB'ye karşı test
- Contract Test: Servisler arası API sözleşmesi (Pact)
- Load Test: k6 veya JMeter ile yük testi

Test coverage bu projenin geliştirilebilecek en önemli alanlarından biri.`,
        seviye: "Orta",
      },
      {
        soru: "Bu sistemi production'a almak için ne yapmanız gerekir?",
        cevap: `Birçok kritik alan var:

**Güvenlik:**
- JWT authentication + Spring Security
- HTTPS (TLS/SSL sertifikası)
- Secrets yönetimi (şifreler env'de değil, Vault veya K8s secrets'ta)
- API rate limiting

**Güvenilirlik:**
- Circuit Breaker (Resilience4j) — başarısız servis çağrılarında fallback
- Distributed tracing (Zipkin/Jaeger) — isteklerin tüm sistemi nasıl geçtiğini izleme
- Centralized logging (ELK Stack)
- Health check endpoint'leri (/actuator/health) — zaten var!

**Ölçeklenebilirlik:**
- Kubernetes (Docker Compose production için yeterli değil)
- Horizontal Pod Autoscaling
- Database connection pooling (HikariCP — Spring Boot ile geliyor)
- Message Queue (Kafka) ile asenkron iletişim

**Schema Yönetimi:**
- ddl-auto: validate + Flyway migration

Bu proje bu yolculuğun sağlam bir başlangıç noktası.`,
        seviye: "İleri",
      },
    ],
  },
];

const seviyeRenk = {
  Kolay: { bg: "#064e3b", text: "#34d399", border: "#065f46" },
  Orta: { bg: "#1e3a5f", text: "#38bdf8", border: "#1d4ed8" },
  İleri: { bg: "#4a1d3f", text: "#f472b6", border: "#831843" },
};

export default function App() {
  const [aktifTab, setAktifTab] = useState("slaytlar");
  const [aktifSlide, setAktifSlide] = useState(0);
  const [acikSoru, setAcikSoru] = useState(null);
  const [ipucuGoster, setIpucuGoster] = useState(false);

  const slide = SLIDES[aktifSlide];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0f1e 0%, #0f172a 50%, #0d1117 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: "#e2e8f0",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1e293b",
        padding: "0 32px",
        background: "rgba(15,23,42,0.95)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 22 }}>🍽️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#f8fafc" }}>mikro_rest</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>Sunum Rehberi</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { id: "slaytlar", label: "📋 Slayt Anlatımları" },
              { id: "sorular", label: "❓ Soru & Cevap" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setAktifTab(tab.id)} style={{
                padding: "8px 20px",
                borderRadius: 8,
                border: aktifTab === tab.id ? "1px solid #38bdf8" : "1px solid #1e293b",
                background: aktifTab === tab.id ? "rgba(56,189,248,0.12)" : "transparent",
                color: aktifTab === tab.id ? "#38bdf8" : "#64748b",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
                transition: "all 0.2s",
              }}>{tab.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* SLAYTLAR TAB */}
      {aktifTab === "slaytlar" && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", display: "flex", gap: 24 }}>
          {/* Sol: Slide Listesi */}
          <div style={{ width: 260, flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.1em", marginBottom: 12, textTransform: "uppercase" }}>
              10 Slayt
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {SLIDES.map((s, i) => (
                <button key={s.id} onClick={() => setAktifSlide(i)} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: aktifSlide === i ? `1px solid ${s.renk}` : "1px solid #1e293b",
                  background: aktifSlide === i ? `rgba(${hexToRgb(s.renk)},0.1)` : "rgba(30,41,59,0.4)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                  width: "100%",
                }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{s.emoji}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: aktifSlide === i ? s.renk : "#94a3b8", lineHeight: 1.3 }}>
                      {s.id}. {s.baslik}
                    </div>
                    <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.3, marginTop: 2 }}>{s.altbaslik}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sağ: Slide İçeriği */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Header */}
            <div style={{
              borderRadius: 16,
              padding: "24px 28px",
              background: `linear-gradient(135deg, rgba(${hexToRgb(slide.renk)},0.15) 0%, rgba(15,23,42,0.8) 100%)`,
              border: `1px solid rgba(${hexToRgb(slide.renk)},0.3)`,
              marginBottom: 20,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 36 }}>{slide.emoji}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: slide.renk, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                    Slayt {slide.id} / 10
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#f8fafc" }}>{slide.baslik}</div>
                  <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>{slide.altbaslik}</div>
                </div>
              </div>
            </div>

            {/* Anlatım Metni */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
                🎤 Nasıl Anlatacaksınız
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {slide.anlatim.map((paragraf, i) => (
                  <div key={i} style={{
                    padding: "16px 20px",
                    borderRadius: 12,
                    background: "rgba(30,41,59,0.6)",
                    border: "1px solid #1e293b",
                    lineHeight: 1.75,
                    fontSize: 14,
                    color: "#cbd5e1",
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                  }}>
                    <span style={{
                      flexShrink: 0,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: `rgba(${hexToRgb(slide.renk)},0.2)`,
                      border: `1px solid rgba(${hexToRgb(slide.renk)},0.4)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      color: slide.renk,
                      marginTop: 2,
                    }}>{i + 1}</span>
                    <span dangerouslySetInnerHTML={{ __html: renderMarkdown(paragraf) }} />
                  </div>
                ))}
              </div>
            </div>

            {/* İpuçları Toggle */}
            <div>
              <button onClick={() => setIpucuGoster(!ipucuGoster)} style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 8,
                border: "1px solid #f59e0b33",
                background: ipucuGoster ? "rgba(245,158,11,0.12)" : "transparent",
                color: "#f59e0b",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
                marginBottom: 12,
                transition: "all 0.2s",
              }}>
                💡 Sunum İpuçları {ipucuGoster ? "▲" : "▼"}
              </button>
              {ipucuGoster && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {slide.ipuclari.map((ipucu, i) => (
                    <div key={i} style={{
                      padding: "14px 18px",
                      borderRadius: 10,
                      background: "rgba(245,158,11,0.08)",
                      border: "1px solid rgba(245,158,11,0.2)",
                      fontSize: 13,
                      color: "#fcd34d",
                      lineHeight: 1.65,
                      display: "flex",
                      gap: 10,
                    }}>
                      <span style={{ flexShrink: 0 }}>⭐</span>
                      {ipucu}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Navigasyon */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, paddingTop: 20, borderTop: "1px solid #1e293b" }}>
              <button onClick={() => setAktifSlide(Math.max(0, aktifSlide - 1))} disabled={aktifSlide === 0} style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "1px solid #1e293b",
                background: aktifSlide === 0 ? "transparent" : "rgba(30,41,59,0.6)",
                color: aktifSlide === 0 ? "#334155" : "#94a3b8",
                cursor: aktifSlide === 0 ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontSize: 13,
              }}>← Önceki</button>
              <span style={{ fontSize: 12, color: "#475569", alignSelf: "center" }}>{aktifSlide + 1} / {SLIDES.length}</span>
              <button onClick={() => setAktifSlide(Math.min(SLIDES.length - 1, aktifSlide + 1))} disabled={aktifSlide === SLIDES.length - 1} style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "1px solid #1e293b",
                background: aktifSlide === SLIDES.length - 1 ? "transparent" : "rgba(30,41,59,0.6)",
                color: aktifSlide === SLIDES.length - 1 ? "#334155" : "#94a3b8",
                cursor: aktifSlide === SLIDES.length - 1 ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontSize: 13,
              }}>Sonraki →</button>
            </div>
          </div>
        </div>
      )}

      {/* SORULAR TAB */}
      {aktifTab === "sorular" && (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
          <div style={{
            padding: "20px 24px",
            borderRadius: 14,
            background: "rgba(56,189,248,0.08)",
            border: "1px solid rgba(56,189,248,0.2)",
            marginBottom: 32,
            fontSize: 14,
            color: "#94a3b8",
            lineHeight: 1.7,
          }}>
            <strong style={{ color: "#38bdf8" }}>Nasıl kullanılır:</strong> Hocanızın sorması muhtemel {SORULAR.reduce((a,k)=>a+k.sorular.length,0)} kritik soru aşağıda. Her soruya tıklayın, modeli okuyun ve kendi cevabınızı bu yapı üzerine inşa edin.
          </div>

          {SORULAR.map((kategori, ki) => (
            <div key={ki} style={{ marginBottom: 36 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ height: 2, flex: 1, background: `rgba(${hexToRgb(kategori.renk)},0.3)` }} />
                <div style={{
                  padding: "6px 16px",
                  borderRadius: 20,
                  background: `rgba(${hexToRgb(kategori.renk)},0.1)`,
                  border: `1px solid rgba(${hexToRgb(kategori.renk)},0.3)`,
                  fontSize: 12,
                  fontWeight: 700,
                  color: kategori.renk,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}>{kategori.kategori}</div>
                <div style={{ height: 2, flex: 1, background: `rgba(${hexToRgb(kategori.renk)},0.3)` }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {kategori.sorular.map((s, si) => {
                  const key = `${ki}-${si}`;
                  const acik = acikSoru === key;
                  const sv = seviyeRenk[s.seviye];

                  return (
                    <div key={si} style={{
                      borderRadius: 14,
                      border: acik ? `1px solid ${kategori.renk}44` : "1px solid #1e293b",
                      overflow: "hidden",
                      transition: "all 0.3s",
                      background: acik ? "rgba(30,41,59,0.8)" : "rgba(15,23,42,0.6)",
                    }}>
                      <button onClick={() => setAcikSoru(acik ? null : key)} style={{
                        width: "100%",
                        padding: "18px 24px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 16,
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                      }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>❓</span>
                          <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.5 }}>{s.soru}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                          <span style={{
                            padding: "3px 10px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            background: sv.bg,
                            color: sv.text,
                            border: `1px solid ${sv.border}`,
                          }}>{s.seviye}</span>
                          <span style={{ color: "#475569", fontSize: 18 }}>{acik ? "▲" : "▼"}</span>
                        </div>
                      </button>

                      {acik && (
                        <div style={{ padding: "0 24px 24px 24px" }}>
                          <div style={{
                            height: 1,
                            background: "#1e293b",
                            marginBottom: 20,
                          }} />
                          <div style={{
                            padding: "20px 24px",
                            borderRadius: 12,
                            background: "rgba(15,23,42,0.8)",
                            border: "1px solid #0f2744",
                            fontSize: 14,
                            lineHeight: 1.8,
                            color: "#cbd5e1",
                            whiteSpace: "pre-line",
                          }} dangerouslySetInnerHTML={{ __html: renderMarkdown(s.cevap) }} />
                          <div style={{
                            marginTop: 14,
                            padding: "12px 16px",
                            borderRadius: 10,
                            background: "rgba(245,158,11,0.07)",
                            border: "1px solid rgba(245,158,11,0.2)",
                            fontSize: 12,
                            color: "#fbbf24",
                            lineHeight: 1.6,
                          }}>
                            💡 <strong>Strateji:</strong> Bu cevabı ezberlemek yerine mantığını anlayın. Hoca farklı bir açıdan sorsa bile temel argümanı yeniden kurabileceğiniz seviyede hazırlanın.
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helpers
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r},${g},${b}`;
}

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e2e8f0">$1</strong>')
    .replace(/`(.+?)`/g, '<code style="background:#0f172a;border:1px solid #1e293b;padding:2px 6px;border-radius:4px;font-size:12px;color:#38bdf8;font-family:Consolas,monospace">$1</code>');
}
