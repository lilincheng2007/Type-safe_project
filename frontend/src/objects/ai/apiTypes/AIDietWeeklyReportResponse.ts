export interface DietNutritionItem {
  name: string
  amount: string
  assessment: string
}

export interface DietWeeklySummary {
  calorieTotal: string
  orderCount: number
  topCategory: string
  topMerchant: string
}

export interface AIDietWeeklyReportResponse {
  summary: DietWeeklySummary
  dietAnalysis: string
  nutritionAnalysis: DietNutritionItem[]
  suggestions: string[]
  weeklyTrend: string
  generatedAt: string
}
