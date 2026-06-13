package delivery.user.services

object CustomerLoyaltyService:
  private val FoodieLevelPoints = 200

  def levelOf(points: Int): Int =
    1 + math.max(0, points) / FoodieLevelPoints

end CustomerLoyaltyService
