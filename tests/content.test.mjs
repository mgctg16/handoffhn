import test from "node:test";
import assert from "node:assert/strict";
import { content, sectionOrder } from "../src/content.js";

const requiredSections = [
  "hero",
  "appreciation",
  "video",
  "milestones",
  "statistics",
  "news",
  "profile",
  "contact"
];

const requiredLanguageKeys = ["assets", "lang", "languageLabel", "nav", "sections"];

const expectedViAssets = {
  videoUrl: "https://www.youtube.com/embed/DYeqHUOq-ho",
  companyProfileUrl: "",
  heroBannerUrl: "src/assets/finalvi.webp"
};

const expectedEnAssets = {
  videoUrl: "https://www.youtube.com/embed/DYeqHUOq-ho",
  companyProfileUrl: "",
  heroBannerUrl: "src/assets/finalen.webp"
};

const expectedViNav = {
  logoHref: "https://hino.vn/",
  homeLabel: "Hino",
  links: [
    ["appreciation", "Lời tri ân"],
    ["milestones", "Hành trình phát triển"],
    ["profile", "Ấn phẩm 30 năm"],
    ["news", "Tin tức"],
    ["contact", "Liên hệ"]
  ]
};

const expectedEnNav = {
  logoHref: "https://hino.vn/",
  homeLabel: "Hino",
  links: [
    ["appreciation", "Appreciation letter"],
    ["milestones", "Milestones"],
    ["profile", "Company profile"],
    ["news", "News"],
    ["contact", "Contact"]
  ]
};

const expectedYears = [
  "1995", "1996", "1997", "2001", "2006", "2007", "2008", "2010", "2011",
  "2013", "2015", "2016", "2018", "2021", "2022", "2023", "2024", "2025",
  "2026"
];

const expectedViMilestones = [
  ["1995", "Mở văn phòng đại diện tại Hà Nội"],
  ["1996", "Hino Motors Việt Nam chính thức thành lập tại Hà Nội"],
  ["1997", "Khai trương nhà máy Hino Motors Việt Nam tại Hà Nội/Xuất xưởng chiếc xe đầu tiên - FF3H"],
  ["2001", "Khai trương đại lý Hino Trường Long (Hồ Chí Minh)"],
  ["2006", "Khai trương đại lý Hino Sao Bắc (Hà Nội)/Khai trương đại lý Hino Lexim (Hà Nội)/ Kỷ niệm 10 năm thành lập"],
  ["2007", "Khai trương trung tâm đào tạo đầu tiên tại nhà máy Hino"],
  ["2008", "Giới thiệu các dòng sản phẩm mới: WU, FC, FG, FL, FM/ Ra mắt dòng xe tải nhẹ đầu tiên của Hino - Series 300/ Khai trương đại lý Hino Trường Vinh (Vũng Tàu) và Hino Việt Đằng (Hà Nội)"],
  ["2010", "Khai trương đại lý Hino Đại Phát Tín (Cà Mau)/ HMSV chính thức thành lập tại Hồ Chí Minh"],
  ["2011", "Hino đạt chứng nhận ISO về hệ thống quản lý môi trường"],
  ["2013", "Hino ra mắt Series 300 hoàn toàn mới"],
  ["2015", "Khai trương đại lý Hino Vĩnh Thịnh (Bình Dương)"],
  ["2016", "Khai trương đại lý Hino Việt Nhật (Hải Phòng)/ Khai trương đại lý Hino Vân Đạo (Thái Nguyên)/ Kỷ niệm 20 năm thành lập"],
  ["2018", "Ra mắt dòng xe Euro 4"],
  ["2021", "Ra mắt dòng xe tải nhẹ mới"],
  ["2022", "Khai trương đại lý Hino Miền Trung (Thanh Hoá)"],
  ["2023", "Kỷ niệm chiếc xe thứ 50.000 được sản xuất"],
  ["2024", "Xuất xưởng xe XZU Euro5"],
  ["2025", "Bàn giao xe tải thứ 60.000 tại Việt Nam"],
  ["2026", "Khai trương văn phòng mới tại Hà Nội"]
];

const expectedEnMilestones = [
  ["1995", "Opened representative office in Hanoi"],
  ["1996", "Hino Motors Vietnam was officially established in Hanoi"],
  ["1997", "Opened Hino Motors Vietnam factory in Hanoi / Rolled out the first vehicle - FF3H"],
  ["2001", "Opened Hino Truong Long dealership in Ho Chi Minh City"],
  ["2006", "Opened Hino Sao Bac dealership in Hanoi / Opened Hino Lexim dealership in Hanoi / Celebrated 10th anniversary"],
  ["2007", "Opened the first training center at the Hino factory"],
  ["2008", "Introduced new product lines: WU, FC, FG, FL, FM / Launched Hino’s first light-duty truck line - Series 300 / Opened Hino Truong Vinh dealership in Vung Tau and Hino Viet Dang in Hanoi"],
  ["2010", "Opened Hino Dai Phat Tin dealership in Ca Mau / HMSV was officially established in Ho Chi Minh City"],
  ["2011", "Hino achieved ISO certification for environmental management system"],
  ["2013", "Hino launched the all-new Series 300"],
  ["2015", "Opened Hino Vinh Thinh dealership in Binh Duong"],
  ["2016", "Opened Hino Viet Nhat dealership in Hai Phong / Opened Hino Van Dao dealership in Thai Nguyen / Celebrated 20th anniversary"],
  ["2018", "Launched Euro 4 vehicle line"],
  ["2021", "Launched new light-duty truck line"],
  ["2022", "Opened Hino Mien Trung dealership in Thanh Hoa"],
  ["2023", "Celebrated the 50,000th vehicle produced"],
  ["2024", "Rolled out XZU Euro5 vehicle"],
  ["2025", "Delivered the 60,000th truck in Vietnam"],
  ["2026", "Hanoi New Office Grand Opening Ceremony"]
];

const expectedMilestoneImageUrls = {
  1995: "src/assets/milestone-1995.jpg",
  1996: "src/assets/milestone-1996.jpg",
  1997: "src/assets/milestone-1997.jpg",
  2001: "src/assets/milestone-2001.jpg",
  2006: "src/assets/milestone-2006.jpg",
  2007: "src/assets/milestone-2007.jpg",
  2008: "src/assets/milestone-2008.png",
  2010: "src/assets/milestone-2010.jpg",
  2011: "src/assets/milestone-2011.jpg",
  2013: "src/assets/milestone-2013.jpg",
  2015: "src/assets/milestone-2015.jpg",
  2016: "src/assets/milestone-2016.jpg",
  2018: "src/assets/milestone-2018.png",
  2021: "src/assets/milestone-2021.png",
  2022: "src/assets/milestone-2022.png",
  2023: "src/assets/milestone-2023.jpg",
  2024: "src/assets/milestone-2024.jpg",
  2025: "src/assets/milestone-2025.jpg",
  2026: "src/assets/milestone-2026-new-office.jpg"
};

const expectedMilestoneImageAlts = {
  2026: "Hanoi new office grand opening ceremony"
};

function expectedMilestones(rows) {
  return rows.map(([year, text]) => ({
    year,
    text,
    imageUrl: expectedMilestoneImageUrls[year],
    imageAlt: expectedMilestoneImageAlts[year] || `${year} milestone image`
  }));
}

const expectedViSections = {
  hero: {
    eyebrow: "Hino Motors Việt Nam",
    heading: "GIÁ TRỊ VƯỢT THỜI GIAN",
    subtext: "Trong hơn ba thập kỷ đồng hành, Hino Motors Việt Nam không ngừng mang đến các sản phẩm và giải pháp vận tải chất lượng cao, luôn đặt sự hài lòng của khách hàng làm trọng tâm trong mọi hoạt động. Qua đó, doanh nghiệp góp phần nâng cao hiệu quả vận hành, cải thiện chất lượng cuộc sống và chung tay thúc đẩy sự phát triển bền vững, thịnh vượng của Việt Nam."
  },
  appreciation: {
    heading: "LỜI TRI ÂN",
    salutation: "Thân gửi Quý khách hàng và Quý Đại lý,",
    body: [
      "Trước hết tôi xin bày tỏ sự cảm ơn chân thành tới các Quý khách hàng thân thiết đã tin tưởng lựa chọn, sử dụng sản phẩm của chúng tôi; và lời chúc mừng tới các Quý Đại lý với những thành công kinh doanh rực rỡ.",
      "Là thương hiệu tiên phong trong lĩnh vực sản xuất xe thương mại tại Việt Nam, chúng tôi luôn cố gắng hết sức mình để đáp ứng yêu cầu của thị trường cũng như sự kỳ vọng của khách hàng bằng các sản phẩm có chất lượng tốt, độ bền cao cùng với các hoạt động hỗ trợ tổng thể, toàn diện.",
      "Từ năm 2022, tôi có vinh dự đảm nhận vai trò trọng trách là Tổng Giám đốc của Hino Motors Việt Nam. Với nền tảng vững chắc được xây dựng hơn 25 năm qua, chúng tôi sẽ nỗ lực không ngừng để tiếp tục đồng hành với Quý vị hướng tới những mục tiêu cao hơn, xa hơn trong thời gian tới.",
      "Thay mặt công ty Hino Motors Việt Nam, tôi xin gửi tới toàn thể các Quý vị lời chúc sức khỏe dồi dào, thành công viên mãn và luôn luôn kết nối bền chặt với thương hiệu Hino."
    ],
    signatureName: "YOSHIO OSAKA",
    signatureTitle: "Tổng Giám đốc",
    signatureCompany: "Hino Motors Việt Nam",
    imageUrl: "src/assets/director-yoshio-osaka-website.png",
    imageAlt: "Ông Yoshio Osaka trước xe tải Hino 500"
  },
  statistics: {
    heading: "NHỮNG CON SỐ ẤN TƯỢNG",
    note: "*Số liệu cập nhật đến ngày 18/06/2026",
    items: [
      { value: 371, suffix: "", unit: "Nhân viên", label: "Nhân sự Hino Motors Việt Nam", disclaimer: "Tại thời điểm tháng 6/2026" },
      { value: 1295, suffix: "", unit: "Nhân viên", label: "Nhân sự đại lý Hino tại Việt Nam", disclaimer: "Tại thời điểm tháng 6/2026" },
      { value: 58777, suffix: "", unit: "Xe", label: "Sản lượng xe xuất xưởng", disclaimer: "Lũy kế từ 1996 đến 6/2026" },
      { value: 63954, suffix: "", unit: "Xe", label: "Sản lượng xe bán ra", disclaimer: "Lũy kế năm tài chính 1996–2025" },
      { value: 2682710, suffix: "", unit: "Triệu đồng", label: "Doanh thu phụ tùng", disclaimer: "Lũy kế năm tài chính 1996–2025" },
      { value: 831809, suffix: "", unit: "Lượt", label: "Dịch vụ bảo dưỡng CPUS", disclaimer: "Lũy kế năm tài chính 1996–2025" }
    ]
  },
  video: {
    heading: "30 NĂM VỮNG MỘT TÔN CHỈ",
    subtext: "30 năm là hành trình của niềm tin được vun đắp qua những giá trị bền bỉ. Để hôm nay, hành trình ấy trở thành niềm tự hào, khẳng định vị thế của một thương hiệu luôn đồng hành đầy trách nhiệm cùng khách hàng, đối tác, đóng góp thiết thực cho sự phát triển và phồn vinh của Việt Nam.",
    cta: "XEM NGAY"
  },
  milestones: {
    heading: "NHỮNG CỘT MỐC ĐÁNG NHỚ",
    subtext: "Mỗi dấu mốc không chỉ là một bước tiến, mà còn là minh chứng cho sự kiên định, nỗ lực và khát vọng vươn xa suốt 30 năm qua.",
    items: expectedMilestones(expectedViMilestones)
  },
  news: {
    heading: "TIN TỨC",
    cta: "XEM THÊM",
    items: [
      {
        title: "RECAP SỰ KIỆN KỶ NIỆM 30 NĂM HINO MOTORS VIỆT NAM",
        excerpt: "Không khí trang trọng và ấm áp của sự kiện kỷ niệm 30 năm đã ghi lại những khoảnh khắc đáng nhớ cùng khách hàng, đại lý và đối tác. Đây là dịp Hino Motors Việt Nam nhìn lại hành trình đã qua, tri ân sự đồng hành bền bỉ và tiếp tục khẳng định cam kết phát triển cùng ngành vận tải Việt Nam.",
        imageUrl: "src/assets/news-vilog-2025.jpg",
        imageAlt: "Recap sự kiện kỷ niệm 30 năm Hino Motors Việt Nam"
      }
    ]
  },
  profile: {
    heading: "VỀ HINO MOTORS VIỆT NAM",
    subtext: "Khám phá sâu hơn về hành trình phát triển của Hino Motors Việt Nam, những giá trị cốt lõi và nền tảng tạo nên chúng tôi ngày hôm nay.",
    cta: "ẤN PHẨM 30 NĂM"
  },
  contact: {
    heading: "Liên hệ",
    company: "CÔNG TY LIÊN DOANH TNHH HINO MOTORS VIỆT NAM",
    offices: [
      {
        label: "Trụ sở Hà Nội",
        address: "Tầng 15 - Tòa nhà văn phòng 16 Láng Hạ, Phường Giảng Võ, Thành phố Hà Nội, Việt Nam",
        phoneFax: "+8424 73 016 017 | +8424 3861 6018"
      },
      {
        label: "Chi nhánh HCM",
        address: "Tầng 22 - Cao ốc Saigon Trade Center, số 37 Tôn Đức Thắng, Phường Sài Gòn, Thành phố Hồ Chí Minh, Việt Nam",
        phoneFax: "+8428 73 016 017 | +8424 3861 6018"
      }
    ]
  }
};

const expectedEnSections = {
  hero: {
    eyebrow: "Hino Motors Vietnam",
    heading: "TIMELESS VALUE",
    subtext: "For three decades of enduring companionship, Hino Motors Vietnam has continuously delivered high-quality transport products and solutions, placing customer satisfaction at the center of every activity, thereby helping enhance operational efficiency, improve quality of life, and accompany Vietnam’s sustainable and prosperous development."
  },
  appreciation: {
    heading: "APPRECIATION LETTER",
    salutation: "Dear our customers and dealers,",
    body: [
      "I would like to express our gratitude to Hino loyal customers for always believing in us for your business, as well as our dedicated dealers for a successful 2022.",
      "As the leader of Vietnam commercial vehicles manufacturer, we always do our best to satisfy the market demand and the customers’ expectations through our best products and total support activities for our customers.",
      "Since 2022, it has been an honor to serve as General Director of Hino Motors Vietnam. Heritage from 25 years of success, we determine to continue reaching higher goals with you, our customers and dealers.",
      "On behalf of Hino Motors Vietnam, I would like to wish you the best of health and a successful year together with Hino Vietnam."
    ],
    signatureName: "Mr. YOSHIO OSAKA",
    signatureTitle: "General Director of Hino Motors Vietnam",
    signatureCompany: "",
    imageUrl: "src/assets/director-yoshio-osaka-website.png",
    imageAlt: "Mr. Yoshio Osaka in front of a Hino 500 truck"
  },
  statistics: {
    heading: "OUTSTANDING STATISTICS",
    note: "*Data updated as of June 18, 2026",
    items: [
      { value: 371, suffix: "", unit: "Employees", label: "Hino Motors Vietnam Employees", disclaimer: "As of June 2026" },
      { value: 1295, suffix: "", unit: "Employees", label: "Dealer Employees in Vietnam", disclaimer: "As of June 2026" },
      { value: 58777, suffix: "", unit: "Vehicles", label: "Vehicles Produced", disclaimer: "Accumulative 1996–Jun 2026" },
      { value: 63954, suffix: "", unit: "Vehicles", label: "Vehicles Sold", disclaimer: "Accumulative FY1996–2025" },
      { value: 2682710, suffix: "", unit: "Million VND", label: "Parts Revenue", disclaimer: "Accumulative FY1996–2025" },
      { value: 831809, suffix: "", unit: "Visits", label: "Maintenance Services CPUS", disclaimer: "Accumulative FY1996–2025" }
    ]
  },
  video: {
    heading: "30 YEARS, ONE GUIDING PRINCIPLE",
    subtext: "For 30 years, the journey has been shaped by trust built on enduring values. Today, that journey stands as a source of pride, affirming the position of a brand that has consistently stood beside its partners with responsibility, making meaningful contributions to Vietnam’s growth and prosperity.",
    cta: "WATCH NOW"
  },
  milestones: {
    heading: "MEMORABLE MILESTONES",
    subtext: "Each milestone is not only a step forward, but also proof of the steadfastness, effort, and aspiration to reach further over the past 30 years.",
    items: expectedMilestones(expectedEnMilestones)
  },
  news: {
    heading: "NEWS",
    cta: "SEE MORE",
    items: [
      {
        title: "RECAP: HINO MOTORS VIETNAM 30TH ANNIVERSARY EVENT",
        excerpt: "The 30th anniversary event brought together customers, dealers and partners in a warm, meaningful setting. It was a moment for Hino Motors Vietnam to look back on its journey, express gratitude for long-standing support and reaffirm its commitment to growing with Vietnam’s transport industry.",
        imageUrl: "src/assets/news-vilog-2025.jpg",
        imageAlt: "Hino Motors Vietnam 30th anniversary event recap"
      }
    ]
  },
  profile: {
    heading: "ABOUT HINO MOTORS VIETNAM",
    subtext: "Explore further the development journey of Hino Motors Vietnam, the core values and foundations that have shaped who we are today.",
    cta: "30TH ANNIVERSARY PUBLICATION"
  },
  contact: {
    heading: "Contact",
    company: "HINO MOTORS VIETNAM, LTD.",
    offices: [
      {
        label: "Office in Ha Noi",
        address: "15th floor - 16 Lang Ha Office Building, Giang Vo Ward, Hanoi, Vietnam",
        phoneFax: "+8424 73 016 017 | +8424 3861 6018"
      },
      {
        label: "Office in Ho Chi Minh",
        address: "22nd floor - Saigon Trade Center, 37 Ton Duc Thang Street, Sai Gon Ward, Ho Chi Minh City, Vietnam",
        phoneFax: "+8428 73 016 017 | +8424 3861 6018"
      }
    ]
  }
};

function sortedKeys(value) {
  return Object.keys(value).sort();
}

function shapeKind(value) {
  if (Array.isArray(value)) {
    return "array";
  }

  if (value === null) {
    return "null";
  }

  if (typeof value === "object") {
    return "object";
  }

  return "primitive";
}

function assertSameShape(actual, expected, path = "sections") {
  const actualKind = shapeKind(actual);
  const expectedKind = shapeKind(expected);

  assert.equal(actualKind, expectedKind, `${path} shape kind parity`);

  if (actualKind === "array") {
    assert.equal(actual.length, expected.length, `${path} length parity`);
    actual.forEach((actualItem, index) => {
      assertSameShape(actualItem, expected[index], `${path}[${index}]`);
    });
    return;
  }

  if (actualKind === "object") {
    assert.deepEqual(sortedKeys(actual), sortedKeys(expected), `${path} key parity`);
    for (const key of sortedKeys(actual)) {
      assertSameShape(actual[key], expected[key], `${path}.${key}`);
    }
    return;
  }

  assert.equal(typeof actual, typeof expected, `${path} typeof parity`);
  assert.equal(actual === null, expected === null, `${path} null parity`);
}

test("both languages expose the locked top-level structure", () => {
  assert.deepEqual(sortedKeys(content.vi), requiredLanguageKeys);
  assert.deepEqual(sortedKeys(content.en), requiredLanguageKeys);
});

test("both languages use exact language metadata", () => {
  assert.equal(content.vi.lang, "vi");
  assert.equal(content.vi.languageLabel, "VI");
  assert.equal(content.en.lang, "en");
  assert.equal(content.en.languageLabel, "EN");
});

test("both languages use exact navigation content", () => {
  assert.deepEqual(content.vi.nav, expectedViNav);
  assert.deepEqual(content.en.nav, expectedEnNav);
});

test("both languages keep full content shape parity", () => {
  assertSameShape(content.vi, content.en);
});

test("both languages use the approved Vietnamese module order", () => {
  assert.deepEqual(sectionOrder, requiredSections);
  assert.deepEqual(new Set(Object.keys(content.vi.sections)), new Set(requiredSections));
  assert.deepEqual(new Set(Object.keys(content.en.sections)), new Set(requiredSections));
});

test("both languages keep section field parity for rendering", () => {
  assertSameShape(content.vi.sections, content.en.sections);
});

test("hero copy is exact and bilingual", () => {
  assert.equal(content.vi.sections.hero.heading, expectedViSections.hero.heading);
  assert.equal(content.vi.sections.hero.subtext, expectedViSections.hero.subtext);
  assert.equal(content.en.sections.hero.heading, expectedEnSections.hero.heading);
  assert.equal(content.en.sections.hero.subtext, expectedEnSections.hero.subtext);
});

test("appreciation copy is exact and bilingual", () => {
  assert.deepEqual(content.vi.sections.appreciation, expectedViSections.appreciation);
  assert.deepEqual(content.en.sections.appreciation, expectedEnSections.appreciation);
});

test("statistics copy is exact and bilingual", () => {
  assert.deepEqual(content.vi.sections.statistics, expectedViSections.statistics);
  assert.deepEqual(content.en.sections.statistics, expectedEnSections.statistics);
});

test("video copy is exact and bilingual", () => {
  assert.deepEqual(content.vi.sections.video, expectedViSections.video);
  assert.deepEqual(content.en.sections.video, expectedEnSections.video);
});

test("milestones keep all source entries in order and exact text", () => {
  assert.equal(content.vi.sections.milestones.items.length, 19);
  assert.equal(content.en.sections.milestones.items.length, 19);
  assert.deepEqual(content.vi.sections.milestones.items.map((item) => item.year), expectedYears);
  assert.deepEqual(content.en.sections.milestones.items.map((item) => item.year), expectedYears);
  assert.deepEqual(content.vi.sections.milestones, expectedViSections.milestones);
  assert.deepEqual(content.en.sections.milestones, expectedEnSections.milestones);
});

test("news examples remain limited to source examples and exact text", () => {
  assert.equal(content.vi.sections.news.items.length, 1);
  assert.equal(content.en.sections.news.items.length, 1);
  assert.deepEqual(content.vi.sections.news, expectedViSections.news);
  assert.deepEqual(content.en.sections.news, expectedEnSections.news);
});

test("profile copy is exact and bilingual", () => {
  assert.deepEqual(content.vi.sections.profile, expectedViSections.profile);
  assert.deepEqual(content.en.sections.profile, expectedEnSections.profile);
});

test("contact fields are exact and bilingual", () => {
  assert.deepEqual(content.vi.sections.contact, expectedViSections.contact);
  assert.deepEqual(content.en.sections.contact, expectedEnSections.contact);
});

test("assets are explicitly represented", () => {
  assert.deepEqual(content.vi.assets, expectedViAssets);
  assert.deepEqual(content.en.assets, expectedEnAssets);
});
