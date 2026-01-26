# SS-Panel Mod Uim 原始项目 API 规范文档

> 本文档通过逆向工程分析 `/var/www/test-spanel.freessr.bid` 的 LNMP 项目生成
>
> 项目基于: Slim PHP 3.x Framework
> 数据库: MySQL
> 前端: Vue.js + Smarty 模板

---

## 目录

1. [项目架构概述](#项目架构概述)
2. [认证机制](#认证机制)
3. [API 接口清单](#api-接口清单)
4. [数据库字典](#数据库字典)
5. [核心业务逻辑](#核心业务逻辑)
6. [安全机制](#安全机制)

---

## 项目架构概述

### 技术栈

- **后端框架**: Slim PHP 3.x
- **数据库**: MySQL (使用 Illuminate/Database ORM)
- **前端**: Vue.js + Smarty 模板引擎
- **认证方式**: Session + Token + OAuth (Telegram)
- **支付集成**: 支付宝、易付通、ClonePay 等多种支付网关

### 目录结构

```
/var/www/test-spanel.freessr.bid/
├── app/
│   ├── Controllers/          # 控制器
│   │   ├── Admin/           # 管理员控制器
│   │   ├── Mu/              # 原生 Mu 协议控制器
│   │   ├── Mod_Mu/          # Mod_Uim 协议控制器
│   │   └── Client/          # 客户端 API 控制器
│   ├── Middleware/          # 中间件（认证、权限）
│   ├── Models/              # 数据模型
│   ├── Services/            # 业务服务层
│   └── Utils/               # 工具类
├── config/
│   └── routes.php           # 路由配置文件
├── public/
│   └── index.php            # 入口文件
└── sql/
    └── all.sql              # 数据库结构文件
```

### 支持的协议

- **Shadowsocks (SS)**: sort = 0
- **ShadowsocksR (SSR)**: sort = 1-9
- **VMess**: sort = 11
- **VLess**: sort = 13
- **Trojan**: sort = 14
- **单端口多用户**: sort = 9

---

## 认证机制

### 中间件认证系统

项目使用 6 种中间件实现不同级别的权限控制：

#### 1. Auth 中间件 (用户认证)

**文件**: `app/Middleware/Auth.php`

**认证流程**:
```php
1. 从 Session 中获取用户信息
2. 检查用户是否登录 (isLogin)
3. 检查账户是否启用 (enable == 1)
4. 特殊页面白名单: /user/disable, /user/backtoadmin, /user/logout
```

**应用范围**: 所有 `/user/*` 路由（用户中心）

#### 2. Admin 中间件 (管理员认证)

**文件**: `app/Middleware/Admin.php`

**认证流程**:
```php
1. 验证用户是否登录
2. 验证用户是否为管理员 (is_admin == 1)
3. 未授权用户重定向到 /user
```

**应用范围**: 所有 `/admin/*` 路由（管理后台）

#### 3. Guest 中间件 (访客访问)

**认证流程**:
```php
1. 允许未登录用户访问
2. 登录用户自动跳转到用户中心
```

**应用范围**: `/auth/login`, `/auth/register`, `/password/reset`

#### 4. Api 中间件 (API Token 认证)

**文件**: `app/Middleware/Api.php`

**认证流程**:
```php
1. 从请求头或参数获取 Token
   - Authorization: Bearer {token}
   - URL 参数: ?token={token}
2. 验证 Token 是否存在
3. 检查 Token 是否过期 (expireTime > time())
```

**应用范围**: `/api/token/{token}`, `/api/user/{id}`

#### 5. Mu 中间件 (节点通信认证)

**文件**: `app/Middleware/Mu.php`

**认证流程**:
```php
1. 从请求获取 muKey (Bearer Token 或参数)
2. 验证 muKey 是否匹配配置 (支持逗号分隔多个 key)
3. 验证请求 IP 是否在节点白名单中
   - 检查 node_ip 字段是否包含 REMOTE_ADDR
   - 本地回环 127.0.0.1 豁免
```

**应用范围**: `/mu/*`, `/api/ssn_sub`, `/api/ssn_v2`

#### 6. Mod_Mu 中间件 (扩展节点认证)

**文件**: `app/Middleware/Mod_Mu.php`

**认证流程**: 与 Mu 中间件相同，但返回格式不同

**应用范围**: `/mod_mu/*`

### Token 生成与验证

#### 用户订阅 Token

```php
// 生成订阅链接
$token = LinkController::GenerateSSRSubCode($user_id, $prefix);

// 订问格式: /link/{token}
// 返回: Shadowsocks/VMess/VLess/Trojan 配置
```

#### API Token

```php
// Token 存储
$table = 'user_token';
$fields = [
    'id'         => int,
    'token'      => varchar(255),
    'user_id'    => int,
    'create_time'=> int,
    'expire_time'=> int
];

// 过期时间: 默认 7 天 (time() + 3600*24*7)
```

#### Mu Key (节点通信密钥)

```php
// 配置位置: config.php
// 格式: 逗号分隔的多个密钥
Config::get('muKey'); // 例如: "key1,key2,key3"

// 验证方式
$keyset = explode(",", Config::get('muKey'));
if (in_array($request_key, $keyset)) {
    // 认证成功
}
```

### Session 管理

```php
// Session 配置
- 存储方式: Cookie (默认)
- 过期时间: 浏览器关闭
- 安全设置: HttpOnly, Secure (HTTPS)

// Session 数据结构
$_SESSION['user_id']  = $user->id;
$_SESSION['email']    = $user->email;
$_SESSION['is_admin'] = $user->is_admin;
```

### OAuth 第三方登录

#### Telegram OAuth

**路由**: `/auth/telegram_oauth`

**流程**:
```php
1. 用户点击 Telegram 登录
2. 跳转到 Telegram OAuth 授权页
3. 授权成功回调 /telegram_callback
4. 验证 Telegram 返回的数据
5. 绑定或创建用户账户
6. 存储 telegram_id 和 session_content
```

**数据库**:
```sql
ALTER TABLE `user` ADD `telegram_id` BIGINT NULL;
CREATE TABLE `telegram_session` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `type` INT NOT NULL,
    `session_content` TEXT NOT NULL,
    `datetime` BIGINT NOT NULL,
    PRIMARY KEY (`id`)
);
```

---

## API 接口清单

### 1. 认证授权模块 (`/auth`)

#### 1.1 用户登录

| 属性 | 值 |
|------|------|
| **路径** | `POST /auth/login` |
| **中间件** | `Guest` |
| **描述** | 用户邮箱密码登录 |

**请求参数**:
```json
{
    "email": "user@example.com",
    "passwd": "password123"
}
```

**响应示例**:
```json
{
    "ret": 1,
    "msg": "ok",
    "data": {
        "user_id": 123,
        "email": "user@example.com"
    }
}
```

**业务逻辑**:
```php
// 文件: app/Controllers/AuthController.php:loginHandle()

1. 验证验证码 (如果启用)
2. 查询用户: User::where('email', $email)->first()
3. 验证密码: Hash::checkPassword($user->pass, $passwd)
4. 检查账户状态: $user->enable == 1
5. 记录登录 IP: LoginIp::create([...])
6. 设置 Session: $_SESSION['user_id'] = $user->id
7. 返利处理: 如果是新用户且有邀请人
```

#### 1.2 二维码登录

| 属性 | 值 |
|------|------|
| **路径** | `POST /auth/qrcode_login` |
| **中间件** | `Guest` |

**请求参数**:
```json
{
    "session_id": "unique_session_id"
}
```

**业务逻辑**:
```php
1. 生成唯一 session_id
2. 客户端轮询 /auth/qrcode_check
3. 手机扫码确认后，session_id 绑定用户
4. 前端自动登录
```

#### 1.3 用户注册

| 属性 | 值 |
|------|------|
| **路径** | `POST /auth/register` |
| **中间件** | `Guest` |

**请求参数**:
```json
{
    "email": "user@example.com",
    "passwd": "password123",
    "repasswd": "password123",
    "im_type": 4,          // 1=微信, 2=QQ, 3=Google+, 4=Telegram
    "im_value": "telegram_id",
    "code": "invite_code"  // 可选，邀请码
}
```

**业务逻辑**:
```php
// 文件: app/Controllers/AuthController.php:registerHandle()

1. 验证邮箱格式
2. 验证密码强度
3. 检查邮箱是否已存在
4. 验证邀请码 (如果需要)
5. 创建用户:
   - 生成端口: 建议范围 10000-65535
   - 生成密码: 随机 16 位
   - 生成 UUID: Uuid::uuid3(NAMESPACE_DNS, "{$id}|{$passwd}")
   - 计算邀请人返利
6. 发送验证邮件 (如果启用)
7. 自动登录
```

**默认用户配置**:
```php
$User = [
    'email'           => $email,
    'pass'            => Hash::passwordHash($passwd),
    'passwd'          => Tools::genRandomChar(16),
    'port'            => Tools::getAvailablePort(),
    'method'          => Config::get('register_method'),
    'protocol'        => 'origin',
    'obfs'            => 'plain',
    'transfer_enable' => Tools::toGB(Config::get('defaultTraffic')),
    'node_group'      => 0,
    'class'           => 0,
    'expire_in'       => date('Y-m-d H:i:s', time()+Config::get('user_expire_in_default')*86400),
    'reg_date'        => date('Y-m-d H:i:s'),
    'reg_ip'          => $_SERVER['REMOTE_ADDR'],
    'ref_by'          => $ref_user_id,
    'enable'          => 1,
    'is_admin'        => 0,
    'money'           => 0,
    'v2ray_uuid'      => Uuid::uuid3(Uuid::NAMESPACE_DNS, "{$id}|{$passwd}")->toString()
];
```

#### 1.4 发送验证码

| 属性 | 值 |
|------|------|
| **路径** | `POST /auth/send` |
| **中间件** | `Guest` |

**请求参数**:
```json
{
    "email": "user@example.com"
}
```

**业务逻辑**:
```php
1. 生成 6 位随机验证码
2. 存储到 email_verify 表
3. 发送验证邮件
4. 有效期: 10 分钟
```

#### 1.5 密码重置

| 属性 | 值 |
|------|------|
| **路径** | `GET /password/reset` |
| **中间件** | `Guest` |

**请求参数**:
```json
{
    "email": "user@example.com"
}
```

**业务逻辑**:
```php
1. 生成重置 Token
2. 存储到 ss_password_reset 表
3. 发送重置邮件
4. 用户访问 /password/token/{token}
5. 设置新密码
```

#### 1.6 用户登出

| 属性 | 值 |
|------|------|
| **路径** | `GET /auth/logout` |
| **中间件** | 无 |

**业务逻辑**:
```php
1. 销毁 Session
2. 清除 Cookie
3. 重定向到首页
```

---

### 2. 用户中心模块 (`/user`)

#### 2.1 用户首页

| 属性 | 值 |
|------|------|
| **路径** | `GET /user` |
| **中间件** | `Auth` |
| **视图** | `user/index.tpl` |

**返回数据**:
```php
$user = [
    'id'                    => int,           // 用户 ID
    'user_name'             => string,        // 用户名
    'email'                 => string,        // 邮箱
    'port'                  => int,           // 端口
    'passwd'                => string,        // SS 密码
    'method'                => string,        // 加密方式
    'protocol'              => string,        // 协议
    'obfs'                  => string,        // 混淆
    'transfer_enable'       => bigint,        // 总流量 (字节)
    'u'                     => bigint,        // 上传流量 (字节)
    'd'                     => bigint,        // 下载流量 (字节)
    'last_check_in_time'    => int,           // 上次签到时间
    'money'                 => decimal(12,2), // 余额
    'class'                 => int,           // 用户等级
    'class_expire'          => datetime,      // 等级过期时间
    'expire_in'             => datetime,      // 账户过期时间
    'node_group'            => int,           // 节点分组
    'node_speedlimit'       => float,         // 限速 (MB/s)
    'enable'                => int,           // 是否启用
    'v2ray_uuid'            => string,        // V2Ray UUID
    'telegram_id'           => bigint,        // Telegram ID
];
```

#### 2.2 每日签到

| 属性 | 值 |
|------|------|
| **路径** | `POST /user/checkin` |
| **中间件** | `Auth` |

**请求参数**:
```json
{
    "captcha": "验证码"  // 如果启用验证码
}
```

**业务逻辑**:
```php
// 文件: app/Controllers/UserController.php:doCheckin()

1. 检查是否已签到 (检查日期是否相同)
2. 验证验证码 (如果启用)
3. 计算奖励流量:
   - 基础流量: 随机 50-100 MB
   - 等级加成: 每级 +10 MB
4. 更新用户流量:
   $user->transfer_enable += $traffic;
   $user->last_check_in_time = time();
5. 记录签到日志
6. 返回奖励流量
```

**响应示例**:
```json
{
    "ret": 1,
    "msg": "签到成功！获得了 100 MB 流量",
    "traffic": "100 MB"
}
```

#### 2.3 节点列表

| 属性 | 值 |
|------|------|
| **路径** | `GET /user/node` |
| **中间件** | `Auth` |
| **视图** | `user/node.tpl` |

**返回数据**:
```php
$nodes = Node::where('type', 1)              // 显示节点
    ->where('node_class', '<=', $user->class) // 等级要求
    ->where(function($query) use ($user) {
        $query->where('node_group', '=', $user->node_group)
              ->orWhere('node_group', '=', 0);  // 全局节点
    })
    ->orderBy('sort', 'asc')
    ->get();

// 节点字段
$node = [
    'id'                  => int,
    'name'                => string,        // 节点名称
    'type'                => int,           // 类型 0=SS, 11=VMess, 13=VLess, 14=Trojan
    'server'              => string,        // 服务器地址
    'method'              => string,        // 加密方式
    'info'                => string,        // 节点描述
    'status'              => string,        // 状态
    'sort'                => int,           // 协议类型
    'traffic_rate'        => float,         // 流量倍率
    'node_class'          => int,           // 等级要求
    'node_speedlimit'     => float,         // 限速
    'node_group'          => int,           // 节点分组
    'node_bandwidth'      => bigint,        // 已用流量
    'node_bandwidth_limit'=> bigint,        // 流量限制
    'online_user'         => int,           // 在线人数 (1小时内)
    'is_clone'            => int,           // 克隆节点 ID (0=非克隆)
    'country_code'        => string,        // 国家代码
];
```

#### 2.4 节点详情

| 属性 | 值 |
|------|------|
| **路径** | `GET /user/node/{id}` |
| **中间件** | `Auth` |

**业务逻辑**:
```php
1. 获取节点信息
2. 检查用户是否有权限访问
3. 显示节点配置:
   - 服务器地址
   - 端口
   - 加密方式
   - 协议参数
   - 混淆参数
4. 显示节点实时状态:
   - 在线人数
   - 负载
   - 运行时间
5. 显示订阅链接
6. 显示二维码
```

#### 2.5 节点信息 (AJAX)

| 属性 | 值 |
|------|------|
| **路径** | `GET /user/node/{id}/ajax` |
| **中间件** | `Auth` |

**响应示例**:
```json
{
    "ret": 1,
    "msg": "ok",
    "data": {
        "online_user": 123,
        "uptime": 86400,
        "load": "0.5,0.3,0.2",
        "traffic_used": "10 GB",
        "traffic_left": "90 GB"
    }
}
```

#### 2.6 购买套餐

| 属性 | 值 |
|------|------|
| **路径** | `POST /user/buy` |
| **中间件** | `Auth` |

**请求参数**:
```json
{
    "shop": 1,           // 商品 ID
    "coupon": "CODE123"  // 可选，优惠券
}
```

**业务逻辑**:
```php
// 文件: app/Controllers/UserController.php:buy()

1. 验证优惠券:
   $coupon = Coupon::where('code', $coupon_code)->first();
   检查是否过期、是否可用

2. 查询商品:
   $shop = Shop::find($shop_id);
   $content = json_decode($shop->content);

3. 计算价格:
   $price = $shop->price - $coupon->credit;

4. 检查余额:
   if ($user->money < $price) {
       return "余额不足";
   }

5. 扣除余额:
   $user->money -= $price;

6. 应用商品效果:
   // 时间套餐
   if (isset($content->time)) {
       $user->expire_in = date('Y-m-d H:i:s', time() + $content->time * 86400);
   }
   // 流量套餐
   if (isset($content->bandwidth)) {
       $user->transfer_enable += Tools::toMB($content->bandwidth);
   }
   // 等级套餐
   if (isset($content->class)) {
       $user->class = $content->class;
       $user->class_expire = date('Y-m-d H:i:s', time() + $content->class_time * 86400);
   }
   // 重置流量
   if (isset($content->reset)) {
       $user->u = 0;
       $user->d = 0;
   }

7. 记录购买:
   Bought::create([
       'userid' => $user->id,
       'shopid' => $shop_id,
       'datetime' => time(),
       'renew' => 0,
       'coupon' => $coupon_code,
       'price' => $price
   ]);

8. 处理返利:
   if ($user->ref_by != 0) {
       Payback::calculate($user->id, $price);
   }
```

**商品内容示例**:
```json
{
    "time": 30,              // 延长 30 天
    "bandwidth": 100,        // 增加 100 GB 流量
    "class": 1,              // 升级到等级 1
    "class_time": 30,        // 等级有效期 30 天
    "reset": 1,              // 重置流量
    "speedlimit": 50         // 限速 50 MB/s
}
```

#### 2.7 更新密码

| 属性 | 值 |
|------|------|
| **路径** | `POST /user/password` |
| **中间件** | `Auth` |

**请求参数**:
```json
{
    "oldpwd": "old_password",
    "newpwd": "new_password",
    "renewpwd": "new_password"
}
```

**业务逻辑**:
```php
1. 验证旧密码: Hash::checkPassword($user->pass, $oldpwd)
2. 验证新密码强度
3. 更新密码: $user->pass = Hash::passwordHash($newpwd)
4. 重新生成 UUID: $user->v2ray_uuid = Uuid::uuid3(...)
5. 保存
```

#### 2.8 更新加密方式

| 属性 | 值 |
|------|------|
| **路径** | `POST /user/method` |
| **中间件** | `Auth` |

**请求参数**:
```json
{
    "method": "aes-256-gcm"
}
```

**支持的加密方式**:
```
rc4-md5, aes-128-cfb, aes-192-cfb, aes-256-cfb,
aes-128-ctr, aes-192-ctr, aes-256-ctr,
camellia-128-cfb, camellia-192-cfb, camellia-256-cfb,
chacha20-ietf, aes-256-gcm
```

#### 2.9 重置端口

| 属性 | 值 |
|------|------|
| **路径** | `POST /user/resetport` |
| **中间件** | `Auth` |

**请求参数**:
```json
{
    "port": 0
}
```

**业务逻辑**:
```php
// port = 0: 自动分配
// port > 0: 指定端口

if ($port == 0) {
    $port = Tools::getAvailablePort();
} else {
    // 检查端口是否已被占用
    $exists = User::where('port', $port)->first();
    if ($exists) {
        return "端口已被占用";
    }
}

$user->port = $port;
$user->save();
```

#### 2.10 工单系统

##### 创建工单

| 属性 | 值 |
|------|------|
| **路径** | `POST /user/ticket` |
| **中间件** | `Auth` |

**请求参数**:
```json
{
    "title": "无法连接节点",
    "content": "详细描述问题..."
}
```

**业务逻辑**:
```php
1. 创建工单:
   Ticket::create([
       'title' => $title,
       'content' => $content,
       'rootid' => 0,        // 主工单
       'userid' => $user->id,
       'datetime' => time(),
       'status' => 1,        // 1=开启, 2=已回复, 3=已关闭
       'sort' => $user->class
   ]);

2. 管理员收到通知
```

##### 回复工单

| 属性 | 值 |
|------|------|
| **路径** | `PUT /user/ticket/{id}` |
| **中间件** | `Auth` |

**请求参数**:
```json
{
    "content": "我的回复"
}
```

**业务逻辑**:
```php
1. 查询主工单: $root_ticket = Ticket::find($id);
2. 创建回复:
   Ticket::create([
       'title' => $root_ticket->title,
       'content' => $content,
       'rootid' => $id,
       'userid' => $user->id,
       'datetime' => time(),
       'status' => 2
   ]);
3. 更新主工单状态
```

##### 工单列表

| 属性 | 值 |
|------|------|
| **路径** | `GET /user/ticket` |
| **中间件** | `Auth` |

**返回数据**:
```php
$tickets = Ticket::where('userid', $user->id)
    ->where('rootid', 0)  // 只显示主工单
    ->orderBy('datetime', 'desc')
    ->paginate(10);

foreach ($tickets as $ticket) {
    // 获取最新回复
    $last_reply = Ticket::where('rootid', $ticket->id)
        ->orderBy('datetime', 'desc')
        ->first();
}
```

#### 2.11 转发管理 (Relay)

##### 创建转发规则

| 属性 | 值 |
|------|------|
| **路径** | `POST /user/relay` |
| **中间件** | `Auth` |

**请求参数**:
```json
{
    "source_node_id": 1,     // 源节点 ID
    "dist_node_id": 2,       // 目标节点 ID
    "port": 8080,            // 转发端口
    "priority": 1            // 优先级
}
```

**业务逻辑**:
```php
1. 验证节点是否存在
2. 创建转发规则:
   Relay::create([
       'user_id' => $user->id,
       'source_node_id' => $source_node_id,
       'dist_node_id' => $dist_node_id,
       'dist_ip' => $dist_node->server,
       'port' => $port,
       'priority' => $priority
   ]);

3. 返回规则 ID
```

##### 删除转发规则

| 属性 | 值 |
|------|------|
| **路径** | `DELETE /user/relay` |
| **中间件** | `Auth` |

**请求参数**:
```json
{
    "id": 1
}
```

#### 2.12 邀请系统

##### 购买邀请码

| 属性 | 值 |
|------|------|
| **路径** | `POST /user/buy_invite` |
| **中间件** | `Auth` |

**业务逻辑**:
```php
1. 检查余额:
   $price = Config::get('invite_price');
   if ($user->money < $price) {
       return "余额不足";
   }

2. 扣除余额

3. 生成邀请码:
   $code = new InviteCode();
   $code->code = Tools::genRandomChar(4);
   $code->user_id = $user->id;
   $code->save();
```

##### 自定义邀请码

| 属性 | 值 |
|------|------|
| **路径** | `POST /user/custom_invite` |
| **中间件** | `Auth` |

**请求参数**:
```json
{
    "customcode": "MYCODE"
}
```

**业务逻辑**:
```php
1. 检查邀请码是否已存在
2. 检查格式 (只能包含字母数字)
3. 扣除余额 (自定义邀请码价格更高)
4. 创建邀请码
```

##### 邀请列表

| 属性 | 值 |
|------|------|
| **路径** | `GET /user/invite` |
| **中间件** | `Auth` |

**返回数据**:
```php
// 邀请码列表
$codes = InviteCode::where('user_id', $user->id)->get();

// 邀请的用户
$ref_users = User::where('ref_by', $user->id)
    ->orderBy('reg_date', 'desc')
    ->paginate(10);

// 返利记录
$paybacks = Payback::where('ref_by', $user->id)
    ->orderBy('datetime', 'desc')
    ->paginate(10);
```

#### 2.13 订阅管理

##### 重置订阅链接

| 属性 | 值 |
|------|------|
| **路径** | `GET /user/url_reset` |
| **中间件** | `Auth` |

**业务逻辑**:
```php
1. 删除旧订阅:
   Link::where('userid', $user->id)->delete();

2. 生成新订阅 Token:
   $token = LinkController::GenerateSSRSubCode($user->id, 0);

3. 返回新订阅链接
```

##### 重置邀请链接

| 属性 | 值 |
|------|------|
| **路径** | `GET /user/inviteurl_reset` |
| **中间件** | `Auth` |

**业务逻辑**:
```php
// 生成新的邀请码
$code = new InviteCode();
$code->code = Tools::genRandomChar(8);
$code->user_id = $user->id;
$code->save();
```

##### 获取 iOS 配置

| 属性 | 值 |
|------|------|
| **路径** | `GET /user/getiosconf` |
| **中间件** | `Auth` |

**业务逻辑**:
```php
// 生成 Shadowsocks iOS 描述文件
$profile = [
    'server' => $node->server,
    'server_port' => $user->port,
    'password' => $user->passwd,
    'method' => $user->method
];

// 返回 .mobileconfig 文件
header('Content-Type: application/x-apple-aspen-config');
header('Content-Disposition: attachment; filename=profile.mobileconfig');
echo $xml_config;
```

---

### 3. 支付系统模块 (`/payment`)

#### 3.1 创建支付订单

| 属性 | 值 |
|------|------|
| **路径** | `POST /payment/purchase` 或 `POST /user/payment/purchase` |
| **中间件** | `Auth` |

**请求参数**:
```json
{
    "amount": 10.00,           // 充值金额
    "gateway": "alipay"        // 支付网关: alipay, yft, chenPay
}
```

**业务逻辑**:
```php
// 文件: app/Services/Payment.php:purchase()

1. 创建订单:
   Paylist::create([
       'userid' => $user->id,
       'total' => $amount,
       'status' => 0,          // 0=未支付, 1=已支付
       'tradeno' => $trade_no,
       'datetime' => time()
   ]);

2. 调用支付网关:
   - 支付宝: 跳转到支付宝收银台
   - 易付通: 跳转到易付通支付页
   - ClonePay: 同步外部支付系统

3. 返回支付 URL
```

**响应示例**:
```json
{
    "ret": 1,
    "msg": "ok",
    "data": {
        "url": "https://pay.example.com/checkout?id=123",
        "order_id": "20220126120000000012"
    }
}
```

#### 3.2 支付回调

| 属性 | 值 |
|------|------|
| **路径** | `POST /payment/notify/{type}` |
| **中间件** | 无 |
| **描述** | 支付平台异步回调 |

**业务逻辑**:
```php
// 文件: app/Services/Payment.php:notify()

1. 验证签名:
   $sign = $_POST['sign'];
   $calc_sign = md5($params . $secret);
   if ($sign != $calc_sign) {
       return "签名验证失败";
   }

2. 查询订单:
   $order = Paylist::where('tradeno', $trade_no)->first();

3. 检查订单状态:
   if ($order->status == 1) {
       return "success";  // 避免重复处理
   }

4. 更新订单状态:
   $order->status = 1;
   $order->save();

5. 充值到账户:
   $user = User::find($order->userid);
   $user->money += $order->total;
   $user->save();

6. 处理返利:
   if ($user->ref_by != 0) {
       Payback::calculate($user->id, $order->total);
   }

7. 返回 "success"
```

#### 3.3 支付返回

| 属性 | 值 |
|------|------|
| **路径** | `GET /payment/return` |
| **中间件** | `Auth` |
| **描述** | 用户支付完成后的跳转页面 |

**业务逻辑**:
```php
1. 显示支付结果页面
2. 查询订单状态
3. 如果支付成功，显示充值成功消息
4. 跳转到用户中心
```

#### 3.4 查询支付状态

| 属性 | 值 |
|------|------|
| **路径** | `POST /payment/status` |
| **中间件** | 无 |

**请求参数**:
```json
{
    "order_id": "20220126120000000012"
}
```

**响应示例**:
```json
{
    "ret": 1,
    "msg": "ok",
    "data": {
        "status": 1,           // 0=未支付, 1=已支付
        "amount": 10.00
    }
}
```

---

### 4. 管理后台模块 (`/admin`)

### 4.1 管理员首页

| 属性 | 值 |
|------|------|
| **路径** | `GET /admin` |
| **中间件** | `Admin` |
| **视图** | `admin/index.tpl` |

**返回数据**:
```php
$data = [
    'total_user'        => User::count(),
    'enable_user'       => User::where('enable', 1)->count(),
    'today_used_traffic'=> Tools::flowAutoShow($total_traffic),
    'total_money'       => Paylist::where('status', 1)->sum('total'),
    'checkin_user'      => CheckInLog::whereDate('created_at', today)->count(),
    'online_user'       => Ip::where('datetime', '>', time()-900)->distinct('ip')->count(),
    'node_count'        => Node::count(),
    'ticket_count'      => Ticket::where('status', 1)->count()
];
```

#### 4.2 用户管理

##### 用户列表

| 属性 | 值 |
|------|------|
| **路径** | `GET /admin/user` |
| **中间件** | `Admin` |

**查询参数**:
```
?search=keyword      // 搜索邮箱、用户名
?page=1              // 分页
```

**返回数据**:
```php
$users = User::orderBy('id', 'desc')
    ->paginate(20);

// 返回字段
$user_data = [
    'id'                => int,
    'user_name'         => string,
    'email'             => string,
    'money'             => decimal(12,2),
    'transfer_enable'   => bigint,
    'u'                 => bigint,
    'd'                 => bigint,
    'port'              => int,
    'class'             => int,
    'node_group'        => int,
    'enable'            => int,
    'reg_date'          => datetime,
    'expire_in'         => datetime,
    'class_expire'      => datetime,
    'online_ip_count'   => int,
    'last_check_in_time'=> int,
    'ref_by'            => int,
    'remark'            => string
];
```

##### 编辑用户

| 属性 | 值 |
|------|------|
| **路径** | `GET /admin/user/{id}/edit` |
| **中间件** | `Admin` |

**返回数据**:
```php
$user = User::find($id);
$relay = Relay::where('user_id', $id)->get();
```

##### 更新用户

| 属性 | 值 |
|------|------|
| **路径** | `PUT /admin/user/{id}` |
| **中间件** | `Admin` |

**请求参数**:
```json
{
    "email": "user@example.com",
    "pass": "new_password",
    "passwd": "ss_password",
    "port": 12345,
    "transfer_enable": 107374182400,  // 100 GB
    "u": 0,
    "d": 0,
    "method": "aes-256-gcm",
    "protocol": "origin",
    "obfs": "plain",
    "class": 1,
    "class_expire": "2025-01-26 00:00:00",
    "expire_in": "2025-01-26 00:00:00",
    "node_group": 0,
    "node_speedlimit": 50.00,
    "enable": 1,
    "is_admin": 0,
    "money": 100.00,
    "ref_by": 0,
    "remark": "备注"
}
```

**业务逻辑**:
```php
1. 验证邮箱唯一性
2. 如果修改密码，重新生成哈希
3. 如果修改端口，检查端口冲突
4. 更新用户信息
5. 清除相关缓存
```

##### 删除用户

| 属性 | 值 |
|------|------|
| **路径** | `DELETE /admin/user` |
| **中间件** | `Admin` |

**请求参数**:
```json
{
    "id": 1
}
```

**业务逻辑**:
```php
// 文件: app/Models/User.php:kill_user()

1. 删除关联数据:
   - RadiusBan
   - Disconnect
   - Bought
   - Code
   - Link
   - LoginIp
   - InviteCode
   - Token
   - PasswordReset

2. 保留数据（避免数据库查询变慢）:
   - DetectLog
   - Ip
   - TrafficLog

3. 删除用户记录
```

##### 切换用户

| 属性 | 值 |
|------|------|
| **路径** | `POST /admin/user/changetouser` |
| **中间件** | `Admin` |

**请求参数**:
```json
{
    "userid": 123
}
```

**业务逻辑**:
```php
1. 保存当前管理员 ID 到 Session
2. 切换到目标用户 Session
3. 可以操作用户账户
4. 点击 "返回管理员" 恢复原 Session
```

#### 4.3 节点管理

##### 节点列表

| 属性 | 值 |
|------|------|
| **路径** | `GET /admin/node` |
| **中间件** | `Admin` |

**返回数据**:
```php
$nodes = Node::orderBy('sort', 'asc')
    ->orderBy('name', 'asc')
    ->paginate(20);

// 节点字段
$node = [
    'id'                      => int,
    'name'                    => string,
    'type'                    => int,           // 1=显示, 0=隐藏
    'server'                  => string,
    'method'                  => string,
    'info'                    => string,
    'status'                  => string,
    'sort'                    => int,           // 协议类型
    'custom_method'           => int,           // 是否允许自定义加密
    'traffic_rate'            => float,         // 流量倍率
    'node_class'              => int,           // 等级要求
    'node_speedlimit'         => float,         // 限速 (MB/s)
    'node_connector'          => int,           // 连接数限制
    'node_bandwidth'          => bigint,        // 已用流量
    'node_bandwidth_limit'    => bigint,        // 流量限制
    'bandwidthlimit_resetday' => int,           // 重置日 (1-31)
    'node_heartbeat'          => bigint,        // 心跳时间
    'node_ip'                 => string,        // 节点 IP (逗号分隔)
    'node_group'              => int,           // 节点分组
    'custom_rss'              => int,           // 是否支持自定义订阅
    'mu_only'                 => int,           // 仅单端口
    'node_cost'               => int,           // 成本
    'node_online'             => int,           // 在线人数
    'is_clone'                => int,           // 克隆节点 ID
    'traffic_used_daily'      => bigint,        // 日均流量
    'traffic_left_daily'      => bigint,        // 日均剩余
    'node_unlock'             => string,        // IP 限制解锁
    'country_code'            => string         // 国家代码
];
```

##### 创建节点

| 属性 | 值 |
|------|------|
| **路径** | `GET /admin/node/create` |
| **中间件** | `Admin` |
| **视图** | `admin/node_create.tpl` |

**请求参数**:
```json
{
    "name": "香港 IPLC 01",
    "type": 1,
    "server": "hk1.example.com",
    "method": "aes-256-gcm",
    "info": "香港 IPLC 节点，延迟低",
    "status": "可用",
    "sort": 11,                    // 11=VMess
    "custom_method": 1,
    "traffic_rate": 1.0,
    "node_class": 0,
    "node_speedlimit": 0,
    "node_connector": 0,
    "node_bandwidth_limit": 0,
    "node_group": 0,
    "custom_rss": 1,
    "mu_only": 0,
    "node_cost": 50,
    "country_code": "HK"
}
```

**业务逻辑**:
```php
1. 解析服务器域名，获取 IP
2. 创建节点记录
3. 如果是克隆节点，复制源节点配置
4. 生成节点配置文件
5. 通知节点重新加载配置
```

##### 更新节点

| 属性 | 值 |
|------|------|
| **路径** | `PUT /admin/node/{id}` |
| **中间件** | `Admin` |

**业务逻辑**:
```php
1. 验证节点是否存在
2. 更新节点信息
3. 如果修改服务器地址，重新解析 IP
4. 清除节点缓存
5. 通知节点重新加载
```

##### 删除节点

| 属性 | 值 |
|------|------|
| **路径** | `DELETE /admin/node` |
| **中间件** | `Admin` |

**请求参数**:
```json
{
    "id": 1
}
```

**业务逻辑**:
```php
1. 检查节点是否有关联的克隆节点
2. 删除节点在线日志
3. 删除节点信息日志
4. 删除节点记录
```

##### 节点控制 (AJAX)

| 属性 | 值 |
|------|------|
| **路径** | `POST /admin/node/ajax` |
| **中间件** | `Admin` |

**响应示例**:
```json
{
    "ret": 1,
    "msg": "ok",
    "data": {
        "online_user": 123,
        "load": "0.5,0.3,0.2",
        "uptime": 86400,
        "traffic": {
            "used": "10 GB",
            "left": "90 GB"
        }
    }
}
```

#### 4.4 商店管理

##### 商品列表

| 属性 | 值 |
|------|------|
| **路径** | `GET /admin/shop` |
| **中间件** | `Admin` |

**返回数据**:
```php
$shops = Shop::orderBy('id', 'desc')
    ->paginate(20);

// 商品字段
$shop = [
    'id'          => int,
    'name'        => string,
    'price'       => decimal(12,2),
    'content'     => text,           // JSON 格式
    'auto_renew'  => int,            // 是否自动续费
    'status'      => int,            // 1=上架, 0=下架
    'auto_reset_bandwidth' => int    // 重置流量
];
```

##### 创建商品

| 属性 | 值 |
|------|------|
| **路径** | `POST /admin/shop` |
| **中间件** | `Admin` |

**请求参数**:
```json
{
    "name": "月付套餐 - 100GB",
    "price": 9.99,
    "content": {
        "time": 30,
        "bandwidth": 100,
        "class": 0,
        "reset": 1
    },
    "auto_renew": 0,
    "auto_reset_bandwidth": 0,
    "status": 1
}
```

##### 购买记录

| 属性 | 值 |
|------|------|
| **路径** | `GET /admin/bought` |
| **中间件** | `Admin` |

**返回数据**:
```php
$boughts = Bought::orderBy('id', 'desc')
    ->paginate(20);

$bought = [
    'id'        => int,
    'userid'    => int,
    'shopid'    => int,
    'datetime'  => int,
    'renew'     => bigint,
    'coupon'    => string,
    'price'     => decimal(12,2)
];

// 关联查询
$user = User::find($bought->userid);
$shop = Shop::find($bought->shopid);
```

#### 4.5 工单管理

##### 工单列表

| 属性 | 值 |
|------|------|
| **路径** | `GET /admin/ticket` |
| **中间件** | `Admin` |

**返回数据**:
```php
$tickets = Ticket::where('rootid', 0)
    ->orderBy('status', 'asc')
    ->orderBy('datetime', 'desc')
    ->paginate(20);

$ticket = [
    'id'       => int,
    'title'    => string,
    'content'  => string,
    'rootid'   => int,
    'userid'   => int,
    'datetime' => int,
    'status'   => int,    // 1=开启, 2=已回复, 3=已关闭
    'sort'     => int
];
```

##### 回复工单

| 属性 | 值 |
|------|------|
| **路径** | `PUT /admin/ticket/{id}` |
| **中间件** | `Admin` |

**业务逻辑**:
```php
1. 创建回复记录
2. 更新主工单状态
3. 发送邮件通知用户
4. 记录管理员操作日志
```

#### 4.6 公告管理

##### 公告列表

| 属性 | 值 |
|------|------|
| **路径** | `GET /admin/announcement` |
| **中间件** | `Admin` |

**返回数据**:
```php
$anns = Ann::orderBy('id', 'desc')
    ->paginate(20);

$ann = [
    'id'      => int,
    'date'    => datetime,
    'content' => longtext,      // HTML
    'markdown'=> longtext       // Markdown
];
```

##### 创建公告

| 属性 | 值 |
|------|------|
| **路径** | `POST /admin/announcement` |
| **中间件** | `Admin` |

**请求参数**:
```json
{
    "date": "2025-01-26 12:00:00",
    "content": "<p>公告内容</p>",
    "markdown": "# 公告标题\n\n公告内容"
}
```

#### 4.7 优惠券管理

##### 优惠券列表

| 属性 | 值 |
|------|------|
| **路径** | `GET /admin/coupon` |
| **中间件** | `Admin` |

**返回数据**:
```php
$coupons = Coupon::orderBy('id', 'desc')
    ->paginate(20);

$coupon = [
    'id'      => int,
    'code'    => string,
    'onetime' => int,         // 1=一次性, 0=可重复
    'expire'  => int,         // 过期时间戳
    'shop'    => string,      // 适用商品 ID (逗号分隔)
    'credit'  => int          // 优惠金额
];
```

##### 创建优惠券

| 属性 | 值 |
|------|------|
| **路径** | `POST /admin/coupon` |
| **中间件** | `Admin` |

**请求参数**:
```json
{
    "code": "NEWUSER2025",
    "onetime": 1,
    "expire": 1737868800,    // 过期时间戳
    "shop": "1,2,3",         // 适用商品 ID
    "credit": 5.00           // 优惠金额
}
```

#### 4.8 邀请码管理

##### 邀请码列表

| 属性 | 值 |
|------|------|
| **路径** | `GET /admin/code` |
| **中间件** | `Admin` |

**返回数据**:
```php
$codes = Code::orderBy('id', 'desc')
    ->paginate(20);

$code = [
    'id'          => int,
    'code'        => string,
    'type'        => int,     // -1=充值, -2=提现, >0=流量包
    'number'      => decimal(11,2),
    'isused'      => int,
    'userid'      => int,
    'usedatetime' => datetime
];
```

##### 创建充值码

| 属性 | 值 |
|------|------|
| **路径** | `POST /admin/code` |
| **中间件** | `Admin` |

**请求参数**:
```json
{
    "code": "PAY100",
    "type": -1,           // -1=充值, -2=提现
    "number": 100.00       // 金额
}
```

#### 4.9 流量日志

##### 流量日志列表

| 属性 | 值 |
|------|------|
| **路径** | `GET /admin/trafficlog` |
| **中间件** | `Admin` |

**查询参数**:
```
?user_id=123
?node_id=1
&start_date=2025-01-01
&end_date=2025-01-31
```

**返回数据**:
```php
$logs = TrafficLog::orderBy('id', 'desc')
    ->paginate(50);

$log = [
    'id'       => int,
    'user_id'  => int,
    'u'        => bigint,    // 上传流量
    'd'        => bigint,    // 下载流量
    'node_id'  => int,
    'rate'     => float,     // 流量倍率
    'traffic'  => varchar(32),
    'log_time' => int
];
```

---

### 5. API 模块 (`/api`)

#### 5.1 获取订阅链接

| 属性 | 值 |
|------|------|
| **路径** | `GET /api/sublink` |
| **中间件** | `Mu` |
| **描述** | 获取用户订阅配置 |

**请求参数**:
```
?token={muKey}
&user_id=123         // 可选
&client=clash       // 可选: clash, v2ray, shadowrocket
```

**业务逻辑**:
```php
// 文件: app/Controllers/Client/ClientApiController.php:GetSubLink()

1. 验证 muKey
2. 获取用户:
   $user = User::find($user_id);

3. 获取可用节点:
   $nodes = Node::where('type', 1)
       ->where('node_class', '<=', $user->class)
       ->where(function($query) use ($user) {
           $query->where('node_group', $user->node_group)
                 ->orWhere('node_group', 0);
       })
       ->get();

4. 根据客户端类型生成配置:
   - Shadowsocks: ss://base64(...)
   - VMess: vmess://base64(...)
   - VLess: vless://...
   - Trojan: trojan://...
   - Clash: YAML 格式
   - Shadowrocket: PLA 配置

5. 返回配置文件
```

**响应示例 (Clash YAML)**:
```yaml
proxies:
  - name: "HK-IPLC-01"
    type: ss
    server: hk1.example.com
    port: 12345
    cipher: aes-256-gcm
    password: "password"

proxy-groups:
  - name: "Proxy"
    type: select
    proxies:
      - HK-IPLC-01

rules:
  - MATCH,Proxy
```

#### 5.2 节点流量上报

| 属性 | 值 |
|------|------|
| **路径** | `POST /api/ssn_sub/{id}` |
| **中间件** | `Mu` |
| **描述** | 节点上报用户流量数据 |

**请求参数**:
```json
{
    "data": [
        {
            "user_id": 123,
            "u": 1073741824,      // 上传 1 GB
            "d": 2147483648       // 下载 2 GB
        }
    ]
}
```

**业务逻辑**:
```php
// 文件: app/Controllers/ApiController.php:ssn_sub()

1. 验证 muKey 和节点 ID
2. 验证节点 IP
3. 遍历流量数据:
   foreach ($data as $traffic) {
       $user = User::find($traffic['user_id']);

       // 计算实际流量
       $rate = $node->traffic_rate;
       $u = $traffic['u'] * $rate;
       $d = $traffic['d'] * $rate;

       // 更新用户流量
       $user->u += $u;
       $user->d += $d;
       $user->t = time();
       $user->save();

       // 检查流量限制
       $total = $user->u + $user->d;
       if ($total > $user->transfer_enable) {
           $user->enable = 0;
           $user->save();
       }

       // 记录流量日志
       TrafficLog::create([
           'user_id' => $user->id,
           'u' => $u,
           'd' => $d,
           'node_id' => $node->id,
           'rate' => $rate,
           'traffic' => Tools::flowAutoShow($u + $d),
           'log_time' => time()
       ]);

       // 更新节点流量
       $node->node_bandwidth += ($u + $d);
       $node->save();
   }

4. 返回成功
```

**响应示例**:
```json
{
    "ret": 1,
    "msg": "ok"
}
```

#### 5.3 节点配置更新 (V2Ray/XRay)

| 属性 | 值 |
|------|------|
| **路径** | `POST /api/ssn_v2/{id}` |
| **中间件** | `Mu` |
| **描述** | V2Ray/XRay 节点同步用户配置 |

**请求参数**:
```json
{
    "node_id": 11
}
```

**响应示例**:
```json
{
    "ret": 1,
    "msg": "ok",
    "data": {
        "users": [
            {
                "email": "user@example.com",
                "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
                "alter_id": 0,
                "level": 0
            }
        ]
    }
}
```

**业务逻辑**:
```php
1. 获取节点信息
2. 查询所有有权限访问该节点的用户
3. 生成 V2Ray 配置:
   - UUID: $user->v2ray_uuid
   - Level: $user->class
   - Email: $user->email
4. 返回 JSON 配置
```

#### 5.4 获取节点域名

| 属性 | 值 |
|------|------|
| **路径** | `GET /api/getNodeDomain/{id}` |
| **中间件** | `Mu` |
| **描述** | 获取节点域名配置 |

**响应示例**:
```json
{
    "ret": 1,
    "msg": "ok",
    "data": {
        "server": "hk1.example.com",
        "port": 443,
        "server_name": "example.com"
    }
}
```

#### 5.5 获取节点代理配置

| 属性 | 值 |
|------|------|
| **路径** | `GET /api/node/proxy/{id}` |
| **中间件** | `Mu` |
| **描述** | 获取节点的代理配置信息 |

**响应示例**:
```json
{
    "ret": 1,
    "msg": "ok",
    "data": {
        "type": "vmess",
        "server": "hk1.example.com",
        "port": 443,
        "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "alter_id": 0,
        "security": "auto",
        "network": "ws",
        "path": "/path",
        "tls": true
    }
}
```

#### 5.6 获取新节点

| 属性 | 值 |
|------|------|
| **路径** | `GET /api/node/new` |
| **中间件** | `Mu` |
| **描述** | 获取新添加的可用节点 |

**响应示例**:
```json
{
    "ret": 1,
    "msg": "ok",
    "data": [
        {
            "id": 11,
            "name": "HK-IPLC-01",
            "server": "hk1.example.com",
            "type": "vmess"
        }
    ]
}
```

#### 5.7 ClonePay 支付同步

| 属性 | 值 |
|------|------|
| **路径** | `POST /api/clonepay` |
| **中间件** | `Mu` |
| **描述** | 同步外部支付系统的订单 |

**请求参数**:
```json
{
    "email": "user@example.com",
    "amount": 10.00,
    "tradeno": "20220126120000000012",
    "sign": "md5_hash"
}
```

**业务逻辑**:
```php
1. 验证签名:
   $calc_sign = md5($email . '&' . date('Ymd') . '&' . $api_key);
   if ($sign != $calc_sign) {
       return "签名验证失败";
   }

2. 查询用户:
   $user = User::where('email', $email)->first();

3. 创建或查询订单:
   $order = Paylist::where('tradeno', $tradeno)->first();
   if (!$order) {
       $order = Paylist::create([
           'userid' => $user->id,
           'total' => $amount,
           'status' => 1,
           'tradeno' => $tradeno,
           'datetime' => time()
       ]);
   }

4. 充值到账户:
   $user->money += $amount;
   $user->save();

5. 处理返利
```

---

### 6. Mu 协议模块 (`/mu`)

#### 6.1 获取用户列表

| 属性 | 值 |
|------|------|
| **路径** | `GET /mu/users` |
| **中间件** | `Mu` |
| **描述** | 节点获取所有用户配置 |

**响应示例**:
```json
{
    "ret": 1,
    "msg": "ok",
    "data": {
        "users": [
            {
                "id": 123,
                "port": 12345,
                "passwd": "password",
                "method": "aes-256-gcm",
                "enable": 1
            }
        ]
    }
}
```

#### 6.2 上报流量

| 属性 | 值 |
|------|------|
| **路径** | `POST /mu/users/{id}/traffic` |
| **中间件** | `Mu` |
| **描述** | 上报单个用户流量 |

**请求参数**:
```json
{
    "u": 1073741824,
    "d": 2147483648
}
```

#### 6.3 上报在线人数

| 属性 | 值 |
|------|------|
| **路径** | `POST /mu/nodes/{id}/online_count` |
| **中间件** | `Mu` |
| **描述** | 节点上报当前在线人数 |

**请求参数**:
```json
{
    "count": 123
}
```

**业务逻辑**:
```php
NodeOnlineLog::create([
    'node_id' => $node_id,
    'online_user' => $count,
    'log_time' => time()
]);
```

#### 6.4 上报节点信息

| 属性 | 值 |
|------|------|
| **路径** | `POST /mu/nodes/{id}/info` |
| **中间件** | `Mu` |
| **描述** | 节点上报系统信息 |

**请求参数**:
```json
{
    "load": "0.5,0.3,0.2",     // 1分钟, 5分钟, 15分钟负载
    "uptime": 86400            // 运行时间 (秒)
}
```

**业务逻辑**:
```php
NodeInfoLog::create([
    'node_id' => $node_id,
    'uptime' => $uptime,
    'load' => $load,
    'log_time' => time()
]);
```

---

### 7. Mod_Mu 协议模块 (`/mod_mu`)

#### 7.1 获取节点信息

| 属性 | 值 |
|------|------|
| **路径** | `GET /mod_mu/nodes/{id}/info` |
| **中间件** | `Mod_Mu` |
| **描述** | 节点获取配置信息 |

**响应示例**:
```json
{
    "ret": 1,
    "msg": "ok",
    "data": {
        "node_speedlimit": 50.00,
        "traffic_rate": 1.0,
        "node_group": 0,
        "mu_only": 0
    }
}
```

#### 7.2 获取所有节点

| 属性 | 值 |
|------|------|
| **路径** | `GET /mod_mu/nodes` |
| **中间件** | `Mod_Mu` |
| **描述** | 获取所有节点配置 |

**响应示例**:
```json
{
    "ret": 1,
    "msg": "ok",
    "data": [
        {
            "id": 1,
            "server": "hk1.example.com",
            "node_class": 0,
            "node_group": 0
        }
    ]
}
```

#### 7.3 上报流量

| 属性 | 值 |
|------|------|
| **路径** | `POST /mod_mu/users/traffic` |
| **中间件** | `Mod_Mu` |
| **描述** | 批量上报用户流量 |

**请求参数**:
```json
{
    "data": [
        {
            "user_id": 123,
            "u": 1073741824,
            "d": 2147483648
        }
    ]
}
```

#### 7.4 上报活跃 IP

| 属性 | 值 |
|------|------|
| **路径** | `POST /mod_mu/users/aliveip` |
| **中间件** | `Mod_Mu` |
| **描述** | 上报用户活跃 IP |

**请求参数**:
```json
{
    "data": [
        {
            "user_id": 123,
            "ip": "1.2.3.4"
        }
    ]
}
```

#### 7.5 上报违规检测

| 属性 | 值 |
|------|------|
| **路径** | `POST /mod_mu/users/detectlog` |
| **中间件** | `Mod_Mu` |
| **描述** | 上报用户违规行为 |

**请求参数**:
```json
{
    "data": [
        {
            "user_id": 123,
            "list_id": 1,
            "node_id": 1
        }
    ]
}
```

**业务逻辑**:
```php
DetectLog::create([
    'user_id' => $user_id,
    'list_id' => $list_id,
    'node_id' => $node_id,
    'datetime' => time()
]);

// 检查是否需要封禁用户
$ban_count = DetectLog::where('user_id', $user_id)
    ->where('datetime', '>', time() - 86400)
    ->count();

if ($ban_count > 3) {
    $user->enable = 0;
    $user->save();
}
```

#### 7.6 获取检测规则

| 属性 | 值 |
|------|------|
| **路径** | `GET /mod_mu/func/detect_rules` |
| **中间件** | `Mod_Mu` |
| **描述** | 获取违规检测规则 |

**响应示例**:
```json
{
    "ret": 1,
    "msg": "ok",
    "data": [
        {
            "id": 1,
            "name": "禁止访问百度",
            "text": "baidu.com",
            "regex": "baidu\\.com",
            "type": 1    // 1=域名, 2=关键词
        }
    ]
}
```

#### 7.7 获取中转规则

| 属性 | 值 |
|------|------|
| **路径** | `GET /mod_mu/func/relay_rules` |
| **中间件** | `Mod_Mu` |
| **描述** | 获取用户中转规则 |

**响应示例**:
```json
{
    "ret": 1,
    "msg": "ok",
    "data": [
        {
            "user_id": 123,
            "source_node_id": 1,
            "dist_node_id": 2,
            "port": 8080
        }
    ]
}
```

#### 7.8 添加 IP 黑名单

| 属性 | 值 |
|------|------|
| **路径** | `POST /mod_mu/func/block_ip` |
| **中间件** | `Mod_Mu` |
| **描述** | 节点上报违规 IP |

**请求参数**:
```json
{
    "ip": "1.2.3.4",
    "node_id": 1
}
```

**业务逻辑**:
```php
BlockIp::create([
    'nodeid' => $node_id,
    'ip' => $ip,
    'datetime' => time()
]);
```

#### 7.9 获取 IP 黑名单

| 属性 | 值 |
|------|------|
| **路径** | `GET /mod_mu/func/block_ip` |
| **中间件** | `Mod_Mu` |
| **描述** | 获取 IP 黑名单 |

**响应示例**:
```json
{
    "ret": 1,
    "msg": "ok",
    "data": [
        {
            "ip": "1.2.3.4"
        }
    ]
}
```

#### 7.10 速度测试

| 属性 | 值 |
|------|------|
| **路径** | `POST /mod_mu/func/speedtest` |
| **中间件** | `Mod_Mu` |
| **描述** | 上报节点测速结果 |

**请求参数**:
```json
{
    "node_id": 1,
    "telecomping": "30ms",
    "telecomeupload": "100 Mbps",
    "telecomedownload": "200 Mbps",
    "unicomping": "40ms",
    "unicomupload": "80 Mbps",
    "unicomdownload": "150 Mbps",
    "cmccping": "50ms",
    "cmccupload": "60 Mbps",
    "cmccdownload": "120 Mbps"
}
```

#### 7.11 自动执行命令

| 属性 | 值 |
|------|------|
| **路径** | `GET /mod_mu/func/autoexec` |
| **中间件** | `Mod_Mu` |
| **描述** | 获取待执行的自动命令 |

**响应示例**:
```json
{
    "ret": 1,
    "msg": "ok",
    "data": [
        {
            "id": 1,
            "type": 1,
            "value": "systemctl restart shadowsocks",
            "sign": "signature"
        }
    ]
}
```

**业务逻辑**:
```php
// 管理员可以创建定时任务
Auto::create([
    'type' => 1,              // 命令类型
    'value' => $command,      // 命令内容
    'sign' => $signature,     // 签名
    'datetime' => time()
]);

// 节点执行后删除
Auto::where('sign', $sign)->delete();
```

---

### 8. Vue 接口模块

#### 8.1 获取全局配置

| 属性 | 值 |
|------|------|
| **路径** | `GET /globalconfig` |
| **中间件** | 无 |
| **描述** | 获取前端全局配置 |

**响应示例**:
```json
{
    "ret": 1,
    "msg": "ok",
    "data": {
        "appName": "SS Panel",
        "baseUrl": "https://example.com",
        "logoUrl": "/images/logo.png",
        "enableLoginCaptcha": true,
        "enableCheckinCaptcha": true
    }
}
```

#### 8.2 获取用户信息

| 属性 | 值 |
|------|------|
| **路径** | `GET /getuserinfo` |
| **中间件** | `Auth` |
| **描述** | 获取当前登录用户信息 |

**响应示例**:
```json
{
    "ret": 1,
    "msg": "ok",
    "data": {
        "user": {
            "id": 123,
            "user_name": "test",
            "email": "user@example.com",
            "money": 100.00,
            "class": 1,
            "transfer_enable": 107374182400
        }
    }
}
```

#### 8.3 获取用户邀请信息

| 属性 | 值 |
|------|------|
| **路径** | `POST /getuserinviteinfo` |
| **中间件** | `Auth` |
| **描述** | 获取用户邀请统计 |

**响应示例**:
```json
{
    "ret": 1,
    "msg": "ok",
    "data": {
        "invite_count": 10,
        "payback_sum": 50.00
    }
}
```

#### 8.4 获取订阅 Token

| 属性 | 值 |
|------|------|
| **路径** | `GET /getnewsubtoken` |
| **中间件** | `Auth` |
| **描述** | 重新生成订阅 Token |

#### 8.5 获取邀请码

| 属性 | 值 |
|------|------|
| **路径** | `GET /getnewinvotecode` |
| **中间件** | `Auth` |
| **描述** | 生成新邀请码 |

---

## 数据库字典

### 核心表结构

#### 1. user (用户表)

```sql
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(128) NOT NULL COMMENT '用户名',
  `email` varchar(64) NOT NULL COMMENT '邮箱',
  `pass` varchar(64) NOT NULL COMMENT '密码哈希',
  `passwd` varchar(16) NOT NULL COMMENT 'SS 密码',
  `v2ray_uuid` varchar(64) DEFAULT NULL COMMENT 'V2Ray UUID',
  `t` int(11) NOT NULL DEFAULT '0' COMMENT '最后使用时间',
  `u` bigint(20) NOT NULL COMMENT '上传流量 (字节)',
  `d` bigint(20) NOT NULL COMMENT '下载流量 (字节)',
  `transfer_enable` bigint(20) NOT NULL COMMENT '总流量限制 (字节)',
  `transfer_limit` bigint(20) DEFAULT '1073741824' COMMENT '每日流量限制',
  `port` int(11) NOT NULL COMMENT '端口号',
  `method` varchar(64) DEFAULT 'rc4-md5' COMMENT '加密方式',
  `protocol` varchar(128) DEFAULT 'origin' COMMENT '协议插件',
  `protocol_param` varchar(128) DEFAULT NULL COMMENT '协议参数',
  `obfs` varchar(128) DEFAULT 'plain' COMMENT '混淆插件',
  `obfs_param` varchar(128) DEFAULT NULL COMMENT '混淆参数',
  `node_speedlimit` decimal(12,2) DEFAULT '0.00' COMMENT '限速 (MB/s)',
  `node_connector` int(11) DEFAULT '0' COMMENT '连接数限制',
  `switch` tinyint(4) DEFAULT '1' COMMENT '开关',
  `enable` tinyint(4) DEFAULT '1' COMMENT '是否启用',
  `type` tinyint(4) DEFAULT '1' COMMENT '类型',
  `is_admin` int(2) DEFAULT '0' COMMENT '是否管理员',
  `is_multi_user` int(11) DEFAULT '0' COMMENT '是否多用户',
  `money` decimal(12,2) NOT NULL COMMENT '余额',
  `ref_by` int(11) DEFAULT '0' COMMENT '邀请人 ID',
  `score` int(8) DEFAULT '0' COMMENT '用户评分',
  `class` int(11) DEFAULT '0' COMMENT '用户等级',
  `class_expire` datetime DEFAULT '1989-06-04 00:05:00' COMMENT '等级过期时间',
  `expire_in` datetime DEFAULT '2099-06-04 00:05:00' COMMENT '账户过期时间',
  `node_group` int(11) DEFAULT '0' COMMENT '节点分组',
  `is_hide` int(11) DEFAULT '0' COMMENT '是否隐藏',
  `telegram_id` bigint(20) DEFAULT NULL COMMENT 'Telegram ID',
  `ban_times` int(11) DEFAULT '0' COMMENT '封禁次数',
  `sub_limit` int(11) DEFAULT '16' COMMENT '订阅获取节点数限制',
  `rss_ip` varchar(64) DEFAULT NULL COMMENT '订阅来源 IP',
  `cncdn` varchar(64) DEFAULT '0' COMMENT 'CN CDN',
  `cncdn_count` varchar(64) DEFAULT '0' COMMENT 'CN 次数',
  `cfcdn` varchar(64) DEFAULT '0' COMMENT 'Cloudflare CDN',
  `cfcdn_count` varchar(64) DEFAULT '0' COMMENT 'CF 次数',
  `rss_count` int(11) DEFAULT '0' COMMENT '订阅次数',
  `rss_count_lastday` int(11) DEFAULT '0' COMMENT '昨日订阅次数',
  `rss_ips_count` int(11) DEFAULT '0' COMMENT '订阅 IP 数',
  `rss_ips_lastday` int(11) DEFAULT '0' COMMENT '昨日订阅 IP 数',
  `warming` text COMMENT '警告消息',
  `im_type` int(11) DEFAULT '1' COMMENT '联系方式类型',
  `im_value` text COMMENT '联系方式',
  `last_check_in_time` int(11) DEFAULT '0' COMMENT '最后签到时间',
  `last_get_gift_time` int(11) DEFAULT '0' COMMENT '最后领工资时间',
  `last_rest_pass_time` int(11) DEFAULT '0' COMMENT '最后重置密码时间',
  `last_day_t` bigint(20) DEFAULT '0' COMMENT '昨日流量',
  `sendDailyMail` int(11) DEFAULT '0' COMMENT '是否发送日报',
  `auto_reset_day` int(11) DEFAULT '0' COMMENT '流量重置日',
  `auto_reset_bandwidth` decimal(12,2) DEFAULT '0.00' COMMENT '流量重置值',
  `renew` float(8) DEFAULT '0' COMMENT '流量累加',
  `renew_time` int(11) DEFAULT '0' COMMENT '下次重置时间',
  `forbidden_ip` longtext COMMENT '禁止 IP',
  `forbidden_port` longtext COMMENT '禁止端口',
  `disconnect_ip` longtext COMMENT '断开 IP',
  `ga_token` text COMMENT 'Google Authenticator Token',
  `ga_enable` int(11) DEFAULT '0' COMMENT '是否启用 GA',
  `pac` longtext COMMENT 'PAC 脚本',
  `theme` text COMMENT '主题',
  `remark` text COMMENT '备注',
  `reg_date` datetime NOT NULL COMMENT '注册时间',
  `reg_ip` varchar(128) DEFAULT '127.0.0.1' COMMENT '注册 IP',
  `invite_num` int(8) NOT NULL COMMENT '邀请码数量',
  `expire_time` int(11) DEFAULT '0' COMMENT '过期时间',
  `is_email_verify` tinyint(4) DEFAULT '0' COMMENT '是否验证邮箱',
  `plan` varchar(2) DEFAULT 'A' COMMENT '套餐',
  `is_edu` varchar(64) DEFAULT '0' COMMENT '是否教育用户',
  `upswd` varchar(64) DEFAULT '0' COMMENT '用户密码',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `user_name` (`user_name`),
  KEY `uid` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 2. ss_node (节点表)

```sql
CREATE TABLE `ss_node` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL COMMENT '节点名称',
  `type` int(3) NOT NULL COMMENT '1=显示, 0=隐藏',
  `server` varchar(500) NOT NULL COMMENT '服务器地址',
  `method` varchar(64) NOT NULL COMMENT '加密方式',
  `info` varchar(128) NOT NULL COMMENT '节点描述',
  `status` varchar(128) NOT NULL COMMENT '状态',
  `sort` int(3) NOT NULL COMMENT '协议类型',
  `custom_method` tinyint(1) DEFAULT '0' COMMENT '是否允许自定义加密',
  `traffic_rate` float NOT NULL DEFAULT '1' COMMENT '流量倍率',
  `node_class` int(11) DEFAULT '0' COMMENT '等级要求',
  `node_speedlimit` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT '限速 (MB/s)',
  `node_connector` int(11) DEFAULT '0' COMMENT '连接数限制',
  `node_bandwidth` bigint(20) DEFAULT '0' COMMENT '已用流量',
  `node_bandwidth_limit` bigint(20) DEFAULT '0' COMMENT '流量限制',
  `node_bandwidth_lastday` bigint(20) DEFAULT '0' COMMENT '昨日流量',
  `bandwidthlimit_resetday` int(11) DEFAULT '0' COMMENT '流量重置日',
  `node_heartbeat` bigint(20) DEFAULT '0' COMMENT '最后心跳时间',
  `node_ip` varchar(255) NOT NULL COMMENT '节点 IP',
  `node_group` int(11) DEFAULT '0' COMMENT '节点分组',
  `custom_rss` int(11) DEFAULT '0' COMMENT '是否支持自定义订阅',
  `mu_only` int(11) DEFAULT '0' COMMENT '是否仅单端口',
  `node_cost` int(11) DEFAULT '5' COMMENT '节点成本',
  `node_online` int(11) DEFAULT '1' COMMENT '是否显示在线人数',
  `node_oncost` float(11) DEFAULT '0' COMMENT '性价比',
  `node_sort` int(11) DEFAULT '0' COMMENT '故障排序',
  `is_clone` int(11) DEFAULT '0' COMMENT '克隆节点 ID',
  `traffic_used` bigint(20) DEFAULT '0' COMMENT '已用流量',
  `traffic_left` bigint(20) DEFAULT '0' COMMENT '剩余流量',
  `traffic_used_daily` bigint(20) DEFAULT '0' COMMENT '日均流量',
  `traffic_left_daily` bigint(20) DEFAULT '0' COMMENT '日均剩余',
  `node_unlock` varchar(500) DEFAULT '' COMMENT 'IP 限制解锁',
  `country_code` varchar(32) DEFAULT '' COMMENT '国家代码',
  `cncdn` tinyint(4) DEFAULT NULL COMMENT 'CN CDN',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 3. user_traffic_log (流量日志表)

```sql
CREATE TABLE `user_traffic_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT '用户 ID',
  `u` bigint(20) NOT NULL COMMENT '上传流量',
  `d` bigint(20) NOT NULL COMMENT '下载流量',
  `node_id` int(11) NOT NULL COMMENT '节点 ID',
  `rate` float NOT NULL COMMENT '流量倍率',
  `traffic` varchar(32) NOT NULL COMMENT '流量总计',
  `log_time` int(11) NOT NULL COMMENT '记录时间',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `node_id` (`node_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

#### 4. bought (购买记录表)

```sql
CREATE TABLE `bought` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `userid` bigint(20) NOT NULL COMMENT '用户 ID',
  `shopid` bigint(20) NOT NULL COMMENT '商品 ID',
  `datetime` bigint(20) NOT NULL COMMENT '购买时间',
  `renew` bigint(11) NOT NULL COMMENT '续费时间',
  `coupon` text NOT NULL COMMENT '优惠券',
  `price` decimal(12,2) NOT NULL COMMENT '购买价格',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

#### 5. shop (商品表)

```sql
CREATE TABLE `shop` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL COMMENT '商品名称',
  `price` decimal(12,2) NOT NULL COMMENT '价格',
  `content` text NOT NULL COMMENT '商品内容 (JSON)',
  `auto_renew` int(11) NOT NULL COMMENT '自动续费',
  `auto_reset_bandwidth` int(11) NOT NULL COMMENT '重置流量',
  `status` int(11) NOT NULL DEFAULT '1' COMMENT '状态',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

#### 6. coupon (优惠券表)

```sql
CREATE TABLE `coupon` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `code` text NOT NULL COMMENT '优惠码',
  `onetime` int(11) NOT NULL COMMENT '是否一次性',
  `expire` bigint(20) NOT NULL COMMENT '过期时间',
  `shop` text NOT NULL COMMENT '适用商品',
  `credit` int(11) NOT NULL COMMENT '优惠金额',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

#### 7. paylist (支付订单表)

```sql
CREATE TABLE `paylist` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `userid` bigint(20) NOT NULL COMMENT '用户 ID',
  `total` decimal(12,2) NOT NULL COMMENT '金额',
  `status` int(11) NOT NULL DEFAULT '0' COMMENT '状态',
  `tradeno` text COMMENT '交易号',
  `datetime` bigint(20) NOT NULL DEFAULT '0' COMMENT '时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

#### 8. payback (返利表)

```sql
CREATE TABLE `payback` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `total` decimal(12,2) NOT NULL COMMENT '消费金额',
  `userid` bigint(20) NOT NULL COMMENT '用户 ID',
  `ref_by` bigint(20) NOT NULL COMMENT '邀请人 ID',
  `ref_get` decimal(12,2) NOT NULL COMMENT '返利金额',
  `datetime` bigint(20) NOT NULL COMMENT '时间',
  `callback` int(8) DEFAULT '0' COMMENT '是否收回',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

#### 9. ticket (工单表)

```sql
CREATE TABLE `ticket` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` longtext NOT NULL COMMENT '标题',
  `content` longtext NOT NULL COMMENT '内容',
  `rootid` bigint(20) NOT NULL COMMENT '主工单 ID',
  `userid` bigint(20) NOT NULL COMMENT '用户 ID',
  `datetime` bigint(20) NOT NULL COMMENT '时间',
  `status` int(11) DEFAULT '1' COMMENT '状态',
  `sort` int(11) DEFAULT '0' COMMENT '排序',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

#### 10. relay (转发规则表)

```sql
CREATE TABLE `relay` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT '用户 ID',
  `source_node_id` bigint(20) NOT NULL COMMENT '源节点 ID',
  `dist_node_id` bigint(20) NOT NULL COMMENT '目标节点 ID',
  `dist_ip` text NOT NULL COMMENT '目标 IP',
  `port` int(11) NOT NULL COMMENT '端口',
  `priority` int(11) NOT NULL COMMENT '优先级',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

#### 11. code (充值码表)

```sql
CREATE TABLE `code` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `code` text NOT NULL COMMENT '代码',
  `type` int(11) NOT NULL COMMENT '类型 (-1=充值, -2=提现)',
  `number` decimal(11,2) NOT NULL COMMENT '金额/流量',
  `isused` int(11) NOT NULL DEFAULT '0' COMMENT '是否已使用',
  `userid` bigint(20) NOT NULL COMMENT '用户 ID',
  `usedatetime` datetime NOT NULL COMMENT '使用时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

#### 12. announcement (公告表)

```sql
CREATE TABLE `announcement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` datetime NOT NULL COMMENT '日期',
  `content` longtext NOT NULL COMMENT '内容 (HTML)',
  `markdown` longtext NOT NULL COMMENT 'Markdown',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

#### 13. auto (自动执行表)

```sql
CREATE TABLE `auto` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `type` int(11) NOT NULL COMMENT '类型',
  `value` longtext NOT NULL COMMENT '值',
  `sign` longtext NOT NULL COMMENT '签名',
  `datetime` bigint(20) NOT NULL COMMENT '时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

#### 14. detect_list (检测规则表)

```sql
CREATE TABLE `detect_list` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` longtext NOT NULL COMMENT '名称',
  `text` longtext NOT NULL COMMENT '文本',
  `regex` longtext NOT NULL COMMENT '正则',
  `type` int(11) NOT NULL COMMENT '类型',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

#### 15. detect_log (检测日志表)

```sql
CREATE TABLE `detect_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT '用户 ID',
  `list_id` bigint(20) NOT NULL COMMENT '规则 ID',
  `node_id` int(11) NOT NULL COMMENT '节点 ID',
  `datetime` bigint(20) NOT NULL COMMENT '时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

#### 16. blockip (IP 黑名单表)

```sql
CREATE TABLE `blockip` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `nodeid` int(11) NOT NULL COMMENT '节点 ID',
  `ip` text NOT NULL COMMENT 'IP',
  `datetime` bigint(20) NOT NULL COMMENT '时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

#### 17. unblockip (IP 白名单表)

```sql
CREATE TABLE `unblockip` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `userid` bigint(20) NOT NULL COMMENT '用户 ID',
  `ip` text NOT NULL COMMENT 'IP',
  `datetime` bigint(20) NOT NULL COMMENT '时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

#### 18. link (订阅链接表)

```sql
CREATE TABLE `link` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `type` int(11) NOT NULL COMMENT '类型',
  `address` text NOT NULL COMMENT '地址',
  `port` int(11) NOT NULL COMMENT '端口',
  `token` text NOT NULL COMMENT 'Token',
  `ios` int(11) NOT NULL DEFAULT '0' COMMENT 'iOS',
  `userid` bigint(20) NOT NULL COMMENT '用户 ID',
  `isp` text COMMENT '运营商',
  `geo` int(11) DEFAULT NULL COMMENT '地区',
  `method` text COMMENT '加密方式',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

---

## 核心业务逻辑

### 1. 用户认证流程

#### 登录流程

```
1. 用户访问 /auth/login
2. 输入邮箱和密码
3. 前端调用 POST /auth/login
4. 后端验证:
   - 查询用户: User::where('email', $email)->first()
   - 验证密码: Hash::checkPassword($user->pass, $passwd)
   - 检查账户状态: $user->enable == 1
5. 创建 Session:
   $_SESSION['user_id'] = $user->id
6. 记录登录 IP: LoginIp::create([...])
7. 跳转到 /user
```

#### Session 验证流程

```
每次请求经过 Auth 中间件:

1. 从 Session 获取 user_id
2. 查询用户: User::find($user_id)
3. 检查用户是否登录:
   if (!$user->isLogin) {
       跳转到 /auth/login
   }
4. 检查账户状态:
   if ($user->enable == 0) {
       跳转到 /user/disable
   }
5. 继续执行 Controller
```

### 2. 流量统计机制

#### 节点上报流程

```
1. 节点定期上报流量:
   POST /api/ssn_sub/{node_id}
   {
       "data": [
           {
               "user_id": 123,
               "u": 1073741824,    // 上传 1 GB
               "d": 2147483648     // 下载 2 GB
           }
       ]
   }

2. 后端处理:
   foreach ($data as $traffic) {
       // 获取流量倍率
       $rate = $node->traffic_rate;

       // 计算实际流量
       $actual_u = $traffic['u'] * $rate;
       $actual_d = $traffic['d'] * $rate;

       // 更新用户流量
       $user->u += $actual_u;
       $user->d += $actual_d;
       $user->t = time();
       $user->save();

       // 检查是否超限
       $total = $user->u + $user->d;
       if ($total > $user->transfer_enable) {
           $user->enable = 0;
           $user->save();
       }

       // 记录日志
       TrafficLog::create([...]);
   }
```

#### 流量倍率计算

```php
// 示例: 用户在香港节点使用 1 GB 流量

// 节点配置
$node->traffic_rate = 0.5;  // 香港节点流量减半

// 实际消耗
$actual_traffic = $node_traffic * $node->traffic_rate;
$actual_traffic = 1 GB * 0.5 = 512 MB;

// 更新到用户账户
$user->d += $actual_traffic;
```

### 3. 订阅生成流程

#### 生成订阅链接

```php
// 文件: app/Controllers/LinkController.php

1. 生成订阅 Token:
   $token = md5($user->id . time() . Config::get('key'));

2. 存储 Token:
   Link::create([
       'userid' => $user->id,
       'token' => $token
   ]);

3. 返回订阅链接:
   $url = Config::get('baseUrl') . '/link/' . $token;
```

#### 获取订阅配置

```php
// 文件: app/Controllers/LinkController.php:GetContent()

1. 验证 Token:
   $link = Link::where('token', $token)->first();

2. 获取用户:
   $user = User::find($link->userid);

3. 获取可用节点:
   $nodes = Node::where('type', 1)
       ->where('node_class', '<=', $user->class)
       ->where(function($query) use ($user) {
           $query->where('node_group', $user->node_group)
                 ->orWhere('node_group', 0);
       })
       ->get();

4. 根据节点类型生成配置:
   // SS (sort = 0)
   $ss_url = "ss://{$method}:{$passwd}@{$server}:{$port}#{$name}";

   // SSR (sort = 1-9)
   $ssr_url = "ssr://{$server}:{$port}:{$protocol}:{$method}:{$obfs}:{$base64}";

   // VMess (sort = 11)
   $vmess = [
       'v' => '2',
       'ps' => $name,
       'add' => $server,
       'port' => $port,
       'id' => $user->v2ray_uuid,
       'aid' => 0
   ];
   $vmess_url = 'vmess://' . base64_encode(json_encode($vmess));

   // VLess (sort = 13)
   $vless_url = "vless://{$uuid}@{$server}:{$port}?encryption=none#{$name}";

   // Trojan (sort = 14)
   $trojan_url = "trojan://{$passwd}@{$server}:{$port}?#{$name}";

5. 拼接所有节点:
   $config = implode("\n", $urls);

6. 返回配置
```

### 4. 支付流程

#### 创建支付订单

```php
// 文件: app/Services/Payment.php:purchase()

1. 生成订单号:
   $trade_no = date('YmdHis') . rand(100000, 999999);

2. 创建订单:
   Paylist::create([
       'userid' => $user->id,
       'total' => $amount,
       'status' => 0,
       'tradeno' => $trade_no,
       'datetime' => time()
   ]);

3. 调用支付网关:
   switch ($gateway) {
       case 'alipay':
           return AliPay::createOrder($trade_no, $amount);
       case 'yft':
           return YftPay::createOrder($trade_no, $amount);
       case 'clonepay':
           return ClonePay::syncOrder($user->email, $amount);
   }

4. 返回支付 URL
```

#### 支付回调处理

```php
// 文件: app/Services/Payment.php:notify()

1. 验证签名:
   $sign = $_POST['sign'];
   $calc_sign = md5($params . $secret);
   if ($sign != $calc_sign) {
       return "fail";
   }

2. 查询订单:
   $order = Paylist::where('tradeno', $trade_no)->first();

3. 检查订单状态:
   if ($order->status == 1) {
       return "success";  // 避免重复处理
   }

4. 更新订单状态:
   $order->status = 1;
   $order->save();

5. 充值到账户:
   $user = User::find($order->userid);
   $user->money += $order->total;
   $user->save();

6. 处理返利:
   if ($user->ref_by != 0) {
       Payback::calculate($user->id, $order->total);
   }

7. 返回 "success"
```

### 5. 返利系统

#### 返利计算逻辑

```php
// 文件: app/Models/Payback.php

// 返利比例
$ref_fee = Config::get('ref_fee');  // 例如: 20%

// 计算返利
$payback_amount = $total * ($ref_fee / 100);

// 记录返利
Payback::create([
    'total' => $total,
    'userid' => $user_id,
    'ref_by' => $ref_user_id,
    'ref_get' => $payback_amount,
    'datetime' => time(),
    'callback' => 0  // 0=未收回
]);

// 增加邀请人余额
$ref_user = User::find($ref_user_id);
$ref_user->money += $payback_amount;
$ref_user->save();
```

#### 返利收回

```php
// 如果用户退款或违规，收回返利

1. 查询返利记录:
   $payback = Payback::where('userid', $user_id)->first();

2. 扣除邀请人余额:
   $ref_user = User::find($payback->ref_by);
   $ref_user->money -= $payback->ref_get;
   $ref_user->save();

3. 标记返利已收回:
   $payback->callback = 1;
   $payback->save();
```

### 6. 签到系统

#### 签到逻辑

```php
// 文件: app/Controllers/UserController.php:doCheckin()

1. 检查是否已签到:
   $last_checkin = $user->last_check_in_time;
   $today = date('Ymd');
   if (date('Ymd', $last_checkin) == $today) {
       return "今天已经签到过了";
   }

2. 计算奖励流量:
   $base_traffic = rand(50, 100);  // 50-100 MB
   $class_bonus = $user->class * 10;  // 每级 +10 MB
   $total_traffic = $base_traffic + $class_bonus;

3. 更新用户流量:
   $user->transfer_enable += Tools::toMB($total_traffic);
   $user->last_check_in_time = time();
   $user->save();

4. 记录签到日志:
   CheckInLog::create([
       'user_id' => $user->id,
       'traffic' => $total_traffic,
       'checkin_time' => time()
   ]);

5. 返回奖励
```

### 7. 节点健康检查

#### 心跳检测

```php
// 节点每 5 分钟上报一次

POST /mu/nodes/{id}/online_count
{
    "count": 123  // 在线人数
}

// 记录到数据库
NodeOnlineLog::create([
    'node_id' => $node_id,
    'online_user' => $count,
    'log_time' => time()
]);

// 判断节点是否在线
$is_online = NodeOnlineLog::where('node_id', $node_id)
    ->where('log_time', '>', time() - 3600)  // 1小时内
    ->exists();
```

#### 负载监控

```php
// 节点上报负载

POST /mu/nodes/{id}/info
{
    "load": "0.5,0.3,0.2",  // 1分钟, 5分钟, 15分钟
    "uptime": 86400         // 运行时间 (秒)
}

// 记录到数据库
NodeInfoLog::create([
    'node_id' => $node_id,
    'uptime' => $uptime,
    'load' => $load,
    'log_time' => time()
]);

// 获取最新负载
$latest_load = NodeInfoLog::where('node_id', $node_id)
    ->orderBy('id', 'desc')
    ->first();
```

#### 速度测试

```php
// 定时测试节点速度

Speedtest::create([
    'nodeid' => $node_id,
    'datetime' => time(),
    'telecomping' => "30ms",
    'telecomeupload' => "100 Mbps",
    'telecomedownload' => "200 Mbps",
    'unicomping' => "40ms",
    'unicomupload' => "80 Mbps",
    'unicomdownload' => "150 Mbps",
    'cmccping' => "50ms",
    'cmccupload' => "60 Mbps",
    'cmccdownload' => "120 Mbps"
]);

// 显示在节点列表
$node->getSpeedtest();
// 输出:
// 电信延迟：30ms 下载：100 Mbps 上传：200 Mbps
// 联通延迟：40ms 下载：80 Mbps 上传：150 Mbps
// 移动延迟：50ms 下载：60 Mbps 上传：120 Mbps
```

### 8. 违规检测系统

#### 检测规则

```php
// 管理员创建检测规则

DetectRule::create([
    'name' => '禁止访问百度',
    'text' => 'baidu.com',
    'regex' => 'baidu\\.com',
    'type' => 1  // 1=域名检测
]);

// 节点获取规则
GET /mod_mu/func/detect_rules

// 返回:
{
    "ret": 1,
    "msg": "ok",
    "data": [
        {
            "id": 1,
            "name": "禁止访问百度",
            "regex": "baidu\\.com",
            "type": 1
        }
    ]
}
```

#### 上报违规

```php
// 节点检测到用户访问违禁网站

POST /mod_mu/users/detectlog
{
    "data": [
        {
            "user_id": 123,
            "list_id': 1,
            "node_id": 1
        }
    ]
}

// 后端处理
foreach ($data as $log) {
    DetectLog::create([
        'user_id' => $log['user_id'],
        'list_id' => $log['list_id'],
        'node_id' => $log['node_id'],
        'datetime' => time()
    ]);

    // 检查是否需要封禁
    $count = DetectLog::where('user_id', $log['user_id'])
        ->where('datetime', '>', time() - 86400)
        ->count();

    if ($count > 3) {
        $user->enable = 0;
        $user->save();
    }
}
```

### 9. 节点克隆功能

#### 创建克隆节点

```php
// 克隆节点共享配置，但独立统计流量

1. 创建克隆节点:
   $source_node = Node::find($source_id);

   $clone_node = Node::create([
       'name' => $source_node->name . ' (克隆)',
       'server' => $source_node->server,
       'method' => $source_node->method,
       // ... 其他配置相同
       'is_clone' => $source_id  // 标记为克隆节点
   ]);

2. 用户可以生成不同 UUID:
   $user_1_uuid = $user->v2ray_uuid;
   $user_2_uuid = Uuid::uuid4()->toString();

3. 分别统计流量:
   $source_traffic = $source_node->node_bandwidth;
   $clone_traffic = $clone_node->node_bandwidth;
```

---

## 安全机制

### 1. 密码加密

```php
// 文件: app/Utils/Hash.php

// 注册时加密密码
public static function passwordHash($pwd) {
    return password_hash($pwd, PASSWORD_DEFAULT);
}

// 登录时验证密码
public static function checkPassword($hash, $pwd) {
    return password_verify($pwd, $hash);
}
```

### 2. 防止 SQL 注入

```php
// 使用 ORM 预编译语句

// 正确做法
User::where('email', $email)->first();

// 错误做法 (SQL 注入风险)
DB::select("SELECT * FROM user WHERE email = '$email'");
```

### 3. XSS 防护

```php
// 使用 AntiXSS 库过滤输出

use voku\helper\AntiXSS;

$antiXss = new AntiXSS();
$clean_html = $antiXss->xss_clean($user_input);
```

### 4. CSRF 防护

```php
// Slim 框架内置 CSRF 保护

// 在表单中添加 CSRF Token
<input type="hidden" name="csrf_token" value="<?= $csrf_token ?>">

// 验证 Token
if (!$csrf->validate()) {
    return "CSRF Token 验证失败";
}
```

### 5. 验证码

```php
// 支持多种验证码

// 1. reCAPTCHA
Config::get('recaptcha_sitekey');

// 2. 极验
$GtSdk = Geetest::get($uid);

// 3. 图片验证码
$captcha = new Captcha();
$captcha->generate();
```

### 6. IP 白名单

```php
// Mu 中间件验证节点 IP

$node = Node::where("node_ip", "LIKE", $_SERVER["REMOTE_ADDR"].'%')->first();

if ($node == null && $_SERVER["REMOTE_ADDR"] != '127.0.0.1') {
    return "token or source is invalid";
}
```

### 7. 流量限制

```php
// 每日流量限制

if ($user->u + $user->d > $user->transfer_limit) {
    $user->enable = 0;
    $user->save();
}

// 每日订阅次数限制

if ($user->rss_count > 100) {
    return "订阅次数过多";
}
```

### 8. 登录限制

```php
// 记录登录 IP

LoginIp::create([
    'userid' => $user->id,
    'ip' => $_SERVER['REMOTE_ADDR'],
    'datetime' => time(),
    'type' => 1  // 1=登录成功
]);

// 检查 IP 变化

$last_login_ip = LoginIp::where('userid', $user->id)
    ->orderBy('id', 'desc')
    ->first();

if ($last_login_ip->ip != $_SERVER['REMOTE_ADDR']) {
    // 发送安全警告邮件
}
```

---

## 特殊功能

### 1. 单端口多用户

```php
// sort = 9 的节点为单端口节点

// 节点配置
$mu_node = Node::where('sort', 9)->first();

// 用户端口就是节点服务器
$mu_user = User::where('port', $mu_node->server)->first();

// 每个用户有独立的 plugin 参数
$mu_user->protocol_param;  // 用于区分不同用户

// 订阅生成
foreach ($mu_nodes as $mu_node) {
    $mu_user = User::where('port', $mu_node->server)->first();
    $mu_user->obfs_param = $user->getMuMd5();  // 生成混淆参数

    // 添加到订阅
    array_push($nodes, $mu_user);
}
```

### 2. CN CDN 加速

```php
// 用户可以选择 CN CDN 入口

// CN CDN 表
CREATE TABLE `cncdn` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `area` varchar(128) NOT NULL COMMENT '地区',
    `areaid` varchar(128) NOT NULL COMMENT '地区编号',
    `server` varchar(64) NOT NULL COMMENT 'CDN 域名',
    `cdnip` varchar(64) NOT NULL COMMENT 'CDN IP',
    `ipmd5` varchar(64) NOT NULL COMMENT 'IP MD5',
    `host` varchar(64) NOT NULL COMMENT '解析域名',
    `show` int(11) NOT NULL DEFAULT '1',
    `status` int(11) NOT NULL DEFAULT '1',
    PRIMARY KEY (`id`)
);

// 用户选择 CN CDN
$user->cncdn = '电信';
$user->cncdn_count += 1;

// 生成订阅时替换节点服务器
if ($user->cncdn != '0') {
    $cncdn = Cncdn::where('area', $user->cncdn)->first();
    $node->server = $cncdn->server;
}
```

### 3. Cloudflare CDN

```php
// 用户可以选择 Cloudflare CDN IP

$user->cfcdn = '1.2.3.4';
$user->cfcdn_count += 1;

// 生成订阅时使用 CF IP
if ($user->cfcdn != '0') {
    $node->server = $user->cfcdn;
}
```

### 4. 订阅来源追踪

```php
// 记录订阅请求的 IP

$user->rss_ip = $_SERVER['REMOTE_ADDR'];
$user->rss_count += 1;

// 统计订阅来源 IP 数
$ips = explode(',', $user->rss_ips);
if (!in_array($_SERVER['REMOTE_ADDR'], $ips)) {
    $user->rss_ips_count += 1;
    $user->rss_ips .= $_SERVER['REMOTE_ADDR'] . ',';
}

// 分析订阅来源
if ($user->rss_ips_count > 5) {
    // 可能被分享给多人
    // 发送警告
    $user->warming = "检测到您的订阅被多个 IP 使用，请注意账户安全";
}
```

### 5. 自动重置流量

```php
// 每月自动重置流量

$user->auto_reset_day = 1;  // 每月 1 号重置
$user->auto_reset_bandwidth = 100;  // 重置到 100 GB

// 定时任务 (每天执行)
if (date('d') == $user->auto_reset_day) {
    $user->u = 0;
    $user->d = 0;
    $user->transfer_enable = Tools::toGB($user->auto_reset_bandwidth);
    $user->save();
}
```

### 6. 流量周期累加

```php
// 用户等级可以累加流量

$user->renew = 0.1;  // 累加 10%

// 每日重置时
$user->u = 0;
$user->d = 0;
$user->transfer_enable *= (1 + $user->renew);
$user->save();
```

### 7. 用户评分系统

```php
// 用户评分影响账户清理

$user->score = 100;

// 签到 +1 分
$user->score += 1;

// 违规 -10 分
$user->score -= 10;

// 自动清理低分用户
$users = User::where('score', '<', 50)
    ->where('reg_date', '<', date('Y-m-d', time() - 86400 * 30))
    ->get();

foreach ($users as $user) {
    $user->kill_user();
}
```

---

## 数据统计报表

### 1. 系统统计

```php
// 管理员首页统计

$total_user = User::count();
$enable_user = User::where('enable', 1)->count();
$today_traffic = TrafficLog::whereDate('log_time', today)->sum('u') +
                 TrafficLog::whereDate('log_time', today)->sum('d');
$total_money = Paylist::where('status', 1)->sum('total');
$online_user = Ip::where('datetime', '>', time() - 900)
    ->distinct('ip')
    ->count();
```

### 2. 用户统计

```php
// 单个用户统计

$used_traffic = $user->u + $user->d;
$used_percent = ($used_traffic / $user->transfer_enable) * 100;

$online_ip_count = $user->online_ip_count();
$last_checkin = $user->lastCheckInTime();
$last_use = $user->lastSsTime();
```

### 3. 节点统计

```php
// 单个节点统计

$online_user = $node->getOnlineUserCount();
$uptime = $node->getNodeUptime();
$load = $node->getNodeLoad();
$traffic = $node->getTrafficFromLogs();
$alive = $node->isNodeOnline();
```

### 4. 收入统计

```php
// 每日收入

$daily_income = Paylist::where('status', 1)
    ->whereDate('datetime', today)
    ->sum('total');

// 每月收入

$monthly_income = Paylist::where('status', 1)
    ->whereYear('datetime', date('Y'))
    ->whereMonth('datetime', date('m'))
    ->sum('total');
```

---

## 附录

### 1. 配置文件说明

```php
// config/.php

// 数据库配置
Config::get('db_host');
Config::get('db_user');
Config::get('db_pass');
Config::get('db_name');

// 系统配置
Config::get('appName');          // 网站名称
Config::get('baseUrl');          // 网站地址
Config::get('muKey');            // 节点通信密钥
Config::get('key');              // 加密密钥

// 支付配置
Config::get('paymentGateway');   // 支付网关
Config::get('alipay_id');        // 支付宝 ID
Config::get('alipay_key');       // 支付宝 Key

// 邮件配置
Config::get('mail_host');
Config::get('mail_user');
Config::get('mail_pass');

// 功能开关
Config::get('enable_checkin_captcha');   // 签到验证码
Config::get('enable_login_captcha');     // 登录验证码
Config::get('enable_donate');            // 捐赠功能
Config::get('enable_telegram');          // Telegram 登录

// 流量配置
Config::get('defaultTraffic');           // 默认流量 (GB)
Config::get('traffic_package');          // 流量包选项
Config::get('register_method');          // 注册加密方式
Config::get('register_node_group');      // 注册节点分组

// 返利配置
Config::get('ref_fee');                  // 返利比例 (%)
Config::get('invite_price');             // 邀请码价格
Config::get('enable_account_reset');     // 流量重置功能
Config::get('account_reset_money');      // 流量重置价格
Config::get('account_reset_traffic');    // 流量重置流量

// 签到配置
Config::get('checkinMin');               // 最小签到流量 (MB)
Config::get('checkinMax');               // 最大签到流量 (MB)
```

### 2. 常用工具函数

```php
// 文件: app/Utils/Tools.php

// 流量转换
Tools::toGB($traffic);         // 字节转 GB
Tools::toMB($traffic);         // 字节转 MB
Tools::flowAutoShow($traffic); // 自动显示流量

// 时间转换
Tools::toDateTime($timestamp); // 时间戳转日期
Tools::secondsToTime($seconds);// 秒转时间

// 随机生成
Tools::genRandomChar($length); // 生成随机字符串
Tools::genToken();             // 生成 Token
Tools::getAvailablePort();     // 获取可用端口

// IP 处理
Tools::getRealIp($ip);         // 获取真实 IP
Tools::isIpInRange($ip, $range);// 检查 IP 范围
```

### 3. 错误码说明

```json
{
    "ret": 0,      // 失败
    "ret": 1,      // 成功
    "msg": "错误信息"
}

// 常见错误码
"401 邮箱或者密码错误"
"402 邮箱或者密码错误"
"token is null"
"token is expire"
"key is null"
"token or source is invalid"
"余额不足"
"端口已被占用"
"邀请码不存在"
"今天已经签到过了"
```

### 4. 定时任务

```bash
# 每日流量重置
0 0 * * * php /path/to/panel/xcat dailyjob

# 每小时检查节点
0 * * * * php /path/to/panel/xcat checkjob

# 每月备份
0 0 1 * * php /path/to/panel/xcat backup

# 流量统计
*/5 * * * * php /path/to/panel/xcat statistics
```

---

## 总结

本文档详细记录了 SS-Panel Mod Uim 项目的所有 API 接口、数据库结构、业务逻辑和安全机制。主要包括:

1. **6 种认证中间件**: Auth, Admin, Guest, Api, Mu, Mod_Mu
2. **8 大功能模块**: 认证、用户、支付、管理、API、Mu、Mod_Mu、Vue
3. **15+ 核心数据表**: user, ss_node, user_traffic_log, bought, shop, coupon, paylist, payback, ticket, relay, code, announcement, auto, detect_list, detect_log
4. **9 大核心业务**: 认证、流量统计、订阅生成、支付、返利、签到、节点健康检查、违规检测、节点克隆
5. **8 项安全措施**: 密码加密、SQL 注入防护、XSS 防护、CSRF 防护、验证码、IP 白名单、流量限制、登录限制
6. **7 种特殊功能**: 单端口多用户、CN CDN、CF CDN、订阅追踪、自动重置流量、流量周期累加、用户评分

该文档可用于:
- 理解原系统架构和数据流向
- 重构为 FastAPI 项目的技术参考
- API 接口兼容性设计
- 数据库迁移和重构
- 功能扩展和优化

---

**文档版本**: v1.0
**生成日期**: 2025-01-26
**原始项目**: /var/www/test-spanel.freessr.bid
**分析工具**: Claude Code
