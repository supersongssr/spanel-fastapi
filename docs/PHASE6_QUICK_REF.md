# Phase 6 快速参考

## 核心文件

```
app/core/scheduler.py         # APScheduler 配置
app/services/tasks.py          # 定时任务业务逻辑
app/services/payment_service.py # 支付 + 返利服务
test_phase6.py                # 集成测试
docs/PHASE6_SUMMARY.md        # 完整文档
```

---

## 定时任务速查

### DailyJob (每天 02:00)

```python
# 1. 流量重置: u = u + d, d = 0
await db.execute(
    update(User)
    .values(
        u=User.u + User.d,  # 累加
        d=0,  # 归零
        transfer_limit=User.class_level * 10GB,
        renew_time=now + User.class_level * 10天
    )
)

# 2. 节点心跳: 7200 秒超时
timeout = time() - 7200
await db.execute(
    update(Node)
    .where(Node.node_heartbeat < timeout)
    .values(type=0)
)

# 3. 每日流量限制: 32GB (2-5组)
redis_key = f'user:{user_id}:traffic_lastday'
today_usage = total_traffic - redis.get(redis_key)
if today_usage > 32GB:
    await disable_user(user_id)
```

---

### HourlyJob (每小时 05 分)

```python
# 每小时流量限制: 6GB (2-3组)
redis_key = f'user:{user_id}:traffic_lasthour'
hour_usage = total_traffic - redis.get(redis_key)
if hour_usage > 6GB:
    await disable_user(user_id)
```

---

### CheckJob (每 10 分钟)

```python
# 1. 清理过期 IP
Ip.where("datetime", "<", time()-300).delete()

# 2. 删除过期用户
User.where("t==0 && u==0 && d==0 && reg<14天").delete()

# 3. 禁用负余额用户
User.where("money<0").update(enable=0)
```

---

## 返利系统速查

### 支付成功流程

```python
# 1. 更新订单
Paylist.id = order_id
Paylist.status = 1

# 2. 增加余额 (原子更新)
User.money = User.money + amount

# 3. 处理返利
if user.ref_by:
    commission = amount * 0.2  # 20%
    referrer.money += commission
    Payback(
        total=commission,
        userid=user.id,
        ref_by=referrer.id
    )
```

### Payback 字段

| total | 说明 |
|-------|------|
| > 0   | 已支付返利 |
| -1    | 注册奖励 |
| -2    | 收回返利 |

| callback | 说明 |
|----------|------|
| 0        | 未收回 |
| 1        | 已收回 |

---

## 配置

```bash
# .env
ENABLE_PAYBACK=true          # 启用返利
PAYBACK_MONEY=0.2            # 返利 20%
ENABLE_SCHEDULER=true        # 启用调度器
```

---

## 测试

```bash
# 启动服务
python main.py

# 查看日志
✓ Scheduled DailyJob: Daily at 02:00
✓ Scheduled HourlyJob: Every hour at minute 5
✓ Scheduled CheckJob: Every 10 minutes

# 运行测试
python test_phase6.py
```

---

## 关键点

1. ✅ 流量重置: `u = u + d`, `d = 0` (不是全部归零)
2. ✅ 原子更新: 使用 `User.u + delta` 避免并发覆盖
3. ✅ 幂等性: 检查 payback 防止重复支付
4. ✅ 异常隔离: 任务失败不影响主程序
5. ✅ Redis 缓存: 加速流量计算

---

**Phase 6 完成！** 🎉
