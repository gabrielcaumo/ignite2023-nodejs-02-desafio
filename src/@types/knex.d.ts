// eslint-disable-next-line
import { Knex } from 'knex'

interface User {
  id: string
  name: string
  total_meals: number
  on_diet_meals: number
  out_diet_meals: number
  highest_on_diet_sequence: number
  created_at: string
}

interface Meal {
  id: string
  user_id: string
  name: string
  description: string
  date_hour: string
  on_diet: boolean
  created_at: string
}

declare module 'knex/types/tables' {
  export interface Tables {
    users: User
    meals: Meal
  }
}
