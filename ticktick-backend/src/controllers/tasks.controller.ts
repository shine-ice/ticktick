import { Request, Response } from "express";
import { z } from "zod";
import { TaskService } from "../services/TaskService";
import { SyncRepo } from "../models/repositories/SyncRepo";
import { WsHub } from "../ws/hub";

const createSchema = z.object({
  title: z.string().min(1),
  listId: z.number().int(),
  note: z.string().optional(),
  dueAt: z.string().optional(),
  startAt: z.string().optional(),
  priority: z.number().int().optional(),
  reminderAt: z.string().optional(),
  repeatRule: z.string().optional(),
  tagIds: z.array(z.number().int()).optional(),
  subtasks: z.array(z.object({ title: z.string().min(1) })).optional(),
});

export const TasksController = {
  /**
   * 获取任务列表
   * @param req 请求对象，包含用户认证信息和查询参数
   * @param res 响应对象，用于返回任务列表数据
   * @returns 返回分页的任务列表数据
   */
  async list(req: Request, res: Response) {
    // 从认证信息中获取当前用户ID
    const userId = req.auth!.userId;
    // 获取页码，默认值为1
    const page = Number(req.query.page || 1);
    // 获取每页数量，默认值为20
    const pageSize = Number(req.query.pageSize || 20);
    // 调用任务服务获取分页任务列表
    const { items, total } = await TaskService.list(userId, page, pageSize);
    // 返回分页数据，包含任务列表、页码、每页数量和总数
    return res.json({ items, page, pageSize, total });
  },

  async get(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const id = Number(req.params.id);
    const task = await TaskService.getTaskWithChildren(userId, id);
    return res.json({ task });
  },

  async create(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const input = createSchema.parse(req.body);
    const task = await TaskService.createTask(userId, input);

    const v = await SyncRepo.nextVersion(userId);
    await SyncRepo.recordChange(userId, "task", task.id, "upsert", v, task);
    WsHub.broadcastToUser(userId, {
      type: "TASK_UPSERT",
      payload: { task, version: v },
    });

    return res.status(201).json({ task });
  },

  async patch(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const id = Number(req.params.id);
    const patch = req.body;
    const task = await TaskService.patchTask(userId, id, patch);

    const v = await SyncRepo.nextVersion(userId);
    await SyncRepo.recordChange(userId, "task", id, "upsert", v, task);
    WsHub.broadcastToUser(userId, {
      type: "TASK_UPSERT",
      payload: { task, version: v },
    });

    return res.json({ task });
  },

  async remove(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const id = Number(req.params.id);
    await TaskService.softDeleteTask(userId, id);

    const v = await SyncRepo.nextVersion(userId);
    await SyncRepo.recordChange(userId, "task", id, "delete", v, null);
    WsHub.broadcastToUser(userId, {
      type: "TASK_DELETE",
      payload: { taskId: id, version: v },
    });

    return res.json({ ok: true });
  },
};
