import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { knex } from '../database'
import { checkUserIdExists } from '../middlewares/check-user-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: [checkUserIdExists] }, async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      dateHour: z.string(),
      onDiet: z.boolean(),
    })

    const { name, description, dateHour, onDiet } = createMealBodySchema.parse(
      request.body,
    )
    const { userId } = request.cookies

    await knex('meals').insert({
      id: randomUUID(),
      user_id: userId,
      name,
      description,
      date_hour: dateHour,
      on_diet: onDiet,
    })

    return reply.status(201).send()
  })

  app.put(
    '/:id',
    { preHandler: [checkUserIdExists] },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        dateHour: z.string(),
        onDiet: z.boolean(),
      })

      const { id } = getMealParamsSchema.parse(request.params)
      const { userId } = request.cookies

      const meal = await knex('meals').where('id', id).first()

      if (!meal) {
        return reply.status(400).send({
          error: 'The ID does not exist',
        })
      }

      if (meal.user_id !== userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
        })
      }

      const { name, description, dateHour, onDiet } =
        createMealBodySchema.parse(request.body)

      const updatedData = {
        name,
        description,
        date_hour: dateHour,
        on_diet: onDiet,
      }

      await knex('meals').where('id', id).update(updatedData)

      return reply.status(201).send()
    },
  )

  app.delete(
    '/:id',
    { preHandler: [checkUserIdExists] },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)
      const { userId } = request.cookies

      const meal = await knex('meals').where('id', id).first()

      if (!meal) {
        return reply.status(400).send({
          error: 'The ID does not exist',
        })
      }

      if (meal.user_id !== userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
        })
      }

      await knex('meals').where('id', id).delete()

      return reply.status(201).send()
    },
  )

  app.get('/', { preHandler: [checkUserIdExists] }, async (request, reply) => {
    const { userId } = request.cookies

    const meals = await knex('meals')
      .where({
        user_id: userId,
      })
      .select()

    return { meals }
  })

  app.get(
    '/:id',
    { preHandler: [checkUserIdExists] },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)
      const { userId } = request.cookies

      const meal = await knex('meals')
        .where({
          id,
          user_id: userId,
        })
        .first()

      if (!meal) {
        return reply.status(400).send({
          error: 'The ID does not exist',
        })
      }

      return { meal }
    },
  )
}
