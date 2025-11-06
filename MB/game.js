// ============================================
// Game - 游戏主控制器
// ============================================
function Game() {
    this.canvas = document.getElementById('gameCanvas');
    this.inputSystem = new InputSystem();
    this.renderSystem = new RenderSystem(this.canvas);
    
    this.entities = [];
    this.player = null;
    
    this.lastTime = 0;
    this.running = false;
    
    this.init();
}

Game.prototype.init = function() {
    // 创建玩家
    this.player = new Player(CONFIG.map.width / 2, CONFIG.map.height / 2);
    this.entities.push(this.player);
    
    // 相机跟随玩家
    this.renderSystem.camera.follow(this.player);
    
    // 更新UI
    this.updateUI();
    
    // 启动游戏循环
    this.start();
};

Game.prototype.start = function() {
    this.running = true;
    this.lastTime = performance.now();
    this.gameLoop();
};

Game.prototype.stop = function() {
    this.running = false;
};

Game.prototype.gameLoop = function() {
    if (!this.running) return;
    
    var currentTime = performance.now();
    var deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    this.update(deltaTime);
    this.render();
    
    var self = this;
    requestAnimationFrame(function() {
        self.gameLoop();
    });
};

Game.prototype.update = function(deltaTime) {
    // 获取输入
    var input = this.inputSystem.getInput();
    
    // 更新玩家
    if (this.player && this.player.alive) {
        this.player.handleInput(input.x, input.y);
    }
    
    // 更新所有实体
    for (var i = 0; i < this.entities.length; i++) {
        if (this.entities[i].alive) {
            this.entities[i].update(deltaTime);
        }
    }
    
    // 碰撞检测（角色之间）
    this.updateCollisions();
    
    // 清理死亡实体
    this.cleanupEntities();
};

Game.prototype.updateCollisions = function() {
    var characters = [];
    
    // 收集所有角色
    for (var i = 0; i < this.entities.length; i++) {
        if (this.entities[i] instanceof Character && this.entities[i].alive) {
            characters.push(this.entities[i]);
        }
    }
    
    // 检测碰撞并推挤
    for (var i = 0; i < characters.length; i++) {
        for (var j = i + 1; j < characters.length; j++) {
            if (characters[i].checkCollision(characters[j])) {
                characters[i].resolveCollision(characters[j], CONFIG.physics.collisionPushStrength);
            }
        }
    }
};

Game.prototype.cleanupEntities = function() {
    for (var i = this.entities.length - 1; i >= 0; i--) {
        if (!this.entities[i].alive) {
            this.entities.splice(i, 1);
        }
    }
};

Game.prototype.render = function() {
    this.renderSystem.render(this.entities);
};

Game.prototype.updateUI = function() {
    var coinCount = document.getElementById('coinCount');
    if (this.player) {
        coinCount.textContent = this.player.coins;
    }
};

// ============================================
// 启动游戏
// ============================================
window.addEventListener('load', function() {
    var game = new Game();
    
    // 将game对象暴露到全局，方便调试
    window.game = game;
});
