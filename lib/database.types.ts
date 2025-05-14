export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      admins: {
        Row: {
          id: string
          email: string
          password_hash: string
          full_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          full_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          full_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      address: {
        Row: {
          id: string
          street_address: string
          city: string
          state: string
          postal_code: string | null
          country: string
          geopolitical_zone: string | null
          latitude: number | null
          longitude: number | null
          created_at: string
        }
        Insert: {
          id?: string
          street_address: string
          city: string
          state: string
          postal_code?: string | null
          country?: string
          geopolitical_zone?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          street_address?: string
          city?: string
          state?: string
          postal_code?: string | null
          country?: string
          geopolitical_zone?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
        }
      }
      farmers: {
        Row: {
          id: string
          email: string
          password_hash: string
          full_name: string
          gender: string | null
          age: number | null
          date_of_birth: string | null
          phone: string | null
          address_id: string | null
          education_level: string | null
          farming_experience: number | null
          is_coop_member: boolean | null
          identification_number: string | null
          identification_type: string | null
          id_document_url: string | null
          profile_url: string | null
          admin_note: string | null
          is_active: boolean
          seen_guided_tour: boolean
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          full_name: string
          gender?: string | null
          age?: number | null
          date_of_birth?: string | null
          phone?: string | null
          address_id?: string | null
          education_level?: string | null
          farming_experience?: number | null
          is_coop_member?: boolean | null
          identification_number?: string | null
          identification_type?: string | null
          id_document_url?: string | null
          profile_url?: string | null
          admin_note?: string | null
          is_active?: boolean
          seen_guided_tour?: boolean
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          full_name?: string
          gender?: string | null
          age?: number | null
          date_of_birth?: string | null
          phone?: string | null
          address_id?: string | null
          education_level?: string | null
          farming_experience?: number | null
          is_coop_member?: boolean | null
          identification_number?: string | null
          identification_type?: string | null
          id_document_url?: string | null
          profile_url?: string | null
          admin_note?: string | null
          is_active?: boolean
          seen_guided_tour?: boolean
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      lenders: {
        Row: {
          id: string
          email: string
          password_hash: string
          organization_name: string
          contact_person_name: string
          phone: string | null
          organization_type: string | null
          license_number: string | null
          verification_document_url: string | null
          address_id: string | null
          admin_note: string | null
          status: string
          is_active: boolean
          seen_guided_tour: boolean
          profile_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          organization_name: string
          contact_person_name: string
          phone?: string | null
          organization_type?: string | null
          license_number?: string | null
          verification_document_url?: string | null
          address_id?: string | null
          admin_note?: string | null
          status?: string
          is_active?: boolean
          seen_guided_tour?: boolean
          profile_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          organization_name?: string
          contact_person_name?: string
          phone?: string | null
          organization_type?: string | null
          license_number?: string | null
          verification_document_url?: string | null
          address_id?: string | null
          admin_note?: string | null
          status?: string
          is_active?: boolean
          seen_guided_tour?: boolean
          profile_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      loan_application: {
        Row: {
          id: string
          farmer_id: string
          purpose_category: string | null
          amount_requested: number | null
          description: string | null
          interest_rate: number | null
          estimated_total_repayment: number | null
          preferred_repayment_plan: string | null
          existing_loans: boolean | null
          total_existing_loan_amount: number | null
          existing_loan_duration_days: number | null
          collateral_type: string | null
          collateral_document: string | null
          loan_duration_days: number | null
          business_plan_url: string | null
          business_sales_book_url: string | null
          rejection_reason: string | null
          farm_id: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          farmer_id: string
          purpose_category?: string | null
          amount_requested?: number | null
          description?: string | null
          interest_rate?: number | null
          estimated_total_repayment?: number | null
          preferred_repayment_plan?: string | null
          existing_loans?: boolean | null
          total_existing_loan_amount?: number | null
          existing_loan_duration_days?: number | null
          collateral_type?: string | null
          collateral_document?: string | null
          loan_duration_days?: number | null
          business_plan_url?: string | null
          business_sales_book_url?: string | null
          rejection_reason?: string | null
          farm_id?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          farmer_id?: string
          purpose_category?: string | null
          amount_requested?: number | null
          description?: string | null
          interest_rate?: number | null
          estimated_total_repayment?: number | null
          preferred_repayment_plan?: string | null
          existing_loans?: boolean | null
          total_existing_loan_amount?: number | null
          existing_loan_duration_days?: number | null
          collateral_type?: string | null
          collateral_document?: string | null
          loan_duration_days?: number | null
          business_plan_url?: string | null
          business_sales_book_url?: string | null
          rejection_reason?: string | null
          farm_id?: string | null
          status?: string
          created_at?: string
        }
      }
      loan_contract: {
        Row: {
          id: string
          loan_application_id: string
          financier_id: string
          contract_type: string | null
          amount_disbursed: number | null
          interest_rate: number | null
          status: string
          vendor_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          loan_application_id: string
          financier_id: string
          contract_type?: string | null
          amount_disbursed?: number | null
          interest_rate?: number | null
          status?: string
          vendor_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          loan_application_id?: string
          financier_id?: string
          contract_type?: string | null
          amount_disbursed?: number | null
          interest_rate?: number | null
          status?: string
          vendor_id?: string | null
          created_at?: string
        }
      }
      loan_repayments: {
        Row: {
          id: string
          loan_contract_id: string
          periodic_repayment_amount: number | null
          interest_amount: number | null
          created_at: string
          date_paid: string | null
          is_late: boolean | null
          late_days: number | null
          fine_amount: number | null
          fine_paid: boolean | null
          fine_paid_at: string | null
          due_date: string | null
        }
        Insert: {
          id?: string
          loan_contract_id: string
          periodic_repayment_amount?: number | null
          interest_amount?: number | null
          created_at?: string
          date_paid?: string | null
          is_late?: boolean | null
          late_days?: number | null
          fine_amount?: number | null
          fine_paid?: boolean | null
          fine_paid_at?: string | null
          due_date?: string | null
        }
        Update: {
          id?: string
          loan_contract_id?: string
          periodic_repayment_amount?: number | null
          interest_amount?: number | null
          created_at?: string
          date_paid?: string | null
          is_late?: boolean | null
          late_days?: number | null
          fine_amount?: number | null
          fine_paid?: boolean | null
          fine_paid_at?: string | null
          due_date?: string | null
        }
      }
      payment_details: {
        Row: {
          id: string
          lender_id: string | null
          bank_account_number: string | null
          bank_name: string | null
          bank_account_name: string | null
          bvn: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lender_id?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          bank_account_name?: string | null
          bvn?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lender_id?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          bank_account_name?: string | null
          bvn?: string | null
          created_at?: string
        }
      }
      transaction_history: {
        Row: {
          id: string
          farmer_id: string | null
          transaction_data: Json | null
          bank_account_number: string | null
          extracted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          farmer_id?: string | null
          transaction_data?: Json | null
          bank_account_number?: string | null
          extracted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          farmer_id?: string | null
          transaction_data?: Json | null
          bank_account_number?: string | null
          extracted_at?: string | null
          created_at?: string
        }
      }
      weather_metrics: {
        Row: {
          id: string
          address_id: string | null
          timestamp: string | null
          temperature: number | null
          sea_level_pressure: number | null
          precipitation: number | null
          wind_direction: string | null
          wind_speed: number | null
          relative_humidity: number | null
          soil_temperature_0_7cm: number | null
          soil_moisture_0_7cm: number | null
          dew_point_temperature: number | null
          wind_speed_100m: number | null
          forecast_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          address_id?: string | null
          timestamp?: string | null
          temperature?: number | null
          sea_level_pressure?: number | null
          precipitation?: number | null
          wind_direction?: string | null
          wind_speed?: number | null
          relative_humidity?: number | null
          soil_temperature_0_7cm?: number | null
          soil_moisture_0_7cm?: number | null
          dew_point_temperature?: number | null
          wind_speed_100m?: number | null
          forecast_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          address_id?: string | null
          timestamp?: string | null
          temperature?: number | null
          sea_level_pressure?: number | null
          precipitation?: number | null
          wind_direction?: string | null
          wind_speed?: number | null
          relative_humidity?: number | null
          soil_temperature_0_7cm?: number | null
          soil_moisture_0_7cm?: number | null
          dew_point_temperature?: number | null
          wind_speed_100m?: number | null
          forecast_type?: string | null
          created_at?: string
        }
      }
      farms: {
        Row: {
          id: string
          farmer_id: string
          address_id: string | null
          name: string | null
          uses_fertilizer: boolean
          uses_machinery: boolean
          uses_irrigation: boolean
          size_units: string | null
          size: number | null
          start_date: string | null
          photo: string | null
          number_of_harvests: number | null
          created_at: string
        }
        Insert: {
          id?: string
          farmer_id: string
          address_id?: string | null
          name?: string | null
          uses_fertilizer?: boolean
          uses_machinery?: boolean
          uses_irrigation?: boolean
          size_units?: string | null
          size?: number | null
          start_date?: string | null
          photo?: string | null
          number_of_harvests?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          farmer_id?: string
          address_id?: string | null
          name?: string | null
          uses_fertilizer?: boolean
          uses_machinery?: boolean
          uses_irrigation?: boolean
          size_units?: string | null
          size?: number | null
          start_date?: string | null
          photo?: string | null
          number_of_harvests?: number | null
          created_at?: string
        }
      }
      farm_production: {
        Row: {
          id: string
          farm_id: string
          financiers: string | null
          category: string | null
          type: string | null
          crop_plant_date: string | null
          expected_harvest_date: string | null
          expected_yield_unit: string | null
          expected_yield: number | null
          expected_unit_profit: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          farm_id: string
          financiers?: string | null
          category?: string | null
          type?: string | null
          crop_plant_date?: string | null
          expected_harvest_date?: string | null
          expected_yield_unit?: string | null
          expected_yield?: number | null
          expected_unit_profit?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          farm_id?: string
          financiers?: string | null
          category?: string | null
          type?: string | null
          crop_plant_date?: string | null
          expected_harvest_date?: string | null
          expected_yield_unit?: string | null
          expected_yield?: number | null
          expected_unit_profit?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      farmer_next_of_kin: {
        Row: {
          id: string
          farmer_id: string
          full_name: string | null
          address: string | null
          phone_number: string | null
          relationship: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          farmer_id: string
          full_name?: string | null
          address?: string | null
          phone_number?: string | null
          relationship?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          farmer_id?: string
          full_name?: string | null
          address?: string | null
          phone_number?: string | null
          relationship?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          title: string | null
          message: string | null
          type: string | null
          recipient_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title?: string | null
          message?: string | null
          type?: string | null
          recipient_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string | null
          message?: string | null
          type?: string | null
          recipient_type?: string | null
          created_at?: string
        }
      }
      notification_views: {
        Row: {
          id: string
          notification_id: string
          farmer_id: string | null
          lender_id: string | null
          read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          notification_id: string
          farmer_id?: string | null
          lender_id?: string | null
          read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          notification_id?: string
          farmer_id?: string | null
          lender_id?: string | null
          read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
      support_tickets: {
        Row: {
          id: string
          farmer_id: string | null
          lender_id: string | null
          category: string
          description: string
          attachment_url: string | null
          status: string
          admin_response: string | null
          responded_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          farmer_id?: string | null
          lender_id?: string | null
          category: string
          description: string
          attachment_url?: string | null
          status?: string
          admin_response?: string | null
          responded_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          farmer_id?: string | null
          lender_id?: string | null
          category?: string
          description?: string
          attachment_url?: string | null
          status?: string
          admin_response?: string | null
          responded_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      wallets: {
        Row: {
          id: string
          lender_id: string | null
          farmer_id: string | null
          balance: number
          locked_balance: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lender_id?: string | null
          farmer_id?: string | null
          balance?: number
          locked_balance?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lender_id?: string | null
          farmer_id?: string | null
          balance?: number
          locked_balance?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          wallet_id: string
          type: string
          amount: number
          purpose: string | null
          reference: string | null
          running_balance: number | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          wallet_id: string
          type: string
          amount: number
          purpose?: string | null
          reference?: string | null
          running_balance?: number | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          wallet_id?: string
          type?: string
          amount?: number
          purpose?: string | null
          reference?: string | null
          running_balance?: number | null
          status?: string
          created_at?: string
        }
      }
      withdrawals: {
        Row: {
          id: string
          wallet_id: string
          amount: number
          bank_account_id: string | null
          status: string
          transaction_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_id: string
          amount: number
          bank_account_id?: string | null
          status?: string
          transaction_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_id?: string
          amount?: number
          bank_account_id?: string | null
          status?: string
          transaction_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          lender_id: string | null
          farmer_id: string | null
          session_token: string
          created_at: string
          last_active_at: string
        }
        Insert: {
          id?: string
          lender_id?: string | null
          farmer_id?: string | null
          session_token: string
          created_at?: string
          last_active_at?: string
        }
        Update: {
          id?: string
          lender_id?: string | null
          farmer_id?: string | null
          session_token?: string
          created_at?: string
          last_active_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          chat_session_id: string
          sender: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          chat_session_id: string
          sender: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          chat_session_id?: string
          sender?: string
          message?: string
          created_at?: string
        }
      }
      vendors: {
        Row: {
          id: string
          name: string
          contact_address: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          contact_address: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact_address?: string
          created_at?: string
        }
      }
      vendor_products: {
        Row: {
          id: string
          vendor_id: string
          product: string
          product_category: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          product: string
          product_category: string
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          product?: string
          product_category?: string
          amount?: number
          created_at?: string
        }
      }
      platform_fees: {
        Row: {
          id: string
          loan_contract_id: string
          amount: number
          fee_percentage: number
          status: string
          collected_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          loan_contract_id: string
          amount: number
          fee_percentage?: number
          status?: string
          collected_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          loan_contract_id?: string
          amount?: number
          fee_percentage?: number
          status?: string
          collected_at?: string | null
          created_at?: string
        }
      }
      password_reset_otps: {
        Row: {
          id: string
          otp_code: string
          farmer_id: string | null
          lender_id: string | null
          is_used: boolean
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          otp_code: string
          farmer_id?: string | null
          lender_id?: string | null
          is_used?: boolean
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          otp_code?: string
          farmer_id?: string | null
          lender_id?: string | null
          is_used?: boolean
          created_at?: string
          expires_at?: string
        }
      }
      credit_scores: {
        Row: {
          id: string
          farmer_id: string
          credit_score: number
          created_at: string
        }
        Insert: {
          id?: string
          farmer_id: string
          credit_score: number
          created_at?: string
        }
        Update: {
          id?: string
          farmer_id?: string
          credit_score?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_total_disbursed_amount: {
        Args: {
          farmer_id: string
        }
        Returns: number
      }
      get_total_repaid_amount: {
        Args: {
          farmer_id: string
        }
        Returns: number
      }
      get_next_repayment_date: {
        Args: {
          farmer_id_param: string
        }
        Returns: string | null
      }
      get_unread_notifications_count: {
        Args: {
          user_id: string
          user_type: string
        }
        Returns: number
      }
      get_unread_notifications: {
        Args: {
          user_id: string
          user_type: string
        }
        Returns: Database["public"]["Tables"]["notifications"]["Row"][]
      }
      credit_farmer_wallet: {
        Args: {
          farmer_id: string
          amount: number
          loan_id: string
        }
        Returns: void
      }
      generate_repayment_schedule: {
        Args: {
          contract_id: string
          loan_amount: number
          interest_rate: number
          term_months: number
        }
        Returns: void
      }
      begin_transaction: {
        Args: {}
        Returns: void
      }
      commit_transaction: {
        Args: {}
        Returns: void
      }
      rollback_transaction: {
        Args: {}
        Returns: void
      }
      calculate_running_balance: {
        Args: {
          wallet_id_param: string
        }
        Returns: void
      }
      create_wallet_transaction: {
        Args: {
          p_wallet_id: string
          p_amount: number
          p_type: string
          p_status: string
          p_reference: string
          p_description: string
          p_metadata: Json
        }
        Returns: {
          transaction_id: string
          new_balance: number
        }
      }
      update_wallet_balance: {
        Args: {
          p_wallet_id: string
          p_amount: number
        }
        Returns: void
      }
      simple_wallet_transaction: {
        Args: {
          p_wallet_id: string
          p_amount: number
          p_type: string
          p_purpose: string
          p_reference: string
          p_status: string
        }
        Returns: string
      }
      increment: {
        Args: {
          x: number
          y: number
        }
        Returns: number
      }
      handle_withdrawal_status_change: {
        Args: {}
        Returns: Database["public"]["Tables"]["withdrawals"]["Row"]
      }
      get_unpaid_loans: {
        Args: {
          farmer_id_param: string
        }
        Returns: {
          contract_id: string
        }[]
      }
      get_total_unpaid_loan_amount: {
        Args: {
          farmer_id_param: string
        }
        Returns: number
      }
      get_loan_duration_days: {
        Args: {
          farmer_id_param: string
        }
        Returns: number
      }
      create_payment_intents_table: {
        Args: {}
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
export type Database = typeof Database
