package delivery.ai.objects

final case class DietNutritionItem(
    name: String,
    amount: String,
    assessment: String
)

final case class DietWeeklySummary(
    calorieTotal: String,
    orderCount: Int,
    topCategory: String,
    topMerchant: String
)

final case class AIDietWeeklyReportResponse(
    summary: DietWeeklySummary,
    nutritionAnalysis: List[DietNutritionItem],
    suggestions: List[String],
    weeklyTrend: String,
    generatedAt: String
)
