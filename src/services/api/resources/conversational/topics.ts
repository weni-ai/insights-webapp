import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useConversational } from '@/store/modules/conversational/conversational';
import { createRequestQuery } from '@/utils/request';

interface topicDistributionMetric {
  uuid: string;
  label: string;
  value: number;
  percentage: number;
  subtopics?: topicDistributionMetric[];
}

interface topicDistributionMetricApi {
  uuid: string;
  name: string;
  quantity: number;
  percentage: number;
  subtopics: topicDistributionMetricApi[];
}

interface topicDistributionMetricApiResponse {
  topics: topicDistributionMetricApi[];
}

interface ConversationalTopicsDistribution {
  topics: topicDistributionMetric[];
}

interface QueryParams {
  start_date?: string;
  end_date?: string;
  [key: string]: string;
}

interface ConversationalFormTopics {
  name: string;
  uuid: string;
  description?: string;
  created_at: string;
  subtopic?: {
    name: string;
    uuid: string;
    description?: string;
    created_at: string;
    topic_uuid: string;
    topic_name: string;
  }[];
}

export default {
  async getConversationalTopicsDistribution(
    type: 'HUMAN' | 'AI',
    queryParams: QueryParams = {},
  ): Promise<ConversationalTopicsDistribution> {
    const { project } = useConfig();
    const { appliedFilters } = useConversational();

    const params = createRequestQuery(queryParams);

    const formattedParams = {
      type,
      project_uuid: project.uuid,
      ...appliedFilters,
      ...params,
    };

    const response = (await http.get(
      `/metrics/conversations/topics-distribution/`,
      {
        params: formattedParams,
      },
    )) as topicDistributionMetricApiResponse;

    const formattedResponse: ConversationalTopicsDistribution = {
      topics: response.topics.map((topic) => ({
        uuid: topic.uuid,
        label: topic.name,
        value: topic.quantity,
        percentage: topic.percentage,
        subtopics:
          topic?.subtopics?.map((subtopic) => ({
            uuid: subtopic.uuid,
            label: subtopic.name,
            value: subtopic.quantity,
            percentage: subtopic.percentage,
          })) ?? [],
      })),
    };

    return formattedResponse;
  },

  async getConversationalFormTopics(): Promise<ConversationalFormTopics[]> {
    const { project } = useConfig();

    const response = (await http.get(`/metrics/conversations/topics/`, {
      params: {
        project_uuid: project.uuid,
      },
    })) as ConversationalFormTopics[];

    return response;
  },

  async createTopic(topic: {
    name: string;
    description?: string;
  }): Promise<ConversationalFormTopics> {
    const { project } = useConfig();

    const response = (await http.post(`/metrics/conversations/topics/`, {
      ...topic,
      project_uuid: project.uuid,
    })) as ConversationalFormTopics;

    return response;
  },

  async createSubTopic(
    topicUuid: string,
    subtopic: {
      name: string;
      description?: string;
    },
  ): Promise<ConversationalFormTopics> {
    const { project } = useConfig();

    const response = (await http.post(
      `/metrics/conversations/topics/${topicUuid}/subtopics/`,
      {
        ...subtopic,
        project_uuid: project.uuid,
      },
    )) as ConversationalFormTopics;

    return response;
  },

  async deleteTopic(topicUuid: string): Promise<void> {
    await http.delete(`/metrics/conversations/topics/${topicUuid}/`);
  },

  async deleteSubTopic(topicUuid: string, subtopicUuid: string): Promise<void> {
    await http.delete(
      `/metrics/conversations/topics/${topicUuid}/subtopics/${subtopicUuid}/`,
    );
  },
};

export type {
  topicDistributionMetric,
  ConversationalTopicsDistribution,
  QueryParams,
  ConversationalFormTopics,
};
