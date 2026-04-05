// Bukkit Event Definitions
// Bukkit 事件定义

// 注意：此文件使用环境声明，类型从 classes.d.ts 全局可用

/**
 * 事件优先级（字符串字面量类型）
 */
type EventPriority = "LOWEST" | "LOW" | "NORMAL" | "HIGH" | "HIGHEST" | "MONITOR";

/**
 * 事件基类
 */
declare interface Event {
    getEventName(): string;
    isAsynchronous(): boolean;
}

/**
 * 可取消的事件
 */
declare interface Cancellable extends Event {
    isCancelled(): boolean;
    setCancelled(cancel: boolean): void;
}

// ========== 玩家事件 ==========

/**
 * 玩家加入事件
 */
declare interface PlayerJoinEvent extends Event {
    getPlayer(): Player;
    getJoinMessage(): string;
    setJoinMessage(message: string): void;
}

/**
 * 玩家离开事件
 */
declare interface PlayerQuitEvent extends Event {
    getPlayer(): Player;
    getQuitMessage(): string;
    setQuitMessage(message: string): void;
}

/**
 * 玩家死亡事件
 */
declare interface PlayerDeathEvent extends Event {
    getEntity(): LivingEntity;
    getPlayer(): Player;
    getDeathMessage(): string;
    setDeathMessage(message: string): void;
    getDrops(): ItemStack[];
    setDrops(drops: ItemStack[]): void;
    getDroppedExp(): number;
    setDroppedExp(exp: number): void;
    getNewExp(): number;
    setNewExp(exp: number): void;
    getNewLevel(): number;
    setNewLevel(level: number): void;
    getNewTotalExp(): number;
    setNewTotalExp(exp: number): void;
    getKeepLevel(): boolean;
    setKeepLevel(keepLevel: boolean): void;
    getKeepInventory(): boolean;
    setKeepInventory(keepInventory: boolean): void;
}

/**
 * 玩家 respawn 事件
 */
declare interface PlayerRespawnEvent extends Event {
    getPlayer(): Player;
    getRespawnLocation(): Location;
    setRespawnLocation(location: Location): void;
    isBedSpawn(): boolean;
    isAnchorSpawn(): boolean;
}

/**
 * 玩家移动事件
 */
declare interface PlayerMoveEvent extends Cancellable {
    getPlayer(): Player;
    getFrom(): Location;
    getTo(): Location;
    setTo(location: Location): void;
}

/**
 * 玩家传送事件
 */
declare interface PlayerTeleportEvent extends Cancellable {
    getPlayer(): Player;
    getFrom(): Location;
    getTo(): Location;
    setTo(location: Location): void;
    getCause(): TeleportCause;
}

declare enum TeleportCause {
    COMMAND,
    PLUGIN,
    ENDER_PEARL,
    CHORUS_FRUIT,
    UNKNOWN
}

/**
 * 玩家互动事件
 */
declare interface PlayerInteractEvent extends Cancellable {
    getPlayer(): Player;
    getAction(): Action;
    getItem(): ItemStack;
    getClickedBlock(): Block;
    getBlockFace(): BlockFace;
    hasItem(): boolean;
    hasBlock(): boolean;
    useItemInHand(): EventResult;
    useInteractedBlock(): EventResult;
}

declare enum Action {
    LEFT_CLICK_AIR,
    LEFT_CLICK_BLOCK,
    RIGHT_CLICK_AIR,
    RIGHT_CLICK_BLOCK,
    PHYSICAL
}

declare enum EventResult {
    ALLOW,
    DENY,
    DEFAULT
}

declare interface BlockFace {
    name(): string;
}

/**
 * 玩家聊天事件
 */
declare interface PlayerChatEvent extends Cancellable {
    getPlayer(): Player;
    getMessage(): string;
    setMessage(message: string): void;
    getRecipients(): Player[];
    getFormat(): string;
    setFormat(format: string): void;
}

/**
 * 玩家命令发送事件
 */
declare interface PlayerCommandPreprocessEvent extends Cancellable {
    getPlayer(): Player;
    getMessage(): string;
    setMessage(message: string): void;
}

/**
 * 玩家切换世界事件
 */
declare interface PlayerChangedWorldEvent extends Event {
    getPlayer(): Player;
    getFrom(): World;
}

/**
 * 玩家游戏模式改变事件
 */
declare interface PlayerGameModeChangeEvent extends Cancellable {
    getPlayer(): Player;
    getNewGameMode(): GameMode;
}

declare interface GameMode {
    name(): string;
    getValue(): number;
}

/**
 * 玩家掉落伤害事件
 */
declare interface PlayerDropItemEvent extends Cancellable {
    getPlayer(): Player;
    getItemDrop(): Item;
}

declare interface Item extends Entity {
    getItemStack(): ItemStack;
    setItemStack(item: ItemStack): void;
    getPickupDelay(): number;
    setPickupDelay(delay: number): void;
    setOwner(player: string): void;
    getOwner(): string;
}

/**
 * 玩家拾取物品事件
 */
declare interface PlayerPickupItemEvent extends Cancellable {
    getPlayer(): Player;
    getItem(): Item;
}

/**
 * 玩家放置方块事件
 */
declare interface BlockPlaceEvent extends Cancellable {
    getPlayer(): Player;
    getBlock(): Block;
    getBlockReplaced(): Block;
    getItemInHand(): ItemStack;
    getLocation(): Location;
    getWorld(): World;
    canBuild(): boolean;
    setCancelled(cancel: boolean): void;
}

/**
 * 玩家破坏方块事件
 */
declare interface BlockBreakEvent extends Cancellable {
    getPlayer(): Player;
    getBlock(): Block;
    isDropItems(): boolean;
    setDropItems(dropItems: boolean): void;
    getExpToDrop(): number;
    setExpToDrop(exp: number): void;
}

// ========== 实体事件 ==========

/**
 * 实体生成事件
 */
declare interface CreatureSpawnEvent extends Cancellable {
    getEntity(): LivingEntity;
    getLocation(): Location;
    getSpawnReason(): SpawnReason;
}

declare enum SpawnReason {
    NATURAL,
    JOCKEY,
    CHUNK_GEN,
    SPAWNER,
    EGG,
    SPAWNER_EGG,
    LIGHTNING,
    BUILD_SNOWMAN,
    BUILD_IRONGOLEM,
    BUILD_WITHER,
    BREEDING,
    SLIME_SPLIT,
    REINFORCEMENTS,
    NETHER_PORTAL,
    INFECTION,
    CURED,
    OCELOT_BABY,
    SILVERFISH_BLOCK,
    MOUNT,
    CUSTOM,
    DEFAULT,
    SHULKER_BOX,
    TNT,
    PATROL,
    RAID,
    DRAGON_EGG,
    SHEARED,
    EXPLOSION,
    TRAP,
    DROWNED,
    SHEAR,
    DISMOUNT,
    SLIME_SPLIT_OF,
    SPAWNED_FOR_BLOCK_PLACE,
    SPAWNED_FOR_NETHER_PORTAL_PLACE
}

/**
 * 实体死亡事件
 */
declare interface EntityDeathEvent extends Event {
    getEntity(): LivingEntity;
    getDrops(): ItemStack[];
    setDrops(drops: ItemStack[]): void;
    getDroppedExp(): number;
    setDroppedExp(exp: number): void;
    getEntityDamage(): EntityDamageEvent;
}

/**
 * 实体伤害事件
 */
declare interface EntityDamageEvent extends Cancellable {
    getEntity(): LivingEntity;
    getCause(): DamageCause;
    getDamage(): number;
    setDamage(damage: number): void;
    getDamage(type: DamageModifier): number;
    setDamage(type: DamageModifier, damage: number): void;
    getFinalDamage(): number;
    setFinalDamage(damage: number): void;
    getLastDamageCause(): EntityDamageEvent;
}

declare enum DamageCause {
    CONTACT,
    ENTITY_ATTACK,
    PROJECTILE,
    SUFFOCATION,
    FALL,
    FIRE,
    FIRE_TICK,
    MELTING,
    LAVA,
    DROWNING,
    BLOCK_EXPLOSION,
    ENTITY_EXPLOSION,
    VOID,
    LIGHTNING,
    SUICIDE,
    STARVATION,
    POISON,
    MAGIC,
    WITHER,
    FALLING_BLOCK,
    THORNS,
    DRAGON_BREATH,
    FLY_INTO_WALL,
    CRAMMING,
    HOT_FLOOR
}

declare enum DamageModifier {
    BASE,
    ARMOR,
    RESISTANCE,
    ABSORPTION,
    MAGIC,
    ARMOR_ENCHANTED,
    WITHER
}

/**
 * 实体目标改变事件
 */
declare interface EntityTargetEvent extends Cancellable {
    getEntity(): LivingEntity;
    getTarget(): LivingEntity;
    setTarget(target: LivingEntity): void;
    getReason(): TargetReason;
}

declare enum TargetReason {
    CLOSEST_ENTITY,
    COLLISION,
    CUSTOM,
    DEFEND_VILLAGE,
    FORGOT_TARGET,
    NEW_TARGET,
    OWNER_ATTACKED_TARGET,
    PIG_ZOMBIE_ANGRY,
    PLAYER_COMMAND,
    REINFORCEMENT,
    TARGET_ATTACKED_ENTITY,
    TARGET_ATTACKED_OWNER,
    OWNER_ATTACKED,
    RANDOM_TARGET,
    TAME,
    TELEPORT,
    UNKNOWN
}

/**
 * 爆炸事件
 */
declare interface EntityExplodeEvent extends Cancellable {
    getEntity(): Entity;
    getLocation(): Location;
    getBlockList(): Block[];
    setBlockList(blocks: Block[]): void;
    getYield(): number;
    setYield(yield: number): void;
}

// ========== 方块事件 ==========

/**
 * 方块燃烧事件
 */
declare interface BlockBurnEvent extends Cancellable {
    getBlock(): Block;
    getIgnitingBlock(): Block;
}

/**
 * 方块分散事件
 */
declare interface BlockDispenseEvent extends Cancellable {
    getBlock(): Block;
    getItem(): ItemStack;
    setItem(item: ItemStack): void;
    getVelocity(): Vector;
    setVelocity(velocity: Vector): void;
}

declare interface Vector {
    getX(): number;
    getY(): number;
    getZ(): number;
}

/**
 * 红石事件
 */
declare interface BlockRedstoneEvent extends Event {
    getBlock(): Block;
    getNewCurrent(): number;
    getOldCurrent(): number;
}

// ========== 库存事件 ==========

/**
 * 库存点击事件
 */
declare interface InventoryClickEvent extends Cancellable {
    getWhoClicked(): HumanEntity;
    getInventory(): Inventory;
    getCursor(): ItemStack;
    setCursor(item: ItemStack): void;
    getCurrentItem(): ItemStack;
    setCurrentItem(item: ItemStack): void;
    getSlot(): number;
    getRawSlot(): number;
    getSlotType(): SlotType;
    getClick(): ClickType;
    getAction(): InventoryAction;
    getHotbarButton(): number;
    isLeftClick(): boolean;
    isRightClick(): boolean;
    isShiftClick(): boolean;
    isNumberKeyClick(): boolean;
    isKeyboardClick(): boolean;
    isCreativeAction(): boolean;
}

declare enum SlotType {
    ARMOR,
    CONTAINER,
    CRAFTING,
    FUEL,
    QUICKCRAFT,
    RESULT
}

declare enum ClickType {
    LEFT,
    RIGHT,
    SHIFT_LEFT,
    SHIFT_RIGHT,
    NUMBER_KEY,
    DOUBLE_CLICK,
    DROP,
    CONTROL_DROP,
    CREATIVE,
    WINDOW_BORDER_LEFT,
    WINDOW_BORDER_RIGHT,
    MIDDLE,
    UNKNOWN,
    SWAP_OFFHAND
}

declare enum InventoryAction {
    NOTHING,
    PICKUP_ALL,
    PICKUP_SOME,
    PICKUP_HALF,
    PICKUP_ONE,
    PLACE_ALL,
    PLACE_SOME,
    PLACE_ONE,
    SWAP_WITH_CURSOR,
    DROP_ALL_SLOT,
    DROP_ONE_SLOT,
    MOVE_TO_OTHER_INVENTORY,
    HOTBAR_MOVE_AND_READD,
    HOTBAR_SWAP,
    CLONE_STACK,
    UNKNOWN
}

/**
 * 库存拖动事件
 */
declare interface InventoryDragEvent extends Cancellable {
    getWhoClicked(): HumanEntity;
    getInventory(): Inventory;
    getCursor(): ItemStack;
    setCursor(item: ItemStack): void;
    getRawSlots(): number[];
    getInventorySlots(): number[];
    getOldCursor(): ItemStack;
}

/**
 * 物品合成事件
 */
declare interface CraftItemEvent extends Cancellable {
    getWhoClicked(): HumanEntity;
    getRecipe(): Recipe;
    getInventory(): CraftingInventory;
    getSlot(): number;
    getCurrentItem(): ItemStack;
    setCurrentItem(item: ItemStack): void;
    getCursor(): ItemStack;
    setCursor(item: ItemStack): void;
}

declare interface Recipe {
    getResult(): ItemStack;
}

declare interface CraftingInventory extends Inventory {
    getMatrix(): ItemStack[];
    getContents(): ItemStack[];
}

// ========== 世界事件 ==========

/**
 * 天气改变事件
 */
declare interface WeatherChangeEvent extends Cancellable {
    getWorld(): World;
    toWeatherState(): boolean;
}

/**
 * 雷击事件
 */
declare interface LightningStrikeEvent extends Cancellable {
    getWorld(): World;
    getLightning(): Lightning;
}

declare interface Lightning extends Entity {
}

/**
 * 结构生成事件
 */
declare interface StructureGrowEvent extends Cancellable {
    getLocation(): Location;
    getWorld(): World;
    getBlocks(): BlockState[];
    setBlocks(blocks: BlockState[]): void;
    getBonemeal(): boolean;
}

declare interface BlockState {
    getBlock(): Block;
    getType(): any;
    update(): boolean;
    getX(): number;
    getY(): number;
    getZ(): number;
    getLocation(): Location;
    getWorld(): World;
}

// ========== 车辆事件 ==========

/**
 * 车辆进入事件
 */
declare interface VehicleEnterEvent extends Cancellable {
    getVehicle(): VehicleEntity;
    getEntered(): Entity;
}

declare interface VehicleEntity {
    getWorld(): World;
    getLocation(): Location;
    getVelocity(): Vector;
    setVelocity(velocity: Vector): void;
    getPassengers(): Entity[];
    addPassenger(entity: Entity): boolean;
    removePassenger(entity: Entity): void;
    leave(): boolean;
    isInsideVehicle(): boolean;
    getServer(): any;
}

/**
 * 车辆离开事件
 */
declare interface VehicleExitEvent extends Event {
    getVehicle(): VehicleEntity;
    getExited(): Entity;
}

/**
 * 车辆损坏事件
 */
declare interface VehicleDamageEvent extends Cancellable {
    getVehicle(): VehicleEntity;
    getAttacker(): Entity;
    getDamage(): number;
    setDamage(damage: number): void;
}

// ========== 命令事件 ==========

/**
 * 服务器命令事件
 */
declare interface ServerCommandEvent extends Cancellable {
    getSender(): CommandSender;
    getCommand(): string;
    setCommand(command: string): void;
}

// ========== 插件事件 ==========

/**
 * 插件启用事件
 */
declare interface PluginEnableEvent extends Event {
    getPlugin(): any;
}

/**
 * 插件禁用事件
 */
declare interface PluginDisableEvent extends Event {
    getPlugin(): any;
}

// ========== 事件名称到类型的映射 ==========

declare interface EventMap {
    "PlayerJoinEvent": PlayerJoinEvent;
    "PlayerQuitEvent": PlayerQuitEvent;
    "PlayerDeathEvent": PlayerDeathEvent;
    "PlayerRespawnEvent": PlayerRespawnEvent;
    "PlayerMoveEvent": PlayerMoveEvent;
    "PlayerTeleportEvent": PlayerTeleportEvent;
    "PlayerInteractEvent": PlayerInteractEvent;
    "PlayerChatEvent": PlayerChatEvent;
    "PlayerCommandPreprocessEvent": PlayerCommandPreprocessEvent;
    "PlayerChangedWorldEvent": PlayerChangedWorldEvent;
    "PlayerGameModeChangeEvent": PlayerGameModeChangeEvent;
    "PlayerDropItemEvent": PlayerDropItemEvent;
    "PlayerPickupItemEvent": PlayerPickupItemEvent;
    "BlockPlaceEvent": BlockPlaceEvent;
    "BlockBreakEvent": BlockBreakEvent;
    "CreatureSpawnEvent": CreatureSpawnEvent;
    "EntityDeathEvent": EntityDeathEvent;
    "EntityDamageEvent": EntityDamageEvent;
    "EntityTargetEvent": EntityTargetEvent;
    "EntityExplodeEvent": EntityExplodeEvent;
    "BlockBurnEvent": BlockBurnEvent;
    "BlockDispenseEvent": BlockDispenseEvent;
    "BlockRedstoneEvent": BlockRedstoneEvent;
    "InventoryClickEvent": InventoryClickEvent;
    "InventoryDragEvent": InventoryDragEvent;
    "CraftItemEvent": CraftItemEvent;
    "WeatherChangeEvent": WeatherChangeEvent;
    "LightningStrikeEvent": LightningStrikeEvent;
    "StructureGrowEvent": StructureGrowEvent;
    "VehicleEnterEvent": VehicleEnterEvent;
    "VehicleExitEvent": VehicleExitEvent;
    "VehicleDamageEvent": VehicleDamageEvent;
    "ServerCommandEvent": ServerCommandEvent;
    "PluginEnableEvent": PluginEnableEvent;
    "PluginDisableEvent": PluginDisableEvent;
}
