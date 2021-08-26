import {AUTODOC_IDENTIFIER} from '../main'
import Confluence, {ConfluencePage} from '../utils/confluence'
import {JSDOM} from 'jsdom'
import {compareTwoStrings} from 'string-similarity'

const MILESTONE_IDENTIFIER = 'milestones'
const SIMILARITY_THRESHOLD = 0.7

const getMilestoneNode = (html: Document): Node | undefined => {
  // BFS through DOM
  const queue: Node[] = [html.getRootNode()]
  while (queue.length > 0) {
    const node = queue.pop()
    const value = node?.textContent
    if (
      value &&
      value
        .toLowerCase()
        .includes(`${AUTODOC_IDENTIFIER} ${MILESTONE_IDENTIFIER}`.toLowerCase())
    )
      return node
    if (!node) continue
    if (node.hasChildNodes()) queue.push(...node.childNodes)
  }
  return undefined
}

const isMilestoneRelatedToCommit = (
  milestone: string,
  commit: string
): boolean => {
  return compareTwoStrings(milestone, commit) >= SIMILARITY_THRESHOLD
}

const updateConfluenceMilestonePage = async (
  page: ConfluencePage,
  commitMessage: string,
  confluenceGateway: Confluence
): Promise<void> => {
  const dom = new JSDOM(page.body)
  const html = dom.window.document
  const milestoneNode = getMilestoneNode(html)
  if (!milestoneNode) return
  let parent = milestoneNode.parentNode
  if (!parent) return

  const list = parent.querySelector('ul')
  if (!list) return
  const listElements = list.querySelectorAll('li')

  const taskActionNode = new JSDOM(
    `<ac:task-list id="taskList"></ac:task-list>`
  ).window.document.getElementById('taskList')!

  let taskId = 1
  for (const element of listElements) {
    let taskStatus = element.className.includes('checked')
      ? 'complete'
      : 'incomplete'
    if (
      element.textContent &&
      isMilestoneRelatedToCommit(element.textContent, commitMessage)
    ) {
      taskStatus = 'complete'
    }
    const node = new JSDOM(
      `<ac:task id="task"><ac:task-id>${taskId}</ac:task-id><ac:task-status>${taskStatus}</ac:task-status><ac:task-body><span class="placeholder-inline-tasks">${element.textContent}</span></ac:task-body></ac:task>`
    ).window.document.getElementById('task')!
    taskActionNode.appendChild(node)
  }
  list.replaceWith(taskActionNode!)

  const updatedHtml = dom.serialize()
  await confluenceGateway.setPage(
    page.id,
    page.title,
    page.version,
    updatedHtml
  )
}

const updateMilestonesOnConfluence = async (
  commitMessage: string,
  confluenceGateway: Confluence,
  confluencePages?: ConfluencePage[]
): Promise<void> => {
  if (!confluencePages)
    confluencePages = await confluenceGateway.getAutodocPages()

  await Promise.all(
    confluencePages.map(page =>
      updateConfluenceMilestonePage(page, commitMessage, confluenceGateway)
    )
  )
}

export default updateMilestonesOnConfluence
