export abstract class APIMessage<Response> {
  abstract readonly apiName: string
  declare readonly responseType: Response
}
