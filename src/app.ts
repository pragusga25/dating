import express, { type Express, type Request, type Response } from 'express'
import { errorMiddleware } from './__shared__/middlewares'
import { authRouters } from './auth/routers'
import { premiumPackageRouters } from './premium-package/routers'
import { resetDailySwipeCountScheduler } from './schedulers'
import { swipeRouters } from './swipe/routers'

const routers = [...authRouters, ...swipeRouters, ...premiumPackageRouters]
const app: Express = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (_req: Request, res: Response) => {
  res.send('Hello, World!')
})
app.use('/api', ...routers)
app.use(errorMiddleware)

resetDailySwipeCountScheduler()

export default app
