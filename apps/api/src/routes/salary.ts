import type { FastifyPluginAsync } from 'fastify'
import { liveSalaryAggregates, estimateSalary, KERALA_GOVT_SCALES } from '../services/salaryInsights.js'

export const autoPrefix = '/salary'

const route: FastifyPluginAsync = async (fastify) => {
  // GET /salary/insights?specialization=&district=
  fastify.get('/insights', async (request) => {
    const { specialization, district } = request.query as { specialization?: string; district?: string }
    const live = await liveSalaryAggregates(fastify, { specialization, district })
    return {
      live,
      govtScales: KERALA_GOVT_SCALES,
    }
  })

  // GET /salary/estimate?qualification=BAMS&experienceYears=5&district=Ernakulam
  fastify.get('/estimate', async (request) => {
    const q = request.query as { qualification?: string; experienceYears?: string; district?: string }
    return estimateSalary({
      qualification:   q.qualification ?? null,
      experienceYears: q.experienceYears ? Number(q.experienceYears) || 0 : null,
      district:        q.district ?? null,
    })
  })
}

export default route
