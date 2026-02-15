import type { CoachingNote, Shift } from '@prisma/client';

export type AiPayload = {
  summary: string;
  top_3_issues: string[];
  coaching_plan_week: string[];
  suggested_script_lines: string[];
  metrics_to_track: string[];
};

export async function generateAiTips(shifts: Shift[], notes: CoachingNote[]): Promise<AiPayload> {
  const apiKey = process.env.OPENAI_API_KEY;

  const totals = shifts.reduce(
    (acc, shift) => {
      acc.hours += shift.hoursWorked;
      acc.convos += shift.conversations;
      acc.sales += shift.salesCount;
      return acc;
    },
    { hours: 0, convos: 0, sales: 0 }
  );

  const topStages = notes.reduce<Record<string, number>>((acc, note) => {
    acc[note.stage] = (acc[note.stage] || 0) + 1;
    return acc;
  }, {});

  const sortedStages = Object.entries(topStages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([stage]) => stage);

  if (!apiKey) {
    return {
      summary: `Over the last 30 days: ${totals.sales} sales from ${totals.convos} conversations across ${totals.hours.toFixed(1)} hours.`,
      top_3_issues: sortedStages.length ? sortedStages : ['OPENING', 'OBJECTIONS', 'CLOSE'],
      coaching_plan_week: [
        'Day 1: Review opener and qualification checklist.',
        'Day 3: Objection handling role play (10 scenarios).',
        'Day 5: Close-focused field observation and feedback.'
      ],
      suggested_script_lines: [
        'Most homeowners tell me they want reliability first—how are you handling that today?',
        'Before I answer cost, can I quickly show what this replaces for you?',
        'If this solved your top concern, would you be comfortable moving forward this week?'
      ],
      metrics_to_track: ['Conversations/hour', 'Objection-to-close rate', 'First 30-second engagement score']
    };
  }

  return {
    summary: 'LLM integration ready. Add provider-specific implementation using OPENAI_API_KEY.',
    top_3_issues: sortedStages,
    coaching_plan_week: ['Run daily call review with manager.'],
    suggested_script_lines: ['Customize script line per persona.'],
    metrics_to_track: ['Conversation quality score']
  };
}
