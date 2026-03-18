export async function requestTossApi(event, { url, secretKey, body }) {
  const authorization = `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;

  try {
    const response = await $fetch.raw(url, {
      method: "POST",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body,
    });

    return {
      status: response.status,
      data: response._data,
    };
  } catch (error) {
    if (error.response) {
      return {
        status: error.response.status,
        data: error.response._data,
      };
    }

    throw error;
  }
}

export function getSecretKeys(event) {
  const config = useRuntimeConfig(event);

  return {
    widgetSecretKey: config.widgetSecretKey,
    apiSecretKey: config.apiSecretKey,
  };
}
