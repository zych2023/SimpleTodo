import Store from 'electron-store'
import type { AppStore } from '../shared/types'
import { getNowDate, getNowDateTime } from './utils'

const store = new Store<AppStore>({
  defaults: {
    todoList: [
      {
        todo_date: getNowDate(),
        todo_datetime: getNowDateTime(),
        content: '"单击"下方空处，创建一个Todo'
      },
      {
        todo_date: getNowDate(),
        todo_datetime: getNowDateTime(),
        content: '"双击"Todo，表示已完成'
      },
      {
        todo_date: getNowDate(),
        todo_datetime: getNowDateTime(),
        content: '"单击"Todo，可进行更改或删除'
      },
      {
        todo_date: getNowDate(),
        todo_datetime: getNowDateTime(),
        content: '"长按"Todo，可进行拖动排序'
      },
      {
        todo_date: getNowDate(),
        todo_datetime: getNowDateTime(),
        content: '【重要】给项目点一个star'
      }
    ],
    doneList: [],
    settings: {
      firstRun: true
    }
  }
})

export default store
