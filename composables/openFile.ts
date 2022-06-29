const openFile = {
  /**
   * The list of listeners.
   */
  listeners: reactive([]) as (() => void)[],

  /**
   * Add a new listener.
   * 
   * @param listener the listener to add.
   */
  addListener(listener: () => void) {
    this.listeners.push(listener)
  },

  /**
   * Remove a listener.
   * 
   * @param listener the listener to remove
   */
  removeListener(listener: () => void) {
    const index = this.listeners.indexOf(listener)
    if (index == -1) {
      throw new Error("Can't be here, index not found")
    }
    this.listeners.splice(index, 1)
  },

  /**
   * Trigger the open event.
   */
  trigger() {
    this.listeners.forEach(x => {
      x()
    })
  }
}

export const useOpenFile = () => { return openFile }
