import Realm, { ObjectType } from "realm";

export class News extends Realm.Object<News> {
  _id!: Realm.BSON.ObjectId;
  source!: ObjectType;
  author!: string | null;
  title!: string | null;
  description!: string | null;
  url!: string | null;
  urlToImage!: string | null;
  publishedAt!: string | null;
  content!: string | null;

  static schema = {
    name: 'News',
    properties: {
      _id: 'objectId',
      author: 'string?',
      title: 'string?',
      description: 'string?',
      url: 'string?',
      urlToImage: 'string?',
      publishedAt: 'string?',
      content: 'string?',
    },
    primaryKey: '_id',
  };
}
