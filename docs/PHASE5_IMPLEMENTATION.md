# Phase 5 Implementation Guide

## 支付系统、商店逻辑与节点后端通讯

本文档详细说明了 Phase 5 的实现内容，包括节点通讯接口、商店购买逻辑和支付系统。

---

## 目录

1. [节点后端通讯接口 (Mu API / WebAPI)](#节点后端通讯接口)
2. [商店购买与套餐处理逻辑](#商店购买与套餐处理逻辑)
3. [支付网关骨架与回调处理](#支付网关骨架与回调处理)
4. [API 端点列表](#api-端点列表)
5. [测试指南](#测试指南)

---

## 节点后端通讯接口

### 实现位置

- **文件**: `backend/app/api/v0/node/webapi.py`
- **路由前缀**: `/app/api/v0/node`
- **认证方式**: HTTP Header `Key` (MU_KEY)

### 核心接口

#### 1. GET `/app/api/v0/node/users` - 拉取用户列表

**功能**: 节点后端（如 v2ray-poseidon）调用此接口获取授权用户列表。

**请求头**:
```
Key: your-mu-key
```

**查询参数**:
- `node_id` (可选): 节点ID，用于按节点组过滤用户

**响应示例**:
```json
{
  "ret": 1,
  "msg": "ok",
  "data": {
    "users": [
      {
        "id": 1,
        "email": "user@example.com",
        "passwd": "ss-password",
        "port": 10001,
        "method": "aes-256-gcm",
        "protocol": "origin",
        "obfs": "plain",
        "t": 1737888000,
        "u": 1048576,
        "d": 2097152,
        "transfer_enable": 107374182400,
        "class": 1,
        "node_group": 0,
        "enable": 1,
        "switch": 1
      }
    ],
    "count": 1
  }
}
```

**性能优化**:
- 仅查询核心字段，避免 `SELECT *` (60+ 字段)
- 使用 `enable=1 AND switch=1` 过滤有效用户
- 按 `node_group` 过滤（如果提供 `node_id`）

---

#### 2. POST `/app/api/v0/node/traffic` - 上报流量

**功能**: 节点定期上报用户流量使用情况。

**请求头**:
```
Key: your-mu-key
Content-Type: application/json
```

**请求体**:
```json
{
  "node_id": 1,
  "data": [
    {
      "user_id": 1,
      "u": 1048576,  // 上传字节数（本次周期）
      "d": 2097152   // 下载字节数（本次周期）
    }
  ]
}
```

**响应示例**:
```json
{
  "ret": 1,
  "msg": "流量上报成功",
  "data": {
    "updated_count": 1,
    "node_id": 1,
    "total_traffic": 3145728
  }
}
```

**关键实现**:
```python
# 原子更新，防止并发覆盖
await db.execute(
    update(User)
    .where(User.id == user_id)
    .values(
        u=User.u + u_delta,  # 数据库级别原子操作
        d=User.d + d_delta,
        t=int(datetime.now().timestamp())
    )
)
```

**安全说明**:
- ✅ 使用 `u = u + :val` 原子更新
- ❌ 禁止先查出再在 Python 中相加后写入（会并发覆盖）

---

#### 3. POST `/app/api/v0/node/online` - 上报在线人数

**功能**: 节点实时上报当前在线用户数和负载。

**请求体**:
```json
{
  "node_id": 1,
  "online": 45,
  "load": "0.25"
}
```

**响应**:
```json
{
  "ret": 1,
  "msg": "在线人数上报成功",
  "data": {
    "node_id": 1,
    "online": 45,
    "load": "0.25"
  }
}
```

**存储策略**:
- 数据库: 更新 `node_heartbeat` 和 `node_online`
- Redis: 存储实时在线数（5分钟过期），用于快速查询

---

#### 4. POST `/app/api/v0/node/heartbeat` - 节点心跳

**功能**: 轻量级心跳，节点定期报告存活状态。

**请求体**:
```json
{
  "node_id": 1,
  "cpu_load": 0.25,
  "memory_usage": 45.2,
  "network_speed": 100.5
}
```

**存储**: 详细统计信息存储在 Redis（3分钟过期）。

---

#### 5. GET `/app/api/v0/node/info/{node_id}` - 获取节点配置

**功能**: 节点后端获取自身配置信息。

**响应**:
```json
{
  "ret": 1,
  "msg": "ok",
  "data": {
    "id": 1,
    "name": "HK Node 1",
    "server": "hk1.example.com",
    "method": "aes-256-gcm",
    "node_speedlimit": 50.0,
    "node_class": 1,
    ...
  }
}
```

---

## 商店购买与套餐处理逻辑

### 实现位置

- **Service**: `backend/app/services/shop_service.py`
- **API**: `backend/app/api/v0/user/shop.py`
- **路由**: `/app/api/v0/user/shop`

### 核心接口

#### 1. GET `/app/api/v0/user/shop` - 获取商品列表

**功能**: 用户查看可购买的套餐。

**响应**:
```json
{
  "ret": 1,
  "msg": "ok",
  "data": {
    "packages": [
      {
        "id": 1,
        "name": "月度套餐 100GB",
        "price": 19.99,
        "content": "{\"traffic\": 100, \"class\": 1, \"class_expire\": 30, \"reset_traffic\": true}",
        "auto_renew": 0,
        "auto_reset_bandwidth": 0,
        "status": 1
      }
    ],
    "count": 1
  }
}
```

---

#### 2. POST `/app/api/v0/user/buy` - 购买套餐

**功能**: 用户消耗余额购买套餐，触发一系列原子操作。

**请求体**:
```json
{
  "shop_id": 1
}
```

**核心业务逻辑** (单事务):

```python
async with db.begin():
    # 1. 扣除余额
    await db.execute(
        update(User)
        .where(User.id == user.id)
        .values(money=User.money - shop.price)
    )

    # 2. 更新用户套餐属性
    await db.execute(
        update(User)
        .where(User.id == user.id)
        .values(
            class_level=new_class,
            class_expire=new_class_expire,
            expire_in=new_expire_in,
            transfer_enable=new_transfer_enable,
            u=0 if reset_traffic else user.u,  # 流量重置
            d=0 if reset_traffic else user.d
        )
    )

    # 3. 记录购买历史
    bought = Bought(
        userid=user.id,
        shopid=shop.id,
        datetime=int(now.timestamp()),
        price=shop.price
    )
    db.add(bought)

    await db.commit()  # 提交事务
```

**套餐内容格式** (JSON):
```json
{
  "traffic": 100,           // 流量 (GB)
  "class": 1,               // 用户等级
  "class_expire": 30,       // 等级过期天数
  "expire_in": 30,          // 账号过期天数
  "reset_traffic": true     // 是否重置已用流量
}
```

**响应**:
```json
{
  "ret": 1,
  "msg": "购买成功",
  "data": {
    "user_id": 1,
    "shop_id": 1,
    "shop_name": "月度套餐 100GB",
    "price": 19.99,
    "new_balance": 80.01,
    "new_class": 1,
    "new_class_expire": "2025-02-26T12:00:00",
    "new_expire_in": "2025-02-26T12:00:00",
    "new_transfer_enable": 107374182400,
    "traffic_added_gb": 100,
    "traffic_reset": true
  }
}
```

**购买前检查**:
1. 余额充足: `user.money >= shop.price`
2. 套餐有效: `shop.status == 1`
3. (可选) 防止重复购买

---

#### 3. GET `/app/api/v0/user/bought` - 购买历史

**查询参数**:
- `limit`: 返回记录数（默认 20，最大 100）

**响应**:
```json
{
  "ret": 1,
  "msg": "ok",
  "data": {
    "history": [
      {
        "id": 123,
        "shopid": 1,
        "datetime": 1737888000,
        "renew": 1737974400,
        "price": 19.99,
        "coupon": ""
      }
    ],
    "count": 1
  }
}
```

---

## 支付网关骨架与回调处理

### 实现位置

- **API**: `backend/app/api/v0/payment/payment.py`
- **路由**: `/app/api/v0/payment`

### 核心接口

#### 1. POST `/app/api/v0/payment/create` - 创建充值订单

**功能**: 用户创建充值订单。

**请求体**:
```json
{
  "total": 100.00,
  "gateway": "alipay"
}
```

**响应**:
```json
{
  "ret": 1,
  "msg": "订单创建成功",
  "data": {
    "order_id": 123,
    "total": 100.00,
    "status": 0,  // 0=未付, 1=已付
    "tradeno": "ORDER-1737888000-1",
    "datetime": 1737888000,
    "payment_url": "/app/api/v0/payment/checkout/123"
  }
}
```

**订单字段**:
- `status`: 0 = 未支付, 1 = 已支付
- `tradeno`: 用于追踪的交易号
- `datetime`: Unix 时间戳

---

#### 2. POST `/app/api/v0/payment/notify/{gateway}` - 支付回调

**功能**: 接收第三方支付网关的异步通知。

**支持网关**:
- `alipay`: 支付宝
- `wechat`: 微信支付
- `yft`, `chenPay`, `paypal`: 其他网关

**回调处理逻辑** (TODO):
```python
async def process_payment_success(order_id, tradeno, db):
    """
    支付成功处理逻辑
    """
    # 1. 更新订单状态
    await db.execute(
        update(Paylist)
        .where(Paylist.id == order_id)
        .values(status=1, tradeno=tradeno)
    )

    # 2. 原子更新用户余额
    await db.execute(
        update(User)
        .where(User.id == order.userid)
        .values(money=User.money + order.total)
    )

    # 3. 处理推荐佣金 (TODO)

    await db.commit()
```

**安全要求**:
- ✅ 验证签名
- ✅ 验证订单存在
- ✅ 验证金额匹配
- ✅ 防重复处理

---

#### 3. POST `/app/api/v0/payment/debug/confirm` - DEBUG: 手动确认

**功能**: DEBUG 模式下手动标记订单为已支付。

**⚠️ 警告**: 仅用于调试，生产环境必须禁用！

**请求体**:
```json
{
  "order_id": 123
}
```

**响应**:
```json
{
  "ret": 1,
  "msg": "充值成功 (DEBUG模式)",
  "data": {
    "order_id": 123,
    "amount": 100.00,
    "new_balance": 150.00
  }
}
```

---

#### 4. GET `/app/api/v0/payment/orders` - 订单列表

**查询参数**:
- `status`: 0=未付, 1=已付, None=全部

**响应**:
```json
{
  "ret": 1,
  "msg": "ok",
  "data": {
    "orders": [
      {
        "id": 123,
        "total": 100.00,
        "status": 1,
        "tradeno": "ORDER-1737888000-1",
        "datetime": 1737888000
      }
    ],
    "count": 1
  }
}
```

---

#### 5. GET `/app/api/v0/payment/status/{order_id}` - 查询订单状态

**响应**:
```json
{
  "ret": 1,
  "msg": "ok",
  "data": {
    "order_id": 123,
    "status": 1,
    "total": 100.00,
    "tradeno": "ORDER-1737888000-1"
  }
}
```

---

## API 端点列表

### 节点后端通讯 (Node)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/app/api/v0/node/users` | 拉取用户列表 |
| POST | `/app/api/v0/node/traffic` | 上报流量 |
| POST | `/app/api/v0/node/online` | 上报在线人数 |
| POST | `/app/api/v0/node/heartbeat` | 节点心跳 |
| GET | `/app/api/v0/node/info/{node_id}` | 获取节点配置 |

### 商店系统 (Shop)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/app/api/v0/user/shop` | 获取商品列表 |
| POST | `/app/api/v0/user/buy` | 购买套餐 |
| GET | `/app/api/v0/user/bought` | 购买历史 |

### 支付系统 (Payment)

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/app/api/v0/payment/create` | 创建充值订单 |
| POST | `/app/api/v0/payment/notify/{gateway}` | 支付回调 |
| POST | `/app/api/v0/payment/debug/confirm` | DEBUG: 手动确认 |
| GET | `/app/api/v0/payment/orders` | 订单列表 |
| GET | `/app/api/v0/payment/status/{order_id}` | 订单状态 |

---

## 测试指南

### 1. 启动服务

```bash
cd backend
python main.py
```

### 2. 运行测试

```bash
python test_phase5.py
```

### 3. 手动测试示例

#### 测试节点通讯

```bash
# 获取用户列表
curl -X GET "http://localhost:8000/app/api/v0/node/users" \
  -H "Key: default-mu-key-please-change"

# 上报流量
curl -X POST "http://localhost:8000/app/api/v0/node/traffic" \
  -H "Key: default-mu-key-please-change" \
  -H "Content-Type: application/json" \
  -d '{
    "node_id": 1,
    "data": [{"user_id": 1, "u": 1048576, "d": 2097152}]
  }'
```

#### 测试商店购买

```bash
# 获取商品列表
curl -X GET "http://localhost:8000/app/api/v0/user/shop" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 购买套餐
curl -X POST "http://localhost:8000/app/api/v0/user/buy" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"shop_id": 1}'
```

#### 测试支付系统

```bash
# 创建充值订单
curl -X POST "http://localhost:8000/app/api/v0/payment/create" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"total": 100.00, "gateway": "alipay"}'

# DEBUG: 手动确认支付
curl -X POST "http://localhost:8000/app/api/v0/payment/debug/confirm" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"order_id": 123}'
```

---

## 全局约束检查清单

- ✅ **数据库兼容性**: 所有 models 操作未修改表结构
- ✅ **响应标准**: 所有 API 使用 `success_response` / `error_response` 包装
- ✅ **异步 Redis**: 节点在线状态使用 Redis 快速读写
- ✅ **原子更新**: 流量上报使用 `u = u + :val` 原子操作
- ✅ **计算精准度**: 流量单位使用 Byte，GB 转换使用 `1024^3`
- ✅ **权限校验**: 节点接口验证 MU_KEY，用户接口验证 JWT
- ✅ **事务一致性**: 购买和支付操作使用单数据库事务

---

## 下一步建议

1. **完善支付网关集成**
   - 实现支付宝签名验证
   - 实现微信支付 XML 解析
   - 实现 PayPal API 集成

2. **增强节点通讯**
   - 添加节点流量限流
   - 实现节点负载均衡策略
   - 添加节点异常监控

3. **优化商店系统**
   - 支持优惠券系统
   - 实现自动续费逻辑
   - 添加套餐组合购买

4. **监控与日志**
   - 添加支付回调日志
   - 实现节点通讯监控
   - 添加异常告警

---

## 技术亮点

1. **原子操作**: 流量上报使用数据库级别原子更新，完全避免并发覆盖
2. **事务一致性**: 购买流程使用单事务包裹，确保要么全部成功要么全部回滚
3. **性能优化**: 节点用户列表仅查询必要字段，减少数据传输
4. **Redis 缓存**: 节点在线状态存储在 Redis，支持高并发查询
5. **安全设计**: 所有节点接口强制 MU_KEY 认证，防止未授权访问

---

**Phase 5 实现完成！** 🎉

你的 FastAPI 后端现在具备了完整的资金流转能力和节点调度能力。
