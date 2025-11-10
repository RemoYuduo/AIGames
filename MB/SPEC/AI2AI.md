# 角色扮演生存小游戏 - 架构说明

## 架构概述
本项目采用面向对象设计，使用纯前端技术栈（HTML5 Canvas + JavaScript）实现。遵循数据驱动设计，所有游戏参数可通过配置文件调整。

## 目录结构
```
MB/
├── index.html              # 游戏入口页面
├── css/
│   └── style.css          # 样式文件
├── js/
│   ├── main.js            # 游戏主循环和入口
│   ├── config/
│   │   └── ConfigManager.js    # 配置管理器
│   ├── core/
│   │   ├── Game.js             # 游戏核心类
│   │   ├── Scene.js            # 场景管理
│   │   ├── Camera.js           # 摄像机系统
│   │   └── Input.js            # 输入管理（摇杆+键盘）
│   ├── entity/
│   │   ├── Entity.js           # 实体基类
│   │   ├── Character.js        # 角色基类
│   │   ├── Player.js           # 玩家角色
│   │   ├── Enemy.js            # 敌人基类
│   │   ├── Infantry.js         # 步兵
│   │   ├── Cavalry.js          # 骑兵
│   │   └── Archer.js           # 弓兵
│   ├── weapon/
│   │   ├── Weapon.js           # 武器基类
│   │   ├── Sword.js            # 剑
│   │   ├── Bow.js              # 弓
│   │   ├── Lance.js            # 骑枪
│   │   └── Arrow.js            # 箭矢
│   ├── component/
│   │   ├── Transform.js        # 变换组件（位置、旋转、缩放）
│   │   ├── Physics.js          # 物理组件（速度、加速度、质量）
│   │   ├── Collider.js         # 碰撞器组件
│   │   ├── Renderer.js         # 渲染组件
│   │   ├── Mount.js            # 骑乘组件
│   │   └── AI.js               # AI组件
│   ├── system/
│   │   ├── CollisionSystem.js  # 碰撞系统
│   │   ├── CombatSystem.js     # 战斗判定系统
│   │   ├── RenderSystem.js     # 渲染系统
│   │   ├── PhysicsSystem.js    # 物理系统
│   │   └── AISystem.js         # AI系统
│   ├── ui/
│   │   ├── Joystick.js         # 虚拟摇杆
│   │   ├── HUD.js              # 抬头显示
│   │   └── UpgradePanel.js     # 升级面板
│   ├── map/
│   │   ├── BattleMap.js        # 战斗地图
│   │   └── Building.js         # 建筑物
│   └── util/
│       ├── Vector2.js          # 二维向量工具
│       └── MathUtil.js         # 数学工具函数
├── config/
│   ├── game.json              # 游戏基础配置
│   ├── character.json         # 角色配置
│   ├── weapon.json            # 武器配置
│   └── map.json               # 地图配置
├── res/                       # 美术资源
└── SPEC/                      # 设计文档
```

## 核心模块说明

### 1. 配置系统 (ConfigManager)
**职责**: 统一管理所有配置文件的加载和访问
**接口**:
- `loadConfig(configName)`: 加载指定配置文件
- `getConfig(path)`: 获取配置项，支持路径访问如 "character.player.size"

### 2. 游戏核心 (Game)
**职责**: 游戏主循环、状态管理、系统协调
**接口**:
- `init()`: 初始化游戏
- `update(deltaTime)`: 更新游戏逻辑
- `render()`: 渲染游戏画面
- `start()`: 启动游戏循环
- `pause()`: 暂停游戏
- `resume()`: 恢复游戏

### 3. 场景管理 (Scene)
**职责**: 管理场景中的所有实体
**接口**:
- `addEntity(entity)`: 添加实体到场景
- `removeEntity(entity)`: 从场景移除实体
- `getEntitiesByType(type)`: 按类型获取实体
- `update(deltaTime)`: 更新所有实体
- `render(camera)`: 渲染所有实体

### 4. 摄像机系统 (Camera)
**职责**: 管理视图变换，跟随玩家
**接口**:
- `follow(target)`: 设置跟随目标
- `update(deltaTime)`: 更新摄像机位置
- `worldToScreen(worldPos)`: 世界坐标转屏幕坐标
- `screenToWorld(screenPos)`: 屏幕坐标转世界坐标
- `getViewBounds()`: 获取可视范围

### 5. 输入管理 (Input)
**职责**: 处理摇杆和键盘输入
**接口**:
- `getDirection()`: 获取输入方向向量（归一化）
- `isPressed(key)`: 检查按键是否按下
- `getJoystickPosition()`: 获取摇杆位置
- `update()`: 更新输入状态

### 6. 实体系统 (Entity/Character)
**职责**: 所有游戏对象的基类，使用组件模式
**Entity 接口**:
- `addComponent(component)`: 添加组件
- `getComponent(type)`: 获取组件
- `update(deltaTime)`: 更新实体
- `render(context, camera)`: 渲染实体

**Character 接口** (继承 Entity):
- `takeDamage(damage, knockback)`: 受到伤害
- `die()`: 死亡处理
- `move(acceleration)`: 施加移动加速度
- `attack()`: 触发攻击

### 7. 物理系统 (PhysicsSystem)
**职责**: 处理速度、加速度、惯性
**接口**:
- `update(entities, deltaTime)`: 更新所有物理实体
- `applyForce(entity, force)`: 对实体施加力
- `applyImpulse(entity, impulse)`: 对实体施加冲量

### 8. 碰撞系统 (CollisionSystem)
**职责**: 圆形碰撞检测和推挤处理
**接口**:
- `update(entities)`: 更新碰撞检测
- `checkCollision(entity1, entity2)`: 检测两实体碰撞
- `resolveCollision(entity1, entity2)`: 处理碰撞响应（推挤）

### 9. 战斗系统 (CombatSystem)
**职责**: 攻击框和受击框的碰撞判定
**接口**:
- `createHitbox(weapon, attackData)`: 创建攻击框
- `update(hitboxes, entities)`: 更新攻击判定
- `applyDamage(attacker, target, attackData)`: 应用伤害效果

**攻击数据结构**:
```javascript
{
  damage: number,        // 伤害值
  knockback: Vector2,    // 击退向量
  maxTargets: number     // 最大攻击目标数
}
```

### 10. 渲染系统 (RenderSystem)
**职责**: 管理渲染顺序和层级
**渲染层级** (从后到前):
1. 地图背景
2. 网格
3. 武器（在角色后面的）
4. 坐骑
5. 角色身体
6. 角色头部
7. 武器（在角色前面的）
8. 特效（拖尾、箭矢）
9. UI层

**接口**:
- `render(scene, camera, context)`: 渲染整个场景
- `renderEntity(entity, context, camera)`: 渲染单个实体

### 11. AI系统 (AISystem)
**职责**: 管理NPC行为逻辑
**接口**:
- `update(entities, deltaTime)`: 更新所有AI实体
- `findTarget(entity, enemies)`: 查找目标
- `updateBehavior(entity, target)`: 更新行为状态

**AI行为状态**:
- IDLE: 待机
- MOVE_TO_TARGET: 移动到目标
- KEEP_DISTANCE: 保持距离
- ATTACK: 攻击
- CHARGE: 冲锋

### 12. 武器系统
所有武器继承 Weapon 基类

**Weapon 基类接口**:
- `update(deltaTime, owner)`: 更新武器状态
- `render(context, camera)`: 渲染武器
- `attack(target)`: 触发攻击
- `canAttack()`: 是否可以攻击（冷却检查）

**Sword (剑)**:
- 攻击状态: IDLE, RAISE, SLASH, RECOVER
- 攻击动画: 旋转+缩放+位移
- 拖尾特效

**Bow (弓)**:
- 始终指向目标
- 发射箭矢实体
- 平滑旋转

**Lance (骑枪)**:
- 冲刺检测（基于角色速度）
- 状态: IDLE, READY, CHARGING, COOLDOWN
- 高伤害判定

### 13. 骑乘系统 (Mount)
**职责**: 管理骑乘状态和属性修改
**接口**:
- `mount(horse)`: 上马
- `dismount()`: 下马
- `getModifiedStats()`: 获取骑乘后的属性
- `render(context, camera)`: 渲染坐骑

### 14. UI系统
**Joystick (虚拟摇杆)**:
- `onTouchStart(position)`: 在触摸位置显示摇杆
- `onTouchMove(position)`: 更新摇杆方向
- `onTouchEnd()`: 隐藏摇杆
- `getDirection()`: 获取方向向量

**HUD (抬头显示)**:
- 显示金币计数
- 显示生命值
- 绘制在屏幕固定位置

**UpgradePanel (升级面板)**:
- `show(options)`: 显示升级选项
- `onSelect(callback)`: 选择回调
- 暂停游戏

## 数据流

### 游戏循环
```
Game.update(deltaTime)
  ├── Input.update()                    // 更新输入
  ├── Scene.update(deltaTime)           // 更新场景
  │     ├── Entity.update()             // 更新实体
  │     ├── AISystem.update()           // 更新AI
  │     ├── PhysicsSystem.update()      // 更新物理
  │     ├── CollisionSystem.update()    // 碰撞检测
  │     └── CombatSystem.update()       // 战斗判定
  ├── Camera.update(deltaTime)          // 更新摄像机
  └── Game.render()                     // 渲染
        └── RenderSystem.render()
```

### 移动控制流程
```
Input (摇杆/键盘) 
  → 获取方向向量 
  → Player.move(acceleration) 
  → PhysicsComponent.applyAcceleration() 
  → PhysicsSystem.update() 
  → Transform.position 更新
```

### 攻击判定流程
```
Weapon.attack() 
  → CombatSystem.createHitbox(attackData) 
  → CombatSystem.update() 检测碰撞 
  → Character.takeDamage() 
  → 击退效果 + 伤害数值
```

## 坐标系统
- **世界坐标**: 以米为单位，原点在地图左上角
- **屏幕坐标**: 以像素为单位，原点在canvas左上角
- **转换比例**: 30像素 = 1米
- **地图尺寸**: 150米宽 × 30米高 = 4500像素 × 900像素
- **画布尺寸**: 1334像素宽 × 750像素高（手机横屏）

## 配置文件格式

### game.json
```json
{
  "canvas": {
    "width": 1334,
    "height": 750
  },
  "world": {
    "pixelsPerMeter": 30,
    "mapWidth": 150,
    "mapHeight": 30
  },
  "spawn": {
    "interval": 10,
    "infantry": 4,
    "archer": 2,
    "cavalry": 1
  }
}
```

### character.json
```json
{
  "player": {
    "size": 2.0,
    "maxSpeed": 8,
    "acceleration": 20,
    "mass": 80
  },
  "infantry": {
    "size": 1.5,
    "maxSpeed": 3,
    "acceleration": 15,
    "mass": 70
  },
  "cavalry": {
    "size": 1.5,
    "maxSpeed": 10,
    "acceleration": 12,
    "mass": 150
  },
  "archer": {
    "size": 1.5,
    "maxSpeed": 2.5,
    "acceleration": 18,
    "mass": 60
  }
}
```

### weapon.json
```json
{
  "sword": {
    "damage": 50,
    "knockback": 2,
    "cooldown": 2.0,
    "attackDuration": 0.5,
    "maxTargets": 3
  },
  "bow": {
    "damage": 30,
    "cooldown": 2.0,
    "arrowSpeed": 15,
    "range": 20,
    "maxTargets": 1
  },
  "lance": {
    "damage": 150,
    "knockback": 5,
    "cooldown": 1.0,
    "speedThreshold": 0.7,
    "maxTargets": 5
  }
}
```

## 技术约束
1. **纯前端**: 不使用ES6模块，所有JS通过script标签按顺序加载
2. **Canvas渲染**: 使用2D Context API
3. **资源加载**: 图片通过Image对象预加载
4. **配置加载**: 使用XMLHttpRequest或fetch加载JSON
5. **兼容性**: 支持现代浏览器，使用requestAnimationFrame

## 性能考虑
1. 对象池: 复用箭矢、特效等频繁创建销毁的对象
2. 碰撞优化: 使用空间分区（简单的网格划分）减少检测次数
3. 渲染优化: 只渲染摄像机可视范围内的实体
4. 避免频繁GC: 减少临时对象创建，复用Vector2等对象

## 开发注意事项
1. 所有实体使用组件模式，保持高内聚低耦合
2. 系统之间通过Scene统一访问实体，避免直接引用
3. 配置驱动：移动速度、伤害值等参数都从配置读取
4. 资源路径统一管理，便于后期替换资源
5. 时间使用deltaTime保证不同帧率下逻辑一致
6. 坐标转换统一通过Camera处理
