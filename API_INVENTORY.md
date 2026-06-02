# API Inventory

当前项目通过统一网关暴露业务能力：

```text
POST /api/{apiName}
```

后端业务 API 文件位于 `backend/src/{module}/api/XxxAPIMessage.scala`；前端对应文件位于 `frontend/src/apis/{module}/XxxAPI.ts`。前端文件名等于后端文件名去掉 `Message`。

## API 列表

| 模块 | apiName | 后端 API 文件 | 前端 API 文件 | 响应 |
|---|---|---|---|---|
| ai | `aisearchapi` | `backend/src/ai/api/AISearchAPIMessage.scala` | `frontend/src/apis/ai/AISearchAPI.ts` | `AISearchResponse` |
| ai | `aidietweeklyreportapi` | `backend/src/ai/api/AIDietWeeklyReportAPIMessage.scala` | `frontend/src/apis/ai/AIDietWeeklyReportAPI.ts` | `AIDietWeeklyReportResponse` |
| ai | `aiorderprogressnarrativesapi` | `backend/src/ai/api/AIOrderProgressNarrativesAPIMessage.scala` | `frontend/src/apis/ai/AIOrderProgressNarrativesAPI.ts` | `AIOrderProgressNarrativesResponse` |
| ai | `aimerchantstoredescriptionapi` | `backend/src/ai/api/AIMerchantStoreDescriptionAPIMessage.scala` | `frontend/src/apis/ai/AIMerchantStoreDescriptionAPI.ts` | `AIMerchantStoreDescriptionResponse` |
| ai | `aimerchantproductdescriptionsapi` | `backend/src/ai/api/AIMerchantProductDescriptionsAPIMessage.scala` | `frontend/src/apis/ai/AIMerchantProductDescriptionsAPI.ts` | `AIMerchantProductDescriptionsResponse` |
| user | `loginapi` | `backend/src/user/api/LoginAPIMessage.scala` | `frontend/src/apis/user/LoginAPI.ts` | `LoginResponse` |
| user | `registerapi` | `backend/src/user/api/RegisterAPIMessage.scala` | `frontend/src/apis/user/RegisterAPI.ts` | `OkResponse` |
| user | `customermeapi` | `backend/src/user/api/CustomerMeAPIMessage.scala` | `frontend/src/apis/user/CustomerMeAPI.ts` | `CustomerMeResponse` |
| user | `customerprofilepatchapi` | `backend/src/user/api/CustomerProfilePatchAPIMessage.scala` | `frontend/src/apis/user/CustomerProfilePatchAPI.ts` | `OkResponse` |
| user | `customerrechargeapi` | `backend/src/user/api/CustomerRechargeAPIMessage.scala` | `frontend/src/apis/user/CustomerRechargeAPI.ts` | `CustomerWalletTopUpResponse` |
| user | `customervoucherdiscardapi` | `backend/src/user/api/CustomerVoucherDiscardAPIMessage.scala` | `frontend/src/apis/user/CustomerVoucherDiscardAPI.ts` | `OkResponse` |
| merchant | `catalogapi` | `backend/src/merchant/api/CatalogAPIMessage.scala` | `frontend/src/apis/merchant/CatalogAPI.ts` | `CatalogResponse` |
| merchant | `merchantmeapi` | `backend/src/merchant/api/MerchantMeAPIMessage.scala` | `frontend/src/apis/merchant/MerchantMeAPI.ts` | `MerchantMeResponse` |
| merchant | `merchantprofileapi` | `backend/src/merchant/api/MerchantProfileAPIMessage.scala` | `frontend/src/apis/merchant/MerchantProfileAPI.ts` | `OkResponse` |
| merchant | `merchantstoreapi` | `backend/src/merchant/api/MerchantStoreAPIMessage.scala` | `frontend/src/apis/merchant/MerchantStoreAPI.ts` | `String` |
| merchant | `merchantstoredescriptionapi` | `backend/src/merchant/api/MerchantStoreDescriptionAPIMessage.scala` | `frontend/src/apis/merchant/MerchantStoreDescriptionAPI.ts` | `OkResponse` |
| merchant | `merchantstoreimageapi` | `backend/src/merchant/api/MerchantStoreImageAPIMessage.scala` | `frontend/src/apis/merchant/MerchantStoreImageAPI.ts` | `OkResponse` |
| merchant | `merchantstoreimagefileapi` | `backend/src/merchant/api/MerchantStoreImageFileAPIMessage.scala` | `frontend/src/apis/merchant/MerchantStoreImageFileAPI.ts` | `String` |
| merchant | `merchantcreateproductapi` | `backend/src/merchant/api/MerchantCreateProductAPIMessage.scala` | `frontend/src/apis/merchant/MerchantCreateProductAPI.ts` | `Product` |
| merchant | `merchantproductapi` | `backend/src/merchant/api/MerchantProductAPIMessage.scala` | `frontend/src/apis/merchant/MerchantProductAPI.ts` | `Product` |
| merchant | `merchantproductdescriptionsapi` | `backend/src/merchant/api/MerchantProductDescriptionsAPIMessage.scala` | `frontend/src/apis/merchant/MerchantProductDescriptionsAPI.ts` | `OkResponse` |
| merchant | `merchantorderreadyapi` | `backend/src/merchant/api/MerchantOrderReadyAPIMessage.scala` | `frontend/src/apis/merchant/MerchantOrderReadyAPI.ts` | `OkResponse` |
| order | `checkoutapi` | `backend/src/order/api/CheckoutAPIMessage.scala` | `frontend/src/apis/order/CheckoutAPI.ts` | `CheckoutResponse` |
| order | `customerordersapi` | `backend/src/order/api/CustomerOrdersAPIMessage.scala` | `frontend/src/apis/order/CustomerOrdersAPI.ts` | `CustomerOrdersResponse` |
| order | `orderdetailapi` | `backend/src/order/api/OrderDetailAPIMessage.scala` | `frontend/src/apis/order/OrderDetailAPI.ts` | `Order` |
| order | `ordercancelapi` | `backend/src/order/api/OrderCancelAPIMessage.scala` | `frontend/src/apis/order/OrderCancelAPI.ts` | `OrderCancelResponse` |
| order | `ordercompleteapi` | `backend/src/order/api/OrderCompleteAPIMessage.scala` | `frontend/src/apis/order/OrderCompleteAPI.ts` | `Order` |
| rider | `ridermeapi` | `backend/src/rider/api/RiderMeAPIMessage.scala` | `frontend/src/apis/rider/RiderMeAPI.ts` | `RiderMeResponse` |
| rider | `rideravailableordersapi` | `backend/src/rider/api/RiderAvailableOrdersAPIMessage.scala` | `frontend/src/apis/rider/RiderAvailableOrdersAPI.ts` | `RiderAvailableOrdersResponse` |
| rider | `ridergraborderapi` | `backend/src/rider/api/RiderGrabOrderAPIMessage.scala` | `frontend/src/apis/rider/RiderGrabOrderAPI.ts` | `OkResponse` |
| rider | `riderupdateorderstatusapi` | `backend/src/rider/api/RiderUpdateOrderStatusAPIMessage.scala` | `frontend/src/apis/rider/RiderUpdateOrderStatusAPI.ts` | `RiderDeliverySettlement` |
| rider | `riderredeemtimeoutcardapi` | `backend/src/rider/api/RiderRedeemTimeoutCardAPIMessage.scala` | `frontend/src/apis/rider/RiderRedeemTimeoutCardAPI.ts` | `RiderTimeoutCardRedeemResponse` |
| rider | `riderusetimeoutcardapi` | `backend/src/rider/api/RiderUseTimeoutCardAPIMessage.scala` | `frontend/src/apis/rider/RiderUseTimeoutCardAPI.ts` | `RiderUseTimeoutCardResponse` |

## Contract 目录

| 类型 | 后端 | 前端 |
|---|---|---|
| 领域对象 | `backend/src/{module}/objects/` | `frontend/src/objects/{module}/` |
| 请求/响应对象 | `backend/src/{module}/objects/apiTypes/` | `frontend/src/objects/{module}/apiTypes/` |
| API 基础设施 | `backend/src/shared/api/` | `frontend/src/apis/shared/` |

除业务 APIMessage 网关外，商家店铺图片通过 `GET /api/merchant/store-images/{fileName}` 公开访问。该路由仅服务静态图片，不作为业务 API 计入对齐表。
