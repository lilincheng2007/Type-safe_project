export interface ApiPlan<TInput, TOutput> {
  name: string
  plan: (input: TInput) => TOutput
}
