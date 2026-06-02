package delivery.ai.api

import cats.effect.IO
import delivery.ai.objects.*
import delivery.ai.objects.apiTypes.*
import delivery.ai.utils.OpenAIClient
import delivery.order.objects.Order
import delivery.order.tables.order.OrderTable
import delivery.shared.api.{APIWithRoleMessage, HttpApiError}
import delivery.shared.objects.OrderStatus
import delivery.user.tables.customerprofile.CustomerProfileTable
import io.circe.Json

import java.sql.Connection
import java.time.{LocalDate, LocalDateTime}
import java.time.format.DateTimeFormatter

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
