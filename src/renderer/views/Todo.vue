<template>
  <div class="root" @click="add">
    <draggable
      class="list"
      v-model="todoList"
      v-bind="dragOptions"
      @start="drag = true"
      @end="drag = false"
      :disabled="editIndex !== -1"
      item-key="index"
    >
      <template #item="{ element: todo, index }">
        <div class="item" @click.stop="handleClick($event, index)">
          <p v-if="index !== editIndex">{{ index + 1 }}.{{ todo.content }}</p>
          <div class="edit" v-else>
            <input
              v-model="todo.content"
              v-focus
              @click.stop
              @keyup.esc="cancel(index)"
              @keyup.enter="edited"
              spellcheck="false"
            />
            <i class="iconfont icon-select" @click.stop="edited"></i>
            <i class="iconfont icon-close" @click.stop="clear(index)"></i>
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import draggable from 'vuedraggable'
import CursorSpecialEffects from '@/utils/fireworks'
import DB from '@/utils/db'
import { getNowDate, getNowDateTime } from '@/utils/common'
import type { TodoItem } from '../../shared/types'

const todoList = ref<TodoItem[]>([])
const drag = ref(false)
const editIndex = ref(-1)
const tempItem = ref<TodoItem | null>(null)
let lastClickTime = 0
let lastClickIndex = -1
let pendingEdit: ReturnType<typeof setTimeout> | null = null

const vFocus = { mounted: (el: HTMLInputElement) => el.focus() }
const dragOptions = { animation: 200, group: 'description', ghostClass: 'ghost' }

async function load(): Promise<void> {
  todoList.value = await DB.getTodoList()
}

function save(): void {
  DB.setTodoList(todoList.value)
}

function add(): void {
  if (editIndex.value !== -1) { edited(); return }
  todoList.value.push({ todo_date: getNowDate(), todo_datetime: getNowDateTime(), content: '' })
  tempItem.value = { ...todoList.value[todoList.value.length - 1] }
  editIndex.value = todoList.value.length - 1
}

function handleClick(event: MouseEvent, index: number): void {
  const now = Date.now()
  const isDbl = lastClickIndex === index && now - lastClickTime < 250
  lastClickTime = now
  lastClickIndex = index

  if (isDbl) {
    if (pendingEdit) { clearTimeout(pendingEdit); pendingEdit = null }
    if (editIndex.value !== -1) return
    const todo = todoList.value[index]
    if (!todo) return
    DB.addDoneItem({
      id: crypto.randomUUID(), done_date: getNowDate(), done_datetime: getNowDateTime(),
      todo_date: todo.todo_date, todo_datetime: todo.todo_datetime, content: todo.content
    }).then(() => {
      todoList.value.splice(index, 1)
      save()
      try { CursorSpecialEffects.handleMouseDown(event) } catch { /* 烟花特效失败不影响主流程 */ }
    })
    return
  }

  if (editIndex.value === index) {
    if (pendingEdit) { clearTimeout(pendingEdit); pendingEdit = null }
    edited()
    return
  }

  if (pendingEdit) clearTimeout(pendingEdit)
  pendingEdit = setTimeout(() => {
    pendingEdit = null
    if (editIndex.value !== -1) edited()
    tempItem.value = { ...todoList.value[index] }
    editIndex.value = index
  }, 250)
}

function edited(): void {
  todoList.value = todoList.value.filter((p) => p.content)
  editIndex.value = -1
  save()
}

function cancel(index: number): void {
  if (tempItem.value) todoList.value[index] = tempItem.value
  edited()
}

function clear(index: number): void {
  if (!todoList.value[index].content) { edited(); return }
  todoList.value[index].content = ''
}

onMounted(load)
</script>

<style lang="scss" scoped>
.root {
  width: 100%;
  min-height: 100%;
  box-sizing: border-box;
  padding: 0 15px 28px 15px;

  .list {
    .item {
      height: 28px;

      p {
        width: 100%;
        height: 100%;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        cursor: pointer;
        user-select: none;
        line-height: 28px;
      }

      .edit {
        display: flex;
        width: 100%;
        height: 100%;

        input {
          flex: 0 0 auto;
          width: 7em;
          height: 100%;
          outline: none;
          border: none;
          background: transparent;
          font-size: 16px;
          line-height: 28px;
          color: var(--text-primary);
        }

        .icon-select {
          flex: 1 0 0;
          line-height: 28px;
          padding: 0 5px;
          cursor: pointer;
          text-align: right;
        }

        .icon-close {
          line-height: 28px;
          padding: 0 5px;
          cursor: pointer;
        }
      }
    }

    .item:hover p {
      color: var(--text-hover);
    }
  }
}

.flip-list-move { transition: transform 0.5s; }
.no-move { transition: transform 0s; }
.ghost { opacity: 0.5; }
</style>
