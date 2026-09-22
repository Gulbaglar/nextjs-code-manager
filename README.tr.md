# Next.js Code Manager

**Admin panelinden özel HTML, CSS ve JavaScript yazın — taslak → sanal alanda canlı önizleme → yayınlama, sürüm geçmişi, tek tıkla geri alma ve acil durum kapatma anahtarıyla. Next.js App Router için yazıldı.**

🇬🇧 English: [README.md](README.md)

> *Geliştiriciyi değil, zararı sınırla.* Gerçek bir kod editörüyle (Monaco, VS Code'un editörü) kod yazıyorsunuz; Önizleme, Sürüm geçmişi, Geri alma ve kapatma anahtarı bir hatanın verebileceği zararı sınırlıyor.

Bu, npm paketi değil; küçük, kendi içinde eksiksiz bir referans uygulaması. Fork'layın veya oluşturduğu üç klasörü (`src/lib`, `src/components`, `src/app/admin`) doğrudan kendi Next.js App Router projenize kopyalayın. Bir şeye bağlamadan önce nasıl çalıştığını görebilmeniz için çalışan bir demo site olarak geliyor.

## Neden var

Bunun ilk sürümünü kendi portfolyo sitem ([gulbaglar.com](https://gulbaglar.com)) için, bir takip kodu, küçük bir widget ya da tek seferlik bir stil değişikliğini kod editörü açmadan, commit atmadan ve deploy beklemeden canlı siteye eklemek için yazdım. Orada iyi çalışınca, herhangi bir Next.js sitesinde kullanılabilsin diye kendi deposuna çıkardım.

## Özellikler

- **Taslak → Önizleme → Yayınla.** Taslak kaydetmek canlı siteye asla dokunmaz. Buna dokunan tek işlem "Kaydet ve Yayınla"dır. Önizleme düğmesi, yayınlamadan önce taslağın *birebir* aynısını sanal alanlı (`sandbox="allow-scripts"`, `allow-same-origin` yok) bir `<iframe>` içinde gösterir — sunucuya gitmeye gerek yoktur.
- **Yuvalar (slots).** JSX'inizin herhangi bir yerine `<CodeSlot slot="after-hero" />` ile isimlendirilmiş ekleme noktaları tanımlayın. Yuvalar sadece sizin belirlediğiniz metin anahtarlarıdır — bkz. [`src/lib/content-data.ts`](src/lib/content-data.ts).
- **Sürüm geçmişi.** Her yayınlama, önceki canlı sürümü sınırlı bir geçmiş yığınına (varsayılan 15) ekler. Herhangi birini tek tıkla geri yükleyin — o yeni canlı sürüm olur, yerini aldığı sürüm de sırayla yığına eklenir, hiçbir şey kaybolmaz.
- **Kapatma anahtarı.** Admin sayfasındaki tek bir onay kutusu, tek tek öğelere dokunmadan yayınlanmış TÜM kodları aynı anda kapatır — bir şeyler ters gittiğinde işe yarar.
- **Gerçek bir kod editörü.** [Monaco](https://microsoft.github.io/monaco-editor/) (VS Code'un üzerine kurulduğu editör) ihtiyaç anında bir CDN'den yüklenir. Yüklenemezse (internet yok, CDN engelli) admin arayüzü bozulmak yerine düz bir `<textarea>`'ya düşer.
- **Görüntüleme için yeni bir bağımlılık yok.** Yayınlanan HTML/CSS/JS sunucu tarafında düz biçimlendirme olarak render edilir (`<style>…</style>`, ham HTML, `<script>…</script>`), böylece tarayıcının kendi HTML ayrıştırıcısı bunu çalıştırır — statik bir HTML sayfasının kullandığı mekanizmanın aynısı. İstemci çalışma zamanı yok, bakımı gereken bir `new Function()` sanal alanı yok.
- **Tek yönetici, JSON dosya deposu.** Kimlik doğrulama bcrypt ile hash'lenmiş şifre + HMAC imzalı oturum çerezi, dış servis yok. İçerik `data/content.json`'da yaşar (gitignore'da, ilk kaydetmede oluşur). Birden fazla editör veya bir JSON dosyasının rahatça kaldıramayacağı kadar trafik gerekiyorsa [`src/lib/store.ts`](src/lib/store.ts)'i bir veritabanı çağrısıyla değiştirin.

## Hızlı başlangıç

```bash
git clone https://github.com/Gulbaglar/nextjs-code-manager.git
cd nextjs-code-manager
npm install
npm run dev
```

- `http://localhost:3000/` — dört yuvası zaten yerleştirilmiş demo site.
- `http://localhost:3000/admin/setup` — admin hesabınızı oluşturun (sadece ilk ziyarette).
- `http://localhost:3000/admin/code-manager` — bir şey ekleyin, ör. yuva **"After the hero section"**, HTML `<p id="hello">Merhaba!</p>`, CSS `#hello{color:tomato}`. **Önizleyin**, sonra **Kaydet ve Yayınla**, sonra demo sayfayı yenileyin.

## Kendi sitenize eklemek

1. `src/lib/content-data.ts`, `src/lib/store.ts`, `src/lib/admin-store.ts`, `src/lib/auth.ts`, `src/components/code-slot.tsx`, `src/components/admin/` ve `src/app/admin/`'i projenize kopyalayın (`src/lib/store.ts`'teki içerik tipini kendi sitenizin alanlarıyla `code`'un yanına ekleyecek şekilde düzenleyin).
2. `content-data.ts`'teki `CODE_SLOTS`'u kendi sitenizin gerçek bölümlerine göre düzenleyin.
3. Layout'larınızda veya sayfalarınızda istediğiniz yere `<CodeSlot slot="anahtariniz" />` koyun.
4. `.gitignore`'unuza `data/` ekleyin — bu modülün içeriği ve admin kimlik bilgileriniz asla commit edilmemeli.
5. `<CodeSlot/>` yerleştirdiğiniz sayfa/layout'un `export const dynamic = "force-dynamic"` olduğundan emin olun (bkz. `src/app/page.tsx`) — aksi hâlde Next.js derleme anında bir kez statikleştirebilir ve yeni yayınladığınız kod bir sonraki deploy'a kadar görünmeyebilir.

## Canlıya alırken — gerçekten yaşadığımız bir hata, siz yaşamayın diye

Derlemenin admin hesabı oluşturulmadan ÖNCE yapıldığı bir platformda (ör. CI uygulamayı derliyor, ayrı bir sunucu sadece çalıştırıyor) yayına alıyorsanız, `src/app/admin/` altındaki HER dosyanın — ya da en azından kök `src/app/admin/layout.tsx`'in — şunu export ettiğinden emin olun:

```ts
export const dynamic = "force-dynamic";
```

Bu olmadan, Next.js henüz hesap yokken `/admin/login`'in yönlendirmesini statik olarak optimize edip ("hesap yok → `/admin/setup`'a yönlendir") bu yanıtı önbelleğe alabilir. Hesabı oluşturduktan sonra `/admin/setup` sizi doğru şekilde `/admin/login`'e yönlendirir — ama önbellekteki BAYAT `/admin/login` yanıtı sizi tekrar `/admin/setup`'a gönderir. Sonsuza kadar. `ERR_TOO_MANY_REDIRECTS`. Bu depoda düzeltme zaten uygulanmış durumda (bkz. `src/app/admin/layout.tsx`); admin rotalarını yeniden düzenlerseniz kolayca kaybedilebileceği için burada ayrıca belirtiliyor.

## Sınırlar, dürüstçe

- Önizleme iframe'inde sonsuz döngü koruması yok — taslağınızdaki bir `while(true){}` o sekmeyi kilitler. Kapatın.
- Çoklu kullanıcı rolü yok, sürüm geçmişi dışında bir denetim kaydı (audit log) yok — bu "tek güvenilir yönetici" için tasarlandı, bir ekip için değil.
- Yuva içeriği dile göre değişmez — siteniz çok dilliyse, yayınlanan kod her dilde aynı şekilde görünür (tıpkı `<head>`'inizdeki bir `<script>` etiketi gibi).

## Lisans

MIT — bkz. [LICENSE](LICENSE).
