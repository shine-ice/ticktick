/**
 * 任务管理存储模块
 * 负责任务的增删改查、离线操作和同步功能
 */
import { defineStore } from "pinia";
import { TaskAPI } from "@/api/endpoints";
import { useSyncStore } from "./sync";
import type { Task } from "./types";

/**
 * 任务管理存储
 * 使用Pinia管理任务数据的状态
 */
export const useTasksStore = defineStore("tasks", {
  /**
   * 存储状态
   */
  state: () => ({
    /**
     * 任务对象集合，以任务ID为键
     */
    byId: {} as Record<number, Task>,
  }),

  /**
   * 计算属性
   */
  getters: {
    /**
     * 获取所有任务数组
     * @returns 任务数组
     */
    items(state) {
      return Object.values(state.byId);
    },
  },

  /**
   * 操作方法
   */
  actions: {
    /**
     * 从服务器更新或插入任务
     * @param task 任务对象
     */
    upsertFromServer(task: Task) {
      this.byId[task.id] = { ...(this.byId[task.id] || {}), ...task };
    },

    /**
     * 从服务器删除任务
     * @param taskId 任务ID
     */
    deleteFromServer(taskId: number) {
      delete this.byId[taskId];
    },

    /**
     * 重新映射任务ID（用于离线任务同步到服务器后）
     * @param tempId 临时ID
     * @param serverId 服务器返回的正式ID
     * @param serverEntity 服务器返回的完整任务对象（可选）
     */
    remapId(tempId: number, serverId: number, serverEntity?: Task) {
      const existing = this.byId[tempId];
      if (existing) {
        delete this.byId[tempId];
        this.byId[serverId] = {
          ...existing,
          id: serverId,
          ...(serverEntity || {}),
        };
      } else if (serverEntity) {
        this.byId[serverId] = serverEntity;
      }
    },

    /**
     * 创建新任务（在线模式）
     * @param payload 任务创建参数
     * @returns 创建的任务对象
     */
    async createTask(payload: any) {
      const data = await TaskAPI.create(payload);
      this.upsertFromServer(data.task);
      return data.task;
    },

    /**
     * 获取任务列表（分页）
     * @param page 页码，默认1
     * @param pageSize 每页数量，默认20
     * @returns 任务列表数据
     */
    async fetchList(page = 1, pageSize = 20) {
      const data = await TaskAPI.list(page, pageSize);
      for (const item of data.items || []) {
        this.upsertFromServer(item);
      }
      return data;
    },

    /**
     * 离线创建任务
     * 创建临时任务并加入同步队列
     * @param payload 任务创建参数
     * @returns 创建的临时任务对象
     */
    createTaskOffline(payload: any) {
      // 使用负时间戳作为临时ID
      const tempId = -Date.now();

      // 创建临时任务对象
      const local: Task = {
        id: tempId,
        title: payload.title,
        list_id: payload.listId,
        due_at: payload.dueAt || null,
        start_at: payload.startAt || null,
        priority: payload.priority ?? 0,
        repeat_rule: payload.repeatRule || null,
        tagIds: payload.tagIds || [],
        subtasks: payload.subtasks || [],
        is_completed: 0,
      };

      // 存储临时任务
      this.byId[tempId] = local;

      // 加入同步队列
      const sync = useSyncStore();
      sync.enqueue({
        entityType: "task",
        entityId: tempId,
        op: "upsert",
        patch: { ...payload, clientTempId: tempId },
      });

      // 尝试推送同步队列
      sync.pushPending().catch(() => void 0);

      return local;
    },

    /**
     * 更新任务（在线模式）
     * @param id 任务ID
     * @param patch 更新的字段
     * @returns 更新后的任务对象
     */
    async patchTask(id: number, patch: any) {
      const data = await TaskAPI.patch(id, patch);
      this.upsertFromServer(data.task);
      return data.task;
    },

    /**
     * 删除任务（在线模式）
     * @param id 任务ID
     * @returns 删除结果
     */
    async removeTask(id: number) {
      const data = await TaskAPI.remove(id);
      this.deleteFromServer(id);
      return data;
    },

    /**
     * 乐观更新任务
     * 立即更新本地数据，然后异步同步到服务器
     * @param id 任务ID
     * @param patch 更新的字段
     */
    optimisticPatch(id: number, patch: any) {
      // 立即更新本地数据
      this.byId[id] = { ...(this.byId[id] || ({} as any)), ...patch };

      // 加入同步队列
      const sync = useSyncStore();
      sync.enqueue({ entityType: "task", entityId: id, op: "upsert", patch });

      // 尝试推送同步队列
      sync.pushPending().catch(() => void 0);
    },
  },
});
