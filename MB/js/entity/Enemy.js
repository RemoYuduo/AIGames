// 敌人基类
class Enemy extends Entity {
  constructor(x, y, config, team) {
    super(x, y);
    this.type = 'enemy';
    this.team = team || 'enemy'; // 队伍标识
    this.config = config;
    
    // 添加物理组件
    this.physics = this.addComponent('physics', new Physics({
      maxSpeed: config.maxSpeed,
      acceleration: config.acceleration,
      mass: config.mass
    }));

    // 添加碰撞组件
    this.radius = config.size / 2;
    this.collider = this.addComponent('collider', new Collider(this.radius, config.mass));

    // 渲染颜色（敌人用红色系）
    this.bodyColor = '#e74c3c';
    this.headColor = '#c0392b';

    // 面向方向
    this.facingDirection = -1; // 敌人初始面向左边

    // 移动状态
    this.isMoving = false;

    // 动画参数
    this.animationTime = 0;
    this.bodyBobPhase = 0;
    this.headBobPhase = 0.5;
    this.leanAngle = 0;

    // 生命值
    this.health = config.health || 100;
    this.maxHealth = this.health;
    this.alive = true;
  }

  // 移动
  move(direction) {
    if (direction.length() > 0) {
      this.physics.applyAcceleration(direction);
      this.isMoving = true;
      
      // 更新面向方向
      if (Math.abs(direction.x) > 0.1) {
        this.facingDirection = direction.x > 0 ? 1 : -1;
      }
    } else {
      this.isMoving = false;
    }
  }

  // 受到伤害
  takeDamage(damage) {
    this.health -= damage;
    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }
  }

  // 死亡
  die() {
    this.alive = false;
    this.active = false;
  }

  // 更新
  update(deltaTime) {
    if (!this.alive) return;

    // 更新物理
    const velocity = this.physics.update(deltaTime);
    this.transform.translate(velocity.x * deltaTime, velocity.y * deltaTime);

    // 更新动画
    if (this.isMoving) {
      this.animationTime += deltaTime * 10;
      
      const speedRatio = this.physics.getSpeedRatio();
      const targetLean = speedRatio * 0.15 * this.facingDirection;
      this.leanAngle = MathUtil.lerp(this.leanAngle, targetLean, deltaTime * 5);
    } else {
      this.animationTime = 0;
      this.leanAngle = MathUtil.lerp(this.leanAngle, 0, deltaTime * 8);
    }
  }

  // 渲染
  render(context, camera) {
    if (!this.alive) return;

    const screenPos = camera.worldToScreen(this.transform.position);
    const screenRadius = camera.worldToScreenDistance(this.radius);

    // 动画偏移
    let bodyBobOffset = 0;
    let headBobOffset = 0;
    let bodySquash = 1.0;
    let bodyStretch = 1.0;
    
    if (this.isMoving) {
      bodyBobOffset = Math.sin(this.animationTime + this.bodyBobPhase) * screenRadius * 0.15;
      headBobOffset = Math.sin(this.animationTime + this.headBobPhase) * screenRadius * 0.25;
      
      const bouncePhase = Math.abs(Math.sin(this.animationTime));
      bodySquash = 1.0 + bouncePhase * 0.1;
      bodyStretch = 1.0 - bouncePhase * 0.1;
    }

    context.save();
    context.translate(screenPos.x, screenPos.y);
    
    if (this.leanAngle !== 0) {
      context.rotate(this.leanAngle);
    }

    // 绘制身体
    context.fillStyle = this.bodyColor;
    context.beginPath();
    context.ellipse(
      0, 
      bodyBobOffset, 
      screenRadius * 0.7 * bodySquash,
      screenRadius * 0.7 * bodyStretch,
      0,
      0, 
      Math.PI * 2
    );
    context.fill();

    context.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    context.lineWidth = 2;
    context.stroke();

    // 绘制头部
    const headX = this.facingDirection * screenRadius * 0.15;
    const headY = -screenRadius * 0.6 + headBobOffset;
    
    context.fillStyle = this.headColor;
    context.beginPath();
    context.arc(headX, headY, screenRadius * 0.45, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    context.lineWidth = 2;
    context.stroke();

    // 绘制眼睛
    context.fillStyle = '#ffffff';
    context.beginPath();
    context.arc(
      headX + this.facingDirection * screenRadius * 0.15, 
      headY - screenRadius * 0.05, 
      screenRadius * 0.08, 
      0, 
      Math.PI * 2
    );
    context.fill();
    
    context.fillStyle = '#000000';
    context.beginPath();
    context.arc(
      headX + this.facingDirection * screenRadius * 0.18, 
      headY - screenRadius * 0.05, 
      screenRadius * 0.04, 
      0, 
      Math.PI * 2
    );
    context.fill();

    context.restore();

    // 绘制生命值条
    this.renderHealthBar(context, screenPos, screenRadius);

    // 调试：绘制碰撞圆
    if (window.DEBUG) {
      context.strokeStyle = '#ff0000';
      context.lineWidth = 1;
      context.beginPath();
      context.arc(screenPos.x, screenPos.y, screenRadius, 0, Math.PI * 2);
      context.stroke();
    }
  }

  // 渲染生命值条
  renderHealthBar(context, screenPos, screenRadius) {
    const barWidth = screenRadius * 2;
    const barHeight = 4;
    const barY = screenPos.y - screenRadius * 1.3;

    // 背景
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.fillRect(screenPos.x - barWidth / 2, barY, barWidth, barHeight);

    // 生命值
    const healthRatio = this.health / this.maxHealth;
    context.fillStyle = healthRatio > 0.5 ? '#2ecc71' : (healthRatio > 0.25 ? '#f39c12' : '#e74c3c');
    context.fillRect(screenPos.x - barWidth / 2, barY, barWidth * healthRatio, barHeight);
  }
}
