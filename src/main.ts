import * as core from '@actions/core'
import updateMilestonesOnConfluence from './blocks/milestones'
import Confluence from './utils/confluence'

export const AUTODOC_IDENTIFIER = '-autodoc-'

const run = async (): Promise<void> => {
  try {
    const commit: string = core.getInput('commit')
    const confluenceApiKey: string = core.getInput('token')
    const c = new Confluence(
      'https://autodocument.atlassian.net',
      AUTODOC_IDENTIFIER,
      confluenceApiKey
    )
    const pages = await c.getAutodocPages()
    await updateMilestonesOnConfluence(commit, c, pages)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
