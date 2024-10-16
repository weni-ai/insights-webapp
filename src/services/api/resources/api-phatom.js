import axios from 'axios';

const client = axios.create({
  baseURL: `https://insights.apip.dev.cloud.weni.ai/api/v1`,
});

async function getWidgetMockData(dashboardUuid, widgetUuid) {
  const url = `/dashboards/${dashboardUuid}/widgets/${widgetUuid}/data/`;

  try {
    const response = await client.get(url);

    return response.data;
  } catch (error) {
    console.error('Error api phantom get widget:', error);
  }
}

export { getWidgetMockData };
