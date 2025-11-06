// 游戏配置数据
var CONFIG = {
    // 画布配置
    canvas: {
        width: 480,  // 手机竖屏宽度
        height: 800  // 手机竖屏高度
    },
    
    // 玩家配置
    player: {
        maxSpeed: 5,
        acceleration: 0.5,
        friction: 0.92,
        radius: 25,
        hp: 100,
        mass: 1,
        bodyColor: '#3d5a80',  // 深蓝色身体
        headColor: '#98c1d9'   // 浅蓝色头部
    },
    
    // 物理配置
    physics: {
        collisionPushStrength: 0.5
    },
    
    // 地图配置
    map: {
        width: 2000,
        height: 800,
        backgroundColor: '#2d5016',
        gridSize: 50,
        gridColor: 'rgba(0, 0, 0, 0.1)'
    },
    
    // 建筑配置
    buildings: [
        { x: 200, y: 300, width: 80, height: 100, color: '#8b4513', type: 'ally' },
        { x: 200, y: 500, width: 80, height: 100, color: '#8b4513', type: 'ally' },
        { x: 1720, y: 300, width: 80, height: 100, color: '#654321', type: 'enemy' },
        { x: 1720, y: 500, width: 80, height: 100, color: '#654321', type: 'enemy' }
    ],
    
    // 输入配置
    input: {
        joystickRadius: 60,
        joystickKnobRadius: 25,
        deadZone: 0.1
    }
};
