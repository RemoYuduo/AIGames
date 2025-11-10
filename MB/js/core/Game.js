// 游戏核心类
class Game {
  constructor() {
    this.canvas = null;
    this.context = null;
    this.config = new ConfigManager();
    this.camera = null;
    this.map = null;
    this.input = null;
    this.player = null;
    
    this.running = false;
    this.paused = false;
    this.lastTime = 0;
    
    this.initialized = false;
  }

  // 初始化游戏
  async init() {
    console.log('游戏初始化开始...');

    // 加载配置
    const loaded = await this.config.loadAll();
    if (!loaded) {
      throw new Error('配置加载失败');
    }

    // 创建Canvas
    this.canvas = document.getElementById('gameCanvas');
    this.context = this.canvas.getContext('2d');

    // 设置Canvas尺寸
    const canvasWidth = this.config.get('game.canvas.width');
    const canvasHeight = this.config.get('game.canvas.height');
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;

    // 创建摄像机
    const worldWidth = this.config.get('game.world.mapWidth');
    const worldHeight = this.config.get('game.world.mapHeight');
    const pixelsPerMeter = this.config.get('game.world.pixelsPerMeter');
    
    this.camera = new Camera(canvasWidth, canvasHeight, worldWidth, worldHeight, pixelsPerMeter);

    // 创建地图
    this.map = new BattleMap({
      world: this.config.get('game.world'),
      map: this.config.get('map'),
      game: this.config.get('game')
    });

    // 创建输入管理器
    this.input = new Input(this.canvas);

    // 创建玩家（在地图中央）
    const playerConfig = this.config.get('character.player');
    const mountConfig = this.config.get('mount.defaultHorse');
    this.player = new Player(worldWidth / 2, worldHeight / 2, playerConfig, mountConfig);

    // 摄像机跟随玩家
    this.camera.follow(this.player);

    this.initialized = true;
    console.log('游戏初始化完成');
  }

  // 启动游戏循环
  start() {
    if (!this.initialized) {
      console.error('游戏未初始化');
      return;
    }

    this.running = true;
    this.lastTime = performance.now();
    this.gameLoop();
    console.log('游戏开始');
  }

  // 游戏主循环
  gameLoop() {
    if (!this.running) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // 转换为秒
    this.lastTime = currentTime;

    // 更新和渲染
    if (!this.paused) {
      this.update(deltaTime);
    }
    this.render();

    // 继续循环
    requestAnimationFrame(() => this.gameLoop());
  }

  // 更新游戏逻辑
  update(deltaTime) {
    // 限制deltaTime防止跳跃
    deltaTime = Math.min(deltaTime, 0.1);

    // 更新输入
    this.input.update();

    // 获取输入方向
    const direction = this.input.getDirection();
    
    // 玩家移动
    this.player.move(direction);
    this.player.update(deltaTime);

    // 限制玩家在地图范围内
    this.map.clampPosition(this.player.transform.position);

    // 更新摄像机
    this.camera.update(deltaTime);
  }

  // 渲染游戏画面
  render() {
    // 清空画布
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 渲染地图
    this.map.render(this.context, this.camera);

    // 渲染玩家
    this.player.render(this.context, this.camera);

    // 渲染UI（摇杆）
    this.input.render(this.context);
  }

  // 暂停游戏
  pause() {
    this.paused = true;
    console.log('游戏暂停');
  }

  // 恢复游戏
  resume() {
    this.paused = false;
    this.lastTime = performance.now();
    console.log('游戏恢复');
  }

  // 停止游戏
  stop() {
    this.running = false;
    console.log('游戏停止');
  }
}
