import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward the request to Fastify backend
    const fastifyUrl = process.env.FASTIFY_API_URL || "http://fastify:3000";
    const response = await fetch(`${fastifyUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Extract the JWT cookie from Fastify response
    const setCookieHeader = response.headers.get("set-cookie");
    
    // Create success response
    const nextResponse = NextResponse.json(data, { status: response.status });

    // Forward the cookie from Fastify to the client
    if (setCookieHeader) {
      nextResponse.headers.set("set-cookie", setCookieHeader);
    }

    return nextResponse;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
