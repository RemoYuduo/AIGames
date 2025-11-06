# 架构设计文档 (AI2AI)

## 项目架构概述

本项目采用面向对象设计，数据驱动的开发方法，使用纯前端技术栈实现一个角色扮演生存类游戏。

## 核心架构设计

### 1. 系统分层架构

```
┌─────────────────────────────────────┐
│      Game (游戏主控制器)             │
├─────────────────────────────────────┤
│  InputSystem | RenderSystem         │
│  PhysicsSystem | CollisionSystem    │
│  WeaponSystem | SpawnSystem         │
├─────────────────────────────────────┤
│  Entity (实体基类)                   │
│  ├─ Character (角色基类)             │
│  │  ├─ Player (玩家)                │
│  │  └─ NPC (敌人/友军)              │
│  ├─ Weapon (武器基类)                │
│  │  ├─ Sword (剑)                   │
│  │  ├─ Bow (弓)                     │
│  │  └─ Lance (骑枪)                 │
│  ├─ Projectile (投射物)             │
│  └─ Coin (金币)                      │
└─────────────────────────────────────┘
```

### 2. 核心类设计

#### 2.1 Entity (实体基类)
所有游戏对象的基类，提供基础属性和方法：
- 属性：position, velocity, rotation, scale
- 方法：update(), render(), destroy()

#### 2.2 Character (角色基类)
继承自 Entity，所有角色的基类：
- 属性：
  - 物理：mass, radius, maxSpeed, acceleration
  - 状态：hp, facing, state (idle/moving/dead)
  - 视觉：bodyColor, headColor
- 方法：
  - applyForce(force) - 施加力（加速度）
  - takeDamage(damage, knockback) - 受伤和击退
  - updatePhysics() - 更新物理状态
  - checkCollision(other) - 碰撞检测

#### 2.3 Player (玩家角色)
继承自 Character：
- 属性：
  - weapon - 当前武器
  - coins - 金币数量
  - level - 等级
- 方法：
  - handleInput(input) - 处理输入
  - collectCoin(coin) - 拾取金币
  - equipWeapon(weapon) - 装备武器

#### 2.4 Weapon (武器基类)
- 属性：
  - owner - 持有者
  - damage - 伤害
  - cooldown - 冷却时间
  - attackState - 攻击状态
- 方法：
  - update() - 更新武器状态
  - render() - 渲染武器
  - attack() - 执行攻击
  - createHitbox() - 创建攻击框

### 3. 系统设计

#### 3.1 InputSystem (输入系统)
- 虚拟摇杆：触摸/鼠标控制
- 键盘输入：WASD 控制
- 输出：归一化的方向向量

#### 3.2 PhysicsSystem (物理系统)
- 速度和加速度计算
- 惯性模拟
- 碰撞推挤

#### 3.3 CollisionSystem (碰撞系统)
- 圆形碰撞检测
- 攻击框与受击框检测
- 碰撞响应（推挤）

#### 3.4 RenderSystem (渲染系统)
- Canvas 2D 渲染
- 分层渲染（地图 -> 建筑 -> 角色 -> 武器 -> UI）
- 相机跟随

#### 3.5 WeaponSystem (武器系统)
- 武器状态机管理
- 攻击判定
- 特效渲染（拖尾等）

#### 3.6 SpawnSystem (生成系统)
- NPC 生成逻辑
- 掉落物生成

### 4. 数据驱动设计

#### 4.1 配置数据
```javascript
const CONFIG = {
  player: {
    maxSpeed: 5,
    acceleration: 0.5,
    radius: 20,
    hp: 100
  },
  weapons: {
    sword: {
      damage: 30,
      cooldown: 2000,
      range: 60
    },
    // ...
  },
  npc: {
    infantry: { /* ... */ },
    archer: { /* ... */ },
    cavalry: { /* ... */ }
  }
};
```

#### 4.2 状态数据
游戏状态集中管理，便于保存和恢复

### 5. 渲染策略

- 使用 Canvas 2D Context
- 双缓冲渲染避免闪烁
- 相机系统实现视口跟随
- 分层渲染保证正确的深度关系

## 开发任务规划

### 迭代1：地图、建筑和主角的渲染和控制 ✅ (已完成)
**目标**：建立基础框架，实现主角的移动控制和渲染

#### 任务分解：
1. ✅ 创建项目基础结构
   - index.html - 游戏主页面，竖屏布局
   - game.js - 游戏主控制器和游戏循环
   - entities.js - 实体类（Entity, Character, Player）
   - systems.js - 系统类（InputSystem, Camera, RenderSystem）
   - config.js - 配置数据（数据驱动）
   - style.css - 样式（手机竖屏适配）

2. ✅ 实现核心类
   - Entity 基类 - 提供基础属性和方法
   - Character 基类 - 角色物理、状态、碰撞系统
   - Player 类 - 玩家特有逻辑和马头渲染

3. ✅ 实现输入系统
   - 虚拟摇杆 - 触摸时出现在点击位置
   - 键盘输入 - WASD/方向键支持
   - 输入归一化 - 统一输出归一化向量

4. ✅ 实现物理系统
   - 加速度和速度计算 - 基于力的运动模型
   - 惯性模拟 - 摩擦力和速度限制
   - 边界限制 - 限制在地图范围内
   - 碰撞推挤 - 角色间碰撞产生推挤效果

5. ✅ 实现渲染系统
   - Canvas 初始化 - 480x800 竖屏分辨率
   - 地图渲染 - 草地背景+网格
   - 建筑渲染 - 4个建筑（2友军2敌军）带窗户装饰
   - 角色渲染 - 几何体身体+马头图片
   - 相机跟随 - 平滑跟随玩家

6. ✅ 角色动画表现
   - 待机/移动状态切换 - 基于速度自动切换
   - 左右朝向 - 根据移动方向自动翻转
   - 马头摆动效果 - 移动时忍者奔跑风格摆动
   - 身体上下摆动 - 移动时的弹跳效果

### 迭代2：武器系统，建筑刷兵
**目标**：实现战斗系统核心功能

#### 任务分解：
1. 实现武器基类和剑武器
2. 实现攻击判定系统
3. 实现 NPC 基类
4. 实现建筑刷兵逻辑
5. 实现碰撞系统
6. 实现金币掉落和拾取

### 迭代3：完善敌人AI
**目标**：完善游戏玩法

#### 任务分解：
1. 实现弓和骑枪武器
2. 实现 NPC AI（寻路、攻击）
3. 实现升级系统
4. 完善视觉效果
5. 性能优化
6. 游戏平衡调整

## 技术要点

### 1. 避免 ES6 模块
- 所有代码通过 `<script>` 标签按顺序加载
- 使用全局对象组织代码

### 2. 性能优化
- 对象池复用
- 空间分区优化碰撞检测
- requestAnimationFrame 游戏循环

### 3. 移动端适配
- 竖屏布局
- 触摸事件处理
- 响应式 Canvas 尺寸

## 当前状态
- 迭代：1 ✅ 已完成
- 状态：等待下一步指令
- 已实现功能：
  - ✅ 完整的游戏框架（面向对象架构）
  - ✅ 地图渲染（草地+网格）
  - ✅ 建筑渲染（4个建筑带装饰）
  - ✅ 主角渲染（几何体+马头图片）
  - ✅ 输入控制（虚拟摇杆+键盘）
  - ✅ 物理系统（加速度、惯性、碰撞）
  - ✅ 相机跟随
  - ✅ 角色动画（移动状态、朝向、摆动）
- 下一步：迭代2 - 实现武器系统和建筑刷兵
