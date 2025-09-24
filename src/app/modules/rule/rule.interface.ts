import { Model } from 'mongoose'

export interface IRule {
  content: string
  type: 'privacy' | 'terms' | 'about'
}

export type RuleModel = Model<IRule, Record<string, unknown>>
