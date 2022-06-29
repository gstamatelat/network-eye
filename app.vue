<template>

  <Head>
    <Title>{{ config.appName }}</Title>
  </Head>

  <Body class="antialiased text-slate-700 bg-white dark:bg-gray-800"></Body>

  <!-- Monitor for files opening -->
  <OpenFileMonitor></OpenFileMonitor>

  <!-- Help dialog -->
  <HelpDialog v-if="help.items.length > 0"></HelpDialog>

  <!-- Error dialog -->
  <ErrorPage v-if="errors.length > 0"></ErrorPage>

  <!-- Import files dialog -->
  <ImportPage v-else-if="queue.length > 0"></ImportPage>

  <!-- Landing page -->
  <LandingPage v-else-if="graphs.length == 0"></LandingPage>

  <!-- Main page -->
  <MainPage v-else-if="graphs.length > 0"></MainPage>

  <!-- Impossible -->
  <div v-else>
    How did you get here?
  </div>

</template>

<script lang="ts" setup>
import { Ref } from 'vue'
import * as Comlink from 'comlink'
import config from '~/app.config'
import APIWorker from '~/api/api.worker?worker'
import API from '~/api/API'
import ClientGraph from '~/custom/ClientGraph'

/**
 * State and composables.
 */

const queue: Ref<string[]> = useState('queue', () => [] as string[])
const graphs: Ref<ClientGraph[]> = useState('graphs', () => [] as ClientGraph[])
const help = useHelp()
const errors = useState('errors', () => [] as Error[])

/**
 * Initialize API.
 */

if (process.client) {
  let api: Ref<API> = useState('api')
  const APIImpl: any = Comlink.wrap(new APIWorker())
  api.value = await new APIImpl()
  api.value.setGraphChangedCallback(Comlink.proxy(async () => {
    // TODO: There can be better way to change this structure than changing the whole thing
    graphs.value = []
    const numGraphs = await api.value.numGraphs()
    for (let i = 0; i < numGraphs; i++) {
      graphs.value.push(await api.value.clientGraph(i))
    }
  }))
}

/**
 * Capture all app errors.
 */

onErrorCaptured((err: any) => {
  const _err: Error = (typeof err === 'string') ? new Error(err) : err
  errors.value.push(_err)
  return false
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
</style>
