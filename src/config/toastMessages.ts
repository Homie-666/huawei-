/**
 * 趣味提示文案库
 * 每次操作随机抽一条，让看板有点人味
 */

export type ToastScene =
  | 'add'
  | 'move'
  | 'star'
  | 'unstar'
  | 'urgent'
  | 'unurgent'
  | 'remove'
  | 'reset'
  | 'theme'
  | 'done'

export const toastMessages: Record<ToastScene, string[]> = {
  add: [
    '新任务已就位，先做哪一个？',
    '记下来了，脑子可以腾点地方了。',
    '又一个待办诞生，加油！',
    '收到，已经放进待办队列。',
    '任务 +1，记得回来看它一眼。'
  ],
  move: [
    '状态已更新，进度往前走了一格。',
    '换个位置，换种心情。',
    '卡片搬家成功。',
    '已经挪过去了，继续保持节奏。'
  ],
  star: [
    '已加星标，这件事很重要。',
    '星星亮起来了，别让它等太久。',
    '重点已标记，优先处理它吧。'
  ],
  unstar: [
    '星标已取消，轻装上阵。',
    '它回到普通队列了。'
  ],
  urgent: [
    '已标记紧急，红色警报拉响。',
    '紧急任务，建议现在就动手。',
    '优先级拉满，注意时间。'
  ],
  unurgent: [
    '紧急标记已取消，松一口气。',
    '压力解除，按原计划推进。'
  ],
  remove: [
    '任务已删除，清清爽爽。',
    '删掉了，不必再惦记它。',
    '已移除，专注剩下的事情。'
  ],
  reset: [
    '看板已清空，一切从头开始。',
    '全部清空，新的篇章开启。',
    '重置完成，轻装上阵吧。'
  ],
  theme: [
    '换个配色，换种心情。',
    '主题已切换，眼睛舒服一点。',
    '新皮肤上线。'
  ],
  done: [
    '完成一个！你比自己想的更高效。',
    '漂亮，又推进了一件事。',
    '打勾的一瞬间最爽，对吧？',
    '搞定，给自己鼓个掌。',
    '这一步走完了，下一件也不难。'
  ]
}

export function randomMessage(scene: ToastScene): string {
  const list = toastMessages[scene] || toastMessages.add
  return list[Math.floor(Math.random() * list.length)]
}
