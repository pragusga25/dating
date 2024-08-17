import schedule from 'node-schedule'
import { context } from './context'

export const resetDailySwipeCountScheduler = () => {
  // Schedule the job to run every day at midnight (00:00)
  schedule.scheduleJob('0 0 * * *', async () => {
    console.log('Running daily swipe count reset job')
    try {
      await context.prisma.user.updateMany({
        data: {
          dailySwipesCount: 0,
        },
      })
      console.log('Daily swipe count reset successful')
    } catch (error) {
      console.error('Error resetting daily swipe count:', error)
    }
  })
}
