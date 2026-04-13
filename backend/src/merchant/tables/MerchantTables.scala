package delivery.merchant.tables

object MerchantTables:
  val MerchantAccounts = "merchant_accounts"
  val MerchantStores = "merchant_stores"
  val CatalogMerchants = "catalog_merchants"
  val CatalogProducts = "catalog_products"

  val all: List[String] = List(MerchantAccounts, MerchantStores, CatalogMerchants, CatalogProducts)

end MerchantTables
