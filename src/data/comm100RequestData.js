export function getTotalChatsRequestBody(startDate, endDate) {
  return {
    cubeEntities: [
      {
        name: "Chat",
        fields: [
          {
            name: "time",
            calculationType: "originalValue",
            valueType: "string",
            expression: "",
            fieldName: "",
            conditionExpression: "",
            conditions: [],
          },
          {
            name: "botOnlyChats",
            calculationType: "count",
            valueType: "int",
            expression: "",
            fieldName: "Id",
            conditionExpression: "Status & ChatType",
            conditions: [
              {
                name: "Status",
                fieldName: "Status",
                operate: "equals",
                values: ["0", "1", "2"],
              },
              {
                name: "ChatType",
                fieldName: "ChatType",
                operate: "equals",
                values: ["1"],
              },
            ],
          },
          {
            name: "chatsFromBotToOnlineAgent",
            calculationType: "count",
            valueType: "int",
            expression: "",
            fieldName: "Id",
            conditionExpression: "Status & ChatType",
            conditions: [
              {
                name: "Status",
                fieldName: "Status",
                operate: "equals",
                values: ["0"],
              },
              {
                name: "ChatType",
                fieldName: "ChatType",
                operate: "equals",
                values: ["2"],
              },
            ],
          },
          {
            name: "chatsFromBotToOfflineMessage",
            calculationType: "count",
            valueType: "int",
            fieldName: "Id",
            conditionExpression: "ChatType4",
            conditions: [
              {
                name: "ChatType4",
                fieldName: "ChatType",
                operate: "equals",
                values: ["4"],
              },
            ],
          },
          {
            name: "chatFromChatbotToAgentOrOfflineMessage",
            calculationType: "expression",
            valueType: "int",
            expression: "chatsFromBotToOnlineAgent + chatsFromBotToOfflineMessage",
            conditionExpression: "",
            conditions: [],
          },
          {
            name: "chatbotChats",
            calculationType: "expression",
            valueType: "int",
            expression: "botOnlyChats + chatsFromBotToOnlineAgent + chatsFromBotToOfflineMessage",
            conditionExpression: "",
            conditions: [],
          },
          {
            name: "percentageOfBotOnly",
            calculationType: "expression",
            valueType: "percent",
            expression: "botOnlyChats/chatbotChats",
            fieldName: "",
            conditionExpression: "",
            conditions: [],
          },
          {
            name: "avgScore",
            calculationType: "average",
            valueType: "decimal",
            expression: "",
            fieldName: "PostChatSurvey.RatingGrade",
            conditionExpression: "Status & ChatType & RatingGrade",
            conditions: [
              {
                name: "Status",
                fieldName: "Status",
                operate: "equals",
                values: ["0", "2"],
              },
              {
                name: "ChatType",
                fieldName: "ChatType",
                operate: "equals",
                values: ["1"],
              },
              {
                name: "RatingGrade",
                fieldName: "PostChatSurvey.RatingGrade",
                operate: "notEquals",
                values: ["-1"],
              },
            ],
          },
          {
            name: "botTotalChatsTime",
            calculationType: "sum",
            valueType: "timespan",
            expression: "",
            fieldName: "BotDuration",
            conditionExpression: "Status & ChatType",
            conditions: [
              {
                name: "Status",
                fieldName: "Status",
                operate: "equals",
                values: ["0", "2"],
              },
              {
                name: "ChatType",
                fieldName: "ChatType",
                operate: "equals",
                values: ["1"],
              },
            ],
          },
        ],
        rowGroups: [
          {
            name: "time",
            fieldName: "RequestedTime",
            isFull: true,
            timeDisplayType: "day",
          },
        ],
        filters: [
          {
            fieldName: "RequestedTime",
            matchType: "between",
            value: [startDate, endDate],
          },
        ],
      },
    ],
    mergeType: "column",
    timezone: -420,
  };
}

export function getChatsByAgentRequestBody(startDate, endDate, categories) {
  return {
    cubeEntities: [
      {
        name: "AgentStatusLog",
        fields: [
          {
            name: "linearChatTime",
            calculationType: "sum",
            valueType: "timespan",
            expression: "",
            fieldName: "LinearChatTime",
            conditionExpression: "",
            conditionMatchType: "all",
            conditions: [],
            enumItems: [],
          },
          {
            name: "idleTime",
            calculationType: "sum",
            valueType: "timespan",
            expression: "",
            fieldName: "IdleTime",
            conditionExpression: "",
            conditionMatchType: "all",
            conditions: [],
            enumItems: [],
          },
          {
            name: "loginTime",
            calculationType: "sum",
            valueType: "timespan",
            expression: "",
            fieldName: "LoggedInTime",
            conditionExpression: "",
            conditionMatchType: "all",
            conditions: [],
            enumItems: [],
          },
          {
            name: "agentUtilization",
            calculationType: "expression",
            valueType: "percent",
            expression: "linearChatTime/loginTime",
            fieldName: "",
            conditionExpression: "",
            conditionMatchType: "all",
            conditions: [],
            enumItems: [],
          },
          {
            name: "agent",
            calculationType: "originalValue",
            valueType: "string",
            expression: "",
            fieldName: "Agent.DisplayName",
            conditionExpression: "",
            conditionMatchType: "all",
            conditions: [],
            enumItems: [],
          },
          {
            name: "agentId",
            calculationType: "originalValue",
            valueType: "string",
            expression: "",
            fieldName: "AgentId",
            conditionExpression: "",
            conditionMatchType: "all",
            conditions: [],
            enumItems: [],
          },
          {
            name: "agentFirstName",
            calculationType: "originalValue",
            valueType: "string",
            expression: "",
            fieldName: "Agent.FirstName",
            conditionExpression: "",
            conditionMatchType: "all",
            conditions: [],
            enumItems: [],
          },
          {
            name: "agentLastName",
            calculationType: "originalValue",
            valueType: "string",
            expression: "",
            fieldName: "Agent.LastName",
            conditionExpression: "",
            conditionMatchType: "all",
            conditions: [],
            enumItems: [],
          },
        ],
        rowGroups: [
          {
            name: "agentId",
            fieldName: "AgentId",
            isFull: true,
          },
        ],
        filters: [
          {
            fieldName: "StartTime",
            matchType: "between",
            value: [startDate, endDate],
          },
        ],
      },
      {
        name: "Chat",
        fields: [
          {
            name: "chats",
            calculationType: "count",
            valueType: "int",
            expression: "",
            fieldName: "Id",
            conditionExpression: "NormalStatus",
            conditionMatchType: "all",
            conditions: [
              {
                name: "NormalStatus",
                fieldName: "Status",
                operate: "equals",
                values: ["0"],
              },
            ],
            enumItems: [],
          },
          {
            name: "avgConcurrentChats",
            calculationType: "expression",
            valueType: "decimal",
            expression: "totalChatTime/loginTime",
            fieldName: "",
            conditionExpression: "",
            conditionMatchType: "all",
            conditions: [],
            enumItems: [],
          },
          {
            name: "totalChatTime",
            calculationType: "sum",
            valueType: "timespan",
            expression: "",
            fieldName: "ChatAgent.Duration",
            conditionExpression: "NormalStatus",
            conditionMatchType: "all",
            conditions: [
              {
                name: "NormalStatus",
                fieldName: "Status",
                operate: "equals",
                values: ["0"],
              },
            ],
            enumItems: [],
          },
        ],
        rowGroups: [
          {
            name: "agentId",
            fieldName: "ChatAgent.AgentId",
            isFull: true,
          },
        ],
        filters: [
          {
            fieldName: "RequestedTime",
            matchType: "between",
            value: [startDate, endDate],
          },
          {
            fieldName: "ChatAgent.Agent.Id",
            matchType: "notEquals",
            value: [null],
          },
          {
            fieldName: "Duration",
            matchType: "greaterThan",
            value: ["0"],
          },
          {
            fieldName: "ChatType",
            matchType: "equals",
            value: ["0", "2"],
          },
          {
            name: "ChatWrapupCategory.CategoryOption.Id",
            fieldName: "ChatWrapupCategory.CategoryOption.Id",
            operator: "equals",
            value: categories,
          },
        ],
      },
    ],
    mergeType: "column",
    timezone: "Pacific Standard Time",
  };
}

export function getChatsCategoriesRequestBody() {
  return {
    cubeEntities: [
      {
        name: "Chat",
        fields: [
          {
            name: "categoryOptionName",
            calculationType: "originalValue",
            valueType: "string",
            expression: "",
            fieldName: "ChatWrapupCategory.CategoryOption.Name",
            conditions: [],
          },
          {
            name: "categoryOptionID",
            calculationType: "originalValue",
            valueType: "string",
            expression: "",
            fieldName: "ChatWrapupCategory.CategoryOptionId",
            conditions: [],
          },
        ],
        rowGroups: [
          {
            name: "categoryId",
            fieldName: "ChatWrapupCategory.CategoryOptionId",
            isFull: true,
          },
        ],
        filters: [],
      },
    ],
    mergeType: "column",
    timezone: "Pacific Standard Time",
  };
}
