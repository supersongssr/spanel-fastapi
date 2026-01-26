# SS-Panel FastAPI Backend

现代化重构的 SS-Panel Mod Uim 后端系统，基于 FastAPI 框架。

## 项目状态

**当前版本**: v0.0.1 (测试阶段)

⚠️ **注意**: 当前 API 路径为 `/app/api/v0/*`，表示这是一个不稳定的测试版本。请勿在生产环境使用。

## 技术栈

- **框架**: FastAPI 0.128.0
- **数据库**: MySQL (使用 aiomysql 异步驱动)
- **缓存**: Redis 7.x
- **ORM**: SQLAlchemy 2.0 (异步)
- **数据验证**: Pydantic v2
- **包管理**: uv

## 项目结构

```
backend/
├── app/
│   ├── api/                 # API 路由
│   │   ├── v0/             # v0 API (测试版)
│   │   │   └── health.py   # 健康检查
│   │   └── __init__.py
│   ├── core/               # 核心配置
│   │   ├── config.py       # 配置管理
│   │   ├── security.py     # 安全工具
│   │   └── deps.py         # FastAPI 依赖
│   ├── db/                 # 数据库连接
│   │   ├── session.py      # SQLAlchemy 会话
│   │   └── redis.py        # Redis 客户端
│   ├── models/             # 数据模型
│   │   ├── user.py         # 用户模型
│   │   ├── node.py         # 节点模型
│   │   ├── traffic_log.py  # 流量日志
│   │   ├── shop.py         # 商店模型
│   │   ├── paylist.py      # 支付模型
│   │   ├── ticket.py       # 工单模型
│   │   └── link.py         # 订阅链接
│   ├── schemas/            # Pydantic 模式
│   │   └── response.py     # 响应模式
│   ├── services/           # 业务服务
│   └── utils/              # 工具函数
├── .env                    # 环境变量 (需自行创建)
├── .env.example            # 环境变量示例
├── main.py                 # 应用入口
├── pyproject.toml          # 项目配置
└── README.md               # 本文件
```

## 快速开始

### 1. 环境准备

确保已安装：
- Python 3.11+
- MySQL 8.0+
- Redis 7.x+

### 2. 安装依赖

```bash
# 使用 uv 安装依赖
uv pip install -r requirements.txt
```

### 3. 配置环境变量

```bash
# 复制环境变量示例
cp .env.example .env

# 编辑 .env 文件，修改数据库连接等配置
nano .env
```

**关键配置项**:
```env
# 数据库配置
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=test-spanel-fastapi  # 必须使用这个数据库名

# 安全配置
SECRET_KEY=your-secret-key
MU_KEY=your-mu-key

# Redis 配置
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### 4. 初始化数据库

```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE `test-spanel-fastapi` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# 导入原始表结构 (从原项目)
mysql -u root -p test-spanel-fastapi < /path/to/original/schema.sql
```

### 5. 启动应用

```bash
# 开发模式 (支持热重载)
python main.py

# 或使用 uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

应用将在 http://localhost:8000 启动。

### 6. 测试 API

```bash
# 健康检查
curl http://localhost:8000/app/api/v0/health

# Ping
curl http://localhost:8000/app/api/v0/ping

# API 文档 (仅 debug 模式)
open http://localhost:8000/docs
```

## API 文档

### 基础路径规范

- **当前版本**: `/app/api/v0/*` (测试版)
- **稳定版本**: 待定 (计划为 `/app/api/v1/*`)

### 响应格式

所有 API 响应遵循统一格式，与原 PHP 项目兼容：

```json
{
    "ret": 1,           // 1=成功, 0=失败
    "msg": "ok",        // 消息
    "data": {...}       // 数据 (可选)
}
```

### 已实现接口

#### 健康检查

```
GET /app/api/v0/health
```

**响应**:
```json
{
    "ret": 1,
    "msg": "ok",
    "data": {
        "database": "connected",
        "redis": "connected",
        "version": "1.0.0"
    }
}
```

#### Ping

```
GET /app/api/v0/ping
```

**响应**:
```json
{
    "ret": 1,
    "msg": "pong",
    "data": null
}
```

## 开发指南

### 添加新的 API 端点

1. 在 `app/api/v0/` 创建新的路由文件
2. 定义路由和处理函数
3. 在 `app/api/__init__.py` 中注册路由

示例：
```python
# app/api/v0/users.py
from fastapi import APIRouter, Depends
from app.schemas.response import ResponseModel

router = APIRouter()

@router.get("/users")
async def get_users():
    return ResponseModel(
        ret=1,
        msg="ok",
        data={"users": []}
    )
```

### 添加新的数据模型

1. 在 `app/models/` 创建新的模型文件
2. 继承 `Base` 类
3. **严格遵守原项目的表结构**

示例：
```python
# app/models/custom.py
from sqlalchemy import Column, Integer, String
from app.db.session import Base

class CustomModel(Base):
    __tablename__ = "custom_table"

    id = Column(Integer, primary_key=True)
    name = Column(String(128))
```

## 数据库兼容性

本项目严格遵守原 PHP 项目的数据库结构：

- ✅ **表名**: 与原项目完全一致
- ✅ **字段名**: 与原项目完全一致
- ✅ **字段类型**: 与原项目完全一致
- ✅ **默认值**: 与原项目完全一致

**核心数据表**:
- `user` - 用户表
- `ss_node` - 节点表
- `user_traffic_log` - 流量日志
- `shop` - 商店表
- `bought` - 购买记录
- `paylist` - 支付订单
- `payback` - 返利记录
- `code` - 充值码
- `ticket` - 工单
- `link` - 订阅链接

## 配置说明

### 环境变量列表

详见 `.env.example` 文件。

主要配置分类：
- 应用设置 (APP_*)
- 安全设置 (SECRET_KEY, JWT_*)
- 数据库设置 (DB_*)
- Redis 设置 (REDIS_*)
- 邮件设置 (MAIL_*)
- 支付设置 (PAYMENT_*, ALIPAY_*)
- 功能开关 (ENABLE_*)

## 部署

### Docker 部署

```bash
# 构建镜像
docker build -t spanel-fastapi .

# 运行容器
docker run -d \
  -p 8000:8000 \
  --env-file .env \
  --name spanel-fastapi \
  spanel-fastapi
```

### systemd 部署

创建 `/etc/systemd/system/spanel-fastapi.service`:

```ini
[Unit]
Description=SS-Panel FastAPI
After=network.target mysql.service redis.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/backend
Environment="PATH=/path/to/backend/.venv/bin"
ExecStart=/path/to/backend/.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
sudo systemctl daemon-reload
sudo systemctl start spanel-fastapi
sudo systemctl enable spanel-fastapi
```

## 故障排除

### 数据库连接失败

1. 检查 MySQL 是否运行: `systemctl status mysql`
2. 检查数据库是否存在: `mysql -u root -p -e "SHOW DATABASES LIKE 'test-spanel-fastapi';"`
3. 检查用户权限: `mysql -u root -p -e "GRANT ALL ON test-spanel-fastapi.* TO 'root'@'localhost';"`

### Redis 连接失败

1. 检查 Redis 是否运行: `systemctl status redis`
2. 测试连接: `redis-cli ping`
3. 检查端口: `netstat -tlnp | grep 6379`

### 依赖安装失败

使用 uv 重新安装：
```bash
rm -rf .venv
python3 -m venv .venv
uv pip install -r requirements.txt
```

## 性能优化

- 使用异步数据库连接池
- Redis 缓存热点数据
- Gunicorn + Uvicorn 部署 (生产环境)

示例 Gunicorn 配置：
```bash
gunicorn main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile -
```

## 测试

```bash
# 运行测试 (待实现)
pytest

# 测试覆盖率 (待实现)
pytest --cov=app
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add some amazing feature'`
4. 推送到分支: `git push origin feature/amazing-feature`
5. 提交 Pull Request

## 许可证

本项目基于原 SS-Panel Mod Uim 项目重构。

## 联系方式

- 问题反馈: GitHub Issues
- 文档: `/docs/api_spec_original.md`

## 更新日志

### v0.0.1 (2025-01-26)

- ✅ 项目初始化
- ✅ 数据库连接配置
- ✅ Redis 连接配置
- ✅ 核心数据模型定义
- ✅ 健康检查 API
- ✅ 响应格式标准化

### 待实现

- [ ] 用户认证系统
- [ ] 节点管理 API
- [ ] 订阅系统
- [ ] 支付系统
- [ ] 工单系统
- [ ] 管理后台
- [ ] Mu 协议支持
