"use client";
import React, { JSX, useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";
/**
 * صفحة رئيسية للمتحف المصري الكبير — صفحة واحدة متكاملة
 * تحتوي على مجموعة صور (حوالي 20) لقطع تماثيل ومقتنيات من المتحف.
 *
 * ملاحظة: تستخدم <img> عادية (lazy loading).
 */

// نوع العنصر
type Artifact = {
  id: number;
  title: string;
  period?: string;
  short?: string;
  img: string;
  category?: "تماثيل" | "قواعد" | "تفاصيل" | "أواني" | "قناع";
};

// مصفوفة الصور — حوالي 20 عنصر حقيقي يرتكز على صور GEM/Wikimedia
const ARTIFACTS_SOURCE: Artifact[] = [
  { id: 1, title: "قناع توت عنخ آمون", period: "1332–1323 ق.م", short: "القناع الذهبي الشهير", img: "https://upload.wikimedia.org/wikipedia/commons/8/83/Tutankhamun_mask.jpg", category: "قناع" },
  { id: 2, title: "تمثال رمسيس الثاني (جزء)", period: "القرن 13 ق.م", short: "تمثال الملك رمسيس الثاني", img: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Statue_of_Ramses_II_in_Grand_Egyptian_Museum.jpg", category: "تماثيل" },
  { id: 3, title: "قاعة العرض الرئيسية", period: "حديث", short: "الصالة الرئيسية للمتحف", img: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Grand_Egyptian_Museum_lobby.jpg", category: "تفاصيل" },
  { id: 4, title: "واجهة المتحف", img: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Grand_Egyptian_Museum_facade.jpg", category: "تفاصيل" },
  { id: 5, title: "تفصيل على أثر ذهبي", img: "https://upload.wikimedia.org/wikipedia/commons/0/03/Tutankhamun_sarab.jpg", category: "تفاصيل" },
  { id: 6, title: "داخل المتحف - عرض", img: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Grand_Egyptian_Museum_inside.jpg", category: "تفاصيل" },
  { id: 7, title: "تمثال ضخم (عرض)", img: "https://upload.wikimedia.org/wikipedia/commons/d/dc/Grand_Egyptian_Museum_outside_2022.jpg", category: "تماثيل" },
  { id: 8, title: "تمثال صغير مزخرف", img: "https://upload.wikimedia.org/wikipedia/commons/6/61/Egypt_Sketch_Statue.jpg", category: "تماثيل" },
  { id: 9, title: "تمثال ملكي - منظر جانبي", img: "https://upload.wikimedia.org/wikipedia/commons/5/52/Statue_of_a_pharaoh.jpg", category: "تماثيل" },
  { id: 10, title: "نقوش حجرية", img: "https://upload.wikimedia.org/wikipedia/commons/9/94/Egyptian_relief.jpg", category: "تفاصيل" },
  { id: 11, title: "إناء ذهبي مزخرف", img: "https://upload.wikimedia.org/wikipedia/commons/4/45/Egypt_GoldenVessel.jpg", category: "أواني" },
  { id: 12, title: "عمود منحوت", img: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Egyptian_column.jpg", category: "قواعد" },
  { id: 13, title: "قناع زخرفي مصغر", img: "https://upload.wikimedia.org/wikipedia/commons/7/76/Ancient_mask.jpg", category: "قناع" },
  { id: 14, title: "لوحة خشبية مرسومة", img: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Ancient_painting.jpg", category: "تفاصيل" },
  { id: 15, title: "تفاصيل ذهبية من توت", img: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Tut_feature.jpg", category: "تفاصيل" },
  { id: 16, title: "تمثال حامي", img: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Guardian_statue.jpg", category: "تماثيل" },
  { id: 17, title: "لوحة حجرية مكتوبة", img: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Hieroglyphs_stela.jpg", category: "تفاصيل" },
  { id: 18, title: "تمثال طولي", img: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Tall_statue.jpg", category: "تماثيل" },
  { id: 19, title: "أواني فخارية ملونة", img: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Egypt_pottery.jpg", category: "أواني" },
  { id: 20, title: "تفاصيل قناع ملون", img: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Colorful_mask_fragment.jpg", category: "قناع" },
];

// لو حابب نكرر أو نعرض أكثر نقدر نولد مكررات مع عناوين عرضية، لكن حسب طلبك الآن 20 كافي.

// بعض المزايا التي سنضيفها: فلترة بالتصنيف (category)، زر تحميل (download link)، dark-mode toggle، load more (عرض دفعات).
export default function Home(): JSX.Element {
  // حالة الفلتر
  const [filter, setFilter] = useState<"كل" | Artifact["category"]>("كل");
  // حالة عدد العناصر التي نعرضها (load more)
  const [visibleCount, setVisibleCount] = useState<number>(12);
  // dark mode محلي (بس للتجريب — تغيير CSS class)
  const [isLite, setIsLite] = useState<boolean>(false);
  // بحث نصي
  const [q, setQ] = useState<string>("");

  // تحضير القائمة المصنفة
  const filtered = useMemo(() => {
    const qLower = q.trim().toLowerCase();
    return ARTIFACTS_SOURCE.filter((a) => {
      if (filter !== "كل" && a.category !== filter) return false;
      if (qLower && !(`${a.title} ${a.short ?? ""}`.toLowerCase().includes(qLower))) return false;
      return true;
    });
  }, [filter, q]);

  // العناصر التي ستعرض حالياً
  const visible = filtered.slice(0, visibleCount);

  // وظائف بسيطة
  function handleLoadMore() {
    setVisibleCount((v) => Math.min(v + 8, filtered.length));
  }

  function handleReset() {
    setFilter("كل");
    setQ("");
    setVisibleCount(12);
  }

  useEffect(() => {
    // إذا فلترنا أو بحثنا نخفض عدد العناصر لعرض أولي
    setVisibleCount(12);
  }, [filter, q]);

  return (
    <main className={`${styles.page} ${isLite ? styles.lite : ""}`}>

      {/* TOP BAR (خيار بسيط للتحكم) */}
      <div className={styles.topbar}>
        <div className={styles.containerTop}>
          <div className={styles.brand}>المتحف المصري الكبير</div>
          <div className={styles.topActions}>
            <label className={styles.search}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث عن قطعة أو عنوان..."
              />
            </label>

            <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className={styles.select}>
              <option value="كل">كل القطع</option>
              <option value="تماثيل">تماثيل</option>
              <option value="قناع">أقنعة</option>
              <option value="تفاصيل">تفاصيل</option>
              <option value="أواني">أواني</option>
              <option value="قواعد">قواعد</option>
            </select>

            <button className={styles.btnGhost} onClick={() => { setIsLite(!isLite); }}>
              {isLite ? "Dark" : "Light"}
            </button>

            <button className={styles.btnPrimary} onClick={() => { setVisibleCount(20); }}>
              عرض سريع 20
            </button>
          </div>
        </div>
      </div>

      {/* HERO */}
      <header className={styles.hero}>
        <div className={styles.heroInner + " container"}>
          <div className={styles.heroGrid}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>المتحف المصري الكبير</h1>
              <p className={styles.heroLead}>أعظم تحف من الحضارة المصرية — تماثيل، ونقوش، وقطع ذهبية محفوظة بعناية.</p>

              <div className={styles.heroButtons}>
                <button className={styles.btnPrimary}>ابدأ جولتك</button>
                <button className={styles.btnOutline} onClick={() => { const el = document.getElementById("gallery"); if (el) el.scrollIntoView({ behavior: "smooth" }); }}>
                  شاهد المعرض
                </button>
              </div>

              <div className={styles.featurePills}>
                <span>100k+</span>
                <span>صالات عرض حديثة</span>
                <span>ترميم متقدم</span>
              </div>
            </div>

            <div className={styles.heroVisual} aria-hidden>
              <div className={styles.stack}>
                <div className={styles.stackCard}>
                  <img loading="lazy" src={ARTIFACTS_SOURCE[0].img} alt={ARTIFACTS_SOURCE[0].title} />
                </div>
                <div className={styles.stackCard2}>
                  <img loading="lazy" src={ARTIFACTS_SOURCE[1].img} alt={ARTIFACTS_SOURCE[1].title} />
                </div>
                <div className={styles.stackCard3}>
                  <img loading="lazy" src={ARTIFACTS_SOURCE[2].img} alt={ARTIFACTS_SOURCE[2].title} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* ABOUT */}
      <section className={styles.about + " container"}>
        <h2 className={styles.sectionTitle}>عن المتحف</h2>
        <p className={styles.lead}>المتحف المصري الكبير (GEM) يُعرض فيه أعظم التراث المصري — من الفراعنة وحتى العصور المتأخرة. يتميز المتحف بالتخطيط الحديث، قاعات عرض بانورامية، ومعامل ترميم متقدمة.</p>

        <div className={styles.aboutGrid}>
          <div className={styles.aboutTile}>
            <h3>عرض سينمائي</h3>
            <p>إضاءة ومونتاج للقطع يعيد الحياة للمشاهد التاريخي.</p>
          </div>
          <div className={styles.aboutTile}>
            <h3>حفظ وترميم</h3>
            <p>مختبرات على أعلى مستوى لحماية القطع عبر الزمن.</p>
          </div>
          <div className={styles.aboutTile}>
            <h3>تعليم وتجربة</h3>
            <p>ورش وفعاليات للطلاب والعائلات لتجربة تفاعلية.</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.features + " container"}>
        <h2 className={styles.sectionTitle}>مميزات المتحف</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <h3>تقنيات العرض</h3>
            <p>شاشات تفاعلية وعروض واقع مُعزّز.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>حفظ رقمي</h3>
            <p>أرشفة رقمية وآمن للقطع وتوثيق عالي الدقة.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>مرشدون متخصصون</h3>
            <p>دورات تدريبية ودليل صوتي متعدد اللغات.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>مطابخ ومقاهٍ فاخرة</h3>
            <p>مساحات راحة للزائرين بجودة عالمية.</p>
          </div>
        </div>
      </section>

      {/* GALLERY / GRID */}
      <section id="gallery" className={styles.gallery + " container"}>
        <h2 className={styles.sectionTitle}>المعرض — مقتنيات مختارة</h2>
        <p className={styles.leadSmall}>حوالي {filtered.length} نتائج للعرض — (فلتر: {filter})</p>

        <div className={styles.grid}>
          {visible.map((a) => (
            <article key={a.id} className={styles.card}>
              <div className={styles.cardMedia}>
                <img src={a.img} alt={a.title} loading="lazy" />
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{a.title}</h3>
                <p className={styles.cardSub}>{a.period ?? ""}</p>
                <div className={styles.cardActions}>
                  <a href={a.img} target="_blank" rel="noreferrer" className={styles.btnGhost}>فتح الصورة</a>
                  <a download className={styles.btnSmall} href={a.img}>تحميل</a>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.loadMoreWrap}>
          {visible.length < filtered.length ? (
            <button className={styles.btnPrimary} onClick={handleLoadMore}>عرض المزيد</button>
          ) : (
            <button className={styles.btnGhost} onClick={handleReset}>إعادة الضبط</button>
          )}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className={styles.testimonials + " container"}>
        <h2 className={styles.sectionTitle}>انطباعات الزوار</h2>
        <div className={styles.testGrid}>
          <blockquote className={styles.testCard}>
            <p>"تجربة لا تُنسى — العرض والإضاءة أعادوا الحياة للقطع."</p>
            <cite>— ريم، القاهرة</cite>
          </blockquote>
          <blockquote className={styles.testCard}>
            <p>"محفوظات رائعة وتفسير ممتاز لكل قطعة."</p>
            <cite>— أحمد، الجيزة</cite>
          </blockquote>
          <blockquote className={styles.testCard}>
            <p>"مكان يليق بتاريخ مصر — أوصي به لكل شخص يزور القاهرة."</p>
            <cite>— ماريا، إسطنبول</cite>
          </blockquote>
        </div>
      </section>

      {/* VISIT INFO */}
      <section className={styles.visit + " container"}>
        <h2 className={styles.sectionTitle}>خطط زيارتك</h2>
        <div className={styles.visitGrid}>
          <div className={styles.visitCard}>
            <h3>ساعات العمل</h3>
            <p>يومياً 9 صباحاً — 5 مساءً</p>
          </div>
          <div className={styles.visitCard}>
            <h3>تذاكر</h3>
            <p>المصريين: 200 جنيه • الأجانب: 1000 جنيه</p>
          </div>
          <div className={styles.visitCard}>
            <h3>موقع</h3>
            <p>الجيزة — بجوار أهرامات الجيزة</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={"container " + styles.containerFooter}>
          <div>
            <strong>المتحف المصري الكبير</strong>
            <div className={styles.small}>© 2025 — جميع الحقوق محفوظة</div>
          </div>
          <div className={styles.footerLinks}>
            <a className={styles.link} href="#">فيسبوك</a>
            <a className={styles.link} href="#">إنستجرام</a>
            <a className={styles.link} href="#">تويتر</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
