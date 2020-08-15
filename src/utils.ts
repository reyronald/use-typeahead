import fuzzaldrinPlus from 'fuzzaldrin-plus'

import { User } from './users'

export function searchUsers(users: User[], term: string) {
  const results = fuzzaldrinPlus.filter(users, term, { key: 'name' })
  return results
}
