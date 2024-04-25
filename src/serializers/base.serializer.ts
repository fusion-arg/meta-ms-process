export interface SerializerResponse<T> {
  data: T;
  meta?: any;
}

export interface SerializerResponsePath<T> extends SerializerResponse<T> {
  path: any;
}

export abstract class BaseSerializer<T> {
  abstract serialize(item: T): any;

  respondManyWithPath(
    items: T[],
    path: T[],
    pagination?: any,
  ): SerializerResponsePath<any[]> {
    const data = items.map((item) => this.serialize(item));
    return {
      data,
      path: path,
      meta: pagination,
    };
  }

  respondMany(items: T[], pagination?: any): SerializerResponse<any[]> {
    const data = items.map((item) => this.serialize(item));
    return {
      data,
      meta: pagination,
    };
  }

  respond(item: T): SerializerResponse<any> {
    const data = this.serialize(item);
    return {
      data,
    };
  }
}
