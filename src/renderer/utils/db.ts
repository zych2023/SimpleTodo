import type { TodoItem, DoneItem } from '../../shared/types'

// Vue 3 Proxy → plain object for Electron IPC serialization
function plain<T>(v: T): T {
  return JSON.parse(JSON.stringify(v))
}

const DB = {
  getTodoList: () => window.electronAPI.storeGet('todoList') as Promise<TodoItem[]>,
  getDoneList: () => window.electronAPI.storeGet('doneList') as Promise<DoneItem[]>,
  setTodoList: (list: TodoItem[]) => window.electronAPI.storeSet('todoList', plain(list)),
  setDoneList: (list: DoneItem[]) => window.electronAPI.storeSet('doneList', plain(list)),

  async addDoneItem(item: DoneItem): Promise<void> {
    const list = await DB.getDoneList()
    list.push(item)
    await DB.setDoneList(list)
  },

  async removeDoneItem(id: string): Promise<void> {
    await DB.setDoneList((await DB.getDoneList()).filter((i) => i.id !== id))
  },

  async restoreDoneItem(id: string, data: TodoItem): Promise<void> {
    const todos = await DB.getTodoList()
    todos.push(data)
    await DB.setTodoList(todos)
    await DB.removeDoneItem(id)
  },

  async getDoneListGroupedByDate(): Promise<Record<string, DoneItem[]>> {
    const sorted = (await DB.getDoneList()).sort((a, b) => b.done_date.localeCompare(a.done_date))
    const groups: Record<string, DoneItem[]> = {}
    for (const item of sorted) {
      ;(groups[item.done_date] ??= []).push(item)
    }
    return groups
  }
}

export default DB
