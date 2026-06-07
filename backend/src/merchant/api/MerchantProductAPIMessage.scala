package delivery.merchant.api

import cats.effect.IO
import delivery.merchant.objects.{Product, ProductBundleGroup}
import delivery.merchant.tables.catalogproduct.CatalogProductTable
import delivery.shared.api.{APIWithRoleMessage, HttpApiError}
import delivery.shared.objects.{ListingStatus, ProductId}

import java.sql.Connection

final case class MerchantProductAPIMessage(
    productId: ProductId,
    name: String,
    description: String,
    imageUrl: Option[String],
    categoryName: Option[String],
    price: Double,
    remainingStock: Int,
    listingStatus: ListingStatus,
    bundleGroups: Option[List[ProductBundleGroup]] = None
) extends APIWithRoleMessage[Product]:
  override def plan(connection: Connection, username: String): IO[Product] =
    if name.trim.isEmpty then IO.raiseError(HttpApiError.BadRequest("菜品名称不能为空"))
    else if price < 0 || remainingStock < 0 then IO.raiseError(HttpApiError.BadRequest("价格和库存不能为负数"))
    else
      for
        existing <- CatalogProductTable.findById(connection, productId).flatMap {
          case Some(value) => IO.pure(value)
          case None        => IO.raiseError(HttpApiError.BadRequest("未找到菜品"))
        }
        _ <- MerchantAPIMessageSupport.requireOwnedStore(connection, username, existing.merchantId)
        existingProducts <- CatalogProductTable.list(connection)
        productImageUrl <- MerchantAPIMessageSupport.validateProductImageUrl(imageUrl.getOrElse(existing.imageUrl))
        productCategoryName = MerchantAPIMessageSupport.normalizeProductCategoryName(categoryName.orElse(Some(existing.categoryName)))
        normalizedBundleGroups = bundleGroups.getOrElse(existing.bundleGroups)
        _ <- validateBundleGroups(normalizedBundleGroups, existingProducts, existing.merchantId, Some(existing.id)) match
          case Left(message) => IO.raiseError(HttpApiError.BadRequest(message))
          case Right(()) => IO.unit
        updated = existing.copy(
          name = name.trim,
          description = description.trim,
          imageUrl = productImageUrl,
          categoryName = productCategoryName,
          price = price,
          remainingStock = remainingStock,
          listingStatus = listingStatus,
          inventoryStatus = MerchantAPIMessageSupport.inventoryStatus(remainingStock, listingStatus),
          bundleGroups = normalizedBundleGroups
        )
        _ <- CatalogProductTable.upsert(connection, updated)
      yield updated

  private def validateBundleGroups(groups: List[ProductBundleGroup], products: List[Product], merchantId: String, selfId: Option[String]): Either[String, Unit] =
    if groups.isEmpty then Right(())
    else
      groups.foldLeft[Either[String, Unit]](Right(())) { case (acc, group) =>
        acc.flatMap { _ =>
          if group.name.trim.isEmpty then Left("套餐类别名称不能为空")
          else if group.quantity <= 0 then Left("套餐类别可选件数必须大于 0")
          else if group.options.isEmpty then Left(s"${group.name}至少需要选择一个菜品")
          else
            val optionProducts = group.options.flatMap(option => products.find(product => product.id == option.productId))
            val invalid = optionProducts.length != group.options.length || optionProducts.exists(product => product.merchantId != merchantId || product.bundleGroups.nonEmpty || selfId.contains(product.id))
            val selectionTypeValid = Set("fixed", "repeatable", "nonRepeatable").contains(group.selectionType)
            val hasFreeOption = group.options.exists { option =>
              optionProducts.find(_.id == option.productId).exists { product =>
                val extraPrice =
                  if option.customExtraPrice || option.extraPrice > 0 then math.max(0.0, option.extraPrice)
                  else if group.includedPrice > 0 then math.max(0.0, product.price - group.includedPrice)
                  else 0.0
                extraPrice <= 0
              }
            }
            if invalid then Left(s"${group.name}包含不可选菜品")
            else if !selectionTypeValid then Left(s"${group.name}套餐类型不合法")
            else if group.includedPrice < 0 || group.options.exists(_.extraPrice < 0) then Left(s"${group.name}包含价和加价不能为负数")
            else if !hasFreeOption then Left(s"${group.name}至少需要包含一个不加价菜品")
            else Right(())
        }
      }
