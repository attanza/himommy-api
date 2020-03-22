export interface IImageUpload {
  image: any;
  modelName: string;
  modelId: string;
  imageKey: string;
  redisKey: string;
  mqttTopic?: string;
}
