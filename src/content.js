export const sectionOrder = [
  "hero",
  "appreciation",
  "video",
  "milestones",
  "news",
  "contest",
  "profile",
  "contact"
];

const viMilestones = [
  ["1995", "Mở văn phòng đại diện tại Hà Nội"],
  ["1996", "Hino Motors Việt Nam chính thức thành lập tại Hà Nội"],
  ["1997", "Khai trương nhà máy Hino Motors Việt Nam tại Hà Nội/Xuất xưởng chiếc xe đầu tiên - FF3H"],
  ["2001", "Khai trương đại lý Hino Trường Long (Hồ Chí Minh)"],
  ["2006", "Khai trương đại lý Hino Sao Bắc (Hà Nội)/Khai trương đại lý Hino Lexim (Hà Nội)/ Kỉ niệm 10 năm thành lập"],
  ["2007", "Khai trương trung tâm đào tạo đầu tiên tại nhà máy Hino"],
  ["2008", "Giới thiệu các dòng sản phẩm mới: WU, FC, FG, FL, FM/ Ra mắt dòng xe tải nhẹ đầu tiên của Hino - Series 300/ Khai trương đại lý Hino Trường Vinh (Vũng Tàu) và Hino Việt Đằng (Hà Nội)"],
  ["2010", "Khai trương đại lý Hino Đại Phát Tín (Cà Mau)/ HMSV chính thức thành lập tại Hồ Chí Minh"],
  ["2011", "Hino đạt chứng nhận ISO về hệ thống quản lý môi trường"],
  ["2013", "Hino ra mắt Series 300 hoàn toàn mới"],
  ["2015", "Khai trương đại lý Hino Vĩnh Thịnh (Bình Dương)"],
  ["2016", "Khai trương đại lý Hino Việt Nhật (Hải Phòng)/ Khai trương đại lý Hino Vân Đạo (Thái Nguyên)/ Kỉ niệm 20 năm thành lập"],
  ["2018", "Ra mắt dòng xe Euro 4"],
  ["2021", "Ra mắt dòng xe tải nhẹ mới"],
  ["2022", "Khai trương đại lý Hino Miền Trung (Thanh Hoá)"],
  ["2023", "Kỉ niệm chiếc xe thứ 50.000 được sản xuất"],
  ["2024", "Xuất xưởng xe XZU Euro5"],
  ["2025", "Bàn giao xe tải thứ 60.000 tại Việt Nam"]
];

const enMilestones = [
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
  ["2025", "Delivered the 60,000th truck in Vietnam"]
];

function milestones(rows) {
  return rows.map(([year, text]) => ({
    year,
    text,
    imageAlt: `${year} milestone image`
  }));
}

export const content = {
  vi: {
    lang: "vi",
    languageLabel: "VI",
    assets: {
      videoUrl: "",
      companyProfileUrl: "",
      heroBannerUrl: "src/assets/hero-banner.png"
    },
    nav: {
      logoHref: "https://hino.vn/",
      homeLabel: "Hino",
      links: [
        ["appreciation", "Thư cảm ơn"],
        ["milestones", "Hành trình 30 năm"],
        ["profile", "Hồ sơ công ty"],
        ["contest", "Cuộc thi ảnh A30"]
      ]
    },
    sections: {
      hero: {
        eyebrow: "Hino Motors Việt Nam",
        heading: "30 NĂM BẢO CHỨNG - ĐỒNG HÀNH TRIỆU HÀNH TRÌNH",
        subtext: "Ba thập kỷ bền bỉ cống hiến, Hino Motors Việt Nam không ngừng cung cấp những sản phẩm và giải pháp vận tải chất lượng cao, lấy sự hài lòng của khách hàng làm trọng tâm trong mọi hoạt động, qua đó góp phần nâng cao hiệu quả vận hành, cải thiện chất lượng sống và đồng hành cùng sự phát triển bền vững, thịnh vượng của Việt Nam."
      },
      appreciation: {
        heading: "LỜI TRI ÂN & CAM KẾT ĐỒNG HÀNH",
        quote: "<Hino cung cấp>",
        nameTitle: "<Hino cung cấp>"
      },
      video: {
        heading: "30 NĂM VƯƠN TẦM CHẤT LƯỢNG",
        subtext: "30 năm là hành trình của niềm tin được vun đắp qua từng giá trị được tạo dựng, lặng lẽ nhưng bền bỉ, để hôm nay nhìn lại, tất cả đã trở thành một phần của ký ức và niềm tự hào.",
        cta: "XEM NGAY"
      },
      milestones: {
        heading: "Những cột mốc đáng nhớ",
        subtext: "Mỗi dấu mốc không chỉ là một bước tiến, mà còn là minh chứng cho sự kiên định, nỗ lực và khát vọng vươn xa suốt 30 năm qua.",
        items: milestones(viMilestones)
      },
      news: {
        heading: "TIN TỨC",
        cta: "XEM THÊM",
        items: [
          {
            title: "HINO MOTORS VIỆT NAM GIỚI THIỆU PHIÊN BẢN KỶ NIỆM – TRI ÂN HÀNH TRÌNH ĐỒNG HÀNH CÙNG KHÁCH HÀNG",
            excerpt: "Công ty Công ty Liên doanh TNHH Hino Motors Việt Nam trân trọng giới thiệu phiên bản đặc biệt Euro6 nhân dịp kỷ niệm 30 năm thành lập (1996 – 2026). Phiên bản này được thực hiện như một lời tri ân thiết thực tới khách hàng thông qua việc nâng cấp thiết kế và trang bị, mang lại trải nghiệm vận hành tiện nghi và an toàn hơn..."
          },
          {
            title: "CHƯƠNG TRÌNH ĐÀO TẠO LÁI XE AN TOÀN & TIẾT KIỆM NHIÊN LIỆU",
            excerpt: "Với mong muốn hỗ trợ tốt hơn nữa hoạt động kinh doanh của những khách hàng đã tin chọn Hino, Hino Motors Việt Nam kết hợp cùng hệ thống đại lý chính hãng tại khu vực Tp. Hồ Chí Minh đã tổ chức thành công chương trình ĐÀO TẠO LÁI XE AN TOÀN & TIẾT..."
          }
        ]
      },
      contest: {
        heading: "A30 CONTEST: TRIỆU HÀNH TRÌNH - TRIỆU CẢM XÚC",
        subtext: "Lắng nghe những cảm xúc chân thực đã cùng Hino viết nên dấu ấn 30 năm đáng tự hào.",
        items: [
          {
            name: "Anh Nguyễn Văn A - Trưởng nhóm Cố vấn Dịch vụ - Công ty Hino Vĩnh Thịnh (Bình Dương)",
            quote: "Nhân dịp kỉ niệm 30 năm, tôi mong rằng sẽ còn được chứng kiến một HINO phát triển và thành công, để không chỉ khách hàng an tâm về sản phẩm và chất lượng dịch vụ, mà với nhân viên như tôi, những giá trị và tâm huyết đó vẫn sẽ được phát huy."
          },
          {
            name: "Anh Nguyễn Văn B - Trưởng khối Sản xuất - Công ty Hino Sao Bắc (Hà Nội)",
            quote: "Chúc cho HINO Việt Nam sẽ luôn vững vàng và phát triển mạnh mẽ hơn nữa trong tương lai. Từ đó, tiếp tục sứ mệnh đóng góp cho ngành công nghiệp ô tô Việt Nam."
          }
        ]
      },
      profile: {
        heading: "VỀ HINO MOTORS VIỆT NAM",
        subtext: "Khám phá sâu hơn về hành trình phát triển của Hino Motors Việt Nam, những giá trị cốt lõi và nền tảng tạo nên chúng tôi ngày hôm nay.",
        cta: "XEM NGAY"
      },
      contact: {
        heading: "Liên hệ",
        company: "CÔNG TY LD TNHH HINO MOTORS VIỆT NAM",
        address: "Ngõ 83 Đường Ngọc Hồi, Phường Yên Sở, Thành phố Hà Nội, Việt Nam",
        tax: "Mã số thuế: 0100114272",
        hotline: "Hotline:18009280"
      }
    }
  },
  en: {
    lang: "en",
    languageLabel: "EN",
    assets: {
      videoUrl: "",
      companyProfileUrl: "",
      heroBannerUrl: "src/assets/hero-banner.png"
    },
    nav: {
      logoHref: "https://hino.vn/",
      homeLabel: "Hino",
      links: [
        ["appreciation", "Appreciation Letter"],
        ["milestones", "Milestones"],
        ["profile", "Company Profile"],
        ["contest", "A30 Contest"]
      ]
    },
    sections: {
      hero: {
        eyebrow: "Hino Motors Vietnam",
        heading: "30 YEARS OF TRUST - ACCOMPANYING MILLIONS OF JOURNEYS",
        subtext: "For three decades of dedicated commitment, Hino Motors Vietnam has continuously delivered high-quality transport products and solutions, placing customer satisfaction at the center of every activity, thereby helping enhance operational efficiency, improve quality of life, and accompany Vietnam’s sustainable and prosperous development."
      },
      appreciation: {
        heading: "GRATITUDE & COMMITMENT TO ACCOMPANY",
        quote: "<Hino cung cấp>",
        nameTitle: "<Hino cung cấp>"
      },
      video: {
        heading: "30 YEARS ELEVATING QUALITY",
        subtext: "Thirty years is a journey of trust, nurtured through every value created, quietly yet steadfastly, so that looking back today, it has all become part of our memories and pride.",
        cta: "VIEW NOW"
      },
      milestones: {
        heading: "Memorable Milestones",
        subtext: "Each milestone is not only a step forward, but also proof of the steadfastness, effort, and aspiration to reach further over the past 30 years.",
        items: milestones(enMilestones)
      },
      news: {
        heading: "NEWS",
        cta: "SEE MORE",
        items: [
          {
            title: "HINO MOTORS VIETNAM INTRODUCES ANNIVERSARY EDITION – A TRIBUTE TO THE JOURNEY WITH CUSTOMERS",
            excerpt: "Hino Motors Vietnam Joint Venture Co., Ltd. proudly introduces the special Euro6 edition on the occasion of its 30th anniversary (1996–2026). This edition is created as a meaningful tribute to customers through upgraded design and equipment, delivering a more comfortable and safer driving experience…"
          },
          {
            title: "SAFE & FUEL-EFFICIENT DRIVING TRAINING PROGRAM",
            excerpt: "With the desire to better support the business operations of customers who have trusted Hino, Hino Motors Vietnam, together with its authorized dealer network in Ho Chi Minh City, successfully organized the SAFE & FUEL-EFFICIENT DRIVING TRAINING program…"
          }
        ]
      },
      contest: {
        heading: "A30 CONTEST: MILLIONS OF JOURNEYS - MILLIONS OF EMOTIONS",
        subtext: "Listen to heartfelt emotions that have joined Hino in writing a proud 30-year legacy.",
        items: [
          {
            name: "Mr. Nguyen Van A - Service Advisor Team Leader - Hino Vinh Thinh Company (Binh Duong)",
            quote: "On the occasion of the 30th anniversary, I hope to continue witnessing HINO grow and succeed, so that not only customers feel confident in the products and service quality, but employees like me can also see those values and dedication carried forward."
          },
          {
            name: "Mr. Nguyen Van B - Head of Production Division - Hino Sao Bac Company (Hanoi)",
            quote: "I wish HINO Vietnam continued stability and even stronger growth in the future, thereby continuing its mission of contributing to Vietnam’s automotive industry."
          }
        ]
      },
      profile: {
        heading: "ABOUT HINO MOTORS VIETNAM",
        subtext: "Explore further the development journey of Hino Motors Vietnam, the core values and foundations that have shaped who we are today.",
        cta: "VIEW NOW"
      },
      contact: {
        heading: "Contact",
        company: "HINO MOTORS VIETNAM JOINT VENTURE CO., LTD.",
        address: "Alley 83 Ngoc Hoi Street, Yen So Ward, Hanoi City, Vietnam",
        tax: "Tax code: 0100114272",
        hotline: "Hotline: 18009280"
      }
    }
  }
};
