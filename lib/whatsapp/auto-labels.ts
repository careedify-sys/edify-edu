// Browser-safe labels for auto-replies (the runner itself is server-only).
export type AutoRuleKey = 'interested' | 'know_more' | 'reward' | 'call_me'
export const RULE_LABEL: Record<AutoRuleKey, string> = { interested: 'Interested', know_more: 'Know More', reward: 'Reward', call_me: 'Call Me' }
// Most specific intent first: "call me about the reward" is a callback.
export const RULE_ORDER: AutoRuleKey[] = ['call_me', 'reward', 'know_more', 'interested']

export const REASON_TEXT: Record<string, string> = {
  ok: 'Answered', automation_off: 'Auto-replies were off', no_rule: 'No keyword matched (left for you)', rule_off: 'That rule was off',
  conversation_off: 'Auto-replies stopped for this chat', too_old: 'Message too old', window_closed: '24-hour window closed',
  opted_out: 'Student opted out', cap: '4 automatic replies already sent', taken_over: 'You had already replied',
  'blocked:sending_off': 'Sending was switched off', 'blocked:cap_reached': 'Monthly cap reached', 'blocked:opted_out': 'Student opted out',
  'blocked:window_closed': '24-hour window closed', failed: 'Meta refused the message', unknown: 'Meta did not confirm',
}
