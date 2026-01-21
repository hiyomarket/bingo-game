#!/bin/bash
# Bingo Game 路徑修復腳本（適用於 Nginx 反向代理環境）

set -e

echo "=== Bingo Game 路徑修復腳本 ==="
echo ""

# 1. 修復 vite.config.ts
echo "[1/4] 修復 vite.config.ts..."
python3 << 'PYEOF'
import re
with open("vite.config.ts", "r") as f:
    content = f.read()
content = re.sub(r"base:\s*['\"]\/['\"]", "base: '/bingo'", content)
with open("vite.config.ts", "w") as f:
    f.write(content)
print("✓ vite.config.ts 已設定為 base: '/bingo'")
PYEOF

# 2. 修復 server/index.ts
echo "[2/4] 修復 server/index.ts..."
python3 << 'PYEOF'
import re
with open("server/index.ts", "r") as f:
    content = f.read()

# 移除 /bingo 子路徑邏輯（Nginx 已處理）
content = re.sub(
    r"app\.use\(['\"]\/bingo['\"]\s*,\s*express\.static\(staticPath\)\)",
    "app.use(express.static(staticPath))",
    content
)

content = re.sub(
    r'app\.get\(["\']\/bingo\/\*["\']\s*,',
    'app.get("*",',
    content
)

# 移除根路徑重定向
content = re.sub(
    r'app\.get\(["\']\/["\']\s*,\s*\(_req,\s*res\)\s*=>\s*\{\s*res\.redirect\(["\']\/bingo["\']\);\s*\}\);',
    '',
    content
)

with open("server/index.ts", "w") as f:
    f.write(content)
print("✓ server/index.ts 已更新為根路徑服務")
PYEOF

# 3. 修復 client/src/App.tsx
echo "[3/4] 修復 client/src/App.tsx..."
if [ -f "client/src/App.tsx" ]; then
    python3 << 'PYEOF'
import re
with open("client/src/App.tsx", "r") as f:
    content = f.read()
content = re.sub(
    r'<Router\s+base=["\']\/bingo["\']\s*>',
    '<Router>',
    content
)
with open("client/src/App.tsx", "w") as f:
    f.write(content)
print("✓ client/src/App.tsx wouter base 已移除")
PYEOF
else
    echo "⚠ client/src/App.tsx 不存在，跳過"
fi

# 4. 修復 Socket.IO 路徑
echo "[4/4] 修復 SocketContext.tsx..."
if [ -f "client/src/contexts/SocketContext.tsx" ]; then
    python3 << 'PYEOF'
import re
with open("client/src/contexts/SocketContext.tsx", "r") as f:
    content = f.read()
content = re.sub(
    r"path:\s*['\"]\/socket\.io['\"]",
    "path: '/bingo/socket.io'",
    content
)
with open("client/src/contexts/SocketContext.tsx", "w") as f:
    f.write(content)
print("✓ SocketContext.tsx 已設定為 path: '/bingo/socket.io'")
PYEOF
else
    echo "⚠ SocketContext.tsx 不存在，跳過"
fi

echo ""
echo "=== 修復完成！==="
echo ""
echo "接下來執行："
echo "  pnpm build"
echo "  pm2 restart bingo-game"
