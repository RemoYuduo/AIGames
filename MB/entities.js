// ============================================
// Entity - 实体基类
// ============================================
function Entity(x, y) {
    this.position = { x: x, y: y };
    this.velocity = { x: 0, y: 0 };
    this.rotation = 0;
    this.scale = 1;
    this.alive = true;
}

Entity.prototype.update = function(deltaTime) {
    // 子类实现
};

Entity.prototype.render = function(ctx, camera) {
    // 子类实现
};

Entity.prototype.destroy = function() {
    this.alive = false;
};

// ============================================
// Character - 角色基类
// ============================================
function Character(x, y, config) {
    Entity.call(this, x, y);
    
    // 物理属性
    this.maxSpeed = config.maxSpeed || 5;
    this.acceleration = config.acceleration || 0.5;
    this.friction = config.friction || 0.92;
    this.radius = config.radius || 20;
    this.mass = config.mass || 1;
    
    // 状态属性
    this.hp = config.hp || 100;
    this.maxHp = this.hp;
    this.facing = 1; // 1: 右, -1: 左
    this.state = 'idle'; // idle, moving, dead
    
    // 视觉属性
    this.bodyColor = config.bodyColor || '#4a4a4a';
    this.headColor = config.headColor || '#6a6a6a';
    
    // 动画属性
    this.animationTime = 0;
    this.deathTime = 0;
}

Character.prototype = Object.create(Entity.prototype);
Character.prototype.constructor = Character;

// 施加力（加速度）
Character.prototype.applyForce = function(forceX, forceY) {
    this.velocity.x += forceX;
    this.velocity.y += forceY;
};

// 受伤和击退
Character.prototype.takeDamage = function(damage, knockbackX, knockbackY) {
    this.hp -= damage;
    this.velocity.x += knockbackX;
    this.velocity.y += knockbackY;
    
    if (this.hp <= 0) {
        this.hp = 0;
        this.state = 'dead';
        this.deathTime = 0;
    }
};

// 更新物理状态
Character.prototype.updatePhysics = function(deltaTime) {
    if (this.state === 'dead') {
        this.deathTime += deltaTime;
        // 死亡动画持续1.5秒
        if (this.deathTime >= 1.5) {
            this.destroy();
        }
        // 死亡时继续应用摩擦力
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
    } else {
        // 应用摩擦力
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        
        // 限制最大速度
        var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > this.maxSpeed) {
            this.velocity.x = (this.velocity.x / speed) * this.maxSpeed;
            this.velocity.y = (this.velocity.y / speed) * this.maxSpeed;
        }
        
        // 更新状态
        if (speed > 0.5) {
            this.state = 'moving';
        } else {
            this.state = 'idle';
        }
        
        // 更新朝向
        if (Math.abs(this.velocity.x) > 0.1) {
            this.facing = this.velocity.x > 0 ? 1 : -1;
        }
    }
    
    // 更新位置
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    
    // 更新动画时间
    this.animationTime += deltaTime;
};

// 碰撞检测
Character.prototype.checkCollision = function(other) {
    var dx = other.position.x - this.position.x;
    var dy = other.position.y - this.position.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    var minDistance = this.radius + other.radius;
    
    return distance < minDistance;
};

// 碰撞推挤
Character.prototype.resolveCollision = function(other, pushStrength) {
    var dx = other.position.x - this.position.x;
    var dy = other.position.y - this.position.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    var minDistance = this.radius + other.radius;
    
    if (distance < minDistance && distance > 0) {
        var overlap = minDistance - distance;
        var nx = dx / distance;
        var ny = dy / distance;
        
        // 根据质量分配推挤
        var totalMass = this.mass + other.mass;
        var pushThis = (other.mass / totalMass) * overlap * pushStrength;
        var pushOther = (this.mass / totalMass) * overlap * pushStrength;
        
        this.position.x -= nx * pushThis;
        this.position.y -= ny * pushThis;
        other.position.x += nx * pushOther;
        other.position.y += ny * pushOther;
    }
};

// 渲染角色
Character.prototype.render = function(ctx, camera) {
    var screenX = this.position.x - camera.x;
    var screenY = this.position.y - camera.y;
    
    // 死亡闪烁效果
    if (this.state === 'dead') {
        var blinkSpeed = 10;
        if (Math.floor(this.deathTime * blinkSpeed) % 2 === 0) {
            return; // 闪烁时不渲染
        }
    }
    
    ctx.save();
    ctx.translate(screenX, screenY);
    
    // 根据朝向翻转
    if (this.facing < 0) {
        ctx.scale(-1, 1);
    }
    
    // 移动动画：忍者奔跑风格的上下摆动
    var bobOffset = 0;
    var bodyTilt = 0;
    var legOffset = 0;
    
    if (this.state === 'moving') {
        // 快速的上下摆动
        bobOffset = Math.sin(this.animationTime * 0.02) * 5;
        // 身体前倾
        bodyTilt = 0.15;
        // 腿部摆动
        legOffset = Math.sin(this.animationTime * 0.02) * this.radius * 0.3;
    }
    
    // 绘制腿部（两个小椭圆）
    ctx.fillStyle = this.bodyColor;
    ctx.globalAlpha = 0.8;
    
    // 左腿
    ctx.save();
    ctx.translate(-this.radius * 0.2, this.radius * 0.4 + bobOffset);
    ctx.rotate(legOffset * 0.5);
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius * 0.25, this.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // 右腿
    ctx.save();
    ctx.translate(this.radius * 0.2, this.radius * 0.4 + bobOffset);
    ctx.rotate(-legOffset * 0.5);
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius * 0.25, this.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    ctx.globalAlpha = 1.0;
    
    // 绘制身体（椭圆，带倾斜）
    ctx.save();
    ctx.translate(0, bobOffset);
    ctx.rotate(bodyTilt);
    
    ctx.fillStyle = this.bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius * 0.7, this.radius * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 身体描边
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
    
    // 绘制头部（圆形）
    var headY = -this.radius * 0.6 + bobOffset * 0.7;
    ctx.fillStyle = this.headColor;
    ctx.beginPath();
    ctx.arc(0, headY, this.radius * 0.45, 0, Math.PI * 2);
    ctx.fill();
    
    // 头部描边
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
};

// ============================================
// Player - 玩家角色
// ============================================
function Player(x, y) {
    Character.call(this, x, y, CONFIG.player);
    
    this.weapon = null;
    this.coins = 0;
    this.level = 1;
    
    // 加载马头图片
    this.horseHeadImage = new Image();
    this.horseHeadImage.src = 'res/horseHead.png';
    this.horseHeadLoaded = false;
    
    var self = this;
    this.horseHeadImage.onload = function() {
        self.horseHeadLoaded = true;
    };
}

Player.prototype = Object.create(Character.prototype);
Player.prototype.constructor = Player;

// 处理输入
Player.prototype.handleInput = function(inputX, inputY) {
    if (this.state === 'dead') return;
    
    // 施加加速度
    this.applyForce(inputX * this.acceleration, inputY * this.acceleration);
};

// 拾取金币
Player.prototype.collectCoin = function(coin) {
    this.coins++;
    coin.destroy();
};

// 更新
Player.prototype.update = function(deltaTime) {
    this.updatePhysics(deltaTime);
    
    // 限制在地图范围内
    var mapConfig = CONFIG.map;
    this.position.x = Math.max(this.radius, Math.min(mapConfig.width - this.radius, this.position.x));
    this.position.y = Math.max(this.radius, Math.min(mapConfig.height - this.radius, this.position.y));
};

// 渲染玩家
Player.prototype.render = function(ctx, camera) {
    var screenX = this.position.x - camera.x;
    var screenY = this.position.y - camera.y;
    
    // 死亡闪烁效果
    if (this.state === 'dead') {
        var blinkSpeed = 10;
        if (Math.floor(this.deathTime * blinkSpeed) % 2 === 0) {
            return;
        }
    }
    
    ctx.save();
    ctx.translate(screenX, screenY);
    
    // 根据朝向翻转
    if (this.facing < 0) {
        ctx.scale(-1, 1);
    }
    
    // 移动动画：忍者奔跑风格
    var bobOffset = 0;
    var bodyTilt = 0;
    var legOffset = 0;
    var headBobOffset = 0;
    
    if (this.state === 'moving') {
        // 快速的上下摆动
        bobOffset = Math.sin(this.animationTime * 0.02) * 5;
        // 身体前倾
        bodyTilt = 0.2;
        // 腿部摆动
        legOffset = Math.sin(this.animationTime * 0.02) * this.radius * 0.3;
        // 头部独立摆动
        headBobOffset = Math.sin(this.animationTime * 0.018 + Math.PI / 3) * 3;
    }
    
    // 绘制腿部（两个小椭圆）
    ctx.fillStyle = this.bodyColor;
    ctx.globalAlpha = 0.8;
    
    // 左腿
    ctx.save();
    ctx.translate(-this.radius * 0.2, this.radius * 0.4 + bobOffset);
    ctx.rotate(legOffset * 0.5);
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius * 0.25, this.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // 右腿
    ctx.save();
    ctx.translate(this.radius * 0.2, this.radius * 0.4 + bobOffset);
    ctx.rotate(-legOffset * 0.5);
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius * 0.25, this.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    ctx.globalAlpha = 1.0;
    
    // 绘制身体（椭圆，带倾斜）
    ctx.save();
    ctx.translate(0, bobOffset);
    ctx.rotate(bodyTilt);
    
    ctx.fillStyle = this.bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius * 0.7, this.radius * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 身体描边
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
    
    // 绘制头部（圆形）
    var headY = -this.radius * 0.6 + bobOffset * 0.7 + headBobOffset;
    ctx.fillStyle = this.headColor;
    ctx.beginPath();
    ctx.arc(0, headY, this.radius * 0.45, 0, Math.PI * 2);
    ctx.fill();
    
    // 头部描边
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 绘制马头图片（营造骑马效果 - 马头在角色前下方）
    if (this.horseHeadLoaded) {
        var headSize = this.radius * 1.3;
        // 马头在角色前方偏下，营造骑马的感觉
        var headX = this.radius * 0.6;  // 前方
        var headYPos = this.radius * 0.2 + bobOffset * 0.8;  // 身体下方偏前
        
        // 马头摆动（奔跑时上下摆动）
        var headSwing = 0;
        var horseHeadBob = 0;
        if (this.state === 'moving') {
            headSwing = Math.sin(this.animationTime * 0.018) * 0.1;
            horseHeadBob = Math.sin(this.animationTime * 0.02 + Math.PI / 6) * 4;
        }
        
        ctx.save();
        ctx.translate(headX, headYPos + horseHeadBob);
        ctx.rotate(headSwing);
        // 马头在角色身体前方，营造骑马效果
        ctx.drawImage(this.horseHeadImage, -headSize / 2, -headSize / 2, headSize, headSize);
        ctx.restore();
    }
    
    ctx.restore();
};
