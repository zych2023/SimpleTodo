<template>
  <div class="drag-nav">
    <b>{{ appName }}</b>
    <i
      v-if="!isEditingMotto"
      class="custom-motto"
      title="双击编辑，点击其他地方保存，右键恢复默认"
      @dblclick="$emit('startMottoEdit')"
      @contextmenu.prevent="$emit('resetMotto')"
    >
      {{ customMotto }}
    </i>
    <input
      v-else
      ref="mottoInput"
      :value="mottoDraft"
      class="custom-motto-input"
      type="text"
      maxlength="80"
      @input="$emit('update:mottoDraft', ($event.target as HTMLInputElement).value)"
      @blur="$emit('confirmMottoEdit')"
      @keyup.enter="$emit('confirmMottoEdit')"
      @keyup.esc="$emit('cancelMottoEdit')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{
  appName: string
  customMotto: string
  mottoDraft: string
  isEditingMotto: boolean
}>()

defineEmits<{
  startMottoEdit: []
  confirmMottoEdit: []
  cancelMottoEdit: []
  resetMotto: []
  'update:mottoDraft': [value: string]
}>()

const mottoInput = ref<HTMLInputElement | null>(null)

watch(
  () => props.isEditingMotto,
  async (editing) => {
    if (editing) {
      await nextTick()
      mottoInput.value?.focus()
      mottoInput.value?.select()
    }
  }
)
</script>

<style lang="scss" scoped>
.drag-nav {
  -webkit-app-region: drag;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 20px;
  padding: 0 20px;
  box-sizing: border-box;
  font-size: 12px;

  b,
  i {
    color: var(--text-muted);
  }

  .custom-motto {
    -webkit-app-region: no-drag;
    cursor: pointer;
    transition: color 0.18s ease;
    &:hover {
      color: var(--text-hover);
    }
  }

  .custom-motto-input {
    -webkit-app-region: no-drag;
    width: 220px;
    height: 18px;
    padding: 0 6px;
    color: var(--text-secondary);
    border: 1px solid var(--app-border-color);
    border-radius: 3px;
    background: transparent;
    outline: none;
    font-size: 12px;
    line-height: 18px;
  }
}
</style>
