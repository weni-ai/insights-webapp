import type { Component } from 'vue';

import EmailIcon from './EmailIcon.vue';
import FacebookIcon from './FacebookIcon.vue';
import InstagramIcon from './InstagramIcon.vue';
import OthersIcon from './OthersIcon.vue';
import ShoppingAssistantIcon from './ShoppingAssistantIcon.vue';
import TeamsIcon from './TeamsIcon.vue';
import WhatsappIcon from './WhatsappIcon.vue';

export const CHANNEL_LABEL_COMPONENT_MAP: Record<string, Component> = {
  email: EmailIcon,
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  others: OthersIcon,
  shopping_assistant: ShoppingAssistantIcon,
  teams: TeamsIcon,
  whatsapp: WhatsappIcon,
};

export const getChannelLabelComponent = (channelName: string): Component =>
  CHANNEL_LABEL_COMPONENT_MAP[channelName] ?? OthersIcon;
