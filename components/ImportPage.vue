<template>
  <div class="prose prose-slate dark:prose-invert max-w-4xl mx-auto p-4">
    <div class="flex flex-col md:flex-row gap-2 items-center">
      <div class="flex-auto flex max-w-full items-center gap-2">
        <h2 class="mb-0 mt-0">
          Import queue
        </h2>
        <HelpIcon>
          <template #title>Import queue</template>
          <template #body>
            This page automatically appears when there is one or more elements in the import queue, that is when you
            open files through the open file dialog or drag and dropping or a similar way. It will close automatically
            when there are no more files in the import queue. You can continue to import files and they will appear
            here. If you have opened more than one file, a select control will appear on the top right corner of this
            dialog and allow you to select these files individually. For each file, you can preview its contents and
            decide whether to import it.
          </template>
        </HelpIcon>
      </div>
      <div class="flex-none max-w-full" v-show="queue.length > 1">
        <Select v-model:index="selectedIndex" :items="queue"></Select>
      </div>
    </div>
    <hr class="my-4">
    <!-- This is is not really needed because there will always be an active element here -->
    <div v-if="queue.length > 0">
      <!-- Header containing the name -->
      <h4 class="flex items-center gap-2 mb-4 mt-0">
        <span class="flex-auto whitespace-nowrap text-ellipsis overflow-hidden">{{ selectedFile.name }}</span>
        <span class="flex-none text-slate-500" v-if="selectedFile.size">
          ({{ bytesToHumanReadable(selectedFile.size) }})
        </span>
        <button ref="discardButton" @click="discardCurrentFile"
          class="text-red-700 border border-red-700 hover:bg-red-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm p-0.5 text-center inline-flex items-center dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:focus:ring-red-800">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <Tooltip :element="discardButton">Discard</Tooltip>
      </h4>
      <!-- If loading -->
      <div v-if="!selectedFile.done">
        <Spinner class="flex place-content-center"></Spinner>
      </div>
      <!-- If success -->
      <div v-else-if="!selectedFile.error">
        <EdgeListImporter :input="selectedIndex" @import="discardCurrentFile"></EdgeListImporter>
      </div>
      <!-- If error -->
      <div v-else-if="selectedFile.error">
        <ErrorMessage>{{ selectedFile.error }}</ErrorMessage>
      </div>
      <!-- If impossible -->
      <div v-else>
        <p>How did you get here?</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type Ref } from 'vue'
import { bytesToHumanReadable } from '~/custom/bytesToHumanReadable'
import type API from '~/api/API'

/**
 * The API and state.
 */

const api: Ref<API> = useState('api')
const queue: Ref<string[]> = useState('queue', () => [] as string[])

/**
 * DOM element references.
 */

const discardButton = ref()

/**
 * The selected file logic.
 */

interface SelectedFile {
  name?: string,
  size: number | null,
  error?: string,
  done: boolean
}

const selectedIndex: Ref<number> = ref(0)
const selectedFile: Ref<SelectedFile> = ref({ size: null, done: false })

watchEffect(async (onCleanup) => {
  let running: boolean = true
  onCleanup(() => { running = false })
  selectedFile.value.name = queue.value[selectedIndex.value]
  selectedFile.value.done = false
  const newSize = await api.value.queueSize(selectedIndex.value)
  const newError = await api.value.queueError(selectedIndex.value)
  if (running) {
    selectedFile.value.size = newSize
    selectedFile.value.error = newError
    selectedFile.value.done = true
  }
})

/**
 * Discard file function.
 */

function discardCurrentFile() {
  api.value.queueRemove(selectedIndex.value)
  queue.value.splice(selectedIndex.value, 1)
  selectedIndex.value = 0
}
</script>
