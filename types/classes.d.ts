// Bukkit Core Classes Definitions
// Bukkit 核心类定�?

// ========== 基础接口 ==========

/**
 * Bukkit 插件接口
 */
declare interface Plugin {
    getName(): string;
    getVersion(): string;
    getDescription(): PluginDescriptionFile;
    getFile(): File;
    getDataFolder(): File;
    getConfig(): ConfigurationSection;
    getLogger(): Logger;
    getServer(): Server;
    isEnabled(): boolean;
    onDisable(): void;
    onEnable(): void;
    onLoad(): void;
}

/**
 * 插件描述文件
 */
declare interface PluginDescriptionFile {
    getName(): string;
    getVersion(): string;
    getMain(): string;
    getDescription(): string;
    getAuthors(): string[];
    getDepend(): string[];
    getSoftDepend(): string[];
    getLoadBefore(): string[];
}

/**
 * 服务器接�?
 */
declare interface Server {
    getName(): string;
    getVersion(): string;
    getBukkitVersion(): string;
    getOnlinePlayers(): Player[];
    getMaxPlayers(): number;
    getPort(): number;
    getIp(): string;
    getWorlds(): World[];
    getWorld(name: string): World;
    getWorld(uid: string): World;
    createWorld(params: any): World;
    unloadWorld(world: World, save: boolean): boolean;
    unloadWorld(name: string, save: boolean): boolean;
    isPrimaryThread(): boolean;
    getScheduler(): BukkitScheduler;
    getPluginManager(): PluginManager;
    getConsoleSender(): ConsoleCommandSender;
    broadcast(message: string): void;
    broadcastMessage(message: string): void;
    getPlayer(name: string): Player;
    getPlayer(uuid: string): Player;
    getOfflinePlayer(name: string): OfflinePlayer;
    getOfflinePlayers(): OfflinePlayer[];
    getPluginCommand(name: string): Command;
    dispatchCommand(sender: CommandSender, commandLine: string): boolean;
    reload(): void;
    reloadCommands(): void;
    getScoreboardManager(): ScoreboardManager;
    getDefaultGameMode(): GameMode;
    setDefaultGameMode(mode: GameMode): void;
    getServerId(): string;
    getServerName(): string;
}

/**
 * 命令发送者接�?
 */
declare interface CommandSender {
    getName(): string;
    sendMessage(message: string): void;
    sendMessage(messages: string[]): void;
    sendRawMessage(message: string): void;
    getServer(): Server;
    isOp(): boolean;
    setOp(op: boolean): void;
    hasPermission(permission: string): boolean;
    addAttachment(plugin: Plugin, name: string, value: boolean): PermissionAttachment;
    removeAttachment(attachment: PermissionAttachment): void;
    recalculatePermissions(): void;
    getEffectivePermissions(): PermissionAttachmentInfo[];
    isPermissionSet(name: string): boolean;
    getPersistentPermissions(): Permission;
}

/**
 * 控制台命令发送�?
 */
declare interface ConsoleCommandSender extends CommandSender {
}

/**
 * 玩家接口
 */
declare interface Player extends HumanEntity, OfflinePlayer {
    getLocation(): Location;
    getWorld(): World;
    getX(): number;
    getY(): number;
    getZ(): number;
    getChunk(): Chunk;
    teleport(location: Location): boolean;
    teleport(entity: Entity): boolean;
    teleportAsync(location: Location): Promise<boolean>;
    teleportAsync(entity: Entity): Promise<boolean>;
    
    // 玩家属�?
    getDisplayName(): string;
    setDisplayName(name: string): void;
    getPlayerListName(): string;
    setPlayerListName(name: string): void;
    getHealth(): number;
    setHealth(health: number): void;
    getMaxHealth(): number;
    setMaxHealth(health: number): void;
    getFoodLevel(): number;
    setFoodLevel(level: number): void;
    getExp(): number;
    setExp(exp: number): void;
    getLevel(): number;
    setLevel(level: number): void;
    getTotalExperience(): number;
    setTotalExperience(exp: number): void;
    getGameMode(): GameMode;
    setGameMode(mode: GameMode): void;
    
    // 物品�?
    getInventory(): PlayerInventory;
    getEnderChest(): Inventory;
    getMainHand(): Hand;
    getItemInMainHand(): ItemStack;
    setItemInMainHand(item: ItemStack): void;
    getItemInOffHand(): ItemStack;
    setItemInOffHand(item: ItemStack): void;
    
    // 状�?
    isOnline(): boolean;
    isDead(): boolean;
    isSneaking(): boolean;
    setSneaking(sneak: boolean): void;
    isSprinting(): boolean;
    setSprinting(sprint: boolean): void;
    isFlying(): boolean;
    setFlying(flying: boolean): void;
    getAllowFlight(): boolean;
    setAllowFlight(flight: boolean): void;
    isGliding(): boolean;
    setGliding(gliding: boolean): void;
    
    // 效果
    getActivePotionEffects(): PotionEffect[];
    hasPotionEffect(type: PotionEffectType): boolean;
    addPotionEffect(effect: PotionEffect): boolean;
    addPotionEffects(effects: PotionEffect[]): void;
    removePotionEffect(type: PotionEffectType): void;
    
    // 权限
    getOp(): boolean;
    isOp(): boolean;
    setOp(op: boolean): void;
    
    // 网络
    getAddress(): InetSocketAddress;
    getPing(): number;
    kickPlayer(reason: string): void;
    sendTitle(title: string, subtitle?: string, fadeIn?: number, stay?: number, fadeOut?: number): void;
    sendActionBar(message: string): void;
    playSound(location: Location, sound: string, volume: number, pitch: number): void;
    playEffect(location: Location, effect: Effect, data: number): void;
    spawnParticle(particle: Particle, location: Location, count: number): void;
}

/**
 * 人类实体（玩家和 NPC�?
 */
declare interface HumanEntity extends LivingEntity {
    getInventory(): Inventory;
    getEnderChest(): Inventory;
    getItemInHand(): ItemStack;
    setItemInHand(item: ItemStack): void;
    getGameMode(): GameMode;
    setGameMode(mode: GameMode): void;
    getExp(): number;
    getLevel(): number;
    getFoodLevel(): number;
    getAbsorptionAmount(): number;
    setAbsorptionAmount(amount: number): void;
}

/**
 * 离线玩家接口
 */
declare interface OfflinePlayer {
    getName(): string;
    getUniqueId(): UUID;
    isOnline(): boolean;
    isBanned(): boolean;
    isWhitelisted(): boolean;
    setWhitelisted(value: boolean): void;
    hasPlayedBefore(): boolean;
    getFirstPlayed(): number;
    getLastPlayed(): number;
    getPlayer(): Player;
}

/**
 * 实体接口
 */
declare interface Entity {
    getEntityId(): number;
    getUniqueId(): UUID;
    getName(): string;
    getCustomName(): string;
    setCustomName(name: string): void;
    isCustomNameVisible(): boolean;
    setCustomNameVisible(flag: boolean): void;
    getLocation(): Location;
    getWorld(): World;
    getChunk(): Chunk;
    teleport(location: Location): boolean;
    teleport(entity: Entity): boolean;
    getVelocity(): Vector;
    setVelocity(velocity: Vector): void;
    getHeight(): number;
    getWidth(): number;
    getEyeHeight(): number;
    getEyeLocation(): Location;
    getNearbyEntities(x: number, y: number, z: number): Entity[];
    isDead(): boolean;
    isValid(): boolean;
    isInsideVehicle(): boolean;
    leaveVehicle(): boolean;
    getVehicle(): Entity;
    getPassengers(): Entity[];
    addPassenger(entity: Entity): boolean;
    removePassenger(entity: Entity): void;
    remove(): void;
    damage(amount: number): void;
    damage(amount: number, source: Entity): void;
    getHealth(): number;
    setHealth(health: number): void;
    getMaxHealth(): number;
    setMaxHealth(health: number): void;
    getFireTicks(): number;
    setFireTicks(ticks: number): void;
    setFireDuration(seconds: number): void;
    isOnGround(): boolean;
    isGlowing(): boolean;
    setGlowing(flag: boolean): void;
    isSilent(): boolean;
    setSilent(flag: boolean): void;
    getServer(): Server;
}

/**
 * 生物接口
 */
declare interface LivingEntity extends Entity {
    getNoDamageTicks(): number;
    setNoDamageTicks(ticks: number): void;
    getMaximumNoDamageTicks(): number;
    setMaximumNoDamageTicks(ticks: number): void;
    getLastDamageCause(): EntityDamageEvent;
    setLastDamageCause(event: EntityDamageEvent): void;
    getActivePotionEffects(): PotionEffect[];
    hasPotionEffect(type: PotionEffectType): boolean;
    addPotionEffect(effect: PotionEffect): boolean;
    addPotionEffects(effects: PotionEffect[]): void;
    removePotionEffect(type: PotionEffectType): void;
    getEyeLocation(): Location;
    getLineOfSight(blocks: Set<Material>, maxDistance: number): Block[];
    getTargetBlock(blocks: Set<Material>, maxDistance: number): Block;
    getLastTwoTargetBlocks(blocks: Set<Material>, maxDistance: number): Block[];
    getRemainingAir(): number;
    setRemainingAir(ticks: number): void;
    getMaximumAir(): number;
    setMaximumAir(ticks: number): void;
    getEyeHeight(): number;
    getEyeHeight(ignoreSneaking: boolean): number;
    getNearbyEntities(x: number, y: number, z: number): Entity[];
    getWorld(): World;
}

/**
 * 生物类型枚举
 */
declare enum EntityType {
    PLAYER,
    DROPPED_ITEM,
    EXPERIENCE_ORB,
    LEASH_HITCH,
    PAINTING,
    ARROW,
    SNOWBALL,
    FIREBALL,
    SMALL_FIREBALL,
    ENDER_PEARL,
    ENDER_SIGNAL,
    THROWN_EXP_BOTTLE,
    ITEM_FRAME,
    WITHER_SKULL,
    PRIMITIVE_ARROW,
    FALLING_BLOCK,
    FIREWORK,
    ARMOR_STAND,
    ITEM_DISPLAY,
    BLOCK_DISPLAY,
    TEXT_DISPLAY,
    INTERACTION,
    ZOMBIE,
    CREEPER,
    SKELETON,
    SPIDER,
    PIG,
    SHEEP,
    COW,
    CHICKEN,
    SQUID,
    WOLF,
    ENDERMAN,
    CAVE_SPIDER,
    SILVERFISH,
    BLAZE,
    MAGMA_CUBE,
    ENDER_DRAGON,
    WITHER,
    BAT,
    WITCH,
    GUARDIAN,
    IRON_GOLEM,
    VILLAGER,
    // ... 更多类型
}

// ========== 世界相关 ==========

/**
 * 世界接口
 */
declare interface World {
    getName(): string;
    getUID(): UUID;
    getSeed(): number;
    getTime(): number;
    setTime(time: number): void;
    isDayTime(): boolean;
    getDifficulty(): Difficulty;
    setDifficulty(difficulty: Difficulty): void;
    getWorldType(): WorldType;
    isHardcore(): boolean;
    getEnvironment(): Environment;
    getSpawnLocation(): Location;
    setSpawnLocation(location: Location): boolean;
    getEntities(): Entity[];
    getLivingEntities(): LivingEntity[];
    getPlayers(): Player[];
    getDroppedItems(): Item[];
    getArrows(): Arrow[];
    getBlockAt(x: number, y: number, z: number): Block;
    getBlockAt(location: Location): Block;
    getHighestBlockYAt(x: number, z: number): number;
    getHighestBlockYAt(location: Location): number;
    generateTree(location: Location, type: TreeType): boolean;
    spawnEntity(location: Location, type: EntityType): Entity;
    spawnFallingBlock(location: Location, data: BlockData): FallingBlock;
    spawnItem(location: Location, item: ItemStack): Item;
    strikeLightning(location: Location): void;
    strikeLightningEffect(location: Location): void;
    createExplosion(x: number, y: number, z: number, power: number): boolean;
    createExplosion(location: Location, power: number): boolean;
    getServer(): Server;
    isChunkLoaded(x: number, z: number): boolean;
    getLoadedChunks(): Chunk[];
    loadChunk(x: number, z: number): boolean;
    unloadChunk(chunk: Chunk): boolean;
    getChunkAt(x: number, z: number): Chunk;
    getChunkAt(location: Location): Chunk;
    getChunkAt(block: Block): Chunk;
}

/**
 * 位置
 */
declare interface Location {
    getWorld(): World;
    setWorld(world: World): void;
    getX(): number;
    getY(): number;
    getZ(): number;
    getBlockX(): number;
    getBlockY(): number;
    getBlockZ(): number;
    getPitch(): number;
    getYaw(): number;
    setPitch(pitch: number): void;
    setYaw(yaw: number): void;
    add(x: number, y: number, z: number): Location;
    subtract(x: number, y: number, z: number): Location;
    multiply(multiplier: number): Location;
    distance(other: Location): number;
    distanceSquared(other: Location): number;
    length(): number;
    lengthSquared(): number;
    clone(): Location;
    getBlock(): Block;
    getChunk(): Chunk;
    set(x: number, y: number, z: number): Location;
    teleport(entity: Entity): boolean;
    direction(): Vector;
    toVector(): Vector;
}

/**
 * 向量
 */
declare interface Vector {
    getX(): number;
    getY(): number;
    getZ(): number;
    setX(x: number): Vector;
    setY(y: number): Vector;
    setZ(z: number): Vector;
    add(other: Vector): Vector;
    subtract(other: Vector): Vector;
    multiply(multiplier: number): Vector;
    divide(divisor: number): Vector;
    length(): number;
    lengthSquared(): number;
    distance(other: Vector): number;
    distanceSquared(other: Vector): number;
    normalize(): Vector;
    crossProduct(other: Vector): Vector;
    dotProduct(other: Vector): number;
    angle(other: Vector): number;
    clone(): Vector;
    isZero(): boolean;
}

/**
 * 方块
 */
declare interface Block {
    getX(): number;
    getY(): number;
    getZ(): number;
    getLocation(): Location;
    getWorld(): World;
    getChunk(): Chunk;
    getType(): Material;
    setType(type: Material): void;
    getData(): number;
    setData(data: number): void;
    getBlockData(): BlockData;
    setBlockData(data: BlockData): void;
    getLightLevel(): number;
    getLightFromSky(): number;
    getLightFromBlocks(): number;
    isEmpty(): boolean;
    isLiquid(): boolean;
    isSolid(): boolean;
    isPassable(): boolean;
    isOccluding(): boolean;
    hasPower(): boolean;
    getRelative(modX: number, modY: number, modZ: number): Block;
    getRelative(face: BlockFace): Block;
    getFace(block: Block): BlockFace;
    getDrops(): ItemStack[];
    getDrops(tool: ItemStack): ItemStack[];
    breakNaturally(): boolean;
    breakNaturally(tool: ItemStack): boolean;
    getBiome(): Biome;
    setBiome(biome: Biome): void;
    getTemperature(): number;
    getHumidity(): number;
    getPistonMoveReaction(): PistonMoveReaction;
    getState(): BlockState;
}

/**
 * 方块状�?
 */
declare interface BlockState {
    getBlock(): Block;
    getType(): Material;
    update(): boolean;
    update(force: boolean): boolean;
    getData(): number;
    setData(data: number): void;
    getBlockData(): BlockData;
    setBlockData(data: BlockData): void;
    getLightLevel(): number;
    getWorld(): World;
    getX(): number;
    getY(): number;
    getZ(): number;
    getLocation(): Location;
    getChunk(): Chunk;
}

/**
 * 物品�?
 */
declare interface ItemStack {
    getType(): Material;
    setType(type: Material): void;
    getAmount(): number;
    setAmount(amount: number): void;
    getDurability(): number;
    setDurability(durability: number): void;
    getMaxStackSize(): number;
    clone(): ItemStack;
    hasItemMeta(): boolean;
    getItemMeta(): ItemMeta;
    setItemMeta(meta: ItemMeta): void;
    getEnchantments(): Map<Enchantment, number>;
    getEnchantment(enchantment: Enchantment): number;
    addEnchantment(enchantment: Enchantment, level: number): void;
    addUnsafeEnchantment(enchantment: Enchantment, level: number): void;
    removeEnchantment(enchantment: Enchantment): void;
    containsEnchantment(enchantment: Enchantment): boolean;
    getLore(): string[];
    setLore(lore: string[]): void;
    getDisplayName(): string;
    setDisplayName(name: string): void;
}

/**
 * 物品元数�?
 */
declare interface ItemMeta {
    getDisplayName(): string;
    setDisplayName(name: string): void;
    getLore(): string[];
    setLore(lore: string[]): void;
    hasEnchants(): boolean;
    hasEnchant(enchantment: Enchantment): boolean;
    addEnchant(enchantment: Enchantment, level: number, ignoreLevelRestriction: boolean): void;
    removeEnchant(enchantment: Enchantment): void;
    getEnchants(): Map<Enchantment, number>;
    getEnchantLevel(enchantment: Enchantment): number;
    isUnbreakable(): boolean;
    setUnbreakable(unbreakable: boolean): void;
    clone(): ItemMeta;
}

/**
 * 材料
 */
declare interface Material {
    name(): string;
    getId(): number;
    getMaxStackSize(): number;
    getMaxDurability(): number;
    isBlock(): boolean;
    isEdible(): boolean;
    isRecord(): boolean;
    isFuel(): boolean;
    isInteractable(): boolean;
    hasGravity(): boolean;
    isAir(): boolean;
    isSolid(): boolean;
    isBurnable(): boolean;
    isOccluding(): boolean;
    createBlockData(): BlockData;
}

/**
 * 方块数据
 */
declare interface BlockData {
    getMaterial(): Material;
    getAsString(): string;
    getAsString(verbose: boolean): string;
    matches(other: BlockData): boolean;
    merge(other: BlockData): BlockData;
    clone(): BlockData;
}

/**
 *  inventory
 */
declare interface Inventory {
    getSize(): number;
    getContents(): ItemStack[];
    getStorageContents(): ItemStack[];
    getItem(index: number): ItemStack;
    setItem(index: number, item: ItemStack): void;
    addItem(...items: ItemStack[]): Map<number, ItemStack>;
    removeItem(...items: ItemStack[]): Map<number, ItemStack>;
    contains(item: ItemStack): boolean;
    contains(itemType: Material): boolean;
    containsAtLeast(item: ItemStack, amount: number): boolean;
    remove(item: ItemStack): void;
    removeItem(itemType: Material): void;
    clear(): void;
    clear(index: number): void;
    first(item: ItemStack): number;
    first(itemType: Material): number;
    firstEmpty(): number;
    all(item: ItemStack): Map<number, ItemStack>;
    all(itemType: Material): Map<number, ItemStack>;
    getType(): InventoryType;
    getTitle(): string;
    getViewers(): HumanEntity[];
    getHolder(): InventoryHolder;
    getMaxStackSize(): number;
    setMaxStackSize(size: number): void;
}

/**
 * 玩家物品�?
 */
declare interface PlayerInventory extends Inventory {
    getHelmet(): ItemStack;
    setHelmet(helmet: ItemStack): void;
    getChestplate(): ItemStack;
    setChestplate(chestplate: ItemStack): void;
    getLeggings(): ItemStack;
    setLeggings(leggings: ItemStack): void;
    getBoots(): ItemStack;
    setBoots(boots: ItemStack): void;
    getItemInMainHand(): ItemStack;
    setItemInMainHand(item: ItemStack): void;
    getItemInOffHand(): ItemStack;
    setItemInOffHand(item: ItemStack): void;
    getHeldItemSlot(): number;
    setHeldItemSlot(slot: number): void;
    getHeldItem(): ItemStack;
    setHeldItem(item: ItemStack): void;
    getArmorContents(): ItemStack[];
    setArmorContents(items: ItemStack[]): void;
}

// ========== 其他枚举和类�?==========

declare enum GameMode {
    SURVIVAL,
    CREATIVE,
    ADVENTURE,
    SPECTATOR
}

declare enum Difficulty {
    PEACEFUL,
    EASY,
    NORMAL,
    HARD
}

declare enum Environment {
    NORMAL,
    NETHER,
    THE_END
}

declare enum WorldType {
    NORMAL,
    FLAT,
    LARGE_BIOMES,
    AMPLIFIED,
    CUSTOMIZED
}

declare enum Biome {
    OCEAN,
    PLAINS,
    DESERT,
    MOUNTAINS,
    FOREST,
    TAIGA,
    SWAMP,
    RIVER,
    NETHER,
    THE_END,
    // ... 更多生物群系
}

declare enum BlockFace {
    NORTH,
    SOUTH,
    EAST,
    WEST,
    UP,
    DOWN,
    NORTH_EAST,
    NORTH_WEST,
    SOUTH_EAST,
    SOUTH_WEST,
    WEST_NORTH_WEST,
    NORTH_NORTH_WEST,
    NORTH_NORTH_EAST,
    EAST_NORTH_EAST,
    EAST_SOUTH_EAST,
    SOUTH_SOUTH_EAST,
    SOUTH_SOUTH_WEST,
    WEST_SOUTH_WEST,
    SELF
}

declare enum Hand {
    MAIN_HAND,
    OFF_HAND
}

declare enum InventoryType {
    CHEST,
    DISPENSER,
    DROPPER,
    FURNACE,
    WORKBENCH,
    CRAFTING,
    ENCHANTING,
    BREWING,
    PLAYER,
    CREATIVE,
    MERCHANT,
    ENDER_CHEST,
    ANVIL,
    SMITHING,
    BEACON,
    HOPPER,
    SHULKER_BOX,
    BARREL,
    BLAST_FURNACE,
    SMOKER,
    CARTOGRAPHY,
    GRINDSTONE,
    LECTERN,
    LOOM
}

declare enum Effect {
    MOBSPAWNER_PARTICLES,
    STEP_SOUND,
    VILLAGER_PLANT_GROW,
    ZOMBIE_DESTROY_EGG,
    // ... 更多效果
}

declare enum Particle {
    EXPLOSION_NORMAL,
    EXPLOSION_LARGE,
    EXPLOSION_HUGE,
    FIREWORKS_SPARK,
    WATER_BUBBLE,
    WATER_SPLASH,
    WATER_WAKE,
    SUSPENDED,
    SUSPENDED_DEPTH,
    CRIT,
    CRIT_MAGIC,
    // ... 更多粒子
}

declare enum Sound {
    AMBIENT_CAVE,
    BLOCK_ANVIL_BREAK,
    BLOCK_ANVIL_DESTROY,
    BLOCK_ANVIL_FALL,
    BLOCK_ANVIL_HIT,
    BLOCK_ANVIL_LAND,
    BLOCK_ANVIL_PLACE,
    BLOCK_ANVIL_STEP,
    BLOCK_ANVIL_USE,
    // ... 更多声音
}

declare enum PotionEffectType {
    SPEED,
    SLOW,
    FAST_DIGGING,
    SLOW_DIGGING,
    INCREASE_DAMAGE,
    HEAL,
    HARM,
    JUMP,
    CONFUSION,
    REGENERATION,
    DAMAGE_RESISTANCE,
    FIRE_RESISTANCE,
    WATER_BREATHING,
    INVISIBILITY,
    BLINDNESS,
    NIGHT_VISION,
    HUNGER,
    WEAKNESS,
    POISON,
    WITHER,
    HEALTH_BOOST,
    ABSORPTION,
    SATURATION,
    GLOWING,
    LEVITATION,
    LUCK,
    UNLUCK,
    SLOW_FALLING,
    CONDUIT_POWER,
    DOLPHINS_GRACE,
    BAD_OMEN,
    HERO_OF_THE_VILLAGE
}

// ========== 插件和调度器相关 ==========

/**
 * 插件管理�?
 */
declare interface PluginManager {
    getPlugins(): Plugin[];
    getPlugin(name: string): Plugin | null;
    getPermission(name: string): Permission | null;
    addPermission(permission: Permission): void;
    removePermission(permission: Permission): boolean;
    removePermission(name: string): boolean;
    subscribeToPermission(name: string, plugin: Plugin, callable: any): boolean;
    subscribeToDefaultPermission(defaultPerm: boolean, plugin: Plugin, callable: any): boolean;
    unsubscribeFromPermission(plugin: Plugin): void;
    unsubscribeFromDefaultPermissions(plugin: Plugin): void;
    callEvent(event: Event): void;
    callEvent(event: Event, priority: EventPriority): void;
    registerEvents(listener: EventListener, plugin: Plugin): void;
    registerInterface(loader: PluginLoader): void;
    useTimings(): boolean;
}

/**
 * Bukkit 调度�?
 */
declare interface BukkitScheduler {
    scheduleSyncDelayedTask(plugin: Plugin, task: Runnable, delay: number): number;
    scheduleSyncRepeatingTask(plugin: Plugin, task: Runnable, delay: number, period: number): number;
    scheduleAsyncDelayedTask(plugin: Plugin, task: Runnable, delay: number): number;
    scheduleAsyncRepeatingTask(plugin: Plugin, task: Runnable, delay: number, period: number): number;
    cancelTask(taskId: number): void;
    cancelTasks(plugin: Plugin): void;
    isCurrentlyRunning(taskId: number): boolean;
    isQueued(taskId: number): boolean;
}

/**
 * 事件监听�?
 */
declare interface EventListener {
}

/**
 * 插件加载�?
 */
declare interface PluginLoader {
}

/**
 * 命令
 */
declare interface Command {
    getName(): string;
    getDescription(): string;
    getUsage(): string;
    getAliases(): string[];
    getPermission(): string | null;
    getPermissionMessage(): string | null;
    execute(sender: CommandSender, commandLabel: string, args: string[]): boolean;
    tabComplete(sender: CommandSender, alias: string, args: string[]): string[] | null;
    setLabel(name: string): boolean;
    setDescription(description: string): void;
    setUsage(usage: string): void;
    setPermission(permission: string | null): void;
    setPermissionMessage(permissionMessage: string): void;
}

// ========== 配置文件相关 ==========

/**
 * 配置�?
 */
declare interface ConfigurationSection {
    get(path: string): any;
    set(path: string, value: any): void;
    contains(path: string): boolean;
    isSet(path: string): boolean;
    getCurrentPath(): string;
    getName(): string;
    getKeys(deep: boolean): string[];
    getValues(deep: boolean): Map<string, any>;
    getString(path: string): string | null;
    getString(path: string, def: string): string;
    getInt(path: string): number;
    getInt(path: string, def: number): number;
    getDouble(path: string): number;
    getDouble(path: string, def: number): number;
    getBoolean(path: string): boolean;
    getBoolean(path: string, def: boolean): boolean;
    getList(path: string): any[] | null;
    getStringList(path: string): string[];
    getIntegerList(path: string): number[];
    getBooleanList(path: string): boolean[];
    getConfigurationSection(path: string): ConfigurationSection | null;
}

/**
 * 文件配置
 */
declare interface FileConfiguration extends ConfigurationSection {
    save(file: File): void;
    saveToString(): string;
    load(file: File): void;
    loadFromString(string: string): void;
    options(): ConfigurationOptions;
}

/**
 * 配置选项
 */
declare interface ConfigurationOptions {
    copyDefaults(): boolean;
    copyDefaults(value: boolean): ConfigurationOptions;
    pathSeparator(): string;
    pathSeparator(value: string): ConfigurationOptions;
    header(): string;
    header(value: string): ConfigurationOptions;
    copyHeader(): boolean;
    copyHeader(value: boolean): ConfigurationOptions;
}

// ========== 权限相关 ==========

/**
 * 权限
 */
declare interface Permission {
    getName(): string;
    getDescription(): string;
    getChildren(): Map<string, boolean>;
    getDefault(): PermissionDefault;
    isOp(): boolean;
    setDefault(value: PermissionDefault): void;
    setDescription(value: string): void;
    setChildren(children: Map<string, boolean>): void;
    recalculatePermissibles(): void;
    addChild(name: string, value: boolean): void;
    addChild(name: string, value: boolean, silent: boolean): void;
}

/**
 * 权限默认�?
 */
declare enum PermissionDefault {
    TRUE,
    FALSE,
    OP,
    NOT_OP
}

/**
 * 权限附加
 */
declare interface PermissionAttachment {
    getPermissions(): Map<string, boolean>;
    setPermission(name: string, value: boolean): PermissionAttachment;
    unsetPermission(name: string): PermissionAttachment;
    getPlugin(): Plugin;
    getPermissible(): Permissible;
    isRemoved(): boolean;
    remove(): void;
}

/**
 * 权限附加信息
 */
declare interface PermissionAttachmentInfo {
    getAttachment(): PermissionAttachment | null;
    getPermission(): string;
    getValue(): boolean;
    isVirtual(): boolean;
}

/**
 * 可授权对�?
 */
declare interface Permissible extends CommandSender {
    isOp(): boolean;
    setOp(op: boolean): void;
    hasPermission(name: string): boolean;
    hasPermission(perm: Permission): boolean;
    isPermissionSet(name: string): boolean;
    isPermissionSet(perm: Permission): boolean;
    addAttachment(plugin: Plugin, name: string, value: boolean): PermissionAttachment;
    removeAttachment(attachment: PermissionAttachment): void;
    recalculatePermissions(): void;
    getEffectivePermissions(): PermissionAttachmentInfo[];
    getPersistentPermissions(): Permission;
}

// ========== 其他重要类型 ==========

/**
 * 物品实体
 */
declare interface Item extends Entity {
    getItemStack(): ItemStack;
    setItemStack(item: ItemStack): void;
    getPickupDelay(): number;
    setPickupDelay(delay: number): void;
    getOwner(): string | null;
    setOwner(owner: string): void;
}

/**
 * 箭实�?
 */
declare interface Arrow extends Projectile {
}

/**
 * 抛射�?
 */
declare interface Projectile extends Entity {
    getShooter(): any;
    setShooter(shooter: any): void;
    doesBounce(): boolean;
    setBounce(bounce: boolean): void;
    getCritical(): boolean;
    setCritical(critical: boolean): void;
}

/**
 * 下落方块
 */
declare interface FallingBlock extends Entity {
    getBlockData(): BlockData;
    getMaterial(): Material;
    getBlockId(): number;
    getDropItem(): boolean;
    setDropItem(drop: boolean): void;
    doesCancelDrop(): boolean;
    setCancelDrop(cancel: boolean): void;
    shouldDropExp(): boolean;
    setHurtEntities(drop: boolean): void;
    getDamage(): number;
    setDamage(damage: number): void;
}

/**
 * 区块
 */
declare interface Chunk {
    getX(): number;
    getZ(): number;
    getWorld(): World;
    isLoaded(): boolean;
    load(): boolean;
    load(generate: boolean): boolean;
    unload(): boolean;
    unload(save: boolean): boolean;
    getBlock(x: number, y: number, z: number): Block;
    getBlockAt(blockX: number, blockY: number, blockZ: number): Block;
    getBlockAt(location: Location): Block;
    getEntities(): Entity[];
    getLivingEntities(): LivingEntity[];
    getTileEntities(): BlockState[];
    isSlimeChunk(): boolean;
    getChunkSnapshot(): ChunkSnapshot;
    loadChunk(): boolean;
    unloadChunk(): boolean;
    forceLoadChunk(): boolean;
}

/**
 * 区块快照
 */
declare interface ChunkSnapshot {
    getWorldName(): string;
    getX(): number;
    getZ(): number;
    getBlockType(x: number, y: number, z: number): Material;
    getBlockData(x: number, y: number, z: number): BlockData;
    getBlockSkyLight(x: number, y: number, z: number): number;
    getBlockEmittedLight(x: number, y: number, z: number): number;
    getHighestBlockYAt(x: number, z: number): number;
    getBiome(x: number, y: number, z: number): Biome;
    getFullBiome(x: number, y: number, z: number): any;
    isSectionEmpty(y: number): boolean;
}

/**
 * 记分板管理器
 */
declare interface ScoreboardManager {
    getMainScoreboard(): Scoreboard;
    getNewScoreboard(): Scoreboard;
    getPlayerScoreboard(player: Player): Scoreboard;
    setPlayerScoreboard(player: Player, scoreboard: Scoreboard): void;
}

/**
 * 记分�?
 */
declare interface Scoreboard {
    registerNewObjective(name: string, criteria: string, displayName?: string, renderType?: any): Objective;
    getObjective(name: string): Objective | null;
    getObjectives(): Objective[];
    getObjectivesByCriteria(criteria: string): Objective[];
    getTeam(name: string): Team | null;
    registerNewTeam(name: string): Team;
    getTeams(): Team[];
    getEntries(): string[];
    resetScores(entry: string): void;
    clearSlot(slot: DisplaySlot): void;
}

/**
 * 目标
 */
declare interface Objective {
    getName(): string;
    getDisplayName(): string;
    setDisplayName(name: string): void;
    getCriteria(): string;
    getDisplaySlot(): DisplaySlot;
    setDisplaySlot(slot: DisplaySlot): void;
    getScore(entry: string): Score;
    getScores(): Score[];
    unregister(): void;
}

/**
 * 分数
 */
declare interface Score {
    getScoreboard(): Scoreboard;
    getEntry(): string;
    getPlayer(): Player;
    getScore(): number;
    setScore(score: number): void;
    isScoreSet(): boolean;
    resetScore(): void;
}

/**
 * 队伍
 */
declare interface Team {
    getName(): string;
    getDisplayName(): string;
    setDisplayName(name: string): void;
    getPrefix(): string;
    setPrefix(prefix: string): void;
    getSuffix(): string;
    setSuffix(suffix: string): void;
    allowFriendlyFire(): boolean;
    setAllowFriendlyFire(friendlyFire: boolean): void;
    canSeeFriendlyInvisibles(): boolean;
    setCanSeeFriendlyInvisibles(canSeeFriendlyInvisibles: boolean): void;
    getNameTagVisibility(): any;
    setNameTagVisibility(nameTagVisibility: any): void;
    getColor(): any;
    setColor(color: any): void;
    addEntry(entry: string): boolean;
    addEntries(entries: string[]): boolean;
    removeEntry(entry: string): boolean;
    removeEntries(entries: string[]): boolean;
    getEntries(): string[];
    getSize(): number;
    hasEntry(entry: string): boolean;
    unregister(): void;
}

/**
 * 显示�?
 */
declare enum DisplaySlot {
    BELOW_NAME,
    PLAYER_LIST,
    SIDEBAR,
    SIDEBAR_TEAM_BLACK,
    SIDEBAR_TEAM_DARK_BLUE,
    SIDEBAR_TEAM_DARK_GREEN,
    SIDEBAR_TEAM_DARK_AQUA,
    SIDEBAR_TEAM_DARK_RED,
    SIDEBAR_TEAM_DARK_PURPLE,
    SIDEBAR_TEAM_GOLD,
    SIDEBAR_TEAM_GRAY,
    SIDEBAR_TEAM_DARK_GRAY,
    SIDEBAR_TEAM_BLUE,
    SIDEBAR_TEAM_GREEN,
    SIDEBAR_TEAM_AQUA,
    SIDEBAR_TEAM_RED,
    SIDEBAR_TEAM_LIGHT_PURPLE,
    SIDEBAR_TEAM_YELLOW,
    SIDEBAR_TEAM_WHITE
}

// 导出常用类型
export type { UUID, File, Logger, ConfigurationSection, Permission, PermissionAttachment, PermissionAttachmentInfo, InetSocketAddress, Map, Set, TreeType, PistonMoveReaction, Enchantment };
