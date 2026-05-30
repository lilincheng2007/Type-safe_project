#!/usr/bin/env bash
# Type-Safe Project 类型安全自动检查脚本
# 用法: bash check-type-safety.sh [项目根目录]

set -uo pipefail

ROOT="${1:-.}"
BACKEND="$ROOT/backend/src"
FRONTEND="$ROOT/frontend/src"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

pass() { echo -e "${GREEN}✅ PASS${NC}: $1"; ((PASS++)); }
fail() { echo -e "${RED}❌ FAIL${NC}: $1"; ((FAIL++)); }
warn() { echo -e "${YELLOW}⚠️  WARN${NC}: $1"; }

echo "========================================="
echo " Type-Safe Project 类型安全检查"
echo "========================================="
echo ""

# -----------------------------------------------
# 检查 1: 前后端 objects 文件名一一对应
# -----------------------------------------------
echo "--- 检查 1: Objects 文件名对应 ---"

for module in user merchant order rider; do
  if [ ! -d "$BACKEND/$module/objects" ]; then
    warn "后端 $module/objects/ 不存在，跳过"
    continue
  fi
  if [ ! -d "$FRONTEND/objects/$module" ]; then
    warn "前端 objects/$module/ 不存在，跳过"
    continue
  fi

  backend_files=$(cd "$BACKEND/$module/objects" && ls *.scala 2>/dev/null | sed 's/.scala$//' | sort)
  frontend_files=$(cd "$FRONTEND/objects/$module" && ls *.ts 2>/dev/null | sed 's/.ts$//' | sort)

  # 后端有前端无
  for f in $backend_files; do
    if ! echo "$frontend_files" | grep -qx "$f"; then
      fail "后端 $module/objects/$f.scala 在前端无对应文件"
    fi
  done

  # 前端有后端无
  for f in $frontend_files; do
    if ! echo "$backend_files" | grep -qx "$f"; then
      fail "前端 objects/$module/$f.ts 在后端无对应文件"
    fi
  done

  # 检查 index 文件
  if [ -f "$BACKEND/$module/objects/index.scala" ]; then
    fail "后端 $module/objects/ 存在 index.scala"
  fi
  if [ -f "$FRONTEND/objects/$module/index.ts" ]; then
    fail "前端 objects/$module/ 存在 index.ts"
  fi
done

# shared/objects
if [ -d "$BACKEND/shared/objects" ] && [ -d "$FRONTEND/objects/shared" ]; then
  backend_shared=$(cd "$BACKEND/shared/objects" && ls *.scala 2>/dev/null | sed 's/.scala$//' | sort)
  frontend_shared=$(cd "$FRONTEND/objects/shared" && ls *.ts 2>/dev/null | sed 's/.ts$//' | sort)

  for f in $backend_shared; do
    if ! echo "$frontend_shared" | grep -qx "$f"; then
      warn "后端 shared/objects/$f.scala 在前端无对应（可能是合理的后端独有类型）"
    fi
  done

  for f in $frontend_shared; do
    if ! echo "$backend_shared" | grep -qx "$f"; then
      warn "前端 objects/shared/$f.ts 在后端无对应（如 DeliveryState.ts 请确认是否需要）"
    fi
  done
fi

echo ""

# -----------------------------------------------
# 检查 2: 前端 API 文件一一对应（一 API 一文件）
# -----------------------------------------------
echo "--- 检查 2: API 一文件一消息 ---"

for module in user merchant order rider; do
  fe_api_dir="$FRONTEND/api/$module"
  if [ ! -d "$fe_api_dir" ]; then
    warn "前端 api/$module/ 不存在，跳过"
    continue
  fi

  # 检查每个 .ts 文件中的 APIMessage 子类数量
  for tsfile in "$fe_api_dir"/*.ts; do
    [ -f "$tsfile" ] || continue
    filename=$(basename "$tsfile")
    
    # 跳过 barrel 文件
    if echo "$filename" | grep -q "APIMessages.ts$"; then
      # 检查 barrel 文件是否有非重导出的 class 定义
      class_count=$(grep -c "^class.*extends APIMessage" "$tsfile" 2>/dev/null || true)
      class_count=$(echo "$class_count" | tr -d '[:space:]')
      if [ "${class_count:-0}" -gt 0 ]; then
        fail "$module/$filename: barrel 文件中定义了 $class_count 个 APIMessage 子类（应只做重导出）"
      fi
      continue
    fi

    class_count=$(grep -c "extends APIMessage" "$tsfile" 2>/dev/null || true)
    class_count=$(echo "$class_count" | tr -d '[:space:]')
    if [ "${class_count:-0}" -gt 1 ]; then
      fail "$module/$filename: 包含 $class_count 个 APIMessage 子类（违反一 API 一文件）"
    elif [ "${class_count:-0}" -eq 0 ]; then
      # 可能是纯重导出文件
      export_count=$(grep -c "^export {" "$tsfile" 2>/dev/null || true)
      export_count=$(echo "$export_count" | tr -d '[:space:]')
      line_count=$(wc -l < "$tsfile" | tr -d '[:space:]')
      if [ "${export_count:-0}" -gt 0 ] && [ "$line_count" -le 3 ]; then
        warn "$module/$filename: 仅有重导出，无 APIMessage 定义（应合并到对应定义文件或独立定义）"
      fi
    fi
  done
done

echo ""

# -----------------------------------------------
# 检查 3: 硬编码字符串状态比较
# -----------------------------------------------
echo "--- 检查 3: 枚举硬编码字符串 ---"

# 后端: 搜索中文字符串字面量用于状态比较
hardcoded_patterns=("待接单" "制作中" "配送中" "已送达" "已完成" "已取消" "上架" "下架" "空闲" "接单" "中餐" "西餐" "零售" "饮品甜点" "夜宵")

for pattern in "${hardcoded_patterns[@]}"; do
  # 后端 Scala: 排除 enum 定义行和 case class 定义行
  matches=$(grep -rn "\"$pattern\"" "$BACKEND" --include="*.scala" 2>/dev/null | grep -v "enum " | grep -v "^[^:]*:[0-9]*:.*case [a-zA-Z]" | head -5 || true)
  if [ -n "$matches" ]; then
    count=$(echo "$matches" | wc -l | tr -d '[:space:]')
    fail "后端硬编码字符串 \"$pattern\": $count 处"
    echo "$matches" | head -3 | while read line; do echo "  $line"; done
  fi

  # 前端 TypeScript: 排除共享枚举常量定义与类型定义行
  matches=$(grep -rn "'$pattern'" "$FRONTEND" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "objects/shared/ids.ts" | grep -v "type " | grep -v "interface " | grep -v "export type" | head -5 || true)
  if [ -n "$matches" ]; then
    count=$(echo "$matches" | wc -l | tr -d '[:space:]')
    fail "前端硬编码字符串 '$pattern': $count 处"
    echo "$matches" | head -3 | while read line; do echo "  $line"; done
  fi
done

# 检查 ID 类型别名是否在 case class 字段中使用
echo ""
echo "  --- ID 类型别名使用情况 ---"
for id_type in "UserId" "MerchantId" "RiderId" "ProductId" "OrderId" "VoucherId"; do
  # 后端: 在 objects 中搜索字段使用类型别名 vs 裸 String
  alias_usage=$(grep -rn ": $id_type" "$BACKEND" --include="*.scala" 2>/dev/null | wc -l | tr -d '[:space:]')
  alias_usage=${alias_usage:-0}
  if [ "$alias_usage" -eq 0 ]; then
    warn "后端: $id_type 类型别名未被任何字段使用"
  else
    pass "后端: $id_type 被 $alias_usage 个字段使用"
  fi
done

echo ""

# -----------------------------------------------
# 检查 4: 前端越权状态
# -----------------------------------------------
echo "--- 检查 4: 前端越权状态 ---"

# 搜索客户端计算余额后通过 profile patch 写回的模式
wallet_patch=$(grep -rn "patchCustomerProfileIO(.*walletBalance\|walletBalance .*+.*patchCustomerProfileIO\|walletBalance .*-.*patchCustomerProfileIO" "$FRONTEND" --include="*.ts" --include="*.tsx" 2>/dev/null | head -5 || true)
if [ -n "$wallet_patch" ]; then
  fail "前端存在本地计算 walletBalance 后写回后端 profile 的模式:"
  echo "$wallet_patch" | while read line; do echo "  $line"; done
fi

# 检查 CustomerProfilePatch 是否包含 walletBalance
if grep -q "walletBalance" "$FRONTEND/objects/user/CustomerProfilePatch.ts" 2>/dev/null; then
  fail "CustomerProfilePatch 包含 walletBalance 字段（应由后端专用 API 管理）"
fi

# 检查 DeliveryState.ts 用途
if [ -f "$FRONTEND/objects/shared/DeliveryState.ts" ]; then
  usage=$(grep -rn "DeliveryState" "$FRONTEND" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "DeliveryState.ts" | wc -l | tr -d '[:space:]')
  usage=${usage:-0}
  if [ "$usage" -eq 0 ]; then
    warn "DeliveryState.ts 未被任何文件引用，可考虑删除"
  fi
fi

# 检查 CheckoutCompleteRequest 含 totalDebit
if [ -f "$FRONTEND/objects/user/CheckoutCompleteRequest.ts" ]; then
  if grep -q "totalDebit" "$FRONTEND/objects/user/CheckoutCompleteRequest.ts" 2>/dev/null; then
    warn "CheckoutCompleteRequest 包含 totalDebit（扣款金额应由后端计算）"
  fi
fi

echo ""

# -----------------------------------------------
# 检查 5: var 使用检查
# -----------------------------------------------
echo "--- 检查 5: var 使用检查 ---"

var_count=$(grep -rn "\bvar\b " "$BACKEND" --include="*.scala" 2>/dev/null | grep -v "// " | grep -v "def " | wc -l | tr -d '[:space:]')
var_count=${var_count:-0}
if [ "$var_count" -gt 0 ]; then
  fail "后端代码中存在 $var_count 处 var 使用（应全部使用 val）"
  grep -rn "\bvar\b " "$BACKEND" --include="*.scala" 2>/dev/null | grep -v "// " | grep -v "def " | head -5 | while read line; do echo "  $line"; done
else
  pass "后端代码中无 var 使用"
fi

echo ""

# -----------------------------------------------
# 检查 6: 字符串路由残留
# -----------------------------------------------
echo "--- 检查 6: 字符串路由残留 ---"

# 搜索 http4s 字符串路由模式（排除静态文件和健康检查）
string_routes=$(grep -rn "Root / \"" "$BACKEND" --include="*.scala" 2>/dev/null | grep -v "health" | grep -v "store-images" | grep -v "APIMessage" | head -10 || true)
if [ -n "$string_routes" ]; then
  fail "后端存在非 APIMessage 的字符串路由:"
  echo "$string_routes" | while read line; do echo "  $line"; done
else
  pass "后端无非 APIMessage 的字符串路由（静态文件服务除外）"
fi

echo ""
echo "========================================="
echo " 检查结果: $PASS 通过, $FAIL 失败"
echo "========================================="

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
