import "dotenv/config";
import { createHash } from "crypto";
import { db } from "./index";
import { orders, products, reviews, users } from "./schema";

const sha = (s: string) => createHash("sha256").update(s).digest("hex");

const STOCK = {
  swingReady:
    "https://images.pexels.com/photos/6542443/pexels-photo-6542443.jpeg?auto=compress&cs=tinysrgb&w=1200",
  gloveClose:
    "https://images.pexels.com/photos/9207649/pexels-photo-9207649.jpeg?auto=compress&cs=tinysrgb&w=1200",
  focusedSwing:
    "https://images.pexels.com/photos/6256827/pexels-photo-6256827.jpeg?auto=compress&cs=tinysrgb&w=1200",
  clubhead:
    "https://images.pexels.com/photos/15376334/pexels-photo-15376334.jpeg?auto=compress&cs=tinysrgb&w=1200",
  backSwing:
    "https://images.pexels.com/photos/6256593/pexels-photo-6256593.jpeg?auto=compress&cs=tinysrgb&w=1200",
  sunsetSwing:
    "https://images.pexels.com/photos/6256834/pexels-photo-6256834.jpeg?auto=compress&cs=tinysrgb&w=1200",
  holeFlag:
    "https://images.pexels.com/photos/4398355/pexels-photo-4398355.jpeg?auto=compress&cs=tinysrgb&w=1600",
  courseAerial:
    "https://images.pexels.com/photos/19334919/pexels-photo-19334919.jpeg?auto=compress&cs=tinysrgb&w=1600",
  courseSunset:
    "https://images.pexels.com/photos/19334920/pexels-photo-19334920.jpeg?auto=compress&cs=tinysrgb&w=1600",
  fairway:
    "https://images.pexels.com/photos/6256829/pexels-photo-6256829.jpeg?auto=compress&cs=tinysrgb&w=1600",
};

const PRODUCTS = [
  {
    slug: "pro-v1-driver",
    name: "درایور حرفه‌ای Pro V1",
    category: "چوب‌ها",
    price: 58_000_000,
    oldPrice: 64_500_000,
    shortDesc:
      "درایور مسافرتی با بدنه کربن فورج و مرکز ثقل تنظیم‌شده؛ ساخته‌شده برای بیشترین دیستانس و فِیس‌انگل بی‌نقص.",
    description:
      "درایور Pro V1 نقطه اوج مهندسی پات‌کلاب است. سر تیتانیوم فورج‌شده با تاج کربنی چندلایه، وزن سر را به حدی کم رسانده که سوئینگ شما سریع‌تر و پایدارتر می‌شود. سیستم وزن تعبیه‌شده در پشت سر امکان تنظیم درجه فِیل تا ۲ درجه را می‌دهد تا مسیر پرواز توپ دقیقاً با بازی شما هماهنگ شود. این درایور در تست‌های تور، میانگین ۸ یارد دیستانس بیشتر نسبت به نسل قبل ثبت کرده است.",
    features: [
      "سر تیتانیوم فورج‌شده با تاج کربنی",
      "شفت گرافیت ۴۵ اینچ با تورک پایین",
      "فِیل ۱۰.۵ درجه قابل تنظیم",
      "گرپ لاستیکی ضدلغزش سری تور",
    ],
    images: ["/images/products/driver.jpg", STOCK.swingReady, STOCK.gloveClose],
    stock: 8,
    badge: "پرفروش",
    isNew: false,
    isFeatured: true,
    reviews: [
      {
        author: "امیرحسین رضایی",
        rating: 5,
        comment:
          "بعد از ده سال درایور قبلی‌ام را عوض کردم و تفاوت واقعاً حیرت‌انگیز است. تی‌شات‌هایم حداقل ۱۰ متر بلندتر شده و میس‌هیت‌ها هم بسیار کمتر آسیب می‌زنند.",
      },
      {
        author: "مهدی اکبری",
        rating: 5,
        comment:
          "صدا و حس برخورد فوق‌العاده است. تنظیم فِیل هم واقعاً کار می‌کند؛ روی ۹.۵ درجه برای بازی من عالی جواب داد. ارسال پات‌کلاب هم فقط یک روز طول کشید.",
      },
      {
        author: "نیما شریفی",
        rating: 4,
        comment:
          "کیفیت ساخت درجه یک است و دیستانس عالی، اما برای هندیکپ بالای ۱۵ شاید کمی سخت‌گیر باشد. برای بازیکنان با سوئینگ سریع انتخاب اول من است.",
      },
    ],
  },
  {
    slug: "master-irons-set",
    name: "ست آیرون Master Series (۶ عدد)",
    category: "چوب‌ها",
    price: 96_000_000,
    oldPrice: null,
    shortDesc:
      "ست آیرون فورج‌شده با حس نرم و بازخورد خالص؛ از ۵ آیرون تا پیچینگ، برای بازیکنانی که کنترل برایشان همه‌چیز است.",
    description:
      "ست Master Series از فولاد نرم ۱۰۲۰C به‌صورت دستی فورج شده تا حس برخورد توپ، «آب‌شدنی» باشد. سول‌های پهن‌تر در آیرون‌های بلند و باریک‌تر در کوتاه، بازخورد متفاوتی برای هر ضربه می‌سازد. گررووهای میل‌لایزر روی فِیس، اسپین را روی گرین‌های تند تا ۱۵٪ افزایش می‌دهند. ست شامل ۵، ۶، ۷، ۸، ۹ و پیچینگ ونج است.",
    features: [
      "فورج دستی از فولاد نرم ۱۰۲۰C",
      "گرروو میل‌لایزر برای اسپین بالا",
      "شفت فولادی True Temper Dynamic Gold",
      "گربه‌سنجی دقیق لوت و لای",
    ],
    images: ["/images/products/irons.jpg", STOCK.clubhead, STOCK.swingReady],
    stock: 5,
    badge: null,
    isNew: false,
    isFeatured: true,
    reviews: [
      {
        author: "رضا توکلی",
        rating: 5,
        comment:
          "به‌عنوان مربی، حس فورج این ست را به شاگردهای حرفه‌ای‌ام پیشنهاد می‌دهم. بازخورد میس‌هیت‌ها صادقانه است و کنترل دیستانس بی‌نقص.",
      },
      {
        author: "سعید قاسمی",
        rating: 5,
        comment:
          "سه ماه است با این ست بازی می‌کنم و گیراسپرین روی گرین واقعاً متفاوت است. آیرون ۷ دیستانس ثابتی دارد که اعتماد‌به‌نفس عالی می‌دهد.",
      },
      {
        author: "آرش مرادی",
        rating: 4,
        comment:
          "حس ضربه عالی است ولی قیمت بالاست؛ البته با توجه به کیفیت فورج و شفت‌های اورجینال، ارزشش را دارد. بسته‌بندی هم شکیل و حرفه‌ای بود.",
      },
    ],
  },
  {
    slug: "precision-putter-p700",
    name: "پوتر پریسیژن P-700",
    category: "چوب‌ها",
    price: 32_500_000,
    oldPrice: null,
    shortDesc:
      "پوتر مالِت با سیستم آلاینمنت سه‌خطی و اینسرت صدفی؛ برای پات‌هایی که دقیقاً از وسط مسیر عبور می‌کنند.",
    description:
      "پوتر P-700 با وزن‌های تعبیه‌شده در پاشنه و پنجه، مومنت آو اینرشیا را به حداکثر می‌رساند تا فِیس روی ایمپکت پایدار بماند. اینسرت صدفی طبیعی، حس نرم و رول بی‌وقفه می‌دهد و خط‌های آلاینمنت سه‌گانه، هدف‌گیری را روی هر فاصله‌ای ساده می‌کنند. دسته استاندارد ۳۴ اینچ با گرپ می‌دسایز عرضه می‌شود.",
    features: [
      "بدنه استیل با پاشنه وزن‌دار",
      "اینسرت صدفی با رول یکنواخت",
      "آلاینمنت سه‌خطی های‌کنتراست",
      "گرپ می‌دسایز ضدپیچش",
    ],
    images: ["/images/products/putter.jpg", STOCK.gloveClose, STOCK.backSwing],
    stock: 12,
    badge: null,
    isNew: true,
    isFeatured: false,
    reviews: [
      {
        author: "پویا احمدی",
        rating: 5,
        comment:
          "پات‌هایم داخل ۳ متری تقریباً تبدیل به فرمالیتي شده! اینسرت صدفی حس فوق‌العاده‌ای دارد و خط‌های آلاینمنت واقعاً کمک‌کننده‌اند.",
      },
      {
        author: "محمد کریمی",
        rating: 5,
        comment:
          "بین چند پوتر گران‌تر مردد بودم اما P-700 با این قیمت از همه بهتر جواب داد. رول توپ روی گرین‌های سریع بیمارستان عالی است.",
      },
      {
        author: "سارا محمدی",
        rating: 5,
        comment:
          "به‌عنوان بازیکن تازه‌کار، اولین پوتر جدی‌ام بود و از انتخابم مطمئنم. وزنش متعادل است و خیلی راحت خط هدف را می‌بینم.",
      },
    ],
  },
  {
    slug: "pro-tour-cart-bag",
    name: "کیف چرخ‌دار Pro Tour",
    category: "کیف‌ها",
    price: 28_900_000,
    oldPrice: 31_500_000,
    shortDesc:
      "کیف تور با بدنه چرم واترپروف، ۱۴ تقسیم‌بندی کامل و چرخ‌های پهن؛ همه‌چیز سر جای خودش، حتی روی تپه‌های شنی.",
    description:
      "کیف Pro Tour برای گلف‌بازانی طراحی شده که سازمان‌دهی برایشان خط قرمز است. ۱۴ تقسیم‌بندی مجزا با پوشش مخمل ضدخش، جیب عایق برای نوشیدنی، جیب مخفی با زیپ ضدآب و هود بارانی هم‌رنگ. چرخ‌های پلی‌اورتان با بلبرینگ سرامیکی، حتی روی شن‌های انگاره بی‌صدا و روان حرکت می‌کنند.",
    features: [
      "۱۴ تقسیم‌بندی مجزا با مخمل ضدخش",
      "چرم واترپروف با درز‌بندی دوبل",
      "چرخ‌های پهن با بلبرینگ سرامیکی",
      "جیب عایق دار و هود بارانی",
    ],
    images: ["/images/products/bag.jpg", STOCK.courseAerial, STOCK.holeFlag],
    stock: 7,
    badge: "پیشنهاد ویژه",
    isNew: false,
    isFeatured: true,
    reviews: [
      {
        author: "حسین نادری",
        rating: 5,
        comment:
          "کیف فوق‌العاده محکم و شیک است. چرخ‌هایش روی مسیر انگاره‌مان واقعاً روون هستند و تقسیم‌بندی ۱۴تایی‌اش همیشه مرتبم نگه می‌دارد.",
      },
      {
        author: "فرزاد جعفری",
        rating: 5,
        comment:
          "در یک بارون ساعتی همه‌چیز داخلش خشک ماند. دوخت و زیپ‌ها کیفیت تور دارند؛ ارزش هر تومانش را دارد.",
      },
      {
        author: "علی صادقی",
        rating: 4,
        comment:
          "کیف عالی است فقط کمی سنگین‌تر از چیزی است که فکر می‌کردم. البته چرخ‌ها جبرانش می‌کنند و عملاً حس وزن نمی‌کنید.",
      },
    ],
  },
  {
    slug: "cabretta-leather-glove",
    name: "دستکش چرم کابرتا",
    category: "کفش و دستکش",
    price: 1_850_000,
    oldPrice: null,
    shortDesc:
      "دستکش چرم گوسفندی کابرتا با تنفس عالی و چسبندگی پایدار؛ حس دوم پوست، حتی در هوای شرجی جنوب.",
    description:
      "دستکش کابرتا از چرم گوسفندی درجه یک با بافت میکروپرف ساخته شده تا دست در گرم‌ترین روزها هم نفس بکشد. کف دست با دوخت سه‌نخی تقویت شده و مچ با بند الاستیک تنظیم می‌شود. این دستکش با هر بار بازی نرم‌تر می‌شود و بعد از ده‌ها راند همچنان چسبندگی خود را حفظ می‌کند.",
    features: [
      "چرم کابرتا اصل با میکروپرف",
      "دوخت تقویتی سه‌نخ کف دست",
      "بند مچ الاستیک قابل تنظیم",
      "مناسب چپ و راست‌دست",
    ],
    images: ["/images/products/glove.jpg", STOCK.gloveClose, STOCK.focusedSwing],
    stock: 40,
    badge: null,
    isNew: false,
    isFeatured: false,
    reviews: [
      {
        author: "محمد کریمی",
        rating: 5,
        comment:
          "دو ماه است هر هفته باهاش بازی می‌کنم و هنوز مثل روز اول چسبنده است. در هوای شرجی بندر هم دستم عرق نکرد.",
      },
      {
        author: "آرش مرادی",
        rating: 5,
        comment:
          "فرق دستکش کابرتا اصل با نمونه‌های بازار را فقط بعد از این خرید فهمیدم. حس گریپ فوق‌العاده و دوخت تمیز.",
      },
      {
        author: "سعید قاسمی",
        rating: 4,
        comment:
          "کیفیت چرم عالی است؛ فقط سایزبندی‌اش کمی بزرگ است، یک سایز کوچک‌تر بگیرید.",
      },
    ],
  },
  {
    slug: "tour-pro-shoes",
    name: "کفش گلف Tour Pro",
    category: "کفش و دستکش",
    price: 9_800_000,
    oldPrice: null,
    shortDesc:
      "کفش چرم طبیعی با میخ‌های چرخشی و کفی مش ارتوپدی؛ ثبات کامل در سوئینگ، راحتی کامل در ۱۸ هول.",
    description:
      "کفش Tour Pro ترکیبی از ثبات و راحتی است. رویه چرم طبیعی نانو-پاشنده، پا را در باران خشک و خنک نگه می‌دارد و زیره TPU با میخ‌های قابل تعویض، گریپ بی‌نقصی روی چمن خیس می‌دهد. کفی مش سه‌بعدی با پشتیبانی قوس پا، فشار را در ۱۸ هول کامل توزیع می‌کند تا پای شما مثل ابتدای مسیر تازه بماند.",
    features: [
      "رویه چرم طبیعی نانو-پاشنده",
      "میخ‌های TPU قابل تعویض",
      "کفی مش با پشتیبانی قوس پا",
      "وزن سبک ۳۲۰ گرم",
    ],
    images: ["/images/products/shoes.jpg", STOCK.backSwing, STOCK.sunsetSwing],
    stock: 15,
    badge: "جدید",
    isNew: true,
    isFeatured: true,
    reviews: [
      {
        author: "نیما شریفی",
        rating: 5,
        comment:
          "از کفش‌های قبلی‌ام نصف وزن است! روی چمن خیس صبحگاهی هم یک‌بار سرخوردم. کفی‌اش واقعاً خستگی پا را از بین می‌برد.",
      },
      {
        author: "پویا احمدی",
        rating: 5,
        comment:
          "ثبات در سوئینگ به‌طرز عجیبی بهتر شده؛ مخصوصاً با آیرون‌های بلند. سایز ۴۳ برای پا ۴۲.۵ مناسب بود.",
      },
      {
        author: "حسین نادری",
        rating: 4,
        comment:
          "کیفیت چرم و میخ‌ها عالی است. کمی باید با آن راه بروید تا فرم بگیرد؛ بعد از دو بازی مثل دستکش پایتان شد.",
      },
    ],
  },
  {
    slug: "tour-balls-12",
    name: "توپ گلف تور (پک ۱۲ عددی)",
    category: "توپ‌ها",
    price: 4_200_000,
    oldPrice: null,
    shortDesc:
      "توپ سه‌لایه با هسته یونی‌اورتان و پوسته کست‌یورتان؛ اسپین بالا روی گرین، دیستانس کامل از تی.",
    description:
      "توپ تور پات‌کلاب با ساختار سه‌لایه برای بازیکنانی ساخته شده که هر دو دنیا را می‌خواهند: دیستانس بلند از تی و اسپین کنترل‌شده دور گرین. هسته بزرگ یونی‌اورتان انرژی ضربه را کامل منتقل می‌کند و پوسته نازک کست‌یورتان با ۳۳۶ دیمبل تتراهدرال، پرواز پایداری حتی در باد عرضی می‌دهد. خط آلاینمنت چاپی، پات‌های دقیق‌تر را ممکن می‌کند.",
    features: [
      "ساختار سه‌لایه تور",
      "پوسته کست‌یورتان با ۳۳۶ دیمبل",
      "هسته یونی‌اورتان پرانرژی",
      "خط آلاینمنت چاپی",
    ],
    images: ["/images/products/balls.jpg", STOCK.sunsetSwing, STOCK.holeFlag],
    stock: 60,
    badge: "پرفروش",
    isNew: false,
    isFeatured: false,
    reviews: [
      {
        author: "رضا توکلی",
        rating: 5,
        comment:
          "اسپین روی گرین‌های تند عالیه؛ با وبج ۵۰ وردی توپ تقریباً می‌ایستد. به شاگردهایم همیشه همین را پیشنهاد می‌دهم.",
      },
      {
        author: "مهدی اکبری",
        rating: 4,
        comment:
          "دوستانس از تی نسبت به برندهای معروف کمی کمتر ولی کنترل دور گرین جبرانش می‌کند. قیمت به ازای کیفیت واقعاً منصفانه است.",
      },
      {
        author: "فرزاد جعفری",
        rating: 5,
        comment:
          "دو تا از این توپ‌ها را در آب انداختم و باز هم پک بعدی را از پات‌کلاب گرفتم! کیفیت ثابتی دارد و هیچ توپ خمره‌ای بین‌شان نیست.",
      },
    ],
  },
  {
    slug: "classic-polo-green",
    name: "پولو پیکه کلاسیک سبز",
    category: "پوشاک",
    price: 2_950_000,
    oldPrice: null,
    shortDesc:
      "پیراهن پولو از پیکه مرسریزه با یقه خودایستاده؛ ظاهر کلوب‌هاوسی، عملکرد تکنیکالی روی فرینج.",
    description:
      "پولوی کلاسیک پات‌کلاب از پیکه مرسریزه مصری بافته شده؛ براقی طبیعی و دست نرمی دارد که در کلوب‌هاوس هم شیک است. الیاف آنتی‌اُدور با فینیش خنک‌کننده، رطوبت را در چند ثانیه مدیریت می‌کنند و یقه ساختارمند حتی بعد از ده‌ها شست‌وشو فرم خود را حفظ می‌کند. نوار تعرق‌گیری پشت کمر و درز‌های راگلان، آزادی حرکت کامل می‌دهند.",
    features: [
      "پیکه مرسریزه مصری درجه یک",
      "الیاف آنتی‌اُدور و فینیش خنک",
      "یقه ساختارمند پایدار",
      "درز راگلان برای آزادی حرکت",
    ],
    images: ["/images/products/polo.jpg", STOCK.focusedSwing, STOCK.gloveClose],
    stock: 30,
    badge: null,
    isNew: false,
    isFeatured: false,
    reviews: [
      {
        author: "علی صادقی",
        rating: 5,
        comment:
          "جنس پیکه‌اش واقعاً متفاوت است؛ بعد از سه ماه شست‌وشو نه رنگش رفته نه یقه‌اش افتاده. زیر آفتاب تیر هم خنک می‌ماند.",
      },
      {
        author: "سارا محمدی",
        rating: 5,
        comment:
          "برای همسرم خریدم و الان خودم هم یک دانه سفارش دادم! قی ظریف و رنگ سبزش دقیقاً مثل عکس است.",
      },
      {
        author: "پویا احمدی",
        rating: 4,
        comment:
          "کیفیت پارچه عالی، فقط مدلش کمی فیت است؛ اگر راحت‌تر دوست دارید یک سایز بزرگ‌تر بگیرید.",
      },
    ],
  },
  {
    slug: "storm-68-umbrella",
    name: "چتر گلف Storm 68",
    category: "لوازم جانبی",
    price: 2_450_000,
    oldPrice: 2_900_000,
    shortDesc:
      "چتر دوسایه ۶۸ اینچی با اسکلت فایبرگلاس ضدتندباد؛ پناهگاه شما در طوفان‌های وسط فرینج.",
    description:
      "چتر Storm 68 با قطر ۱۶۸ سانتی‌متر، شما و کیف‌تان را کامل می‌پوشاند. اسکلت فایبرگلاس ۸ پرچه در برابر تندبادهای ۷۰ کیلومتری معکوس نمی‌شود و سایه‌بان دوسایه با پوشش پلی‌اورتان، آب را کاملاً دفع می‌کند. دسته ارگونومیک EVA با بند مچ و کیسه تنفسی همراه است.",
    features: [
      "قطر ۱۶۸ سانتی‌متر دوسایه",
      "اسکلت فایبرگلاس ضدتندباد",
      "پوشش پلی‌اورتان ضدآب کامل",
      "دسته ارگونومیک EVA و بند مچ",
    ],
    images: ["/images/products/umbrella.jpg", STOCK.fairway, STOCK.courseSunset],
    stock: 18,
    badge: "پیشنهاد ویژه",
    isNew: false,
    isFeatured: false,
    reviews: [
      {
        author: "حسین نادری",
        rating: 5,
        comment:
          "در باد شمال تهران که همه چترها معکوس می‌شوند، این چتر محکم ایستاد. پوشش‌اش هم به قدری بزرگ است که کیفم هم خشک ماند.",
      },
      {
        author: "محمد کریمی",
        rating: 5,
        comment:
          "هم در باران هم در آفتاب تیر استفاده می‌کنم؛ پوشش UV واقعاً کار می‌کند. ساختمان‌اش حس چترهای ژاپنی را دارد.",
      },
      {
        author: "آرش مرادی",
        rating: 4,
        comment:
          "کیفیت فوق‌العاده ولی خب سنگین‌تر از چتر معمولی است؛ برای حمل در کیف گلف باید جا داشته باشید.",
      },
    ],
  },
  {
    slug: "laser-rangefinder-lr8",
    name: "رنج‌فایندر لیزری LR-8",
    category: "لوازم جانبی",
    price: 18_700_000,
    oldPrice: null,
    shortDesc:
      "رنج‌فایندر لیزری با لرزش‌گیر، اسلوپ‌مود و رنج ۱۰۰۰ یارد؛ فاصله دقیق تا پرچم در کمتر از یک ثانیه.",
    description:
      "LR-8 با اپتیک شش‌برابری و تکنولوژی پین‌سیکر، پرچم را از پس‌زمینه درخت‌ها جدا می‌کند و فاصله را با دقت ±۰.۵ یارد روی صفحه OLED نمایش می‌دهد. اسلوپ‌مود شیب زمین را حساب می‌کند (قابل خاموش‌شدن برای مسابقات) و لرزش‌گیر داخلی لحظه قفل‌شدن روی هدف را به شما اطلاع می‌دهد. بدنه IP54 ضدغبار و پاشش آب با کاور مغناطیسی همراه است.",
    features: [
      "اپتیک ۶ برابر با OLED",
      "دقت ±۰.۵ یارد و رنج ۱۰۰۰ یارد",
      "اسلوپ‌مود قابل خاموش‌کردن",
      "بدنه IP54 با کاور مغناطیسی",
    ],
    images: ["/images/products/rangefinder.jpg", STOCK.sunsetSwing, STOCK.courseAerial],
    stock: 9,
    badge: "پرفروش",
    isNew: false,
    isFeatured: true,
    reviews: [
      {
        author: "امیرحسین رضایی",
        rating: 5,
        comment:
          "قفل‌شدن روی پرچم بین درخت‌ها فوق‌العاده سریع است؛ آیرون درست را انتخاب می‌کنم و دیستانس‌هایم دقیق شده.",
      },
      {
        author: "سعید قاسمی",
        rating: 5,
        comment:
          "با این قیمت انتظار چنین اپتیک تمیزی را نداشتم. اسلوپ‌مود برای روزهای تمرین بی‌نظیر است و کاور مغناطیسی‌اش روی بگ می‌چسبد.",
      },
      {
        author: "نیما شریفی",
        rating: 4,
        comment:
          "دقت و سرعت عالی؛ فقط در بارون شدید صفحه کمی سخت خوانده می‌شود. باتری هم تا حالا یک‌ساله دوام آورده.",
      },
    ],
  },
];

async function main() {
  console.log("Seeding PuttClub database...");

  await db.delete(reviews);
  await db.delete(orders);
  await db.delete(products);
  await db.delete(users);

  for (const p of PRODUCTS) {
    const { reviews: productReviews, ...data } = p;
    const rating =
      Math.round(
        (productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length) * 10
      ) / 10;
    const [inserted] = await db
      .insert(products)
      .values({ ...data, rating, reviewCount: productReviews.length })
      .returning();
    await db.insert(reviews).values(
      productReviews.map((r) => ({
        productId: inserted.id,
        author: r.author,
        rating: r.rating,
        comment: r.comment,
      }))
    );
    console.log(`  ✓ ${inserted.name} (${productReviews.length} دیدگاه)`);
  }

  await db.insert(users).values({
    name: "عضو نمونه",
    email: "demo@puttclub.ir",
    password: sha("demo1234"),
    phone: "09123456789",
  });

  console.log("✓ Seed complete: 10 محصولات، دیدگاه‌ها و حساب نمونه (demo@puttclub.ir)");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
