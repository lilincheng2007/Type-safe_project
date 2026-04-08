package delivery.rider.objects

final case class RiderMeResponse(
    username: String,
    role: String,
    riderAccount: RiderAccountPublic
)
