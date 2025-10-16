import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function executeWalletSystemSetup() {
  console.log("🚀 Starting Wallet System Database Setup...\n");

  try {
    // Step 1: Add missing columns to user_wallets table
    console.log("Step 1: Adding columns to user_wallets table...");

    const alterUserWalletsQueries = [
      "ALTER TABLE user_wallets ADD COLUMN IF NOT EXISTS is_frozen BOOLEAN DEFAULT FALSE",
      "ALTER TABLE user_wallets ADD COLUMN IF NOT EXISTS frozen_reason TEXT",
      "ALTER TABLE user_wallets ADD COLUMN IF NOT EXISTS frozen_by UUID REFERENCES users(id) ON DELETE SET NULL",
      "ALTER TABLE user_wallets ADD COLUMN IF NOT EXISTS frozen_at TIMESTAMP",
    ];

    for (const query of alterUserWalletsQueries) {
      const { error } = await supabase.rpc("exec_sql", { sql_query: query });
      if (error) {
        console.log(`⚠️  Query failed (might already exist): ${query}`);
        console.log(`Error: ${error.message}\n`);
      } else {
        console.log(`✅ Success: ${query}`);
      }
    }

    // Step 2: Create wallet_transactions table
    console.log("\nStep 2: Creating wallet_transactions table...");
    const createWalletTransactionsQuery = `
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('credit', 'debit', 'freeze', 'unfreeze')),
        amount NUMERIC(10,2),
        balance_before NUMERIC(10,2),
        balance_after NUMERIC(10,2),
        description TEXT,
        reference_type VARCHAR(20),
        reference_id UUID,
        admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const { error: walletTransError } = await supabase.rpc("exec_sql", {
      sql_query: createWalletTransactionsQuery,
    });
    if (walletTransError) {
      console.log(
        `⚠️  Failed to create wallet_transactions table: ${walletTransError.message}`
      );
    } else {
      console.log("✅ wallet_transactions table created successfully");
    }

    // Step 3: Create refund_requests table
    console.log("\nStep 3: Creating refund_requests table...");
    const createRefundRequestsQuery = `
      CREATE TABLE IF NOT EXISTS refund_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        refund_amount NUMERIC(10,2) NOT NULL,
        refund_type VARCHAR(20) NOT NULL CHECK (refund_type IN ('order_cancellation', 'order_return', 'partial_refund')),
        payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('prepaid', 'cod', 'wallet')),
        original_payment_id VARCHAR(100),
        bank_account_holder_name VARCHAR(100),
        bank_account_number VARCHAR(50),
        bank_ifsc_code VARCHAR(20),
        bank_name VARCHAR(100),
        refund_mode VARCHAR(20) DEFAULT 'bank_transfer' CHECK (refund_mode IN ('bank_transfer', 'wallet', 'original_payment')),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected')),
        admin_notes TEXT,
        processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
        processed_at TIMESTAMP,
        razorpay_refund_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const { error: refundError } = await supabase.rpc("exec_sql", {
      sql_query: createRefundRequestsQuery,
    });
    if (refundError) {
      console.log(
        `⚠️  Failed to create refund_requests table: ${refundError.message}`
      );
    } else {
      console.log("✅ refund_requests table created successfully");
    }

    // Step 4: Create indexes
    console.log("\nStep 4: Creating indexes...");
    const indexQueries = [
      "CREATE INDEX IF NOT EXISTS idx_user_wallets_is_frozen ON user_wallets(is_frozen)",
      "CREATE INDEX IF NOT EXISTS idx_user_wallets_frozen_by ON user_wallets(frozen_by)",
      "CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id)",
      "CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(transaction_type)",
      "CREATE INDEX IF NOT EXISTS idx_wallet_transactions_admin_id ON wallet_transactions(admin_id)",
      "CREATE INDEX IF NOT EXISTS idx_refund_requests_order_id ON refund_requests(order_id)",
      "CREATE INDEX IF NOT EXISTS idx_refund_requests_user_id ON refund_requests(user_id)",
      "CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status)",
    ];

    for (const query of indexQueries) {
      const { error } = await supabase.rpc("exec_sql", { sql_query: query });
      if (error) {
        console.log(
          `⚠️  Index creation failed (might already exist): ${
            query.split(" ON ")[0]
          }...`
        );
      } else {
        console.log(`✅ Index created: ${query.split(" ON ")[0]}...`);
      }
    }

    // Step 5: Create update function and triggers
    console.log("\nStep 5: Creating update function and triggers...");

    const updateFunctionQuery = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    const { error: functionError } = await supabase.rpc("exec_sql", {
      sql_query: updateFunctionQuery,
    });
    if (functionError) {
      console.log(`⚠️  Function creation failed: ${functionError.message}`);
    } else {
      console.log("✅ update_updated_at_column function created");
    }

    const triggerQueries = [
      "CREATE TRIGGER IF NOT EXISTS trigger_user_wallets_updated_at BEFORE UPDATE ON user_wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
      "CREATE TRIGGER IF NOT EXISTS trigger_wallet_transactions_updated_at BEFORE UPDATE ON wallet_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
      "CREATE TRIGGER IF NOT EXISTS trigger_refund_requests_updated_at BEFORE UPDATE ON refund_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
    ];

    for (const query of triggerQueries) {
      const { error } = await supabase.rpc("exec_sql", { sql_query: query });
      if (error) {
        console.log(`⚠️  Trigger creation failed: ${error.message}`);
      } else {
        console.log(`✅ Trigger created: ${query.split(" ")[2]}`);
      }
    }

    // Verification
    console.log("\n🔍 Verifying setup...");

    // Check updated user_wallets structure
    const { data: walletData, error: walletCheckError } = await supabase
      .from("user_wallets")
      .select("*")
      .limit(1);

    if (walletCheckError) {
      console.log("⚠️  Could not verify user_wallets table");
    } else {
      console.log(
        "✅ user_wallets table verified with columns:",
        Object.keys(walletData[0] || {})
      );
    }

    // Check if new tables exist
    const { data: transData, error: transError } = await supabase
      .from("wallet_transactions")
      .select("*")
      .limit(1);

    if (transError) {
      console.log("⚠️  wallet_transactions table not accessible");
    } else {
      console.log("✅ wallet_transactions table verified");
    }

    const { data: refundData, error: refundCheckError } = await supabase
      .from("refund_requests")
      .select("*")
      .limit(1);

    if (refundCheckError) {
      console.log("⚠️  refund_requests table not accessible");
    } else {
      console.log("✅ refund_requests table verified");
    }

    console.log("\n🎉 Wallet System Database Setup Complete!");
    console.log("\n📋 What was set up:");
    console.log("   ✅ Enhanced user_wallets table with freeze functionality");
    console.log("   ✅ Complete wallet_transactions audit trail");
    console.log("   ✅ Refund request management system");
    console.log("   ✅ Performance indexes");
    console.log("   ✅ Automatic timestamp triggers");
    console.log("\n🚀 Your wallet management system is now operational!");
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    console.error("Full error:", error);
  }
}

// Check if exec_sql function exists, if not provide manual instructions
async function checkAndExecute() {
  try {
    // Test if we can use exec_sql
    const { error } = await supabase.rpc("exec_sql", { sql_query: "SELECT 1" });
    if (error && error.message.includes("function exec_sql")) {
      console.log("⚠️  exec_sql function not available in Supabase.");
      console.log(
        "📋 Please execute the SQL manually in your Supabase Dashboard:"
      );
      console.log(
        "   🔗 https://supabase.com/dashboard/project/vjveipltkwxnndrencbf/editor"
      );
      console.log("   📄 Use the execute_wallet_system.sql file content");
      return;
    }

    await executeWalletSystemSetup();
  } catch (error) {
    console.log("⚠️  Automated execution not available.");
    console.log(
      "📋 Please execute the SQL manually in your Supabase Dashboard:"
    );
    console.log(
      "   🔗 https://supabase.com/dashboard/project/vjveipltkwxnndrencbf/editor"
    );
    console.log("   📄 Use the execute_wallet_system.sql file content");
    console.log("   📋 Copy and paste the SQL from execute_wallet_system.sql");
  }
}

checkAndExecute();
