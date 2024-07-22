export enum ShapeFlags {
  ELEMENT = 1, // 0001
  FUNCTIONAL_COMPONENT = 1 << 1, // 0010
  STATEFUL_COMPONENT = 1 << 2, // 0100
  TEXT_CHILDREN = 1 << 3, // 1000
  ARRAY_CHILDREN = 1 << 4, // 10000
  SLOTS_CHILDREN = 1 << 5,
  TELEPORT = 1 << 6,
  SUSPENSE = 1 << 7,
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  COMPONENT_KEPT_ALIVE = 1 << 9,
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT,
}
