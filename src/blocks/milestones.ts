import {AUTODOC_IDENTIFIER} from '../main'
import Confluence, {ConfluencePage} from '../utils/confluence'

const MILESTONE_IDENTIFIER = 'milestones'

const confluencePageContainsMilestone = (page: ConfluencePage): boolean => {
  const parser = new DOMParser()
  const html = parser.parseFromString(page.body, 'text/html')
  // BFS search text
  const queue: Node[] = [html.getRootNode()]
  while (queue.length > 0) {
    const node = queue.pop()
    const value = node?.nodeValue
    if (
      value &&
      value
        .toLowerCase()
        .includes(`${AUTODOC_IDENTIFIER} ${MILESTONE_IDENTIFIER}`.toLowerCase())
    )
      return true
  }
  return false
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
  console.log(milestonePages)
}

export default updateMilestonesOnConfluence
