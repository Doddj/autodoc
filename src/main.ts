import * as core from '@actions/core'

async function run(): Promise<void> {
  try {
    const commit: string = core.getInput('commit')
    core.debug('Action working!')
    core.debug(commit)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
