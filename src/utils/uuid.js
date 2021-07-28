
const UUID_PLACEHOLDER = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
/** 生成一个36位的UUID */
export function UUID() {
  return UUID_PLACEHOLDER.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}
