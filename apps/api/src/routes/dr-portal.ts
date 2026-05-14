// Doctor Hub — Portal home stats endpoint.
// Aggregates everything the /dr landing page needs in a single call.

import type { FastifyPluginAsync } from 'fastify'
import { requireDrRead } from '../lib/dr-access.js'
import { totalCreditsThisYear } from '../lib/cme-credit.js'

export const autoPrefix = '/dr'

const drPortal: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const userId = request.session!.user.id

    const [
      myCases, myProtocols, myComments, upcomingWebinars,
      bookmarkCount, subscriptionCount, latestCases, totalCredits, role,
    ] = await Promise.all([
      fastify.prisma.clinicalCase.count({     where: { authorId: userId } }),
      fastify.prisma.clinicalProtocol.count({ where: { authorId: userId } }),
      fastify.prisma.caseComment.count({      where: { authorId: userId } }),
      fastify.prisma.webinarRegistration.findMany({
        where:   { userId, attended: false, webinar: { scheduledFor: { gte: new Date() } } },
        include: { webinar: { select: { id: true, slug: true, title: true, scheduledFor: true, durationMin: true, cmeCredits: true } } },
        orderBy: { webinar: { scheduledFor: 'asc' } },
        take:    5,
      }),
      fastify.prisma.researchPaperBookmark.count({ where: { userId } }),
      fastify.prisma.journalSubscription.count({   where: { userId } }),
      fastify.prisma.clinicalCase.findMany({
        where:   { status: 'published' },
        orderBy: { publishedAt: 'desc' },
        take:    5,
        include: { author: { select: { id: true, name: true } } },
      }),
      totalCreditsThisYear(fastify, userId),
      Promise.resolve(request.session!.user.role),
    ])

    return {
      role,
      stats: {
        myCases, myProtocols, myComments,
        bookmarks: bookmarkCount, subscriptions: subscriptionCount,
        totalCreditsThisYear: totalCredits,
      },
      upcomingWebinars,
      latestCases,
    }
  })
}

export default drPortal
