import { Reward } from '../types';

/**
 * SHOP REWARDS
 *
 * How to add a new reward:
 * 1. Copy the template below
 * 2. Change the id (make it unique like 'r7', 'r8', etc.)
 * 3. Set the name, cost, and pick an emoji icon
 * 4. Choose a category: 'food', 'leisure', 'upgrade', or add your own
 * 5. Add it to the REWARDS array below
 *
 * Template:
 * { id: 'r7', name: 'Your Reward Name', cost: 100, icon: '🎁', category: 'leisure' }
 */

export const REWARDS: Reward[] = [
  // === FOOD & DRINKS ===
  {
    id: 'r1',
    name: 'Ramen Night',
    cost: 50,
    icon: '🍜',
    category: 'food'
  },
  {
    id: 'r4',
    name: 'Fancy Coffee',
    cost: 30,
    icon: '☕',
    category: 'food'
  },

  // === LEISURE & ENTERTAINMENT ===
  {
    id: 'r2',
    name: 'New Book',
    cost: 100,
    icon: '📚',
    category: 'leisure'
  },
  {
    id: 'r3',
    name: 'Movie Ticket',
    cost: 80,
    icon: '🎬',
    category: 'leisure'
  },
  {
    id: 'r5',
    name: 'Day Off',
    cost: 300,
    icon: '🏖️',
    category: 'leisure'
  },

  // === UPGRADES & BIG REWARDS ===
  {
    id: 'r6',
    name: 'Desk Upgrade',
    cost: 500,
    icon: '💻',
    category: 'upgrade'
  },

  // === ADD YOUR NEW REWARDS BELOW ===
  // { id: 'r7', name: 'Gaming Session', cost: 150, icon: '🎮', category: 'leisure' },
  // { id: 'r8', name: 'New Headphones', cost: 400, icon: '🎧', category: 'upgrade' },
  // { id: 'r9', name: 'Ice Cream', cost: 20, icon: '🍦', category: 'food' },
];

/**
 * POPULAR EMOJI IDEAS FOR REWARDS:
 *
 * Food: 🍕 🍔 🍟 🌮 🍱 🍣 🍰 🍪 🍦 🥤 🍺 🍷
 * Entertainment: 🎮 🎯 🎲 🎪 🎨 🎭 🎸 🎵 🎬 📺 🎤
 * Tech: 💻 ⌨️ 🖱️ 🎧 📱 ⌚ 📷 🎮 🕹️
 * Relaxation: 🏖️ 🌴 💆 🧘 🛀 💤 🌅
 * Shopping: 👕 👟 🎁 🛍️ 💎 👜 🕶️
 * Activities: 🏋️ ⚽ 🏀 🎾 🏊 🚴 🎿 🎣
 */
