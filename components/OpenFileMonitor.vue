<template>
  <input ref="fileSelector" class="hidden" type="file" multiple @change="loadFile()">
</template>

<script lang="ts" setup>
import { type Ref } from 'vue'
import type API from '~/api/API'

/**
 * The API reference.
 */

const api: Ref<API> = useState('api')
const queue: Ref<string[]> = useState('queue', () => [] as string[])

/**
 * The file selector file input reference.
 */

const fileSelector: Ref<HTMLInputElement | null> = ref(null)

/**
 * Drag and drop.
 */

let dropCounter: number = 0
onMounted(() => {
  document.addEventListener("dragenter", dragenter, false)
  document.addEventListener("dragover", dragover, false)
  document.addEventListener("dragleave", dragleave, false)
  document.addEventListener("drop", drop, false)
})
function dragenter(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  dropCounter++
  document.body.classList.add('dropzone')
}
function dragover(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
}
function dragleave(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  dropCounter--
  if (dropCounter == 0) {
    document.body.classList.remove('dropzone')
  }
}
function drop(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  document.body.classList.remove('dropzone')
  if (e.dataTransfer == null) {
    return
  }
  for (let i = 0; i < e.dataTransfer.items.length; i++) {
    if (e.dataTransfer.items[i].kind == "file") {
      const file: File = e.dataTransfer.items[i].getAsFile()!
      api.value.queueAddFile(file, file.name)
      queue.value.push(file.name)
    } else if (e.dataTransfer.items[i].kind == "string" && e.dataTransfer.items[i].type == "text/uri-list") {
      e.dataTransfer.items[i].getAsString((x) => {
        api.value.queueAddURL(x, x)
        queue.value.push(x)
      })
    }
  }
}

/**
 * Bind to open file.
 */

const openFile = useOpenFile()

onMounted(() => {
  openFile.addListener(triggerFileSelector)
})

onUnmounted(() => {
  openFile.removeListener(triggerFileSelector)
})

function triggerFileSelector() {
  fileSelector.value!.click()
}
function loadFile(): void {
  const fileList: FileList | null = fileSelector.value!.files
  for (let i = 0; i < fileList!.length; i++) {
    api.value.queueAddFile(fileList![i], fileList![i].name)
    queue.value.push(fileList![i].name)
  }
  fileSelector.value!.value = ''
}
</script>

<style lang="postcss">
body.dropzone {
  @apply bg-red-200;
}
</style>
