package delivery.ai.api

import cats.effect.IO
import cats.syntax.all.*
import delivery.ai.objects.*
import delivery.ai.utils.OpenAIClient
import delivery.merchant.api.CatalogAPIMessage
import delivery.merchant.objects.{CatalogResponse, Merchant, Product}
import delivery.order.objects.Order
import delivery.order.tables.order.OrderTable
import delivery.shared.api.{APIWithRoleMessage, HttpApiError, sendAPI}
import delivery.shared.db.DatabaseSession
import delivery.shared.objects.OrderStatus
import delivery.user.tables.customerprofile.CustomerProfileTable
import io.circe.Json

import java.sql.Connection
import java.time.{LocalDate, LocalDateTime}
import java.time.format.DateTimeFormatter
import javax.sql.DataSource

final case class AISearchAPIMessage(query: String) extends APIWithRoleMessage[AISearchResponse]:

  override def plan(connection: Connection, username: String): IO[AISearchResponse] =
    if query.trim.isEmpty then IO.raiseError(HttpApiError.BadRequest("搜索内容不能为空"))
    else
      for
        _ <- OpenAIClient.configured.flatMap { ok =>
          if !ok then IO.raiseError(HttpApiError.BadRequest("AI 服务未配置，请联系管理员")) else IO.unit
        }
        catalog <- CatalogAPIMessage().plan(connection)
        prompt = buildPrompt(catalog.merchants, catalog.products)
        resultJson <- OpenAIClient.chatCompletion(prompt, query.trim)
        response <- parseResponse(query.trim, resultJson, catalog.merchants, catalog.products)
      yield response

  private def buildPrompt(merchants: List[Merchant], products: List[Product]): String =
    val merchantSummaries = merchants.map { m =>
      val merchantProducts = products.filter(_.merchantId == m.id).map(p =>
        s"""{"id":"${p.id}","name":"${p.name}","price":${p.price},"desc":"${p.description.take(50)}","sales":${p.monthlySales}}"""
      ).mkString("[", ",", "]")
      s"""{"id":"${m.id}","name":"${m.storeName}","category":"${m.category}","rating":${m.rating},"tags":[${m.tags.mkString("\"","\",\"","\"")}],"products":$merchantProducts}"""
    }.mkString("[", ",", "]")

    s"""你是一个外卖平台的智能推荐助手。根据用户的饮食需求，从以下商家和菜品数据中推荐最匹配的商家和菜品组合。

商家和菜品数据：
$merchantSummaries

请按以下 JSON 格式返回推荐结果，不要返回其他内容：
{
  "merchants": [
    {
      "merchantId": "商家ID",
      "storeName": "商家名称",
      "category": "商家分类",
      "reason": "推荐理由（简短一句话）",
      "products": [
        {
          "productId": "菜品ID",
          "productName": "菜品名称",
          "price": 菜品价格,
          "reason": "推荐理由（简短一句话）"
        }
      ]
    }
  ],
  "summary": "一句话总结推荐"
}

要求：
1. 最多推荐 5 家商家
2. 每家商家推荐 2-5 个菜品
3. merchantId 和 productId 必须来自上面提供的数据
4. 优先推荐评分高、销量好的商家和菜品
5. reason 要针对用户需求给出有说服力的推荐理由"""

  private def parseResponse(
      query: String,
      json: Json,
      merchants: List[Merchant],
      products: List[Product]
  ): IO[AISearchResponse] =
    val merchantIds = merchants.map(_.id).toSet
    val productIds = products.map(_.id).toSet

    val cursor = json.hcursor
    for
      summary <- cursor.downField("summary").as[String] match
        case Right(s) => IO.pure(s)
        case Left(_) => IO.pure("为您推荐以下商家")
      merchantResults <- cursor.downField("merchants").as[List[Json]] match
        case Right(list) => IO.pure(list)
        case Left(_) => IO.pure(List.empty[Json])
      recommendations = merchantResults.flatMap { mJson =>
        val mc = mJson.hcursor
        val mId = mc.downField("merchantId").as[String].getOrElse("")
        if !merchantIds.contains(mId) then None
        else
          val storeName = mc.downField("storeName").as[String].getOrElse(
            merchants.find(_.id == mId).map(_.storeName).getOrElse("")
          )
          val category = mc.downField("category").as[String].getOrElse(
            merchants.find(_.id == mId).map(_.category.toString).getOrElse("")
          )
          val mReason = mc.downField("reason").as[String].getOrElse("")
          val productResults = mc.downField("products").as[List[Json]].getOrElse(List.empty).flatMap { pJson =>
            val pc = pJson.hcursor
            val pId = pc.downField("productId").as[String].getOrElse("")
            if !productIds.contains(pId) then None
            else
              val pName = pc.downField("productName").as[String].getOrElse(
                products.find(_.id == pId).map(_.name).getOrElse("")
              )
              val price = pc.downField("price").as[Double].getOrElse(
                products.find(_.id == pId).map(_.price).getOrElse(0.0)
              )
              val pReason = pc.downField("reason").as[String].getOrElse("")
              Some(AIRecommendedProduct(pId, pName, price, pReason))
          }
          if productResults.isEmpty then None
          else Some(AIRecommendedMerchant(mId, storeName, category, mReason, productResults))
      }
    yield AISearchResponse(query, recommendations, summary)

end AISearchAPIMessage

final case class AIDietWeeklyReportAPIMessage() extends APIWithRoleMessage[AIDietWeeklyReportResponse]:

  private val dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")

  override def plan(connection: Connection, username: String): IO[AIDietWeeklyReportResponse] =
    for
      _ <- OpenAIClient.configured.flatMap { ok =>
        if !ok then IO.raiseError(HttpApiError.BadRequest("AI 服务未配置，请联系管理员")) else IO.unit
      }
      account <- CustomerProfileTable.findByUsername(connection, username).flatMap {
        case Some(value) => IO.pure(value)
        case None        => IO.raiseError(HttpApiError.NotFound("未找到顾客账号"))
      }
      allOrders <- OrderTable.list(connection)
      sevenDaysAgo = LocalDate.now().minusDays(7).atStartOfDay()
      recentOrders = allOrders.filter { order =>
        order.customerId == account.profile.id &&
        (order.status == OrderStatus.已送达 || order.status == OrderStatus.已完成) &&
        parsePlacedAt(order.placedAt).isAfter(sevenDaysAgo)
      }
      _ <- if recentOrders.isEmpty then IO.raiseError(HttpApiError.BadRequest("近7天暂无已完成订单，无法生成周报")) else IO.unit
      prompt = buildDietReportPrompt(recentOrders)
      userMessage = "请根据我最近7天的外卖订单，生成饮食周报"
      resultJson <- OpenAIClient.chatCompletion(prompt, userMessage)
      response <- parseDietResponse(resultJson)
    yield response

  private def parsePlacedAt(placedAt: String): LocalDateTime =
    try LocalDateTime.parse(placedAt, dateFormatter)
    catch case _: Exception => LocalDateTime.MIN

  private def buildDietReportPrompt(orders: List[Order]): String =
    val orderSummaries = orders.map { order =>
      val items = order.items.map(i =>
        s"""{"name":"${i.name}","unitPrice":${i.unitPrice},"quantity":${i.quantity}}"""
      ).mkString("[", ",", "]")
      s"""{"merchantId":"${order.merchantId}","items":$items,"totalAmount":${order.totalAmount},"placedAt":"${order.placedAt}"}"""
    }.mkString("[", ",", "]")

    s"""你是一个外卖平台的营养分析助手。根据用户最近7天的外卖订单数据，生成一份饮食周报。

订单数据：
$orderSummaries

请按以下 JSON 格式返回结果，不要返回其他内容：
{
  "summary": {
    "calorieTotal": "估算总热量（如 约8500千卡）",
    "orderCount": 订单数量,
    "topCategory": "最常点品类（如 中餐）",
    "topMerchant": "最常点商家名称"
  },
  "nutritionAnalysis": [
    {
      "name": "营养素名称（如 蛋白质/碳水化合物/脂肪/膳食纤维/钠）",
      "amount": "估算摄入量（如 约180g）",
      "assessment": "评估（良好/偏高/偏低）"
    }
  ],
  "suggestions": [
    "针对性饮食建议1",
    "针对性饮食建议2",
    "针对性饮食建议3"
  ],
  "weeklyTrend": "本周饮食趋势文字描述（2-3句话）",
  "generatedAt": "报告生成时间（yyyy-MM-dd HH:mm格式）"
}

要求：
1. 基于订单菜品名称和分量合理估算营养数据
2. nutritionAnalysis 包含 4-6 个核心营养素
3. suggestions 给出 3-5 条实用的饮食改善建议
4. 评估要客观，注意外卖饮食常见的营养不均衡问题
5. weeklyTrend 要指出饮食中的优点和需要改进的地方"""

  private def parseDietResponse(json: Json): IO[AIDietWeeklyReportResponse] =
    val cursor = json.hcursor
    for
      summaryJson <- cursor.downField("summary").as[Json] match
        case Right(j) => IO.pure(j)
        case Left(_)  => IO.pure(Json.obj())
      sCursor = summaryJson.hcursor
      calorieTotal = sCursor.downField("calorieTotal").as[String].getOrElse("未知")
      orderCount = sCursor.downField("orderCount").as[Int].getOrElse(0)
      topCategory = sCursor.downField("topCategory").as[String].getOrElse("未知")
      topMerchant = sCursor.downField("topMerchant").as[String].getOrElse("未知")
      nutritionItems <- cursor.downField("nutritionAnalysis").as[List[Json]] match
        case Right(list) => IO.pure(list)
        case Left(_)     => IO.pure(List.empty[Json])
      nutritionAnalysis = nutritionItems.flatMap { nJson =>
        val nc = nJson.hcursor
        val name = nc.downField("name").as[String].getOrElse("")
        val amount = nc.downField("amount").as[String].getOrElse("")
        val assessment = nc.downField("assessment").as[String].getOrElse("")
        if name.nonEmpty then Some(DietNutritionItem(name, amount, assessment)) else None
      }
      suggestions <- cursor.downField("suggestions").as[List[String]] match
        case Right(list) => IO.pure(list)
        case Left(_)     => IO.pure(List.empty[String])
      weeklyTrend = cursor.downField("weeklyTrend").as[String].getOrElse("暂无趋势数据")
      generatedAt = cursor.downField("generatedAt").as[String].getOrElse(
        LocalDateTime.now().format(dateFormatter)
      )
    yield AIDietWeeklyReportResponse(
      DietWeeklySummary(calorieTotal, orderCount, topCategory, topMerchant),
      nutritionAnalysis,
      suggestions,
      weeklyTrend,
      generatedAt
    )

end AIDietWeeklyReportAPIMessage
