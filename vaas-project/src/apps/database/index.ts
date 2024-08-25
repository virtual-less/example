import { type VaasServerType, Decorator } from 'vaas-framework'
import * as mysql from 'mysql2/promise';
import { MongoClient } from 'mongodb';
import { Redis } from 'ioredis';

const host = '127.0.0.1'
export default class DataBase {
    @Decorator.VaasServer({ type: 'http', method: 'get' })
    async mysql ({ req, res }: VaasServerType.HttpParams) {
        const connection = await mysql.createConnection({
            host,
            user: 'root',
            password:'123456',
            database: 'test',
        });
        // 增
        await connection.execute("INSERT INTO `test` (`name`, `age`) VALUES ('李四', '21')")
        // 改
        await connection.execute("UPDATE `test` SET `age`=22 where `name`='李四'")
        // 查
        const [results, fields] = await connection.query(
            'SELECT * FROM `test`'
        );
        // 删
        await connection.execute("DELETE FROM `test` where `name`='李四'")
        return {results}
    }

    @Decorator.VaasServer({ type: 'http', method: 'get' })
    async mongo ({ req, res }: VaasServerType.HttpParams) {
        const client = new MongoClient(`mongodb://root:123456@${host}:27017`);
        await client.connect();
        const db = client.db('test');
        const collection = db.collection('test');
        // 插入
        await collection.insertOne({name:'李四',age:31})
        // 更新
        await collection.updateMany({name:'李四'},{
            $set:{
                age:35
            }
        })
        // 查询
        const results = await collection.find({}, { projection: { _id: 0 } }).toArray()
        // 删除
        await collection.deleteMany({name:'李四'})
        return {results}
    }

    @Decorator.VaasServer({ type: 'http', method: 'get' })
    async redis ({ req, res }: VaasServerType.HttpParams) {
        const redis = new Redis({
            port: 6379,
            host,
            password: "123456"
        });
        // 增
        redis.hset('test',{李四:21})
        // 改
        redis.hset('test',{李四:22})
        // 查
        const results = await redis.hgetall('test');
        // 删
        redis.hdel('test','李四')
        return {results}
    }
}