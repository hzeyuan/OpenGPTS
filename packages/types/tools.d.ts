export interface ApiDescription {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: {
        [key: string]: {
          type: string;
          description?: string;
          enum?: string[];
        };
      };
      required: string[];
    };
  }

   