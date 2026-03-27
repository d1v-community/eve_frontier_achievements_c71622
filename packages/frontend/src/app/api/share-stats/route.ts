import { getSqlClient, hasDatabaseUrl } from '~~/server/db/client.mjs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    if (!hasDatabaseUrl()) {
      return Response.json({ success: true, tracked: false })
    }

    const body = await request.json()
    const { medalSlug, platform, walletAddress } = body

    if (!medalSlug || !platform) {
      return Response.json(
        { error: 'medalSlug and platform are required' },
        { status: 400 }
      )
    }

    const sql = getSqlClient()
    await sql`
      INSERT INTO share_events (medal_slug, platform, wallet_address)
      VALUES (${medalSlug}, ${platform}, ${walletAddress || null})
    `

    return Response.json({ success: true, tracked: true })
  } catch (error) {
    console.error('Share event tracking error:', error)
    return Response.json({ success: true, tracked: false })
  }
}
