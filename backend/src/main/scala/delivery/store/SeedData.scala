package delivery.store

import delivery.model.*

object SeedData:

  val seedCustomers: List[Customer] = List(
    Customer(
      id = "u-1001",
      name = "李然",
      phone = "13800001234",
      defaultAddress = "浦东新区世纪大道 100 号 1203 室",
      walletBalance = 188.5,
      orderHistoryIds = List("o-9001", "o-9002"),
      vouchers = List(
        Voucher("v-1", "满30减8", 8, 30, "2026-04-30", 2)
      )
    )
  )

  val seedMerchants: List[Merchant] = List(
    Merchant(
      "m-2001",
      "阿强小炒",
      "中餐",
      "浦东新区张杨路 88 号",
      "021-60001234",
      4.8,
      List("五星店铺", "出餐快"),
      List("p-3001", "p-3002")
    ),
    Merchant(
      "m-2002",
      "甜点星球",
      "饮品甜点",
      "徐汇区天钥桥路 77 号",
      "021-60005678",
      4.7,
      List("下午茶首选"),
      List("p-3003")
    )
  )

  val seedProducts: List[Product] = List(
    Product(
      "p-3001",
      "m-2001",
      "宫保鸡丁饭",
      28,
      "经典川味，微辣。",
      "https://picsum.photos/200/120?food-1",
      768,
      "充足",
      Some("会员价 25.5")
    ),
    Product(
      "p-3002",
      "m-2001",
      "番茄牛腩饭",
      32,
      "慢炖牛腩，配时蔬。",
      "https://picsum.photos/200/120?food-2",
      514,
      "紧张",
      None
    ),
    Product(
      "p-3003",
      "m-2002",
      "杨枝甘露大杯",
      22,
      "芒果+西米+西柚，冰爽口感。",
      "https://picsum.photos/200/120?drink-1",
      903,
      "充足",
      Some("第二杯半价")
    )
  )

  val seedRiders: List[Rider] = List(
    Rider("r-5001", "王涛", "13900006543", "浦东新区商城路地铁站", "空闲", 1280, 4.9, "陆家嘴站", 13880),
    Rider("r-5002", "赵鹏", "13700007654", "徐汇区肇嘉浜路", "配送中", 1024, 4.8, "徐家汇站", 12200)
  )

  val seedOrders: List[Order] = List(
    Order(
      "o-9001",
      "u-1001",
      "m-2001",
      Some("r-5001"),
      List(
        OrderItem("p-3001", "宫保鸡丁饭", 28, 1),
        OrderItem("p-3002", "番茄牛腩饭", 32, 1)
      ),
      60,
      "浦东新区世纪大道 100 号 1203 室",
      "配送中",
      "2026-03-29 11:42"
    ),
    Order(
      "o-9002",
      "u-1001",
      "m-2002",
      Some("r-5002"),
      List(OrderItem("p-3003", "杨枝甘露大杯", 22, 2)),
      44,
      "浦东新区世纪大道 100 号 1203 室",
      "已完成",
      "2026-03-28 17:10"
    )
  )

  val seedServiceAgents: List[CustomerServiceAgent] = List(
    CustomerServiceAgent("cs-01", "陈琳", "售后服务部", "在线", List("t-1", "t-2"))
  )

  val seedOperationsManagers: List[OperationsManager] = List(
    OperationsManager(
      "op-01",
      "吴越",
      "浦东新区",
      List("m-2001", "m-2002"),
      List("周末满减冲刺", "新商家冷启动流量扶持")
    )
  )

  val seedMerchantApplications: List[MerchantApplication] = List(
    MerchantApplication("ma-001", "张晨", "夜猫子烧烤", "夜宵", "杨浦区", "待审核")
  )

  val seedComplaintTickets: List[ComplaintTicket] = List(
    ComplaintTicket("t-1", "o-9001", "李然", "骑手配送绕路，超时 20 分钟。", "中", "待处理"),
    ComplaintTicket("t-2", "o-9002", "李然", "饮品封口破损。", "高", "处理中")
  )

  val seedCampaigns: List[PromotionCampaign] = List(
    PromotionCampaign("c-01", "新客立减 12 元", "新客", "进行中"),
    PromotionCampaign("c-02", "周末全城满 39 减 6", "全体用户", "草稿")
  )

end SeedData
