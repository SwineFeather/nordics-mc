
import { ChatMessage } from './useChatMessages';

const mockupUsers = [
  { id: 'user1', full_name: 'Steve_Builder', email: 'steve@nordics.com', avatar_url: null },
  { id: 'user2', full_name: 'AlexCrafter', email: 'alex@nordics.com', avatar_url: null },
  { id: 'user3', full_name: 'NationLeader', email: 'leader@nordics.com', avatar_url: null },
  { id: 'user4', full_name: 'DiamondMiner', email: 'miner@nordics.com', avatar_url: null },
  { id: 'user5', full_name: 'PoliticalAce', email: 'politics@nordics.com', avatar_url: null },
];

export const getMockupMessages = (channelId: string): ChatMessage[] => {
  if (channelId === 'minecraft-mock') {
    return [
      {
        id: 'mock1',
        channel_id: channelId,
        user_id: 'user1',
        content: 'Just finished building a massive castle! 🏰 Anyone want to check it out?',
        is_saved: false,
        is_edited: false,
        parent_id: null,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
        author: mockupUsers[0]
      },
      {
        id: 'mock2',
        channel_id: channelId,
        user_id: 'user2',
        content: '@Steve_Builder That sounds amazing! What coordinates?',
        is_saved: false,
        is_edited: false,
        parent_id: null,
        created_at: new Date(Date.now() - 3500000).toISOString(),
        updated_at: new Date(Date.now() - 3500000).toISOString(),
        author: mockupUsers[1]
      },
      {
        id: 'mock3',
        channel_id: channelId,
        user_id: 'user4',
        content: 'Found a huge diamond vein at Y=12! 💎 Come mining with me!',
        is_saved: false,
        is_edited: false,
        parent_id: null,
        created_at: new Date(Date.now() - 1800000).toISOString(),
        updated_at: new Date(Date.now() - 1800000).toISOString(),
        author: mockupUsers[3]
      },
      {
        id: 'mock4',
        channel_id: channelId,
        user_id: 'user1',
        content: '@AlexCrafter The castle is at X:250, Z:-150. Built it near the ocean!',
        is_saved: false,
        is_edited: false,
        parent_id: null,
        created_at: new Date(Date.now() - 900000).toISOString(),
        updated_at: new Date(Date.now() - 900000).toISOString(),
        author: mockupUsers[0]
      }
    ];
  } else if (channelId === 'nation-mock') {
    return [
      {
        id: 'nation1',
        channel_id: channelId,
        user_id: 'user3',
        content: 'The Northern Alliance is looking for new members! We offer protection and trade benefits 🛡️',
        is_saved: false,
        is_edited: false,
        parent_id: null,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        updated_at: new Date(Date.now() - 7200000).toISOString(),
        author: mockupUsers[2]
      },
      {
        id: 'nation2',
        channel_id: channelId,
        user_id: 'user5',
        content: '@NationLeader What are the requirements to join? Our town has 15 active players.',
        is_saved: false,
        is_edited: false,
        parent_id: null,
        created_at: new Date(Date.now() - 6800000).toISOString(),
        updated_at: new Date(Date.now() - 6800000).toISOString(),
        author: mockupUsers[4]
      },
      {
        id: 'nation3',
        channel_id: channelId,
        user_id: 'user2',
        content: 'The trade summit next week is going to be huge! All nations should attend 📈',
        is_saved: false,
        is_edited: false,
        parent_id: null,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
        author: mockupUsers[1]
      },
      {
        id: 'nation4',
        channel_id: channelId,
        user_id: 'user3',
        content: '@PoliticalAce We require a minimum of 10 active players and a peaceful diplomatic stance. DM me for details!',
        is_saved: false,
        is_edited: false,
        parent_id: null,
        created_at: new Date(Date.now() - 1800000).toISOString(),
        updated_at: new Date(Date.now() - 1800000).toISOString(),
        author: mockupUsers[2]
      }
    ];
  }
  return [];
};
