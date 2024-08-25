import { Decorator, VaasServerType } from 'vaas-framework'
import { MongoClient } from 'mongodb';

const client = new MongoClient(`mongodb://root:123456@host.docker.internal:27017`);

export default class Hello {
  async getChatCollection() {
    await client.connect();
    const db = client.db('test');
    const collection = db.collection('chat');
    return collection
  }

  // 发送消息
  async sendMessage({from,to,message}) {
    const collection = await this.getChatCollection()
    return await collection.insertOne({
      from,
      to,
      message,
      createTime:Date.now()
    });
  }

  // 接收消息
  async getMessage({username, createTime}) {
    const collection = await this.getChatCollection()
    return await collection.find({
      to:username, 
      createTime:{
        ['$gte']:createTime
      }
    }).toArray()
  }

  @Decorator.VaasServer({ type: 'websocket', method: 'get' })
  async message ({ data }: { data: string }) {
    const jsonData = JSON.parse(data)
    if(jsonData.type==='send') {
      const result = await this.sendMessage(jsonData.data)
      return {data:result.insertedId.toString(), type:'send'}
    }
    if(jsonData.type==='receive') {
      const data = await this.getMessage(jsonData.data)
      return {data, type:'receive'}
    }
    return {data:'pong', type:'ping'}
  }
}
