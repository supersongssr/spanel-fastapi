# 原 PHP 项目定时任务逻辑深度审计报告

**审计日期**: 2025-01-27
**审计范围**: `/var/www/test-spanel.freessr.bid/app/Command/`
**关键文件**: Job.php, DailyMail.php, FinanceMail.php, XCat.php
**目标**: 提取原项目业务逻辑，为 FastAPI 重构提供精确参考

---

## 目录

1. [核心定时任务概览](#核心定时任务概览)
2. [DailyJob 详细分析](#dailyjob-详细分析)
3. [HourlyJob 详细分析](#hourlyjob-详细分析)
4. [CheckJob 详细分析](#checkjob-详细分析)
5. [其他关键任务](#其他关键任务)
6. [Cron 表达式建议](#cron-表达式建议)
7. [FastAPI 实现对比](#fastapi-实现对比)

---

## 核心定时任务概览

### 任务列表

| 任务名称 | 命令 | 频率 | 优先级 | 说明 |
|---------|------|------|--------|------|
| **DailyJob** | `php xcat dailyjob` | 每天 1 次 | 🔴 最高 | 流量重置、用户清理、节点统计 |
| **HourlyJob** | `php xcat hourlyjob` | 每小时 1 次 | 🟠 高 | 每小时流量限制检测 |
| **CheckJob** | `php xcat checkjob` | 每 10 分钟 1 次 | 🟡 中 | 用户过期、等级重置、IP 清理 |
| **DbClean** | `php xcat dbclean` | 每周 1 次 | 🟢 低 | 清理 3 天前的日志 |
| **DailyMail** | `php xcat sendDiaryMail` | 每天 1 次 | 🟢 低 | 每日流量报告邮件 |
| **FinanceMail** | `php xcat sendFinanceMail_day` | 每天 1 次 | 🟢 低 | 财务日报 |
| **Backup** | `php xcat backup` | 每天 1 次 | 🟠 高 | 数据库备份 |

---

## DailyJob 详细分析

**位置**: `Job.php:252-557`
**调用**: `php xcat dailyjob`

### 核心逻辑步骤

#### 1. 禁用每日流量超标用户 (Line 253-250)

**目标**: 禁用每日流量超过 32GB 的用户（2-5 组）

```php
// 检测时间窗口: 过去 24 小时内有流量的用户
$time_last24hours = time() - 24*3600;

// 分组处理: 2-5 组（1 组不限制每日流量）
for ($_group = 2; $_group <= 5; $_group++) {
    $users = User::where('enable',1)
        ->where('node_group',$_group)
        ->where('t','>', $time_last24hours)
        ->get();

    foreach ($users as $user) {
        $total_traffic = $user->u + $user->d;
        $total_traffic_lastday = $redis->get('ssp:user:'.$user->id.':traffic_lastday');

        if ($total_traffic_lastday) {
            // 超过 32GB 禁用
            if ($total_traffic - $total_traffic_lastday > 32*1000*1000*1000) {
                $user->enable = 0;
                $user->warming = '昨日流量使用异常,触发账号异常预警';
                $user->save();
            }
        }

        // 更新 Redis 缓存，过期时间 1 天
        $redis->setex('ssp:user:'.$user->id.':traffic_lastday', 86400, $total_traffic);
    }
}
```

**关键参数**:
- 流量阈值: **32GB**
- 分组限制: 2-5 组（1 组不限）
- 时间窗口: 过去 24 小时
- Redis 过期: 86400 秒（1 天）

---

#### 2. 节点在线检测 (Line 299-301)

**目标**: 将过去 2 小时无心跳的节点标记为故障

```php
foreach ($nodes as $node) {
    // 心跳超时阈值: 7200 秒 (2 小时)
    if ($node->node_heartbeat < (time() - 7200) && $node->type != 0) {
        $node->type = 0;  // 标记为故障
    }
}
```

**关键参数**:
- 心跳超时: **7200 秒 (2 小时)**

---

#### 3. 节点流量统计 (Line 303-361)

**目标**: 统计节点今日流量，更新节点状态、等级、倍率

```php
// 今日流量 = 当前总流量 - 昨日记录流量
$traffic_today = $node->node_bandwidth - $node->node_bandwidth_lastday;

// 更新 status 字段 (记录每日流量)
$node->status = round($traffic_today/1024/1024/1024) . ',' . $node->status;
$node->status .= '|'.date("Y-m-d");

// 节点降级逻辑
if ($node->node_class > 1 &&
    $node->is_clone == 0 &&
    $node->custom_rss == 1 &&
    $traffic_today * 2 < $node->traffic_left_daily) {
    $node->node_class -= 1;  // 降低等级
}

// 节点升级逻辑
if ($node->custom_rss == 0 &&
    $node->is_clone == 0 &&
    $node->node_group != 1 &&
    $node->node_class < 9) {
    $node->node_class += 1;  // 升高等级
}

// 节点倍率计算
if ($node->traffic_left_daily > 0) {
    $_rate = abs($node->traffic_used_daily / $node->traffic_left_daily);
} else {
    $_rate = 1;
}
$_rate = round($_rate * $node->node_cost / 5);  // 按价格 5 美金基准
$_rate < 1 && $_rate = 1;
$_rate > 3 && $_rate = 3;
$node->traffic_rate = $_rate;

// 重置每日统计
$node->node_bandwidth_lastday = $node->node_bandwidth;
$node->traffic_used_daily = 0;
$node->traffic_left_daily = 0;
```

**关键逻辑**:
- status 格式: `{今日流量GB},{旧status}|{日期}`
- 降级条件: 今日流量 < 剩余流量/2
- 升级条件: custom_rss=0 且等级<9
- 倍率范围: 1-3 倍

---

#### 4. 禁用长期未使用用户 (Line 368-377)

**目标**: 禁用超过 32 天未使用的用户（等级>0）

```php
$nouse_time = time() - 32*86400;  // 32 天前
$users_nouse = User::where('id','>',10)
    ->where('enable','=',1)
    ->where('class','>',0)
    ->where('t','<',$nouse_time)  // 最后使用时间
    ->where("reg_date",'<', date('Y-m-d H:i:s',strtotime('-1 month')))
    ->get();

foreach ($users_nouse as $user) {
    $user->enable = 0;
    $user->warming = date("Ymd H:i:s") . '账号超过1个月未使用，系统启用账号保护';
    $user->save();
}
```

**关键参数**:
- 未使用天数: **32 天**
- 最低等级: class > 0
- 注册时间: > 1 个月

---

#### 5. 禁用余额为负用户 (Line 382-390)

**目标**: 禁用余额 < 0 的用户

```php
$users_nomoney = User::where('money','<',0)->where('enable','=',1)->get();

foreach ($users_nomoney as $user) {
    $user->enable = 0;
    $user->warming = date("Ymd H:i:s").'账号余额异常，系统启用账号保护';
    $user->ban_times += $user->class;
    $user->node_group > 1 && $user->node_group -= 1;  // 降级分组
    $user->score -= 1;  // 扣除积分
    $user->save();
}
```

**惩罚措施**:
- 账户禁用
- ban_times += class
- node_group 降级
- score -= 1

---

#### 6. 用户流量周期重置 (Line 407-416)

**目标**: 流量周期到期时重置流量

```php
$users = User::where('enable','>',0)
    ->where('class','>',0)
    ->where('renew_time','<',time())  // 周期已到
    ->get();

foreach ($users as $user) {
    // 先重置流量数据
    $user->u = $user->u + $user->d;  // u = u + d (累加)
    $user->d = 0;  // d 归零

    // 再重置每日流量数据
    $user->transfer_limit = $user->class * 10 * 1024 * 1024 * 1024;  // class * 10GB

    // 更新下一周期时间
    $user->renew_time = time() + $user->class * 10 * 24 * 3600;  // class * 10 天
    $user->save();
}
```

**关键逻辑**:
- ✅ **u = u + d**: 累加历史流量到 u
- ✅ **d = 0**: 下载流量归零
- ✅ **transfer_limit**: class * 10GB
- ✅ **renew_time**: class * 10 天后

**示例**:
```
假设用户 class=1, 原始流量:
- u = 50GB
- d = 30GB
- transfer_limit = 100GB

重置后:
- u = 80GB (50+30)
- d = 0
- transfer_limit = 10GB (1*10GB)
- renew_time = now + 10 天
```

---

#### 7. 总流量超限处理 (Line 423-432)

**目标**: 总流量超过 transfer_limit 的用户降级分组并增加流量

```php
$users = User::where('node_group','>',1)
    ->where('enable','>',0)
    ->where('class','>',0)
    ->whereColumn('d','>','transfer_limit')  // d > transfer_limit
    ->get();

foreach ($users as $user) {
    $user->score -= 1;
    $user->ban_times += 1;
    $user->warming = '近期下行流量较多，系统已为您分配大带宽节点';
    $user->node_group > 1 && $user->node_group -= 1;  // 降级分组
    $user->transfer_limit += $user->class * 10 * 1024 * 1024 * 1024;  // 增加 class * 10GB
    $user->save();
}
```

**处理措施**:
- score -= 1
- ban_times += 1
- node_group 降级
- transfer_limit += class * 10GB

---

#### 8. 积分奖励 (Line 435-440)

**目标**: 过去 24 小时活跃用户积分+1

```php
$time_last24hours = time() - 24*3600;
$users = User::where('node_group','>',1)
    ->where('enable','>',0)
    ->where('money','>',0)
    ->where('class','>',0)
    ->where('t','>',$time_last24hours)  // 过去 24 小时活跃
    ->get();

foreach ($users as $user) {
    $user->score += 1;
    $user->save();
}
```

**条件**:
- node_group > 1
- money > 0
- class > 0
- 过去 24 小时活跃

---

#### 9. 收回邀请返利 (Line 445-476)

**目标**: 余额 < 0 且积分 < 64 的用户收回邀请返利

```php
$users = User::where('money','<',0)
    ->where('ref_by','!=',0)
    ->where('score','<',64)  // 积分 < 64
    ->get();

foreach ($users as $user) {
    $ref_user = User::find($user->ref_by);
    $ref_payback = Payback::where('total','=',-1)
        ->where('userid','=',$user->id)
        ->where('ref_by','=',$user->ref_by)
        ->first();

    // 检查是否已扣除
    $pays = Payback::where('total','=',-2)
        ->where('userid','=',$user->id)
        ->where('ref_by','=', $user->ref_by)
        ->count();

    if ($ref_user->id != null &&
        $ref_payback->ref_get != null &&
        $pays < 1) {  // 未扣除过

        $ref_user->money -= $ref_payback->ref_get;  // 收回返利
        $ref_user->ban_times += 1;
        $ref_user->save();

        // 记录扣除日志
        $Payback = new Payback();
        $Payback->total = -2;  // -2 代表收回返利
        $Payback->userid = $user->id;
        $Payback->ref_by = $user->ref_by;
        $Payback->ref_get = - $ref_payback->ref_get;
        $Payback->datetime = time();
        $Payback->save();

        $ref_payback->callback = 1;  // 标记为已收回
        $ref_payback->save();
    }

    $user->ref_by = 0;
    $user->enable = 0;
    $user->save();
}
```

**收回条件**:
- money < 0
- score < 64
- ref_by != 0

**Payback 字段**:
- total = -1: 注册返利
- total = -2: 收回返利
- callback = 1: 已收回

---

#### 10. 用户统计重置 (Line 514-549)

**目标**: 重置每日统计数据（按分组处理，减少内存占用）

```php
$check_time = time() - 48 * 3600;  // 过去 48 小时

// 按 node_group 分组处理 (1-8 组)
for ($node_group = 1; $node_group < 9; $node_group++) {
    $users = User::where('enable', '>', 0)
        ->where('class', '>', 0)
        ->where('t', '>', $check_time)
        ->where('node_group', $node_group)
        ->get();

    foreach ($users as $user) {
        $user->last_day_t = $user->d;  // 只记录 d，不记录 u
        $user->rss_count_lastday = $user->rss_count;  // 订阅数统计
        $user->rss_ips_lastday = $user->rss_ips_count;  // IP 来源统计
        $user->save();
    }

    unset($users);  // 释放内存
}
```

**统计字段**:
- `last_day_t`: 昨日下载流量
- `rss_count_lastday`: 昨日订阅数
- `rss_ips_lastday`: 昨日 IP 来源数

---

### DailyJob 总结

**核心参数**:
- 每日流量限制: **32GB** (2-5 组)
- 心跳超时: **7200 秒 (2 小时)**
- 未使用天数: **32 天**
- 流量重置: **u = u + d, d = 0**
- transfer_limit: **class * 10GB**
- renew_time: **class * 10 天**

**执行频率**: 每天 1 次 (建议凌晨 2:00)

---

## HourlyJob 详细分析

**位置**: `Job.php:152-210`
**调用**: `php xcat hourlyjob`

### 核心逻辑

#### 禁用每小时流量超标用户 (Line 157-210)

**目标**: 禁用每小时流量超过 6GB 的用户（2-3 组）

```php
for ($_group = 2; $_group <= 3; $_group++) {  // 仅限制 2-3 组，1 4 组不限
    $users = User::where('enable',1)
        ->where('node_group',$_group)
        ->where('t','>', time() - 3600)  // 过去 1 小时活跃
        ->get();

    foreach ($users as $user) {
        $total_traffic = $user->u + $user->d;
        $total_traffic_lasthour = $redis->get('ssp:user:'.$user->id.':traffic_lasthour');

        if ($total_traffic_lasthour) {
            // 超过 6GB 禁用
            if ($total_traffic - $total_traffic_lasthour > 6*1000*1000*1000) {
                $user->enable = 0;
                $user->warming = '流量峰值异常,可能是下载器在使用您的流量';
                $user->save();
            }
        }

        // 更新 Redis，过期 1.5 小时
        $redis->setex('ssp:user:'.$user->id.':traffic_lasthour', 4600, $total_traffic);
    }
}
```

**关键参数**:
- 流量阈值: **6GB/小时**
- 分组限制: 2-3 组
- Redis 过期: **4600 秒 (1.5 小时)**
- 时间窗口: 过去 1 小时

---

### HourlyJob 总结

**核心参数**:
- 每小时流量限制: **6GB**
- 分组限制: 2-3 组（1、4 组不限）
- Redis 缓存: 4600 秒

**执行频率**: 每小时 1 次 (建议每小时的第 5 分钟执行)

---

## CheckJob 详细分析

**位置**: `Job.php:565-1153`
**调用**: `php xcat checkjob`

### 核心逻辑

#### 1. 清理过期 IP 记录 (Line 734-737)

```php
Ip::where("datetime", "<", time()-300)->delete();  // 5 分钟前
UnblockIp::where("datetime", "<", time()-300)->delete();
BlockIp::where("datetime", "<", time()-86400)->delete();  // 24 小时前
TelegramSession::where("datetime", "<", time()-3600)->delete();  // 1 小时前
```

**清理周期**:
- Ip: **300 秒 (5 分钟)**
- UnblockIp: **300 秒**
- BlockIp: **86400 秒 (1 天)**
- TelegramSession: **3600 秒 (1 小时)**

---

#### 2. 用户等级过期重置 (Line 910-915)

```php
$timeNow = date("Y-m-d H:i:s", time());
$classOverUsers = User::where('class','>',0)
    ->where('class_expire','<', $timeNow)  // 等级过期
    ->get();

foreach ($classOverUsers as $user) {
    $user->class = 0;  // 重置为 0 级
    $user->save();
}
```

**逻辑**: class_expire < 当前时间 → class = 0

---

#### 3. 删除过期用户 (Line 1032-1136)

**目标**: 根据多种条件删除用户

##### 条件 1: 账号过期超过 X 天 (Line 1032-1054)

```php
if (Config::get('account_expire_delete_days')>=0 &&
    strtotime($user->expire_in) + Config::get('account_expire_delete_days')*86400 < time() &&
    (time() - strtotime($user->expire_in)) > ($user->money * 30 * 24 * 3600)
) {
    // 1 元 = 30 天缓冲期
    // 过期 X 天且余额不足缓冲期 → 删除
    $iskilluser = true;
}
```

**公式**:
```
当前时间 - 过期时间 > 余额 * 30 天
→ 删除用户
```

**示例**:
```
用户余额 = 1 元
缓冲期 = 1 * 30 = 30 天
如果过期超过 30 天 → 删除
```

---

##### 条件 2: 0 级用户超过 32 天未签到 (Line 1054-1076)

```php
if (Config::get('auto_clean_uncheck_days')>0 &&
    max($user->last_check_in_time, strtotime($user->reg_date)) +
    Config::get('auto_clean_uncheck_days')*86400 < time() &&
    $user->class == 0 &&
    $user->money <= Config::get('auto_clean_min_money')
) {
    $iskilluser = true;
}
```

**条件**:
- class = 0
- 未签到天数 > 配置值 (默认 32 天)
- money <= 最低金额 (默认 0)

---

##### 条件 3: 0 级用户超过 7 天未使用 (Line 1076-1098)

```php
if (Config::get('auto_clean_unused_days')>0 &&
    max($user->t, strtotime($user->reg_date)) +
    Config::get('auto_clean_unused_days')*86400 < time() &&
    $user->class == 0 &&
    $user->money <= Config::get('auto_clean_min_money')
) {
    $iskilluser = true;
}
```

**条件**:
- class = 0
- 未使用天数 > 配置值 (默认 7 天)
- money <= 最低金额

---

##### 条件 4: 从未使用的 0 级用户 (Line 1098-1102)

```php
if ($user->t == 0 &&
    $user->u == 0 &&
    $user->d == 0 &&
    (strtotime($user->reg_date) + 86400 * 14) < time() &&
    $user->class == 0 &&
    $user->money <= 1
) {
    $iskilluser = true;
}
```

**条件**:
- t=0, u=0, d=0 (从未使用)
- 注册 > 14 天
- class = 0
- money <= 1

---

##### 删除用户逻辑 (Line 1104-1136)

```php
if ($iskilluser) {
    if ($user->ref_by != 0 && $user->ref_by != '') {
        $ref_user = User::find($user->ref_by);

        if ($ref_user->score < 32) {  // 邀请人积分 < 32
            $ref_payback = Payback::where('total','=',-1)
                ->where('userid','=',$user->id)
                ->where('ref_by','=',$user->ref_by)
                ->first();

            $pays = Payback::where('total','=',-2)
                ->where('userid','=',$user->id)
                ->where('ref_by','=', $user->ref_by)
                ->count();

            if ($ref_user->id != null &&
                $ref_payback->ref_get != null &&
                $pays < 1) {

                // 收回返利
                $ref_user->money -= $ref_payback->ref_get;
                $ref_user->ban_times += 1;
                $ref_user->save();

                // 记录扣除日志
                $Payback = new Payback();
                $Payback->total = -2;
                $Payback->userid = $user->id;
                $Payback->ref_by = $user->ref_by;
                $Payback->ref_get = - $ref_payback->ref_get;
                $Payback->datetime = time();
                $Payback->save();

                $ref_payback->callback = 1;
                $ref_payback->save();
            }
        }
    }

    // 删除用户
    $user->kill_user();
}
```

**删除流程**:
1. 检查是否有邀请人
2. 邀请人积分 < 32
3. 收回注册返利
4. 删除用户

---

### CheckJob 总结

**核心功能**:
1. 清理过期 IP 记录 (5 分钟/1 天)
2. 重置过期用户等级 (class_expire < now)
3. 删除过期用户 (多种条件)

**执行频率**: 每 10 分钟 1 次

**时间阈值**:
- IP 清理: **300 秒 (5 分钟)**
- BlockIp: **86400 秒 (1 天)**
- 等级过期: **实时检测**

---

## 其他关键任务

### DbClean (Line 137-149)

**目标**: 清理 3 天前的日志

```php
NodeInfoLog::where("log_time", "<", time()-86400*3)->delete();
NodeOnlineLog::where("log_time", "<", time()-86400*3)->delete();
TrafficLog::where("log_time", "<", time()-86400*3)->delete();
DetectLog::where("datetime", "<", time()-86400*3)->delete();
Speedtest::where("datetime", "<", time()-86400*3)->delete();
EmailVerify::where("expire_in", "<", time()-86400*3)->delete();
```

**清理周期**: **3 天**

**执行频率**: 每周 1 次

---

### Backup (Line 67-106)

**目标**: 数据库自动备份

```php
// 完整备份
mysqldump --user=xxx --password=xxx --host=xxx db_name > /tmp/mod.sql

// 增量备份 (排除大表)
mysqldump ... announcement auto blockip ... > /tmp/mod.sql
mysqldump --opt -d ... alive_ip ss_node_info ... >> /tmp/mod.sql

// 压缩并发送邮件
zip -r /tmp/ssmodbackup.zip /tmp/ssmodbackup/* -P password
Mail::send($to, $subject, 'news/backup.tpl', [], ['/tmp/ssmodbackup.zip']);
```

**备份内容**:
- 核心业务表: user, paylist, bought, shop, 等
- 不包含大表: ss_node_info, ss_node_online_log, user_traffic_log

**执行频率**: 每天 1 次 (建议凌晨 3:00)

---

### FinanceMail (Line 20-223)

**目标**: 财务统计报表

#### 日报 (Line 20-95)

```php
// 统计昨日充值
SELECT code.number, code.userid, code.usedatetime
FROM code
WHERE TO_DAYS(NOW()) - TO_DAYS(code.usedatetime) = 1
AND code.type = -1  // -1 = 充值码
AND code.isused = 1;

// 易付通统计
SELECT yft_order_info.price, yft_order_info.user_id, yft_order_info.create_time
FROM yft_order_info
WHERE TO_DAYS(NOW()) - TO_DAYS(yft_order_info.create_time) = 1
AND yft_order_info.state = 1;

// 发送邮件给管理员
Telegram::Send("昨日总收入笔数: {$income_count}, 昨日总收入金额: {$income_total}");
```

**统计范围**:
- Code 表: type=-1 (充值码)
- Yft 表: state=1 (成功)
- 时间窗口: 昨天

---

### DailyMail (Line 14-72)

**目标**: 每日流量报告

```php
// 更新昨日流量
foreach ($users as $user) {
    $user->last_day_t = ($user->u + $user->d);
    $user->save();
}

// 发送邮件
foreach ($users as $user) {
    if ($user->sendDailyMail == 1) {
        $lastday = (($user->d) - $user->last_day_t) / 1024 / 1024;
        Mail::send($to, $subject, 'news/daily-traffic-report.tpl', [
            "user" => $user,
            "lastday" => $lastday
        ]);
    }
}
```

**功能**:
1. 更新 last_day_t = u + d
2. 发送流量报告邮件 (sendDailyMail=1)

---

## Cron 表达式建议

基于原 PHP 项目的业务逻辑，以下是推荐的 Cron 配置：

```bash
# 每 5 分钟执行一次
*/5 * * * * cd /www/wwwroot/test-spanel.freessr.bid && php xcat checkjob >> /tmp/cron.log 2>&1

# 每小时执行一次 (建议每小时的第 5 分钟)
5 * * * * cd /www/wwwroot/test-spanel.freessr.bid && php xcat hourlyjob >> /tmp/cron.log 2>&1

# 每天凌晨 2:00 执行
0 2 * * * cd /www/wwwroot/test-spanel.freessr.bid && php xcat dailyjob >> /tmp/cron.log 2>&1

# 每天凌晨 3:00 执行
0 3 * * * cd /www/wwwroot/test-spanel.freessr.bid && php xcat backup >> /tmp/cron.log 2>&1

# 每天凌晨 1:00 执行
0 1 * * * cd /www/wwwroot/test-spanel.freessr.bid && php xcat sendDiaryMail >> /tmp/cron.log 2>&1

# 每天早上 8:00 执行
0 8 * * * cd /www/wwwroot/test-spanel.freessr.bid && php xcat sendFinanceMail_day >> /tmp/cron.log 2>&1

# 每周日凌晨 4:00 执行
0 4 * * 0 cd /www/wwwroot/test-spanel.freessr.bid && php xcat dbclean >> /tmp/cron.log 2>&1
```

---

## FastAPI 实现对比

### 1. DailyJob 实现

#### PHP 版本关键逻辑

```php
// 流量重置
$user->u = $user->u + $user->d;
$user->d = 0;
$user->transfer_limit = $user->class * 10 * 1024 * 1024 * 1024;
$user->renew_time = time() + $user->class * 10 * 24 * 3600;
```

#### FastAPI 版本实现 (建议)

```python
# backend/app/jobs/daily_job.py

async def daily_traffic_reset(db: AsyncSession):
    """每日流量重置"""
    users = await db.execute(
        select(User)
        .where(User.enable > 0)
        .where(User.class_level > 0)
        .where(User.renew_time < int(time.time()))
    )
    users = users.scalars().all()

    for user in users:
        # 原子更新
        await db.execute(
            update(User)
            .where(User.id == user.id)
            .values(
                u=User.u + User.d,  # u = u + d
                d=0,  # d 归零
                transfer_limit=User.class_level * 10 * 1024**3,  # class * 10GB
                renew_time=int(time.time()) + User.class_level * 10 * 86400  # class * 10 天
            )
        )

    await db.commit()
```

---

### 2. 节点心跳检测

#### PHP 版本

```php
if ($node->node_heartbeat < (time() - 7200) && $node->type != 0) {
    $node->type = 0;
}
```

#### FastAPI 版本

```python
# backend/app/jobs/check_job.py

async def check_node_heartbeat(db: AsyncSession):
    """检查节点心跳"""
    timeout = int(time.time()) - 7200  # 2 小时前

    await db.execute(
        update(Node)
        .where(Node.node_heartbeat < timeout)
        .where(Node.type != 0)
        .values(type=0)  # 标记为故障
    )

    await db.commit()
```

---

### 3. 用户过期处理

#### PHP 版本

```php
$classOverUsers = User::where('class','>',0)
    ->where('class_expire','<', $timeNow)
    ->get();

foreach ($classOverUsers as $user) {
    $user->class = 0;
    $user->save();
}
```

#### FastAPI 版本

```python
async def reset_expired_user_class(db: AsyncSession):
    """重置过期用户等级"""
    now = datetime.now()

    await db.execute(
        update(User)
        .where(User.class_level > 0)
        .where(User.class_expire < now)
        .values(class_level=0)
    )

    await db.commit()
```

---

### 4. 每小时流量限制

#### PHP 版本 (Redis)

```php
$total_traffic = $user->u + $user->d;
$total_traffic_lasthour = $redis->get('ssp:user:'.$user->id.':traffic_lasthour');

if ($total_traffic - $total_traffic_lasthour > 6*1000*1000*1000) {
    $user->enable = 0;
}

$redis->setex('ssp:user:'.$user->id.':traffic_lasthour', 4600, $total_traffic);
```

#### FastAPI 版本 (Redis + DB)

```python
# backend/app/jobs/hourly_job.py

async def check_hourly_traffic_limit(db: AsyncSession, redis: RedisClient):
    """检查每小时流量限制"""
    limit = 6 * 1024**3  # 6GB

    for group in [2, 3]:  # 仅限制 2-3 组
        users = await db.execute(
            select(User)
            .where(User.enable == 1)
            .where(User.node_group == group)
            .where(User.t > int(time.time()) - 3600)
        )
        users = users.scalars().all()

        for user in users:
            total_traffic = user.u + user.d
            last_traffic = await redis.get(f'user:{user.id}:traffic_lasthour')

            if last_traffic:
                if total_traffic - int(last_traffic) > limit:
                    await db.execute(
                        update(User)
                        .where(User.id == user.id)
                        .values(enable=0)
                    )

            # 更新 Redis，过期 4600 秒
            await redis.setex(
                f'user:{user.id}:traffic_lasthour',
                4600,
                str(total_traffic)
            )

    await db.commit()
```

---

## 关键业务逻辑对比表

| 功能 | PHP 实现 | FastAPI 建议 | 差异说明 |
|------|---------|-------------|---------|
| **流量重置** | `u = u + d; d = 0` | 同左 | ✅ 完全一致 |
| **transfer_limit** | `class * 10GB` | 同左 | ✅ 完全一致 |
| **renew_time** | `now + class * 10 天` | 同左 | ✅ 完全一致 |
| **每小时限制** | 6GB (2-3 组) | 同左 | ✅ 完全一致 |
| **每日限制** | 32GB (2-5 组) | 同左 | ✅ 完全一致 |
| **心跳超时** | 7200 秒 | 同左 | ✅ 完全一致 |
| **未使用天数** | 32 天 | 同左 | ✅ 完全一致 |
| **IP 清理** | 300 秒 | 同左 | ✅ 完全一致 |
| **日志清理** | 3 天 | 同左 | ✅ 完全一致 |

---

## 核心发现

### 1. 流量重置逻辑 (Critical!)

**PHP 版本**:
```php
$user->u = $user->u + $user->d;  // 累加
$user->d = 0;  // d 归零
```

**关键点**:
- ✅ 不是归零！是 **u = u + d**
- ✅ d 才是归零
- ✅ 这样可以保留历史流量记录

**FastAPI 实现**:
```python
# 正确 ✅
await db.execute(
    update(User)
    .values(
        u=User.u + User.d,  # 累加
        d=0  # d 归零
    )
)

# 错误 ❌
await db.execute(
    update(User)
    .values(u=0, d=0)  # 全部归零，会丢失历史数据！
)
```

---

### 2. Redis 缓存策略

**PHP 版本**:
```php
// 每小时流量
$redis->setex('ssp:user:'.$user->id.':traffic_lasthour', 4600, $total_traffic);

// 每日流量
$redis->setex('ssp:user:'.$user->id.':traffic_lastday', 86400, $total_traffic);
```

**FastAPI 实现**:
```python
# 每小时流量 - 过期 4600 秒
await redis.setex(f'user:{user_id}:traffic_lasthour', 4600, str(total_traffic))

# 每日流量 - 过期 86400 秒
await redis.setex(f'user:{user_id}:traffic_lastday', 86400, str(total_traffic))
```

---

### 3. 分组处理策略

**PHP 版本**:
```php
// 按分组循环，减少内存占用
for ($node_group = 1; $node_group < 9; $node_group++) {
    $users = User::where('node_group', $node_group)->get();
    // 处理...
    unset($users);  // 释放内存
}
```

**FastAPI 实现**:
```python
# 按分组处理，避免一次性加载所有用户
for group in range(1, 9):
    users = await db.execute(
        select(User)
        .where(User.node_group == group)
        .limit(1000)  # 分批处理
    )
    # 处理...
```

---

## 推荐的 Cron 配置

### 生产环境

```bash
# crontab -e

# CheckJob - 每 5 分钟
*/5 * * * * cd /path/to/fastapi && source venv/bin/activate && python -m app.jobs.check_job

# HourlyJob - 每小时
5 * * * * cd /path/to/fastapi && source venv/bin/activate && python -m app.jobs.hourly_job

# DailyJob - 每天凌晨 2:00
0 2 * * * cd /path/to/fastapi && source venv/bin/activate && python -m app.jobs.daily_job

# Backup - 每天凌晨 3:00
0 3 * * * cd /path/to/fastapi && source venv/bin/activate && python -m app.jobs.backup

# DbClean - 每周日凌晨 4:00
0 4 * * 0 cd /path/to/fastapi && source venv/bin/activate && python -m app.jobs.dbclean
```

### 测试环境

```bash
# 每 10 分钟 (方便测试)
*/10 * * * * cd /path/to/fastapi && source venv/bin/activate && python -m app.jobs.check_job

# 每小时
0 * * * * cd /path/to/fastapi && source venv/bin/activate && python -m app.jobs.hourly_job

# 每天凌晨 2:00
0 2 * * * cd /path/to/fastapi && source venv/bin/activate && python -m app.jobs.daily_job
```

---

## FastAPI 实现架构建议

### 目录结构

```
backend/
├── app/
│   ├── jobs/
│   │   ├── __init__.py
│   │   ├── daily_job.py      # 每日任务
│   │   ├── hourly_job.py     # 每小时任务
│   │   ├── check_job.py      # 检查任务 (10分钟)
│   │   ├── backup_job.py     # 备份任务
│   │   └── dbclean_job.py    # 清理任务
│   ├── services/
│   │   └── job_service.py    # 业务逻辑服务
│   └── utils/
│       └── scheduler.py      # 任务调度器
```

### 核心服务类

```python
# backend/app/services/job_service.py

class JobService:
    """定时任务业务逻辑"""

    @staticmethod
    async def daily_traffic_reset(db: AsyncSession):
        """每日流量重置"""
        # u = u + d, d = 0
        pass

    @staticmethod
    async def check_node_heartbeat(db: AsyncSession):
        """检查节点心跳"""
        # 7200 秒超时
        pass

    @staticmethod
    async def disable_overused_users(db: AsyncSession, redis: RedisClient):
        """禁用流量超标用户"""
        # 每小时 6GB，每日 32GB
        pass

    @staticmethod
    async def reset_expired_users(db: AsyncSession):
        """重置过期用户"""
        # class_expire < now → class = 0
        pass

    @staticmethod
    async def delete_expired_users(db: AsyncSession):
        """删除过期用户"""
        # 多种条件判断
        pass
```

### 任务调度器

```python
# backend/app/utils/scheduler.py

import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()

# 每天凌晨 2:00 执行
@scheduler.scheduled_job('cron', hour=2, minute=0)
async def daily_job():
    async with get_db() as db:
        await JobService.daily_traffic_reset(db)
        await JobService.check_node_heartbeat(db)
        # ... 其他每日任务

# 每小时执行
@scheduler.scheduled_job('cron', minute=5)
async def hourly_job():
    async with get_db() as db:
        await JobService.disable_overused_users_hourly(db, redis_client)

# 每 10 分钟执行
@scheduler.scheduled_job('cron', minute='*/10')
async def check_job():
    async with get_db() as db:
        await JobService.reset_expired_users(db)
        await JobService.clean_expired_ips(db)
```

---

## 总结

### 核心业务逻辑

1. **流量重置**: `u = u + d`, `d = 0` (不是全部归零)
2. **每小时限制**: 6GB (2-3 组)
3. **每日限制**: 32GB (2-5 组)
4. **心跳超时**: 7200 秒 (2 小时)
5. **未使用天数**: 32 天
6. **IP 清理**: 300 秒 (5 分钟)
7. **日志清理**: 3 天

### 推荐执行频率

- **CheckJob**: 每 5-10 分钟
- **HourlyJob**: 每小时
- **DailyJob**: 每天凌晨 2:00
- **Backup**: 每天凌晨 3:00
- **DbClean**: 每周日凌晨 4:00

### FastAPI 实现要点

1. ✅ 流量重置必须是 `u = u + d`, `d = 0`
2. ✅ 使用原子更新，避免并发问题
3. ✅ 按分组处理用户，减少内存占用
4. ✅ Redis 缓存流量数据，加速查询
5. ✅ 使用 APScheduler 调度任务

---

**审计完成！** 🎉

本文档提供了原 PHP 项目的完整业务逻辑，可直接用于 FastAPI 重构参考。
