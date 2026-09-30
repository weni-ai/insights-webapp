import { describe, expect, it } from 'vitest';

import EmailIcon from '../EmailIcon.vue';
import FacebookIcon from '../FacebookIcon.vue';
import InstagramIcon from '../InstagramIcon.vue';
import OthersIcon from '../OthersIcon.vue';
import ShoppingAssistantIcon from '../ShoppingAssistantIcon.vue';
import TeamsIcon from '../TeamsIcon.vue';
import WhatsappIcon from '../WhatsappIcon.vue';
import {
  CHANNEL_LABEL_COMPONENT_MAP,
  getChannelLabelComponent,
} from '../channelIconMap';

describe('channelIconMap', () => {
  const expectedMap = {
    email: EmailIcon,
    facebook: FacebookIcon,
    instagram: InstagramIcon,
    others: OthersIcon,
    shopping_assistant: ShoppingAssistantIcon,
    teams: TeamsIcon,
    whatsapp: WhatsappIcon,
  };

  it('maps each known channel to its icon component', () => {
    expect(CHANNEL_LABEL_COMPONENT_MAP).toEqual(expectedMap);
  });

  it.each(Object.entries(expectedMap))(
    'returns the %s icon component',
    (channel, component) => {
      expect(getChannelLabelComponent(channel)).toBe(component);
    },
  );

  it('falls back to OthersIcon for an unknown channel', () => {
    expect(getChannelLabelComponent('unknown')).toBe(OthersIcon);
    expect(getChannelLabelComponent('')).toBe(OthersIcon);
  });
});
