---
name: Reward Suggestion
about: Suggest a new reward for the shop
title: '[REWARD] '
labels: reward, enhancement
assignees: ''
---

## Reward Details

**Reward Name**: [e.g., "Gaming Session", "New Headphones"]

**Suggested Cost**: [e.g., 150 points]

**Category**:
- [ ] Food & Drinks
- [ ] Leisure & Entertainment
- [ ] Upgrades & Tech
- [ ] Other (specify): ___________

**Emoji Icon**: [e.g., 🎮, 🎧, 🍕]

## Description

Why would this be a good reward? What makes it motivating?

## Target Audience

Who would find this reward appealing?
- [ ] Students
- [ ] Remote workers
- [ ] Fitness enthusiasts
- [ ] Everyone
- [ ] Other: ___________

## Similar Rewards (Optional)

Are there similar rewards already in the shop? How is this different?

## Additional Context

Any other details about this reward suggestion.

---

**Quick Implementation**

If accepted, this reward can be added to `services/mockData.ts`:

```javascript
{
  id: 'rXX',
  name: 'Your Reward Name',
  cost: XX,
  icon: '🎁',
  category: 'leisure'
}
```

---

**Checklist:**
- [ ] I have checked the existing rewards in the shop
- [ ] This reward is appropriate and motivating
- [ ] I have provided all details above
