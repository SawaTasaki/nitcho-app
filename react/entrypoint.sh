#!/bin/sh

# 環境変数から env.js を生成
cat <<EOF > /usr/share/nginx/html/env.js
window.ENV = {
  VITE_BACKEND_ORIGIN: "$VITE_BACKEND_ORIGIN"
};
EOF

# Nginx 起動
exec "$@"
