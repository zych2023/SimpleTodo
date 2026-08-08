export interface TodoItem {
  todo_date: string
  todo_datetime: string
  content: string
}

export interface DoneItem {
  id: string
  done_date: string
  done_datetime: string
  todo_date: string
  todo_datetime: string
  content: string
}

export interface AppStore {
  todoList: TodoItem[]
  doneList: DoneItem[]
  settings: {
    firstRun: boolean
  }
}

