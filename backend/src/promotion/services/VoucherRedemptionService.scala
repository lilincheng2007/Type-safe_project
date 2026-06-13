package delivery.promotion.services

import delivery.domain.{Voucher, VoucherId}
import delivery.user.objects.CustomerProfile

import java.time.LocalDate
import scala.util.Try

object VoucherRedemptionService:
  private val DefaultVoucherDiscount = 10.0
  private val DefaultVoucherMinSpend = 30.0
  private val DefaultVoucherExpiresAt = "2026-12-31"

  def rewardVoucher(id: VoucherId): Voucher =
    Voucher(id, "满30减10", DefaultVoucherDiscount, DefaultVoucherMinSpend, DefaultVoucherExpiresAt, 1)

  def validateVoucher(profile: CustomerProfile, voucherId: Option[VoucherId], originalAmount: Double): Either[String, Option[Voucher]] =
    voucherId match
      case None => Right(None)
      case Some(id) =>
        profile.vouchers.find(_.id == id) match
          case None => Left("优惠券不属于当前顾客")
          case Some(voucher) if voucher.remainingCount <= 0 => Left("优惠券已使用完")
          case Some(voucher) if isVoucherExpired(voucher) => Left("优惠券已过期")
          case Some(voucher) if originalAmount < voucher.minSpend => Left(s"未满足优惠券门槛：满${voucher.minSpend}元可用")
          case Some(voucher) => Right(Some(voucher))

  def consumeVoucher(profile: CustomerProfile, voucher: Voucher): List[Voucher] =
    profile.vouchers.map { current =>
      if current.id == voucher.id then current.copy(remainingCount = math.max(0, current.remainingCount - 1))
      else current
    }

  private def isVoucherExpired(voucher: Voucher): Boolean =
    Try(LocalDate.parse(voucher.expiresAt)).toOption.forall(_.isBefore(LocalDate.now()))

end VoucherRedemptionService
