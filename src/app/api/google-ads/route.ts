import { NextRequest, NextResponse } from "next/server";

// Google Ads API v18 REST endpoint for campaign metrics
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { customerId, clientId, clientSecret, refreshToken, dateFrom, dateTo } = body;

  if (!customerId || !clientId || !clientSecret || !refreshToken) {
    return NextResponse.json(
      { error: "Google広告のAPI設定が不完全です。設定タブで全項目を入力してください。" },
      { status: 400 }
    );
  }

  try {
    // Step 1: Exchange refresh token for access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      return NextResponse.json(
        { error: `OAuth認証エラー: ${err}` },
        { status: 401 }
      );
    }

    const { access_token } = await tokenRes.json();

    // Step 2: Query Google Ads API for campaign metrics
    const cleanCustomerId = customerId.replace(/-/g, "");
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "";

    const query = `
      SELECT
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.cost_micros,
        segments.date
      FROM campaign
      WHERE segments.date BETWEEN '${dateFrom}' AND '${dateTo}'
        AND campaign.status = 'ENABLED'
      ORDER BY segments.date ASC
    `;

    const adsRes = await fetch(
      `https://googleads.googleapis.com/v18/customers/${cleanCustomerId}/googleAds:searchStream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
          "developer-token": developerToken,
        },
        body: JSON.stringify({ query }),
      }
    );

    if (!adsRes.ok) {
      const err = await adsRes.text();
      return NextResponse.json(
        { error: `Google Ads APIエラー: ${err}` },
        { status: 500 }
      );
    }

    const adsData = await adsRes.json();

    // Step 3: Transform to ManualInputData format
    const results: Array<{
      date: string;
      campaignName: string;
      impressions: number;
      clicks: number;
      conversions: number;
      cost: number;
      memo: string;
    }> = [];

    if (Array.isArray(adsData)) {
      for (const batch of adsData) {
        if (batch.results) {
          for (const row of batch.results) {
            results.push({
              date: row.segments?.date || "",
              campaignName: row.campaign?.name || "不明",
              impressions: Number(row.metrics?.impressions || 0),
              clicks: Number(row.metrics?.clicks || 0),
              conversions: Number(row.metrics?.conversions || 0),
              cost: Number(row.metrics?.costMicros || 0) / 1_000_000,
              memo: "Google Ads API自動取得",
            });
          }
        }
      }
    }

    return NextResponse.json({ data: results, count: results.length });
  } catch (err) {
    return NextResponse.json(
      { error: `接続エラー: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
