// ============================================
// InputSystem - 输入系统
// ============================================
function InputSystem() {
    this.inputVector = { x: 0, y: 0 };
    this.keys = {};
    
    // 虚拟摇杆
    this.joystickActive = false;
    this.joystickStart = { x: 0, y: 0 };
    this.joystickCurrent = { x: 0, y: 0 };
    
    this.joystickContainer = document.getElementById('joystickContainer');
    this.joystickKnob = document.getElementById('joystickKnob');
    
    this.setupEventListeners();
}

InputSystem.prototype.setupEventListeners = function() {
    var self = this;
    
    // 键盘事件
    window.addEventListener('keydown', function(e) {
        self.keys[e.key.toLowerCase()] = true;
    });
    
    window.addEventListener('keyup', function(e) {
        self.keys[e.key.toLowerCase()] = false;
    });
    
    // 触摸/鼠标事件
    var canvas = document.getElementById('gameCanvas');
    
    // 触摸开始
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        var touch = e.touches[0];
        self.startJoystick(touch.clientX, touch.clientY);
    });
    
    canvas.addEventListener('mousedown', function(e) {
        e.preventDefault();
        self.startJoystick(e.clientX, e.clientY);
    });
    
    // 触摸移动
    window.addEventListener('touchmove', function(e) {
        if (self.joystickActive) {
            e.preventDefault();
            var touch = e.touches[0];
            self.moveJoystick(touch.clientX, touch.clientY);
        }
    });
    
    window.addEventListener('mousemove', function(e) {
        if (self.joystickActive) {
            e.preventDefault();
            self.moveJoystick(e.clientX, e.clientY);
        }
    });
    
    // 触摸结束
    window.addEventListener('touchend', function(e) {
        self.endJoystick();
    });
    
    window.addEventListener('mouseup', function(e) {
        self.endJoystick();
    });
};

InputSystem.prototype.startJoystick = function(x, y) {
    this.joystickActive = true;
    this.joystickStart = { x: x, y: y };
    this.joystickCurrent = { x: x, y: y };
    
    // 显示摇杆
    this.joystickContainer.classList.remove('hidden');
    this.joystickContainer.style.left = (x - CONFIG.input.joystickRadius) + 'px';
    this.joystickContainer.style.top = (y - CONFIG.input.joystickRadius) + 'px';
};

InputSystem.prototype.moveJoystick = function(x, y) {
    this.joystickCurrent = { x: x, y: y };
    
    // 计算偏移
    var dx = x - this.joystickStart.x;
    var dy = y - this.joystickStart.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    var maxDistance = CONFIG.input.joystickRadius;
    
    // 限制摇杆范围
    if (distance > maxDistance) {
        dx = (dx / distance) * maxDistance;
        dy = (dy / distance) * maxDistance;
    }
    
    // 更新摇杆旋钮位置
    this.joystickKnob.style.transform = 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))';
};

InputSystem.prototype.endJoystick = function() {
    this.joystickActive = false;
    this.joystickContainer.classList.add('hidden');
    this.joystickKnob.style.transform = 'translate(-50%, -50%)';
};

InputSystem.prototype.getInput = function() {
    var x = 0;
    var y = 0;
    
    // 键盘输入
    if (this.keys['w'] || this.keys['arrowup']) y -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) y += 1;
    if (this.keys['a'] || this.keys['arrowleft']) x -= 1;
    if (this.keys['d'] || this.keys['arrowright']) x += 1;
    
    // 虚拟摇杆输入
    if (this.joystickActive) {
        var dx = this.joystickCurrent.x - this.joystickStart.x;
        var dy = this.joystickCurrent.y - this.joystickStart.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > CONFIG.input.deadZone) {
            x = dx / CONFIG.input.joystickRadius;
            y = dy / CONFIG.input.joystickRadius;
        }
    }
    
    // 归一化
    var length = Math.sqrt(x * x + y * y);
    if (length > 1) {
        x /= length;
        y /= length;
    }
    
    return { x: x, y: y };
};

// ============================================
// Camera - 相机系统
// ============================================
function Camera(width, height) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.target = null;
    this.smoothing = 0.1;
}

Camera.prototype.follow = function(target) {
    this.target = target;
};

Camera.prototype.update = function() {
    if (this.target) {
        // 目标位置（将目标放在屏幕中心）
        var targetX = this.target.position.x - this.width / 2;
        var targetY = this.target.position.y - this.height / 2;
        
        // 平滑跟随
        this.x += (targetX - this.x) * this.smoothing;
        this.y += (targetY - this.y) * this.smoothing;
        
        // 限制相机在地图范围内
        var mapConfig = CONFIG.map;
        this.x = Math.max(0, Math.min(mapConfig.width - this.width, this.x));
        this.y = Math.max(0, Math.min(mapConfig.height - this.height, this.y));
    }
};

// ============================================
// RenderSystem - 渲染系统
// ============================================
function RenderSystem(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.camera = new Camera(CONFIG.canvas.width, CONFIG.canvas.height);
    
    this.setupCanvas();
}

RenderSystem.prototype.setupCanvas = function() {
    this.canvas.width = CONFIG.canvas.width;
    this.canvas.height = CONFIG.canvas.height;
};

RenderSystem.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

RenderSystem.prototype.renderMap = function() {
    var mapConfig = CONFIG.map;
    
    // 绘制背景
    this.ctx.fillStyle = mapConfig.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 绘制网格
    this.ctx.strokeStyle = mapConfig.gridColor;
    this.ctx.lineWidth = 1;
    
    var startX = Math.floor(this.camera.x / mapConfig.gridSize) * mapConfig.gridSize;
    var startY = Math.floor(this.camera.y / mapConfig.gridSize) * mapConfig.gridSize;
    var endX = this.camera.x + this.canvas.width;
    var endY = this.camera.y + this.canvas.height;
    
    // 垂直线
    for (var x = startX; x <= endX; x += mapConfig.gridSize) {
        var screenX = x - this.camera.x;
        this.ctx.beginPath();
        this.ctx.moveTo(screenX, 0);
        this.ctx.lineTo(screenX, this.canvas.height);
        this.ctx.stroke();
    }
    
    // 水平线
    for (var y = startY; y <= endY; y += mapConfig.gridSize) {
        var screenY = y - this.camera.y;
        this.ctx.beginPath();
        this.ctx.moveTo(0, screenY);
        this.ctx.lineTo(this.canvas.width, screenY);
        this.ctx.stroke();
    }
};

RenderSystem.prototype.renderBuildings = function() {
    var buildings = CONFIG.buildings;
    
    for (var i = 0; i < buildings.length; i++) {
        var building = buildings[i];
        var screenX = building.x - this.camera.x;
        var screenY = building.y - this.camera.y;
        
        // 绘制建筑主体
        this.ctx.fillStyle = building.color;
        this.ctx.fillRect(screenX, screenY, building.width, building.height);
        
        // 绘制建筑边框
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(screenX, screenY, building.width, building.height);
        
        // 绘制窗户装饰
        this.ctx.fillStyle = 'rgba(255, 255, 200, 0.3)';
        var windowSize = 15;
        var windowSpacing = 25;
        for (var wx = 0; wx < 2; wx++) {
            for (var wy = 0; wy < 3; wy++) {
                this.ctx.fillRect(
                    screenX + 15 + wx * windowSpacing,
                    screenY + 15 + wy * windowSpacing,
                    windowSize,
                    windowSize
                );
            }
        }
    }
};

RenderSystem.prototype.render = function(entities) {
    this.clear();
    this.camera.update();
    
    // 渲染顺序：地图 -> 建筑 -> 实体
    this.renderMap();
    this.renderBuildings();
    
    // 渲染所有实体
    for (var i = 0; i < entities.length; i++) {
        if (entities[i].alive) {
            entities[i].render(this.ctx, this.camera);
        }
    }
};
