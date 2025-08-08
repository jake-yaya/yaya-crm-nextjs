export function getChatByMetricsRequestBody(startDate, endDate) {
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
