import { type VaasServerType, Decorator } from 'vaas-framework'
import { MongoClient, ObjectId } from 'mongodb';
import * as jwt from 'jsonwebtoken';

interface RpcGetUserInfoByIdParams {
  id: number
}
interface RpcGetUserInfoByIdResult {
  id: number
  name: string
}
const client = new MongoClient(`mongodb://root:123456@host.docker.internal:27017`);
const jwtSecret = '123456'

export default class User {
  @Decorator.VaasServer({ type: 'rpc' })
  async getUserInfoById ({ params }: VaasServerType.RpcParams<RpcGetUserInfoByIdParams>): Promise<RpcGetUserInfoByIdResult> {
    const data = [
      { id: 1, name: 'jack' },
      { id: 2, name: 'tom' },
      { id: 3, name: 'jan' }
    ]
    const user = data.find((e) => e.id === Number(params.id)) || { id: 0, name: 'world' }
    return user
  }

  async getUserCollection() {
    await client.connect();
    const db = client.db('test');
    const collection = db.collection('user');
    return collection
  }

  async getUserInfoByToken({token}:{token:string}) {
    let decodeData
    decodeData = jwt.verify(token.replace('Bearer ', ''), jwtSecret)
    const collection = await this.getUserCollection()
    const userRes = await collection.findOne({_id:new ObjectId(decodeData._id)})
    return {username: userRes.username}
  }

  @Decorator.VaasServer({ type: 'http', method: 'get', routerName:'/getUserInfoByToken' })
  async getUserInfoByTokenHTTP({ req, res }: VaasServerType.HttpParams) {
    return await this.getUserInfoByToken({token:String(req.headers['authorization'])})
  }

  @Decorator.VaasServer({ type: 'http', method: 'get' })
  async getUserNameList({ req, res }: VaasServerType.HttpParams) {
    // 鉴权
    const userInfo = await this.getUserInfoByToken({token:String(req.headers['authorization'])})
    const collection = await this.getUserCollection()
    const userList = await collection.find({username:{['$ne']:userInfo.username}}).toArray()
    return {data: userList.map(user=>user.username)}
  }

  @Decorator.VaasServer({ type: 'http', method: 'post' })
  async register({ req, res }: VaasServerType.HttpParams) {
    const {username, password} = req.body
    const collection = await this.getUserCollection()
    const userNameCount = await collection.countDocuments({username})
    if(userNameCount>0) {
      throw new Error('该用户已注册')
    }
    const results = await collection.insertOne({username, password})
    return { results }
  }

  @Decorator.VaasServer({ type: 'http', method: 'post' })
  async login({ req, res }: VaasServerType.HttpParams) {
    const {username, password} = req.body
    const collection = await this.getUserCollection()
    const userRes = await collection.findOne({username, password})
    if(!userRes) {
      throw new Error('用户名或密码错误')
    }
    const token = jwt.sign({_id:userRes._id.toString()}, jwtSecret)
    return { token }
  }
}
