import { Wallet } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface SalaryCardProps {
  salary: number
}

export function SalaryCard({ salary }: SalaryCardProps) {
  return (
    <Card className="border-orange-100 bg-white/95">
      <CardHeader>
        <CardDescription>每完成 1 个订单 +5 元</CardDescription>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="size-5 text-orange-500" />
          当月薪资
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-slate-700">
        当前累计：¥{salary.toFixed(2)}
      </CardContent>
    </Card>
  )
}
