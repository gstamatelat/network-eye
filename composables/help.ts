interface HelpItem {
  title: string
  body: string
}

const help = {
  /**
   * The list of help items.
   */
  items: reactive([]) as HelpItem[],

  /**
   * Add a new help item.
   * 
   * @param title the title of the help item
   * @param body the bod of the help item
   */
  addItem(title: string, body: string) {
    this.items.push({
      title: title,
      body: body
    })
  },

  /**
   * Removes an index from the help item list.
   * 
   * @param index the index to remove
   */
  removeIndex(index: number) {
    this.items.splice(index, 1)
  }
}

export const useHelp = () => { return help }
