export default class ListNode {
  val
  next

  constructor(val, next) {
    this.val = val
    this.next = (next !== undefined) ? next : null
  }


  setNext(ListNode) {
    this.next = ListNode
  }

}