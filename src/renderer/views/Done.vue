<template>
  <div class="root">
    <div class="list" v-for="(items, date) in doneGroupList" :key="date">
      <div class="group">{{ getDateStr(date) }}</div>
      <div
        class="item"
        v-for="(done, index) in items"
        :key="done.id"
        @click.stop="editId === done.id ? (editId = '') : (editId = done.id)"
      >
        <p>{{ index + 1 }}.{{ done.content }}</p>
        <i v-if="editId === done.id" class="iconfont icon-back" @click.stop="restore(done)"></i>
        <i v-if="editId === done.id" class="iconfont icon-close" @click.stop="remove(done)"></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DB from '@/utils/db'
import { getDateStr } from '@/utils/common'
import type { DoneItem } from '../../shared/types'

const doneGroupList = ref<Record<string, DoneItem[]>>({})
const editId = ref('')

async function load(): Promise<void> {
  doneGroupList.value = await DB.getDoneListGroupedByDate()
}

async function restore(done: DoneItem): Promise<void> {
  await DB.restoreDoneItem(done.id, {
    todo_date: done.todo_date, todo_datetime: done.todo_datetime, content: done.content
  })
  editId.value = ''
  await load()
}

async function remove(done: DoneItem): Promise<void> {
  await DB.removeDoneItem(done.id)
  editId.value = ''
  await load()
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
    .group {
      position: sticky;
      top: 0;
      z-index: -999;
      height: 224px;
      line-height: 180px;
      box-sizing: border-box;
      color: var(--group-title);
      font-size: 35px;
      text-align: center;
      user-select: none;
    }

    .item {
      display: flex;
      height: 28px;

      p {
        width: 100%;
        height: 100%;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        line-height: 28px;
        cursor: pointer;
      }

      i {
        line-height: 28px;
        padding: 0 5px;
        cursor: pointer;
      }
    }

    .item:hover p {
      color: var(--text-hover);
    }
  }
}
</style>
