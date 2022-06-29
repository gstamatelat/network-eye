<template>
  <div class="prose prose-slate dark:prose-invert max-w-full flex items-center min-h-screen">
    <div class="mx-auto max-w-4xl px-4 py-4 text-center">
      <div class="w-10 h-10 mb-8 mx-auto">
        <a class="fill-blue-700 hover:fill-blue-800" :href="config.appGithub" target="_blank">
          <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
        </a>
      </div>
      <h1 class="text-center">Network Eye (NetEye): A web tool for the analysis of complex networks</h1>
      <p class="text-center text-slate-500 text-lg">A preliminary demo that proves that importing a file as a graph and
        reading it works. With this tool you can import networks and analyze them in order to make useful observations,
        conclusions or decisions for further study.</p>
      <div class="grid lg:grid-flow-col items-center gap-4 lg:gap-8 mt-8">
        <div class="py-2">
          <Button @click="openFile.trigger()">Open file from your computer</Button>
          <p class="mb-0">You may also drop any <b>file</b> from the local file system or a remote <b>URL</b> anywhere
            on this page.</p>
        </div>
        <div class="border-t-2 lg:border-l-2 w-full lg:h-full"></div>
        <div class="py-2">
          <p class="mt-0">Or try one of the predefined networks below</p>
          <div class="flex items-center justify-center gap-1">
            <A @click="addLesMiserables">Les Misérables</A>
            <HelpIcon>
              <template #title>Les Misérables</template>
              <template #body>
                Coappearance network of characters in the novel <i>Les Misérables</i>, compiled by Donald Knuth.
              </template>
            </HelpIcon>
          </div>
          <div class="flex items-center justify-center gap-1">
            <A @click="addKarateClub">Zachary's karate club</A>
            <HelpIcon>
              <template #title>Zachary's karate club</template>
              <template #body>
                Social network of a university karate club, described in the paper <i>An Information Flow Model for
                  Conflict and Fission in Small Groups</i> by Wayne W. Zachary. Node 1 is the instructor and node 34 is
                the club administrator.
              </template>
            </HelpIcon>
          </div>
          <div class="flex items-center justify-center gap-1">
            <A @click="addGameOfThrones">Game of Thrones</A>
            <HelpIcon>
              <template #title>Game of Thrones</template>
              <template #body>
                Character interaction network for George R. R. Martin's <i>A Song of Ice and Fire</i> saga, compiled by
                Andrew Beveridge.
              </template>
            </HelpIcon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Ref } from 'vue'
import API from '~/api/API'
import config from '~/app.config'

/**
 * State and composables.
 */

const openFile = useOpenFile()
const api: Ref<API> = useState('api')
const queue: Ref<string[]> = useState('queue', () => [] as string[])

/**
 * Add preset social networks.
 */

async function addLesMiserables() {
  const url = new URL('../assets/les-miserables.edges', import.meta.url)
  await api.value.queueAddURL(url.toString(), "Les Misérables")
  queue.value.push("Les Misérables")
}
async function addKarateClub() {
  const url = new URL('../assets/karate-club.edges', import.meta.url)
  await api.value.queueAddURL(url.toString(), "Zachary's karate club")
  queue.value.push("Zachary's karate club")
}
async function addGameOfThrones() {
  const url = new URL('../assets/game-of-thrones.edges', import.meta.url)
  await api.value.queueAddURL(url.toString(), "Game of Thrones")
  queue.value.push("Game of Thrones")
}
</script>
