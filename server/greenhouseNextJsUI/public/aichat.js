window.watsonAssistantChatOptions = {
  integrationID: 'a44b997d-eda4-4a88-9fe9-026de889c22c', // The ID of this integration.
  region: 'aws-us-east-1', // The region your integration is hosted in.
  serviceInstanceID: '20240514-1357-3436-40d4-aa4d943b77c0', // The ID of your service instance.
  orchestrateUIAgentExtensions: false, // If you wish to enable optional UI Agent extensions.
  onLoad: async (instance) => {
    await instance.render();
  },
};
setTimeout(function () {
  const t = document.createElement('script');
  t.src =
    'https://web-chat.global.assistant.watson.appdomain.cloud/versions/' +
    (window.watsonAssistantChatOptions.clientVersion || 'latest') +
    '/WatsonAssistantChatEntry.js';
  document.head.appendChild(t);
});
