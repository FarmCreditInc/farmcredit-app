"use server"

import { cookies } from "next/headers"
import * as jose from "jose"
import { supabaseAdmin } from "@/lib/supabase-admin"

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Helper function to get the current user session
async function getCurrentUser() {
  const sessionCookie = cookies().get("session")?.value

  if (!sessionCookie) {
    return null
  }

  try {
    const secretKey = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jose.jwtVerify(sessionCookie, secretKey)
    return payload
  } catch (error) {
    console.error("Error verifying JWT:", error)
    return null
  }
}

// Create or retrieve a chat session
export async function createOrGetChatSession(sessionToken: string) {
  try {
    const user = await getCurrentUser()

    // Check if session already exists
    const { data: existingSession, error: fetchError } = await supabaseAdmin
      .from("chat_sessions")
      .select("*")
      .eq("session_token", sessionToken)
      .maybeSingle()

    if (fetchError) {
      console.error("Error fetching chat session:", fetchError)
      return {
        success: false,
        error: fetchError.message,
      }
    }

    if (existingSession) {
      // Update last active timestamp
      await supabaseAdmin
        .from("chat_sessions")
        .update({ last_active_at: new Date().toISOString() })
        .eq("id", existingSession.id)

      return { success: true, session: existingSession }
    }

    // Create new session
    const newSession = {
      session_token: sessionToken,
      farmer_id: user?.role === "farmer" ? user.id : null,
      lender_id: user?.role === "lender" ? user.id : null,
      last_active_at: new Date().toISOString(),
    }

    const { data: createdSession, error: createError } = await supabaseAdmin
      .from("chat_sessions")
      .insert(newSession)
      .select()
      .single()

    if (createError) {
      console.error("Error creating chat session:", createError)
      return {
        success: false,
        error: createError.message,
      }
    }

    return { success: true, session: createdSession }
  } catch (error) {
    console.error("Create or get chat session error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// Save a chat message
export async function saveChatMessage(sessionId: string, sender: "user" | "ai", message: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("chat_messages")
      .insert({
        chat_session_id: sessionId,
        sender,
        message,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving chat message:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    // Update session last active timestamp
    await supabaseAdmin.from("chat_sessions").update({ last_active_at: new Date().toISOString() }).eq("id", sessionId)

    return { success: true, message: data }
  } catch (error) {
    console.error("Save chat message error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// Get chat history
export async function getChatHistory(sessionId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("chat_messages")
      .select("*")
      .eq("chat_session_id", sessionId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching chat history:", error)
      return {
        success: false,
        error: error.message,
        messages: [],
      }
    }

    return {
      success: true,
      messages: data.map((msg, index) => ({
        message_position: index,
        sender: msg.sender,
        message: msg.message,
      })),
    }
  } catch (error) {
    console.error("Get chat history error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      messages: [],
    }
  }
}

// Get user info for AI context
export async function getUserInfoForAI() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return {
        success: true,
        userInfo: {
          name: "guest",
          wallet_balance: null,
          available_loans: [],
          credit_score: null,
        },
      }
    }

    if (user.role === "farmer") {
      // Get farmer details
      const { data: farmer, error: farmerError } = await supabaseAdmin
        .from("farmers")
        .select("full_name")
        .eq("id", user.id)
        .single()

      if (farmerError) {
        console.error("Error fetching farmer details:", farmerError)
        return {
          success: false,
          error: farmerError.message,
          userInfo: {
            name: "guest",
            wallet_balance: null,
            available_loans: [],
            credit_score: null,
          },
        }
      }

      // Get the most recent credit score for this farmer
      const { data: creditScoreData, error: creditScoreError } = await supabaseAdmin
        .from("credit_scores")
        .select("credit_score")
        .eq("farmer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (creditScoreError) {
        console.error("Error fetching credit score:", creditScoreError)
      }

      const creditScore = creditScoreData?.credit_score || null

      // Get farmer wallet
      const { data: wallet, error: walletError } = await supabaseAdmin
        .from("wallets")
        .select("balance")
        .eq("farmer_id", user.id)
        .maybeSingle()

      if (walletError) {
        console.error("Error fetching wallet:", walletError)
      }

      // Get farmer loans
      const { data: loans, error: loansError } = await supabaseAdmin
        .from("loan_contract")
        .select(`
          id,
          loan_application_id,
          amount_disbursed,
          interest_rate,
          created_at
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })

      if (loansError) {
        console.error("Error fetching loans:", loansError)
      }

      return {
        success: true,
        userInfo: {
          name: farmer.full_name,
          wallet_balance: wallet?.balance || 0,
          available_loans: loans || [],
          credit_score: creditScore,
        },
      }
    } else if (user.role === "lender") {
      // Get lender details
      const { data: lender, error: lenderError } = await supabaseAdmin
        .from("lenders")
        .select("organization_name")
        .eq("id", user.id)
        .single()

      if (lenderError) {
        console.error("Error fetching lender details:", lenderError)
        return {
          success: false,
          error: lenderError.message,
          userInfo: {
            name: "guest",
            wallet_balance: null,
            available_loans: [],
            credit_score: null,
          },
        }
      }

      // Get lender wallet
      const { data: wallet, error: walletError } = await supabaseAdmin
        .from("wallets")
        .select("balance")
        .eq("lender_id", user.id)
        .maybeSingle()

      if (walletError) {
        console.error("Error fetching wallet:", walletError)
      }

      // Get active loans funded by this lender
      const { data: loans, error: loansError } = await supabaseAdmin
        .from("loan_contract")
        .select(`
          id,
          loan_application_id,
          amount_disbursed,
          interest_rate,
          created_at
        `)
        .eq("financier_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })

      if (loansError) {
        console.error("Error fetching loans:", loansError)
      }

      return {
        success: true,
        userInfo: {
          name: lender.organization_name,
          wallet_balance: wallet?.balance || 0,
          available_loans: loans || [],
          credit_score: null, // Lenders don't have credit scores
        },
      }
    }

    // Fallback for unknown user types
    return {
      success: true,
      userInfo: {
        name: "guest",
        wallet_balance: null,
        available_loans: [],
        credit_score: null,
      },
    }
  } catch (error) {
    console.error("Get user info error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      userInfo: {
        name: "guest",
        wallet_balance: null,
        available_loans: [],
        credit_score: null,
      },
    }
  }
}
