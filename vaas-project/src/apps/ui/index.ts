import { type VaasServerType, Decorator } from 'vaas-framework'
import { promises as fsPromises, createReadStream } from 'fs'
import * as path from 'path'

const type = process.env.renderType || 'hash'
export default class UI {
  @Decorator.VaasServer({ type: 'http', method: 'get', routerName: '/' })
  async index ({ req, res }: VaasServerType.HttpParams) {
    return (await fsPromises.readFile(path.join(__dirname, './public/index.html'))).toString()
  }

  @Decorator.VaasServer({ type: 'http', method: 'get', routerName: '/:fileName*' })
  async render ({ req, res }: VaasServerType.HttpParams) {
    const { fileName } = req.params
    const filePath = path.join(__dirname, `./public/${fileName}`)
    if(type==='hash') {
      return createReadStream(filePath)
    } else {
      try {
        const stat = await fsPromises.stat(filePath);
        if(stat.isFile()) {
          return createReadStream(filePath)
        } else {
          throw new Error('这个路径不是文件或文件不存在')
        }
      } catch(err) {
        return (await fsPromises.readFile(path.join(__dirname, './public/index.html'))).toString()
      }
    }
  }

  @Decorator.VaasServer({ type: 'http', method: 'get', routerName: '/location' })
  async location ({ req, res }: VaasServerType.HttpParams) {
    res.status = 302
    res.headers = {
      location: 'https://github.com/virtual-less/vaas-framework'
    }
    return `redirect to ${res.headers.location}`
  }
}
