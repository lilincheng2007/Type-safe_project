import { Wallet } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ReviewSummary } from '@/objects/review/ReviewSummary'
import type { RiderReview } from '@/objects/review/RiderReview'

interface SalaryCardProps {
  salary: number
  reviewSummary: ReviewSummary
  reviews: RiderReview[]
}

export function SalaryCard({ salary, reviewSummary, reviews }: SalaryCardProps) {
  return (
    <Card className="border-orange-100 bg-white/95">
      <CardHeader>
        <CardDescription>每单收入按截至该单的平均评分结算</CardDescription>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="size-5 text-orange-500" />
          当月薪资
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-slate-700">
        <p>当前累计：¥{salary.toFixed(2)}</p>
        <p className="mt-2">当前评分：★ {reviewSummary.averageRating.toFixed(1)} · {reviewSummary.reviewCount} 单评分</p>
        <div className="mt-3 space-y-2">
          {reviews.length === 0 ? (
            <p className="text-slate-500">暂无骑手评价。</p>
          ) : (
            reviews.slice(0, 5).map((review) => (
              <div key={review.id} className="rounded-xl border border-orange-100 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span>{review.customerName}</span>
                  <span className="text-amber-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
