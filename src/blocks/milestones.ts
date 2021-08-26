import {AUTODOC_IDENTIFIER} from '../main'
import Confluence, {ConfluencePage} from '../utils/confluence'
import {JSDOM} from 'jsdom'

const MILESTONE_IDENTIFIER = 'milestones'

const confluencePageContainsMilestone = (page: ConfluencePage): boolean => {
  const html = new JSDOM(page.body).window.document
  // BFS search text
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
      return true
    if (!node) continue
    if (node.hasChildNodes()) queue.push(...node.childNodes)
  }
  return false
}

const updateConfluenceMilestonePage = async (
  page: ConfluencePage,
  commitMessage: string,
  confluenceGateway: Confluence
): Promise<void> => {
  const html = new JSDOM(page.body).window.document
}

const updateMilestonesOnConfluence = async (
  commitMessage: string,
  confluenceGateway: Confluence,
  confluencePages?: ConfluencePage[]
): Promise<void> => {
  if (!confluencePages)
    confluencePages = await confluenceGateway.getAutodocPages()
  const milestonePages = confluencePages.filter(page =>
    confluencePageContainsMilestone(page)
  )
}

export default updateMilestonesOnConfluence
