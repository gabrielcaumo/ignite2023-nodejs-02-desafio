import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { knex } from '../database'
import { checkUserIdExists } from '../middlewares/check-user-id-exists'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
    })

    const { name } = createUserBodySchema.parse(request.body)
    const userId = randomUUID()

    await knex('users').insert({
      id: userId,
      name,
    })

    reply.cookie('userId', userId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })

    return reply.status(201).send()
  })

  app.get('/metrics', { preHandler: [checkUserIdExists] }, async (request) => {
    const { userId } = request.cookies

    const meals = await knex('meals').where('user_id', userId).select()

    let totalMeals = 0
    let onDietMeals = 0
    let outDietMeals = 0
    let onDietSequence = 0
    let highestOnDietSequence = 0

    for (const meal of meals) {
      totalMeals += 1
      if (meal.on_diet) {
        onDietMeals += 1
        onDietSequence += 1
        if (onDietSequence > highestOnDietSequence) {
          highestOnDietSequence += 1
        }
      } else {
        outDietMeals += 1
        onDietSequence = 0
      }
    }

    return {
      totalMeals,
      onDietMeals,
      outDietMeals,
      highestOnDietSequence,
    }
  })
}
