import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'
import { TasksController } from '../controllers/tasks.controller'
import { SyncController } from '../controllers/sync.controller'
import { NlpController } from '../controllers/nlp.controller'
import { CalendarController } from '../controllers/calendar.controller'
import { ListsController } from '../controllers/lists.controller'
import { TagsController } from '../controllers/tags.controller'
import { HabitsController } from '../controllers/habits.controller'
import { PomodoroController } from '../controllers/pomodoro.controller'
import { SmartListsController } from '../controllers/smartlists.controller'
import { authRequired } from '../middleware/auth'

export const routes = Router()

routes.post('/api/auth/register', AuthController.register)
routes.post('/api/auth/login', AuthController.login)
routes.post('/api/auth/refresh', AuthController.refresh)
routes.post('/api/auth/logout', authRequired, AuthController.logout)

routes.get('/api/tasks', authRequired, TasksController.list)
routes.get('/api/tasks/:id', authRequired, TasksController.get)
routes.post('/api/tasks', authRequired, TasksController.create)
routes.patch('/api/tasks/:id', authRequired, TasksController.patch)
routes.delete('/api/tasks/:id', authRequired, TasksController.remove)

routes.post('/api/nlp/parse', authRequired, NlpController.parse)
routes.get('/api/calendar/tasks', authRequired, CalendarController.tasks)

routes.get('/api/lists', authRequired, ListsController.list)
routes.post('/api/lists', authRequired, ListsController.create)
routes.patch('/api/lists/:id', authRequired, ListsController.patch)
routes.delete('/api/lists/:id', authRequired, ListsController.remove)

routes.get('/api/tags', authRequired, TagsController.list)
routes.post('/api/tags', authRequired, TagsController.create)
routes.patch('/api/tags/:id', authRequired, TagsController.patch)
routes.delete('/api/tags/:id', authRequired, TagsController.remove)

routes.get('/api/habits', authRequired, HabitsController.list)
routes.post('/api/habits', authRequired, HabitsController.create)
routes.patch('/api/habits/:id', authRequired, HabitsController.patch)
routes.delete('/api/habits/:id', authRequired, HabitsController.remove)
routes.post('/api/habits/:id/log', authRequired, HabitsController.log)

routes.post('/api/pomodoro/sessions', authRequired, PomodoroController.createSession)
routes.get('/api/pomodoro/stats', authRequired, PomodoroController.stats)
routes.get('/api/pomodoro/settings', authRequired, PomodoroController.getSettings)
routes.patch('/api/pomodoro/settings', authRequired, PomodoroController.updateSettings)

routes.get('/api/smart-lists', authRequired, SmartListsController.list)
routes.post('/api/smart-lists', authRequired, SmartListsController.create)
routes.patch('/api/smart-lists/:id', authRequired, SmartListsController.patch)
routes.delete('/api/smart-lists/:id', authRequired, SmartListsController.remove)
routes.post('/api/smart-lists/:id/run', authRequired, SmartListsController.run)

routes.post('/api/sync/push', authRequired, SyncController.push)
routes.post('/api/sync/pull', authRequired, SyncController.pull)
