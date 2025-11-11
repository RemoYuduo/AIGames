// AI组件
class AI {
  constructor(config) {
    this.enabled = true;
    
    // AI行为类型: melee(近战), ranged(远程), cavalry(骑兵)
    this.behaviorType = config.behaviorType || 'melee';
    
    // 目标相关
    this.target = null;
    this.targetRefreshInterval = config.targetRefreshInterval || 3;
    this.targetRefreshTimer = 0;
    
    // 行为参数
    this.attackRange = config.attackRange || 2;
    this.chaseDistance = config.chaseDistance || 30;
    this.keepDistance = config.keepDistance || 0; // 保持距离（弓兵使用）
    
    // 状态
    this.state = 'IDLE';
    
    // 骑兵特有参数
    this.chargeTimer = 0;
    this.chargeCooldown = config.chargeCooldown || 3;
    this.isCharging = false;
    this.chargePhase = 'APPROACH'; // APPROACH(接近), RETREAT(后退), COOLDOWN(冷却)
    this.retreatDistance = config.retreatDistance || 15; // 后退距离
    this.chargeStartPos = null; // 记录开始冲锋的位置
  }
  
  // 查找目标
  findTarget(owner, entities) {
    let nearestEnemy = null;
    let nearestDistance = Infinity;
    
    const ownerPos = owner.transform.position;
    const enemyTeam = owner.team === 'player' ? 'enemy' : 'player';
    
    for (const entity of entities) {
      if (entity.team === enemyTeam && entity.alive && entity.active) {
        const distance = ownerPos.distance(entity.transform.position);
        
        // 只追击在追击距离内的目标
        if (distance < this.chaseDistance && distance < nearestDistance) {
          nearestDistance = distance;
          nearestEnemy = entity;
        }
      }
    }
    
    return nearestEnemy;
  }
  
  // 更新AI行为
  update(owner, entities, deltaTime) {
    if (!this.enabled) return;
    
    // 定期刷新目标
    this.targetRefreshTimer += deltaTime;
    if (this.targetRefreshTimer >= this.targetRefreshInterval) {
      this.target = this.findTarget(owner, entities);
      this.targetRefreshTimer = 0;
    }
    
    // 如果目标不存在或已死亡，尝试重新查找
    if (!this.target || !this.target.alive || !this.target.active) {
      this.target = this.findTarget(owner, entities);
    }
    
    // 根据行为类型执行不同的行为
    switch (this.behaviorType) {
      case 'melee':
        this.meleeBehavior(owner, deltaTime);
        break;
      case 'ranged':
        this.rangedBehavior(owner, deltaTime);
        break;
      case 'cavalry':
        this.cavalryBehavior(owner, deltaTime);
        break;
    }
  }
  
  // 近战行为（步兵）
  meleeBehavior(owner, deltaTime) {
    if (!this.target) {
      this.state = 'IDLE';
      owner.isMoving = false;
      return;
    }
    
    const ownerPos = owner.transform.position;
    const targetPos = this.target.transform.position;
    const distance = ownerPos.distance(targetPos);
    
    if (distance > this.attackRange) {
      // 靠近目标
      this.state = 'MOVE_TO_TARGET';
      const direction = Vector2.sub(targetPos, ownerPos).normalize();
      owner.move(direction);
    } else {
      // 在攻击范围内
      this.state = 'ATTACK';
      owner.isMoving = false;
      
      // 触发攻击
      if (owner.weapons && owner.weapons.length > 0) {
        const direction = targetPos.x > ownerPos.x ? 1 : -1;
        owner.facingDirection = direction;
        
        for (const weapon of owner.weapons) {
          if (weapon.canAttack()) {
            weapon.attack(direction);
            break;
          }
        }
      }
    }
  }
  
  // 远程行为（弓兵）
  rangedBehavior(owner, deltaTime) {
    if (!this.target) {
      this.state = 'IDLE';
      owner.isMoving = false;
      return;
    }
    
    const ownerPos = owner.transform.position;
    const targetPos = this.target.transform.position;
    const distance = ownerPos.distance(targetPos);
    
    // 保持在理想距离（最大射程的80%）
    if (distance > this.keepDistance) {
      // 太远，接近目标
      this.state = 'MOVE_TO_TARGET';
      const direction = Vector2.sub(targetPos, ownerPos).normalize();
      owner.move(direction);
    } else if (distance < this.keepDistance * 0.7) {
      // 太近，保持距离
      this.state = 'KEEP_DISTANCE';
      const direction = Vector2.sub(ownerPos, targetPos).normalize();
      owner.move(direction);
    } else {
      // 在理想范围内，停止移动并攻击
      this.state = 'ATTACK';
      owner.isMoving = false;
      
      // 朝向目标
      owner.facingDirection = targetPos.x > ownerPos.x ? 1 : -1;
      
      // 触发攻击
      if (owner.weapons && owner.weapons.length > 0) {
        const direction = targetPos.x > ownerPos.x ? 1 : -1;
        
        for (const weapon of owner.weapons) {
          if (weapon.canAttack()) {
            weapon.attack(direction);
            break;
          }
        }
      }
    }
  }
  
  // 骑兵行为（来回冲锋）
  cavalryBehavior(owner, deltaTime) {
    if (!this.target) {
      this.state = 'IDLE';
      owner.isMoving = false;
      this.chargePhase = 'APPROACH';
      return;
    }
    
    const ownerPos = owner.transform.position;
    const targetPos = this.target.transform.position;
    const distance = ownerPos.distance(targetPos);
    const idealRetreatDistance = this.retreatDistance;
    
    // 更新冲锋冷却
    if (this.chargeTimer > 0) {
      this.chargeTimer -= deltaTime;
      if (this.chargeTimer <= 0) {
        // 冷却结束，重新开始接近
        this.chargePhase = 'APPROACH';
      }
    }
    
    // 检查骑枪是否在冲刺状态
    const lance = owner.weapons && owner.weapons.find(w => w.type === 'lance');
    const isLanceCharging = lance && lance.state === 'charging';
    
    // 根据当前阶段执行不同行为
    switch (this.chargePhase) {
      case 'APPROACH':
        // 接近阶段：向目标冲锋
        this.state = 'CHARGE_APPROACH';
        
        // 检测冲锋完成：距离很近或者穿过了目标
        if (distance < 3 || isLanceCharging) {
          // 记录冲锋开始（用于判断冲锋结束）
          if (!this.chargeStartPos) {
            this.chargeStartPos = true;
          }
          
          // 如果骑枪冲刺刚结束，立即切换到后退
          if (this.chargeStartPos && !isLanceCharging && lance && lance.state !== 'charging') {
            this.chargePhase = 'RETREAT';
            this.chargeStartPos = null;
            console.log('骑兵冲锋完成，开始后退');
          }
        }
        
        // 继续向目标移动
        const approachDir = Vector2.sub(targetPos, ownerPos).normalize();
        owner.move(approachDir);
        break;
        
      case 'RETREAT':
        // 后退阶段：远离目标一段距离后再次冲锋
        this.state = 'CHARGE_RETREAT';
        
        if (distance < idealRetreatDistance) {
          // 还没退够距离，继续后退
          const retreatDir = Vector2.sub(ownerPos, targetPos).normalize();
          owner.move(retreatDir);
        } else {
          // 已经退到足够远，进入冷却阶段
          this.chargePhase = 'COOLDOWN';
          this.chargeTimer = this.chargeCooldown;
          console.log('骑兵后退完成，开始冷却');
        }
        break;
        
      case 'COOLDOWN':
        // 冷却阶段：等待冷却结束
        this.state = 'CHARGE_COOLDOWN';
        
        // 保持距离，轻微调整位置
        if (distance < idealRetreatDistance * 0.7) {
          // 太近了，继续后退一点
          const retreatDir = Vector2.sub(ownerPos, targetPos).normalize();
          owner.move(retreatDir);
        } else if (distance > idealRetreatDistance * 1.3) {
          // 太远了，靠近一点
          const approachDir = Vector2.sub(targetPos, ownerPos).normalize();
          owner.move(approachDir);
        } else {
          // 距离合适，停止移动等待冷却
          owner.isMoving = false;
        }
        
        // 冷却结束后自动切换到 APPROACH（在上面的 chargeTimer 更新中）
        if (this.chargeTimer <= 0) {
          console.log('骑兵冷却完成，准备再次冲锋');
        }
        break;
    }
    
    // 更新朝向
    if (targetPos.x !== ownerPos.x) {
      owner.facingDirection = targetPos.x > ownerPos.x ? 1 : -1;
    }
  }
}
